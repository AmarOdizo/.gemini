import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';

const VetSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vet, setVet] = useState({ name: 'Doctor', vciNumber: 'VCI-0000' });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setVet(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
      isActive
        ? 'bg-primary text-white font-bold shadow-sm scale-[0.98]'
        : 'text-on-surface-variant hover:bg-surface-container'
    }`;

  return (
    <>
      <nav className="bg-surface-container-low border-r border-outline-variant/30 hidden md:flex flex-col h-screen w-[280px] p-6 gap-4 fixed left-0 top-0 z-40 no-print">
        {/* Header Brand */}
        <Link to="/" className="flex items-center gap-3 mb-6 px-2">
          <span className="material-symbols-outlined text-primary text-3xl filled-icon">pets</span>
          <div>
            <h1 className="font-headline-sm text-lg font-black text-primary">
              Paws<span className="text-[#FF9933]">India</span> 🇮🇳
            </h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              Doctor Command Portal
            </p>
          </div>
        </Link>

        {/* Doctor Profile Quick Badge */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-surface-container">
            <img 
              src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop"}
              alt={vet.name} 
              className="w-full h-full object-cover" 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop"; }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-headline-sm text-xs font-bold text-primary truncate">{vet.name}</h2>
            <p className="text-[11px] text-on-surface-variant truncate font-medium">{vet.vciNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Main Nav Links */}
        <div className="flex flex-col gap-1.5 flex-grow">
          <NavLink to="/doctor-dashboard" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-label-md text-xs">Doctor Dashboard</span>
          </NavLink>
          <NavLink to="/vet-appointments" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            <span className="font-label-md text-xs">Patient Consultations</span>
          </NavLink>
          <NavLink to="/vet-availability" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            <span className="font-label-md text-xs">Manage Availability</span>
          </NavLink>
          <NavLink to="/prescribe" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">medical_services</span>
            <span className="font-label-md text-xs">Digital Prescriptions</span>
          </NavLink>
          <NavLink to="/vet-earnings" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            <span className="font-label-md text-xs">Earnings & Payouts</span>
          </NavLink>
          <NavLink to="/doctor-profile" className={navLinkClass}>
            <span className="material-symbols-outlined text-[20px] filled-icon">badge</span>
            <span className="font-label-md text-xs">Doctor Profile / VCI</span>
          </NavLink>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-outline-variant/20">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:bg-surface-container transition-all rounded-xl text-xs font-semibold cursor-pointer w-full text-left">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout Doctor</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-2 flex justify-between items-center shadow-[0_-4px_24px_rgba(0,0,0,0.05)] pb-safe">
        <NavLink to="/doctor-dashboard" className={({ isActive }) => `flex flex-col items-center py-2 px-3 rounded-lg ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/doctor-dashboard' ? 'filled-icon' : ''}`}>dashboard</span>
          <span className="text-[10px] font-bold mt-1">Dashboard</span>
        </NavLink>
        <NavLink to="/vet-appointments" className={({ isActive }) => `flex flex-col items-center py-2 px-3 rounded-lg ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/vet-appointments' ? 'filled-icon' : ''}`}>calendar_today</span>
          <span className="text-[10px] font-bold mt-1">Visits</span>
        </NavLink>
        <NavLink to="/prescribe" className={({ isActive }) => `flex flex-col items-center py-2 px-3 rounded-lg ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/prescribe' ? 'filled-icon' : ''}`}>medical_services</span>
          <span className="text-[10px] font-bold mt-1">Rx</span>
        </NavLink>
        <NavLink to="/doctor-profile" className={({ isActive }) => `flex flex-col items-center py-2 px-3 rounded-lg ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className={`material-symbols-outlined text-[22px] ${location.pathname === '/doctor-profile' ? 'filled-icon' : ''}`}>badge</span>
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="flex flex-col items-center py-2 px-3 rounded-lg text-error hover:bg-error-container/20 transition-colors">
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-[10px] font-bold mt-1">Logout</span>
        </button>
      </div>
    </>
  );
};

export default VetSidebar;
