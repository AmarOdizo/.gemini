import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const OwnerDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

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

      // Fetch Vets
      try {
        const vetsRes = await fetch(`${API_BASE}/api/vets`);
        if (vetsRes.ok) {
          const vetsData = await vetsRes.json();
          setVets(vetsData.data || []);
          if (vetsData.data && vetsData.data.length > 0) setSelectedVetId(vetsData.data[0]._id || vetsData.data[0].id);
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

  if (!user) return null;

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        <TopNav title={`Welcome back, ${user.name.split(' ')[0]}! 👋`} subtitle="Here's what's happening with your furry friends today." />

        <div className="flex flex-col gap-6 w-full">
          {/* Search Bar */}
          <div className="relative w-full md:w-2/3 lg:w-1/2 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant/50 rounded-2xl font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm hover:shadow-md" 
              placeholder="Search for veterinarians, clinics, or services..." 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-sm text-xl text-on-surface font-black tracking-tight">Your Registered Pets</h3>
                  <Link to="/my-pets" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors px-3 py-1.5 rounded-full hover:bg-surface-container-low">
                    Manage Pets <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                  <Link to="/my-pets" className="min-w-[160px] md:min-w-[200px] bg-surface-container-low border-2 border-dashed border-outline-variant/60 rounded-2xl p-6 flex flex-col items-center justify-center text-primary hover:bg-surface-container hover:border-primary/50 transition-all cursor-pointer shrink-0 snap-start hover:scale-[1.02]">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-80">add_circle</span>
                    <span className="font-label-md font-bold text-sm">Add New Pet</span>
                  </Link>
                  {/* If we had pets to display in the dashboard here, we would map them. Currently it's in the Quick Book section. */}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-headline-sm text-xl text-on-surface font-black tracking-tight">Recommended Veterinarians</h3>
                  <Link to="/find-vets" className="text-primary font-label-md text-xs font-bold hover:text-primary-container transition-colors px-3 py-1.5 rounded-full hover:bg-surface-container-low">View All Doctors &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex gap-4 animate-pulse">
                        <div className="w-16 h-16 rounded-xl bg-surface-variant shrink-0"></div>
                        <div className="flex flex-col gap-2 w-full justify-center">
                          <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                          <div className="h-3 bg-surface-variant rounded w-1/2"></div>
                          <div className="h-3 bg-surface-variant rounded w-1/4 mt-1"></div>
                        </div>
                      </div>
                    ))
                  ) : vets.length > 0 ? (
                    vets.slice(0, 4).map(vet => (
                      <Link to={`/owner-dashboard/vet-profile?id=${vet._id || vet.id}`} key={vet._id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 flex gap-4 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-1">
                        <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop"} alt={vet.name} className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="flex flex-col justify-center">
                          <h4 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{vet.name}</h4>
                          <p className="text-xs text-on-surface-variant font-medium line-clamp-1">{vet.qualification}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                            <span className="material-symbols-outlined text-[14px]">star</span> 4.9
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-4xl opacity-50 mb-2">sentiment_dissatisfied</span>
                      <p className="font-medium text-sm">No recommended vets available.</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Quick Book Consultation Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <div className="p-5 border-b border-outline-variant/20 flex justify-between items-center bg-gradient-to-r from-primary to-primary-container text-on-primary">
                  <h3 className="font-headline-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined filled-icon">bolt</span> Quick Book Consult
                  </h3>
                </div>
                <div className="p-6 relative z-10">
                  <form onSubmit={handleQuickBook} className="flex flex-col gap-5">
                    
                    {/* Select Pet */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">1. Select Pet</label>
                      {loading ? (
                         <div className="flex gap-2"><div className="w-16 h-12 bg-surface-variant animate-pulse rounded-xl"></div></div>
                      ) : pets.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
                          {pets.map(p => (
                            <label key={p._id} className={`shrink-0 cursor-pointer border-2 rounded-xl p-2 flex items-center gap-2.5 transition-all min-w-[130px] snap-start ${selectedPetId === p._id ? 'bg-primary/5 border-primary text-primary shadow-sm scale-[1.02]' : 'border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-low hover:border-outline-variant'}`}>
                              <input type="radio" name="quick_pet" value={p._id} checked={selectedPetId === p._id} onChange={() => setSelectedPetId(p._id)} className="hidden" />
                              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 flex items-center justify-center bg-surface-container">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">pets</span>
                                )}
                              </div>
                              <span className="font-bold text-xs">{p.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-error font-bold p-3 border border-error/30 rounded-xl bg-error-container/20 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">error</span> Register a pet first!
                        </div>
                      )}
                    </div>

                    {/* Select Doctor */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">2. Select Doctor</label>
                      <select value={selectedVetId} onChange={(e) => setSelectedVetId(e.target.value)} required className="border-2 border-outline-variant/40 rounded-xl p-3 text-sm font-semibold text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-surface-container-lowest hover:border-outline-variant transition-colors appearance-none cursor-pointer">
                        {loading ? <option>Loading...</option> : vets.map(v => (
                          <option key={v._id} value={v._id}>{v.name} ({v.specialization?.[0] || 'Vet'})</option>
                        ))}
                      </select>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">3. Date & Time</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border-2 border-outline-variant/40 rounded-xl p-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-colors" />
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="border-2 border-outline-variant/40 rounded-xl p-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-colors" />
                      </div>
                    </div>

                    <button type="submit" disabled={bookingLoading} className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-bold shadow-md hover:bg-primary-container hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-2 mt-2">
                      {bookingLoading ? (
                        <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Booking...</>
                      ) : (
                        <><span className="material-symbols-outlined text-[18px] filled-icon">event_available</span> Confirm Booking</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Recent Consultations */}
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[400px]">
                <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50 backdrop-blur-sm">
                  <h3 className="font-headline-sm font-bold flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-primary">history</span> Recent Consultations
                  </h3>
                  <Link to="/appointments" className="text-primary text-xs font-bold hover:text-primary-container transition-colors px-2 py-1 rounded-md hover:bg-surface-container">View All</Link>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-3 custom-scrollbar">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low/30 animate-pulse">
                        <div className="h-4 bg-surface-variant rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-surface-variant rounded w-1/3 mb-3"></div>
                        <div className="h-3 bg-surface-variant rounded w-3/4"></div>
                      </div>
                    ))
                  ) : appointments.length > 0 ? (
                    appointments.slice(0, 5).map(appt => (
                      <div key={appt._id} className="p-4 border border-outline-variant/40 rounded-2xl hover:bg-surface-container-lowest bg-surface-container-low/20 transition-all hover:shadow-sm cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{appt.vetName}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">{appt.status}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-3 font-medium">For {appt.petName}</p>
                        <div className="flex items-center gap-4 text-[11px] text-on-surface-variant font-bold bg-surface-container-low w-fit px-3 py-1.5 rounded-lg border border-outline-variant/20 mb-3">
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {appt.date}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">schedule</span> {appt.time}</span>
                        </div>
                        
                        {(appt.status === 'upcoming' || appt.status === 'pending') && (
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate(`/live-chat?consultationId=${appt._id}`); }}
                              className="flex-1 bg-surface-container-high border border-outline-variant text-on-surface text-[11px] font-bold py-2 px-2 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">chat</span> Chat
                            </button>
                            {appt.consultationType === 'video' && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/owner-dashboard/video-call/${appt._id}`); }}
                                className="flex-1 bg-primary text-white text-[11px] font-bold py-2 px-2 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">videocam</span> Start Video Call
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                       <span className="material-symbols-outlined text-4xl opacity-30 mb-2">event_note</span>
                       <span className="text-sm font-medium">No recent consultations.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default OwnerDashboard;
