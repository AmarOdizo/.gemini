import React, { useEffect, useRef } from 'react';

const LocalVideo = ({ stream, isMuted, isCameraOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-32 h-48 md:w-48 md:h-64 bg-surface-container-high rounded-xl overflow-hidden shadow-lg border-2 border-primary/20 transition-all z-10">
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Always mute local video to prevent echo
          className="w-full h-full object-cover mirror-mode"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-surface-container-lowest">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">videocam_off</span>
        </div>
      )}
      
      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
        You
        {isMuted && <span className="material-symbols-outlined text-[14px] text-error">mic_off</span>}
      </div>
    </div>
  );
};

export default LocalVideo;
