import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const switchRole = (newRole) => {
    setRole(newRole);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = role === 'owner' ? '/api/auth/login' : '/api/auth/vets/login';
      const res = await fetch(`https://odizopetcare.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        const userData = data.user || data.vet;
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        if (role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/doctor-dashboard');
        }
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (err) {
      alert('Login Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-5xl flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 min-h-[600px]">
        {/* Left Side */}
        <div 
          className="hidden md:flex md:w-1/2 relative bg-surface-container-low flex-col justify-between p-8 bg-cover bg-center" 
          style={{ backgroundImage: "linear-gradient(to bottom, rgba(0,69,65,0.75), rgba(0,32,30,0.9)), url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1000&auto=format&fit=crop')" }}
        >
          <Link to="/" className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl w-max border border-white/20">
            <span className="material-symbols-outlined text-emerald-300 text-3xl filled-icon">pets</span>
            <div>
              <h1 className="font-headline-md text-xl font-black text-white">Paws<span className="text-[#FF9933]">India</span> 🇮🇳</h1>
              <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Unified Healthcare Portal</p>
            </div>
          </Link>

          <div className="space-y-3 text-white">
            <div className="inline-flex items-center gap-2 bg-emerald-500/30 text-emerald-200 text-xs px-3 py-1 rounded-full border border-emerald-400/30 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Pet Parent & Vet Access
            </div>
            <h2 className="text-3xl font-extrabold font-headline-lg leading-tight">One Portal for Pet Care & Clinical Management.</h2>
            <p className="text-xs text-surface-variant/90 leading-relaxed font-body-md">
              Seamlessly manage your pet's appointments, health records, and prescriptions or access doctor telehealth tools.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-200/80 font-body-sm pt-4 border-t border-white/10">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>Secure ISO-27001 & VCI Compliant Portal</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-10 relative bg-surface-container-lowest space-y-6">
          <div className="md:hidden flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-3xl filled-icon">pets</span>
            <span className="font-headline-md text-xl font-bold text-primary">PawsIndia PetCare</span>
          </div>

          <div className="space-y-1">
            <label className="block font-label-md text-xs font-bold text-primary uppercase tracking-wider">Select Login Account Type</label>
            <div className="grid grid-cols-2 gap-1 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/30 text-xs font-bold">
              <button 
                type="button" 
                onClick={() => switchRole('owner')} 
                className={`py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${role === 'owner' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-[18px]">pets</span> Pet Parent Login
              </button>
              <button 
                type="button" 
                onClick={() => switchRole('vet')} 
                className={`py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${role === 'vet' ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <span className="material-symbols-outlined text-[18px]">stethoscope</span> Doctor (Vet) Login
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold font-headline-lg text-on-surface mb-2 tracking-tight">
              {role === 'owner' ? 'Welcome back, Pet Parent.' : 'Welcome back, Doctor.'}
            </h2>
            <p className="text-sm font-body-sm text-on-surface-variant">
              Enter your registered email and password to access your secure portal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold font-label-md text-on-surface">Email Address <span className="text-error">*</span></label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold font-label-md text-on-surface">Password <span className="text-error">*</span></label>
                <Link to="#" className="text-[11px] font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface-container-low border border-outline-variant/50 rounded-xl font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                  placeholder="Enter your password" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl font-bold shadow-md hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Authenticating...
                </>
              ) : (
                <>
                  Secure Login <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs font-body-sm text-on-surface-variant pt-2">
            Don't have an account?{' '}
            <Link to={role === 'vet' ? '/vet-register' : '/register'} className="font-bold text-primary hover:underline">
              Create one here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
