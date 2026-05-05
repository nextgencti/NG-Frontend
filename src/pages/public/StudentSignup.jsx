import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, UserPlus, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import Logo from '../../components/Logo';

export default function StudentSignup() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { email });
      setIsLoading(false);
      toast.success(response.data.message || 'OTP sent to your email!');
      navigate('/verify-otp', { state: { email, isSignup: true } });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC] px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group z-20"
      >
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:-translate-x-1">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </div>
        <span className="hidden sm:block">Back to Home</span>
      </button>

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md bg-white p-10 sm:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-col items-center mb-10">
          <Logo className="w-16 h-16 mb-4" />
          <div className="flex items-center text-3xl font-black tracking-[0.1em] leading-none select-none">
            <span className="text-slate-900">NEXT</span>
            <span className="text-primary-600">GEN</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">
            Institute Registration
          </p>
        </div>
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Student Enrolment</h2>
          <p className="text-slate-500 font-medium text-sm">Join the next generation of learners</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary-600">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white transition-all outline-none font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4.5 bg-slate-900 text-white hover:bg-primary-600 rounded-2xl font-bold text-base shadow-xl shadow-slate-900/10 hover:shadow-primary-500/25 transition-all flex items-center justify-center group active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              <>
                <UserPlus className="mr-2 w-5 h-5" />
                Continue to Register
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-500 text-sm font-medium">
            Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
