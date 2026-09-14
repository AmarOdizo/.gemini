import React, { useState, useEffect } from 'react';
import AdminGenericPage from './AdminGenericPage';

const AdminSettings = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    title: '',
    department: '',
  });
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load admin profile from localStorage
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setProfile({
          name: user.name || '',
          email: user.email || '',
          title: user.title || 'Chief Medical & Governance Officer',
          department: user.department || 'Clinical Quality & Network Governance',
        });
      }
    } catch (err) {
      console.error("Error loading admin profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      const storedUser = localStorage.getItem('currentUser');
      let user = storedUser ? JSON.parse(storedUser) : {};
      
      const updatedUser = {
        ...user,
        name: profile.name,
        email: profile.email,
        title: profile.title,
        department: profile.department,
      };

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      
      // Optionally trigger a custom event if Header needs to update name
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      alert("Error saving profile: " + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AdminGenericPage
      title="Admin Profile Settings"
      subtitle="Manage your personal administrative account details and credentials."
      icon="manage_accounts"
    >
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 max-w-2xl space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {saved && (
            <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Admin profile updated successfully!
            </div>
          )}

          <div className="flex items-center gap-4 pb-2 border-b border-outline-variant/20">
            <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-2xl">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="font-bold text-base text-on-surface">{profile.name || 'Admin User'}</div>
              <div className="text-on-surface-variant text-sm">{profile.role || 'System Administrator'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Full Name</label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-on-surface mb-1">Job Title</label>
              <input
                name="title"
                value={profile.title}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Department</label>
              <input
                name="department"
                value={profile.department}
                onChange={handleChange}
                className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-on-surface mb-1">Update Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low focus:outline-none focus:border-primary"
            />
          </div>

          <div className="pt-4 mt-2 border-t border-outline-variant/20">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-container shadow-sm transition-colors text-center flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[1.125rem]">save</span>
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </AdminGenericPage>
  );
};

export default AdminSettings;
