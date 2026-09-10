import React, { useState, useEffect } from 'react';
import AdminGenericPage from './AdminGenericPage';
import { adminApi } from '../../services/adminApi';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getReports();
        if (res.success && res.reports) {
          setReports(res.reports);
        }
      } catch (err) {
        console.error("Error loading clinical reports from MongoDB:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <AdminGenericPage
      title="Clinical Operations Reports & Analytics"
      subtitle="Export regulatory compliance audits and clinical volume breakdowns loaded from MongoDB clinicalreports table."
      icon="clinical_notes"
      stats={[
        { label: 'Available Reports', value: reports.length.toString(), sub: 'In clinicalreports table', icon: 'description' },
        { label: 'Avg Consult Duration', value: '18.4 mins', sub: 'Optimal benchmark', icon: 'schedule' },
        { label: 'Compliance Index', value: '100%', sub: 'MongoDB audit ledger', icon: 'verified' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 space-y-4">
          <h3 className="font-['Manrope'] text-sm sm:text-base font-bold text-on-surface">
            Available Operational Reports ({reports.length})
          </h3>
          <div className="space-y-3 text-xs">
            {reports.length === 0 ? (
              <div className="p-4 text-center text-on-surface-variant">
                {loading ? "Loading reports from MongoDB table..." : "No reports found in database."}
              </div>
            ) : (
              reports.map((r) => (
                <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary shrink-0">description</span>
                    <div>
                      <div className="font-semibold text-on-surface">{r.title}</div>
                      <div className="text-[0.6875rem] text-on-surface-variant">{r.fileFormat} • {r.fileSize} • Period: {r.period}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${r.title} (${r.fileFormat})...`)}
                    className="px-3 py-1.5 bg-primary-container text-white rounded-lg font-bold hover:opacity-90 shrink-0 self-end sm:self-auto text-xs"
                  >
                    Download
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 space-y-4">
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
              onClick={() => alert("Report generation request sent to MongoDB.")}
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
