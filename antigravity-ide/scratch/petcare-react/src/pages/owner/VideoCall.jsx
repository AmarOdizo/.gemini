import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCallWrapper from '../../components/video-call/VideoCall';
import { getVideoCallByAppointment } from '../../services/videoCallApi';

const OwnerVideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCall = async () => {
      try {
        if (!appointmentId) throw new Error("Missing appointment ID.");

        // 1. Verify user is an owner
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) throw new Error("Not authenticated");
        
        const user = JSON.parse(userStr);
        if (user.role && user.role !== 'owner') {
          throw new Error("Unauthorized access.");
        }

        // Since backend is not updated, we'll mock the callData object
        // The doctor will be waiting on the channel named after this appointmentId
        const mockCallData = {
          _id: appointmentId,
          appointmentId: appointmentId,
          ownerId: user.id || user._id,
          ownerName: user.name,
          patientName: 'Your Pet',
          doctorName: 'Doctor',
          status: 'active',
          startedAt: new Date().toISOString()
        };

        setCallData(mockCallData);
      } catch (err) {
        console.error("Failed to fetch call:", err);
        setError(err.message || "Failed to join call.");
      } finally {
        setLoading(false);
      }
    };

    fetchCall();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">sync</span>
        <h2 className="text-xl font-bold text-on-surface">Connecting to Clinic...</h2>
        <p className="text-sm text-on-surface-variant mt-2">Checking if the doctor is ready.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">event_busy</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Unable to Join</h2>
        <p className="text-on-surface-variant max-w-md mb-6">{error}</p>
        <button onClick={() => navigate('/appointments')} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm">
          Return to Appointments
        </button>
      </div>
    );
  }

  return (
    <VideoCallWrapper callData={callData} isInitiator={false} />
  );
};

export default OwnerVideoCall;
