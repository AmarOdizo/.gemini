const getBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5001';
};

export const API_BASE = getBaseUrl();

export const adminApi = {
  // 1. Metrics from Database Collections
  getMetrics: async () => {
    const res = await fetch(`${API_BASE}/api/admin/metrics`);
    return await res.json();
  },

  // 2. Appointments collection
  getAppointments: async () => {
    const res = await fetch(`${API_BASE}/api/admin/appointments`);
    return await res.json();
  },

  // 3. Vets collection
  getVets: async () => {
    const res = await fetch(`${API_BASE}/api/admin/vets`);
    return await res.json();
  },

  // 4. Verify/Reject Vet in Vets collection
  verifyVet: async (id, action, reason = '') => {
    const res = await fetch(`${API_BASE}/api/admin/vets/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason, verifiedBy: 'Chief Clinical Admin' })
    });
    return await res.json();
  },

  // 5. Users & Pets collections
  getOwners: async () => {
    const res = await fetch(`${API_BASE}/api/admin/owners`);
    return await res.json();
  },

  // 6. Prescriptions collection
  getPrescriptions: async () => {
    const res = await fetch(`${API_BASE}/api/admin/prescriptions`);
    return await res.json();
  },

  // 7. Clinical Reports collection
  getReports: async () => {
    const res = await fetch(`${API_BASE}/api/admin/reports`);
    return await res.json();
  },

  // 8. Clinical Advisories collection
  getAdvisories: async () => {
    const res = await fetch(`${API_BASE}/api/admin/advisories`);
    return await res.json();
  },

  // Post Advisory
  broadcastAdvisory: async (data) => {
    const res = await fetch(`${API_BASE}/api/admin/advisories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // 9. Admin Notifications collection
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/api/admin/notifications`);
    return await res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/api/admin/notifications/${id}/read`, {
      method: 'PUT'
    });
    return await res.json();
  },

  // 10. Reviews collection
  getReviews: async () => {
    const res = await fetch(`${API_BASE}/api/admin/reviews`);
    return await res.json();
  },

  // 11. Platform Settings collection
  getSettings: async () => {
    const res = await fetch(`${API_BASE}/api/admin/settings`);
    return await res.json();
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return await res.json();
  },

  // 12. Consultation Telemetry collection
  getTelemetry: async (appointmentId) => {
    const res = await fetch(`${API_BASE}/api/admin/telemetry/${appointmentId}`);
    return await res.json();
  }
};
