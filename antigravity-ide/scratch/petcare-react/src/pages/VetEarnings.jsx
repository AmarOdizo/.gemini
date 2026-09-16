import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

const VetEarnings = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
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
    fetchAppointments(parsedUser._id);
  }, [navigate]);

  const fetchAppointments = async (vetId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/consultations?vetId=${vetId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const completedAppts = appointments.filter(a => a.status === 'completed');
  const fee = user.consultationFee || 499;
  const totalEarnings = completedAppts.length * fee;

  return (
    <main className="p-3 md:p-4 pb-20 md:pb-4 flex flex-col gap-3 max-w-[1280px] mx-auto w-full">
        <TopNav title="Earnings & Payouts" subtitle="Track your financial performance and withdrawal history." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-primary text-on-primary rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[110px]">
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[80px] opacity-10 transform -rotate-12">account_balance_wallet</span>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Available for Withdrawal</p>
              <h2 className="text-2xl font-headline-lg font-bold">₹{totalEarnings}</h2>
            </div>
            <button className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/40 px-3 py-1.5 rounded-lg text-[10px] font-bold w-max transition-colors backdrop-blur-sm shadow-sm hover:-translate-y-0.5 active:translate-y-0">
              Request Payout
            </button>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Total Lifetime Earnings</p>
              <h2 className="text-xl font-headline-md font-bold text-on-surface">₹{totalEarnings}</h2>
            </div>
            <p className="text-[10px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% this month
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-secondary-container text-secondary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">Completed Consultations</p>
              <h2 className="text-xl font-headline-md font-bold text-on-surface">{completedAppts.length}</h2>
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2">Across all time.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-sm overflow-hidden mt-1 flex-grow flex flex-col">
          <div className="p-3 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">Recent Transactions</h3>
            <button className="text-[10px] font-bold text-primary flex items-center gap-1 hover:bg-primary/10 px-2 py-1 rounded transition-colors">
              Download CSV <span className="material-symbols-outlined text-[14px]">download</span>
            </button>
          </div>
          <div className="overflow-x-auto flex-grow custom-scrollbar">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-surface-container-low/80 text-on-surface-variant text-[10px] uppercase font-bold border-b border-outline-variant/40">
                <tr>
                  <th className="px-4 py-2 tracking-wider">Date</th>
                  <th className="px-4 py-2 tracking-wider">Patient / Description</th>
                  <th className="px-4 py-2 tracking-wider">Type</th>
                  <th className="px-4 py-2 tracking-wider text-right">Amount (₹)</th>
                  <th className="px-4 py-2 tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-on-surface-variant text-[11px]">
                      <span className="material-symbols-outlined animate-spin text-primary align-middle mr-1 text-[16px]">sync</span> Loading...
                    </td>
                  </tr>
                ) : completedAppts.length > 0 ? (
                  completedAppts.map(appt => (
                    <tr key={appt._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-on-surface">{appt.date}</td>
                      <td className="px-4 py-2.5 font-medium text-on-surface-variant">Consultation - {appt.petName}</td>
                      <td className="px-4 py-2.5">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded text-[9px] font-bold text-on-surface-variant border border-outline-variant/40">
                          {appt.consultationType === 'video' ? 'Telehealth' : 'Clinic'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-emerald-700">+₹{fee}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Credited</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-on-surface-variant text-[11px]">
                      No completed consultations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </main>
  );
};

export default VetEarnings;
