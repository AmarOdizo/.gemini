import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import { getDoctorNotifications, clearDoctorNotifications } from '../utils/suspensionUtils';

const TopNav = ({ title, subtitle, backLink }) => {
  const [user, setUser] = useState({ name: 'User' });
  const [favoriteImage, setFavoriteImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    let parsedUser = null;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    const userId = parsedUser ? (parsedUser._id || parsedUser.id) : null;

    // Load persistent notifications for user / doctor
    if (userId) {
      const stored = getDoctorNotifications(userId);
      if (stored && stored.length > 0) {
        setNotifications(stored);
      }
    }

    // Function to load the favorite pet image
    const loadFavoriteImage = () => {
      const storedImage = localStorage.getItem('favoritePetImage');
      if (storedImage) {
        setFavoriteImage(storedImage);
      } else {
        setFavoriteImage(null);
      }
    };

    // Load initially
    loadFavoriteImage();

    // Listen for custom event from MyPets.jsx when favorite changes
    window.addEventListener('favoritePetChanged', loadFavoriteImage);

    // Listen for real-time doctor notifications across tabs
    const handleDoctorNotif = (e) => {
      if (e.detail && (!e.detail.vetId || e.detail.vetId === String(userId))) {
        setNotifications(prev => [e.detail.notification, ...prev]);
      }
    };
    window.addEventListener('petcare_doctor_notification', handleDoctorNotif);

    let channel;
    if (userId) {
      const channelId = `notifications-${userId}`;
      // Setup real-time notifications globally for this user
      channel = supabase.channel(channelId)
        .on('broadcast', { event: '*' }, (payload) => {
          console.log('Received broadcast in TopNav:', payload);
          if (payload.payload) {
            setNotifications(prev => [payload.payload, ...prev]);
          }
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('favoritePetChanged', loadFavoriteImage);
      window.removeEventListener('petcare_doctor_notification', handleDoctorNotif);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const firstName = user.name ? user.name.split(' ')[0] : 'User';
  const userId = user ? (user._id || user.id) : null;

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full no-print mb-lg bg-surface/80 backdrop-blur-md py-4 border-b border-outline-variant/20 -mx-4 px-4 md:-mx-8 md:px-8 shadow-sm">
      <div className="flex flex-col justify-center">
        {backLink ? (
          <Link to={backLink.to} className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-body-sm font-semibold mb-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> {backLink.text}
          </Link>
        ) : null}
        
        <h2 className="font-headline-lg text-xl md:text-2xl font-bold text-on-surface leading-tight">
          {title || `Welcome back, ${firstName}! 👋`}
        </h2>
        {subtitle && (
          <p className="text-on-surface-variant font-body-sm text-sm mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative shadow-sm border ${showDropdown ? 'bg-primary text-white border-primary' : 'hover:bg-surface-container-high text-on-surface-variant border-outline-variant/30'}`} 
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          {notifications.length > 0 && (
            <span className="min-w-[1.125rem] h-[1.125rem] px-1 bg-error text-white text-[10px] font-black rounded-full absolute -top-1 -right-1 border-2 border-surface flex items-center justify-center shadow-xs">
              {notifications.length}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute top-14 right-0 w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h4 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={() => {
                    setNotifications([]);
                    clearDoctorNotifications(userId);
                  }}
                  className="text-[10px] uppercase font-bold text-primary hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-3 border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                        notif.type === 'error' || notif.status === 'suspended'
                          ? 'bg-error text-white'
                          : notif.type === 'success' || notif.status === 'active'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-primary/10 text-primary font-bold'
                      }`}>
                        {notif.title || (notif.status === 'suspended' ? 'Suspended' : 'Update')}
                      </span>
                      {notif.timestamp && (
                        <span className="text-[9px] text-on-surface-variant font-mono">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface font-medium leading-snug">{notif.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl opacity-30 mb-2">notifications_off</span>
                  <p className="text-xs font-bold">No new notifications</p>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-primary/30 cursor-pointer bg-surface-container shadow-sm transition-transform hover:scale-105">
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src={favoriteImage || user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"}
            onError={(e) => { e.target.src = user.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop"; }}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
