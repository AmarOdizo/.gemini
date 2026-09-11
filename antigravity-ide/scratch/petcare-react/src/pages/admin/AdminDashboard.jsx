import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../../components/admin/MetricCard';
import VetVerificationModal from '../../components/admin/VetVerificationModal';
import { adminApi } from '../../services/adminApi';
import { notifyDoctorStatusChange } from '../../utils/suspensionUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [pendingVets, setPendingVets] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOwners: { value: '...', trend: '+12.4%', subtext: 'loading from db...' },
    veterinarians: { value: '...', verifiedPercentage: '...', pendingReview: 0 },
    pendingReview: { value: '...', fastTrack: 0, isAlert: false },
    appointments: { value: '...', trend: '+8.1%', todayCount: 0 },
    liveConsultations: { value: '...', encrypted: true, activePercentage: '100%' },
    satisfaction: { rating: '...', score: '...', totalRatings: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState('high');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [advisorySent, setAdvisorySent] = useState(false);
  const [selectedVetForReview, setSelectedVetForReview] = useState(null);

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

  const loadDashboardFromDatabase = async () => {
    try {
      setLoading(true);
      // 1. Fetch Metrics from MongoDB Collections
      const metricsRes = await adminApi.getMetrics();
      if (metricsRes?.success && metricsRes?.metrics) {
        setMetrics(metricsRes.metrics);
      }

      // 2. Fetch Live & Scheduled Appointments from MongoDB appointments table
      const apptRes = await adminApi.getAppointments();
      if (apptRes?.success && apptRes?.appointments) {
        setAppointments(apptRes.appointments.slice(0, 6));
      }

      // 3. Fetch Pending Vets from MongoDB vets table
      const vetRes = await adminApi.getVets();
      if (vetRes?.success && vetRes?.vets) {
        const pending = vetRes.vets.filter((v) => v.status === 'pending');
        setPendingVets(pending);
      }
    } catch (err) {
      console.error("Error fetching admin table data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardFromDatabase();

    const handleAdminSync = () => {
      loadDashboardFromDatabase();
    };

    window.addEventListener('petcare_admin_notification', handleAdminSync);
    window.addEventListener('petcare_vets_updated', handleAdminSync);
    return () => {
      window.removeEventListener('petcare_admin_notification', handleAdminSync);
      window.removeEventListener('petcare_vets_updated', handleAdminSync);
    };
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    try {
      await adminApi.broadcastAdvisory({
        title: broadcastTitle || 'Emergency Clinical Protocol Alert',
        message: broadcastMsg,
        urgency: broadcastUrgency,
        targetAudience: 'all'
      });
      setAdvisorySent(true);
      setTimeout(() => {
        setShowBroadcastModal(false);
        setAdvisorySent(false);
        setBroadcastMsg('');
        setBroadcastTitle('');
      }, 1200);
    } catch (err) {
      alert("Error broadcasting: " + err.message);
    }
  };

  const handleQuickApproveVet = async (vetId, vetName) => {
    try {
      await adminApi.verifyVet(vetId, 'approve');
      notifyDoctorStatusChange(vetId, vetName, 'approve');
      alert(`Dr. ${vetName} has been approved in MongoDB vets table!`);
      loadDashboardFromDatabase();
    } catch (err) {
      alert("Error approving vet: " + err.message);
    }
  };

  const handleModalApprove = async (vetId, vetName) => {
    try {
      await adminApi.verifyVet(vetId, 'approve');
      notifyDoctorStatusChange(vetId, vetName, 'approve');
      alert(`Dr. ${vetName} credentials verified & approved! Notification delivered.`);
      setSelectedVetForReview(null);
      loadDashboardFromDatabase();
    } catch (err) {
      alert("Error approving vet: " + err.message);
    }
  };

  const handleModalReject = async (vetId, reason, vetName) => {
    try {
      await adminApi.verifyVet(vetId, 'reject', reason || 'Missing accreditation documents');
      notifyDoctorStatusChange(vetId, vetName, 'reject', reason);
      alert(`Dr. ${vetName} has been marked as Disapproved.`);
      setSelectedVetForReview(null);
      loadDashboardFromDatabase();
    } catch (err) {
      alert("Error disapproving vet: " + err.message);
    }
  };

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-[100rem] mx-auto space-y-4 sm:space-y-6">
      {/* Welcome Clinical Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-['Manrope'] text-xl sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
              <span>Welcome back, Admin</span>
              <span className="inline-block hover:rotate-12 transition-transform select-none">👋</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[0.6875rem] sm:text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {currentTime || 'Tuesday • Live Connected'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Clinical Operations Dashboard • Serving Live Data from <span className="text-primary font-bold">MongoDB Atlas</span>
          </p>
        </div>

        {/* Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/admin/veterinarians')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary-container text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">verified_user</span>
            <span>Verify Vets</span>
            <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[0.625rem] font-bold">
              {pendingVets.length}
            </span>
          </button>

          <button
            onClick={() => navigate('/admin/reports')}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-bold hover:bg-surface-container hover:text-primary transition-all border border-outline-variant/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">download</span>
            <span>Export Report</span>
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-error-container/60 text-error text-xs font-bold hover:bg-error-container transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
            <span>Broadcast Advisory</span>
          </button>
        </div>
      </div>

      {/* 6 Primary Metric Cards directly from Database Collections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        <MetricCard
          title="Total Owners"
          value={metrics.totalOwners?.value?.toString() || '0'}
          icon="supervisor_account"
          badge={metrics.totalOwners?.trend || '+12.4%'}
          trend="trending_up"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext={metrics.totalOwners?.subtext || 'In users table'}
        />
        <MetricCard
          title="Veterinarians"
          value={metrics.veterinarians?.value?.toString() || '0'}
          icon="stethoscope"
          badge={`${metrics.veterinarians?.verifiedPercentage || '98%'} verified`}
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext={`${metrics.veterinarians?.pendingReview || 0} in review`}
        />
        <MetricCard
          title="Pending Review"
          value={pendingVets.length.toString()}
          icon="pending_actions"
          badge={`${pendingVets.length} Action Req.`}
          badgeColor="bg-error-container text-error"
          subtext="vets table"
          isAlert={pendingVets.length > 0}
        />
        <MetricCard
          title="Appointments"
          value={metrics.appointments?.value?.toString() || '0'}
          icon="calendar_today"
          badge={metrics.appointments?.trend || '+8.1%'}
          trend="trending_up"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="appointments table"
        />
        <MetricCard
          title="Live Consults"
          value={metrics.liveConsultations?.value?.toString() || '0'}
          icon="videocam"
          badge="100% active"
          badgeColor="bg-secondary-container text-on-secondary-container"
          subtext="telemetry logged"
        />
        <MetricCard
          title="Satisfaction"
          value={`${metrics.satisfaction?.rating || '4.9'} ★`}
          icon="star"
          badge="reviews table"
          badgeColor="bg-surface-container text-primary"
          subtext="Patient rated"
        />
      </div>

      {/* Clinical Department Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">General Medicine</span>
            <div className="text-lg font-bold text-primary mt-1">Live Queue</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Connected to MongoDB</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">medication</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Emergency Triage</span>
            <div className="text-lg font-bold text-error mt-1">Auto-Triage Active</div>
            <span className="text-[0.6875rem] text-error font-medium">Critical Fast-track</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined">emergency</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Surgery Tele-Advisory</span>
            <div className="text-lg font-bold text-secondary mt-1">Active Cases</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Board Certified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">surgical</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface">Dermatology & Diet</span>
            <div className="text-lg font-bold text-primary mt-1">Prescription Sync</div>
            <span className="text-[0.6875rem] text-on-surface-variant">prescriptions table</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">pets</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Tele-Consultations Stream & Quick Verification */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Left (2 cols): Live Consultations & Recent Stream */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Manrope'] text-lg font-bold text-on-surface flex items-center gap-2">
                <span>Live Tele-Consultations & Triage Stream</span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
              </h2>
              <p className="text-xs text-on-surface-variant">Live consultation sessions from MongoDB appointments table</p>
            </div>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All ({appointments.length})</span>
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
                <tr>
                  <th className="p-3 font-bold rounded-l-lg">Pet & ID</th>
                  <th className="p-3 font-bold">Owner</th>
                  <th className="p-3 font-bold">Doctor</th>
                  <th className="p-3 font-bold">Triage</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-on-surface-variant">
                      {loading ? "Loading table data from MongoDB..." : "No appointment records found in database."}
                    </td>
                  </tr>
                ) : (
                  appointments.map((c) => (
                    <tr key={c._id || c.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-3 font-medium">
                        <div className="font-bold text-on-surface">{c.petName || c.pet}</div>
                        <div className="text-[0.6875rem] text-on-surface-variant">
                          {c._id ? String(c._id).substring(0, 8) : c.id} • {c.petSpecies || c.breed || 'Pet'}
                        </div>
                      </td>
                      <td className="p-3 text-on-surface font-medium">{c.ownerName || c.owner}</td>
                      <td className="p-3">
                        <div className="font-semibold text-primary">{c.vetName || c.vet}</div>
                        <div className="text-[0.6875rem] text-on-surface-variant">{c.reason}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${
                          (c.triage || '').toLowerCase() === 'emergency'
                            ? 'bg-error-container text-error'
                            : (c.triage || '').toLowerCase() === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-surface-container text-on-surface'
                        }`}>
                          {c.triage || 'Routine'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                          c.isLive || c.status === 'live'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : c.status === 'completed'
                            ? 'bg-surface-container text-outline'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {(c.isLive || c.status === 'live') && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                          {c.status || 'Scheduled'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate('/admin/appointments')}
                          className="px-3 py-1 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
                        >
                          {c.isLive || c.status === 'live' ? 'Monitor' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
                <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs font-bold">
                  {pendingVets.length}
                </span>
              </h2>
              <button
                onClick={() => navigate('/admin/veterinarians')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Review All
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Practitioners from MongoDB <span className="font-bold text-on-surface">vets</span> table requiring license approval:
            </p>

            <div className="space-y-3">
              {pendingVets.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container-low text-center text-xs text-on-surface-variant">
                  ✓ All registered veterinarians are verified!
                </div>
              ) : (
                pendingVets.map((v) => (
                  <div key={v._id} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={v.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
                        alt={v.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-primary/20"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-on-surface truncate">{v.name}</div>
                        <div className="text-[0.6875rem] text-on-surface-variant truncate">{v.clinicName}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[0.6875rem] text-on-surface-variant pt-1 border-t border-outline-variant/20">
                      <span>License: {v.licenseNumber || v.vciNumber}</span>
                      <span className="text-amber-700 font-semibold">Requires Approval</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setSelectedVetForReview(v)}
                        className="flex-1 py-1.5 bg-primary-container text-white rounded-lg font-bold text-xs hover:opacity-95 text-center flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">description</span>
                        <span>Details & Docs</span>
                      </button>
                      <button
                        onClick={() => handleQuickApproveVet(v._id, v.name)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:opacity-90 shadow-xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 text-center">
            <span className="text-[0.6875rem] text-on-surface-variant font-medium">
              Medical Board Verification: <strong>vets collection in MongoDB</strong>
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
              This advisory will be saved to the MongoDB <strong>clinicaladvisories</strong> collection and broadcasted to all practitioners.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Advisory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canine Respiratory Disease Isolation Standard"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant/40 text-xs bg-surface-container-low"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Urgency Level</label>
                <select
                  value={broadcastUrgency}
                  onChange={(e) => setBroadcastUrgency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant/40 text-xs bg-surface-container-low"
                >
                  <option value="high">High (Clinical Advisory)</option>
                  <option value="emergency">Emergency (Immediate Escalation)</option>
                  <option value="routine">Routine (Guideline Update)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Advisory Message</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Type advisory details to store in database..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full p-3 rounded-xl border border-outline-variant/40 text-xs bg-surface-container-low focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {advisorySent && (
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold">
                  ✓ Advisory broadcasted and saved to MongoDB clinicaladvisories collection!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-error text-white shadow-sm hover:opacity-90 transition-all"
                >
                  Save & Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vet Verification & Documents Modal */}
      <VetVerificationModal
        vet={selectedVetForReview}
        onClose={() => setSelectedVetForReview(null)}
        onApprove={handleModalApprove}
        onReject={handleModalReject}
      />
    </div>
  );
};

export default AdminDashboard;
