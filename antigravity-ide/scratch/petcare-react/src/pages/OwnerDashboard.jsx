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
      const [apptsRes, vetsRes, petsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations?ownerId=${currentUser._id || currentUser.id}`),
        fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets`),
        fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/pets?ownerId=${currentUser._id || currentUser.id}`)
      ]);

      if (apptsRes.ok) {
        const apptsData = await apptsRes.json();
        setAppointments(apptsData.data || []);
      }

      if (vetsRes.ok) {
        const vetsData = await vetsRes.json();
        setVets(vetsData.data || []);
        if (vetsData.data && vetsData.data.length > 0) setSelectedVetId(vetsData.data[0]._id);
      }
      
      if (petsRes.ok) {
        const petsData = await petsRes.json();
        setPets(petsData.data || []);
        if (petsData.data && petsData.data.length > 0) setSelectedPetId(petsData.data[0]._id);
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
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
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title={`Welcome back, ${user.name.split(' ')[0]}! 👋`} subtitle="Here's what's happening with your furry friends today." />

        <div className="flex flex-col gap-6 w-full">
          {/* Search Bar */}
          <div className="relative w-full md:w-2/3 lg:w-1/2">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm" 
              placeholder="Search for veterinarians, clinics, or services..." 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-sm text-xl text-on-surface font-bold">Your Registered Pets</h3>
                  <Link to="/my-pets" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    Manage Pets <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  <Link to="/my-pets" className="min-w-[200px] bg-surface-container-low border border-dashed border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0">
                    <span className="material-symbols-outlined text-3xl mb-2">add_circle</span>
                    <span className="font-label-md font-bold text-sm">Add New Pet</span>
                  </Link>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-headline-sm text-xl text-on-surface font-bold">Recommended Veterinarians</h3>
                  <Link to="/find-vets" className="text-primary font-label-md text-xs font-bold hover:underline">View All Doctors &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="col-span-full py-8 flex flex-col items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-primary text-3xl mb-2">sync</span>
                      <span className="font-label-md text-sm font-semibold">Loading recommended specialists...</span>
                    </div>
                  ) : vets.length > 0 ? (
                    vets.slice(0, 4).map(vet => (
                      <div key={vet._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
                        <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop"} alt={vet.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-bold text-on-surface">{vet.name}</h4>
                          <p className="text-xs text-on-surface-variant line-clamp-1">{vet.qualification}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-primary">
                            <span className="material-symbols-outlined text-[14px]">star</span> 4.9
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-on-surface-variant">No vets available.</div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Quick Book Consultation Widget */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm ambient-shadow overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
                  <h3 className="font-headline-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">bolt</span> Quick Book Consultation
                  </h3>
                </div>
                <div className="p-5">
                  <form onSubmit={handleQuickBook} className="flex flex-col gap-4">
                    
                    {/* Select Pet */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface uppercase tracking-wider">1. Select Pet</label>
                      {pets.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {pets.map(p => (
                            <label key={p._id} className={`shrink-0 cursor-pointer border rounded-lg p-1.5 flex items-center gap-2 transition-all min-w-[120px] ${selectedPetId === p._id ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}>
                              <input type="radio" name="quick_pet" value={p._id} checked={selectedPetId === p._id} onChange={() => setSelectedPetId(p._id)} className="hidden" />
                              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-outline-variant/30 flex items-center justify-center bg-surface-container">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">pets</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs leading-tight">{p.name}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-error font-bold p-2 border border-error/50 rounded-lg bg-error/10">Register a pet first!</div>
                      )}
                    </div>

                    {/* Select Doctor */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface uppercase tracking-wider">2. Select Doctor</label>
                      <select value={selectedVetId} onChange={(e) => setSelectedVetId(e.target.value)} required className="border border-outline-variant rounded-lg p-2.5 text-sm font-semibold text-on-surface focus:border-primary outline-none bg-surface-container-lowest">
                        {vets.map(v => (
                          <option key={v._id} value={v._id}>{v.name} ({v.specialization?.[0] || 'Vet'})</option>
                        ))}
                      </select>
                    </div>

                    {/* Date & Time */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface uppercase tracking-wider">3. Date & Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="border border-outline-variant rounded-lg p-2 text-sm font-semibold text-on-surface outline-none" />
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="border border-outline-variant rounded-lg p-2 text-sm font-semibold text-on-surface outline-none" />
                      </div>
                    </div>

                    <button type="submit" disabled={bookingLoading} className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold shadow-md hover:bg-surface-tint transition-all flex justify-center items-center gap-2 mt-2">
                      {bookingLoading ? (
                        <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Booking...</>
                      ) : (
                        <><span className="material-symbols-outlined text-[18px]">event_available</span> Quick Book Now</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm ambient-shadow overflow-hidden flex flex-col h-[400px]">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h3 className="font-headline-sm font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span> Recent Consultations
                  </h3>
                  <Link to="/appointments" className="text-primary text-xs font-bold hover:underline">View All</Link>
                </div>
                <div className="p-4 flex-grow overflow-y-auto space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                    </div>
                  ) : appointments.length > 0 ? (
                    appointments.slice(0, 5).map(appt => (
                      <div key={appt._id} className="p-3 border border-outline-variant/50 rounded-lg hover:bg-surface-container-low transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-sm text-on-surface">{appt.vetName}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">{appt.status}</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-2">For {appt.petName}</p>
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {appt.date}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {appt.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-on-surface-variant text-sm">
                      No recent consultations.
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
