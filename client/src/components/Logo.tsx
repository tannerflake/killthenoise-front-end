import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="logo">
      <div className="logo-icon">
        {/* Speaker with slash */}
        <div className="speaker-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Speaker body */}
            <path 
              d="M12 3L7 8H3C2.45 8 2 8.45 2 9V15C2 15.55 2.45 16 3 16H7L12 21V3Z" 
              fill="#6366f1"
            />
            {/* Sound waves */}
            <path 
              d="M16 9C16.55 9 17 9.45 17 10C17 10.55 16.55 11 16 11C15.45 11 15 10.55 15 10C15 9.45 15.45 9 16 9Z" 
              fill="#374151"
            />
            <path 
              d="M19 7C19.55 7 20 7.45 20 8C20 8.55 19.55 9 19 9C18.45 9 18 8.55 18 8C18 7.45 18.45 7 19 7Z" 
              fill="#374151"
            />
            <path 
              d="M22 5C22.55 5 23 5.45 23 6C23 6.55 22.55 7 22 7C21.45 7 21 6.55 21 6C21 5.45 21.45 5 22 5Z" 
              fill="#374151"
            />
            {/* Diagonal slash */}
            <line 
              x1="4" y1="4" x2="20" y2="20" 
              stroke="#374151" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Waveform */}
        <div className="waveform">
          <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
            <path 
              d="M2 8L4 4L6 12L8 2L10 14L12 6L14 10L16 8L18 12L20 4L22 14L24 2L26 10L28 6L30 8" 
              stroke="#374151" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <h1>KillTheNoise.</h1>
    </div>
  );
};

export default Logo; 