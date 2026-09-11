import React, { useState } from 'react';

const VetVerificationModal = ({ vet, onClose, onApprove, onReject, onSuspend }) => {
  const [activeDocTab, setActiveDocTab] = useState('license');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!vet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={vet.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
              alt={vet.name}
              className="w-10 sm:w-12 h-10 sm:h-12 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="font-['Manrope'] text-base sm:text-lg font-bold text-on-surface truncate flex items-center gap-2">
                <span>{vet.name}</span>
                {vet.status === 'Suspended' && (
                  <span className="px-2 py-0.5 rounded-full bg-error text-white font-black text-[0.625rem] tracking-wider uppercase flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">block</span>
                    Suspended
                  </span>
                )}
              </h3>
              <p className="text-[0.6875rem] sm:text-xs text-on-surface-variant truncate">
                License: <span className="font-mono font-semibold text-primary">{vet.license}</span> • {vet.clinic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container shrink-0 ml-2"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body: Credentials Review */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Status Alert */}
          {vet.status === 'Suspended' ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              <span className="material-symbols-outlined text-red-600 text-[1.25rem] shrink-0">block</span>
              <div>
                <p className="font-bold">Practitioner Account is Currently Suspended</p>
                <p className="text-[0.6875rem] text-red-700">This doctor is completely hidden from Owner Find Vets and cannot accept any appointments.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[1.25rem] shrink-0">verified_user</span>
                <span><strong>Status:</strong> {vet.status} • Verification review and licensing compliance.</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[0.625rem] self-start sm:self-auto shrink-0">
                Compliance
              </span>
            </div>
          )}

          {/* Key Qualifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <span className="text-[0.6875rem] text-on-surface-variant block">Specialization</span>
              <span className="font-bold text-on-surface">{vet.specialty || 'Small Animal Internal Medicine'}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <span className="text-[0.6875rem] text-on-surface-variant block">Graduating University</span>
              <span className="font-bold text-on-surface">{vet.university || 'UC Davis Veterinary Medicine'}</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
              <span className="text-[0.6875rem] text-on-surface-variant block">Years in Practice</span>
              <span className="font-bold text-on-surface">{vet.experience || '8 Years'}</span>
            </div>
          </div>

          {/* Document Viewer Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveDocTab('license')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeDocTab === 'license' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                State Medical License
              </button>
              <button
                onClick={() => setActiveDocTab('dea')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeDocTab === 'dea' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                DEA Controlled Certificate
              </button>
              <button
                onClick={() => setActiveDocTab('insurance')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  activeDocTab === 'insurance' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Malpractice Policy
              </button>
            </div>

            {/* Document Mock Viewer */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.75rem]">description</span>
              </div>
              <div className="text-xs font-bold text-on-surface truncate">
                {activeDocTab === 'license' && `State_Board_Verification_${vet.license}.pdf`}
                {activeDocTab === 'dea' && `DEA_Controlled_Substance_Permit_2024.pdf`}
                {activeDocTab === 'insurance' && `AVMA_PLIT_Professional_Liability.pdf`}
              </div>
              <p className="text-[0.6875rem] text-on-surface-variant">
                Cryptographically signed & timestamped. AVMA registry verified.
              </p>
              <button
                type="button"
                onClick={() => alert("Opening secure document verification viewer...")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
                <span>Inspect High-Res Document</span>
              </button>
            </div>
          </div>

          {showRejectForm && (
            <div className="p-3 bg-error-container/20 rounded-xl border border-error-container space-y-2">
              <label className="text-xs font-bold text-error block">Reason for Credential Rejection / Inquiry:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify missing accreditation documents or renewal requirements..."
                className="w-full p-2 text-xs rounded-lg border border-error/40 focus:outline-none focus:border-error bg-white"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 bg-surface-container-low border-t border-outline-variant/20 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl text-center"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {onSuspend && (
              <button
                type="button"
                onClick={() => onSuspend(vet)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  vet.status === 'Suspended'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    : 'text-error hover:bg-error-container/40 border border-error/40'
                }`}
              >
                <span className="material-symbols-outlined text-[1rem]">
                  {vet.status === 'Suspended' ? 'check_circle' : 'block'}
                </span>
                <span>{vet.status === 'Suspended' ? 'Unsuspend / Activate' : 'Suspend Practitioner'}</span>
              </button>
            )}

            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 text-xs font-bold text-error hover:bg-error-container/40 rounded-xl transition-colors text-center"
              >
                Reject Credential
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReject(vet.id, rejectReason)}
                className="px-4 py-2 text-xs font-bold bg-error text-white rounded-xl hover:opacity-90 shadow-sm text-center"
              >
                Confirm Rejection
              </button>
            )}

            <button
              type="button"
              onClick={() => onApprove(vet.id)}
              className="px-5 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[1.125rem]">verified</span>
              <span>Approve & Authorize Practice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetVerificationModal;
