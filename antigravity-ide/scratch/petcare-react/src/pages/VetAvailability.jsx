import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const DEFAULT_AVAILABILITY = [
  { day: "Monday", active: true, slots: ["09:00 AM", "05:00 PM"] },
  { day: "Tuesday", active: true, slots: ["09:00 AM", "05:00 PM"] },
  { day: "Wednesday", active: true, slots: ["09:00 AM", "05:00 PM"] },
  { day: "Thursday", active: true, slots: ["09:00 AM", "05:00 PM"] },
  { day: "Friday", active: true, slots: ["09:00 AM", "05:00 PM"] },
  { day: "Saturday", active: true, slots: ["10:00 AM", "02:00 PM"] },
  { day: "Sunday", active: false, slots: ["10:00 AM", "02:00 PM"] }
];

const TIME_OPTIONS = [
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", 
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM",
  "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM"
];

const VetAvailability = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [emergencyDuty, setEmergencyDuty] = useState(true);
  const [telehealthMode, setTelehealthMode] = useState(true);
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Fetch latest user data
    fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets/${parsedUser._id || parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const fetchedUser = data.data;
          setUser(fetchedUser);
          localStorage.setItem('currentUser', JSON.stringify(fetchedUser));
          
          if (fetchedUser.emergencyDuty !== undefined) setEmergencyDuty(fetchedUser.emergencyDuty);
          if (fetchedUser.telehealthMode !== undefined) setTelehealthMode(fetchedUser.telehealthMode);
          
          if (fetchedUser.availability && fetchedUser.availability.length > 0) {
            setAvailability(fetchedUser.availability);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching vet data:', err);
        setLoading(false);
      });
  }, [navigate]);

  const handleAvailabilityChange = (index, field, value) => {
    const newAvail = [...availability];
    if (field === 'active') {
      newAvail[index].active = value;
    } else if (field === 'start') {
      newAvail[index].slots[0] = value;
    } else if (field === 'end') {
      newAvail[index].slots[1] = value;
    }
    setAvailability(newAvail);
  };

  const handleReset = () => {
    setAvailability(DEFAULT_AVAILABILITY);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        emergencyDuty,
        telehealthMode,
        availability
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets/${user._id || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = { ...user, ...payload };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        alert('Availability schedule saved successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert("Error saving schedule: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-screen text-primary">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Manage Availability" subtitle="Configure your weekly consultation slots and emergency duty switches." />

        <div className="flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-surface-tint transition-all flex items-center gap-2"
          >
            {saving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
            {saving ? 'Saving...' : 'Save Schedule Settings'}
          </button>
        </div>

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
              <input type="checkbox" className="sr-only peer" checked={emergencyDuty} onChange={(e) => setEmergencyDuty(e.target.checked)} />
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
              <input type="checkbox" className="sr-only peer" checked={telehealthMode} onChange={(e) => setTelehealthMode(e.target.checked)} />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden mt-2">
          <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low flex justify-between items-center">
            <h3 className="font-headline-sm text-lg font-bold">Weekly Schedule Settings</h3>
            <button onClick={handleReset} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
              Reset to Default
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-on-surface-variant mb-6">Define your working hours for each day of the week. Uncheck the box to mark a day as Off-Duty.</p>
            
            <div className="space-y-4">
              {availability.map((dayObj, index) => (
                <div key={dayObj.day} className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-outline-variant/20 transition-colors ${dayObj.active ? 'bg-surface-bright hover:border-primary/40' : 'bg-surface-container-low opacity-70'}`}>
                  <label className="flex items-center gap-3 md:w-1/3">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary border-outline-variant focus:ring-primary" 
                      checked={dayObj.active} 
                      onChange={(e) => handleAvailabilityChange(index, 'active', e.target.checked)}
                    />
                    <span className="font-bold text-on-surface text-sm">{dayObj.day}</span>
                  </label>
                  <div className="flex items-center gap-3 md:flex-1">
                    <select 
                      value={dayObj.slots[0] || "09:00 AM"} 
                      disabled={!dayObj.active}
                      onChange={(e) => handleAvailabilityChange(index, 'start', e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 disabled:opacity-50 appearance-none" 
                    >
                      {TIME_OPTIONS.map(time => <option key={`start-${time}`} value={time}>{time}</option>)}
                    </select>
                    <span className="text-xs font-bold text-on-surface-variant uppercase">To</span>
                    <select 
                      value={dayObj.slots[1] || "05:00 PM"} 
                      disabled={!dayObj.active}
                      onChange={(e) => handleAvailabilityChange(index, 'end', e.target.value)}
                      className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 disabled:opacity-50 appearance-none" 
                    >
                      {TIME_OPTIONS.map(time => <option key={`end-${time}`} value={time}>{time}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </main>
  );
};

export default VetAvailability;
