import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 left-[17.5rem] right-0 h-16 bg-white/95 backdrop-blur-md border-b border-outline-variant/20 z-40 px-6 flex items-center justify-between">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.25rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-surface-container-low rounded-xl border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:bg-white transition-all"
            placeholder="Search owners, veterinarians, appointments, microchips..."
            type="search"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.75rem] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Urgent Escalations Banner */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-error-container/50 border border-error-container text-on-error-container">
          <span className="material-symbols-outlined text-error text-[1rem]">emergency</span>
          <span className="text-xs font-semibold text-error">Urgent Escalations</span>
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
        </div>

        {/* Portal Switcher */}
        <Link
          to="/owner-dashboard"
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[1rem]">swap_horiz</span>
          <span>View App</span>
        </Link>

        {/* Support Link */}
        <button
          onClick={() => alert("PetCare Clinical Admin Hotline: +1 (800) 555-PETCARE")}
          className="flex items-center gap-1 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.25rem]">help_outline</span>
          <span className="hidden md:inline">Support</span>
        </button>

        {/* Notifications Icon */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          type="button"
          onClick={() => navigate('/admin/notifications')}
        >
          <span className="material-symbols-outlined text-[1.25rem]">notifications</span>
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[0.625rem] text-white font-bold">
            3
          </span>
        </button>

        <div className="h-7 w-[1px] bg-outline-variant/30"></div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-1 rounded-lg hover:bg-surface-container-low p-1.5 transition-colors text-left"
            type="button"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight">Dr. Sarah Jenkins</span>
              <span className="text-[0.6875rem] text-on-surface-variant font-normal leading-tight">Chief Clinical Admin</span>
            </div>
            <span className="material-symbols-outlined text-[1.125rem] text-on-surface-variant">
              expand_more
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-outline-variant/30 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">Dr. Sarah Jenkins</p>
                <p className="text-[0.6875rem] text-on-surface-variant">admin@petcare.org</p>
              </div>
              <Link
                to="/admin/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[1rem]">settings</span>
                <span>Admin Settings</span>
              </Link>
              <Link
                to="/admin/veterinarians"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[1rem]">verified</span>
                <span>Verification Queue</span>
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('userToken');
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-error hover:bg-error-container/30 transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[1rem]">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
