const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Localhost or loopback
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5001';
    }
    // Mobile or Tablet on local Wi-Fi / LAN IP (192.168.x.x, 10.x.x.x, etc.)
    if (/^192\.168\./.test(hostname) || /^10\./.test(hostname) || /^172\./.test(hostname)) {
      return `http://${hostname}:5001`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('onrender.com')) {
    return envUrl;
  }
  return 'http://localhost:5001';
};

export const API_BASE = getBaseUrl();

// Resilient fetch helper: tries direct API port first, falls back to Vite proxy /api
const request = async (path, options = {}) => {
  const directUrl = `${API_BASE}${path}`;
  try {
    const res = await fetch(directUrl, options);
    if (res.ok) {
      return await res.json();
    }
    // If not ok (e.g. 404/500), try fallback to relative proxy path
  } catch (err) {
    console.warn(`[adminApi] Direct fetch to ${directUrl} failed, falling back to Vite proxy (${path}):`, err.message);
  }

  // Fallback via relative URL (handled by Vite proxy)
  try {
    const fallbackRes = await fetch(path, options);
    return await fallbackRes.json();
  } catch (fallbackErr) {
    console.error(`[adminApi] Fallback fetch failed for ${path}:`, fallbackErr);
    return { success: false, message: fallbackErr.message };
  }
};

export const adminApi = {
  // 1. Metrics from Database Collections
  getMetrics: async () => {
    return await request('/api/admin/metrics');
  },

  // 2. Appointments collection
  getAppointments: async () => {
    return await request('/api/admin/appointments');
  },

  // 3. Vets collection
  getVets: async () => {
    return await request('/api/admin/vets');
  },

  // 4. Verify/Reject Vet in Vets collection
  verifyVet: async (id, action, reason = '') => {
    return await request(`/api/admin/vets/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, verifiedBy: 'Chief Clinical Admin' })
    });
  },

  // 5. Users & Pets collections
  getOwners: async () => {
    return await request('/api/admin/owners');
  },

  // 6. Prescriptions collection
  getPrescriptions: async () => {
    return await request('/api/admin/prescriptions');
  },

  // 7. Clinical Reports collection
  getReports: async () => {
    return await request('/api/admin/reports');
  },

  // 8. Clinical Advisories collection
  getAdvisories: async () => {
    return await request('/api/admin/advisories');
  },

  // Post Advisory
  broadcastAdvisory: async (data) => {
    return await request('/api/admin/advisories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // 9. Admin Notifications collection
  getNotifications: async () => {
    return await request('/api/admin/notifications');
  },

  markNotificationRead: async (id) => {
    return await request(`/api/admin/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  // 10. Reviews collection
  getReviews: async () => {
    return await request('/api/admin/reviews');
  },

  // 11. Platform Settings collection
  getSettings: async () => {
    return await request('/api/admin/settings');
  },

  updateSettings: async (settings) => {
    return await request('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  },

  // 12. Consultation Telemetry collection
  getTelemetry: async (appointmentId) => {
    return await request(`/api/admin/telemetry/${appointmentId}`);
  }
};
