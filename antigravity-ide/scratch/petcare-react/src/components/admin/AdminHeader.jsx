import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  })();
  const adminName = storedUser.name || 'Dr. Sarah Jenkins';
  const adminRoleTitle = storedUser.title || 'Chief Clinical Admin';
  const adminEmail = storedUser.email || 'admin@odizo.com';

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    setShowUserMenu(false);
    navigate('/admin');
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-outline-variant/20 z-30 px-3 sm:px-6 flex items-center justify-between transition-all duration-300">
      {/* Left Area: Hamburger button (mobile/tablet) + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-xl">
        {/* Mobile / Tablet Hamburger Menu Button */}
        <button
          onClick={onToggleSidebar}
          type="button"
          className="lg:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[1.5rem]">menu</span>
        </button>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[1.125rem] sm:text-[1.25rem]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 sm:pr-12 py-1.5 sm:py-2 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white transition-all"
            placeholder="Search owners, vets, pets..."
            type="search"
          />
          <kbd className="hidden md:inline absolute right-3 top-1/2 -translate-y-1/2 text-[0.6875rem] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-2">
        {/* Urgent Escalations Banner (Visible on Desktop / Large Tablet) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-error-container/50 border border-error-container text-on-error-container">
          <span className="material-symbols-outlined text-error text-[1rem]">emergency</span>
          <span className="text-xs font-semibold text-error">Urgent Escalations</span>
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
        </div>

        {/* Swagger API Docs Button */}
        <a
          href="https://odizopetcare.onrender.com/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 sm:gap-1.5 text-[0.6875rem] sm:text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all shadow-xs"
          title="Open Swagger OpenAPI Documentation"
        >
          <span className="material-symbols-outlined text-[1rem] sm:text-[1.125rem]">api</span>
          <span className="hidden sm:inline">Swagger Docs</span>
        </a>

        {/* Portal Switcher */}
        <Link
          to="/owner-dashboard"
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[1rem]">swap_horiz</span>
          <span>View App</span>
        </Link>

        {/* Notifications Icon */}
        <button
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
          type="button"
          onClick={() => navigate('/admin/notifications')}
        >
          <span className="material-symbols-outlined text-[1.25rem]">notifications</span>
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[0.625rem] text-white font-bold">
            4
          </span>
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-surface-container-low transition-colors"
            type="button"
          >
            <img
              src="https://images.unsplash.com/photo-1594824813583-05b135767b36?auto=format&fit=crop&q=80&w=150"
              alt="Admin Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight">{adminName}</span>
              <span className="text-[0.6875rem] text-on-surface-variant leading-tight">{adminRoleTitle}</span>
            </div>
            <span className="hidden lg:inline material-symbols-outlined text-outline text-[1.125rem]">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface">{adminName}</p>
                <p className="text-[0.6875rem] text-on-surface-variant">{adminEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[1.125rem] text-outline">settings</span>
                  <span>Platform Settings</span>
                </Link>

                <a
                  href="https://odizopetcare.onrender.com/api-docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-on-surface hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[1.125rem] text-emerald-600">api</span>
                  <span>API Docs (Swagger)</span>
                </a>

                <Link
                  to="/owner-dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-primary font-semibold hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">swap_horiz</span>
                  <span>Switch to Pet Parent App</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-outline-variant/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-error hover:bg-error-container/30 text-left font-medium"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">logout</span>
                  <span>Log Out Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
