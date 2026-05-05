import React from 'react';
import logoImg from '../assets/logo.png';

export default function Logo({ 
  className = "w-28 h-28", 
  showText = false, 
  variant = 'default' // 'default' or 'white'
}) {
  const isWhite = variant === 'white';
  
  return (
    <div className={`flex items-center gap-4 shrink-0`}>
      <img 
        src={logoImg} 
        alt="Logo" 
        className={`${className} object-contain ${isWhite ? 'brightness-0 invert' : ''}`}
      />
      
      {showText && (
        <div className="flex items-center text-xl font-bold tracking-[0.15em] leading-none select-none">
          <span className={isWhite ? "text-white" : "text-slate-900"}>NEXT</span>
          <span className="text-primary-600">GEN</span>
        </div>
      )}
    </div>
  );
}
