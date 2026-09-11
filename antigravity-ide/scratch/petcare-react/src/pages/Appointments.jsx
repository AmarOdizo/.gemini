import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { isVetSuspended, isVetApproved } from '../utils/suspensionUtils';

const Appointments = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add Appointment Modal States
  const [showModal, setShowModal] = useState(false);
  const [vets, setVets] = useState([]);
  const [pets, setPets] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('video');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    const userId = parsedUser.id || parsedUser._id;
    fetchAppointments(userId);
    fetchPets(userId);
    fetchVets();

    const handleSync = () => fetchVets();
    window.addEventListener('petcare_vets_updated', handleSync);
    return () => window.removeEventListener('petcare_vets_updated', handleSync);
  }, [navigate]);

  const fetchAppointments = async (userId) => {
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments?ownerId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPets = async (userId) => {
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/pets?ownerId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPets(data.data);
        if (data.data.length > 0) setSelectedPetId(data.data[0]._id || data.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching pets", err);
    }
  };

  const fetchVets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets`);
      const data = await res.json();
      if (data.success && data.data) {
        const activeVets = data.data.filter(v => isVetApproved(v));
        setVets(activeVets);
        if (activeVets.length > 0) setSelectedVetId(activeVets[0]._id || activeVets[0].id);
      }
    } catch (err) {
      console.error("Error fetching vets", err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAppointments(appointments.filter(a => a._id !== id));
      }
    } catch (err) {
      console.error("Error cancelling appointment", err);
    }
  };

  const handleJoin = (appt) => {
    const now = new Date();
    // Try to parse the date and time. If it's valid, compare.
    const apptDateTime = new Date(`${appt.date}T${appt.time}`);
    
    // Check if the parsed date is valid before comparing
    if (!isNaN(apptDateTime.getTime())) {
      if (now < apptDateTime) {
        alert(`You can only join at the scheduled time: ${appt.date} ${appt.time}`);
        return;
      }
    } else {
      // Basic fallback if seed string like "Tomorrow" is used
      if (appt.date === 'Tomorrow' || appt.date === 'Next Week') {
        alert(`You can only join at the scheduled time: ${appt.date} ${appt.time}`);
        return;
      }
    }
    
    // Navigate to the WebRTC video call page
    navigate(`/owner-dashboard/video-call/${appt._id}`);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!date || !time || !type || !selectedVetId || !selectedPetId) {
      alert("Please fill in all required fields.");
      return;
    }

    setBookingLoading(true);
    try {
      const selectedVet = vets.find(v => v._id === selectedVetId || v.id === selectedVetId);
      const selectedPet = pets.find(p => p._id === selectedPetId || p.id === selectedPetId);

      if (!selectedVet || isVetSuspended(selectedVet) || !selectedPet) {
        alert("This veterinarian is suspended or unavailable. Please select an active doctor.");
        setBookingLoading(false);
        return;
      }

      const payload = {
        vetId: selectedVet._id || selectedVet.id,
        vetName: selectedVet.name,
        vetSpecialization: selectedVet.qualification || "Veterinarian",
        ownerId: user.id || user._id,
        ownerName: user.name || "Pet Parent",
        ownerPhone: user.phone || "+91 00000 00000",
        petId: selectedPet._id || selectedPet.id,
        petName: selectedPet.name,
        petSpecies: selectedPet.species || selectedPet.type || 'Unknown',
        petBreed: selectedPet.breed,
        petAge: selectedPet.age ? `${selectedPet.age} ${selectedPet.ageUnit || ''}`.trim() : 'Unknown',
        petWeight: selectedPet.weight ? `${selectedPet.weight} ${selectedPet.weightUnit || ''}`.trim() : 'Unknown',
        petSex: selectedPet.gender || selectedPet.sex || 'Unknown',
        date: date,
        time: time,
        consultationType: type,
        reason: reason,
        reasonForVisit: reason,
        fee: selectedVet.consultationFee || 499,
        status: 'pending'
      };

      // Navigate to confirmation page to review and save
      setShowModal(false);
      navigate('/booking-confirmation', { state: { draftPayload: payload, source: 'appointments' } });
      
    } catch (err) {
      alert("Error preparing consultation: " + err.message);
      setBookingLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        <TopNav title="My Appointments" subtitle="Manage your upcoming and past vet consultations." />

        <div className="flex justify-between items-center bg-surface-container-low p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">event_note</span>
            </div>
            <div>
              <h3 className="font-headline-sm font-black text-lg text-on-surface tracking-tight">All Appointments</h3>
              <p className="text-xs font-medium text-on-surface-variant">View and manage your schedule</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="w-full md:w-auto bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span> Book New Consultation
          </button>
        </div>
        
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant space-y-4">
            <span className="material-symbols-outlined animate-spin text-primary text-5xl">sync</span>
            <span className="font-label-md text-sm font-bold">Loading your appointments...</span>
          </div>
        ) : appointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map(appt => (
              <div key={appt._id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${appt.consultationType === 'video' ? 'bg-secondary-container/50 text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[14px] filled-icon">
                          {appt.consultationType === 'video' ? 'videocam' : 'storefront'}
                        </span> 
                        {appt.consultationType === 'video' ? 'Telehealth' : 'Clinic'}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border tracking-wider ${appt.status === 'upcoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-surface-container text-on-surface-variant border-outline-variant/50'}`}>
                      {appt.status === 'pending' ? 'Awaiting Doctor' : appt.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-black text-xl text-on-surface group-hover:text-primary transition-colors">{appt.vetName}</h4>
                    <p className="text-xs text-on-surface-variant font-medium">{appt.vetSpecialization || 'Veterinarian'}</p>
                  </div>

                  <div className="bg-surface-container-low/50 border border-outline-variant/30 rounded-xl p-3 flex flex-col gap-2.5 mb-5">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-outline-variant text-[18px]">pets</span>
                      <span className="font-bold text-on-surface">For {appt.petName} <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">{appt.petSpecies}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-symbols-outlined text-outline-variant text-[18px]">calendar_clock</span>
                      <span className="font-bold text-on-surface">{appt.date} at {appt.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/30">
                  {(appt.status === 'upcoming' || appt.status === 'pending') ? (
                    <>
                      <button onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)} className="flex-1 bg-surface-container text-on-surface border border-outline-variant/30 text-xs font-bold py-2.5 rounded-xl hover:bg-surface-container-high hover:border-outline-variant transition-colors flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">chat</span> Chat
                      </button>
                      {appt.consultationType === 'video' ? (
                        <button 
                          onClick={() => handleJoin(appt)} 
                          disabled={appt.status === 'pending' || (new Date() < new Date(`${appt.date}T${appt.time}`))}
                          className={`flex-1 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors ${appt.status === 'pending' || (new Date() < new Date(`${appt.date}T${appt.time}`)) ? 'bg-outline-variant cursor-not-allowed opacity-50' : 'bg-primary hover:bg-primary-container hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'}`}
                        >
                          <span className="material-symbols-outlined text-[18px] filled-icon">videocam</span> Start Video Call
                        </button>
                      ) : (
                        <button className="flex-1 bg-secondary/10 text-secondary border border-secondary/20 text-xs font-bold py-2.5 rounded-xl hover:bg-secondary/20 transition-colors flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">directions</span> Directions
                        </button>
                      )}
                      <button onClick={() => handleCancel(appt._id)} className="w-10 h-10 flex items-center justify-center text-error bg-error-container/10 hover:bg-error-container/30 rounded-xl transition-colors border border-error/10" title="Cancel Appointment">
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 text-on-surface-variant text-sm font-bold bg-surface-container-low py-2.5 rounded-xl border border-outline-variant/30">
                      <span className={`material-symbols-outlined text-[18px] ${appt.status === 'completed' ? 'text-emerald-600' : 'text-error'}`}>
                        {appt.status === 'completed' ? 'check_circle' : 'cancel'}
                      </span>
                      {appt.status === 'completed' ? 'Appointment Completed' : 'Appointment Cancelled'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-3xl flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-5xl opacity-40">event_busy</span>
            </div>
            <p className="font-black text-xl text-on-surface mb-1">No appointments scheduled</p>
            <p className="text-sm text-on-surface-variant mb-6">You don't have any upcoming or past consultations.</p>
            <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-container transition-all shadow-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Book Now
            </button>
          </div>
        )}
      </main>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-outline-variant/20">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface-container-lowest z-10">
              <h2 className="font-headline-sm text-xl font-black text-on-surface flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">event_note</span>
                </div>
                Book Appointment
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-all">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar bg-surface/50">
              <form onSubmit={handleBooking} className="flex flex-col gap-6">
                
                {/* Select Vet & Pet Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Select Doctor</label>
                    <div className="relative">
                      <select 
                        value={selectedVetId} 
                        onChange={e => setSelectedVetId(e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all appearance-none cursor-pointer"
                        required
                      >
                        <option value="" disabled>Choose a vet</option>
                        {vets.map(v => (
                          <option key={v._id || v.id} value={v._id || v.id}>{v.name} ({v.qualification}) - ₹{v.consultationFee || 499}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Select Pet</label>
                    {pets.length > 0 ? (
                      <div className="relative">
                        <select 
                          value={selectedPetId} 
                          onChange={e => setSelectedPetId(e.target.value)}
                          className="w-full pl-4 pr-10 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="" disabled>Choose a pet</option>
                          {pets.map(p => (
                            <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.species})</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">expand_more</span>
                      </div>
                    ) : (
                      <div className="text-xs text-error font-bold p-3 border border-error/30 rounded-xl bg-error-container/20 h-[52px] flex items-center justify-center text-center">
                        Register a pet first!
                      </div>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all cursor-pointer" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-4 py-3 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all cursor-pointer" />
                  </div>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${type === 'video' ? 'bg-primary/5 border-primary text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/40 hover:bg-surface-container-low hover:border-outline-variant text-on-surface-variant hover:text-on-surface'}`}>
                      <input type="radio" name="type" value="video" checked={type === 'video'} onChange={() => setType('video')} className="hidden" />
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'video' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                        <span className="material-symbols-outlined text-[28px] filled-icon">videocam</span>
                      </div>
                      <span className="font-bold text-sm">Video Call</span>
                    </label>
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${type === 'clinic' ? 'bg-primary/5 border-primary text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/40 hover:bg-surface-container-low hover:border-outline-variant text-on-surface-variant hover:text-on-surface'}`}>
                      <input type="radio" name="type" value="clinic" checked={type === 'clinic'} onChange={() => setType('clinic')} className="hidden" />
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'clinic' ? 'bg-primary/20' : 'bg-surface-container-high'}`}>
                         <span className="material-symbols-outlined text-[28px] filled-icon">local_hospital</span>
                      </div>
                      <span className="font-bold text-sm">Clinic Visit</span>
                    </label>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Reason for Visit</label>
                  <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Briefly describe your pet's symptoms or reason for visit..."
                    className="w-full px-4 py-3 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all resize-none h-28 custom-scrollbar"
                    required
                  ></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3 sticky bottom-0 z-10">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleBooking} disabled={bookingLoading} className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-70 disabled:hover:translate-y-0">
                {bookingLoading ? (
                  <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Processing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[20px] filled-icon">check_circle</span> Confirm Booking</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Appointments;
