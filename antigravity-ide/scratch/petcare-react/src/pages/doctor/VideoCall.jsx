import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import VideoCallWrapper from '../../components/video-call/VideoCall';
import { createVideoCall } from '../../services/videoCallApi';

const DoctorVideoCall = () => {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We expect the appointment details to be passed via location state
  const appointmentDetails = location.state?.appointment;

  useEffect(() => {
    const initCall = async () => {
      try {
        if (!appointmentId || !appointmentDetails) {
          throw new Error("Missing appointment details. Please start the call from the dashboard.");
        }

        // 1. Verify user is a doctor
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) throw new Error("Not authenticated");
        
        const user = JSON.parse(userStr);
        if (user.role !== 'doctor' && user.role !== 'vet') {
          throw new Error("Unauthorized: Only doctors can initiate the call from this route.");
        }

        // Since backend is not updated, we'll mock the callData object for Supabase signaling
        const mockCallData = {
          _id: appointmentId, // Use appointmentId as the unique channel/room ID
          appointmentId: appointmentId,
          doctorId: user._id || user.id,
          doctorName: user.name,
          ownerId: appointmentDetails.ownerId,
          ownerName: appointmentDetails.ownerName,
          patientId: appointmentDetails.petId,
          patientName: appointmentDetails.petName || 'Patient',
          status: 'waiting',
          startedAt: new Date().toISOString()
        };

        setCallData(mockCallData);
      } catch (err) {
        console.error("Failed to initialize call:", err);
        setError(err.message || "Failed to initialize call.");
      } finally {
        setLoading(false);
      }
    };

    initCall();
  }, [appointmentId, appointmentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">sync</span>
        <h2 className="text-xl font-bold text-on-surface">Initializing Secure Consultation...</h2>
        <p className="text-sm text-on-surface-variant mt-2">Connecting to signaling servers.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Failed to Start Call</h2>
        <p className="text-on-surface-variant max-w-md mb-6">{error}</p>
        <button onClick={() => navigate('/doctor-dashboard')} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <VideoCallWrapper callData={callData} isInitiator={true} />
  );
};

export default DoctorVideoCall;
