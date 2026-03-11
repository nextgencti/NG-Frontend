import React, { useMemo } from 'react';

export default function Logo({ 
  className = "w-28 h-28", 
  showText = false, 
  textClassName = "text-xl font-bold text-white tracking-tight",
  variant = 'default' // 'default' or 'white'
}) {
  // Unique stable IDs for SVG elements to avoid conflicts
  const id = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const liquidGradId = `liquidGrad-${id}`;
  const glowId = `glow-${id}`;

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-4 shrink-0 ${className}`}>
      <svg 
        viewBox="0 0 260 220" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Liquid Gradient - Updated to match App theme more closely */}
          <linearGradient id={liquidGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%">
              <animate 
                attributeName="stop-color"
                values="#6366f1;#d946ef;#06b6d4;#6366f1"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%">
              <animate 
                attributeName="stop-color"
                values="#06b6d4;#6366f1;#d946ef;#06b6d4"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Glow Filter */}
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <style>
          {`
            .logo-letter-${id} {
              font-family: 'Nunito', 'Poppins', Arial, sans-serif;
              font-size: 110px;
              font-weight: 950;
              fill: ${isWhite ? 'white' : `url(#${liquidGradId})`};
              filter: ${isWhite ? 'none' : `url(#${glowId})`};
            }
            .anim-n-${id} {
              animation: floatNG-${id} 3s ease-in-out infinite;
            }
            .anim-g-${id} {
              animation: floatNG-${id} 3s ease-in-out infinite 0.5s;
            }
            @keyframes floatNG-${id} {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .particle-${id} {
              animation: blinkParticle-${id} 2s infinite;
              fill: ${isWhite ? 'white' : 'currentColor'};
              opacity: ${isWhite ? '0.5' : '1'};
            }
            @keyframes blinkParticle-${id} {
              0%, 100% { opacity: 0.2; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            .progress-fill-${id} {
              animation: loadProgress-${id} 4s linear infinite;
              fill: ${isWhite ? 'white' : `url(#${liquidGradId})`};
            }
            @keyframes loadProgress-${id} {
              0% { width: 0; opacity: 0.5; }
              50% { opacity: 1; }
              100% { width: 180px; opacity: 0.5; }
            }
          `}
        </style>

        {/* Twinkling Particles */}
        <circle cx="40" cy="40" r="3" fill="#06b6d4" className={`particle-${id}`} style={{ animationDelay: '0s' }}/>
        <circle cx="210" cy="60" r="3" fill="#d946ef" className={`particle-${id}`} style={{ animationDelay: '0.5s' }}/>
        <circle cx="200" cy="150" r="3" fill="#6366f1" className={`particle-${id}`} style={{ animationDelay: '1s' }}/>
        <circle cx="60" cy="160" r="3" fill="#06b6d4" className={`particle-${id}`} style={{ animationDelay: '1.5s' }}/>

        {/* Circuit/Technical Lines */}
        <line x1="30" y1="100" x2="60" y2="100" stroke={isWhite ? "white" : "#d946ef"} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="200" y1="100" x2="230" y2="100" stroke={isWhite ? "white" : "#06b6d4"} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>

        {/* NG Main Logo */}
        <text x="50" y="120" className={`logo-letter-${id} anim-n-${id}`}>N</text>
        <text x="120" y="120" className={`logo-letter-${id} anim-g-${id}`}>G</text>

        {/* Progress bar structure */}
        <rect x="40" y="180" width="180" height="8" rx="4" fill={isWhite ? "white" : "#ffffff"} fillOpacity="0.1"/>
        <rect x="40" y="180" height="8" rx="4" className={`progress-fill-${id}`}/>
      </svg>
      
      {showText && (
        <span className={textClassName}>NextGen</span>
      )}
    </div>
  );
}
