import React from 'react';

const MetricCard = ({ title, value, icon, badge, badgeColor, subtext, trend, isAlert }) => {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-all ${
      isAlert ? 'border-error/30 bg-error-container/10' : ''
    }`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[0.6875rem] uppercase tracking-wider font-bold ${
          isAlert ? 'text-error' : 'text-on-surface-variant'
        }`}>
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isAlert ? 'bg-error-container text-error' : 'bg-surface-container text-primary'
        }`}>
          <span className="material-symbols-outlined text-[1.25rem]">{icon}</span>
        </div>
      </div>

      <div className="mt-3">
        <div className={`font-['Manrope'] text-2xl font-bold tracking-tight ${
          isAlert ? 'text-error' : 'text-on-surface'
        }`}>
          {value}
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {badge && (
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${badgeColor || 'bg-secondary-container text-on-secondary-container'}`}>
              {trend && <span className="material-symbols-outlined text-[0.875rem]">{trend}</span>}
              {badge}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-on-surface-variant truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
