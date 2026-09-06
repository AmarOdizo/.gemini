import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import TopNav from '../components/TopNav';

const VetProfile = () => {
  const [searchParams] = useSearchParams();
  const vetId = searchParams.get('id');
  const navigate = useNavigate();

  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('video');
  const [reason, setReason] = useState('');
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteImage, setFavoriteImage] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    if (!vetId) {
      navigate('/find-vets');
      return;
    }

    const fetchVet = async () => {
      try {
        const res = await fetch(`https://odizopetcare.onrender.com/api/vets/${vetId}`);
        if (res.ok) {
          const data = await res.json();
          setVet(data.data);
        }
      } catch (err) {
        console.error("Error fetching vet details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVet();

    // Fetch user's pets if logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const token = localStorage.getItem('userToken') || '';
      fetch(`https://odizopetcare.onrender.com/api/pets?ownerId=${parsedUser.id || parsedUser._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setPets(data.data);
            if (data.data.length > 0) setSelectedPetId(data.data[0]._id || data.data[0].id);
          }
        })
        .catch(err => console.error("Error fetching pets", err));

      // Fetch favorites
      fetch(`https://odizopetcare.onrender.com/api/favorites?ownerId=${parsedUser.id || parsedUser._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            const fav = data.data.find(f => f.vetId === vetId);
            if (fav) {
              setIsFavorite(true);
              setFavoriteImage(fav.favoriteProfileImage || '');
            }
          }
        })
        .catch(err => console.error("Error fetching favorites", err));
    }
  }, [vetId, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!date || !time || !type) {
      alert("Please select date, time, and type of consultation.");
      return;
    }

    if (!selectedPetId) {
      alert("Please select a pet for this consultation.");
      return;
    }

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert("Please login to book an appointment");
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const user = JSON.parse(storedUser);
      const selectedPet = pets.find(p => p._id === selectedPetId || p.id === selectedPetId);
      
      if (!selectedPet) {
        alert("Selected pet not found. Please refresh and try again.");
        setBookingLoading(false);
        return;
      }

      const payload = {
        vetId: vet._id || vet.id,
        vetName: vet.name,
        vetSpecialization: vet.qualification,
        ownerId: user.id || user._id,
        ownerName: user.name || "Pet Parent",
        ownerPhone: user.phone || "+91 00000 00000",
        petId: selectedPet._id || selectedPet.id,
        petName: selectedPet.name,
        petSpecies: selectedPet.type || selectedPet.species || 'Unknown',
        petBreed: selectedPet.breed,
        petAge: selectedPet.age ? `${selectedPet.age} ${selectedPet.ageUnit || ''}`.trim() : 'Unknown',
        petWeight: selectedPet.weight ? `${selectedPet.weight} ${selectedPet.weightUnit || ''}`.trim() : 'Unknown',
        petSex: selectedPet.gender || selectedPet.sex || 'Unknown',
        date: date,
        time: time,
        consultationType: type,
        reason: reason,
        reasonForVisit: reason,
        fee: vet.consultationFee || 499,
        status: 'pending'
      };

      // Navigate to confirmation page to review and save
      navigate('/booking-confirmation', { state: { draftPayload: payload, source: 'vet-profile' } });
      
    } catch (err) {
      alert("Error preparing consultation: " + err.message);
      setBookingLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      alert("Please login to manage favorites");
      return;
    }
    const user = JSON.parse(storedUser);
    const ownerId = user.id || user._id;

    try {
      if (isFavorite) {
        // Remove favorite
        await fetch(`https://odizopetcare.onrender.com/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId, vetId: vet._id || vet.id })
        });
        setIsFavorite(false);
        setFavoriteImage('');
      } else {
        // Add favorite
        const res = await fetch(`https://odizopetcare.onrender.com/api/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId, vetId: vet._id || vet.id, favoriteProfileImage: favoriteImage })
        });
        if (res.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite", error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`https://odizopetcare.onrender.com/api/imagekit/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: '/favorites' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFavoriteImage(data.url);
          // Also save it to backend if already favorite
          if (isFavorite) {
            const storedUser = localStorage.getItem('currentUser');
            const user = JSON.parse(storedUser);
            await fetch(`https://odizopetcare.onrender.com/api/favorites`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ownerId: user.id || user._id, vetId: vet._id || vet.id, favoriteProfileImage: data.url })
            });
          }
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        alert('Upload Error: ' + err.message);
      } finally {
        setUploadingImg(false);
      }
    };
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background font-body-md min-h-screen flex">
        <OwnerSidebar />
        <main className="flex-grow ml-0 md:ml-[280px] flex items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </main>
      </div>
    );
  }

  if (!vet) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <OwnerSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-12 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav backLink={{ to: '/find-vets', text: 'Back to Vets Directory' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Left Column: Doctor Bio */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm ambient-shadow">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/20 shadow-md relative bg-surface-container group">
                    <img src={favoriteImage || vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop"} alt={vet.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Online for Telehealth"></span>
                    
                    {isFavorite && (
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
                      </label>
                    )}
                  </div>
                  {uploadingImg && <span className="text-[10px] text-primary font-bold">Uploading...</span>}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-bold">{vet.name}</h2>
                      <span className="material-symbols-outlined text-primary filled-icon text-[22px]" title="Verified Veterinary Specialist">verified</span>
                      <span className="font-mono text-xs text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                        {vet.vciNumber || 'VCI Verified'}
                      </span>
                    </div>
                    <button 
                      onClick={handleFavoriteToggle} 
                      className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors"
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <span className={`material-symbols-outlined text-[24px] ${isFavorite ? 'filled-icon text-error' : 'text-on-surface-variant'}`}>favorite</span>
                    </button>
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant mb-4 font-semibold">{vet.qualification}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-secondary-container/40 text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      {vet.city || 'India'} • {vet.experienceYears || '0'} Yrs Exp.
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                      <span className="material-symbols-outlined text-[16px]">star</span>
                      4.9 (120+ Reviews)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-outline-variant">
                <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span> Professional Profile & Bio
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                  {vet.about || "Loading profile details..."}
                </p>
              </div>

              {vet.specialization && vet.specialization.length > 0 && (
                <div className="mt-6 pt-6 border-t border-outline-variant">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_hospital</span> Specializations
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vet.specialization.map((spec, i) => (
                      <span key={i} className="bg-surface-container-low border border-outline-variant text-on-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-lg ambient-shadow overflow-hidden sticky top-24">
              <div className="bg-primary p-4 text-on-primary">
                <h3 className="font-headline-sm font-bold text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">edit_calendar</span> Book Consultation
                </h3>
                <p className="text-xs text-primary-fixed opacity-90 mt-1">Instant confirmation & secure payment.</p>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleBooking} className="flex flex-col gap-6">
                  {/* Select Pet */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">1. Select Pet</label>
                    {pets.length > 0 ? (
                      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 -mx-1 custom-scrollbar">
                        {pets.map(p => {
                          const petId = p._id || p.id;
                          return (
                          <label key={petId} className={`shrink-0 cursor-pointer border rounded-xl p-2 flex items-center gap-3 transition-all min-w-[150px] ${selectedPetId === petId ? 'bg-primary/5 border-primary text-primary shadow-md transform -translate-y-0.5' : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}>
                            <input type="radio" name="selectedPet" value={petId} checked={selectedPetId === petId} onChange={() => setSelectedPetId(petId)} className="hidden" />
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/30">
                              <img src={p.image || (p.type?.toLowerCase() === 'cat' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&auto=format&fit=crop')} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm leading-tight">{p.name}</span>
                              <span className="text-[10px] opacity-80 uppercase tracking-wider font-bold">{p.type || p.species || 'Pet'}</span>
                            </div>
                          </label>
                        )})}
                      </div>
                    ) : (
                      <div className="text-sm text-error font-bold p-3 border border-error/50 rounded-xl bg-error/10">
                        Please register a pet in your Dashboard first!
                      </div>
                    )}
                  </div>

                  {/* Select Consultation Type */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">2. Consultation Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-1 text-center ${type === 'video' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                        <input type="radio" name="cons_type" value="video" checked={type === 'video'} onChange={() => setType('video')} className="hidden" />
                        <span className="material-symbols-outlined text-[24px]">videocam</span>
                        <span className="font-bold text-xs">Video Call</span>
                      </label>
                      <label className={`border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-1 text-center ${type === 'clinic' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                        <input type="radio" name="cons_type" value="clinic" checked={type === 'clinic'} onChange={() => setType('clinic')} className="hidden" />
                        <span className="material-symbols-outlined text-[24px]">storefront</span>
                        <span className="font-bold text-xs">Clinic Visit</span>
                      </label>
                    </div>
                  </div>

                  {/* Select Date & Time */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">3. Date & Time</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border border-outline-variant rounded-xl p-2.5 text-sm font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="border border-outline-variant rounded-xl p-2.5 text-sm font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                  </div>

                  {/* Reason for Visit */}
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">4. Reason for Visit</label>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="2" className="border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Briefly describe the issue..."></textarea>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-on-surface-variant">Consultation Fee</span>
                      <span className="font-bold text-on-surface">₹{vet.consultationFee || 499}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-on-surface-variant">Platform Fee (Inc. GST)</span>
                      <span className="font-bold text-on-surface">₹50</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-outline-variant font-bold text-primary text-lg">
                      <span>Total Payable</span>
                      <span>₹{(vet.consultationFee || 499) + 50}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={bookingLoading} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-md hover:bg-surface-tint hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2">
                    {bookingLoading ? (
                      <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Processing...</>
                    ) : (
                      <><span className="material-symbols-outlined">event_available</span> Confirm & Pay ₹{(vet.consultationFee || 499) + 50}</>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-on-surface-variant font-medium mt-[-8px]">
                    By booking, you agree to PawsIndia's Telehealth Terms of Service.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VetProfile;
