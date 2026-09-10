import React, { useState, useEffect } from 'react';
import LiveConsultationDrawer from '../../components/admin/LiveConsultationDrawer';
import { adminApi } from '../../services/adminApi';

const AdminAppointments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiAppointments = async () => {
      try {
        setLoading(true);
        const json = await adminApi.getAppointments();
        if (json.success && json.appointments) {
          const formatted = json.appointments.map((a, idx) => ({
            id: a.id || `APT-${a._id ? a._id.substring(a._id.length - 4).toUpperCase() : 1000 + idx}`,
            rawId: a._id,
            pet: a.petName || 'Pet',
            breed: a.petSpecies || a.breed || 'Canine',
            owner: a.ownerName || 'Pet Owner',
            ownerEmail: a.ownerEmail || `${(a.ownerName || 'owner').toLowerCase().replace(/\s+/g, '.')}@example.com`,
            vet: a.vetName || 'Dr. Marcus Sterling',
            specialty: a.specialty || 'Internal Medicine',
            time: `${a.date || 'Today'} • ${a.time || '10:00 AM'}`,
            reason: a.reason || 'Clinical Consultation',
            triage: a.triage ? a.triage.charAt(0).toUpperCase() + a.triage.slice(1) : 'Routine',
            status: a.isLive || a.status === 'live' ? 'Live' : a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Scheduled',
            isLive: a.isLive || a.status === 'live',
            notes: a.notes || 'Clinical record synced from MongoDB appointments collection.'
          }));
          setAppointments(formatted);
        }
      } catch (err) {
        console.error("Error loading appointments from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiAppointments();
  }, []);

  // Filtering Logic
  const filteredAppointments = appointments.filter((item) => {
    // Tab Filter
    if (activeTab === 'live' && !item.isLive) return false;
    if (activeTab === 'emergency' && item.triage !== 'Emergency') return false;
    if (activeTab === 'completed' && item.status !== 'Completed') return false;

    // Doctor Filter
    if (selectedDoctor !== 'all' && !item.vet.toLowerCase().includes(selectedDoctor.toLowerCase())) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.pet.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q) ||
        item.vet.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-[100rem] mx-auto space-y-4 sm:space-y-6">
      {/* Top Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-['Manrope'] text-xl sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>Appointments & Consultations</span>
            <span className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              {appointments.filter(a => a.isLive).length} Live
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Clinical management of tele-veterinary appointments, live WebRTC video rooms, and triage.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alert("Exporting all appointment schedules as CSV...")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[1.125rem]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'all'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span>All Appointments</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] bg-white/20">{appointments.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'live'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Live Video</span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'emergency'
              ? 'bg-error text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[1rem]">emergency</span>
          <span>Emergency Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'completed'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span>Completed History</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, doctor, owner or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
        </div>

        {/* Doctor Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Doctor:</span>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Veterinarians</option>
            <option value="Marcus Sterling">Dr. Marcus Sterling</option>
            <option value="Chloe Aris">Dr. Chloe Aris</option>
            <option value="Neil Roberts">Dr. Neil Roberts</option>
            <option value="Sarah Jenkins">Dr. Sarah Jenkins</option>
          </select>
        </div>
      </div>

      {/* Master Appointments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/20">
              <tr>
                <th className="p-4 font-bold">Consultation ID</th>
                <th className="p-4 font-bold">Patient / Pet</th>
                <th className="p-4 font-bold">Owner Contact</th>
                <th className="p-4 font-bold">Veterinarian</th>
                <th className="p-4 font-bold">Clinical Reason</th>
                <th className="p-4 font-bold">Triage</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                    No appointments match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* ID & Time */}
                    <td className="p-4">
                      <div className="font-mono font-bold text-primary">{apt.id}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{apt.time}</div>
                    </td>

                    {/* Patient */}
                    <td className="p-4">
                      <div className="font-bold text-on-surface">{apt.pet}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{apt.breed}</div>
                    </td>

                    {/* Owner */}
                    <td className="p-4">
                      <div className="font-medium text-on-surface">{apt.owner}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant truncate max-w-[140px]">{apt.ownerEmail}</div>
                    </td>

                    {/* Doctor */}
                    <td className="p-4">
                      <div className="font-semibold text-primary">{apt.vet}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{apt.specialty}</div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 max-w-[200px]">
                      <div className="text-on-surface truncate" title={apt.reason}>{apt.reason}</div>
                    </td>

                    {/* Triage */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[0.625rem] font-bold ${
                        apt.triage === 'Emergency'
                          ? 'bg-error-container text-error'
                          : apt.triage === 'Urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {apt.triage}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                        apt.status === 'Live'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : apt.status === 'Completed'
                          ? 'bg-surface-container text-outline'
                          : apt.status === 'In-Waiting'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.isLive && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>}
                        {apt.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedConsultation(apt)}
                          className="px-3 py-1.5 bg-primary-container text-white rounded-lg text-xs font-bold hover:opacity-95 transition-all shadow-sm flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[1rem]">
                            {apt.isLive ? 'videocam' : 'visibility'}
                          </span>
                          <span>{apt.isLive ? 'Monitor' : 'Inspect'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Consultation Inspection Drawer */}
      <LiveConsultationDrawer
        consultation={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
      />
    </div>
  );
};

export default AdminAppointments;
