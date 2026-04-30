import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function SuperAdminPin() {
  const [pin, setPin] = useState(['', '', '', '', '', '', '', '']); // 8 digit PIN
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { currentUser, logout, isSuperAdminVerified, verifySuperAdminPin } = useAuth();

  useEffect(() => {
    // If user is not superadmin at all, kick them out
    if (!currentUser || currentUser.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    // If already verified, go to dashboard
    if (isSuperAdminVerified) {
      navigate('/superadmin');
    }
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [currentUser, isSuperAdminVerified, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    // Allow only numeric input
    const newPin = [...pin];
    // Take only the last character if they pasted or typed fast
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    
    if (enteredPin.length < 8) {
      toast.error('Please enter the full 8-digit PIN');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifySuperAdminPin(enteredPin);
      if (success) {
        toast.success('Access Granted');
        navigate('/superadmin');
      } else {
        toast.error('Invalid Security PIN');
        setPin(['', '', '', '', '', '', '', '']);
        inputRefs.current[0].focus();
      }
    } catch (error) {
       toast.error('Verification failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Intense Security Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-rose-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-lg p-8 sm:p-12 glass-dark rounded-[2.5rem] border border-rose-500/20 m-4 shadow-2xl shadow-rose-900/50 relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-500"></div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-rose-500/30 flex items-center justify-center relative z-10 shadow-inner">
              <Shield className="w-10 h-10 text-rose-500" />
            </div>
            {/* Overlay Lock Icon */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center border-2 border-slate-900 z-20">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-white text-center tracking-tight mb-2 uppercase">Root Access</h2>
        <p className="text-rose-200/60 text-center mb-10 font-medium text-sm">Super Administrator verification required.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
             <div className="flex justify-between items-center mb-3 px-1">
               <label className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                 <KeyRound className="w-3 h-3" /> System PIN
               </label>
             </div>
             <div className="flex gap-2 sm:gap-3 justify-center">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="password"
                  value={digit}
                  maxLength={1}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  className="w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black text-white bg-slate-800 border border-rose-500/30 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all disabled:opacity-50"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || pin.join('').length < 8}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  Verify Identity
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              Cancel & Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
