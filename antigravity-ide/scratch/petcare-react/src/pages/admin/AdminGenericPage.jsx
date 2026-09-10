import React from 'react';

const AdminGenericPage = ({ title, subtitle, icon, stats, children }) => {
  return (
    <div className="p-6 max-w-[100rem] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] text-2xl font-bold text-on-surface tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</span>
                <div className="text-2xl font-bold font-['Manrope'] text-on-surface mt-1">{s.value}</div>
                <span className="text-xs text-secondary font-semibold">{s.sub}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-surface-container text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">{s.icon || icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default AdminGenericPage;
