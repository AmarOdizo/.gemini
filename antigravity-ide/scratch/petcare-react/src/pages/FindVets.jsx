import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { isVetSuspended, isVetApproved } from '../utils/suspensionUtils';
import { checkVetOnlineStatus } from '../utils/availabilityUtils';

const getAvailabilitySummary = (availability) => {
  if (!availability || !Array.isArray(availability) || availability.length === 0) return 'Available for consultation';
  const activeDays = availability.filter(a => a.active);
  if (activeDays.length === 0) return 'Currently unavailable';
  
  const firstSlot = activeDays[0].slots;
  const timeString = firstSlot && firstSlot.length >= 2 ? `${firstSlot[0]} - ${firstSlot[1]}` : '';
  
  if (activeDays.length === 7) return timeString ? `Mon-Sun • ${timeString}` : `Mon-Sun`;
  
  const isMonToFri = activeDays.length >= 5 && activeDays.every(a => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(a.day));
  if (isMonToFri && activeDays.length === 5) return timeString ? `Mon-Fri • ${timeString}` : `Mon-Fri`;
  
  const daysShort = activeDays.map(a => a.day.substring(0, 3)).join(', ');
  const displayDays = daysShort.length > 18 ? `${activeDays.length} Days/Week` : daysShort;
  
  return timeString ? `${displayDays} • ${timeString}` : displayDays;
};

const FindVets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const isEmergency = new URLSearchParams(location.search).get('emergency') === 'true';

  const fetchVets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets`);
      if (res.ok) {
        const data = await res.json();
        // Only show approved and verified veterinarians to pet owners
        let availableVets = (data.data || []).filter(vet => isVetApproved(vet));
        
        if (isEmergency) {
          availableVets = availableVets.filter(vet => vet.emergencyDuty);
        }
        
        setVets(availableVets);
      }
    } catch (err) {
      console.error("Error fetching vets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVets();

    // Listen for live suspension updates from Admin in real-time
    const handleSync = () => fetchVets();
    window.addEventListener('petcare_vets_updated', handleSync);
    return () => window.removeEventListener('petcare_vets_updated', handleSync);
  }, [isEmergency]);

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        <TopNav title={isEmergency ? "Emergency On-Call Doctors" : "Find a Veterinarian"} subtitle={isEmergency ? "These doctors are available for urgent 24/7 emergency consultations." : "Search and book appointments with top verified vets across India."} />

        <div className="flex flex-col md:flex-row gap-2 justify-between items-center bg-surface-container-low/80 backdrop-blur-md p-2.5 md:p-3 rounded-xl border border-outline-variant/30 shadow-sm sticky top-14 z-20">
          <div className="relative w-full md:w-1/2 group">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[18px] group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 rounded-lg font-bold text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all shadow-sm text-on-surface" 
              placeholder="Search by name, specialization, or city..." 
            />
          </div>
          <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
            <button className="whitespace-nowrap px-3 py-1.5 bg-primary text-on-primary rounded-lg font-bold text-[11px] shadow-sm hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span> All Vets
            </button>
            <button className="whitespace-nowrap px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant rounded-lg text-[11px] hover:bg-surface-container-low hover:border-outline-variant transition-all font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">videocam</span> Telehealth
            </button>
            <button className="whitespace-nowrap px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant rounded-lg text-[11px] hover:bg-surface-container-low hover:border-outline-variant transition-all font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">content_cut</span> Surgeons
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
                <div className="h-28 bg-surface-container-high/50 w-full"></div>
                <div className="p-3 flex-grow flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="h-4 w-1/2 bg-surface-container-high/50 rounded"></div>
                    <div className="h-4 w-10 bg-surface-container-high/50 rounded"></div>
                  </div>
                  <div className="h-3 w-1/3 bg-surface-container-high/50 rounded"></div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-14 bg-surface-container-high/50 rounded"></div>
                    <div className="h-5 w-16 bg-surface-container-high/50 rounded"></div>
                  </div>
                  <div className="mt-auto pt-2 border-t border-outline-variant/30 flex justify-between items-center">
                    <div className="h-5 w-12 bg-surface-container-high/50 rounded"></div>
                    <div className="h-7 w-20 bg-surface-container-high/50 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))
          ) : vets.length > 0 ? (
            vets.map(vet => {
              const isOnline = checkVetOnlineStatus(vet);
              return (
              <div key={vet._id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col group h-full">
                <div className="relative h-28 overflow-hidden bg-surface-container">
                  <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop"} alt={vet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {isOnline ? (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-black text-emerald-700 flex items-center gap-1 shadow-sm uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-black text-on-surface-variant flex items-center gap-1 shadow-sm uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> Offline
                    </div>
                  )}
                </div>
                <div className="p-3 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-headline-sm font-black text-xs text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{vet.name}</h3>
                      <p className="text-[9px] font-bold text-on-surface-variant bg-surface-container-low border border-outline-variant/30 px-1.5 py-0.5 rounded inline-block mt-0.5 uppercase tracking-wider">{vet.vciNumber || 'VCI Verified'}</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black text-[10px] border border-amber-200 shrink-0">
                      <span className="material-symbols-outlined text-[12px] filled-icon">star</span> 4.9
                    </div>
                  </div>
                  <p className="text-[11px] text-primary font-bold mb-1.5 line-clamp-1">{vet.qualification}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {vet.specialization && vet.specialization.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="text-[9px] uppercase tracking-wider font-bold bg-secondary-container/30 text-on-secondary-container px-1.5 py-0.5 rounded border border-secondary-container/50">
                        {spec}
                      </span>
                    ))}
                    {vet.specialization && vet.specialization.length > 2 && (
                      <span className="text-[9px] uppercase tracking-wider font-bold bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded border border-outline-variant/40">
                        +{vet.specialization.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant font-bold bg-surface-container-low border border-outline-variant/30 rounded-md px-1.5 py-1 mb-2">
                    <span className="material-symbols-outlined text-[14px] text-primary">calendar_clock</span>
                    {getAvailabilitySummary(vet.availability)}
                  </div>

                  <div className="mt-auto pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider">Fee</span>
                      <span className="font-black text-primary text-sm">₹{vet.consultationFee || 499}</span>
                    </div>
                    {isOnline ? (
                      <Link to={`/owner-dashboard/vet-profile?id=${vet._id}`} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm hover:bg-primary-container transition-all hover:shadow-md flex items-center gap-0.5 group/btn">
                        Book <span className="material-symbols-outlined text-[14px] group-hover/btn:translate-x-0.5 transition-transform">arrow_forward</span>
                      </Link>
                    ) : (
                      <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-not-allowed flex items-center gap-0.5">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )})
          ) : (
            <div className="col-span-full py-10 text-center bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center">
               <div className="w-14 h-14 bg-surface-container-low rounded-full flex items-center justify-center mb-3">
                 <span className="material-symbols-outlined text-3xl opacity-40">search_off</span>
               </div>
               <p className="font-black text-sm text-on-surface mb-0.5">No veterinarians found</p>
               <p className="text-xs text-on-surface-variant">Try adjusting your search filters to find more results.</p>
            </div>
          )}
        </div>
    </main>
  );
};

export default FindVets;
