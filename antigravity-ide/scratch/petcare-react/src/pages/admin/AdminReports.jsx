import React from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminReports = () => {
  return (
    <AdminGenericPage
      title="Clinical Operations Reports & Analytics"
      subtitle="Export regulatory compliance audits, clinical volume breakdowns, and revenue statistics."
      icon="clinical_notes"
      stats={[
        { label: 'Total Tele-Sessions', value: '3,892', sub: 'Year to date', icon: 'videocam' },
        { label: 'Avg Consult Duration', value: '18.4 mins', sub: 'Optimal benchmark', icon: 'schedule' },
        { label: 'Compliance Index', value: '99.8%', sub: 'Zero audit flags', icon: 'verified' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <h3 className="font-['Manrope'] text-base font-bold text-on-surface">Available Operational Reports</h3>
          <div className="space-y-3 text-xs">
            {[
              { name: 'Monthly Telehealth Practice Compliance Audit (PDF)', size: '2.4 MB' },
              { name: 'State Veterinary Board Credentialing Summary (CSV)', size: '890 KB' },
              { name: 'Patient Outcome & Tele-Triage Resolution Metrics', size: '1.8 MB' },
              { name: 'Controlled Substances & Pharmacy Fulfillment Log', size: '450 KB' }
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="font-semibold text-on-surface">{r.name}</span>
                </div>
                <button
                  onClick={() => alert(`Downloading ${r.name}...`)}
                  className="px-3 py-1.5 bg-primary-container text-white rounded-lg font-bold hover:opacity-90"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <h3 className="font-['Manrope'] text-base font-bold text-on-surface">Custom Report Generator</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-on-surface mb-1">Select Department</label>
              <select className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant/40">
                <option>All Clinical Departments</option>
                <option>Emergency & Critical Triage</option>
                <option>Internal Medicine</option>
                <option>Dermatology</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-on-surface mb-1">Reporting Period</label>
              <select className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant/40">
                <option>Current Quarter (Q4 2023)</option>
                <option>Last 30 Days</option>
                <option>Year To Date</option>
              </select>
            </div>
            <button
              onClick={() => alert("Generating customized clinical data report...")}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </AdminGenericPage>
  );
};

export default AdminReports;
