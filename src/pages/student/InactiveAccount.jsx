import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX, ArrowLeft, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function InactiveAccount() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4 font-sans select-none">
      {/* Background Glowing Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gradient-to-tr from-rose-500/20 to-red-600/10 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-purple-500/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.08] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15 }}
        className="z-10 w-full max-w-lg p-6 sm:p-10 bg-slate-900/70 backdrop-blur-xl rounded-[36px] border border-white/5 text-center shadow-2xl space-y-6 relative"
      >
        <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-25">
          <Logo className="w-6 h-6" showText={false} />
        </div>

        {/* Pulsing Lock Icon */}
        <div className="flex justify-center relative pt-4">
          <div className="absolute w-32 h-32 bg-rose-500/10 rounded-full blur-2xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          
          <motion.div 
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative w-22 h-22 bg-gradient-to-br from-rose-500 to-red-700 rounded-[24px] flex items-center justify-center shadow-xl shadow-rose-500/20 border border-rose-400/30"
          >
            <UserX className="text-white w-10 h-10" />
          </motion.div>
        </div>
        
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Account Inactive / Suspended
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Portal Access Suspended</h1>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">
            Aapka student account institute dwara deactivate kar diya gaya hai.
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-3xl p-5 text-left space-y-4">
          <p className="text-slate-300 leading-relaxed text-xs sm:text-sm font-medium tracking-wide">
            Namaste <strong className="text-rose-400 font-bold">{currentUser?.name || 'Student'}</strong>, is account par online aur offline sabhi services temporary roop se band hain.
          </p>
          
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2 text-xs">
            <p className="text-rose-300 font-semibold leading-relaxed">
              Yadi aap class dobara start karna chahte hain ya account activate karana chahte hain, kripya institute administration office se sampark karein:
            </p>
            <div className="space-y-1 text-slate-300 font-medium pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>+91 9140737374 / +91 7380681200</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>nextgencomputermuskara@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>NextGen Computer Training Institute, Near Shri Jaylal Vidya Mandir, Muskara</span>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 group border border-white/10 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-rose-400" />
          Logout & Return to Home
        </motion.button>
      </motion.div>
    </div>
  );
}
