import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import supabase from '../supabaseClient';
import { isVetSuspended, isVetApproved } from '../utils/suspensionUtils';
import { checkVetOnlineStatus } from '../utils/availabilityUtils';

const OwnerDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callingAppt, setCallingAppt] = useState(null);

  // Quick Book State
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedVetId, setSelectedVetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchData(parsedUser);

    const handleSync = () => fetchData(parsedUser);
    window.addEventListener('petcare_vets_updated', handleSync);
    return () => window.removeEventListener('petcare_vets_updated', handleSync);
  }, [navigate]);

  const fetchData = async (currentUser) => {
    try {
      const ownerId = currentUser._id || currentUser.id;
      const API_BASE = import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com';
      const token = localStorage.getItem('userToken') || '';
      
      const fetchWithToken = (url) => fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      // Fetch Appointments
      try {
        const apptsRes = await fetchWithToken(`${API_BASE}/api/appointments?ownerId=${ownerId}`);
        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          setAppointments(apptsData.appointments || apptsData.data || []);
        } else {
          // Fallback to consultations endpoint if /appointments fails
          const consultRes = await fetchWithToken(`${API_BASE}/api/consultations?ownerId=${ownerId}`);
          if (consultRes.ok) {
            const consultData = await consultRes.json();
            setAppointments(consultData.data || consultData.appointments || []);
          }
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }

      // Fetch Vets (Only verified & approved doctors)
      try {
        const vetsRes = await fetch(`${API_BASE}/api/vets`);
        if (vetsRes.ok) {
          const vetsData = await vetsRes.json();
          const activeVets = (vetsData.data || []).filter(v => isVetApproved(v));
          
          // Sort so online vets appear first
          activeVets.sort((a, b) => {
            const aOnline = checkVetOnlineStatus(a);
            const bOnline = checkVetOnlineStatus(b);
            if (aOnline === bOnline) return 0;
            return aOnline ? -1 : 1;
          });
          
          setVets(activeVets);
          if (activeVets.length > 0) setSelectedVetId(activeVets[0]._id || activeVets[0].id);
        }
      } catch (err) {
        console.error("Error fetching vets:", err);
      }
      
      // Fetch Pets
      try {
        const petsRes = await fetchWithToken(`${API_BASE}/api/pets?ownerId=${ownerId}`);
        if (petsRes.ok) {
          const petsData = await petsRes.json();
          setPets(petsData.data || []);
          if (petsData.data && petsData.data.length > 0) setSelectedPetId(petsData.data[0]._id || petsData.data[0].id);
        }
      } catch (err) {
        console.error("Error fetching pets:", err);
      }

    } catch (err) {
      console.error("Error in dashboard initialization", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBook = async (e) => {
    e.preventDefault();
    if (!selectedPetId || !selectedVetId || !date || !time) {
      alert("Please fill in all details.");
      return;
    }
    
    setBookingLoading(true);
    try {
      const selectedPet = pets.find(p => p._id === selectedPetId);
      const selectedVet = vets.find(v => v._id === selectedVetId);
      
      if (!selectedVet || isVetSuspended(selectedVet)) {
        alert("This veterinarian is currently suspended and unavailable for booking.");
        setBookingLoading(false);
        return;
      }
      
      const payload = {
        vetId: selectedVet._id,
        vetName: selectedVet.name,
        vetSpecialization: selectedVet.qualification,
        ownerId: user.id || user._id,
        ownerName: user.name,
        ownerPhone: user.phone || "+91 00000 00000",
        petId: selectedPet._id,
        petName: selectedPet.name,
        petSpecies: selectedPet.species || 'Unknown',
        date: date,
        time: time,
        consultationType: 'video',
        reason: 'Quick booking from Dashboard',
        reasonForVisit: 'Quick booking from Dashboard',
        fee: selectedVet.consultationFee || 499,
        status: 'upcoming'
      };

      const token = localStorage.getItem('userToken') || '';
      const apptRes = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const apptJson = await apptRes.json();
      
      if (!apptRes.ok || !apptJson.success) throw new Error(apptJson.message);

      const consultPayload = { ...payload, appointmentId: apptJson.appointment._id };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(consultPayload)
      });
      
      if (res.ok) {
        alert("Quick consultation booked successfully!");
        navigate('/appointments');
      } else {
        throw new Error("Failed to book consultation");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleJoin = (appt) => {
    setIsCalling(true);
    setCallingAppt(appt);

    const callerId = user.id || user._id;
    const callerName = user.name || 'Pet Parent';
    const otherPartyId = appt.vetId;

    const doctorChannel = supabase.channel(`global-call-${otherPartyId}`);
    doctorChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        doctorChannel.send({
          type: 'broadcast',
          event: 'incoming_call',
          payload: {
            callerId: callerId,
            callerName: callerName,
            appointmentId: appt._id,
            appointmentDetails: appt,
            role: 'owner'
          }
        });
        setTimeout(() => supabase.removeChannel(doctorChannel), 500);
      }
    });

    const myChannel = supabase.channel(`global-call-${callerId}`);
    myChannel.on('broadcast', { event: 'call_accepted' }, (payload) => {
      if (payload.payload.appointmentId === appt._id) {
        setIsCalling(false);
        setCallingAppt(null);
        supabase.removeChannel(myChannel);
        navigate(`/owner-dashboard/video-call/${appt._id}`, { state: { appointment: appt } });
      }
    });
    myChannel.subscribe();

    setTimeout(() => {
      if (isCalling) {
        setIsCalling(false);
        setCallingAppt(null);
        supabase.removeChannel(myChannel);
        alert("The doctor is not answering. Please try again later.");
      }
    }, 30000);
  };

  if (!user) return null;

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        <TopNav title={`Welcome back, ${user.name.split(' ')[0]}! 👋`} subtitle="Here's what's happening with your furry friends today." />

        <div className="flex flex-col gap-3 w-full">
          {/* Search Bar */}
          <div className="relative w-full md:w-2/3 lg:w-1/2 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[18px] group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-body-sm text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md" 
              placeholder="Search for veterinarians, clinics, or services..." 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* Your Registered Pets */}
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline-sm text-sm text-on-surface font-black tracking-tight">Your Registered Pets</h3>
                  <Link to="/my-pets" className="flex items-center gap-0.5 text-[11px] font-bold text-primary hover:text-primary-container transition-colors px-2 py-1 rounded-full hover:bg-surface-container-low">
                    Manage Pets <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                  <Link to="/my-pets" className="min-w-[120px] bg-surface-container-low border-2 border-dashed border-outline-variant/60 rounded-xl p-3 flex flex-col items-center justify-center text-primary hover:bg-surface-container hover:border-primary/50 transition-all cursor-pointer shrink-0 snap-start hover:scale-[1.02]">
                    <span className="material-symbols-outlined text-2xl mb-1 opacity-80">add_circle</span>
                    <span className="font-label-md font-bold text-[11px]">Add New Pet</span>
                  </Link>
                </div>
              </section>

              {/* Emergency On-Call Section */}
              <section>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-600 text-[14px] filled-icon">emergency</span>
                    </div>
                    <h3 className="font-headline-sm text-sm text-on-surface font-black tracking-tight">Emergency On-Call</h3>
                  </div>
                  <Link to="/find-vets?emergency=true" className="text-red-600 font-label-md text-[11px] font-bold hover:text-red-800 transition-colors px-2 py-1 rounded-full hover:bg-red-50">View All &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-red-50/50 border border-red-100 rounded-xl p-2.5 flex gap-2.5 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-red-200/50 shrink-0"></div>
                        <div className="flex flex-col gap-1.5 w-full justify-center">
                          <div className="h-3 bg-red-200/50 rounded w-3/4"></div>
                          <div className="h-2.5 bg-red-200/50 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : vets.filter(v => v.emergencyDuty).length > 0 ? (
                    vets.filter(v => v.emergencyDuty).slice(0, 4).map(vet => (
                      <Link to={`/owner-dashboard/vet-profile?id=${vet._id || vet.id}`} key={vet._id} className="bg-red-50/80 border border-red-200/60 rounded-xl p-2.5 flex gap-2.5 hover:shadow-md hover:border-red-400 transition-all cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-10 h-10 bg-red-200/30 rounded-bl-full -mr-2 -mt-2 z-0"></div>
                        <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop"} alt={vet.name} className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform relative z-10 border border-red-200" />
                        <div className="flex flex-col justify-center relative z-10">
                          <h4 className="font-bold text-red-900 text-xs group-hover:text-red-700 transition-colors line-clamp-1">{vet.name}</h4>
                          <p className="text-[11px] text-red-700/80 font-bold line-clamp-1">{vet.qualification}</p>
                          <div className="flex items-center gap-0.5 mt-0.5 text-[9px] font-black text-red-700 bg-red-100 px-1.5 py-0.5 rounded w-fit uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px]">call</span> On-Call
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-4 text-center text-red-800/60 bg-red-50/50 rounded-xl border border-dashed border-red-200 flex flex-col items-center">
                      <span className="material-symbols-outlined text-xl opacity-50 mb-0.5">healing</span>
                      <p className="font-medium text-xs">No emergency vets available right now.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Recommended Veterinarians */}
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-headline-sm text-sm text-on-surface font-black tracking-tight">Recommended Veterinarians</h3>
                  <Link to="/find-vets" className="text-primary font-label-md text-[11px] font-bold hover:text-primary-container transition-colors px-2 py-1 rounded-full hover:bg-surface-container-low">View All &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-2.5 flex gap-2.5 animate-pulse">
                        <div className="w-10 h-10 rounded-lg bg-surface-variant shrink-0"></div>
                        <div className="flex flex-col gap-1.5 w-full justify-center">
                          <div className="h-3 bg-surface-variant rounded w-3/4"></div>
                          <div className="h-2.5 bg-surface-variant rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : vets.length > 0 ? (
                    vets.slice(0, 4).map(vet => {
                      const isOnline = checkVetOnlineStatus(vet);
                      return (
                      <Link to={`/owner-dashboard/vet-profile?id=${vet._id || vet.id}`} key={vet._id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-2.5 flex gap-2.5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-0.5 relative overflow-hidden">
                        <div className="relative">
                          <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop"} alt={vet.name} className="w-10 h-10 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface-container-lowest ${isOnline ? 'bg-emerald-500' : 'bg-outline-variant'}`}></div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-on-surface text-xs group-hover:text-primary transition-colors flex items-center gap-1">
                            {vet.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">{vet.qualification}</p>
                          <div className="flex items-center gap-0.5 mt-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit">
                            <span className="material-symbols-outlined text-[12px]">star</span> 4.9
                          </div>
                        </div>
                      </Link>
                    )})
                  ) : (
                    <div className="col-span-full py-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-2xl opacity-50 mb-1">sentiment_dissatisfied</span>
                      <p className="font-medium text-xs">No recommended vets available.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-3">
              {/* Quick Book Consultation Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                <div className="px-3 py-2.5 border-b border-outline-variant/20 flex justify-between items-center bg-gradient-to-r from-primary to-primary-container text-on-primary">
                  <h3 className="font-headline-sm text-xs font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined filled-icon text-[16px]">bolt</span> Quick Book Consult
                  </h3>
                </div>
                <div className="p-3 relative z-10">
                  <form onSubmit={handleQuickBook} className="flex flex-col gap-3">
                    
                    {/* Select Pet */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">1. Select Pet</label>
                      {loading ? (
                         <div className="flex gap-2"><div className="w-12 h-8 bg-surface-variant animate-pulse rounded-lg"></div></div>
                      ) : pets.length > 0 ? (
                        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar snap-x">
                          {pets.map(p => (
                            <label key={p._id} className={`shrink-0 cursor-pointer border rounded-lg p-1.5 flex items-center gap-1.5 transition-all min-w-[100px] snap-start text-[11px] ${selectedPetId === p._id ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low hover:border-outline-variant'}`}>
                              <input type="radio" name="quick_pet" value={p._id} checked={selectedPetId === p._id} onChange={() => setSelectedPetId(p._id)} className="hidden" />
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 flex items-center justify-center bg-surface-container">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[12px] text-on-surface-variant">pets</span>
                                )}
                              </div>
                              <span className="font-bold">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-error font-bold p-2 border border-error/30 rounded-lg bg-error-container/20 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px]">error</span> Register a pet first!
                        </div>
                      )}
                    </div>

                    {/* Select Doctor */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">2. Select Doctor</label>
                      <select value={selectedVetId} onChange={(e) => setSelectedVetId(e.target.value)} required className="input-standard appearance-none cursor-pointer">
                        {loading ? <option>Loading...</option> : vets.map(v => {
                          const isOnline = checkVetOnlineStatus(v);
                          return (
                            <option key={v._id} value={v._id} disabled={!isOnline}>
                              {v.name} ({v.specialization?.[0] || 'Vet'}) {isOnline ? '' : ' - OFFLINE'}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">3. Date & Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="input-standard" />
                        <select value={time} onChange={(e) => setTime(e.target.value)} required className="input-standard appearance-none cursor-pointer">
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

                    <button type="submit" disabled={bookingLoading || !selectedVetId || !selectedPetId || !date || !time} className="btn-primary w-full py-2 mt-1 shadow-primary/20 shadow-md flex justify-center items-center gap-1.5">
                      {bookingLoading ? (
                        <><span className="material-symbols-outlined animate-spin text-[14px]">sync</span> Booking...</>
                      ) : (
                        <><span className="material-symbols-outlined text-[14px] filled-icon">event_available</span> Confirm Booking</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Recent Consultations */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[320px]">
                <div className="px-3 py-2 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50 backdrop-blur-sm">
                  <h3 className="font-headline-sm text-xs font-bold flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[16px]">history</span> Recent Consultations
                  </h3>
                  <Link to="/appointments" className="text-primary text-[11px] font-bold hover:text-primary-container transition-colors px-1.5 py-0.5 rounded hover:bg-surface-container">View All</Link>
                </div>
                <div className="p-2.5 flex-grow overflow-y-auto space-y-2 custom-scrollbar">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-2.5 border border-outline-variant/30 rounded-xl bg-surface-container-low/30 animate-pulse">
                        <div className="h-3 bg-surface-variant rounded w-1/2 mb-1.5"></div>
                        <div className="h-2.5 bg-surface-variant rounded w-1/3 mb-2"></div>
                        <div className="h-2.5 bg-surface-variant rounded w-3/4"></div>
                      </div>
                    ))
                  ) : appointments.length > 0 ? (
                    appointments.slice(0, 5).map(appt => (
                      <div key={appt._id} className="p-2.5 border border-outline-variant/40 rounded-xl hover:bg-surface-container-lowest bg-surface-container-low/20 transition-all hover:shadow-sm cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">{appt.vetName}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{appt.status}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mb-1.5 font-medium">For {appt.petName}</p>
                        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-bold bg-surface-container-low w-fit px-2 py-1 rounded border border-outline-variant/20 mb-1.5">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {appt.date}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-outline-variant"></span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {appt.time}</span>
                        </div>
                        
                        {(appt.status === 'upcoming' || appt.status === 'pending') && (
                          <div className="flex gap-1.5 mt-1.5">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/live-chat?consultationId=${appt._id}`); }}
                              className="flex-1 bg-surface-container-high border border-outline-variant text-on-surface text-[10px] font-bold py-1.5 px-1.5 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-0.5"
                            >
                              <span className="material-symbols-outlined text-[12px]">chat</span> Chat
                            </button>
                            {appt.consultationType === 'video' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleJoin(appt); }}
                                className="flex-1 bg-primary text-white text-[10px] font-bold py-1.5 px-1.5 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center gap-0.5"
                              >
                                <span className="material-symbols-outlined text-[12px]">videocam</span> Video Call
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                       <span className="material-symbols-outlined text-2xl opacity-30 mb-1">event_note</span>
                       <span className="text-xs font-medium">No recent consultations.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calling Modal */}
        {isCalling && callingAppt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
            <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center shadow-2xl scale-in">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-5xl text-primary">videocam</span>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Calling...</h2>
              <p className="text-on-surface-variant font-medium mb-8">
                Waiting for {callingAppt.vetName} to accept the call
              </p>
              <button 
                onClick={() => {
                  setIsCalling(false);
                  setCallingAppt(null);
                }}
                className="bg-error text-white p-4 rounded-full shadow-lg shadow-error/30 hover:scale-110 transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-2xl">call_end</span>
              </button>
            </div>
          </div>
        )}
    </main>
  );
};

export default OwnerDashboard;
