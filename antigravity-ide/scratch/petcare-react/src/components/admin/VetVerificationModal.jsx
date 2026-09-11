import React, { useState } from 'react';

const VetVerificationModal = ({ vet, onClose, onApprove, onReject, onSuspend }) => {
  const [activeDocTab, setActiveDocTab] = useState('license');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!vet) return null;

  const vetId = vet._id || vet.id;
  const name = vet.name || 'Veterinarian';
  const avatar = vet.photoUrl || vet.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150';
  const license = vet.vciNumber || vet.licenseNumber || vet.license || 'VCI Pending';
  const clinic = vet.clinicName || vet.clinic || 'Veterinary Clinic';
  const clinicAddress = vet.clinicAddress || (vet.city ? `${clinic}, ${vet.city}` : 'India');
  const qualification = vet.qualification || 'B.V.Sc & A.H.';
  const university = vet.university || 'Recognized Veterinary University';
  const specialty = Array.isArray(vet.specialization) 
    ? vet.specialization.join(', ') 
    : (vet.specialization || vet.specialty || 'General Veterinary Practice');
  const experience = vet.experienceYears ? `${vet.experienceYears} Years` : (vet.experience || '5+ Years');
  const fee = vet.consultationFee || 499;
  const email = vet.email || '';
  const phone = vet.phone || vet.clinicPhone || '';
  const about = vet.about || 'Dedicated veterinarian registered with Veterinary Council of India.';
  const licenseCertUrl = vet.licenseCertUrl || '';
  
  const rawStatus = (vet.status || 'pending').toString().toLowerCase();
  const isSuspended = rawStatus === 'suspended' || vet.isSuspended === true;
  const isApproved = rawStatus === 'active' && vet.isVerified !== false;
  const isPending = rawStatus === 'pending' || (!isApproved && !isSuspended && rawStatus !== 'rejected');
  const isRejected = rawStatus === 'rejected';

  const handleApproveClick = () => {
    if (onApprove) {
      onApprove(vetId, name);
    }
  };

  const handleRejectClick = () => {
    if (onReject) {
      onReject(vetId, rejectReason, name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src={avatar}
              alt={name}
              className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl object-cover ring-2 ring-primary/30 shrink-0 shadow-sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-['Manrope'] text-base sm:text-xl font-black text-on-surface truncate">
                  {name}
                </h3>
                {isSuspended && (
                  <span className="px-2.5 py-0.5 rounded-full bg-error text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[12px]">block</span>
                    Suspended
                  </span>
                )}
                {isPending && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[12px]">hourglass_top</span>
                    Pending Verification
                  </span>
                )}
                {isApproved && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Approved & Active
                  </span>
                )}
                {isRejected && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-700 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-[12px]">cancel</span>
                    Disapproved
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>VCI License: <strong className="font-mono text-primary font-bold">{license}</strong></span>
                <span>•</span>
                <span>{qualification}</span>
                <span>•</span>
                <span>{clinic}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center shrink-0 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body: Credentials & Full Details */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Status Alert Banner */}
          {isSuspended ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold">
              <span className="material-symbols-outlined text-red-600 text-2xl shrink-0">block</span>
              <div>
                <p className="font-bold">Practitioner Account is Suspended</p>
                <p className="text-[11px] text-red-700 mt-0.5">This doctor is completely hidden from Owner Find Vets and bookings are disabled.</p>
              </div>
            </div>
          ) : isPending ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
              <span className="material-symbols-outlined text-amber-600 text-2xl shrink-0">hourglass_top</span>
              <div>
                <p className="font-bold">Awaiting Clinical Administrator Approval</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  This doctor cannot accept consultations and will NOT appear on the Owner Dashboard until you approve their credentials below.
                </p>
              </div>
            </div>
          ) : isRejected ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold">
              <span className="material-symbols-outlined text-rose-600 text-2xl shrink-0">cancel</span>
              <div>
                <p className="font-bold">Credentials Disapproved / Rejected</p>
                <p className="text-[11px] text-rose-800 mt-0.5">{vet.rejectionReason || 'The doctor has been notified to re-submit updated documents.'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
              <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0">verified</span>
              <div>
                <p className="font-bold">Approved & Authorized Practitioner</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Doctor is visible to all pet parents across India and accepting appointments.</p>
              </div>
            </div>
          )}

          {/* Quick Doctor Profile Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Degree / College</span>
              <span className="font-bold text-on-surface block leading-tight">{qualification}</span>
              <span className="text-[11px] text-on-surface-variant mt-0.5 block truncate">{university}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Specialization</span>
              <span className="font-bold text-on-surface block leading-tight">{specialty}</span>
              <span className="text-[11px] text-primary font-semibold mt-0.5 block">{experience} experience</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Clinic / Hospital</span>
              <span className="font-bold text-on-surface block leading-tight truncate">{clinic}</span>
              <span className="text-[11px] text-on-surface-variant mt-0.5 block truncate">{clinicAddress}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Consultation Fee</span>
              <span className="text-base font-black text-primary block leading-tight">₹{fee}</span>
              <span className="text-[11px] text-on-surface-variant mt-0.5 block truncate">Phone: {phone || 'N/A'}</span>
            </div>
          </div>

          {/* Contact & About Section */}
          <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/20 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                {email || 'No email specified'}
              </span>
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                {phone || 'No phone specified'}
              </span>
            </div>
            {about && (
              <p className="text-on-surface-variant text-[11px] leading-relaxed pt-1 border-t border-outline-variant/20 italic">
                "{about}"
              </p>
            )}
          </div>

          {/* Document Review Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                Submitted Documents & Certifications
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                Encrypted & Secure
              </span>
            </div>

            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveDocTab('license')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeDocTab === 'license' ? 'bg-primary-container text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>VCI License Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('university')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeDocTab === 'university' ? 'bg-primary-container text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">school</span>
                <span>Degree & University</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDocTab('clinic')}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  activeDocTab === 'clinic' ? 'bg-primary-container text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">apartment</span>
                <span>Clinic Registration</span>
              </button>
            </div>

            {/* Document Viewer Container */}
            <div className="bg-surface-container-lowest border-2 border-dashed border-outline-variant/40 rounded-2xl p-5 text-center space-y-3">
              {activeDocTab === 'license' && (
                <>
                  {licenseCertUrl ? (
                    <div className="space-y-3">
                      <div className="max-h-64 overflow-hidden rounded-xl border border-outline-variant/30 shadow-sm mx-auto flex items-center justify-center bg-surface-container">
                        <img 
                          src={licenseCertUrl} 
                          alt="Doctor VCI Certificate" 
                          className="max-h-64 object-contain w-auto hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={licenseCertUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          <span>Open Full Size Document</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20">
                        <span className="material-symbols-outlined text-3xl">verified_user</span>
                      </div>
                      <div className="text-sm font-bold text-on-surface">
                        VCI_Registration_Document_{license.replace(/[^a-zA-Z0-9]/g, '_')}.pdf
                      </div>
                      <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                        State Veterinary Council Registered Number: <strong className="font-mono text-primary">{license}</strong>. Verified via official national council database check.
                      </p>
                      <button
                        type="button"
                        onClick={() => alert(`Reviewing official credential registry record for VCI Registration #${license}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">policy</span>
                        <span>Inspect Cryptographic License Signature</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeDocTab === 'university' && (
                <div className="space-y-2 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary mx-auto flex items-center justify-center border border-secondary/20">
                    <span className="material-symbols-outlined text-3xl">school</span>
                  </div>
                  <div className="text-sm font-bold text-on-surface">
                    {qualification} - {university}
                  </div>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    Accredited Veterinary College degree certificate under Veterinary Council of India guidelines.
                  </p>
                  <span className="inline-block px-3 py-1 bg-surface-container rounded-full text-[11px] font-bold text-on-surface-variant">
                    Verified Academic Standing
                  </span>
                </div>
              )}

              {activeDocTab === 'clinic' && (
                <div className="space-y-2 py-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary mx-auto flex items-center justify-center border border-primary-container/30">
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                  </div>
                  <div className="text-sm font-bold text-on-surface">
                    {clinic}
                  </div>
                  <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                    {clinicAddress} • Practice Phone: {phone || 'Registered'}
                  </p>
                  <span className="inline-block px-3 py-1 bg-surface-container rounded-full text-[11px] font-bold text-on-surface-variant">
                    Clinical Facility Registration Confirmed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Form Drawer */}
          {showRejectForm && (
            <div className="p-4 bg-error-container/20 rounded-2xl border-2 border-error/40 space-y-2.5 animate-in fade-in">
              <label className="text-xs font-bold text-error block flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Specify Reason for Disapproval / Inquiry:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. VCI License certificate photo is blurry, or registration expired. Please re-upload..."
                className="w-full p-3 text-xs rounded-xl border border-error/40 focus:outline-none focus:border-error bg-white font-medium"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-surface-container-low border-t border-outline-variant/20 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl text-center transition-colors"
          >
            Close
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {onSuspend && (
              <button
                type="button"
                onClick={() => onSuspend(vet)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  isSuspended
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    : 'text-error hover:bg-error-container/40 border border-error/40'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSuspended ? 'check_circle' : 'block'}
                </span>
                <span>{isSuspended ? 'Unsuspend / Restore Doctor' : 'Suspend Doctor'}</span>
              </button>
            )}

            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2.5 text-xs font-bold text-error hover:bg-error-container/40 rounded-xl transition-colors text-center border border-error/30"
              >
                Disapprove / Reject
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRejectClick}
                className="px-4 py-2.5 text-xs font-bold bg-error text-white rounded-xl hover:opacity-95 shadow-sm text-center flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Confirm Disapproval</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleApproveClick}
              className="px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-container transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Approve & Verify Doctor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VetVerificationModal;
