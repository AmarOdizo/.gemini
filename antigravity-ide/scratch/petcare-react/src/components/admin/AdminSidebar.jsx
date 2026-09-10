import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'grid_view' },
    { name: 'Owners', path: '/admin/owners', icon: 'supervisor_account' },
    { 
      name: 'Veterinarians', 
      path: '/admin/veterinarians', 
      icon: 'stethoscope', 
      badge: '4 pending', 
      badgeClass: 'bg-surface-container-high text-on-surface' 
    },
    { name: 'Appointments', path: '/admin/appointments', icon: 'calendar_clock' },
    { 
      name: 'Consultations', 
      path: '/admin/consultations', 
      icon: 'videocam', 
      badge: '12 live', 
      isLive: true,
      badgeClass: 'bg-secondary-container text-on-secondary-container' 
    },
    { name: 'Prescriptions', path: '/admin/prescriptions', icon: 'prescriptions' },
    { name: 'Reviews & Ratings', path: '/admin/reviews', icon: 'grade' },
    { name: 'Reports', path: '/admin/reports', icon: 'clinical_notes' },
    { 
      name: 'Notifications', 
      path: '/admin/notifications', 
      icon: 'notifications', 
      badge: '3', 
      badgeClass: 'bg-error-container text-on-error-container' 
    },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-[17.5rem] bg-white border-r border-outline-variant/30 z-50 flex flex-col justify-between overflow-y-auto shadow-sm">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-outline-variant/20">
          <div className="w-10 h-10 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-xl shadow-sm">
            <span className="material-symbols-outlined text-[1.5rem]">pets</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Manrope'] text-lg text-primary tracking-tight font-bold">
              PetCare
            </span>
            <span className="text-[0.6875rem] text-on-surface-variant uppercase tracking-wider font-semibold">
              Clinical Admin
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-primary-container text-white font-semibold shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-[1.25rem] ${isActive ? 'text-white' : 'text-outline'}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeClass
                      }`}>
                        {item.isLive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                        )}
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Status & Logout */}
      <div className="p-3 space-y-2 border-t border-outline-variant/20">
        <a
          href="http://localhost:5001/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
          title="Open Swagger API Explorer for maintenance"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[1.125rem]">api</span>
            <span>API Docs (Swagger)</span>
          </div>
          <span className="material-symbols-outlined text-[0.875rem]">open_in_new</span>
        </a>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="text-xs text-on-surface font-semibold">MongoDB Atlas: Online</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-error text-sm font-medium hover:bg-error-container/40 hover:text-on-error-container transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.25rem]">logout</span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
