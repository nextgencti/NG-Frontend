import React from 'react';
import { Sparkles, MessageSquareCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TrialBanner() {
  const { currentUser } = useAuth();
  if (currentUser?.status !== 'trial') return null;

  const handleUnlockClick = () => {
    const studentName = encodeURIComponent(currentUser?.name || 'Student');
    const studentEmail = encodeURIComponent(currentUser?.email || '');
    const whatsappUrl = `https://wa.me/919140737374?text=Hi%20Admin,%20my%20name%20is%20${studentName}%20(${studentEmail}).%20I%20have%20completed%20my%20profile%20and%20want%20to%20activate%20my%20NextGen%20Student%20Account%20for%20full%20premium%20course%20access!`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 relative overflow-hidden shadow-sm group w-full">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-115 transition-transform duration-500" />
      
      <div className="flex items-center gap-2 relative z-10 min-w-0 flex-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-550 shrink-0 animate-pulse" />
        <p className="text-slate-700 text-[10.5px] font-extrabold truncate">
          <span className="text-amber-600 uppercase tracking-wider mr-1">Trial Mode:</span>
          First 5 lessons unlocked. Complete activation for full course!
        </p>
      </div>

      <button
        onClick={handleUnlockClick}
        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-black text-[7.5px] uppercase tracking-widest transition-all active:scale-[0.97] cursor-pointer shrink-0 relative z-10 border border-amber-400/20 flex items-center gap-1"
      >
        <MessageSquareCode className="w-3 h-3" />
        Unlock
      </button>
    </div>
  );
}
