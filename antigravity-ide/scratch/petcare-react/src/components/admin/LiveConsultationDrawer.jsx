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
                  Live Consultation Telemetry
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
            {/* Live Video Preview Mockup / Status */}
            <div className="rounded-2xl bg-[#121c2d] p-3.5 sm:p-4 text-white relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between text-xs mb-3 border-b border-white/10 pb-2">
                <span className="flex items-center gap-2 font-semibold text-[0.6875rem] sm:text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>WebRTC P2P Active</span>
                </span>
                <span className="font-mono text-emerald-300 text-xs">00:14:32</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {/* Vet Feed Tile */}
                <div className="bg-white/10 rounded-xl p-3 relative h-24 sm:h-28 flex flex-col justify-between border border-white/10">
                  <div className="flex items-center justify-between text-[0.625rem] text-white/80">
                    <span className="truncate max-w-[120px]">{consultation.vet}</span>
                    <span className="text-emerald-400 shrink-0">Mic ON</span>
                  </div>
                  <div className="text-center font-bold text-xs text-white/70">
                    Veterinarian Stream
                  </div>
                  <div className="text-[0.625rem] text-white/60 flex items-center justify-between">
                    <span>1080p @ 30fps</span>
                    <span>1.8 Mbps</span>
                  </div>
                </div>

                {/* Owner/Patient Feed Tile */}
                <div className="bg-white/10 rounded-xl p-3 relative h-24 sm:h-28 flex flex-col justify-between border border-white/10">
                  <div className="flex items-center justify-between text-[0.625rem] text-white/80">
                    <span className="truncate max-w-[120px]">{consultation.owner} ({consultation.pet})</span>
                    <span className="text-emerald-400 shrink-0">Mic ON</span>
                  </div>
                  <div className="text-center font-bold text-xs text-white/70">
                    Patient/Owner Feed
                  </div>
                  <div className="text-[0.625rem] text-white/60 flex items-center justify-between">
                    <span>720p @ 30fps</span>
                    <span>1.1 Mbps</span>
                  </div>
                </div>
              </div>

              {/* Network Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[0.625rem] sm:text-[0.6875rem] bg-white/5 rounded-xl p-2 font-mono">
                <div>
                  <span className="text-white/60 block">Latency</span>
                  <span className="text-emerald-300 font-bold">28 ms</span>
                </div>
                <div>
                  <span className="text-white/60 block">Packet Loss</span>
                  <span className="text-emerald-300 font-bold">0.02%</span>
                </div>
                <div>
                  <span className="text-white/60 block">Encryption</span>
                  <span className="text-emerald-300 font-bold">AES-256</span>
                </div>
              </div>
            </div>

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
                <div>
                  <span className="text-on-surface-variant block text-[0.6875rem]">Triage Severity</span>
                  <span className={`px-2 py-0.5 rounded-full text-[0.625rem] font-bold ${
                    consultation.triage === 'Emergency' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface'
                  }`}>
                    {consultation.triage || 'Standard'}
                  </span>
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
