import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetSidebar from '../components/VetSidebar';
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
      const res = await fetch(`https://odizopetcare.onrender.com/api/consultations?vetId=${vetId}`);
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
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <VetSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Earnings & Payouts" subtitle="Track your financial performance and withdrawal history." />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary text-on-primary rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[100px] opacity-10 transform -rotate-12">account_balance_wallet</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">Available for Withdrawal</p>
              <h2 className="text-3xl font-headline-xl font-bold">₹{totalEarnings}</h2>
            </div>
            <button className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/40 px-4 py-2 rounded-xl text-xs font-bold w-max transition-colors backdrop-blur-sm">
              Request Payout
            </button>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Total Lifetime Earnings</p>
              <h2 className="text-2xl font-headline-lg font-bold text-on-surface">₹{totalEarnings}</h2>
            </div>
            <p className="text-xs text-emerald-700 font-bold mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% this month
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">group</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Completed Consultations</p>
              <h2 className="text-2xl font-headline-lg font-bold text-on-surface">{completedAppts.length}</h2>
            </div>
            <p className="text-xs text-on-surface-variant mt-4">Across all time.</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden mt-4">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <h3 className="font-headline-sm text-lg font-bold">Recent Transactions</h3>
            <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Download CSV <span className="material-symbols-outlined text-[16px]">download</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container-low/50 text-on-surface-variant text-xs uppercase font-bold border-b border-outline-variant/50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Patient / Description</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Amount (₹)</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-primary">sync</span> Loading...
                    </td>
                  </tr>
                ) : completedAppts.length > 0 ? (
                  completedAppts.map(appt => (
                    <tr key={appt._id} className="hover:bg-surface-bright transition-colors">
                      <td className="px-6 py-4 font-medium">{appt.date}</td>
                      <td className="px-6 py-4">Consultation - {appt.petName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-surface-container px-2 py-1 rounded text-xs font-bold text-on-surface-variant border border-outline-variant/50">
                          {appt.consultationType === 'video' ? 'Telehealth' : 'Clinic'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-700">+₹{fee}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Credited</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant text-sm">
                      No completed consultations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VetEarnings;
