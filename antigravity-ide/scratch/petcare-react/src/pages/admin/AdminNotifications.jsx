import React from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminNotifications = () => {
  const alerts = [
    { title: 'Urgent Triage Request', desc: 'Canine respiratory distress reported in Seattle region. Fast-track tele-vet assigned.', time: '12 mins ago', type: 'error' },
    { title: 'Veterinarian Credential Submission', desc: 'Dr. Jonathan Blake submitted updated California state veterinary license.', time: '45 mins ago', type: 'info' },
    { title: 'System Security Audit Clean', desc: 'Automated end-to-end encryption audit completed with 0 vulnerability flags.', time: '2 hours ago', type: 'success' },
    { title: 'Doctor Account Verification Due', desc: 'Dr. Amanda Thorne credential review pending in queue for 24+ hours.', time: '4 hours ago', type: 'warning' }
  ];

  return (
    <AdminGenericPage
      title="Clinical Alerts & Notifications"
      subtitle="System advisories, urgent tele-triage escalations, and practitioner credential notifications."
      icon="notifications"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
          <span className="font-bold text-sm text-on-surface">Live Notification Stream</span>
          <button onClick={() => alert("All notifications marked as read.")} className="text-xs font-bold text-primary hover:underline">
            Mark all as read
          </button>
        </div>

        <div className="space-y-3">
          {alerts.map((a, i) => (
            <div
              key={i}
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
                  <div className="font-bold text-on-surface">{a.title}</div>
                  <p className="text-on-surface-variant mt-0.5">{a.desc}</p>
                </div>
              </div>
              <span className="text-[0.6875rem] text-on-surface-variant font-medium shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminGenericPage>
  );
};

export default AdminNotifications;
