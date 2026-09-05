import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const OwnerSidebar = () => {
  const navigate = useNavigate();

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
    <nav className="bg-surface/80 backdrop-blur-md border-r border-outline-variant/30 hidden md:flex flex-col h-screen w-[280px] p-6 gap-6 fixed left-0 top-0 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Header Brand */}
      <Link to="/" className="flex items-center gap-3 mb-4 px-2 group">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-primary text-2xl filled-icon">pets</span>
        </div>
        <div>
          <h1 className="font-headline-sm text-xl font-black text-primary tracking-tight">
            Paws<span className="text-[#FF9933]">India</span> 🇮🇳
          </h1>
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
          <span className="material-symbols-outlined text-[20px]">help</span>
          Help & Support
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-error hover:bg-error-container/30 transition-all rounded-xl cursor-pointer w-full text-left font-bold text-sm group">
          <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-1 transition-transform">logout</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default OwnerSidebar;
