import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetSidebar from '../components/VetSidebar';
import TopNav from '../components/TopNav';

const VetAvailability = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <VetSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Manage Availability" subtitle="Configure your weekly consultation slots and emergency duty switches." />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 uppercase tracking-wider">
                24/7 On-Call Duty
              </span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">Emergency On-Call</h3>
              <p className="text-xs text-on-surface-variant">Allow urgent emergency calls at ₹999/call.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                Consultation Modes
              </span>
              <h3 className="font-headline-sm text-base font-bold text-on-surface">Accept Telehealth Calls</h3>
              <p className="text-xs text-on-surface-variant">Toggle video consultations on/off.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden mt-2">
          <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low flex justify-between items-center">
            <h3 className="font-headline-sm text-lg font-bold">Weekly Schedule Settings</h3>
            <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
              Reset to Default
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-on-surface-variant mb-6">Define your working hours for each day of the week. Uncheck the box to mark a day as Off-Duty.</p>
            
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 bg-surface-bright p-4 rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors">
                  <label className="flex items-center gap-3 md:w-1/3">
                    <input type="checkbox" className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary" defaultChecked />
                    <span className="font-bold text-on-surface text-sm">{day}</span>
                  </label>
                  <div className="flex items-center gap-3 md:flex-1">
                    <input type="time" defaultValue="09:00" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                    <span className="text-xs font-bold text-on-surface-variant uppercase">To</span>
                    <input type="time" defaultValue="17:00" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1" />
                  </div>
                </div>
              ))}
              
              {['Saturday', 'Sunday'].map((day, idx) => (
                <div key={day} className="flex flex-col md:flex-row md:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
                  <label className="flex items-center gap-3 md:w-1/3 opacity-60">
                    <input type="checkbox" className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary" defaultChecked={idx === 0} />
                    <span className="font-bold text-on-surface text-sm">{day}</span>
                  </label>
                  <div className="flex items-center gap-3 md:flex-1">
                    <input type="time" defaultValue="10:00" disabled={idx === 1} className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm disabled:opacity-50" />
                    <span className="text-xs font-bold text-on-surface-variant uppercase">To</span>
                    <input type="time" defaultValue="14:00" disabled={idx === 1} className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm disabled:opacity-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VetAvailability;
