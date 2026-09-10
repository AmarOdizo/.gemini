import React, { useState, useEffect } from 'react';
import AdminGenericPage from './AdminGenericPage';
import { adminApi } from '../../services/adminApi';

const AdminNotifications = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getNotifications();
      if (res.success && res.notifications) {
        setAlerts(res.notifications);
      }
    } catch (err) {
      console.error("Error loading notifications from MongoDB:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(alerts.map((a) => adminApi.markNotificationRead(a._id)));
      fetchNotifications();
    } catch (_) {}
  };

  return (
    <AdminGenericPage
      title="Clinical Alerts & Notifications"
      subtitle="System advisories, urgent tele-triage escalations, and practitioner alerts from MongoDB adminnotifications table."
      icon="notifications"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <span className="font-bold text-sm text-on-surface">Live Notification Stream ({alerts.length})</span>
          <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-primary hover:underline">
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-6 text-center text-xs text-on-surface-variant">
              {loading ? "Loading notifications from MongoDB..." : "No unread alerts in database."}
            </div>
          ) : (
            alerts.map((a) => (
              <div
                key={a._id}
                className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-4 ${
                  a.type === 'error'
                    ? 'bg-error-container/20 border-error/30'
                    : a.type === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : a.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-surface-container-low border-outline-variant/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-[1.25rem] ${
                    a.type === 'error' ? 'text-error' : a.type === 'warning' ? 'text-amber-700' : 'text-primary'
                  }`}>
                    {a.type === 'error' ? 'emergency' : a.type === 'warning' ? 'warning' : 'notifications'}
                  </span>
                  <div>
                    <div className="font-bold text-on-surface flex items-center gap-2">
                      <span>{a.title}</span>
                      {a.isRead && (
                        <span className="text-[0.625rem] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Read</span>
                      )}
                    </div>
                    <p className="text-on-surface-variant mt-0.5">{a.description}</p>
                  </div>
                </div>
                <span className="text-[0.6875rem] text-on-surface-variant font-medium shrink-0">
                  {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminGenericPage>
  );
};

export default AdminNotifications;
