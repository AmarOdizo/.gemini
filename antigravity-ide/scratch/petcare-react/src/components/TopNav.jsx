import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';

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

    let channel;
    if (parsedUser && (parsedUser._id || parsedUser.id)) {
      const channelId = `notifications-${parsedUser._id || parsedUser.id}`;
      console.log('Subscribing to channel:', channelId);
      // Setup real-time notifications globally for this user
      channel = supabase.channel(channelId)
        .on('broadcast', { event: '*' }, (payload) => {
          console.log('Received broadcast:', payload);
          setNotifications(prev => [payload.payload, ...prev]);
        })
        .subscribe((status) => {
          console.log('Channel subscription status:', status);
        });
    }

    return () => {
      window.removeEventListener('favoritePetChanged', loadFavoriteImage);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const firstName = user.name.split(' ')[0];

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
            <span className="w-2.5 h-2.5 bg-error rounded-full absolute top-2 right-2 border-2 border-surface"></span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute top-14 right-0 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h4 className="font-bold text-sm">Notifications</h4>
              {notifications.length > 0 && (
                <button onClick={() => setNotifications([])} className="text-[10px] uppercase font-bold text-primary hover:underline">Clear</button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif, idx) => (
                  <div key={idx} className="p-3 border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors">
                    <p className="text-xs font-bold text-on-surface mb-0.5">Appointment Update</p>
                    <p className="text-xs text-on-surface-variant">{notif.message}</p>
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
