import React, { useState, useEffect } from 'react';
import VetVerificationModal from '../../components/admin/VetVerificationModal';

const AdminVeterinarians = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedVetForReview, setSelectedVetForReview] = useState(null);

  const initialVets = [
    {
      id: 'VET-001',
      name: 'Dr. Jonathan Blake, DVM',
      license: 'VET-CA-90421',
      specialty: 'Internal Medicine',
      clinic: 'Oak Ridge Animal Hospital',
      university: 'UC Davis School of Veterinary Medicine',
      experience: '9 Years',
      status: 'Pending',
      rating: 4.88,
      consultationsCount: 142,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 234-5678',
      email: 'dr.blake@oakridgevet.com'
    },
    {
      id: 'VET-002',
      name: 'Dr. Amanda Thorne, MRCVS',
      license: 'VET-NY-81093',
      specialty: 'Emergency & Critical Care',
      clinic: 'Metropolitan Veterinary Center',
      university: 'Cornell University College of Veterinary Medicine',
      experience: '12 Years',
      status: 'Pending',
      rating: 4.95,
      consultationsCount: 310,
      avatar: 'https://images.unsplash.com/photo-1594824813583-05b135767b36?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 345-6789',
      email: 'dr.thorne@metrovet.com'
    },
    {
      id: 'VET-003',
      name: 'Dr. Marcus Sterling, DVM',
      license: 'VET-TX-45210',
      specialty: 'Orthopedics & Spine',
      clinic: 'Sterling Animal Specialty Center',
      university: 'Texas A&M College of Veterinary Medicine',
      experience: '15 Years',
      status: 'Active',
      rating: 4.96,
      consultationsCount: 890,
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 456-7890',
      email: 'm.sterling@sterlingvet.com'
    },
    {
      id: 'VET-004',
      name: 'Dr. Chloe Aris, DVM',
      license: 'VET-FL-67129',
      specialty: 'Dermatology & Allergies',
      clinic: 'Sunshine Pet Dermatology',
      university: 'University of Florida Veterinary College',
      experience: '7 Years',
      status: 'Active',
      rating: 4.92,
      consultationsCount: 520,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 567-8901',
      email: 'chloe.aris@sunshinevet.com'
    },
    {
      id: 'VET-005',
      name: 'Dr. Neil Roberts, BVSc',
      license: 'VET-IL-98124',
      specialty: 'Cardiology',
      clinic: 'Chicago Veterinary Specialists',
      university: 'University of Illinois Veterinary Medicine',
      experience: '11 Years',
      status: 'Active',
      rating: 4.91,
      consultationsCount: 440,
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 678-9012',
      email: 'neil.roberts@chicagovet.org'
    },
    {
      id: 'VET-006',
      name: 'Dr. Kenneth Cole, DVM',
      license: 'VET-WA-12489',
      specialty: 'General Practice',
      clinic: 'Pacific Animal Care',
      university: 'Washington State University',
      experience: '4 Years',
      status: 'Suspended',
      rating: 4.35,
      consultationsCount: 88,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 789-0123',
      email: 'k.cole@pacificvet.com'
    }
  ];

  const [vetsList, setVetsList] = useState(initialVets);

  useEffect(() => {
    const fetchApiVets = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.vets && json.vets.length > 0) {
            const formatted = json.vets.map((v, i) => ({
              id: `VET-${v._id ? v._id.substring(v._id.length - 4) : 100 + i}`,
              name: v.name?.startsWith('Dr.') ? v.name : `Dr. ${v.name}`,
              license: v.licenseNumber || `VET-REG-${9000 + i}`,
              specialty: v.specialty || 'General Veterinary',
              clinic: v.clinicAddress || v.clinicName || 'PetCare Clinical Network',
              university: v.qualification || 'State Veterinary Medical College',
              experience: `${v.experience || 5} Years`,
              status: v.isVerified ? 'Active' : 'Pending',
              rating: v.rating || 4.9,
              consultationsCount: v.reviewsCount || 45,
              avatar: v.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150',
              phone: v.phone || '+1 (555) 000-PETS',
              email: v.email || 'doctor@petcare.org'
            }));
            setVetsList([...initialVets, ...formatted]);
          }
        }
      } catch (err) {
        console.warn("Using clinical seeds for veterinarians", err);
      }
    };
    fetchApiVets();
  }, []);

  const handleApprove = (vetId) => {
    setVetsList((prev) =>
      prev.map((v) => (v.id === vetId ? { ...v, status: 'Active' } : v))
    );
    setSelectedVetForReview(null);
    alert(`Veterinarian ${vetId} credential verified and approved for clinical tele-practice.`);
  };

  const handleReject = (vetId, reason) => {
    setVetsList((prev) =>
      prev.map((v) => (v.id === vetId ? { ...v, status: 'Suspended' } : v))
    );
    setSelectedVetForReview(null);
    alert(`Veterinarian ${vetId} credentials rejected. Notification sent with reason: ${reason || 'Incomplete documentation'}`);
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
    <div className="p-6 max-w-[100rem] mx-auto space-y-6">
      {/* Top Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>Veterinarian Clinical Management</span>
            {pendingCount > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-error-container text-error">
                {pendingCount} Pending Verification
              </span>
            )}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Authorized practitioner licensing, medical credential compliance, and active consultation performance.
          </p>
        </div>

        <button
          onClick={() => alert("Launching manual doctor onboarding flow...")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95"
        >
          <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
          <span>Invite Veterinarian</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Registered</span>
            <div className="text-2xl font-bold font-['Manrope'] text-on-surface mt-1">{vetsList.length}</div>
            <span className="text-xs text-secondary font-semibold">100% AVMA verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">stethoscope</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active Licensed</span>
            <div className="text-2xl font-bold font-['Manrope'] text-secondary mt-1">
              {vetsList.filter((v) => v.status === 'Active').length}
            </div>
            <span className="text-xs text-on-surface-variant">Available for Telehealth</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined">verified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-error uppercase tracking-wider">Pending Review</span>
            <div className="text-2xl font-bold font-['Manrope'] text-error mt-1">{pendingCount}</div>
            <span className="text-xs text-error font-semibold">Requires Approval</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
            <span className="material-symbols-outlined">pending_actions</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Platform Rating</span>
            <div className="text-2xl font-bold font-['Manrope'] text-on-surface mt-1">4.92 ★</div>
            <span className="text-xs text-on-surface-variant">Based on 2,840 reviews</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">star</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'all'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          All Veterinarians ({vetsList.length})
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-error text-white shadow-sm'
              : 'text-error hover:bg-error-container/30'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
          <span>Pending Verification ({pendingCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Active Licensed ({vetsList.filter((v) => v.status === 'Active').length})
        </button>

        <button
          onClick={() => setActiveTab('suspended')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'suspended'
              ? 'bg-primary-container text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Suspended / Action Needed
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor, license number or clinic..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-on-surface-variant shrink-0">Specialty:</span>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium focus:outline-none focus:border-primary"
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
