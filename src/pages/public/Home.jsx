import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Zap, Users, Monitor, Award, Menu, X, Facebook, Youtube, Instagram, Trophy, Clock, ClipboardList, Medal, ChevronDown, User, Book, Activity, LogOut } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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
    <div className="min-h-screen bg-slate-50 overflow-hidden relative selection:bg-primary-500/10">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-dot-pattern opacity-50"></div>

        {/* Animated Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#6366F1]/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-[#38BDF8]/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-[#34D399]/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo className="w-10 h-10 sm:w-12 sm:h-12" showText={false} />
            <div className="flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold tracking-[0.1em] leading-none flex items-center">
                <span className="text-slate-900">NEXT</span>
                <span className="text-primary-600">GEN</span>
              </h2>
              <p className="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 opacity-60">
                Institute Muskara
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => navigate(link.path)}
                className="text-[11px] font-bold text-slate-500 hover:text-primary-600 transition-colors uppercase tracking-widest relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-300 group-hover:w-full rounded-full"></span>
              </button>
            ))}
            
            {/* User Profile Section or Login */}
            {currentUser ? (
              <div className="relative ml-4">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-slate-200 bg-white hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/10 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden shadow-inner border border-slate-200/50 bg-slate-100 shrink-0">
                    <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-primary-600 transition-colors whitespace-nowrap max-w-[150px] truncate">{currentUser.name || currentUser.displayName || 'User'}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-transform duration-300 shrink-0 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner border border-slate-200/50 bg-slate-100 shrink-0">
                        <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{currentUser.name || currentUser.displayName || 'User'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{currentUser.role || 'Student'} Account</p>
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
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-primary-600 transition-colors w-full text-left group/item"
                        >
                          <item.icon className="w-4 h-4 text-slate-400 group-hover/item:text-primary-500 transition-colors" />
                          <span className="text-sm font-bold">{item.label}</span>
                        </button>
                      ))}
                      <div className="h-px bg-slate-100 my-1 mx-2"></div>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors w-full text-left group/item"
                      >
                        <LogOut className="w-4 h-4 text-slate-400 group-hover/item:text-rose-500 transition-colors" />
                        <span className="text-sm font-bold">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
            {currentUser ? (
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-md border border-slate-200/50 bg-slate-100 shrink-0">
                <img src={currentUser.photoURL || currentUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.displayName || 'User')}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md shadow-primary-500/20"
              >
                Login
              </button>
            )}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center text-slate-600 bg-slate-50 border border-slate-100 rounded-xl"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <div className={`fixed inset-0 top-20 bg-white z-[100] transition-all duration-500 md:hidden h-[calc(100vh-5rem)] overflow-y-auto ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="flex flex-col p-8 gap-1 items-stretch">
            {navLinks.map((link, idx) => (
              <button 
                key={link.name} 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(link.path);
                }}
                className="py-5 text-xl font-bold text-slate-700 hover:text-primary-600 transition-all flex items-center justify-between group border-b border-slate-50 w-full text-left"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                <span className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                  {link.name}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            
            <div className={`mt-8 space-y-8 transition-all duration-700 delay-300 ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-bold text-base shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              >
                Sign in to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-px w-12 bg-slate-100"></div>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em]">Connect with us</p>
                <div className="flex items-center gap-8">
                  {[Facebook, Youtube, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-28 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="text-left animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-black uppercase tracking-widest mb-8">
              <Logo className="w-4 h-4" />
              <span>NextGen Computer Training Institute Muskara</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-[1.1]">
              NextGen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800">
                Computer Training <br />
                Institute Muskara
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-lg mb-10 font-medium leading-relaxed">
              Manage students, courses, attendance and reports in one simple platform. Built for the modern educational environment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-primary-600 text-white hover:bg-primary-700 rounded-2xl font-bold text-base transition-all shadow-xl shadow-primary-500/20 hover:-translate-y-1 flex items-center justify-center gap-3 group"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                Access Portal 
              </button>
              <button className="px-8 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl font-bold text-base transition-all shadow-sm flex items-center justify-center gap-3 group">
                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <ArrowRight className="w-4.5 h-4.5 text-primary-600" />
                </div>
                View Live Demo
              </button>
            </div>
          </div>

          {/* Right Column: Hero Image */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-accent-500/20 rounded-[2.5rem] blur-2xl -z-10 rotate-3 transform"></div>
            <div className="relative rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden aspect-[4/3] bg-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=60&w=1200" 
                alt="Students using computers" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                loading="eager"
                fetchpriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 p-4 glass border border-white/50 rounded-2xl flex items-center gap-4 animate-bounce duration-[3000ms]">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/40">
                   <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Learners</p>
                  <p className="text-xl font-black text-primary-700">1.2k+</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 text-left">
          {/* Expert Guidance Card */}
          <div className="group bg-gradient-to-br from-white to-primary-50 p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600"></div>
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-primary-100">
              <Users className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Expert Guidance</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Our experienced faculty provides personalized attention to help you master every concept with ease.
            </p>
          </div>
          
          {/* Student Portal Card */}
          <div className="group bg-gradient-to-br from-white to-orange-50 p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-500"></div>
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-orange-100">
              <Monitor className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Student Portal</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Access your course materials, track attendance, and manage fees effortlessly through our portal.
            </p>
          </div>

          {/* Online Tests Card */}
          <div className="group bg-gradient-to-br from-white to-indigo-50 p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-indigo-100">
              <Zap className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Online Tests</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Prepare for success with chapter-wise practice tests and real-time performance analytics.
            </p>
          </div>
          
          {/* Verified Certificates Card */}
          <div className="group bg-gradient-to-br from-white to-emerald-50 p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600"></div>
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-emerald-100">
              <Award className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Verified Certificates</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Earn industry-recognized and verifiable certificates that add value to your professional career.
            </p>
          </div>
        </div>

        {/* Popular Courses Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight">
              Our Popular <span className="text-primary-600">Courses</span>
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
                color: 'from-blue-600 to-indigo-600'
              },
              {
                title: 'DCA',
                subtitle: 'Diploma in Comp. Applications',
                duration: '6 Months',
                image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=50&w=400',
                color: 'from-emerald-600 to-teal-600'
              },
              {
                title: 'CCC',
                subtitle: 'Course on Computer Concepts',
                duration: '3 Months',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=50&w=400',
                color: 'from-orange-600 to-amber-600'
              },
              {
                title: 'Tally Prime',
                subtitle: 'With GST & Accounting',
                duration: '3 Months',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=50&w=400',
                color: 'from-rose-600 to-pink-600'
              }
            ].map((course, idx) => (
              <div 
                key={idx}
                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/40 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-slate-200 flex flex-col"
              >
                {/* Course Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${course.color} mix-blend-multiply opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-slate-800 uppercase tracking-widest shadow-sm">
                    {course.duration}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-8">{course.subtitle}</p>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      Enrol Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-3 text-primary-600 font-black uppercase text-xs tracking-[0.2em] hover:gap-5 transition-all">
              View All Courses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── PRACTICE TESTS SECTION ─── */}
        {publicTests?.length > 0 && (
          <div className="mt-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
                <Zap className="w-3.5 h-3.5" />
                <span>Free & Open for Everyone</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                Practice <span className="text-primary-600">Tests</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                Test your knowledge with our free practice tests. No login required — just enter your name and start!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicTests.map((test) => (
                <div
                  key={test.id}
                  className="group bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-200"
                >
                  {/* Gradient Top Bar */}
                  <div className="h-2 bg-gradient-to-r from-primary-600 to-indigo-600"></div>
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${difficultyColors[test.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                          {test.difficulty}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 leading-tight group-hover:text-primary-600 transition-colors">
                          {test.title}
                        </h3>
                      </div>
                      <div className="w-10 h-10 bg-primary-50 rounded-xl border border-primary-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    {test.description && (
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{test.description}</p>
                    )}

                    <div className="flex flex-col gap-3 mb-6 mt-auto pt-5 border-t border-slate-100 border-dashed">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <ClipboardList className="w-4 h-4 text-indigo-500" />
                          <span>Questions</span>
                        </div>
                        <span className="font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{test.questions}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>Duration</span>
                        </div>
                        <span className="font-black text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">{test.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Award className="w-4 h-4 text-emerald-500" />
                          <span>Total Marks</span>
                        </div>
                        <span className="font-black text-slate-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">{test.totalMarks}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/tests/public/${test.id}`)}
                      className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-bold text-sm transition-all hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      Start Free Test <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── LEADERBOARD SECTION ─── */}
        {leaderboard?.length > 0 && (
          <div className="mt-32">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest mb-6">
                <Trophy className="w-3.5 h-3.5" />
                <span>Hall of Fame</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-800 mb-4 tracking-tight">
                Top <span className="text-amber-600">Performers</span>
              </h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                See who's leading the charts! Take a test and compete for the top spot.
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-5">Name</div>
                <div className="col-span-2 text-center">Tests</div>
                <div className="col-span-2 text-center">Avg %</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.rank} className="grid grid-cols-12 items-center px-6 py-3.5 border-b border-slate-50 hover:bg-primary-50/30 transition-colors">
                  <div className="col-span-1">
                    {entry.rank <= 3 ? (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        entry.rank === 1 ? 'bg-amber-100' : entry.rank === 2 ? 'bg-slate-100' : 'bg-orange-100'
                      }`}>
                        {entry.rank === 1 ? <Trophy className="w-4 h-4 text-amber-500" /> : entry.rank === 2 ? <Medal className="w-4 h-4 text-slate-500" /> : <Award className="w-4 h-4 text-orange-600" />}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">{entry.rank}</span>
                    )}
                  </div>
                  <div className="col-span-5">
                    <p className="text-sm font-bold text-slate-900 truncate">{entry.name}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-xs font-bold text-slate-600">{entry.testsAttempted}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xs font-bold ${entry.avgPercentage >= 70 ? 'text-emerald-600' : entry.avgPercentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {entry.avgPercentage}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-bold text-slate-700">{entry.totalScore}/{entry.totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

