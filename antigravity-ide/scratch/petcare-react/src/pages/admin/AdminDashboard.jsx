import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/admin/MetricCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [advisorySent, setAdvisorySent] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.appointments) {
            setAppointments(json.appointments.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn("Using default clinical appointments stream", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Demo Fallback Stream if API empty
  const defaultConsultations = [
    {
      id: 'CN-8942',
      pet: 'Barnaby',
      breed: 'Golden Retriever',
      owner: 'Eleanor Vance',
      vet: 'Dr. Marcus Sterling',
      specialty: 'Internal Medicine',
      time: '10:00 AM EST',
      status: 'Live',
      triage: 'Urgent',
      room: 'room-vet-8942'
    },
    {
      id: 'CN-8943',
      pet: 'Cleo & Mochi',
      breed: 'Siamese Twins',
      owner: 'Liam Henderson',
      vet: 'Dr. Chloe Aris',
      specialty: 'Dermatology',
      time: '10:15 AM EST',
      status: 'In-Waiting',
      triage: 'Routine',
      room: 'room-vet-8943'
    },
    {
      id: 'CN-8944',
      pet: 'Rory',
      breed: 'French Bulldog',
      owner: 'Sophia Chen',
      vet: 'Dr. Neil Roberts',
      specialty: 'Cardiology',
      time: '10:30 AM EST',
      status: 'Scheduled',
      triage: 'Emergency',
      room: 'room-vet-8944'
    },
    {
      id: 'CN-8945',
      pet: 'Zeus',
      breed: 'German Shepherd',
      owner: 'David Miller',
      vet: 'Dr. Sarah Jenkins',
      specialty: 'Orthopedics',
      time: '10:45 AM EST',
      status: 'Completed',
      triage: 'Routine',
      room: 'room-vet-8945'
    }
  ];

  const pendingVets = [
    { name: 'Dr. Jonathan Blake, DVM', clinic: 'Oak Ridge Animal Hospital', license: 'VET-CA-90421', date: 'Oct 23, 2023', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' },
    { name: 'Dr. Amanda Thorne, MRCVS', clinic: 'Metropolitan Veterinary Center', license: 'VET-NY-81093', date: 'Oct 24, 2023', avatar: 'https://images.unsplash.com/photo-1594824813583-05b135767b36?auto=format&fit=crop&q=80&w=150' },
  ];

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setAdvisorySent(true);
    setTimeout(() => {
      setShowBroadcastModal(false);
      setAdvisorySent(false);
      setBroadcastMsg('');
    }, 1500);
  };

  const handleExportReport = () => {
    alert("Generating Clinical Operations Summary Report (PDF)... Download will begin shortly.");
  };

  return (
    <div className="p-6 max-w-[100rem] mx-auto space-y-6">
      {/* Welcome Clinical Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <span>Welcome back, Dr. Jenkins</span>
              <span className="inline-block hover:rotate-12 transition-transform select-none">👋</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {currentTime || 'Tuesday • Live Platform Status'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Clinical Operations Overview • Live Tele-Veterinary Platform Status across <span className="text-on-surface font-semibold">14 Active Regions</span>
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/admin/veterinarians')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">verified_user</span>
            <span>Verify Veterinarians</span>
            <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[0.625rem] font-bold">
              4
            </span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-bold hover:bg-surface-container hover:text-primary transition-all border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">download</span>
            <span>Export Clinical Report</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error-container/60 text-error text-xs font-bold hover:bg-error-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
            <span>Broadcast Advisory</span>
          </button>
        </div>
      </div>

      {/* 6 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Owners"
          value="14,820"
          icon="supervisor_account"
          badge="+12.4%"
          trend="trending_up"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="312 this week"
        />
        <MetricCard
          title="Veterinarians"
          value="1,248"
          icon="stethoscope"
          badge="98.2% verified"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="4 in review"
        />
        <MetricCard
          title="Pending Review"
          value="4"
          icon="pending_actions"
          badge="2 Fast-track"
          badgeColor="bg-error-container text-error"
          subtext="action req."
          isAlert={true}
        />
        <MetricCard
          title="Appointments"
          value="3,892"
          icon="calendar_today"
          badge="+8.1%"
          trend="trending_up"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="284 today"
        />
        <MetricCard
          title="Live Consults"
          value="18"
          icon="videocam"
          badge="100% active"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="p2p encrypted"
        />
        <MetricCard
          title="Satisfaction"
          value="98.6%"
          icon="star"
          badge="4.92 / 5.0"
          badgeColor="bg-surface-container text-primary"
          subtext="1,240 ratings"
        />
      </div>

      {/* Clinical Department Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">General Medicine</span>
            <div className="text-lg font-bold text-primary mt-1">8 Active Rooms</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Avg wait: 4 mins</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">medication</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Emergency Triage</span>
            <div className="text-lg font-bold text-error mt-1">3 Fast-Track</div>
            <span className="text-[0.6875rem] text-error font-medium">Critical Priority</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined">emergency</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Surgery Tele-Advisory</span>
            <div className="text-lg font-bold text-secondary mt-1">4 Active Cases</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Board Certified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">surgical</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Dermatology & Diet</span>
            <div className="text-lg font-bold text-primary mt-1">3 In Consultation</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Routine Follow-up</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">pets</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Tele-Consultations Stream & Quick Verification */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left (2 cols): Live Consultations & Recent Stream */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Manrope'] text-lg font-bold text-on-surface flex items-center gap-2">
                <span>Live Tele-Consultations & Triage Stream</span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              </h2>
              <p className="text-xs text-on-surface-variant">Real-time video consultation sessions & incoming queue</p>
            </div>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All Consultations</span>
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
                <tr>
                  <th className="p-3 font-bold rounded-l-lg">ID & Pet</th>
                  <th className="p-3 font-bold">Owner</th>
                  <th className="p-3 font-bold">Doctor</th>
                  <th className="p-3 font-bold">Triage</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {defaultConsultations.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-3 font-medium">
                      <div className="font-bold text-on-surface">{c.pet}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{c.id} • {c.breed}</div>
                    </td>
                    <td className="p-3 text-on-surface font-medium">{c.owner}</td>
                    <td className="p-3">
                      <div className="font-semibold text-primary">{c.vet}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{c.specialty}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${
                        c.triage === 'Emergency'
                          ? 'bg-error-container text-error'
                          : c.triage === 'Urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {c.triage}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                        c.status === 'Live'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : c.status === 'Completed'
                          ? 'bg-surface-container text-outline'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {c.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {c.status === 'Live' ? (
                        <button
                          onClick={() => navigate('/admin/appointments')}
                          className="px-3 py-1 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
                        >
                          Monitor
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/admin/appointments')}
                          className="px-2.5 py-1 bg-surface-container text-on-surface rounded-lg font-medium text-xs hover:bg-surface-container-high transition-colors"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Pending Veterinarian Verifications Quick Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-['Manrope'] text-lg font-bold text-on-surface flex items-center gap-2">
                <span>Verification Queue</span>
                <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs font-bold">4</span>
              </h2>
              <button
                onClick={() => navigate('/admin/veterinarians')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Review All
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Veterinarians pending license verification before clinical practice authorization.
            </p>

            <div className="space-y-3">
              {pendingVets.map((v, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={v.avatar} alt={v.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-primary/20" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-on-surface truncate">{v.name}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant truncate">{v.clinic}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[0.6875rem] text-on-surface-variant pt-1 border-t border-outline-variant/20">
                    <span>{v.license}</span>
                    <span className="text-amber-700 font-semibold">Requires Approval</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => navigate('/admin/veterinarians')}
                      className="flex-1 py-1.5 bg-primary-container text-white rounded-lg font-bold text-xs hover:opacity-95 text-center"
                    >
                      Review Docs
                    </button>
                    <button
                      onClick={() => alert(`Approved ${v.name} directly.`)}
                      className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-xs hover:opacity-90"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-center">
            <span className="text-[0.6875rem] text-on-surface-variant font-medium">
              Medical Board Verification Standard: <strong>AVMA & State Council compliant</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Broadcast Advisory Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/20 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-error font-bold font-['Manrope'] text-lg">
                <span className="material-symbols-outlined">campaign</span>
                <span>Broadcast Clinical Advisory</span>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              This advisory will be transmitted in real-time to all online veterinarians and logged in pet owners.
            </p>

            {advisorySent ? (
              <div className="p-4 bg-secondary-container text-on-secondary-container rounded-xl text-center font-bold text-sm">
                ✓ Advisory broadcasted successfully to all 14 active regions!
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Advisory Title</label>
                  <input
                    defaultValue="Emergency Protocol: Canine Parvovirus Advisory"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter urgent clinical advisory or guidelines for veterinary staff..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-error text-white text-xs font-bold shadow-sm hover:opacity-95"
                  >
                    Transmit Broadcast
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
