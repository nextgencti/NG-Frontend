import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4 font-sans select-none">
      {/* Organic Glowing Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-primary-500/10 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-gradient-to-tr from-rose-500/20 to-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.08] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="z-10 w-full max-w-lg p-6 sm:p-12 bg-slate-900/60 backdrop-blur-xl rounded-[36px] border border-white/5 text-center shadow-2xl space-y-8 relative"
      >
        <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-25">
          <Logo className="w-6 h-6" showText={false} />
        </div>

        {/* Floating Rotating Clock Capsule */}
        <div className="flex justify-center relative pt-4">
          <div className="absolute w-32 h-32 bg-amber-500/10 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[24px] flex items-center justify-center shadow-xl shadow-amber-500/20 border border-amber-300/30"
          >
            <Clock className="text-white w-11 h-11 animate-pulse" />
          </motion.div>
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 animate-pulse" /> Security Check
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Account Under Review</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Awaiting Institutional Activation</p>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-left space-y-5">
          <p 
            className="text-slate-300 leading-relaxed text-xs sm:text-sm font-medium tracking-wide"
            style={{ wordSpacing: '0.08em' }}
          >
            Hi<span className="text-primary-400 font-bold">{currentUser?.name ? ' ' + currentUser.name : ' Guest'}</span>, your profile details have been registered successfully! For security and institutional integrity, new accounts require active administrator review.
          </p>
          
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p 
              className="text-amber-300 text-xs font-semibold leading-relaxed tracking-wide"
              style={{ wordSpacing: '0.08em' }}
            >
              Verifications are completed within 24 hours. You will receive access instantly once the system administrator triggers activation.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group border border-white/5 hover:border-white/10 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-indigo-400" />
          Return to Login
        </motion.button>
      </motion.div>
    </div>
  );
}
