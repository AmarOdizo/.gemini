import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import TopNav from '../components/TopNav';

const MyPets = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingPet, setAddingPet] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();

  const [newPet, setNewPet] = useState({
    name: '',
    type: 'Dog',
    breed: '',
    age: '',
    ageUnit: 'Years',
    weight: '',
    weightUnit: 'kg',
    gender: 'Male',
    color: '',
    image: '',
    description: '',
    vaccinated: true,
    healthStatus: 'Healthy'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPets(parsedUser.id || parsedUser._id);
  }, [navigate]);

  const fetchPets = async (userId) => {
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`https://odizopetcare.onrender.com/api/pets?ownerId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPets(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch(`https://odizopetcare.onrender.com/api/imagekit/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: '/pets' })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setNewPet(prev => ({ ...prev, image: data.url }));
        } else {
          alert(data.message || 'Failed to upload image');
        }
      } catch (err) {
        alert('Error uploading image: ' + err.message);
      } finally {
        setImageUploading(false);
      }
    };
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    setAddingPet(true);
    
    try {
      // Ensure numeric values are sent correctly
      const payload = { 
        ...newPet, 
        age: newPet.age ? Number(newPet.age) : 1,
        weight: newPet.weight ? Number(newPet.weight) : 5,
        ownerId: user.id || user._id 
      };
      
      const token = localStorage.getItem('userToken') || '';
      
      const res = await fetch(`https://odizopetcare.onrender.com/api/pets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setPets([...pets, data.data]);
        setNewPet({ 
          name: '', type: 'Dog', breed: '', age: '', ageUnit: 'Years', 
          weight: '', weightUnit: 'kg', gender: 'Male', color: '', image: '', 
          description: '', vaccinated: true, healthStatus: 'Healthy' 
        });
        document.getElementById('addPetModal').classList.add('hidden');
      } else {
        alert(data.message || 'Failed to add pet');
      }
    } catch (err) {
      alert("Error adding pet: " + err.message);
    } finally {
      setAddingPet(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (!window.confirm("Are you sure you want to remove this pet profile?")) return;
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`https://odizopetcare.onrender.com/api/pets/${petId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPets(pets.filter(p => p._id !== petId));
        if (localStorage.getItem('favoritePetId') === petId) {
          localStorage.removeItem('favoritePetId');
          localStorage.removeItem('favoritePetImage');
          window.dispatchEvent(new Event('favoritePetChanged'));
        }
      }
    } catch (err) {
      console.error("Error deleting pet", err);
    }
  };

  const handleSetFavorite = (pet) => {
    const defaultImg = pet.type?.toLowerCase() === 'cat' 
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop' 
      : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop';
    
    localStorage.setItem('favoritePetImage', pet.image || defaultImg);
    localStorage.setItem('favoritePetId', pet._id);
    window.dispatchEvent(new Event('favoritePetChanged'));
  };

  if (!user) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex relative">
      <OwnerSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="My Pets" subtitle="Manage your pet profiles and health records." />

        <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
          <h2 className="font-headline-sm font-bold text-lg text-on-surface">Registered Pets ({pets.length})</h2>
          <button 
            onClick={() => document.getElementById('addPetModal').classList.remove('hidden')} 
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-surface-tint transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add</span> Add New Pet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
              <span className="font-label-md text-base font-semibold">Loading Pets...</span>
            </div>
          ) : pets.length > 0 ? (
            pets.map(pet => (
              <div key={pet._id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                <div className="p-6 flex flex-col items-center border-b border-outline-variant/50 bg-gradient-to-b from-surface-container-low to-transparent relative">
                  <button onClick={() => handleDeletePet(pet._id)} className="absolute top-4 right-4 text-error hover:bg-error-container/20 p-2 rounded-full transition-colors" title="Delete Profile">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {pet.vaccinated && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Vaccinated
                      </span>
                    )}
                    {localStorage.getItem('favoritePetId') === pet._id && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">star</span> Favorite
                      </span>
                    )}
                  </div>

                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-white mb-4">
                    <img src={pet.image || (pet.type?.toLowerCase() === 'cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop')} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-headline-sm font-bold text-xl text-on-surface">{pet.name}</h3>
                  <p className="font-label-md text-sm text-primary font-bold">{pet.breed}</p>
                </div>
                
                <div className="p-5 flex-grow bg-surface-container-lowest flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">calendar_today</span> Age
                      </span>
                      <span className="font-bold text-on-surface">{pet.age} {pet.ageUnit}</span>
                    </div>
                    <div className="flex flex-col bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">weight</span> Weight
                      </span>
                      <span className="font-bold text-on-surface">{pet.weight} {pet.weightUnit}</span>
                    </div>
                    <div className="flex flex-col bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">category</span> Type
                      </span>
                      <span className="font-bold text-on-surface">{pet.type || pet.species || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-col bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">male</span> Sex
                      </span>
                      <span className="font-bold text-on-surface">{pet.gender || pet.sex || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 justify-between mt-auto pt-4 border-t border-outline-variant/50">
                    <button 
                      onClick={() => handleSetFavorite(pet)} 
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors flex items-center gap-1 ${localStorage.getItem('favoritePetId') === pet._id ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/50'}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">{localStorage.getItem('favoritePetId') === pet._id ? 'star' : 'star_border'}</span>
                      {localStorage.getItem('favoritePetId') === pet._id ? 'Favorited' : 'Set as Favorite'}
                    </button>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${pet.healthStatus === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : pet.healthStatus === 'Sick' ? 'bg-error-container/30 text-error border-error/50' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {pet.healthStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-on-surface-variant flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl mb-2 opacity-50">pets</span>
              <p className="font-bold">No pets added yet.</p>
              <p className="text-sm">Add your first pet to start booking consultations.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Pet Modal (Redesigned) */}
      <div id="addPetModal" className="fixed inset-0 z-[100] hidden">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => document.getElementById('addPetModal').classList.add('hidden')}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] md:w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden z-10 border border-outline-variant/30 max-h-[90vh] flex flex-col">
          
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
            <h3 className="font-headline-sm font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span> Register New Pet
            </h3>
            <button onClick={() => document.getElementById('addPetModal').classList.add('hidden')} className="hover:bg-primary-container hover:text-on-primary-container p-1 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleAddPet} className="overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            
            {/* SECTION 1: Basic Info */}
            <div>
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-[18px]">info</span> Basic Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Pet Name *</label>
                  <input type="text" value={newPet.name} onChange={(e) => setNewPet({...newPet, name: e.target.value})} required className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors" placeholder="e.g. Max" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Type *</label>
                  <select value={newPet.type} onChange={(e) => setNewPet({...newPet, type: e.target.value})} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-1">Breed *</label>
                  <input type="text" value={newPet.breed} onChange={(e) => setNewPet({...newPet, breed: e.target.value})} required className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors" placeholder="e.g. Golden Retriever, Persian" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-2">Pet Photo (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-surface-container-low border-2 border-outline-variant overflow-hidden shrink-0 flex items-center justify-center">
                      {imageUploading ? (
                        <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                      ) : newPet.image ? (
                        <img src={newPet.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-on-surface-variant text-2xl">add_photo_alternate</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-outline-variant hover:bg-surface-container-lowest text-on-surface px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                        Upload Photo
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={imageUploading} />
                      </label>
                      <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">JPEG, PNG up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Physical Traits */}
            <div>
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-[18px]">straighten</span> Physical Traits
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Age *</label>
                  <input type="number" min="0" step="1" value={newPet.age} onChange={(e) => setNewPet({...newPet, age: e.target.value})} required className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors" placeholder="0" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Age Unit</label>
                  <select value={newPet.ageUnit} onChange={(e) => setNewPet({...newPet, ageUnit: e.target.value})} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors">
                    <option value="Years">Years</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Weight *</label>
                  <input type="number" min="0" step="0.1" value={newPet.weight} onChange={(e) => setNewPet({...newPet, weight: e.target.value})} required className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors" placeholder="0" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Unit</label>
                  <select value={newPet.weightUnit} onChange={(e) => setNewPet({...newPet, weightUnit: e.target.value})} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors">
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
                
                <div className="col-span-2 md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-1">Color</label>
                  <input type="text" value={newPet.color} onChange={(e) => setNewPet({...newPet, color: e.target.value})} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors" placeholder="e.g. Brown, Black & White" />
                </div>

                <div className="col-span-2 md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-2">Gender *</label>
                  <div className="flex gap-3 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                    <label className={`flex-1 flex items-center justify-center gap-1 p-1.5 rounded-md cursor-pointer text-sm font-bold transition-colors ${newPet.gender === 'Male' ? 'bg-white shadow-sm text-primary border border-outline-variant/30' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                      <input type="radio" name="gender" value="Male" checked={newPet.gender === 'Male'} onChange={() => setNewPet({...newPet, gender: 'Male'})} className="hidden" />
                      <span className="material-symbols-outlined text-[16px]">male</span> Male
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-1 p-1.5 rounded-md cursor-pointer text-sm font-bold transition-colors ${newPet.gender === 'Female' ? 'bg-white shadow-sm text-primary border border-outline-variant/30' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                      <input type="radio" name="gender" value="Female" checked={newPet.gender === 'Female'} onChange={() => setNewPet({...newPet, gender: 'Female'})} className="hidden" />
                      <span className="material-symbols-outlined text-[16px]">female</span> Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Medical & Status */}
            <div>
              <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider border-b border-outline-variant/50 pb-2">
                <span className="material-symbols-outlined text-[18px]">medical_services</span> Health & Profile
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-on-surface mb-1">Current Health Status</label>
                  <select value={newPet.healthStatus} onChange={(e) => setNewPet({...newPet, healthStatus: e.target.value})} className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors">
                    <option value="Healthy">Healthy</option>
                    <option value="Sick">Sick</option>
                    <option value="Under Treatment">Under Treatment</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <label className="cursor-pointer flex items-center gap-3 w-full bg-surface-container-low border border-outline-variant p-2.5 rounded-lg mt-0 md:mt-[18px]">
                    <div className="relative">
                      <input type="checkbox" checked={newPet.vaccinated} onChange={(e) => setNewPet({...newPet, vaccinated: e.target.checked})} className="sr-only" />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${newPet.vaccinated ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${newPet.vaccinated ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-surface leading-tight">Fully Vaccinated</span>
                      <span className="text-[10px] text-on-surface-variant">Check if up to date</span>
                    </div>
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-1">Brief Description (Optional)</label>
                  <textarea value={newPet.description} onChange={(e) => setNewPet({...newPet, description: e.target.value})} rows="2" className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-sm transition-colors resize-none" placeholder="e.g. Very playful, loves treats..."></textarea>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-2 pt-4 border-t border-outline-variant flex justify-end gap-3 sticky bottom-0 bg-surface-container-lowest">
              <button type="button" onClick={() => document.getElementById('addPetModal').classList.add('hidden')} className="px-5 py-2.5 text-on-surface-variant font-bold rounded-lg hover:bg-surface-container text-sm transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={addingPet} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-surface-tint hover:-translate-y-0.5 text-sm flex items-center gap-2 transition-all">
                {addingPet ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Saving...</> : <><span className="material-symbols-outlined text-[18px]">save</span> Save Pet Profile</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPets;
