import React, { useState, useEffect } from 'react';

const CallTimer = ({ startTime, status }) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'active' && startTime) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
      }, 1000);
    } else {
      setDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, startTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (status !== 'active') return null;

  return (
    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white shadow-sm z-20 flex items-center gap-2">
      <span className="material-symbols-outlined text-[14px]">timer</span>
      {formatTime(duration)}
    </div>
  );
};

export default CallTimer;
