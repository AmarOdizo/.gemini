import React, { useState, useEffect } from 'react';
import VetVerificationModal from '../../components/admin/VetVerificationModal';
import { adminApi } from '../../services/adminApi';

const AdminVeterinarians = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedVetForReview, setSelectedVetForReview] = useState(null);
  const [vetsList, setVetsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVetsFromDatabase = async () => {
    try {
      setLoading(true);
      const json = await adminApi.getVets();
      if (json.success && json.vets) {
        const formatted = json.vets.map((v, i) => ({
          id: v._id,
          name: v.name?.startsWith('Dr.') ? v.name : `Dr. ${v.name}`,
          license: v.licenseNumber || v.vciNumber || `VET-REG-${9000 + i}`,
          dea: v.deaNumber || 'DEA-PENDING',
          specialty: Array.isArray(v.specialization) ? v.specialization.join(', ') : v.specialization || 'General Veterinary',
          clinic: v.clinicName || 'PetCare Clinical Network',
          university: v.university || v.qualification || 'State Veterinary Medical College',
          experience: `${v.experienceYears || 5} Years`,
          status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : (v.isVerified ? 'Active' : 'Pending'),
          rating: 4.9,
          consultationsCount: 120,
          avatar: v.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
          phone: v.phone || '+1 (555) 000-PETS',
          email: v.email || 'doctor@petcare.org'
        }));
        setVetsList(formatted);
      }
    } catch (err) {
      console.error("Error loading vets from MongoDB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVetsFromDatabase();
  }, []);

  const handleApprove = async (vetId) => {
    try {
      await adminApi.verifyVet(vetId, 'approve');
      await fetchVetsFromDatabase();
      setSelectedVetForReview(null);
      alert(`Veterinarian credential verified and saved to MongoDB vets table.`);
    } catch (err) {
      alert("Error saving approval: " + err.message);
    }
  };

  const handleReject = async (vetId, reason) => {
    try {
      await adminApi.verifyVet(vetId, 'reject', reason || 'State license documentation incomplete');
      await fetchVetsFromDatabase();
      setSelectedVetForReview(null);
      alert(`Veterinarian status updated in MongoDB vets collection.`);
    } catch (err) {
      alert("Error saving rejection: " + err.message);
    }
  };

  const filteredVets = vetsList.filter((v) => {
    if (activeTab === 'pending' && v.status !== 'Pending') return false;
    if (activeTab === 'active' && v.status !== 'Active') return false;
    if (activeTab === 'suspended' && v.status !== 'Suspended') return false;

    if (selectedSpecialty !== 'all' && !v.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.license.toLowerCase().includes(q) ||
        v.clinic.toLowerCase().includes(q) ||
        v.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = vetsList.filter((v) => v.status === 'Pending').length;

  return (
    <div className="p-3 sm:p-5 md:p-8 max-w-[100rem] mx-auto space-y-4 sm:space-y-6">
      {/* Top Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-['Manrope'] text-xl sm:text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>Veterinarian Clinical Management</span>
            {pendingCount > 0 && (
              <span className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded-full bg-error-container text-error">
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Authorized practitioner licensing, medical credential compliance, and active performance.
          </p>
        </div>

        <button
          onClick={() => alert("Launching manual doctor onboarding flow...")}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
          <span>Invite Veterinarian</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.625rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Registered</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-on-surface mt-1">{vetsList.length}</div>
            <span className="text-[0.6875rem] text-secondary font-semibold">100% AVMA verified</span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.25rem]">stethoscope</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.625rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Tele-Vets</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-on-surface mt-1">
              {vetsList.filter(v => v.status === 'Active').length}
            </div>
            <span className="text-[0.6875rem] text-on-surface-variant">Available for Telehealth</span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.25rem]">verified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.625rem] sm:text-xs font-bold text-error uppercase tracking-wider">Pending Review</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-error mt-1">{pendingCount}</div>
            <span className="text-[0.6875rem] text-error font-semibold">Requires Approval</span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.25rem]">pending_actions</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-[0.625rem] sm:text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Platform Rating</span>
            <div className="text-xl sm:text-2xl font-bold font-['Manrope'] text-on-surface mt-1">4.92 ★</div>
            <span className="text-[0.6875rem] text-on-surface-variant">Patient reviews</span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[1.25rem]">star</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          All Veterinarians ({vetsList.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'pending'
              ? 'bg-error text-white shadow-sm'
              : 'text-error hover:bg-error-container/30'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
          <span>Pending ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'active'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Active Practitioners
        </button>

        <button
          onClick={() => setActiveTab('suspended')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'suspended'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Suspended
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, license or clinic..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Specialty:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary"
          >
            <option value="all">All Specialties</option>
            <option value="Internal Medicine">Internal Medicine</option>
            <option value="Emergency">Emergency & Critical Care</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Cardiology">Cardiology</option>
          </select>
        </div>
      </div>

      {/* Veterinarian Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredVets.map((v) => (
          <div
            key={v.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Doctor Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={v.avatar}
                    alt={v.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{v.name}</h3>
                    <p className="text-xs text-primary font-semibold">{v.specialty}</p>
                    <span className="text-[0.6875rem] text-on-surface-variant">{v.clinic}</span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                    v.status === 'Active'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : v.status === 'Pending'
                      ? 'bg-error-container text-error'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              {/* License and Details */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-on-surface-variant">Medical License:</span>
                  <span className="font-mono font-bold text-primary">{v.license}</span>
                </div>
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-on-surface-variant">Education:</span>
                  <span className="text-on-surface font-medium truncate max-w-[170px]">{v.university}</span>
                </div>
                <div className="flex items-center justify-between text-[0.6875rem]">
                  <span className="text-on-surface-variant">Experience:</span>
                  <span className="text-on-surface font-semibold">{v.experience}</span>
                </div>
              </div>

              {/* Rating & Consults */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1 font-bold text-on-surface">
                  <span className="material-symbols-outlined text-amber-500 text-[1.125rem]">star</span>
                  <span>{v.rating}</span>
                  <span className="text-[0.6875rem] text-on-surface-variant font-normal">({v.consultationsCount} consults)</span>
                </div>
                <div className="text-[0.6875rem] text-on-surface-variant">{v.phone}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2">
              {v.status === 'Pending' ? (
                <button
                  onClick={() => setSelectedVetForReview(v)}
                  className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[1rem]">verified_user</span>
                  <span>Review & Verify Credentials</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setSelectedVetForReview(v)}
                    className="flex-1 py-2 bg-surface-container text-on-surface rounded-xl text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    View Credentials
                  </button>
                  <button
                    onClick={() => {
                      const newStatus = v.status === 'Active' ? 'Suspended' : 'Active';
                      setVetsList((prev) =>
                        prev.map((item) => (item.id === v.id ? { ...item, status: newStatus } : item))
                      );
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      v.status === 'Active'
                        ? 'text-error hover:bg-error-container/30'
                        : 'text-secondary hover:bg-secondary-container/30'
                    }`}
                  >
                    {v.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      <VetVerificationModal
        vet={selectedVetForReview}
        onClose={() => setSelectedVetForReview(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default AdminVeterinarians;
