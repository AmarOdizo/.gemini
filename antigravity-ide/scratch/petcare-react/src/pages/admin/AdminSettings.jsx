import React, { useState, useEffect } from 'react';
import AdminGenericPage from './AdminGenericPage';
import { adminApi } from '../../services/adminApi';

const AdminSettings = () => {
  const [platformName, setPlatformName] = useState('PetCare Tele-Veterinary Network');
  const [emergencyHotline, setEmergencyHotline] = useState('+1 (800) 555-PETCARE');
  const [autoTriage, setAutoTriage] = useState(true);
  const [consultationFee, setConsultationFee] = useState(45);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getSettings();
        if (res.success && res.settings) {
          setPlatformName(res.settings.platformName || 'PetCare Tele-Veterinary Network');
          setEmergencyHotline(res.settings.emergencyHotline || '+1 (800) 555-PETCARE');
          setAutoTriage(res.settings.autoTriageEnabled ?? true);
          setConsultationFee(res.settings.consultationFee || 45);
        }
      } catch (err) {
        console.error("Error loading settings from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateSettings({
        platformName,
        emergencyHotline,
        autoTriageEnabled: autoTriage,
        consultationFee: Number(consultationFee)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert("Error saving settings: " + err.message);
    }
  };

  return (
    <AdminGenericPage
      title="Clinical Platform Settings"
      subtitle="Configure clinical governance rules and hotline routing saved directly in MongoDB platformsettings table."
      icon="settings"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {saved && (
            <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold">
              ✓ Platform settings saved directly to MongoDB platformsettings collection!
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

          <div>
            <label className="block font-bold text-on-surface mb-1">Base Telehealth Consultation Fee ($)</label>
            <input
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low"
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <div>
              <div className="font-bold text-on-surface">Automatic AI-Assisted Triage Prioritization</div>
              <div className="text-on-surface-variant text-[0.6875rem]">
                Automatically marks acute respiratory or trauma complaints as Priority 1 (Emergency).
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoTriage}
              onChange={(e) => setAutoTriage(e.target.checked)}
              className="w-4 h-4 text-primary rounded shrink-0 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container shadow-sm transition-colors text-center"
            >
              Save Configuration to Database
            </button>
          </div>
        </form>
      </div>
    </AdminGenericPage>
  );
};

export default AdminSettings;
