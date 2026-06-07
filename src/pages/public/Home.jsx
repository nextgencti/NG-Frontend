import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Zap, Users, Monitor, Award, Menu, X, Facebook, Youtube, Instagram, Trophy, Clock, ClipboardList, Medal, ChevronDown, User, Book, Activity, LogOut } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import heroImage from '../../assets/image.png';
import studentMascot from '../../assets/student_mascot.png';
import expertGuidanceImg from '../../assets/expert_guidance.png';
import studentPortalImg from '../../assets/student_portal.png';
import onlineTestsImg from '../../assets/online_tests.png';
import verifiedCertificatesImg from '../../assets/verified_certificates.png';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [publicTests, setPublicTests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchPublicTests();
    fetchLeaderboard();
  }, []);

  const fetchPublicTests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/tests`);
      if (res.data.success) setPublicTests(res.data.tests || []);
    } catch (err) { 
      setPublicTests([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/leaderboard`);
      if (res.data.success) setLeaderboard(res.data.leaderboard || []);
    } catch (err) { 
      setLeaderboard([]);
    }
  };

  const difficultyColors = {
    Easy: 'bg-emerald-100 text-emerald-700',
    Medium: 'bg-amber-100 text-amber-700',
    Hard: 'bg-rose-100 text-rose-700'
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/dashboard/courses' },
    { name: 'Classroom', path: '/dashboard/courses' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF9FF] to-white overflow-hidden relative selection:bg-indigo-500/10">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-white/10">
              <Logo className="w-6 h-6 sm:w-7.5 sm:h-7.5" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
              {/* <p className="text-[9px] sm:text-[10px] font-helvetica-light font-extrabold text-gray-500 uppercase tracking-widest mt-1 opacity-80">
                Computer Training Institute <br /> Muskara
              </p> */}
            </div>
          </div>

          {/* Centered Desktop Menu Links */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => navigate(link.path)}
                className="text-base font-neue-machina-medium text-slate-300 hover:text-indigo-400 transition-colors tracking-normal normal-case relative group"
              >
                {link.name}
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-1 bg-indigo-400 transition-all duration-300 group-hover:w-4 rounded-full"></span>
              </button>
            ))}
          </div>
          
          {/* User Profile Section or Login */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser ? (
              <div className="relative ml-4">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-indigo-950 bg-slate-900/80 hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-inner border border-slate-800 bg-slate-900 shrink-0">
                    <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors whitespace-nowrap max-w-[120px] truncate">{currentUser.name || currentUser.displayName || 'User'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-transform duration-300 shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-2xl shadow-xl shadow-slate-950/80 border border-slate-800/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-800 bg-slate-900 shrink-0">
                        <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{currentUser.name || currentUser.displayName || 'User'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{currentUser.role || 'Student'} Account</p>
                      </div>
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      {[
                        { icon: User, label: 'My Profile', path: '/dashboard' },
                      ].map((item, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate(item.path);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-indigo-950/50 text-slate-300 hover:text-indigo-400 transition-colors w-full text-left group/item"
                        >
                          <item.icon className="w-4 h-4 text-slate-500 group-hover/item:text-indigo-400 transition-colors" />
                          <span className="text-sm font-bold">{item.label}</span>
                        </button>
                      ))}
                      <div className="h-px bg-slate-800 my-1 mx-2"></div>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-950/30 text-slate-300 hover:text-rose-400 transition-colors w-full text-left group/item"
                      >
                        <LogOut className="w-4 h-4 text-slate-500 group-hover/item:text-rose-400 transition-colors" />
                        <span className="text-sm font-bold">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 hover:text-indigo-200 border border-indigo-500/20 px-7 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            {currentUser ? (
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border border-indigo-950 bg-slate-800 shrink-0">
                <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-indigo-600/20 text-indigo-300 px-5 py-2 rounded-full font-bold text-xs hover:bg-indigo-600/30 transition-all shadow-sm cursor-pointer"
              >
                Login
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-300 bg-slate-900 border border-indigo-950 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`fixed inset-0 top-20 bg-slate-950/95 backdrop-blur-xl z-[100] transition-all duration-500 md:hidden h-[calc(100vh-5rem)] overflow-y-auto ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="flex flex-col p-8 gap-1 items-stretch">
            {navLinks.map((link, idx) => (
              <button 
                key={link.name} 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(link.path);
                }}
                className="py-5 text-xl font-bold text-slate-300 hover:text-indigo-400 transition-all flex items-center justify-between group border-b border-indigo-950/50 w-full text-left"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <span className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                  {link.name}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            
            <div className={`mt-8 space-y-8 transition-all duration-700 delay-300 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {!currentUser ? (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-4 rounded-full font-bold text-base shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Sign in to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 py-4 rounded-full font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-px w-12 bg-indigo-950"></div>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">Connect with us</p>
                <div className="flex items-center gap-8">
                  {[Facebook, Youtube, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="text-slate-500 hover:text-indigo-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section Wrapper with distinct background color */}
      <section className="w-full bg-gradient-to-br from-[#0F0C20] via-[#151230] to-[#0A0815] border-b border-indigo-950/45 relative overflow-hidden pt-32 lg:pt-40 pb-0">
        
        {/* Animated gradient orbs for depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/15 to-indigo-500/10 rounded-full blur-[100px] animate-hero-bg pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/10 to-violet-500/5 rounded-full blur-[80px] animate-blob pointer-events-none"></div>

        {/* Background Decorative Blobs */}
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-[#6366F1]/5 rounded-full blur-[120px] -z-10 animate-blob pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-end">
            {/* Left Column: Text Content */}
            <div className="text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000 pb-16 lg:pb-24 pt-8">            
              <h1 className="text-4xl sm:text-6xl font-neue-machina-ultrabold text-white mb-5 tracking-tight leading-[1.15]">
                We only <span className="relative inline-block border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 mx-1">
                  <span className="absolute -top-[3px] -left-[3px] w-1.5 h-1.5 bg-[#0F0C20] border border-indigo-500/80"></span>
                  <span className="absolute -top-[3px] -right-[3px] w-1.5 h-1.5 bg-[#0F0C20] border border-indigo-500/80"></span>
                  <span className="absolute -bottom-[3px] -left-[3px] w-1.5 h-1.5 bg-[#0F0C20] border border-indigo-500/80"></span>
                  <span className="absolute -bottom-[3px] -right-[3px] w-1.5 h-1.5 bg-[#0F0C20] border border-indigo-500/80"></span>
                  <span className="text-indigo-300">teach</span>
                </span> <br />
                  what we are really <br />
                  really <span className="font-juana-regular text-indigo-400">good</span> at.
                
              </h1>
              
              <p className="font-helvetica-light text-base text-slate-300 max-w-md mx-auto lg:mx-0 mb-8 font-medium leading-relaxed">
                  Get ready to <span className="relative inline-block border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 mx-0.5">
                    <span className="absolute -top-[2px] -left-[2px] w-1 h-1 bg-[#0F0C20] border border-indigo-500/80"></span>
                    <span className="absolute -top-[2px] -right-[2px] w-1 h-1 bg-[#0F0C20] border border-indigo-500/80"></span>
                    <span className="absolute -bottom-[2px] -left-[2px] w-1 h-1 bg-[#0F0C20] border border-indigo-500/80"></span>
                    <span className="absolute -bottom-[2px] -right-[2px] w-1 h-1 bg-[#0F0C20] border border-indigo-500/80"></span>
                    <span className="text-indigo-300 font-semibold">accelerate your career</span>
                  </span> with customized courses and leave your mark in the tech industry
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-6.5 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-full font-bold text-sm transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-6.5 h-6.5 bg-white/20 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  Access Portal 
                </button>
                <button className="px-6.5 py-3 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2.5 group cursor-pointer">
                  <div className="w-6.5 h-6.5 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-300 group-hover:text-indigo-200" />
                  </div>
                  View Live Demo
                </button>
              </div>
            </div>

            {/* Right Column: Hero Image */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 flex justify-center items-end self-end pt-0 h-full">
              {/* Background Decorative Rings, Blobs & Perfect Concentric Circles */}
              <div className="absolute w-[110%] h-[110%] bg-indigo-500/5 rounded-full -z-10 blur-3xl"></div>
              
              {/* Concentric Circle Wrapper to guarantee sharing exact center */}
              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes breathe-large {
                    0%, 100% { transform: scale(1); opacity: 0.85; }
                    50% { transform: scale(1.05); opacity: 0.95; }
                  }
                  @keyframes breathe-small {
                    0%, 100% { transform: scale(1); opacity: 0.95; }
                    50% { transform: scale(0.95); opacity: 0.85; }
                  }
                  .animate-breathe-large {
                    animation: breathe-large 9s ease-in-out infinite;
                  }
                  .animate-breathe-small {
                    animation: breathe-small 7s ease-in-out infinite;
                  }
                `}} />
                <div className="relative w-[70%] aspect-square max-w-[420px] flex items-center justify-center">
                  {/* Filled circles behind the student image */}
                  <div className="absolute w-[95%] aspect-square bg-gradient-to-tr from-indigo-500/35 via-purple-500/25 to-indigo-500/35 rounded-full shadow-inner animate-breathe-large"></div>
                  <div className="absolute w-[72%] aspect-square bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 rounded-full shadow-lg shadow-indigo-500/10 border border-white/15 animate-breathe-small"></div>
                  
                </div>
              </div>
              
              {/* Small Floating Dots */}
              <div className="absolute top-[10%] left-[5%] w-3 h-3 bg-indigo-400 rounded-full opacity-60 animate-bounce duration-[3000ms]"></div>
              <div className="absolute bottom-[25%] right-[5%] w-4 h-4 bg-purple-400 rounded-full opacity-60 animate-bounce duration-[4000ms] delay-500"></div>
              <div className="absolute top-[60%] left-[10%] w-2 h-2 bg-pink-400 rounded-full opacity-50 animate-bounce duration-[2500ms] delay-200"></div>

              <div className="relative z-10 max-w-[750px] w-full flex items-end">
                <img 
                  src={heroImage} 
                  alt="NextGen Computer Training Institute" 
                  className="w-full h-auto object-contain transform hover:scale-105 transition-transform duration-700 translate-y-[2px]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              
              {/* Floating Badge 1 - Active Learners */}
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 p-3 bg-slate-900/85 backdrop-blur-md border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 shadow-2xl shadow-indigo-950/50 z-20 hover:scale-105 transition-transform duration-300">
                <div className="w-8.5 h-8.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
                   <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Active Learners</p>
                  <p className="text-base sm:text-lg font-black text-white leading-none">1.2k+</p>
                </div>
              </div>

              {/* Floating Badge 2 - Interactive Courses / Verified */}
              <div className="absolute bottom-6 right-6 p-3 bg-slate-900/85 backdrop-blur-md border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 shadow-2xl shadow-indigo-950/50 z-20 hover:scale-105 transition-transform duration-300">
                <div className="w-8.5 h-8.5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/10">
                   <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none mb-1">Verified Programs</p>
                  <p className="text-base sm:text-lg font-black text-white leading-none">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Page Content Wrapper with Background Image */}
      <div className="relative overflow-hidden">


        {/* Main Page Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float-card {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          @keyframes float-mascot {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-10px) scale(1.03); }
          }
          .animate-float-1 { animation: float-card 4s ease-in-out infinite; }
          .animate-float-2 { animation: float-card 5s ease-in-out infinite 0.5s; }
          .animate-float-3 { animation: float-card 4.5s ease-in-out infinite 1s; }
          .animate-float-4 { animation: float-card 5.5s ease-in-out infinite 1.5s; }
          .animate-float-mascot { animation: float-mascot 6s ease-in-out infinite; }
        `}} />
        
        {/* Feature Highlights - Alternating Rows */}
        <div className="flex flex-col gap-12 sm:gap-16 md:gap-24 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 text-left">
          
          {/* Row 1: Expert Guidance (Card Left, Image Right) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center">
            {/* Card */}
            <div className="group p-2 sm:p-6 md:p-8 flex flex-col justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#E3D8FF] rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-all duration-500">
                <Users className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#5842C3]" />
              </div>
              <h3 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 mb-2 sm:mb-4 tracking-tight">Expert Guidance</h3>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                Our experienced faculty provides personalized attention to help you master every concept with ease.
              </p>
            </div>
            {/* Image */}
            <div className="flex justify-center items-center relative group p-2 animate-float-2">
              <div className="absolute w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-indigo-500/10 rounded-full blur-2xl sm:blur-3xl group-hover:bg-indigo-500/15 transition-all duration-500 pointer-events-none -z-10"></div>
              <img 
                src={expertGuidanceImg} 
                alt="Expert Guidance Illustration" 
                className="w-full max-w-[150px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[380px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(99,102,241,0.2)] sm:drop-shadow-[0_15px_30px_rgba(99,102,241,0.25)] hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Row 2: Student Portal (Image Left, Card Right) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center">
            {/* Image */}
            <div className="flex justify-center items-center relative group p-2 animate-float-4">
              <div className="absolute w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl group-hover:bg-blue-500/15 transition-all duration-500 pointer-events-none -z-10"></div>
              <img 
                src={studentPortalImg} 
                alt="Student Portal Illustration" 
                className="w-full max-w-[150px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[380px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(59,130,246,0.2)] sm:drop-shadow-[0_15px_30px_rgba(59,130,246,0.25)] hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Card */}
            <div className="group p-2 sm:p-6 md:p-8 flex flex-col justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#D4E9FB] rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-all duration-500">
                <Monitor className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#0066CC]" />
              </div>
              <h3 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 mb-2 sm:mb-4 tracking-tight">Student Portal</h3>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                Access your course materials, track attendance, and manage fees effortlessly through our portal.
              </p>
            </div>
          </div>

          {/* Row 3: Online Tests (Card Left, Image Right) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center">
            {/* Card */}
            <div className="group p-2 sm:p-6 md:p-8 flex flex-col justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#FAD4EF] rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-all duration-500">
                <Zap className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#A020F0]" />
              </div>
              <h3 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 mb-2 sm:mb-4 tracking-tight">Online Tests</h3>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                Prepare for success with chapter-wise practice tests and real-time performance analytics.
              </p>
            </div>
            {/* Image */}
            <div className="flex justify-center items-center relative group p-2 animate-float-2">
              <div className="absolute w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-fuchsia-500/10 rounded-full blur-2xl sm:blur-3xl group-hover:bg-fuchsia-500/15 transition-all duration-500 pointer-events-none -z-10"></div>
              <img 
                src={onlineTestsImg} 
                alt="Online Tests Illustration" 
                className="w-full max-w-[150px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[380px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(217,70,239,0.2)] sm:drop-shadow-[0_15px_30px_rgba(217,70,239,0.25)] hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Row 4: Verified Certificates (Image Left, Card Right) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 md:gap-16 items-center">
            {/* Image */}
            <div className="flex justify-center items-center relative group p-2 animate-float-4">
              <div className="absolute w-28 h-28 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-emerald-500/10 rounded-full blur-2xl sm:blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500 pointer-events-none -z-10"></div>
              <img 
                src={verifiedCertificatesImg} 
                alt="Verified Certificates Illustration" 
                className="w-full max-w-[150px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-[380px] h-auto object-contain drop-shadow-[0_10px_20px_rgba(16,185,129,0.2)] sm:drop-shadow-[0_15px_30px_rgba(16,185,129,0.25)] hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Card */}
            <div className="group p-2 sm:p-6 md:p-8 flex flex-col justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-[#D4F0E0] rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-all duration-500">
                <Award className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#059669]" />
              </div>
              <h3 className="text-base sm:text-2xl md:text-3xl font-black text-slate-800 mb-2 sm:mb-4 tracking-tight">Verified Certificates</h3>
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium leading-relaxed">
                Earn industry-recognized and verifiable certificates that add value to your professional career.
              </p>
            </div>
          </div>

        </div>


        {/* Popular Courses Section */}
        <div className="mt-32">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Our Popular <span className="text-indigo-700">Courses</span>
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Choose from our wide range of professional computer courses designed to make you industry-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'ADCA',
                subtitle: 'Adv. Diploma in Comp. Applications',
                duration: '12 Months',
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=50&w=400',
                color: 'from-blue-600 to-indigo-700',
                price: '4999',
                originalPrice: '9999',
                discount: '50% Off',
                mode: 'Offline',
                language: 'Hinglish'
              },
              {
                title: 'DCA',
                subtitle: 'Diploma in Comp. Applications',
                duration: '6 Months',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=50&w=400',
                color: 'from-emerald-600 to-teal-600',
                price: '2999',
                originalPrice: '5999',
                discount: '50% Off',
                mode: 'Offline',
                language: 'Hinglish'
              },
              {
                title: 'CCC',
                subtitle: 'Course on Computer Concepts',
                duration: '3 Months',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=50&w=400',
                color: 'from-orange-600 to-amber-600',
                price: '1499',
                originalPrice: '2999',
                discount: '50% Off',
                mode: 'Offline',
                language: 'Hinglish'
              },
              {
                title: 'Tally Prime',
                subtitle: 'With GST & Accounting',
                duration: '3 Months',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=50&w=400',
                color: 'from-rose-600 to-pink-600',
                price: '2499',
                originalPrice: '4999',
                discount: '50% Off',
                mode: 'Offline',
                language: 'Hinglish'
              }
            ].map((course, idx) => (
              <div 
                key={idx}
                className="group flex flex-col gap-2 transition-all duration-500 hover:-translate-y-2 max-w-[340px] sm:max-w-none mx-auto w-full"
              >
                {/* Main Card Container */}
                <div className="bg-indigo-50/35 rounded-xl overflow-hidden border border-indigo-100/80 shadow-xl shadow-indigo-100/5 group-hover:bg-indigo-50/75 group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:border-indigo-300 transition-all duration-500 flex flex-col flex-1">
                  
                  {/* Course Image */}
                  <div className="relative h-48 sm:h-40 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${course.color} mix-blend-multiply opacity-10 group-hover:opacity-25 transition-opacity duration-500`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-65"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-sm border border-white/20">
                      {course.duration}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Combined Title and Subtitle */}
                      <h3 className="text-base font-NeueMachina-Medium text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors mb-3 min-h-[44px] flex items-center">
                        {course.title} ({course.subtitle})
                      </h3>
                      
                      {/* Badges */}
                      <div className="flex gap-2 mb-4 font-NeueMachina-Medium">
                        <span className="bg-rose-50 border border-rose-100/80 text-rose-600 text-[10px] p-1 rounded uppercase tracking-wider">
                          {course.mode}
                        </span>
                        <span className="bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[10px] p-1 rounded uppercase tracking-wider">
                          {course.language}
                        </span>
                      </div>
                    </div>

                    {/* Price details */}
                    <div className="mt-auto pt-4 border-t border-indigo-100/20">
                      <p className="text-emerald-600 text-[8px] font-NeueMachina-Medium uppercase tracking-wider mb-1">
                        Limited Time Discount
                      </p>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl font-NeueMachina-Medium font-bold text-slate-800">
                          ₹{course.price}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 line-through">
                          ₹{course.originalPrice}
                        </span>
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-1 rounded-md ml-auto">
                          {course.discount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detached Bottom Button */}
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-NeueMachina-Medium font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-indigo-100/10 shadow-md shadow-indigo-500/10"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-3 text-indigo-700 hover:text-indigo-800 font-extrabold uppercase text-xs tracking-widest hover:gap-5 transition-all cursor-pointer">
              View All Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      {/* ─── PRACTICE TESTS SECTION (FULL WIDTH DARK THEME) ─── */}
      {publicTests?.length > 0 && (
        <div className="w-full bg-gradient-to-b from-[#1E1B4B] via-[#1a1744] to-[#252262] border-y border-indigo-900/50 py-24 relative overflow-hidden">
          {/* Ambient decorative light orbs inside dark section */}
          <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-[10%] w-96 h-96 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 animate-in fade-in duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-5">
                <Zap className="w-3.5 h-3.5 animate-pulse" />
                <span>Free & Open for Everyone</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
                Practice <span className="text-indigo-400">Tests</span>
              </h2>
              <p className="text-slate-400 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Test your knowledge with our free practice tests. No login required — just enter your name and start!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {publicTests.map((test) => (
                <div
                  key={test.id}
                  className="group bg-white hover:bg-white/95 rounded-3xl border border-indigo-100 hover:border-indigo-300 shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full overflow-hidden"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          test.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          test.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-750 border-rose-100'
                        }`}>
                          {test.difficulty}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-primary-600 transition-colors">
                          {test.title}
                        </h3>
                      </div>
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl border border-indigo-100/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-4 h-4 text-primary-600" />
                      </div>
                    </div>

                    {test.description && (
                      <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{test.description}</p>
                    )}

                    <div className="flex flex-col gap-2.5 mb-5 mt-auto pt-4 border-t border-slate-100 border-dashed">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                          <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100/30">
                            <ClipboardList className="w-3 h-3 text-primary-600" />
                          </div>
                          <span>Questions</span>
                        </div>
                        <span className="font-extrabold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-150 text-[10px]">{test.questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                          <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100/30">
                            <Clock className="w-3 h-3 text-amber-600" />
                          </div>
                          <span>Duration</span>
                        </div>
                        <span className="font-extrabold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-150 text-[10px]">{test.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                          <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100/30">
                            <Award className="w-3 h-3 text-emerald-600 animate-pulse" />
                          </div>
                          <span>Total Marks</span>
                        </div>
                        <span className="font-extrabold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-150 text-[10px]">{test.totalMarks}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/tests/public/${test.id}`)}
                      className="w-full py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl font-bold text-xs transition-all hover:shadow-lg hover:shadow-indigo-500/10 active:scale-95 flex items-center justify-center gap-2 group/btn cursor-pointer"
                    >
                      Start Free Test <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content Continuation */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-20">
        {leaderboard?.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-12 animate-in fade-in duration-1000">
              <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-6">
                <Trophy className="w-3.5 h-3.5" />
                <span>Hall of Fame</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Top <span className="text-amber-600">Performers</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                See who's leading the charts! Take a test and compete for the top spot.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-indigo-50/40 rounded-[2.5rem] border border-indigo-100 shadow-2xl shadow-indigo-100/5 overflow-hidden p-6 sm:p-8">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-6 py-2.5 bg-indigo-600 rounded-2xl text-[10px] font-black text-white uppercase tracking-wider mb-3">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-center">Tests</div>
                <div className="col-span-2 text-center">Avg %</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.rank} className="grid grid-cols-12 items-center px-6 py-2 bg-white border border-indigo-100/30 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all rounded-2xl mb-2.5 last:mb-0">
                  <div className="col-span-2 flex items-center justify-start">
                    {entry.rank <= 3 ? (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${
                        entry.rank === 1 ? 'bg-amber-50 border-amber-200 text-amber-500' : 
                        entry.rank === 2 ? 'bg-slate-50 border-slate-200 text-slate-400' : 
                        'bg-orange-50 border-orange-200 text-orange-600'
                      }`}>
                        {entry.rank === 1 ? <Trophy className="w-4 h-4 text-amber-500" /> : 
                         entry.rank === 2 ? <Medal className="w-4 h-4 text-slate-400" /> : 
                         <Award className="w-4 h-4 text-orange-500" />}
                      </div>
                    ) : (
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100">{entry.rank}</span>
                    )}
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm font-bold text-slate-800 truncate">{entry.name}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs font-extrabold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{entry.testsAttempted}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                      entry.avgPercentage >= 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                      entry.avgPercentage >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                      'bg-rose-50 text-rose-600 border border-rose-100/50'
                    }`}>
                      {entry.avgPercentage}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-extrabold text-slate-700">{entry.totalScore}/{entry.totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      </div>
      <Footer />
    </div>
  );
}

