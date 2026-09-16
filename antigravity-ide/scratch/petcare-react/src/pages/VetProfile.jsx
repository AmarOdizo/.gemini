import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { isVetSuspended, isVetApproved } from '../utils/suspensionUtils';
import { checkVetOnlineStatus } from '../utils/availabilityUtils';

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
  const [isEmergencyBooking, setIsEmergencyBooking] = useState(false);
  
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets/${vetId}`);
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
      fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/pets?ownerId=${parsedUser.id || parsedUser._id}`, {
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
      fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/favorites?ownerId=${parsedUser.id || parsedUser._id}`)
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
    if (isVetSuspended(vet)) {
      alert("Dr. " + (vet?.name || 'this veterinarian') + " is currently suspended by clinical administration and cannot accept appointments.");
      return;
    }

    if (!isEmergencyBooking && (!date || !time)) {
      alert("Please select date and time.");
      return;
    }
    if (!type) {
      alert("Please select type of consultation.");
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
        petSpecies: selectedPet.species || 'Unknown',
        petBreed: selectedPet.breed,
        petAge: selectedPet.age ? `${selectedPet.age} ${selectedPet.ageUnit || ''}`.trim() : 'Unknown',
        petWeight: selectedPet.weight ? `${selectedPet.weight} ${selectedPet.weightUnit || ''}`.trim() : 'Unknown',
        petSex: selectedPet.gender || selectedPet.sex || 'Unknown',
        date: isEmergencyBooking ? new Date().toISOString().split('T')[0] : date,
        time: isEmergencyBooking ? 'IMMEDIATE' : time,
        consultationType: type,
        triage: isEmergencyBooking ? 'emergency' : 'routine',
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
        await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/favorites`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ownerId, vetId: vet._id || vet.id })
        });
        setIsFavorite(false);
        setFavoriteImage('');
      } else {
        // Add favorite
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/favorites`, {
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/imagekit/upload`, {
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
            await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/favorites`, {
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
      <main className="flex items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </main>
    );
  }

  if (!vet) return null;

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full">
        <TopNav backLink={{ to: '/find-vets', text: 'Back to Vets Directory' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
          {/* Left Column: Doctor Bio */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-4 shadow-sm ambient-shadow">
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-primary/20 shadow-sm relative bg-surface-container group">
                    <img src={favoriteImage || vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop"} alt={vet.name} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border border-white" title="Online for Telehealth"></span>
                    
                    {isFavorite && (
                      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                        <span className="material-symbols-outlined text-white text-[18px]">photo_camera</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
                      </label>
                    )}
                  </div>
                  {uploadingImg && <span className="text-[9px] text-primary font-bold">Uploading...</span>}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="font-headline-lg text-lg text-on-surface font-bold leading-tight">{vet.name}</h2>
                      {isVetSuspended(vet) ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-error text-white flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">block</span>
                          Suspended
                        </span>
                      ) : !isVetApproved(vet) ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white flex items-center gap-0.5 shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
                          Pending
                        </span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-primary filled-icon text-[16px]" title="Verified Veterinary Specialist">verified</span>
                          <span className="font-mono text-[9px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-200">
                            {vet.vciNumber || 'VCI Verified'}
                          </span>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={handleFavoriteToggle} 
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-low transition-colors"
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isFavorite ? 'filled-icon text-error' : 'text-on-surface-variant'}`}>favorite</span>
                    </button>
                  </div>
                  <p className="font-body-md text-[11px] text-on-surface-variant mb-2.5 font-semibold">{vet.qualification}</p>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-secondary-container/40 text-on-secondary-container px-2 py-0.5 rounded text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {vet.city || 'India'} • {vet.experienceYears || '0'} Yrs Exp.
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <span className="material-symbols-outlined text-[12px]">star</span>
                      4.9 (120+ Reviews)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-outline-variant/30">
                <h3 className="font-headline-sm text-[11px] font-bold text-on-surface mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[14px]">person</span> Professional Profile & Bio
                </h3>
                <p className="font-body-md text-[10px] text-on-surface-variant leading-relaxed">
                  {vet.about || "Loading profile details..."}
                </p>
              </div>

              {vet.specialization && vet.specialization.length > 0 && (
                <div className="mt-3 pt-3 border-t border-outline-variant/30">
                  <h3 className="font-headline-sm text-[11px] font-bold text-on-surface mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-[14px]">local_hospital</span> Specializations
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {vet.specialization.map((spec, i) => (
                      <span key={i} className="bg-surface-container-low border border-outline-variant/50 text-on-surface-variant px-2 py-1 rounded text-[9px] font-semibold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary"></span> {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Booking Widget or Suspended/Pending Notice */}
          <div className="lg:col-span-5">
            {isVetSuspended(vet) ? (
              <div className="bg-surface-container-lowest border-2 border-red-200 rounded-2xl shadow-lg p-6 sm:p-8 text-center space-y-4 sticky top-24">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">block</span>
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-error text-white inline-block">
                    Unavailable
                  </span>
                  <h3 className="font-headline-sm font-bold text-lg text-on-surface">Doctor Suspended</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {vet.name} is currently suspended by clinical administration and cannot accept new patient consultations or appointments.
                </p>
                <div className="pt-4 border-t border-outline-variant/30">
                  <Link
                    to="/find-vets"
                    className="w-full inline-flex justify-center items-center gap-2 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Find Another Available Veterinarian</span>
                  </Link>
                </div>
              </div>
            ) : !isVetApproved(vet) ? (
              <div className="bg-surface-container-lowest border-2 border-amber-300 rounded-2xl shadow-lg p-6 sm:p-8 text-center space-y-4 sticky top-24">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl">hourglass_top</span>
                </div>
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white inline-block">
                    Verification In Progress
                  </span>
                  <h3 className="font-headline-sm font-bold text-lg text-on-surface">Pending Administrator Verification</h3>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {vet.name} has recently registered and is awaiting credential & VCI license review by the Clinical Board. Patient appointments will be enabled once approved.
                </p>
                <div className="pt-4 border-t border-outline-variant/30">
                  <Link
                    to="/find-vets"
                    className="w-full inline-flex justify-center items-center gap-2 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Browse Verified Veterinarians</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl shadow-md ambient-shadow overflow-hidden sticky top-20">
                <div className="bg-primary p-3 text-on-primary">
                  <h3 className="font-headline-sm font-bold text-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">edit_calendar</span> Book Consultation
                  </h3>
                  <p className="text-[10px] text-primary-fixed opacity-90 mt-0.5 leading-none">Instant confirmation & secure payment.</p>
                </div>
                
                <div className="p-4">
                  {!checkVetOnlineStatus(vet) ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center bg-surface-container-low border border-dashed border-outline-variant/50 rounded-xl">
                      <span className="material-symbols-outlined text-3xl text-outline-variant mb-2">schedule_busy</span>
                      <h4 className="font-bold text-sm text-on-surface mb-1">Doctor is Offline</h4>
                      <p className="text-[10px] text-on-surface-variant max-w-[200px]">
                        This doctor is not available right now. Please try again during their scheduled hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBooking} className="flex flex-col gap-3">
                    {/* Select Pet */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-[9px] font-bold text-on-surface uppercase tracking-wider">1. Select Pet</label>
                      {pets.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 custom-scrollbar">
                          {pets.map(p => {
                            const petId = p._id || p.id;
                            return (
                            <label key={petId} className={`shrink-0 cursor-pointer border rounded-lg p-1.5 flex items-center gap-2 transition-all min-w-[120px] ${selectedPetId === petId ? 'bg-primary/5 border-primary text-primary shadow-sm transform -translate-y-px' : 'border-outline-variant/50 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}>
                              <input type="radio" name="selectedPet" value={petId} checked={selectedPetId === petId} onChange={() => setSelectedPetId(petId)} className="hidden" />
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 flex items-center justify-center bg-surface-container">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">pets</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] leading-tight">{p.name}</span>
                                <span className="text-[9px] opacity-80 uppercase tracking-wider font-bold">{p.species || 'Pet'}</span>
                              </div>
                            </label>
                          )})}
                        </div>
                      ) : (
                        <div className="text-[10px] text-error font-bold p-2 border border-error/50 rounded-lg bg-error/10">
                          Please register a pet in your Dashboard first!
                        </div>
                      )}
                    </div>

                    {/* Emergency Toggle (If Vet is Emergency Doctor) */}
                    {vet.emergencyDuty && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-600 text-[16px]">emergency</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-red-900 text-[11px]">Emergency Booking</h4>
                            <p className="text-[9px] text-red-700 font-medium">Auto-rejects if not accepted in 10 mins</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={isEmergencyBooking} onChange={(e) => setIsEmergencyBooking(e.target.checked)} />
                          <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    )}

                    {/* Select Consultation Type */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-[9px] font-bold text-on-surface uppercase tracking-wider">2. Consultation Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-0.5 text-center ${type === 'video' ? 'bg-primary/5 border-primary text-primary shadow-xs' : 'border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                          <input type="radio" name="cons_type" value="video" checked={type === 'video'} onChange={() => setType('video')} className="hidden" />
                          <span className="material-symbols-outlined text-[20px]">videocam</span>
                          <span className="font-bold text-[10px]">Video Call</span>
                        </label>
                        <label className={`border rounded-lg p-2 cursor-pointer transition-all flex flex-col items-center gap-0.5 text-center ${type === 'clinic' ? 'bg-primary/5 border-primary text-primary shadow-xs' : 'border-outline-variant/50 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                          <input type="radio" name="cons_type" value="clinic" checked={type === 'clinic'} onChange={() => setType('clinic')} className="hidden" />
                          <span className="material-symbols-outlined text-[20px]">storefront</span>
                          <span className="font-bold text-[10px]">Clinic Visit</span>
                        </label>
                      </div>
                    </div>

                    {/* Select Date & Time */}
                    {!isEmergencyBooking ? (
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-[9px] font-bold text-on-surface uppercase tracking-wider">3. Date & Time</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border border-outline-variant/50 rounded-lg p-1.5 text-[11px] font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                          <select value={time} onChange={(e) => setTime(e.target.value)} required className="border border-outline-variant/50 rounded-lg p-1.5 text-[11px] font-semibold text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-container-lowest">
                            <option value="" disabled>Select Time</option>
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="09:30 AM">09:30 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="10:30 AM">10:30 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="11:30 AM">11:30 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="12:30 PM">12:30 PM</option>
                            <option value="01:00 PM">01:00 PM</option>
                            <option value="01:30 PM">01:30 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="02:30 PM">02:30 PM</option>
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="03:30 PM">03:30 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                            <option value="04:30 PM">04:30 PM</option>
                            <option value="05:00 PM">05:00 PM</option>
                            <option value="05:30 PM">05:30 PM</option>
                            <option value="06:00 PM">06:00 PM</option>
                            <option value="06:30 PM">06:30 PM</option>
                            <option value="07:00 PM">07:00 PM</option>
                            <option value="07:30 PM">07:30 PM</option>
                            <option value="08:00 PM">08:00 PM</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <label className="font-label-md text-[9px] font-bold text-on-surface uppercase tracking-wider">3. Date & Time</label>
                        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-2 text-[11px] font-bold flex items-center justify-between">
                          <span>Today</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">bolt</span> IMMEDIATE / ASAP</span>
                        </div>
                      </div>
                    )}

                    {/* Reason for Visit */}
                    <div className="flex flex-col gap-1">
                      <label className="font-label-md text-[9px] font-bold text-on-surface uppercase tracking-wider">4. Reason for Visit</label>
                      <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="2" className="border border-outline-variant/50 rounded-lg p-2 text-[11px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" placeholder="Briefly describe the issue..."></textarea>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-on-surface-variant">Consultation Fee</span>
                        <span className="font-bold text-[11px] text-on-surface">₹{vet.consultationFee || 499}</span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-on-surface-variant">Platform Fee (Inc. GST)</span>
                        <span className="font-bold text-[11px] text-on-surface">₹50</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-outline-variant/50 font-bold text-primary text-xs">
                        <span>Total Payable</span>
                        <span>₹{(vet.consultationFee || 499) + 50}</span>
                      </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={bookingLoading} className="w-full bg-primary text-on-primary py-2 rounded-lg text-[11px] font-bold shadow-sm hover:bg-surface-tint hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-1.5">
                      {bookingLoading ? (
                        <><span className="material-symbols-outlined animate-spin text-[16px]">sync</span> Processing...</>
                      ) : (
                        <><span className="material-symbols-outlined text-[16px]">event_available</span> Confirm & Pay ₹{(vet.consultationFee || 499) + 50}</>
                      )}
                    </button>
                    <p className="text-[9px] text-center text-on-surface-variant font-medium mt-[-6px]">
                      By booking, you agree to PawsIndia&apos;s Telehealth Terms of Service.
                    </p>
                  </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </main>
  );
};

export default VetProfile;
