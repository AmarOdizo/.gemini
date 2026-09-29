import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9+]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'email') {
      const emailValue = value.replace(/\s/g, ''); // Remove spaces
      setFormData(prev => ({ ...prev, [name]: emailValue }));
      return;
    }
    
    if (name === 'name') {
      const alphaValue = value.replace(/[^A-Za-z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: alphaValue }));
      return;
    }

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
    <div className="bg-surface text-on-surface antialiased min-h-screen flex items-center justify-center p-2 md:p-4">
      <main className="w-full max-w-4xl flex flex-col md:flex-row bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/30">
        
        {/* Left Side: Brand & Hero Image */}
        <div className="hidden md:flex md:w-5/12 bg-primary relative p-5 flex-col justify-between overflow-hidden">
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
            <Link to="/" className="flex items-center">
              <Logo pawsColor="text-white" textSize="text-3xl" iconSize="text-3xl" />
            </Link>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg">
                <span className="material-symbols-outlined text-white text-2xl mb-2">favorite</span>
                <h2 className="text-lg font-headline-lg font-bold text-white mb-1 leading-tight">Join our pet parent community.</h2>
                <p className="font-body-sm text-primary-fixed-dim text-xs leading-relaxed">
                  Get instant access to top verified Indian veterinarians, manage digital prescriptions, and keep your pet's health records secure.
                </p>
              </div>
              
              <div className="flex -space-x-3">
                <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="User 1"/>
                <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop" alt="User 2"/>
                <img className="w-8 h-8 rounded-full border-2 border-primary object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" alt="User 3"/>
                <div className="w-8 h-8 rounded-full border-2 border-primary bg-surface-container flex items-center justify-center text-[10px] font-bold text-primary">+2k</div>
              </div>
              <p className="text-white text-[11px] font-medium">Over 2,000+ pet parents joined this week.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-7/12 p-4 md:p-6 bg-surface-container-lowest flex flex-col justify-center relative overflow-y-auto">
          
          <div className="md:hidden flex items-center mb-3 pb-2 border-b border-outline-variant/30">
            <Logo />
          </div>

          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-extrabold font-headline-lg text-on-surface mb-1 tracking-tight">Create your account</h2>
            <p className="text-xs font-body-sm text-on-surface-variant">
              Enter your details below to set up your pet parent portal.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5 md:col-span-2">
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[16px]">person</span>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="input-standard pl-8" 
                    placeholder="Jane Doe" 
                    pattern="^[A-Za-z\s]{3,50}$"
                    title="Name must contain only alphabets and be at least 3 characters long"
                    minLength="3"
                    maxLength="50"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 md:col-span-2">
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[16px]">mail</span>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="input-standard pl-8" 
                    placeholder="name@example.com" 
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                    title="Please enter a valid email address (e.g. name@example.com)"
                    required 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5 md:col-span-2">
                <label className="form-label">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[16px]">call</span>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="input-standard pl-8" 
                    placeholder="+91 90000 00000" 
                    pattern="^[+]*[0-9]{10,15}$"
                    title="Phone number must contain 10-15 digits. A leading + is allowed."
                    minLength="10"
                    maxLength="16"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="form-label">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[16px]">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="input-standard pl-8 pr-10" 
                    placeholder="••••••••" 
                    required 
                    minLength="8" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant hover:text-on-surface-variant flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="form-label">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant text-[16px]">lock_reset</span>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    className="input-standard pl-8 pr-10" 
                    placeholder="••••••••" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-outline-variant hover:text-on-surface-variant flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
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
              <div className="text-[11px]">
                <label className="font-body-sm text-on-surface-variant">
                  I agree to the <Link to="#" className="font-bold text-primary hover:underline">Terms of Service</Link> and <Link to="#" className="font-bold text-primary hover:underline">Privacy Policy</Link>.
                </label>
              </div>
            </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full"
              >
              {loading ? (
                <><span className="material-symbols-outlined animate-spin text-[20px]">sync</span> Processing...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center font-body-sm text-[11px] text-on-surface-variant mt-3">
            Already have an account? <Link to="/login" className="font-bold text-primary hover:underline">Login here</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
