import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { isVetSuspended } from '../utils/suspensionUtils';

const FindVets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets`);
      if (res.ok) {
        const data = await res.json();
        // Exclude suspended doctors completely from Owner Find Vets
        const availableVets = (data.data || []).filter(vet => !isVetSuspended(vet));
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
  }, []);

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full transition-opacity duration-300">
        <TopNav title="Find a Veterinarian" subtitle="Search and book appointments with top verified vets across India." />

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-low/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-outline-variant/30 shadow-sm sticky top-20 z-20">
          <div className="relative w-full md:w-1/2 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-xl font-bold text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant transition-all shadow-sm text-on-surface" 
              placeholder="Search by name, specialization, or city..." 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            <button className="whitespace-nowrap px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-md hover:bg-primary-container hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span> All Vets
            </button>
            <button className="whitespace-nowrap px-5 py-2.5 bg-surface-container-lowest border-2 border-outline-variant/40 text-on-surface-variant rounded-xl text-sm hover:bg-surface-container-low hover:border-outline-variant transition-all font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">videocam</span> Telehealth
            </button>
            <button className="whitespace-nowrap px-5 py-2.5 bg-surface-container-lowest border-2 border-outline-variant/40 text-on-surface-variant rounded-xl text-sm hover:bg-surface-container-low hover:border-outline-variant transition-all font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">content_cut</span> Surgeons
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
                <div className="h-48 bg-surface-container-high/50 w-full"></div>
                <div className="p-5 flex-grow flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-1/2 bg-surface-container-high/50 rounded-md"></div>
                    <div className="h-5 w-12 bg-surface-container-high/50 rounded-md"></div>
                  </div>
                  <div className="h-4 w-1/3 bg-surface-container-high/50 rounded-md mb-2"></div>
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-surface-container-high/50 rounded-md"></div>
                    <div className="h-6 w-20 bg-surface-container-high/50 rounded-md"></div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                    <div className="h-8 w-16 bg-surface-container-high/50 rounded-md"></div>
                    <div className="h-10 w-24 bg-surface-container-high/50 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))
          ) : vets.length > 0 ? (
            vets.map(vet => (
              <div key={vet._id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
                <div className="relative h-48 overflow-hidden bg-surface-container">
                  <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop"} alt={vet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-emerald-700 flex items-center gap-1.5 shadow-sm uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline-sm font-black text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{vet.name}</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low border border-outline-variant/30 px-2 py-0.5 rounded inline-block mt-1 uppercase tracking-wider">{vet.vciNumber || 'VCI Verified'}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded font-black text-[11px] border border-amber-200 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] filled-icon">star</span> 4.9
                    </div>
                  </div>
                  <p className="text-sm text-primary font-bold mb-3 line-clamp-1">{vet.qualification}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vet.specialization && vet.specialization.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="text-[10px] uppercase tracking-wider font-bold bg-secondary-container/30 text-on-secondary-container px-2.5 py-1 rounded-md border border-secondary-container/50">
                        {spec}
                      </span>
                    ))}
                    {vet.specialization && vet.specialization.length > 2 && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-md border border-outline-variant/40">
                        +{vet.specialization.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider mb-0.5">Consult Fee</span>
                      <span className="font-black text-primary text-lg">₹{vet.consultationFee || 499}</span>
                    </div>
                    <Link to={`/owner-dashboard/vet-profile?id=${vet._id}`} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-primary-container transition-colors flex items-center gap-1 group/btn">
                      Book Visit <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-surface-container-lowest border border-dashed border-outline-variant/50 rounded-3xl flex flex-col items-center justify-center">
               <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-5xl opacity-40">search_off</span>
               </div>
               <p className="font-black text-xl text-on-surface mb-1">No veterinarians found</p>
               <p className="text-sm text-on-surface-variant">Try adjusting your search filters to find more results.</p>
            </div>
          )}
        </div>
    </main>
  );
};

export default FindVets;
