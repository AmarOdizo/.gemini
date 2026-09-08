import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TopNav = ({ title, subtitle, backLink }) => {
  const [user, setUser] = useState({ name: 'User' });
  const [favoriteImage, setFavoriteImage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
    return () => window.removeEventListener('favoritePetChanged', loadFavoriteImage);
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
      
      <div className="flex items-center gap-3 md:gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant relative shadow-sm border border-outline-variant/30" title="Notifications">
          <span className="material-symbols-outlined">notifications</span>
          <span className="w-2.5 h-2.5 bg-error rounded-full absolute top-2 right-2 border-2 border-surface"></span>
        </button>
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
