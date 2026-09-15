import React from 'react';
import { useNavigate } from 'react-router-dom';

const LiveConsultationDrawer = ({ consultation, onClose }) => {
  const navigate = useNavigate();
  if (!consultation) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-outline-variant/30 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[1.25rem]">videocam</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-['Manrope'] text-sm sm:text-base font-bold text-on-surface truncate">
                  Live Consultation Details
                </h3>
                <p className="text-xs text-on-surface-variant truncate">Session ID: {consultation.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors shrink-0 ml-2"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">


            {/* Patient & Owner Details */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 space-y-3">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Patient Overview</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div>
                  <span className="text-on-surface-variant block text-[0.6875rem]">Pet Name & Species</span>
                  <span className="font-bold text-on-surface">{consultation.pet} ({consultation.breed})</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[0.6875rem]">Owner Name</span>
                  <span className="font-bold text-on-surface">{consultation.owner}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant block text-[0.6875rem]">Clinical Reason</span>
                  <span className="font-semibold text-primary">{consultation.reason || 'Routine Tele-checkup'}</span>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Diagnostic Summary */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant/20 space-y-2">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Doctor Diagnostic Notes</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed bg-white p-3 rounded-xl border border-outline-variant/20">
                {consultation.notes || 'Patient exhibiting mild lethargy and decreased appetite over 48 hours. Temperature standard at 101.4°F. Prescribing broad hydration regimen and monitoring for 24 hours.'}
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-outline-variant/20 bg-surface-container-low flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              const appointmentId = consultation._id || consultation.id || 'room-vet-8942';
              navigate(`/doctor-dashboard/video-call/${appointmentId}`);
            }}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 text-center"
          >
            <span className="material-symbols-outlined text-[1.125rem]">call</span>
            <span>Join Room as Clinical Admin</span>
          </button>
          <button
            onClick={() => {
              alert(`Session ${consultation.id} clinical report exported.`);
            }}
            className="px-4 py-2.5 bg-white border border-outline-variant/30 text-on-surface rounded-xl text-xs font-bold hover:bg-surface-container transition-colors text-center"
          >
            Export Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveConsultationDrawer;
