import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-800 px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-500/20 rounded-full blur-[100px]"></div>

      <div className="z-10 w-full max-w-md p-8 sm:p-10 glass-dark rounded-3xl border border-white/10">
        <div className="flex justify-center mb-8">
          <Logo className="w-24 h-24" />
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-2">Create Account</h2>
        <p className="text-slate-400 text-center mb-8">Join NextGen training today</p>

        <form onSubmit={handleSendOTP} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center group"
          >
            {isLoading ? (
              <span className="animate-pulse">Sending OTP...</span>
            ) : (
              <>
                Continue to Register
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account? <Link to="/login" className="text-primary-400 hover:underline">Sign in</Link>
          </p>
          <div className="mt-4">
             <Link to="/register-institute" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
               Are you an Institute? Register here
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
