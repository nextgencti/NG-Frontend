import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProfileIncompleteBanner() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (currentUser?.role !== 'student') return null;

  // Check if any critical student details are missing
  const isIncomplete = 
    !currentUser?.fatherName || 
    !currentUser?.motherName || 
    !currentUser?.dob || 
    !currentUser?.gender || 
    !currentUser?.aadhaar;

  if (!isIncomplete) return null;

  // Hide the banner if the student is already on the profile completion page
  if (location.pathname === '/dashboard/profile') return null;

  return (
    <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 relative overflow-hidden shadow-sm group w-full">
      {/* Background decoration glow */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-115 transition-transform duration-550" />

      <div className="flex items-center gap-2 relative z-10 min-w-0 flex-1">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-bounce" />
        <p className="text-slate-700 text-[10.5px] font-extrabold truncate">
          <span className="text-rose-600 uppercase tracking-wider mr-1">Required:</span>
          Complete Father's/Mother's name, DOB, and Aadhaar to get ID Card.
        </p>
      </div>

      <button
        onClick={() => navigate('/dashboard/profile')}
        className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-black text-[7.5px] uppercase tracking-widest transition-all active:scale-[0.97] cursor-pointer shrink-0 relative z-10 border border-rose-400/20 flex items-center gap-1"
      >
        Complete
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
