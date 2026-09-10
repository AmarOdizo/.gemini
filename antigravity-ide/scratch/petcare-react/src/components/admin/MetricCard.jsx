import React from 'react';

const MetricCard = ({ title, value, icon, badge, badgeColor, subtext, trend, isAlert }) => {
  return (
    <div className={`bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between hover:shadow-md transition-all ${
      isAlert ? 'border-error/30 bg-error-container/10' : ''
    }`}>
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[0.625rem] sm:text-[0.6875rem] uppercase tracking-wider font-bold truncate ${
          isAlert ? 'text-error' : 'text-on-surface-variant'
        }`}>
          {title}
        </span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isAlert ? 'bg-error-container text-error' : 'bg-surface-container text-primary'
        }`}>
          <span className="material-symbols-outlined text-[1.125rem] sm:text-[1.25rem]">{icon}</span>
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <div className={`font-['Manrope'] text-xl sm:text-2xl font-bold tracking-tight truncate ${
          isAlert ? 'text-error' : 'text-on-surface'
        }`}>
          {value}
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {badge && (
            <span className={`inline-flex items-center gap-0.5 text-[0.625rem] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${badgeColor || 'bg-secondary-container text-on-secondary-container'}`}>
              {trend && <span className="material-symbols-outlined text-[0.75rem] sm:text-[0.875rem]">{trend}</span>}
              {badge}
            </span>
          )}
          {subtext && (
            <span className="text-[0.625rem] sm:text-xs text-on-surface-variant truncate">
              {subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
