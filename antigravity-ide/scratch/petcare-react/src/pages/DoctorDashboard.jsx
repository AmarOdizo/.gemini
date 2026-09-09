import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import supabase from '../supabaseClient';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    // In a real app we'd verify the role, but here we just assume it's the vet
    setUser(parsedUser);
    const vetId = parsedUser._id || parsedUser.id;
    fetchAppointments(vetId);

    // Setup real-time notifications
    const channel = supabase.channel(`notifications-${vetId}`)
      .on('broadcast', { event: 'new-booking' }, (payload) => {
        setNotification(payload.payload.message);
        fetchAppointments(vetId); // refresh list automatically
        setTimeout(() => setNotification(null), 6000); // hide after 6s
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchAppointments = async (vetId) => {
    try {
      const token = localStorage.getItem('vetToken') || localStorage.getItem('userToken') || '';
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments?vetId=${vetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching vet appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('vetToken') || localStorage.getItem('userToken') || '';
      const payload = { status };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
        
        // Notify the owner
        const appt = appointments.find(a => a._id === id);
        if (appt && appt.ownerId) {
          let message = `Your appointment for ${appt.petName} has been updated.`;
          if (status === 'upcoming') {
            message = `Great news! Dr. ${user.name.split(' ')[0]} has confirmed your appointment for ${appt.petName}.`;
          } else if (status === 'completed') {
            message = `Your consultation for ${appt.petName} with Dr. ${user.name.split(' ')[0]} has been marked as completed.`;
          } else if (status === 'cancelled') {
            message = `Dr. ${user.name.split(' ')[0]} has cancelled the appointment for ${appt.petName}.`;
          }

          const channel = supabase.channel(`notifications-${appt.ownerId}`);
          channel.subscribe((subStatus) => {
            if (subStatus === 'SUBSCRIBED') {
              channel.send({
                type: 'broadcast',
                event: 'status-update',
                payload: { message }
              });
              setTimeout(() => supabase.removeChannel(channel), 1000);
            }
          });
        }
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  if (!user) return null;

  const upcomingAppts = appointments.filter(a => a.status === 'upcoming');
  const pastAppts = appointments.filter(a => a.status !== 'upcoming');

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-surface-container-lowest border-l-4 border-l-primary shadow-xl p-4 rounded-xl flex items-center gap-3 animate-fade-in-up">
            <div className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined filled-icon">notifications_active</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">New Appointment</p>
              <p className="text-xs text-on-surface-variant">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-2 text-on-surface-variant hover:text-error transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}

        <TopNav title={`Welcome, Dr. ${user.name ? user.name.split(' ')[0] : 'Doctor'}! 👋`} subtitle="Here is your clinical schedule for today." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px] filled-icon">event</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Today's Queue</p>
              <p className="text-3xl font-black text-on-surface leading-none">{upcomingAppts.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px] filled-icon">group</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Total Patients</p>
              <p className="text-3xl font-black text-on-surface leading-none">{appointments.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[28px] filled-icon">payments</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Earnings (Est)</p>
              <p className="text-3xl font-black text-on-surface leading-none">₹{appointments.length * (user.consultationFee || 499)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Main Appointment Queue */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm font-black text-xl text-on-surface tracking-tight">Upcoming Appointments</h3>
              <Link to="/vet-appointments" className="text-primary text-xs font-bold hover:text-primary-container px-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors">View All &rarr;</Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm animate-pulse">
                     <div className="flex justify-between mb-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-surface-variant"></div>
                         <div className="flex flex-col gap-2">
                           <div className="w-32 h-4 bg-surface-variant rounded"></div>
                           <div className="w-24 h-3 bg-surface-variant rounded"></div>
                         </div>
                       </div>
                     </div>
                     <div className="w-full h-10 bg-surface-variant rounded-xl mb-4"></div>
                     <div className="flex gap-2"><div className="w-1/2 h-10 bg-surface-variant rounded-xl"></div><div className="w-1/2 h-10 bg-surface-variant rounded-xl"></div></div>
                  </div>
                ))
              ) : upcomingAppts.length > 0 ? (
                upcomingAppts.map(appt => (
                  <div key={appt._id} className="bg-surface-container-lowest border-l-[6px] border-l-primary border border-outline-variant/40 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-lg border border-primary/20 shrink-0">
                          {appt.time}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg md:text-xl text-on-surface mb-0.5">{appt.petName} <span className="text-sm font-medium text-on-surface-variant px-2 py-0.5 bg-surface-container-low rounded-md ml-1">{appt.petSpecies}</span></h4>
                          <p className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px]">person</span> {appt.ownerName} • <span className="material-symbols-outlined text-[14px]">call</span> {appt.ownerPhone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start">
                        {appt.consultationType === 'video' ? (
                          <span className="bg-secondary-container/50 text-on-secondary-container text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] filled-icon">videocam</span> Telehealth
                          </span>
                        ) : (
                          <span className="bg-surface-container text-on-surface-variant text-[11px] px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] filled-icon">storefront</span> Clinic
                          </span>
                        )}
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">{appt.status}</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-low/50 p-3.5 rounded-xl mb-5 text-sm text-on-surface border border-outline-variant/30 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary/20 rounded-l-xl"></div>
                      <strong className="text-on-surface-variant mr-1">Reason:</strong> <span className="font-medium">{appt.reasonForVisit || "Routine checkup"}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)}
                          className="flex-1 bg-surface-container-low text-primary text-sm font-bold py-3 rounded-xl hover:bg-surface-container border border-primary/20 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px] filled-icon">chat</span> Text Consult
                        </button>
                        {appt.consultationType === 'video' && (
                          <button 
                            onClick={() => navigate(`/doctor-dashboard/video-call/${appt._id}`, { state: { appointment: appt } })}
                            className="flex-1 bg-primary text-on-primary text-sm font-bold py-3 rounded-xl hover:bg-primary-container hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px] filled-icon">videocam</span> Start Video Call
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'completed')}
                        className="w-full bg-surface-container text-on-surface text-sm font-bold py-3 rounded-xl hover:bg-surface-container-high hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-[20px] filled-icon">check_circle</span> Complete Appointment
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant/50 border-dashed rounded-3xl p-10 text-center text-on-surface-variant flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-4xl opacity-50">free_cancellation</span>
                  </div>
                  <p className="font-bold">No upcoming appointments in the queue.</p>
                  <p className="text-xs mt-1">Enjoy your free time!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Past */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-6 shadow-sm">
              <h3 className="font-headline-sm font-black mb-4 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/prescribe" className="flex flex-col items-center justify-center gap-2 bg-surface-container-low/50 hover:bg-surface-container border border-outline-variant/30 p-5 rounded-2xl transition-all hover:scale-[1.02] text-primary font-bold text-xs text-center cursor-pointer group shadow-sm">
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">prescriptions</span> New Rx
                </Link>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low/50 hover:bg-surface-container border border-outline-variant/30 p-5 rounded-2xl transition-all hover:scale-[1.02] text-primary font-bold text-xs text-center cursor-pointer group shadow-sm">
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">history</span> Records
                </div>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low/50 hover:bg-surface-container border border-outline-variant/30 p-5 rounded-2xl transition-all hover:scale-[1.02] text-primary font-bold text-xs text-center cursor-pointer group shadow-sm">
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">chat</span> Messages
                </div>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low/50 hover:bg-surface-container border border-outline-variant/30 p-5 rounded-2xl transition-all hover:scale-[1.02] text-primary font-bold text-xs text-center cursor-pointer group shadow-sm">
                  <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">calendar_month</span> Schedule
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[400px]">
               <div className="p-5 border-b border-outline-variant/30 bg-surface-container-low/50">
                 <h3 className="font-headline-sm font-black tracking-tight flex items-center gap-2 text-on-surface">
                   <span className="material-symbols-outlined text-primary">done_all</span> Recently Completed
                 </h3>
               </div>
              <div className="p-4 flex-grow overflow-y-auto space-y-3 custom-scrollbar">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 border border-outline-variant/30 rounded-2xl bg-surface-container-low/30 animate-pulse">
                        <div className="h-4 bg-surface-variant rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-surface-variant rounded w-1/3 mb-3"></div>
                      </div>
                    ))
                ) : pastAppts.slice(0, 5).map(appt => (
                  <div key={appt._id} className="p-4 border border-outline-variant/40 rounded-2xl bg-surface-container-low/20 hover:bg-surface-container-lowest transition-all hover:shadow-sm cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{appt.petName}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full tracking-wider">Done</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span> {appt.ownerName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-bold bg-surface-container-low w-fit px-2 py-1 rounded-lg border border-outline-variant/20 mt-2">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">calendar_today</span> {appt.date}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {appt.time}</span>
                    </div>
                  </div>
                ))}
                {!loading && pastAppts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl opacity-30 mb-2">history</span>
                    <p className="text-sm font-medium">No completed appointments yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default DoctorDashboard;
