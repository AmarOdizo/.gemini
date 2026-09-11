// PetCare Veterinarian Suspension Utilities & Doctor Notifications
// Provides multi-tab, cross-device, and resilient synchronization for suspended doctors

import supabase from '../supabaseClient';

const STORAGE_KEY = 'petcare_suspended_vets';

/**
 * Retrieve array of suspended vet IDs from localStorage
 */
export const getSuspendedVetIds = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Could not read suspended vets from localStorage", e);
    return [];
  }
};

/**
 * Check if a veterinarian is marked as suspended (via DB status or local sync)
 */
export const isVetSuspended = (vet) => {
  if (!vet) return false;
  
  // 1. Direct status attribute from MongoDB / API
  const statusStr = (vet.status || '').toString().toLowerCase();
  if (statusStr === 'suspended' || vet.isSuspended === true) {
    return true;
  }

  // 2. Cross-check against locally synchronized suspended list
  const suspendedIds = getSuspendedVetIds();
  const idCandidates = [
    vet._id,
    vet.id,
    vet.licenseNumber,
    vet.vciNumber
  ].filter(Boolean).map(String);

  return idCandidates.some(id => suspendedIds.includes(id));
};

/**
 * Mark a veterinarian as suspended or active in synchronization storage
 */
export const setVetSuspendedStatus = (vetId, isSuspended) => {
  if (!vetId) return;
  try {
    const currentList = getSuspendedVetIds().map(String);
    const targetId = String(vetId);
    let updated;

    if (isSuspended) {
      updated = Array.from(new Set([...currentList, targetId]));
    } else {
      updated = currentList.filter(id => id !== targetId);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Update currentUser in localStorage if the logged in user is this doctor
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const currentUserId = String(user._id || user.id);
        if (currentUserId === targetId || user.licenseNumber === targetId || user.vciNumber === targetId) {
          user.status = isSuspended ? 'suspended' : 'active';
          user.isSuspended = isSuspended;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
    } catch (_) {}

    // Dispatch global CustomEvent so all open components re-render immediately
    window.dispatchEvent(new CustomEvent('petcare_vets_updated', {
      detail: { vetId: targetId, isSuspended }
    }));
  } catch (e) {
    console.error("Error setting suspended status:", e);
  }
};

/**
 * Get stored notifications for a doctor
 */
export const getDoctorNotifications = (vetId) => {
  if (!vetId) return [];
  try {
    const key = `petcare_notifications_${vetId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn("Could not read notifications from localStorage", e);
    return [];
  }
};

/**
 * Save and dispatch a doctor notification
 */
export const addDoctorNotification = (vetId, notification) => {
  if (!vetId || !notification) return;
  try {
    const key = `petcare_notifications_${vetId}`;
    const current = getDoctorNotifications(vetId);
    const updated = [notification, ...current].slice(0, 30);
    localStorage.setItem(key, JSON.stringify(updated));

    // Dispatch custom event for immediate UI update in active tabs
    window.dispatchEvent(new CustomEvent('petcare_doctor_notification', {
      detail: { vetId: String(vetId), notification }
    }));
  } catch (e) {
    console.error("Error saving doctor notification:", e);
  }
};

/**
 * Clear stored notifications for a doctor
 */
export const clearDoctorNotifications = (vetId) => {
  if (!vetId) return;
  try {
    localStorage.removeItem(`petcare_notifications_${vetId}`);
  } catch (_) {}
};

/**
 * Send notification to doctor when suspended or unsuspended by Admin
 */
export const notifyDoctorStatusChange = (vetId, vetName, isSuspended) => {
  if (!vetId) return;
  const targetId = String(vetId);
  const cleanName = (vetName || 'Doctor').replace(/^Dr\.\s*/, '');

  const notif = {
    id: `status_${Date.now()}`,
    type: isSuspended ? 'error' : 'success',
    title: isSuspended ? 'Account Suspended by Admin' : 'Account Re-activated by Admin',
    message: isSuspended
      ? `Dr. ${cleanName}, your practice account has been suspended by the Clinical Administrator. Your profile is hidden and bookings are disabled.`
      : `Dr. ${cleanName}, your practice account has been activated and restored by the Clinical Administrator. You are now accepting appointments.`,
    status: isSuspended ? 'suspended' : 'active',
    timestamp: new Date().toISOString()
  };

  // 1. Store in doctor's persistent notification list
  addDoctorNotification(targetId, notif);

  // 2. Broadcast via Supabase realtime channel so the doctor gets instant popup if online
  try {
    if (supabase && supabase.channel) {
      const channel = supabase.channel(`notifications-${targetId}`);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'status-changed',
            payload: notif
          });
          setTimeout(() => {
            try {
              supabase.removeChannel(channel);
            } catch (_) {}
          }, 1500);
        }
      });
    }
  } catch (err) {
    console.warn("Realtime broadcast notice:", err.message);
  }
};
