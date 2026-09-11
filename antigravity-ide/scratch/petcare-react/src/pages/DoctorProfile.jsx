import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { isVetSuspended } from '../utils/suspensionUtils';

const DoctorProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadDoctorProfile = async (parsedUser) => {
    try {
      const vetId = parsedUser._id || parsedUser.id;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets/${vetId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          const merged = { ...parsedUser, ...data.data };
          setUser(merged);
          localStorage.setItem('currentUser', JSON.stringify(merged));
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch fresh doctor data:", err.message);
    }
    setUser(parsedUser);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      clinicName: parsedUser.clinicName || '',
      city: parsedUser.city || '',
      consultationFee: parsedUser.consultationFee || 499,
      about: parsedUser.about || '',
    });

    loadDoctorProfile(parsedUser);

    // Listen for live status change notifications from Admin
    const handleSync = () => {
      const current = localStorage.getItem('currentUser');
      if (current) {
        const u = JSON.parse(current);
        loadDoctorProfile(u);
      }
    };

    window.addEventListener('petcare_vets_updated', handleSync);
    window.addEventListener('petcare_doctor_notification', handleSync);
    window.addEventListener('petcare_user_updated', handleSync);
    return () => {
      window.removeEventListener('petcare_vets_updated', handleSync);
      window.removeEventListener('petcare_doctor_notification', handleSync);
      window.removeEventListener('petcare_user_updated', handleSync);
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://odizopetcare.onrender.com'}/api/vets/${user._id || user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isSuspended = isVetSuspended(user);

  return (
    <main className="p-4 md:p-8 pb-24 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Doctor Profile" subtitle="Manage your professional credentials, status, and clinic details." />

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm ambient-shadow overflow-hidden">
          {/* Cover & Avatar Header */}
          <div className="h-32 bg-primary/20 relative">
            <div className="absolute -bottom-12 left-8 flex items-end gap-4">
              <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-white shadow-md">
                <img src={user.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop"} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="mb-2 hidden sm:block">
                <h2 className="font-headline-lg font-bold text-lg text-on-surface flex items-center gap-2">
                  <span>{user.name}</span>
                  {isSuspended ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-error text-white flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">block</span>
                      Suspended
                    </span>
                  ) : (user.status === 'pending' || user.isVerified === false) ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                      Pending Verification
                    </span>
                  ) : user.status === 'rejected' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-700 text-white flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">cancel</span>
                      Disapproved
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Approved & Active
                    </span>
                  )}
                </h2>
                <p className="text-xs text-on-surface-variant font-medium">{user.qualification || 'Veterinary Practitioner'}</p>
              </div>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-white/80 backdrop-blur-sm border border-white/50 text-primary px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="bg-white/80 backdrop-blur-sm border border-white/50 text-on-surface-variant px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-white transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-surface-tint transition-colors">
                    {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Saving...</> : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-16 px-6 sm:px-8 pb-8">
            {/* Account Status Banner */}
            {isSuspended ? (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-900 flex flex-col sm:flex-row items-start gap-4 shadow-sm animate-fade-in">
                <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-error text-white font-black text-xs uppercase tracking-wider">
                      Account Suspended
                    </span>
                    <span className="text-xs font-bold text-red-800">Chief Clinical Administration Action</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed font-medium">
                    Your veterinary practice account is currently <strong>SUSPENDED</strong>. Your profile has been temporarily removed from the Pet Parent &quot;Find Vets&quot; directory, and appointment bookings are paused. Please contact Clinical Administration for compliance review.
                  </p>
                </div>
              </div>
            ) : (user.status === 'pending' || user.isVerified === false) ? (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start gap-4 shadow-sm animate-fade-in">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <span className="material-symbols-outlined text-2xl">hourglass_top</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs uppercase tracking-wider">
                      Pending Verification / Not Verified
                    </span>
                    <span className="text-xs font-bold text-amber-800">Verification Queue Review</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Your VCI license and registration credentials are currently under review in the Admin Verification Queue. Until verified and approved by the Clinical Administrator, your doctor profile will <strong>NOT</strong> appear on the Owner Dashboard, and pet parents cannot book appointments.
                  </p>
                </div>
              </div>
            ) : user.status === 'rejected' ? (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex flex-col sm:flex-row items-start gap-4 shadow-sm animate-fade-in">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                  <span className="material-symbols-outlined text-2xl">cancel</span>
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-700 text-white font-black text-xs uppercase tracking-wider">
                      Verification Disapproved
                    </span>
                    <span className="text-xs font-bold text-rose-800">Credential Review Status</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed font-medium">
                    {user?.rejectionReason ? `Reason: ${user.rejectionReason}` : 'Your credentials were not approved. Please verify your VCI registration certificate and update your profile details.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider">
                        Practice Status: Approved & Active
                      </span>
                      <span className="text-xs font-bold text-emerald-800">State Veterinary Council Authorized</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      Your veterinary license is verified and approved. Your profile is live on the Pet Parents directory and accepting telehealth and clinic bookings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Fields: Personal Details */}
              <div className="space-y-4">
                <h3 className="font-headline-sm font-bold text-lg border-b border-outline-variant/30 pb-2 mb-4">Personal Details</h3>
                
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Professional Bio</label>
                  <textarea name="about" value={formData.about} onChange={handleChange} disabled={!isEditing} rows="4" className={`w-full px-3 py-2 border rounded-lg text-sm transition-all resize-none ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`}></textarea>
                </div>
              </div>

              {/* Form Fields: Clinic & Practice */}
              <div className="space-y-4">
                <h3 className="font-headline-sm font-bold text-lg border-b border-outline-variant/30 pb-2 mb-4 flex items-center justify-between">
                  <span>Clinic & Practice</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                    isSuspended
                      ? 'bg-error-container text-error border-error/30'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {isSuspended ? 'Suspended' : 'VCI Verified'}
                  </span>
                </h3>

                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Administrative Practice Status</label>
                  <div className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${
                    isSuspended 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {isSuspended ? 'block' : 'verified'}
                    </span>
                    <span>{isSuspended ? 'Suspended by Clinical Admin' : 'Active & AVMA/VCI Authorized'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">VCI Registration Number</label>
                  <input type="text" value={user.vciNumber || 'VCI-XXXX-XXXX'} disabled className="w-full px-3 py-2 border border-transparent bg-surface-container-low text-on-surface-variant rounded-lg text-sm font-mono cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Primary Qualification</label>
                  <input type="text" value={user.qualification || ''} disabled className="w-full px-3 py-2 border border-transparent bg-surface-container-low text-on-surface-variant rounded-lg text-sm cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Clinic Name</label>
                  <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-label-md text-on-surface mb-1">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-label-md text-on-surface mb-1">Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} disabled={!isEditing} className={`w-full px-3 py-2 border rounded-lg text-sm transition-all font-bold ${isEditing ? 'border-outline-variant bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 text-primary' : 'border-transparent bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
};

export default DoctorProfile;
