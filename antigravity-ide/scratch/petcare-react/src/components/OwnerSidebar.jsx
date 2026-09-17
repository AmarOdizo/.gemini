import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

const OwnerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link flex items-center gap-md px-4 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden ${
      isActive
        ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-bold shadow-sm border border-primary/10 scale-[0.98]'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface hover:translate-x-1'
    }`;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="bg-surface/80 backdrop-blur-md border-r border-outline-variant/30 hidden md:flex flex-col h-screen w-[280px] p-6 gap-6 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Header Brand */}
        <Link to="/" className="flex items-center mb-4 px-2 group">
          <div>
            <Logo iconSize="text-3xl" textSize="text-xl" />
            <p className="font-label-md text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Veterinary Portal</p>
          </div>
        </Link>
        
        {/* Main Nav Links */}
        <div className="flex flex-col gap-2 flex-grow">
          <NavLink to="/owner-dashboard" className={navLinkClass}>
            <span className="material-symbols-outlined filled-icon text-[22px]">dashboard</span>
            <span className="font-label-md text-sm">Dashboard</span>
          </NavLink>
          <NavLink to="/find-vets" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">search</span>
            <span className="font-label-md text-sm">Find Vets</span>
          </NavLink>
          <NavLink to="/my-pets" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">pets</span>
            <span className="font-label-md text-sm">My Pets</span>
          </NavLink>
          <NavLink to="/appointments" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
            <span className="font-label-md text-sm">Appointments</span>
          </NavLink>
          <NavLink to="/prescription" className={navLinkClass}>
            <span className="material-symbols-outlined text-[22px]">medical_services</span>
            <span className="font-label-md text-sm">Prescriptions</span>
          </NavLink>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <Link to="/find-vets" className="w-full bg-gradient-to-r from-[#FF7F50] to-[#FF9933] text-white font-label-md text-sm py-3 rounded-xl font-bold mb-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center block">
            Book Appointment
          </Link>
          <button className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-all rounded-xl w-full text-left font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">feedback</span>
            Feedback
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/30 transition-all rounded-xl cursor-pointer w-full text-left font-bold text-sm group">
            <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-1 flex justify-between items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)] pb-safe">
        <NavLink to="/owner-dashboard" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/owner-dashboard' ? 'filled-icon' : ''}`}>dashboard</span>
          <span className="text-[9px] font-bold mt-1">Home</span>
        </NavLink>
        <NavLink to="/find-vets" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/find-vets' ? 'filled-icon' : ''}`}>search</span>
          <span className="text-[9px] font-bold mt-1">Search</span>
        </NavLink>
        <NavLink to="/my-pets" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/my-pets' ? 'filled-icon' : ''}`}>pets</span>
          <span className="text-[9px] font-bold mt-1">Pets</span>
        </NavLink>
        <NavLink to="/appointments" className={({ isActive }) => `flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/appointments' ? 'filled-icon' : ''}`}>calendar_today</span>
          <span className="text-[9px] font-bold mt-1">Visits</span>
        </NavLink>
        
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`flex flex-col items-center py-2 px-2 rounded-lg flex-1 ${mobileMenuOpen ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${mobileMenuOpen ? 'filled-icon' : ''}`}>menu</span>
          <span className="text-[9px] font-bold mt-1">More</span>
        </button>
      </div>

      {/* Mobile More Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute bottom-[60px] right-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-48 overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col py-1">
              <NavLink to="/prescription" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `flex items-center gap-3 px-4 py-3 text-sm font-bold ${isActive ? 'text-primary bg-primary/10' : 'text-on-surface hover:bg-surface-container'}`}>
                <span className="material-symbols-outlined text-[20px]">medical_services</span> Rx
              </NavLink>
              <button className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-on-surface hover:bg-surface-container w-full text-left transition-colors">
                <span className="material-symbols-outlined text-[20px]">feedback</span> Feedback
              </button>
              <div className="h-px bg-outline-variant/30 my-1 mx-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-error hover:bg-error-container/20 w-full text-left transition-colors">
                <span className="material-symbols-outlined text-[20px]">logout</span> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerSidebar;
