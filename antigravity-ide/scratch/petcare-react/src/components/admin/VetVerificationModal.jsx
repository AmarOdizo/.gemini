import React, { useState } from 'react';

const VetVerificationModal = ({ vet, onClose, onApprove, onReject }) => {
  const [activeDocTab, setActiveDocTab] = useState('license');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!vet) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={vet.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
              alt={vet.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <h3 className="font-['Manrope'] text-lg font-bold text-on-surface">
                {vet.name}
              </h3>
              <p className="text-xs text-on-surface-variant">
                License Reg: <span className="font-mono font-semibold text-primary">{vet.license}</span> • {vet.clinic}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body: Credentials Review */}
        <div className="p-6 space-y-6">
          {/* Status Alert */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[1.25rem]">verified_user</span>
              <span><strong>Action Required:</strong> Verification pending submission by state veterinary council.</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[0.625rem]">
              Fast-Track
            </span>
          </div>

          {/* Key Qualifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
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
            <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <button
                onClick={() => setActiveDocTab('license')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeDocTab === 'license' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                State Medical License
              </button>
              <button
                onClick={() => setActiveDocTab('dea')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  activeDocTab === 'dea' ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                DEA Controlled Certificate
              </button>
              <button
                onClick={() => setActiveDocTab('insurance')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
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
              <div className="text-xs font-bold text-on-surface">
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
        <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!showRejectForm ? (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 text-xs font-bold text-error hover:bg-error-container/40 rounded-xl transition-colors"
              >
                Reject Credential
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReject(vet.id, rejectReason)}
                className="px-4 py-2 text-xs font-bold bg-error text-white rounded-xl hover:opacity-90 shadow-sm"
              >
                Confirm Rejection
              </button>
            )}

            <button
              type="button"
              onClick={() => onApprove(vet.id)}
              className="px-5 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
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
