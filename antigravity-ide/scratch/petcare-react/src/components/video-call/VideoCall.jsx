import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebRTCManager } from '../../services/webrtc';
import { updateVideoCallStatus, endVideoCall } from '../../services/videoCallApi';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';
import VideoControls from './VideoControls';
import CallTimer from './CallTimer';

const VideoCall = ({ callData, isInitiator }) => {
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [status, setStatus] = useState(callData?.status || 'waiting');
  const [error, setError] = useState(null);
  
  const webrtcManager = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        setLocalStream(stream);

        // Initialize WebRTC Manager
        webrtcManager.current = new WebRTCManager(
          callData._id,
          isInitiator,
          (stream) => {
            setRemoteStream(stream);
            setStatus('active');
            
            // Backend API skipped as per user constraints
          },
          (iceState) => {
            if (iceState === 'disconnected' || iceState === 'failed' || iceState === 'closed') {
              handleEndCall(false);
            }
          }
        );

        await webrtcManager.current.initialize(stream);
        
      } catch (err) {
        console.error("Media Error:", err);
        setError("Could not access camera/microphone. Please ensure permissions are granted.");
      }
    };

    initializeMedia();

    return () => {
      mounted = false;
      if (webrtcManager.current) {
        webrtcManager.current.endCall(false);
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callData._id, isInitiator]);

  const toggleMute = () => {
    if (webrtcManager.current) {
      const newMutedState = !isMuted;
      webrtcManager.current.toggleAudio(!newMutedState);
      setIsMuted(newMutedState);
    }
  };

  const toggleCamera = () => {
    if (webrtcManager.current) {
      const newCameraState = !isCameraOff;
      webrtcManager.current.toggleVideo(!newCameraState);
      setIsCameraOff(newCameraState);
    }
  };

  const handleEndCall = async (manual = true) => {
    setStatus('ended');
    if (webrtcManager.current) {
      webrtcManager.current.endCall(manual);
    }
    
    // Backend API skipped as per user constraints

    // Navigate back to the appropriate dashboard
    const role = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).role : null;
    if (role === 'doctor' || isInitiator) {
      navigate('/doctor-dashboard');
    } else {
      navigate('/owner-dashboard');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">videocam_off</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Media Access Error</h2>
        <p className="text-on-surface-variant max-w-md mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden font-sans">
      
      {/* Remote Video (Full Screen) */}
      <RemoteVideo 
        stream={remoteStream} 
        participantName={isInitiator ? callData.ownerName : callData.doctorName} 
        status={status}
      />
      
      {/* Top Header overlay */}
      <div className="absolute top-0 left-0 w-full p-4 bg-gradient-to-b from-black/70 to-transparent z-20 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-white font-headline-sm font-bold tracking-wide shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">videocam</span> 
            Consultation
          </h1>
          <p className="text-white/70 text-xs font-bold uppercase tracking-wider">
            {isInitiator ? callData.patientName : callData.doctorName}
          </p>
        </div>
      </div>

      <CallTimer startTime={callData.startedAt || new Date().toISOString()} status={status} />

      {/* Local Video (PiP) */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 cursor-move z-30">
        <LocalVideo stream={localStream} isMuted={isMuted} isCameraOff={isCameraOff} />
      </div>

      {/* Controls */}
      <VideoControls 
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        toggleMute={toggleMute}
        toggleCamera={toggleCamera}
        onEndCall={() => handleEndCall(true)}
      />
    </div>
  );
};

export default VideoCall;
