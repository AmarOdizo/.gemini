import React, { useState } from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminSettings = () => {
  const [platformName, setPlatformName] = useState('PetCare Tele-Veterinary Network');
  const [emergencyHotline, setEmergencyHotline] = useState('+1 (800) 555-PETCARE');
  const [autoTriage, setAutoTriage] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminGenericPage
      title="Clinical Platform Settings"
      subtitle="Configure clinical governance rules, WebRTC streaming quality thresholds, and emergency hotline routing."
      icon="settings"
    >
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {saved && (
            <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold">
              ✓ Platform settings saved successfully!
            </div>
          )}

          <div>
            <label className="block font-bold text-on-surface mb-1">Platform Brand & Facility Name</label>
            <input
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low"
            />
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Emergency Escalation Hotline</label>
            <input
              value={emergencyHotline}
              onChange={(e) => setEmergencyHotline(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div>
              <div className="font-bold text-on-surface">Automatic AI-Assisted Triage Prioritization</div>
              <div className="text-on-surface-variant text-[0.6875rem]">
                Automatically marks respiratory or trauma complaints as Priority 1 (Emergency).
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoTriage}
              onChange={(e) => setAutoTriage(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container shadow-sm"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </AdminGenericPage>
  );
};

export default AdminSettings;
