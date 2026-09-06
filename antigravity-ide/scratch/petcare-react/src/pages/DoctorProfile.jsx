import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VetSidebar from '../components/VetSidebar';
import TopNav from '../components/TopNav';

const DoctorProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/vets/${user._id}`, {
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

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      <VetSidebar />
      
      <main className="flex-grow ml-0 md:ml-[280px] p-4 md:p-8 pb-12 md:pb-8 flex flex-col gap-6 max-w-[1280px] mx-auto w-full">
        <TopNav title="Doctor Profile" subtitle="Manage your professional details and clinic information." />

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm ambient-shadow overflow-hidden">
          {/* Cover & Avatar Header */}
          <div className="h-32 bg-primary/20 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden bg-white shadow-md">
                <img src={user.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop"} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute top-4 right-4">
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

          <div className="pt-16 px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Fields */}
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

              <div className="space-y-4">
                <h3 className="font-headline-sm font-bold text-lg border-b border-outline-variant/30 pb-2 mb-4 flex items-center justify-between">
                  Clinic & Practice
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase border border-emerald-200">VCI Verified</span>
                </h3>
                
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
    </div>
  );
};

export default DoctorProfile;
