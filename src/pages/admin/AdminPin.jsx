import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

export default function AdminPin() {
  const [pin, setPin] = useState(['', '', '', '']); // 4 digit PIN
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { currentUser, logout, isAdminVerified, verifyAdminPin } = useAuth();

  useEffect(() => {
    // If user is not admin and not superadmin, kick them out
    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role)) {
      navigate('/dashboard');
      return;
    }
    // If already verified, go to dashboard
    if (isAdminVerified) {
      navigate('/admin');
    }
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [currentUser, isAdminVerified, navigate]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    // Allow only numeric input
    const newPin = [...pin];
    // Take only the last character if they pasted or typed fast
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
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
    
    if (enteredPin.length < 4) {
      toast.error('Please enter the full 4-digit PIN');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyAdminPin(enteredPin);
      if (success) {
        toast.success('Access Granted');
        navigate('/admin');
      } else {
        toast.error('Invalid Security PIN');
        setPin(['', '', '', '']);
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Intense Security Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-accent-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="z-10 w-full max-w-lg p-8 sm:p-12 bg-white rounded-[2.5rem] border border-slate-200 m-4 shadow-2xl relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600"></div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-primary-100 flex items-center justify-center relative z-10 shadow-inner">
              <ShieldAlert className="w-10 h-10 text-primary-600" />
            </div>
            {/* Overlay Lock Icon */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white z-20">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 text-center tracking-tight mb-2 uppercase">Admin Portal</h2>
        <p className="text-slate-500 text-center mb-10 font-medium text-sm">Staff verification required.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
             <div className="flex justify-between items-center mb-3 px-1">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <KeyRound className="w-3 h-3 text-primary-600" /> 4-Digit PIN
               </label>
             </div>
             <div className="flex gap-4 sm:gap-6 justify-center">
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
                  className="w-14 h-16 sm:w-16 sm:h-20 text-center text-3xl font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
                  autoComplete="off"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || pin.join('').length < 4}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl font-bold transition-all disabled:opacity-50 border border-slate-200"
            >
              Cancel & Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
