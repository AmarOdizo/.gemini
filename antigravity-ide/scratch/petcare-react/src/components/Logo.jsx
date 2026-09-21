import React from 'react';

const Logo = ({ className = "", iconSize = "text-3xl", textSize = "text-2xl", pawsColor = "text-primary" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className={`material-symbols-outlined filled-icon ${pawsColor} ${iconSize}`}>
        pets
      </span>
      <span className={`font-headline-md font-black tracking-tight ${textSize} flex items-center`}>
        <span className={pawsColor}>Pet</span>
        <span className="text-[#FF9933]">Care</span>
        <span className="ml-1.5 drop-shadow-sm">🇮🇳</span>
      </span>
    </div>
  );
};

export default Logo;
