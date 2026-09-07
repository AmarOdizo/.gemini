import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const DoctorDashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
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
    fetchAppointments(parsedUser._id);
  }, [navigate]);

  const fetchAppointments = async (vetId) => {
    try {
      // Fetching all consultations for this vet
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations?vetId=${vetId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching vet appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAppointments(appointments.map(a => a._id === id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  if (!user) return null;

  const upcomingAppts = appointments.filter(a => a.status === 'upcoming');
  const pastAppts = appointments.filter(a => a.status !== 'upcoming');

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title={`Welcome, ${user.name || 'Doctor'}! 👋`} subtitle="Here is your clinical schedule for today." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/30 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">event</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Today's Queue</p>
              <p className="text-2xl font-bold text-on-surface">{upcomingAppts.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Total Patients</p>
              <p className="text-2xl font-bold text-on-surface">{appointments.length}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Earnings (Est)</p>
              <p className="text-2xl font-bold text-on-surface">₹{appointments.length * (user.consultationFee || 499)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          {/* Main Appointment Queue */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface-container-lowest p-4 border border-outline-variant rounded-xl shadow-sm">
              <h3 className="font-headline-sm font-bold text-lg">Upcoming Appointments</h3>
              <Link to="/vet-appointments" className="text-primary text-xs font-bold hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
                </div>
              ) : upcomingAppts.length > 0 ? (
                upcomingAppts.map(appt => (
                  <div key={appt._id} className="bg-surface-container-lowest border-l-4 border-l-primary border-t border-b border-r border-outline-variant rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center text-primary font-bold">
                          {appt.time}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{appt.petName} <span className="text-sm font-normal text-on-surface-variant">({appt.petSpecies})</span></h4>
                          <p className="text-xs text-on-surface-variant">Parent: {appt.ownerName} • {appt.ownerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {appt.consultationType === 'video' ? (
                          <span className="bg-secondary-container/50 text-on-secondary-container text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">videocam</span> Telehealth
                          </span>
                        ) : (
                          <span className="bg-surface-container-high text-on-surface-variant text-xs px-2 py-1 rounded font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">storefront</span> Clinic
                          </span>
                        )}
                        <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold uppercase">{appt.status}</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-3 rounded-lg mb-4 text-sm text-on-surface border border-outline-variant/30">
                      <strong>Reason for Visit:</strong> {appt.reasonForVisit || "Routine checkup"}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant/50">
                      <button 
                        onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)}
                        className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">play_circle</span> Start Consultation
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt._id, 'completed')}
                        className="flex-1 bg-surface-container text-on-surface text-xs font-bold py-2 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span> Mark Complete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-xl p-8 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">free_cancellation</span>
                  <p>No upcoming appointments in the queue.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions & Past */}
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
              <h3 className="font-headline-sm font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/prescribe" className="flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-4 rounded-xl transition-colors text-primary font-bold text-xs text-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl">prescriptions</span> New Rx
                </Link>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-4 rounded-xl transition-colors text-primary font-bold text-xs text-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl">history</span> Medical Records
                </div>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-4 rounded-xl transition-colors text-primary font-bold text-xs text-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl">chat</span> Messages
                </div>
                <div className="flex flex-col items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 p-4 rounded-xl transition-colors text-primary font-bold text-xs text-center cursor-pointer">
                  <span className="material-symbols-outlined text-2xl">calendar_month</span> Schedule
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex-grow">
              <h3 className="font-headline-sm font-bold mb-4">Recently Completed</h3>
              <div className="space-y-3">
                {pastAppts.slice(0, 3).map(appt => (
                  <div key={appt._id} className="p-3 border border-outline-variant/50 rounded-lg bg-surface-container-low">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">{appt.petName}</span>
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">Completed</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">Parent: {appt.ownerName}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{appt.date} • {appt.time}</p>
                  </div>
                ))}
                {pastAppts.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-4">No completed appointments yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default DoctorDashboard;
