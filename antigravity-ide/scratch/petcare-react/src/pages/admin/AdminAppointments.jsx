import React, { useState, useEffect } from 'react';
import LiveConsultationDrawer from '../../components/admin/LiveConsultationDrawer';

const AdminAppointments = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial standard appointments database
  const seedAppointments = [
    {
      id: 'APT-1092',
      pet: 'Barnaby',
      breed: 'Golden Retriever',
      owner: 'Eleanor Vance',
      ownerEmail: 'eleanor.vance@example.com',
      vet: 'Dr. Marcus Sterling',
      specialty: 'Internal Medicine',
      time: '10:00 AM EST • Today',
      reason: 'Post-operative monitoring and appetite check',
      triage: 'Urgent',
      status: 'Live',
      isLive: true,
      notes: 'Post-op recovery tracking for abdominal surgery. Incision clean, dog drinking fluids regularly.'
    },
    {
      id: 'APT-1093',
      pet: 'Cleo & Mochi',
      breed: 'Domestic Short Hair',
      owner: 'Liam Henderson',
      ownerEmail: 'liam.h@example.com',
      vet: 'Dr. Chloe Aris',
      specialty: 'Dermatology & Allergy',
      time: '10:15 AM EST • Today',
      reason: 'Chronic skin itching & ear inflammation',
      triage: 'Routine',
      status: 'In-Waiting',
      isLive: true,
      notes: 'Evaluation of seasonal allergies. Reviewing hypoallergenic diet and topical spray.'
    },
    {
      id: 'APT-1094',
      pet: 'Rory',
      breed: 'French Bulldog',
      owner: 'Sophia Chen',
      ownerEmail: 'sophia.c@example.com',
      vet: 'Dr. Neil Roberts',
      specialty: 'Cardiology',
      time: '10:30 AM EST • Today',
      reason: 'Acute respiratory distress and rapid panting',
      triage: 'Emergency',
      status: 'Live',
      isLive: true,
      notes: 'Emergency tele-triage. Advising owner on upright positioning and immediate oxygen stabilization.'
    },
    {
      id: 'APT-1095',
      pet: 'Zeus',
      breed: 'German Shepherd',
      owner: 'David Miller',
      ownerEmail: 'david.m@example.com',
      vet: 'Dr. Sarah Jenkins',
      specialty: 'Orthopedics & Spine',
      time: '11:00 AM EST • Today',
      reason: 'Hind leg limping after park exercise',
      triage: 'Routine',
      status: 'Scheduled',
      isLive: false,
      notes: 'Suspected mild cruciate ligament sprain. Awaiting gait video upload.'
    },
    {
      id: 'APT-1096',
      pet: 'Luna',
      breed: 'Persian Cat',
      owner: 'Maya Lin',
      ownerEmail: 'maya.lin@example.com',
      vet: 'Dr. Marcus Sterling',
      specialty: 'Internal Medicine',
      time: '09:00 AM EST • Today',
      reason: 'Follow-up on renal support diet',
      triage: 'Routine',
      status: 'Completed',
      isLive: false,
      notes: 'Hydration levels stable. Blood urea nitrogen within acceptable home-care margins.'
    },
    {
      id: 'APT-1097',
      pet: 'Buster',
      breed: 'Beagle',
      owner: 'James Wilson',
      ownerEmail: 'j.wilson@example.com',
      vet: 'Dr. Chloe Aris',
      specialty: 'Dermatology',
      time: 'Yesterday',
      reason: 'Suspected flea dermatitis & ear mite inspection',
      triage: 'Routine',
      status: 'Completed',
      isLive: false,
      notes: 'Prescribed ear drops and NexGard flea prevention chewables.'
    }
  ];

  useEffect(() => {
    const fetchApiAppointments = async () => {
      try {
        const token = localStorage.getItem('userToken') || '';
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.appointments && json.appointments.length > 0) {
            const formatted = json.appointments.map((a, idx) => ({
              id: `APT-${a._id ? a._id.substring(a._id.length - 4) : 1000 + idx}`,
              pet: a.petName || 'Pet',
              breed: a.petBreed || a.petType || 'Canine',
              owner: a.ownerName || 'Pet Owner',
              ownerEmail: a.ownerEmail || 'owner@example.com',
              vet: a.vetName || 'Assigned Veterinarian',
              specialty: a.vetSpecialty || 'General Veterinary',
              time: `${a.date || 'Today'} • ${a.time || '10:00 AM'}`,
              reason: a.reason || 'General Consultation',
              triage: a.triage || 'Routine',
              status: a.status || 'Scheduled',
              isLive: a.status === 'In-Progress' || a.status === 'Live',
              notes: a.notes || 'Routine clinical appointment booked via PetCare online portal.'
            }));
            setAppointments([...formatted, ...seedAppointments]);
            return;
          }
        }
      } catch (err) {
        console.warn("Using clinical seeds for appointments", err);
      } finally {
        setAppointments(seedAppointments);
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
    <div className="p-6 max-w-[100rem] mx-auto space-y-6">
      {/* Top Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>Appointments & Tele-Consultations</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container">
              12 Live Streams
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Clinical management of tele-veterinary appointments, live WebRTC video rooms, and emergency triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Exporting all appointment schedules as CSV...")}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-outline-variant/30 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'live'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span>Live Video Consultations</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] bg-secondary-container text-on-secondary-container font-bold">
            12
          </span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'emergency'
              ? 'bg-error text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[1rem] text-error">emergency</span>
          <span>Emergency Triage</span>
          <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] bg-error-container text-error font-bold">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'completed'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span>Completed History</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
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
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Doctor:</span>
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary"
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
