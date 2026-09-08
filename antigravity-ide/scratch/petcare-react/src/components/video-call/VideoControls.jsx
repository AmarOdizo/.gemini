import React from 'react';

const VideoControls = ({ isMuted, isCameraOff, toggleMute, toggleCamera, onEndCall }) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-surface-container-high/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-outline-variant/30 shadow-2xl z-20">
      
      {/* Mute Button */}
      <button 
        onClick={toggleMute}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isMuted ? 'bg-error text-on-error hover:bg-error/90' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}
        title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        <span className="material-symbols-outlined text-[22px]">
          {isMuted ? 'mic_off' : 'mic'}
        </span>
      </button>

      {/* Camera Button */}
      <button 
        onClick={toggleCamera}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isCameraOff ? 'bg-error text-on-error hover:bg-error/90' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'}`}
        title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
      >
        <span className="material-symbols-outlined text-[22px]">
          {isCameraOff ? 'videocam_off' : 'videocam'}
        </span>
      </button>

      {/* End Call Button */}
      <button 
        onClick={onEndCall}
        className="w-14 h-14 rounded-full flex items-center justify-center bg-error text-on-error shadow-md hover:bg-[#B3261E] hover:scale-105 active:scale-95 transition-all ml-2"
        title="End Call"
      >
        <span className="material-symbols-outlined text-[28px] filled-icon">
          call_end
        </span>
      </button>
      
    </div>
  );
};

export default VideoControls;
