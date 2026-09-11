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
 * Check if a veterinarian is verified and authorized to practice
 * Returns false if vet is pending verification, suspended, or rejected
 */
export const isVetApproved = (vet) => {
  if (!vet) return false;
  if (isVetSuspended(vet)) return false;

  const statusStr = (vet.status || '').toString().toLowerCase();
  if (statusStr === 'pending' || statusStr === 'rejected' || statusStr === 'suspended') {
    return false;
  }

  if (vet.isVerified === false) {
    return false;
  }

  return true;
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
 * Send notification to doctor when approved, rejected, suspended, or unsuspended by Admin
 */
export const notifyDoctorStatusChange = (vetId, vetName, actionOrIsSuspended, extraReason = '') => {
  if (!vetId) return;
  const targetId = String(vetId);
  const cleanName = (vetName || 'Doctor').replace(/^Dr\.\s*/, '');

  let title = 'Account Status Update';
  let message = '';
  let type = 'info';
  let status = 'active';

  if (actionOrIsSuspended === 'approve') {
    title = 'Account Verification Approved! 🎉';
    message = `Congratulations Dr. ${cleanName}! Your veterinary credentials and medical license have been verified and approved by the Chief Clinical Administrator. Your profile is now live for pet parents.`;
    type = 'success';
    status = 'active';
  } else if (actionOrIsSuspended === 'reject') {
    title = 'Account Verification Disapproved';
    message = `Dr. ${cleanName}, your profile verification was not approved. ${extraReason ? `Reason: ${extraReason}` : 'Please review and submit updated credentials.'}`;
    type = 'error';
    status = 'rejected';
  } else if (actionOrIsSuspended === 'suspend' || actionOrIsSuspended === true) {
    title = 'Account Suspended by Admin';
    message = `Dr. ${cleanName}, your practice account has been suspended by the Clinical Administrator. Your profile is hidden and bookings are disabled.`;
    type = 'error';
    status = 'suspended';
  } else {
    // unsuspend / activate / false
    title = 'Account Re-activated by Admin';
    message = `Dr. ${cleanName}, your practice account has been activated and restored by the Clinical Administrator. You are now accepting appointments.`;
    type = 'success';
    status = 'active';
  }

  const notif = {
    id: `status_${Date.now()}`,
    type,
    title,
    message,
    status,
    timestamp: new Date().toISOString()
  };

  // 1. Store in doctor's persistent notification list
  addDoctorNotification(targetId, notif);

  // 2. Synchronize currentUser in localStorage if currently logged in as this doctor
  try {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const currentUserId = String(user._id || user.id);
      if (currentUserId === targetId || user.licenseNumber === targetId || user.vciNumber === targetId) {
        user.status = status;
        user.isVerified = (status === 'active');
        user.isSuspended = (status === 'suspended');
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('petcare_user_updated', { detail: user }));
      }
    }
  } catch (_) {}

  // 3. Broadcast via Supabase realtime channel so the doctor gets instant popup if online
  try {
    if (supabase && supabase.channel) {
      const channel = supabase.channel(`notifications-${targetId}`);
      channel.subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
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
