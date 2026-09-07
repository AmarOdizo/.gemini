import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

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
  }, [navigate]);

  const fetchAppointments = async (userId) => {
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments?ownerId=${userId}`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/pets?ownerId=${userId}`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/vets`);
      const data = await res.json();
      if (data.success && data.data) {
        setVets(data.data);
        if (data.data.length > 0) setSelectedVetId(data.data[0]._id || data.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching vets", err);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const token = localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/consultations/${id}`, { 
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
    const apptDateTime = new Date(`${appt.date} ${appt.time}`);
    
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
    
    // Assuming LiveChat or consultation page handles the video call
    navigate(`/live-chat?consultationId=${appt._id}`);
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

      if (!selectedVet || !selectedPet) {
        alert("Invalid vet or pet selection.");
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
        petSpecies: selectedPet.species || 'Unknown',
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
      <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="My Appointments" subtitle="Manage your upcoming and past vet consultations." />

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm ambient-shadow overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="font-headline-sm font-bold text-lg flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">event_note</span> All Appointments
            </h3>
            <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-surface-tint hover:-translate-y-0.5 transition-all shadow-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Appointment
            </button>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
                <span className="font-label-md text-base font-semibold">Loading Appointments...</span>
              </div>
            ) : appointments.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-outline-variant">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant">
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs">Doctor</th>
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs">Pet</th>
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs">Date & Time</th>
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs">Type</th>
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs">Status</th>
                      <th className="p-4 font-label-md font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appt => (
                      <tr key={appt._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors group bg-surface">
                        <td className="p-4">
                          <p className="font-bold text-on-surface">{appt.vetName}</p>
                          <p className="text-xs text-on-surface-variant">{appt.vetSpecialization || 'Veterinarian'}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary/70 text-[18px]">pets</span>
                            <div>
                              <p className="font-bold text-on-surface">{appt.petName}</p>
                              <p className="text-xs text-on-surface-variant">{appt.petSpecies}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-on-surface">{appt.date}</p>
                          <p className="text-xs text-on-surface-variant">{appt.time}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 bg-secondary-container/30 text-on-secondary-container px-2 py-1 rounded-md text-xs font-bold">
                            <span className="material-symbols-outlined text-[14px]">
                              {appt.consultationType === 'video' ? 'videocam' : 'storefront'}
                            </span> 
                            {appt.consultationType === 'video' ? 'Telehealth' : 'Clinic'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border tracking-wider ${appt.status === 'upcoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
                            {appt.status === 'pending' ? 'Awaiting Doctor' : appt.status}
                          </span>
                        </td>
                        <td className="p-4 text-right align-middle">
                          <div className="flex justify-end items-center gap-2">
                            <button onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)} className="bg-surface-container-high text-on-surface border border-outline-variant text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-surface-container transition-colors flex items-center gap-1 shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">chat</span> Message
                            </button>
                            {appt.consultationType === 'video' ? (
                              <button 
                                onClick={() => {
                                  if (appt.meetLink) {
                                    window.open(appt.meetLink, '_blank');
                                  } else {
                                    handleJoin(appt);
                                  }
                                }} 
                                disabled={appt.status === 'pending' || (new Date() < new Date(`${appt.date} ${appt.time}`))}
                                className={`text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 shadow-sm transition-colors ${appt.status === 'pending' || (new Date() < new Date(`${appt.date} ${appt.time}`)) ? 'bg-outline-variant cursor-not-allowed' : 'bg-primary hover:bg-surface-tint'}`}
                              >
                                <span className="material-symbols-outlined text-[16px]">videocam</span> Join Meet
                              </button>
                            ) : (
                              <button className="bg-secondary text-white text-xs font-bold py-1.5 px-3 rounded-lg hover:bg-secondary-fixed-dim transition-colors flex items-center gap-1 shadow-sm">
                                <span className="material-symbols-outlined text-[16px]">directions</span> Directions
                              </button>
                            )}
                            <button onClick={() => handleCancel(appt._id)} className="text-error opacity-50 group-hover:opacity-100 hover:bg-error-container/30 p-1.5 rounded-lg transition-all" title="Cancel Appointment">
                              <span className="material-symbols-outlined text-[18px]">cancel</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-2 opacity-50">calendar_today</span>
                <p className="font-bold">No appointments scheduled.</p>
                <p className="text-sm">Click "Add Appointment" to book a consultation.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center sticky top-0 bg-surface z-10">
              <h2 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_note</span> Book Appointment
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error hover:bg-error-container/20 p-2 rounded-full transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleBooking} className="flex flex-col gap-6">
                
                {/* Select Vet */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Select Doctor</label>
                  <select 
                    value={selectedVetId} 
                    onChange={e => setSelectedVetId(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface"
                    required
                  >
                    <option value="" disabled>Choose a vet</option>
                    {vets.map(v => (
                      <option key={v._id || v.id} value={v._id || v.id}>{v.name} ({v.qualification}) - ₹{v.consultationFee || 499}</option>
                    ))}
                  </select>
                </div>

                {/* Select Pet */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Select Pet</label>
                  {pets.length > 0 ? (
                    <select 
                      value={selectedPetId} 
                      onChange={e => setSelectedPetId(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface"
                      required
                    >
                      <option value="" disabled>Choose a pet</option>
                      {pets.map(p => (
                        <option key={p._id || p.id} value={p._id || p.id}>{p.name} ({p.species})</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-error font-bold p-3 border border-error/50 rounded-xl bg-error/10">
                      Please register a pet in your Dashboard first!
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary" />
                  </div>
                </div>

                {/* Type */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-1 transition-all ${type === 'video' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant hover:bg-surface-container-low'}`}>
                      <input type="radio" name="type" value="video" checked={type === 'video'} onChange={() => setType('video')} className="hidden" />
                      <span className="material-symbols-outlined text-2xl">videocam</span>
                      <span className="font-bold text-sm">Video Call</span>
                    </label>
                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-1 transition-all ${type === 'clinic' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant hover:bg-surface-container-low'}`}>
                      <input type="radio" name="type" value="clinic" checked={type === 'clinic'} onChange={() => setType('clinic')} className="hidden" />
                      <span className="material-symbols-outlined text-2xl">local_hospital</span>
                      <span className="font-bold text-sm">Clinic Visit</span>
                    </label>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">Reason for Visit</label>
                  <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    placeholder="Briefly describe your pet's symptoms or reason for visit..."
                    className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-sm focus:outline-none focus:border-primary resize-none h-24"
                    required
                  ></textarea>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleBooking} disabled={bookingLoading} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-surface-tint transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-70">
                {bookingLoading ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Processing...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span> Confirm Booking</>
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
