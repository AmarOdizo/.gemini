const API_BASE = import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('userToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Creates a new video call record for a given appointment.
 * Initiated by the Doctor.
 */
export const createVideoCall = async (callData) => {
  const response = await fetch(`${API_BASE}/api/video-calls`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(callData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create video call');
  }
  return await response.json();
};

/**
 * Fetches an existing video call by its ID.
 */
export const getVideoCall = async (callId) => {
  const response = await fetch(`${API_BASE}/api/video-calls/${callId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch video call');
  }
  return await response.json();
};

/**
 * Finds an active/waiting video call for a specific appointment ID.
 * Used by Owner to check if they can join.
 */
export const getVideoCallByAppointment = async (appointmentId) => {
  const response = await fetch(`${API_BASE}/api/video-calls/appointment/${appointmentId}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch video call for this appointment');
  }
  return await response.json();
};

/**
 * Updates the status of a video call (e.g. 'active', 'ended', 'failed')
 */
export const updateVideoCallStatus = async (callId, status) => {
  const response = await fetch(`${API_BASE}/api/video-calls/${callId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update video call status');
  }
  return await response.json();
};

/**
 * Ends a video call securely.
 */
export const endVideoCall = async (callId) => {
  const response = await fetch(`${API_BASE}/api/video-calls/${callId}/end`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to end video call');
  }
  return await response.json();
};
