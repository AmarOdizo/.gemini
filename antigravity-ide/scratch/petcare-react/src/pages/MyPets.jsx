import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const DEFAULT_PET_IMAGES = {
  Dog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop',
  Cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop',
  Bird: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&auto=format&fit=crop',
  Rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=500&auto=format&fit=crop',
  Other: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&auto=format&fit=crop'
};

const INITIAL_FORM_STATE = {
  name: '',
  species: 'Dog',
  breed: '',
  gender: 'Male',
  age: 1,
  ageUnit: 'Years',
  weight: 5,
  weightUnit: 'kg',
  color: '',
  image: '',
  description: '',
  vaccinated: true,
  vaccinationDate: new Date().toISOString().split('T')[0],
  healthStatus: 'Healthy',
  status: 'Available'
};

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Form & Upload state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('userToken');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setToken(storedToken || '');
    fetchPets(parsedUser);
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPets = async (currentUser) => {
    setLoading(true);
    try {
      const ownerId = currentUser._id || currentUser.id;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setPets(data.data || []);
      } else {
        console.error('Failed to fetch pets');
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  // ImageKit File Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/imagekit/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: reader.result,
            fileName: `pet_${Date.now()}_${file.name}`,
            folder: '/pets'
          })
        });
        
        const textResponse = await res.text();
        let data;
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          throw new Error(`Invalid server response (Status ${res.status}): ${textResponse ? textResponse.substring(0, 100) : 'Empty body'}`);
        }

        if (res.ok && data.success && data.url) {
          setFormData((prev) => ({ ...prev, image: data.url }));
          showToast('Image uploaded successfully to ImageKit!');
        } else {
          showToast(data.message || 'Image upload failed. Ensure your ImageKit keys in Render are valid.', 'error');
        }
      } catch (err) {
        showToast('Image upload error: ' + err.message, 'error');
      } finally {
        setUploadingImage(false);
      }
    };
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM_STATE);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pet) => {
    setSelectedPet(pet);
    setFormData({
      name: pet.name || '',
      species: pet.species || pet.type || 'Dog',
      breed: pet.breed || '',
      gender: pet.gender || 'Male',
      age: pet.age !== undefined ? pet.age : 1,
      ageUnit: pet.ageUnit || 'Years',
      weight: pet.weight !== undefined ? pet.weight : 5,
      weightUnit: pet.weightUnit || 'kg',
      color: pet.color || '',
      image: pet.image || '',
      description: pet.description || '',
      vaccinated: pet.vaccinated !== undefined ? pet.vaccinated : true,
      vaccinationDate: pet.vaccinationDate ? new Date(pet.vaccinationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      healthStatus: pet.healthStatus || 'Healthy',
      status: pet.status || 'Available'
    });
    setIsEditModalOpen(true);
  };

  // Submit Add Pet
  const handleAddPetSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const ownerId = user._id || user.id;
      const payload = {
        ...formData,
        type: formData.species, // explicitly set type for the Render backend
        ownerId,
        ownerName: user.name || '',
        ownerEmail: user.email || '',
        ownerPhone: user.phone || ''
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Pet registered successfully!');
        setIsAddModalOpen(false);
        setFormData(INITIAL_FORM_STATE);
        fetchPets(user);
      } else {
        showToast(data.message || 'Failed to add pet', 'error');
      }
    } catch (err) {
      showToast('Error registering pet: ' + err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Edit Pet
  const handleEditPetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet) return;

    setFormSubmitting(true);
    try {
      const petId = selectedPet._id || selectedPet.id;
      
      const payload = {
        ...formData,
        type: formData.species
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${petId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Pet details updated successfully!');
        setIsEditModalOpen(false);
        setSelectedPet(null);
        fetchPets(user);
      } else {
        showToast(data.message || 'Failed to update pet', 'error');
      }
    } catch (err) {
      showToast('Error updating pet: ' + err.message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Pet
  const handleDeletePet = async (pet) => {
    const petId = pet._id || pet.id;
    if (!window.confirm(`Are you sure you want to delete ${pet.name}?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`${pet.name} has been removed.`);
        fetchPets(user);
      } else {
        showToast(data.message || 'Failed to delete pet', 'error');
      }
    } catch (err) {
      showToast('Error deleting pet: ' + err.message, 'error');
    }
  };

  // Set Favorite Pet (Updates TopNav avatar)
  const handleSetFavorite = (pet) => {
    const petSpecies = pet.species || pet.type;
    const petImg = pet.image || DEFAULT_PET_IMAGES[petSpecies] || DEFAULT_PET_IMAGES.Other;
    localStorage.setItem('favoritePetImage', petImg);
    window.dispatchEvent(new Event('favoritePetChanged'));
    showToast(`${pet.name} set as favorite pet profile photo!`);
  };

  // Filtered pets list
  const filteredPets = pets.filter((pet) => {
    const petSpecies = pet.species || pet.type;
    const matchesSpecies = selectedSpecies === 'All' || petSpecies?.toLowerCase() === selectedSpecies.toLowerCase();
    const matchesSearch = pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pet.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <TopNav
        title="My Pet Companions"
        subtitle="View, add, and manage your pets' health records, vaccination schedules, and profile details."
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'error'
              ? 'bg-red-900/90 text-red-100 border-red-500'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-500'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
          </span>
          {toastMessage.text}
        </div>
      )}

      {/* Control Bar: Filters & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 shadow-sm">
        {/* Species Filter & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecies(spec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedSpecies === spec
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-primary text-on-surface"
            />
          </div>

          {/* Add New Pet Button */}
          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-on-primary font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-surface-tint transition-all flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Add New Pet
          </button>
        </div>
      </div>

      {/* Pets Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">sync</span>
          <p className="text-xs font-bold text-on-surface-variant">Loading pet profiles...</p>
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl p-8 space-y-4">
          <span className="material-symbols-outlined text-5xl text-outline-variant">pets</span>
          <div>
            <h3 className="text-lg font-bold text-on-surface">No Pet Companions Found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {searchQuery || selectedSpecies !== 'All'
                ? 'No pets match your search criteria or species filter.'
                : 'You have not registered any pets yet. Click below to add your first pet!'}
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-surface-tint transition-all inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Register First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => {
            const petSpecies = pet.species || pet.type;
            const petImg = pet.image || DEFAULT_PET_IMAGES[petSpecies] || DEFAULT_PET_IMAGES.Other;
            return (
              <div
                key={pet._id || pet.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Pet Image & Badges */}
                <div className="relative h-48 w-full bg-surface-container overflow-hidden">
                  <img
                    src={petImg}
                    alt={pet.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = DEFAULT_PET_IMAGES.Other;
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {petSpecies}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md ${
                        pet.healthStatus === 'Healthy'
                          ? 'bg-emerald-500/90 text-white'
                          : pet.healthStatus === 'Sick'
                          ? 'bg-red-500/90 text-white'
                          : 'bg-amber-500/90 text-white'
                      }`}
                    >
                      {pet.healthStatus || 'Healthy'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSetFavorite(pet)}
                    title="Set as favorite pet for top navbar avatar"
                    className="absolute top-3 right-3 bg-white/80 backdrop-blur-md hover:bg-white text-rose-500 p-1.5 rounded-full shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] filled-icon">favorite</span>
                  </button>
                </div>

                {/* Pet Details */}
                <div className="p-5 space-y-4 flex-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black text-on-surface">{pet.name}</h3>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {pet.gender}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-on-surface-variant mt-0.5">
                      {pet.breed || 'Mixed Breed'} {pet.color ? `• ${pet.color}` : ''}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
                    <div>
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Age</span>
                      <span className="font-bold text-on-surface">
                        {pet.age} {pet.ageUnit || 'Years'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Weight</span>
                      <span className="font-bold text-on-surface">
                        {pet.weight} {pet.weightUnit || 'kg'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          pet.vaccinated ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="font-bold text-on-surface">
                        {pet.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Status: <strong className="text-on-surface">{pet.status || 'Available'}</strong>
                    </span>
                  </div>

                  {pet.description && (
                    <p className="text-xs text-on-surface-variant/90 line-clamp-2 italic">
                      "{pet.description}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedPet(pet);
                      setIsViewModalOpen(true);
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span> View Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(pet)}
                      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-all"
                      title="Edit Pet Profile"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet)}
                      className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Pet"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PET MODAL FORM */}
      {/* ========================================================================= */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full max-h-[95vh] flex flex-col border border-outline-variant/40 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {isEditModalOpen ? 'edit_note' : 'add_circle'}
                </span>
                <h2 className="text-xl font-black text-on-surface">
                  {isEditModalOpen ? `Edit ${selectedPet?.name}'s Profile` : 'Add New Pet Companion'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={isEditModalOpen ? handleEditPetSubmit : handleAddPetSubmit} className="p-6 space-y-8 overflow-y-auto">
              
              {/* Photo Upload Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">add_a_photo</span>
                  Pet Photo
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
                  <div className="w-24 h-24 rounded-full bg-surface-container overflow-hidden border-4 border-surface shadow-md relative shrink-0 group">
                    <img
                      src={
                        formData.image ||
                        DEFAULT_PET_IMAGES[formData.species] ||
                        DEFAULT_PET_IMAGES.Other
                      }
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white rounded-full">
                        <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                    <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-5 py-2.5 rounded-xl inline-flex items-center justify-center sm:justify-start gap-2 transition-all border border-primary/20 w-full sm:w-auto">
                      <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    <div className="relative">
                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[16px]">link</span>
                       <input
                        type="url"
                        placeholder="Or paste Image URL directly..."
                        value={formData.image}
                        onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                        className="w-full pl-9 pr-3 py-2 bg-surface-container border border-outline-variant/40 rounded-xl text-xs focus:outline-none focus:border-primary text-on-surface transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">
                      Pet Name <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">pets</span>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Max, Bella"
                        className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold transition-all hover:bg-surface-container-high"
                      />
                    </div>
                  </div>

                  {/* Species */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">
                      Species <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">category</span>
                      <select
                        value={formData.species}
                        onChange={(e) => setFormData((prev) => ({ ...prev, species: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold appearance-none cursor-pointer transition-all hover:bg-surface-container-high"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Other">Other</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Breed */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Breed</label>
                    <input
                      type="text"
                      value={formData.breed}
                      onChange={(e) => setFormData((prev) => ({ ...prev, breed: e.target.value }))}
                      placeholder="e.g. Golden Retriever"
                      className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold transition-all hover:bg-surface-container-high"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Gender</label>
                    <div className="relative">
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold appearance-none cursor-pointer transition-all hover:bg-surface-container-high"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Traits */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">straighten</span>
                  Physical Traits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Age */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Age</label>
                    <div className="flex bg-surface-container border border-outline-variant/40 rounded-xl overflow-hidden focus-within:border-primary transition-all">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.age}
                        onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                        className="w-1/2 px-3 py-2.5 bg-transparent text-sm focus:outline-none text-on-surface font-semibold"
                      />
                      <select
                        value={formData.ageUnit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, ageUnit: e.target.value }))}
                        className="w-1/2 px-2 py-2.5 bg-surface-container-high border-l border-outline-variant/40 text-xs focus:outline-none text-on-surface font-semibold cursor-pointer"
                      >
                        <option value="Years">Years</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Weight</label>
                    <div className="flex bg-surface-container border border-outline-variant/40 rounded-xl overflow-hidden focus-within:border-primary transition-all">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                        className="w-1/2 px-3 py-2.5 bg-transparent text-sm focus:outline-none text-on-surface font-semibold"
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => setFormData((prev) => ({ ...prev, weightUnit: e.target.value }))}
                        className="w-1/2 px-2 py-2.5 bg-surface-container-high border-l border-outline-variant/40 text-xs focus:outline-none text-on-surface font-semibold cursor-pointer"
                      >
                        <option value="kg">kg</option>
                        <option value="lb">lb</option>
                      </select>
                    </div>
                  </div>

                  {/* Color */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Color / Markings</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g. Brown & White"
                      className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold transition-all hover:bg-surface-container-high"
                    />
                  </div>
                </div>
              </div>

              {/* Health & Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">medical_services</span>
                  Health & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Health Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Health Status</label>
                    <div className="relative">
                       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">monitor_heart</span>
                      <select
                        value={formData.healthStatus}
                        onChange={(e) => setFormData((prev) => ({ ...prev, healthStatus: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold appearance-none cursor-pointer transition-all hover:bg-surface-container-high"
                      >
                        <option value="Healthy">Healthy</option>
                        <option value="Sick">Sick</option>
                        <option value="Under Treatment">Under Treatment</option>
                      </select>
                       <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* General Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">Pet Status</label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-semibold appearance-none cursor-pointer transition-all hover:bg-surface-container-high"
                      >
                        <option value="Available">Available / Active</option>
                        <option value="Adopted">Adopted</option>
                        <option value="Sold">Sold</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Vaccination Status & Date */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
                  <label className="flex items-center gap-3 text-sm font-bold text-on-surface cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${formData.vaccinated ? 'bg-primary border-primary' : 'bg-surface-container border-outline-variant group-hover:border-primary'}`}>
                      {formData.vaccinated && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.vaccinated}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vaccinated: e.target.checked }))}
                      className="hidden"
                    />
                    Is Pet Vaccinated?
                  </label>

                  {formData.vaccinated && (
                    <div className="flex items-center gap-2 text-sm w-full sm:w-auto animate-fade-in">
                      <span className="text-on-surface-variant font-semibold shrink-0">Date:</span>
                      <input
                        type="date"
                        value={formData.vaccinationDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, vaccinationDate: e.target.value }))}
                        className="px-3 py-1.5 bg-surface-container border border-outline-variant/40 rounded-lg text-sm font-semibold text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant">Medical History & Notes (Optional)</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter any allergies, medical notes, or special care instructions..."
                    className="w-full px-4 py-3 bg-surface-container border border-outline-variant/40 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface transition-all hover:bg-surface-container-high resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-6 mt-6 border-t border-outline-variant/30 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-surface-container text-on-surface font-bold text-sm rounded-xl hover:bg-surface-container-high transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="px-8 py-2.5 bg-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(var(--color-primary-rgb),0.39)] hover:shadow-[0_6px_20px_rgba(var(--color-primary-rgb),0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {formSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      {isEditModalOpen ? 'Save Changes' : 'Register Pet'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW DETAILS MODAL */}
      {/* ========================================================================= */}
      {isViewModalOpen && selectedPet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full max-h-[95vh] flex flex-col border border-outline-variant/40 shadow-2xl overflow-hidden">
            <div className="relative h-56 bg-surface-container shrink-0">
              <img
                src={selectedPet.image || DEFAULT_PET_IMAGES[selectedPet.species || selectedPet.type] || DEFAULT_PET_IMAGES.Other}
                alt={selectedPet.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-all"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black text-on-surface">{selectedPet.name}</h2>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                    {selectedPet.species || selectedPet.type} • {selectedPet.gender}
                  </span>
                </div>
                <p className="text-xs font-bold text-on-surface-variant mt-1">
                  Breed: {selectedPet.breed || 'Mixed'} | Color: {selectedPet.color || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Age</span>
                  <span className="font-bold text-on-surface">{selectedPet.age} {selectedPet.ageUnit || 'Years'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Weight</span>
                  <span className="font-bold text-on-surface">{selectedPet.weight} {selectedPet.weightUnit || 'kg'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Health Status</span>
                  <span className="font-bold text-on-surface">{selectedPet.healthStatus || 'Healthy'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">Vaccinated</span>
                  <span className="font-bold text-on-surface">{selectedPet.vaccinated ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {selectedPet.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-on-surface uppercase">Medical History & Notes</h4>
                  <p className="text-xs text-on-surface-variant bg-surface-container p-3 rounded-xl">
                    {selectedPet.description}
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-surface-tint transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPets;
