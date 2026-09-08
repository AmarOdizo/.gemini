import React, { useEffect, useRef } from 'react';

const RemoteVideo = ({ stream, participantName, status }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="absolute inset-0 w-full h-full bg-surface-container-lowest">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-surface text-on-surface-variant gap-4">
          <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center animate-pulse">
             <span className="material-symbols-outlined text-5xl opacity-50">person</span>
          </div>
          <div className="text-center">
            <h3 className="font-headline-sm font-bold text-lg mb-1">{participantName || 'Participant'}</h3>
            <p className="text-sm font-medium animate-pulse">{status === 'waiting' ? 'Waiting to join...' : 'Connecting...'}</p>
          </div>
        </div>
      )}
      
      {stream && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {participantName || 'Connected'}
        </div>
      )}
    </div>
  );
};

export default RemoteVideo;
