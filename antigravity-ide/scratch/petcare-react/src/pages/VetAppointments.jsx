import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetSidebar from '../components/VetSidebar';
import TopNav from '../components/TopNav';

const VetAppointments = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [meetLink, setMeetLink] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchAppointments(parsedUser._id);
  }, [navigate]);

  const fetchAppointments = async (vetId) => {
    try {
      const token = localStorage.getItem('vetToken') || localStorage.getItem('userToken') || '';
      const res = await fetch(`http://localhost:5000/api/appointments?vetId=${vetId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleUpdateStatus = async (id, status, meetLinkStr = undefined) => {
    try {
      const token = localStorage.getItem('vetToken') || localStorage.getItem('userToken') || '';
      const payload = { status };
      if (meetLinkStr) payload.meetLink = meetLinkStr;
      
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setAppointments(appointments.map(a => a._id === id ? { ...a, status, meetLink: meetLinkStr || a.meetLink } : a));
        setAcceptingId(null);
        setMeetLink('');
      }
    } catch (err) {
      console.error("Error updating status", err);
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

  if (!user) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <VetSidebar />

      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-12 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Schedule & Appointments" subtitle="Manage your clinical queue and telehealth calls." />

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm ambient-shadow overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="font-headline-sm font-bold text-lg flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary">calendar_month</span> All Appointments
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary text-on-primary rounded font-bold text-xs shadow-sm">Upcoming</button>
              <button className="px-3 py-1.5 bg-surface-container text-on-surface-variant border border-outline-variant/50 rounded font-bold text-xs">Completed</button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
                <span className="font-label-md text-base font-semibold">Loading Schedule...</span>
              </div>
            ) : appointments.length > 0 ? (
              <div className="flex flex-col gap-4">
                {appointments.map(appt => (
                  <div key={appt._id} className={`border rounded-xl p-5 hover:bg-surface-container-low transition-colors ${appt.status === 'upcoming' ? 'border-primary/50 bg-primary/5' : 'border-outline-variant'}`}>
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">

                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-headline-sm font-bold text-lg text-on-surface">{appt.petName} <span className="text-sm font-normal text-on-surface-variant">({appt.petSpecies})</span></h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${appt.status === 'upcoming' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : appt.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
                            {appt.status}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface mb-1"><strong>Parent:</strong> {appt.ownerName} • {appt.ownerPhone}</p>
                        <p className="text-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 mb-3"><strong>Reason:</strong> {appt.reasonForVisit || 'Not specified'}</p>
                        <div className="flex items-center gap-4 text-xs text-on-surface-variant font-bold">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {appt.date}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {appt.time}</span>
                          <span className="flex items-center gap-1 bg-secondary-container/30 text-on-secondary-container px-2 rounded">
                            <span className="material-symbols-outlined text-[14px]">{appt.consultationType === 'video' ? 'videocam' : 'storefront'}</span>
                            {appt.consultationType === 'video' ? 'Telehealth' : 'Clinic'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                        {appt.status === 'pending' && acceptingId !== appt._id && (
                          <button
                            onClick={() => setAcceptingId(appt._id)}
                            className="bg-primary text-white text-xs font-bold py-2 px-3 rounded-lg hover:bg-surface-tint transition-colors flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">check_circle</span> Accept
                          </button>
                        )}
                        {acceptingId === appt._id && (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="url" 
                              placeholder="Paste Google Meet Link" 
                              value={meetLink}
                              onChange={(e) => setMeetLink(e.target.value)}
                              className="border border-outline-variant rounded-lg p-2 text-xs w-full focus:ring-1 focus:ring-primary outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStatus(appt._id, 'upcoming', meetLink)}
                                disabled={!meetLink.trim()}
                                className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 px-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                Done & Save
                              </button>
                              <button
                                onClick={() => setAcceptingId(null)}
                                className="flex-1 bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold py-2 px-2 rounded-lg hover:bg-surface-container transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        {appt.status === 'upcoming' && (
                          <>
                            <button onClick={() => navigate(`/live-chat?consultationId=${appt._id}`)} className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold py-2 px-3 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">chat</span> Message
                            </button>
                            {appt.consultationType === 'video' && (
                              <button 
                                onClick={() => {
                                  if (appt.meetLink) {
                                    window.open(appt.meetLink, '_blank');
                                  } else {
                                    handleJoin(appt);
                                  }
                                }} 
                                disabled={new Date() < new Date(`${appt.date} ${appt.time}`)}
                                className={`text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 ${new Date() < new Date(`${appt.date} ${appt.time}`) ? 'bg-outline-variant cursor-not-allowed' : 'bg-primary hover:bg-surface-tint'}`}
                              >
                                <span className="material-symbols-outlined text-[16px]">videocam</span> Join Meet
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'completed')}
                              className="bg-surface-container-high border border-outline-variant text-on-surface text-xs font-bold py-2 px-3 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span> Mark Done
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appt._id, 'cancelled')}
                              className="text-error text-xs font-bold py-2 px-3 hover:bg-error-container/20 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appt.status === 'completed' && (
                          <button onClick={() => navigate('/prescribe')} className="flex-1 bg-surface-container-low border border-outline-variant text-primary text-xs font-bold py-2 px-3 rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">prescriptions</span> Prescribe
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-2 opacity-50">calendar_month</span>
                <p className="font-bold">No appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VetAppointments;
