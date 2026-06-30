import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import Logo from '../components/Logo';

export default function Login() {
  const [activeTab, setActiveTab] = useState('password'); // 'password', 'otp', 'forgot-email', 'forgot-otp', 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP Reset states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tempUser, setTempUser] = useState(null); // to hold user info temporarily before final submit
  
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithEmailAndPassword, setCurrentUser } = useAuth();

  useEffect(() => {
    if (activeTab === 'forgot-otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [activeTab]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const { user, isNew } = await loginWithEmailAndPassword(email, password);
      toast.success('Successfully logged in!');
      
      if (isNew || !user.profileComplete) {
        navigate('/complete-profile');
      } else if (user.role === 'student' && user.status === 'pending') {
        navigate('/pending-approval');
      } else if (user.role === 'superadmin') {
        navigate('/sa-pin');
      } else if (user.role === 'admin') {
        navigate('/admin-pin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      let errorMsg = 'Failed to log in. Please check your credentials.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMsg = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid credentials. Please try again.';
      }
      toast.error(error.response?.data?.message || errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

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
      navigate('/verify-otp', { state: { email } });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { email });
      toast.success(response.data.message || 'OTP sent to your email!');
      setActiveTab('forgot-otp');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    if (value.length > 1) {
      const pastedData = value.split('').slice(0, 6);
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== '' && index < 5) {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1].focus();
        }
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyResetOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp: otpValue });
      const { token, user } = response.data;
      
      // Save token temporarily so subsequent update password call is authenticated
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setTempUser(user);
      
      toast.success('OTP verified successfully! Set your new password.');
      setActiveTab('forgot-password');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/update-password', { password: newPassword });
      toast.success('Password updated successfully!');
      
      if (tempUser) {
        setCurrentUser(tempUser);
        
        if (!tempUser.profileComplete) {
          navigate('/complete-profile');
        } else if (tempUser.role === 'student' && tempUser.status === 'pending') {
          navigate('/pending-approval');
        } else if (tempUser.role === 'superadmin') {
          navigate('/sa-pin');
        } else if (tempUser.role === 'admin') {
          navigate('/admin-pin');
        } else {
          navigate('/dashboard');
        }
      } else {
        handleCancelReset();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReset = () => {
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setTempUser(null);
    setActiveTab('password');
  };

  const handleGoogleLogin = async () => {
    try {
      const { user, isNew } = await loginWithGoogle();
      if (isNew || !user.profileComplete) {
        navigate('/complete-profile');
      } else if (user.role === 'student' && user.status === 'pending') {
        navigate('/pending-approval');
      } else if (user.role === 'superadmin') {
        navigate('/sa-pin');
      } else if (user.role === 'admin') {
        navigate('/admin-pin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
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

      {/* Dynamic Background Elements - Subtle */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-md p-6 sm:p-8 bg-white rounded-[24px] text-left border border-[#E5E7EB] m-4 shadow-soft">
        <div className="flex justify-center mb-4">
          <Logo className="w-20 h-20" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-1 tracking-tight">
          {activeTab.startsWith('forgot') ? (activeTab === 'forgot-password' ? 'Set New Password' : 'Reset Password') : 'Welcome Back'}
        </h2>
        <p className="text-[#6B7280] text-[14px] text-center mb-4 font-medium">
          {activeTab === 'forgot-email' && 'Enter your email to receive an OTP reset code'}
          {activeTab === 'forgot-otp' && 'Enter the 6-digit OTP code sent to your email'}
          {activeTab === 'forgot-password' && 'Enter your new password below'}
          {!activeTab.startsWith('forgot') && 'Sign in to access your dashboard'}
        </p>

        {/* Login Method Tabs */}
        {!activeTab.startsWith('forgot') && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${
                activeTab === 'password'
                  ? 'bg-white text-[#4F46E5] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-all ${
                activeTab === 'otp'
                  ? 'bg-white text-[#4F46E5] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              OTP Login
            </button>
          </div>
        )}

        {activeTab === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type your Email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot-email')}
                  className="text-[11px] font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-11 pr-12 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type Your Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : activeTab === 'otp' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type your Email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </span>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : activeTab === 'forgot-email' ? (
          <form onSubmit={handleSendResetOTP} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type your Email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </span>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelReset}
              className="w-full text-center text-[13px] font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors pt-2 block"
            >
              Back to Login
            </button>
          </form>
        ) : activeTab === 'forgot-otp' ? (
          <form onSubmit={handleVerifyResetOTP} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1 block text-center">
                OTP Verification Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white border border-[#E5E7EB] rounded-[12px] text-[#111827] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                    maxLength={1}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancelReset}
              className="w-full text-center text-[13px] font-bold text-[#4F46E5] hover:text-[#4338CA] transition-colors pt-2 block"
            >
              Cancel Reset
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-11 pr-12 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type Your Password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#94A3B8]" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full pl-11 pr-12 py-2.5 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                  placeholder="Type Your Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#4F46E5] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[10px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group disabled:opacity-70 active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating Password...
                </span>
              ) : (
                <>
                  Update Password
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {!activeTab.startsWith('forgot') && (
          <>
            <div className="mt-4 text-center">
              <p className="text-[#6B7280] text-[14px] font-medium">
                Don't have an account? <Link to="/signup" className="text-[#4F46E5] hover:text-[#4338CA] font-semibold transition-colors">Create Account</Link>
              </p>
            </div>

            <div className="mt-4 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]"></div>
              </div>
              <div className="relative px-4 bg-white text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Or continue with
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="mt-4 w-full py-3 px-4 bg-white hover:bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] rounded-[10px] text-[14px] font-bold transition-all flex items-center justify-center shadow-sm active:scale-[0.98]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-center">
          <p className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">
            NextGen Computer Training Institute Muskara
          </p>
        </div>
      </div>
    </div>
  );
}
