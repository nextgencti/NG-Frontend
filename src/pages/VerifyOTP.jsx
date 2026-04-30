import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();
  
  const email = location.state?.email || 'user@example.com';
  const isSignup = location.state?.isSignup || false;


  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!location.state?.email) {
      toast.error('No email found. Please login again.');
      navigate('/');
    }
  }, [location, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.split('').slice(0, 6);
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex].focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      // Focus next input automatically
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on Backspace if current is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Call actual backend API
      const response = await api.post('/auth/verify-otp', { email, otp: otpValue });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
       setCurrentUser(user);
 
       setIsLoading(false);
       toast.success(isSignup ? 'Email verified! Let\'s complete your profile.' : 'Successfully logged in!');

      
      if (!user.profileComplete) {
         navigate('/complete-profile');
      } else if (user.role === 'student' && user.status === 'pending') {
         navigate('/pending-approval');
      } else {
         navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { email });
      toast.success(response.data.message || 'New OTP sent to your email!');
      setTimer(300); // Reset to 5 minutes
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background Elements - Subtle */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md p-8 sm:p-12 bg-white rounded-[24px] text-left border border-[#E5E7EB] m-4 shadow-soft">
        
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#6B7280] transition-colors mb-6 border border-[#E5E7EB]"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

         <div className="flex justify-center mb-6">
          <Logo className="w-20 h-20" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-2 tracking-tight">
          {isSignup ? 'Verify Registration' : 'Check your Email'}
        </h2>

        <p className="text-[#6B7280] text-[14px] text-center mb-8 font-medium leading-relaxed">
          We've sent a 6-digit verification code to
          <br/><span className="text-[#111827] font-bold">{email}</span>
        </p>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-white border border-[#E5E7EB] rounded-[12px] text-[#111827] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                maxLength={6}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full py-3.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[12px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </span>
            ) : (
              <>
                Verify & Continue
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[14px] text-[#6B7280] font-medium">
            {canResend ? (
              <>
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-[#4F46E5] hover:text-[#4338CA] font-bold transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              </>
            ) : (
              <span>Resend code in <span className="text-[#111827] font-bold">{formatTime(timer)}</span></span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
