import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const Prescription = () => {
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchPrescriptions(parsedUser.id || parsedUser._id);
  }, [navigate]);

  const fetchPrescriptions = async (ownerId) => {
    try {
      const res = await fetch(`https://odizopetcare.onrender.com/api/prescriptions?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching prescriptions", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Digital Prescriptions" subtitle="View and download prescriptions from your vet consultations." />

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm ambient-shadow overflow-hidden max-w-4xl mx-auto w-full">
          <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="font-headline-sm font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">prescriptions</span> My Pet Rx Records
            </h3>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl mb-4">sync</span>
                <span className="font-label-md text-base font-semibold">Loading Prescriptions...</span>
              </div>
            ) : prescriptions.length > 0 ? (
              <div className="space-y-6">
                {prescriptions.map((rx, idx) => (
                  <div key={rx._id || idx} className="border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-surface-container-low p-4 border-b border-outline-variant flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-primary flex items-center gap-2">
                           <span className="material-symbols-outlined text-[20px]">pets</span> 
                           Patient: {rx.patientName || rx.petName || 'Unknown Pet'}
                        </h4>
                        <p className="text-xs text-on-surface-variant mt-1">Diagnosis: <strong>{rx.diagnosis}</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">Date: {rx.date || new Date(rx.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-on-surface-variant mt-1">Ref: RX-{rx._id?.substring(0, 6).toUpperCase()}</p>
                      </div>
                    </div>
                    
                    {/* Medicines List */}
                    <div className="p-4 bg-surface-container-lowest">
                      <h5 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider mb-3">Prescribed Medicines</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-outline-variant/30 text-xs text-on-surface-variant">
                            <tr>
                              <th className="pb-2">Medicine Name</th>
                              <th className="pb-2">Dosage</th>
                              <th className="pb-2">Frequency</th>
                              <th className="pb-2 text-right">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {(rx.medications || rx.medicines || []).map((med, i) => (
                              <tr key={i}>
                                <td className="py-2 font-bold">{med.name}</td>
                                <td className="py-2 text-on-surface-variant">{med.dosage}</td>
                                <td className="py-2 text-on-surface-variant">{med.frequency}</td>
                                <td className="py-2 text-right text-on-surface-variant">{med.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Doctor Info & Instructions */}
                    <div className="p-4 bg-surface-container-low/50 border-t border-outline-variant flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h5 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider mb-1">Doctor's Advice / Diet</h5>
                          <p className="text-sm text-on-surface">{rx.symptoms || rx.instructions || "Follow prescribed dosages."}</p>
                        </div>
                        
                        {/* Vet Details */}
                        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/30">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-surface shadow-sm">
                            <img 
                              src={rx.vetImage || (rx.vetId && rx.vetId.photoUrl) || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&auto=format&fit=crop"} 
                              alt="Vet" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{rx.vetName || (rx.vetId && rx.vetId.name) || "Doctor"}</p>
                            <p className="text-[10px] font-bold text-primary mt-0.5">{rx.vetQualification || (rx.vetId && rx.vetId.qualification)} | {rx.vetSpecialization || (rx.vetId && (Array.isArray(rx.vetId.specialization) ? rx.vetId.specialization.join(', ') : rx.vetId.specialization))}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">{rx.vetClinic || (rx.vetId && rx.vetId.clinicName)} • {rx.vetPhone || (rx.vetId && rx.vetId.phone)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Signature Area */}
                      <div className="md:w-[220px] flex flex-col items-end justify-end md:border-l border-outline-variant/30 md:pl-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
                         <div className="h-16 flex items-center justify-center opacity-90 mb-2 w-full bg-surface-container-lowest/50 rounded-lg border border-outline-variant/20">
                           <span className="text-3xl text-primary/80 px-4 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}>
                             {rx.vetSignature || rx.vetName || (rx.vetId && rx.vetId.name) || "Doctor Signature"}
                           </span>
                         </div>
                         <h5 className="font-bold text-sm text-primary border-t border-outline-variant/50 pt-2 w-full text-center tracking-wide">Digitally Signed</h5>
                         <p className="text-[10px] text-on-surface-variant text-center w-full mt-1 flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[12px] text-emerald-500">verified</span> VCI Verified Prescription</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-surface-container border-t border-outline-variant flex justify-end gap-2">
                      <button className="px-4 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">print</span> Print
                      </button>
                      <button className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-surface-tint transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">download</span> Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-on-surface-variant flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl mb-2 opacity-50">prescriptions</span>
                <p className="font-bold">No prescriptions found.</p>
                <p className="text-sm mt-1">Prescriptions will appear here after a vet consultation.</p>
              </div>
            )}
          </div>
        </div>
    </main>
  );
};

export default Prescription;
