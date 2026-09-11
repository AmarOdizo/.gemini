// PetCare Veterinarian Suspension Utilities
// Provides multi-tab, cross-device, and resilient synchronization for suspended doctors

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

    // Dispatch global CustomEvent so all open components re-render immediately
    window.dispatchEvent(new CustomEvent('petcare_vets_updated', {
      detail: { vetId: targetId, isSuspended }
    }));
  } catch (e) {
    console.error("Error setting suspended status:", e);
  }
};
