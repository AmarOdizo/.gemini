import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../supabaseClient';

const GlobalCallListener = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Parse user on mount and when local storage changes
  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      } else {
        setCurrentUser(null);
      }
    };
    checkUser();
    
    // Slight hack: we can listen for a custom event or interval, 
    // but typically a page refresh or route change handles it. 
    // For simplicity, we just rely on mount for now.
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    
    const userId = currentUser._id || currentUser.id;
    if (!userId) return;

    const channel = supabase.channel(`global-call-${userId}`);

    channel.on('broadcast', { event: 'incoming_call' }, (payload) => {
      const callData = payload.payload;
      console.log("Incoming call received:", callData);
      setIncomingCall(callData);
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const handleAccept = () => {
    if (!incomingCall) return;

    // Notify caller that call was accepted
    const callerChannel = supabase.channel(`global-call-${incomingCall.callerId}`);
    callerChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callerChannel.send({
          type: 'broadcast',
          event: 'call_accepted',
          payload: { appointmentId: incomingCall.appointmentId }
        });
        
        // Unsubscribe after sending
        setTimeout(() => supabase.removeChannel(callerChannel), 500);
      }
    });

    // Navigate to video call room
    const isDoctor = currentUser.role === 'doctor' || currentUser.vciNumber;
    const basePath = isDoctor ? '/doctor-dashboard' : '/owner-dashboard';
    
    navigate(`${basePath}/video-call/${incomingCall.appointmentId}`, {
      state: { 
        appointment: incomingCall.appointmentDetails, 
        isInitiator: false // The receiver is not the initiator
      }
    });

    setIncomingCall(null);
  };

  const handleReject = () => {
    if (!incomingCall) return;

    // Notify caller that call was rejected
    const callerChannel = supabase.channel(`global-call-${incomingCall.callerId}`);
    callerChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        callerChannel.send({
          type: 'broadcast',
          event: 'call_rejected',
          payload: { appointmentId: incomingCall.appointmentId }
        });
        
        setTimeout(() => supabase.removeChannel(callerChannel), 500);
      }
    });

    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        
        {/* Pulsing Avatar/Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75" />
          <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-4xl text-primary">videocam</span>
          </div>
        </div>

        <h2 className="text-xl font-bold font-headline-sm text-on-surface mb-1">
          Incoming Video Call
        </h2>
        <p className="text-sm font-semibold text-primary mb-2">
          {incomingCall.callerName}
        </p>
        <p className="text-xs text-on-surface-variant mb-8 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/30">
          For patient: <strong>{incomingCall.appointmentDetails?.petName || 'Patient'}</strong>
        </p>

        <div className="flex gap-4 w-full">
          <button 
            onClick={handleReject}
            className="flex-1 bg-error/10 hover:bg-error/20 text-error border border-error/20 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">call_end</span> Decline
          </button>
          
          <button 
            onClick={handleAccept}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-[20px]">call</span> Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalCallListener;
