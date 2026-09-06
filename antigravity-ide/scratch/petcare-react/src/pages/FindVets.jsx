import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import TopNav from '../components/TopNav';

const FindVets = () => {
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const res = await fetch(`https://odizopetcare.onrender.com/api/vets`);
        if (res.ok) {
          const data = await res.json();
          setVets(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching vets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVets();
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <OwnerSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-12 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Find a Veterinarian" subtitle="Search and book appointments with top verified vets across India." />

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
          <div className="relative w-full md:w-1/2">
            <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-sm" 
              placeholder="Search by name, specialization, or city..." 
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button className="whitespace-nowrap px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm shadow-sm">All Vets</button>
            <button className="whitespace-nowrap px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors">Telehealth</button>
            <button className="whitespace-nowrap px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm hover:bg-surface-container-low transition-colors">Surgeons</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
              <span className="font-label-md text-base font-semibold">Loading Verified Veterinarians...</span>
            </div>
          ) : vets.length > 0 ? (
            vets.map(vet => (
              <div key={vet._id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group h-full">
                <div className="relative h-48 overflow-hidden bg-surface-container">
                  <img src={vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop"} alt={vet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline-sm font-bold text-lg text-on-surface line-clamp-1">{vet.name}</h3>
                      <p className="text-xs font-mono text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded inline-block mt-1">{vet.vciNumber || 'VCI Verified'}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold text-xs border border-amber-200">
                      <span className="material-symbols-outlined text-[14px]">star</span> 4.9
                    </div>
                  </div>
                  <p className="text-sm text-primary font-semibold mb-3 line-clamp-1">{vet.qualification}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vet.specialization && vet.specialization.slice(0, 2).map((spec, idx) => (
                      <span key={idx} className="text-[10px] uppercase tracking-wider font-bold bg-secondary-container/50 text-on-secondary-container px-2 py-1 rounded-md border border-secondary-container">
                        {spec}
                      </span>
                    ))}
                    {vet.specialization && vet.specialization.length > 2 && (
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-surface-container text-on-surface-variant px-2 py-1 rounded-md border border-outline-variant">
                        +{vet.specialization.length - 2}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-outline-variant/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Consult Fee</span>
                      <span className="font-bold text-primary">₹{vet.consultationFee || 499}</span>
                    </div>
                    <Link to={`/owner-dashboard/vet-profile?id=${vet._id}`} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-surface-tint transition-colors">
                      Book Visit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-on-surface-variant">
              No veterinarians found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FindVets;
