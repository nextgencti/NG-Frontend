import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 p-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="z-10 w-full max-w-lg p-8 sm:p-12 glass-dark rounded-3xl border border-white/10 text-center shadow-2xl">
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl shadow-amber-500/30 transform rotate-3">
            <Clock className="text-white w-12 h-12 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Account Under Review</h1>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4 mb-8">
          <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
            Hi{currentUser?.name ? ' ' + currentUser.name : ''}, your profile registration is complete! However, for security purposes, new student accounts require administrator approval before granting dashboard access.
          </p>
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200/90 text-sm font-medium">
              We usually verify accounts within 24 hours. You will be able to log in once your account status is updated to active.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group border border-white/10 hover:border-white/20"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to Login
        </button>
      </div>
    </div>
  );
}
