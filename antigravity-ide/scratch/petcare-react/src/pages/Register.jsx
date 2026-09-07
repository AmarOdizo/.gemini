import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        alert('Registration successful!');
        navigate('/owner-dashboard');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-5xl flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30 min-h-[650px]">
        
        {/* Left Side: Brand & Hero Image */}
        <div className="hidden md:flex md:w-5/12 bg-primary relative p-8 flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
                </pattern>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#dotPattern)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-primary text-2xl filled-icon">pets</span>
              </div>
              <h1 className="font-headline-md text-xl font-black text-white tracking-tight">Paws<span className="text-[#FF9933]">India</span> 🇮🇳</h1>
            </Link>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl mb-4">favorite</span>
                <h2 className="text-2xl font-headline-lg font-bold text-white mb-2 leading-tight">Join our pet parent community.</h2>
                <p className="font-body-sm text-primary-fixed-dim text-sm leading-relaxed">
                  Get instant access to top verified Indian veterinarians, manage digital prescriptions, and keep your pet's health records secure.
                </p>
              </div>
              
              <div className="flex -space-x-4">
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="User 1"/>
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop" alt="User 2"/>
                <img className="w-10 h-10 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" alt="User 3"/>
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container flex items-center justify-center text-xs font-bold text-primary">+2k</div>
              </div>
              <p className="text-white text-xs font-medium">Over 2,000+ pet parents joined this week.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-7/12 p-6 md:p-10 bg-surface-container-lowest flex flex-col justify-center relative overflow-y-auto">
          
          <div className="md:hidden flex items-center gap-2 mb-6 pb-4 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-2xl filled-icon">pets</span>
            <span className="font-headline-md text-lg font-bold text-primary">PawsIndia PetCare</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold font-headline-lg text-on-surface mb-2 tracking-tight">Create your account</h2>
            <p className="text-sm font-body-sm text-on-surface-variant">
              Enter your details below to set up your pet parent portal.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-md text-xs font-bold text-on-surface">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">person</span>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                    placeholder="Jane Doe" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-md text-xs font-bold text-on-surface">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">mail</span>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                    placeholder="name@example.com" 
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="font-label-md text-xs font-bold text-on-surface">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">call</span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                    placeholder="+91 90000 00000" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs font-bold text-on-surface">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-10 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                    placeholder="••••••••" 
                    required 
                    minLength="8" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-xs font-bold text-on-surface">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline-variant text-[20px]">lock_reset</span>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-10 py-2.5 border border-outline-variant/50 rounded-xl bg-surface-container-lowest font-body-sm text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-on-surface" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  name="terms" 
                  checked={formData.terms} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-primary bg-surface-container-lowest border-outline-variant rounded focus:ring-primary focus:ring-2" 
                  required 
                />
              </div>
              <div className="text-xs">
                <label className="font-body-sm text-on-surface-variant">
                  I agree to the <Link to="#" className="font-bold text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="font-bold text-primary hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label-md py-3.5 rounded-xl font-bold shadow-md hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Processing...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-body-sm text-xs text-on-surface-variant mt-6">
            Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Login here</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
