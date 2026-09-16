import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import supabase from '../supabaseClient';
import { isVetSuspended } from '../utils/suspensionUtils';

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
    setUser(parsedUser);
    const vetId = parsedUser._id || parsedUser.id;
    fetchAppointments(vetId);

    // Setup real-time notifications for bookings and admin status updates
    const channel = supabase.channel(`notifications-${vetId}`)
      .on('broadcast', { event: '*' }, (payload) => {
        if (payload.payload) {
          setNotification(payload.payload.message || payload.payload.title);
          setTimeout(() => setNotification(null), 8000);
        }
        fetchAppointments(vetId);
      })
      .subscribe();

    const handleSync = (e) => {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      if (e?.detail?.notification) {
        setNotification(e.detail.notification.message);
        setTimeout(() => setNotification(null), 8000);
      }
    };

    window.addEventListener('petcare_vets_updated', handleSync);
    window.addEventListener('petcare_doctor_notification', handleSync);
    window.addEventListener('petcare_user_updated', handleSync);

    return () => {
      window.removeEventListener('petcare_vets_updated', handleSync);
      window.removeEventListener('petcare_doctor_notification', handleSync);
      window.removeEventListener('petcare_user_updated', handleSync);
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

  const upcomingAppts = appointments.filter(a => a.status === 'upcoming' || a.status === 'pending');
  const pastAppts = appointments.filter(a => a.status !== 'upcoming');

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
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

        {isVetSuspended(user) ? (
          <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 mt-0.5">
                <span className="material-symbols-outlined text-lg">block</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-error text-white font-black text-[9px] uppercase tracking-wider">
                    Account Suspended
                  </span>
                  <span className="text-[11px] font-bold text-red-800">Clinical Administration Compliance</span>
                </div>
                <p className="text-[11px] text-red-700 font-medium mt-0.5">
                  Your veterinary practice profile is currently hidden from pet owners and appointment booking is blocked.
                </p>
              </div>
            </div>
            <Link to="/doctor-profile" className="px-3 py-1.5 bg-error text-white rounded-lg text-[11px] font-bold hover:opacity-95 shadow-sm shrink-0 whitespace-nowrap">
              View Details
            </Link>
          </div>
        ) : user.status === 'rejected' ? (
          <div className="p-3 sm:p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-rose-700 text-white font-black text-[9px] uppercase tracking-wider">
                    Verification Disapproved
                  </span>
                  <span className="text-[11px] font-bold text-rose-800">Review Required</span>
                </div>
                <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                  {user.rejectionReason ? `Reason: ${user.rejectionReason}` : 'Your credentials could not be verified. Please update your documents.'}
                </p>
              </div>
            </div>
            <Link to="/doctor-profile" className="px-3 py-1.5 bg-rose-700 text-white rounded-lg text-[11px] font-bold hover:opacity-95 shadow-sm shrink-0 whitespace-nowrap">
              Update Profile
            </Link>
          </div>
        ) : (user.status === 'pending' || user.isVerified === false) ? (
          <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200 mt-0.5">
                <span className="material-symbols-outlined text-lg">hourglass_top</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider">
                    Pending Verification
                  </span>
                  <span className="text-[11px] font-bold text-amber-800">Admin Queue</span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                  Your account is awaiting document verification by the Admin. Profile is hidden until approved.
                </p>
              </div>
            </div>
            <Link to="/doctor-profile" className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:opacity-95 shadow-sm shrink-0 whitespace-nowrap">
              Review Profile
            </Link>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow transition-shadow group">
            <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px] filled-icon">event</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">Today's Queue</p>
              <p className="text-xl font-black text-on-surface leading-none">{upcomingAppts.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow transition-shadow group">
            <div className="w-10 h-10 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px] filled-icon">group</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">Total Patients</p>
              <p className="text-xl font-black text-on-surface leading-none">{appointments.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/40 p-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow transition-shadow group">
            <div className="w-10 h-10 rounded-lg bg-emerald-100/50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
              <span className="material-symbols-outlined text-[20px] filled-icon">payments</span>
            </div>
            <div>
              <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">Earnings (Est)</p>
              <p className="text-xl font-black text-on-surface leading-none">₹{appointments.length * (user.consultationFee || 499)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Appointment Queue */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm font-black text-sm text-on-surface tracking-tight">Upcoming Appointments</h3>
              <Link to="/vet-appointments" className="text-primary text-[11px] font-bold hover:text-primary-container px-2 py-1 rounded-full hover:bg-surface-container-low transition-colors">View All &rarr;</Link>
            </div>

            <div className="space-y-3">
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
                upcomingAppts.map(appt => {
                  const isEmergency = appt.triage === 'emergency';
                  const isPending = appt.status === 'pending';
                  return (
                  <div key={appt._id} className={`border-l-[4px] border border-outline-variant/40 rounded-xl p-3 shadow-sm hover:shadow transition-all relative overflow-hidden ${isEmergency && isPending ? 'border-l-red-600 bg-red-50/50 animate-pulse-slow' : isEmergency ? 'border-l-red-600 bg-surface-container-lowest' : 'border-l-primary bg-surface-container-lowest'}`}>
                    {isEmergency && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg shadow-sm flex items-center gap-1 tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">emergency</span> EMERGENCY
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border shrink-0 ${isEmergency ? 'bg-red-100 text-red-700 border-red-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {appt.time === 'IMMEDIATE' ? (
                            <span className="material-symbols-outlined text-[18px]">bolt</span>
                          ) : (
                            appt.time
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-on-surface mb-0.5">{appt.petName} <span className="text-[10px] font-medium text-on-surface-variant px-1.5 py-0.5 bg-surface-container-low rounded ml-1">{appt.petSpecies}</span></h4>
                          <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">person</span> {appt.ownerName} • <span className="material-symbols-outlined text-[12px]">call</span> {appt.ownerPhone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 self-start mt-1 md:mt-0">
                        {appt.consultationType === 'video' ? (
                          <span className="bg-secondary-container/50 text-on-secondary-container text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] filled-icon">videocam</span> Telehealth
                          </span>
                        ) : (
                          <span className="bg-surface-container text-on-surface-variant text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] filled-icon">storefront</span> Clinic
                          </span>
                        )}
                        {isPending ? (
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Pending</span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{appt.status}</span>
                        )}
                      </div>
                    </div>

                    <div className="bg-surface-container-low/50 p-2 rounded-lg mb-3 text-[11px] text-on-surface border border-outline-variant/30 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary/20 rounded-l-lg"></div>
                      <strong className="text-on-surface-variant mr-1 ml-1">Reason:</strong> <span className="font-medium">{appt.reasonForVisit || "Routine checkup"}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(appt._id, 'upcoming')}
                            className="flex-1 bg-emerald-600 text-white text-[11px] font-bold py-1.5 rounded-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Accept Booking
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                            className="flex-1 bg-surface-container border border-outline-variant/50 text-error text-[11px] font-bold py-1.5 rounded-lg hover:bg-surface-container-high transition-all flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">cancel</span> Decline
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)}
                              className="flex-1 bg-surface-container-low text-primary text-[11px] font-bold py-1.5 rounded-lg hover:bg-surface-container border border-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[14px] filled-icon">chat</span> Text Consult
                            </button>
                            {appt.consultationType === 'video' && (
                              <button 
                                onClick={() => navigate(`/doctor-dashboard/video-call/${appt._id}`, { state: { appointment: appt } })}
                                className="flex-1 bg-primary text-on-primary text-[11px] font-bold py-1.5 rounded-lg hover:bg-primary-container hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1">
                                <span className="material-symbols-outlined text-[14px] filled-icon">videocam</span> Start Video Call
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => handleUpdateStatus(appt._id, 'completed')}
                            className="w-full bg-surface-container text-on-surface text-[11px] font-bold py-1.5 rounded-lg hover:bg-surface-container-high hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1 border border-outline-variant/30"
                          >
                            <span className="material-symbols-outlined text-[14px] filled-icon">check_circle</span> Complete Appointment
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )})
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant/50 border-dashed rounded-xl p-6 text-center text-on-surface-variant flex flex-col items-center justify-center h-[200px]">
                  <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-2">
                    <span className="material-symbols-outlined text-2xl opacity-50">free_cancellation</span>
                  </div>
                  <p className="text-xs font-bold">No upcoming appointments.</p>
                  <p className="text-[10px] mt-0.5">Enjoy your free time!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Past */}
          <div className="flex flex-col gap-3">
            <Link to="/prescribe" className="w-full bg-primary text-on-primary hover:bg-surface-tint rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-white">prescriptions</span>
                </div>
                <div>
                  <h3 className="font-headline-sm font-black text-white text-sm tracking-tight">New Prescription</h3>
                  <p className="text-white/80 text-[10px] font-medium">Quick Rx Gen</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-white opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sm">arrow_forward</span>
            </Link>

            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm overflow-hidden flex flex-col h-[320px]">
               <div className="p-3 border-b border-outline-variant/30 bg-surface-container-low/50">
                 <h3 className="font-headline-sm font-black text-xs tracking-tight flex items-center gap-1.5 text-on-surface">
                   <span className="material-symbols-outlined text-primary text-[16px]">done_all</span> Recently Completed
                 </h3>
               </div>
              <div className="p-2.5 flex-grow overflow-y-auto space-y-2 custom-scrollbar">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-3 border border-outline-variant/30 rounded-lg bg-surface-container-low/30 animate-pulse">
                        <div className="h-3 bg-surface-variant rounded w-1/2 mb-1.5"></div>
                        <div className="h-2.5 bg-surface-variant rounded w-1/3 mb-2"></div>
                      </div>
                    ))
                ) : pastAppts.slice(0, 5).map(appt => (
                  <div key={appt._id} className="p-3 border border-outline-variant/40 rounded-lg bg-surface-container-low/20 hover:bg-surface-container-lowest transition-all hover:shadow-sm cursor-pointer group">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">{appt.petName}</span>
                      <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded tracking-wider">Done</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">person</span> {appt.ownerName}</p>
                    <div className="flex items-center gap-2 text-[9px] text-on-surface-variant font-bold bg-surface-container-low w-fit px-1.5 py-0.5 rounded border border-outline-variant/20 mt-1.5">
                          <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">calendar_today</span> {appt.date}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-outline-variant"></span>
                          <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-[10px]">schedule</span> {appt.time}</span>
                    </div>
                  </div>
                ))}
                {!loading && pastAppts.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                    <span className="material-symbols-outlined text-2xl opacity-30 mb-1">history</span>
                    <p className="text-[11px] font-medium">No past appointments.</p>
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
