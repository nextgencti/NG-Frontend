import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative selection:bg-primary-500/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"></div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <Logo 
            className="w-16 h-16" 
            showText={true} 
            textClassName="text-2xl font-bold text-white tracking-tight" 
          />
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary-300 text-sm font-medium mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Zap className="w-4 h-4 text-accent-400" />
          <span>The Ultimate School Management System</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400 mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-tight">
          Manage your institute <br className="hidden sm:block" /> with NextGen technology.
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          A premium, fast, and secure platform to handle student enrollments, attendance, fees, and certificates all in one beautiful dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 flex items-center justify-center gap-2 group"
          >
            Access Portal 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all backdrop-blur-md">
            View Live Demo
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid sm:grid-cols-3 gap-6 mt-32 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 text-left">
          <div className="glass-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors"></div>
            <ShieldCheck className="w-8 h-8 text-primary-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Secure Access</h3>
            <p className="text-slate-400 text-sm tracking-wide leading-relaxed">JWT encrypted sessions and role-based routing keep your data safe.</p>
          </div>
          <div className="glass-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl group-hover:bg-accent-500/20 transition-colors"></div>
            <Users className="w-8 h-8 text-accent-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Student Portal</h3>
            <p className="text-slate-400 text-sm tracking-wide leading-relaxed">Students can track fees, attendance, and download certificates easily.</p>
          </div>
          <div className="glass-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <BookOpen className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Course Catalog</h3>
            <p className="text-slate-400 text-sm tracking-wide leading-relaxed">Manage available courses with detailed duration and fee structures.</p>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
