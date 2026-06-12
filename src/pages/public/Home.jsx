import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Zap, Users, Monitor, Award, Menu, X, Facebook, Youtube, Instagram, Trophy, Clock, ClipboardList, Medal, ChevronDown, User, Book, Activity, LogOut, TrendingUp, GraduationCap, Rocket, Star, Briefcase, FileText, Shield, Download, Calculator, Keyboard, ExternalLink } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [stats, setStats] = useState({ studentsCount: 5000, coursesCount: 120, successRate: 95, certificatesCount: 10000 });
  const [showStats, setShowStats] = useState(true);
  const [courses, setCourses] = useState([]);
  const [activeSection, setActiveSection] = useState('Home');
  const [activeTab, setActiveTab] = useState(0);
  const [prevTab, setPrevTab] = useState(0);
  const [customServices, setCustomServices] = useState([]);

  const govServicesList = [
    { name: "SSC Job Alerts", tagline: "SSC CGL, CHSL, MTS recruitment", icon: Briefcase, link: "https://ssc.gov.in" },
    { name: "Aadhaar Services", tagline: "Download Aadhaar, verify status", icon: Shield, link: "https://myaadhaar.uidai.gov.in" },
    { name: "PAN Card Apply", tagline: "Apply new PAN, corrections", icon: FileText, link: "https://www.pan.utiitsl.com/PAN/" },
    { name: "UP Police Bharti", tagline: "Job alerts & admit cards", icon: Briefcase, link: "https://uppbpb.gov.in" },
    { name: "UP Board Results", tagline: "Check 10th & 12th verify marks", icon: Download, link: "https://upresults.nic.in" },
    { name: "NIELIT CCC Portal", tagline: "Download CCC results & certs", icon: Download, link: "https://student.nielit.gov.in" },
    { name: "UP Scholarship", tagline: "Apply fresh & renewals online", icon: FileText, link: "https://scholarship.up.gov.in" },
    { name: "Voter ID Card", tagline: "New registration & voter lists", icon: Shield, link: "https://www.nvsp.in" },
    { name: "DigiLocker Wallet", tagline: "Access digital gov marksheets", icon: Download, link: "https://digilocker.gov.in" },
    { name: "UP e-District", tagline: "Apply caste & income certificates", icon: FileText, link: "https://edistrict.up.gov.in" }
  ];


  const switchTab = (newTab) => {
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  const features = [
    {
      title: 'Expert Guidance',
      subtitle: 'Learn from the Best',
      description: 'Learn from industry experts with personalized mentorship and real-world insights.',
      icon: GraduationCap,
      image: expertGuidanceImg,
      bullets: [
        'One-on-one mentoring',
        'Industry-relevant curriculum',
        'Doubt clearing support'
      ]
    },
    {
      title: 'Student Portal',
      subtitle: 'All in One Place',
      description: 'Access your courses, track progress, submit assignments, and manage everything in one place.',
      icon: Monitor,
      image: studentPortalImg,
      bullets: [
        'Track your learning journey',
        'Access study materials anytime',
        'Stay updated with notifications'
      ]
    },
    {
      title: 'Online Tests',
      subtitle: 'Measure Your Progress',
      description: 'Assess your knowledge with chapter-wise tests, mock exams, and real-time performance analytics.',
      icon: ClipboardList,
      image: onlineTestsImg,
      bullets: [
        'Chapter-wise practice tests',
        'Mock tests & quizzes',
        'Instant results & analytics'
      ]
    },
    {
      title: 'Verified Certificates',
      subtitle: 'Boost Your Career',
      description: 'Earn industry-recognized certificates that add value to your skills and boost your career.',
      icon: Award,
      image: verifiedCertificatesImg,
      bullets: [
        'Industry-recognized certificates',
        'Blockchain verification',
        'Share on LinkedIn & Resume'
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const coursesElement = document.getElementById('courses');
      if (coursesElement) {
        const offsetTop = coursesElement.offsetTop;
        const height = coursesElement.offsetHeight;
        if (scrollPosition >= offsetTop - 250 && scrollPosition < offsetTop + height - 250) {
          setActiveSection('Courses');
          return;
        }
      }
      setActiveSection('Home');
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchPublicTests();
    fetchLeaderboard();
    fetchStats();
    fetchCourses();
    fetchCustomServices();
  }, []);

  // Auto-swipe features tabs every 6 seconds, resetting if the user manually clicks a tab
  useEffect(() => {
    const timer = setTimeout(() => {
      switchTab((activeTab + 1) % features.length);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeTab, features.length]);

  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.substring(1);
        setTimeout(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    };
    handleHashScroll();
    window.addEventListener('hashchange', handleHashScroll);
    return () => window.removeEventListener('hashchange', handleHashScroll);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/stats`);
      if (res.data.success) {
        if (res.data.stats) {
          setStats(res.data.stats);
        }
        if (res.data.showStats !== undefined) {
          setShowStats(res.data.showStats);
        }
      }
    } catch (err) {
      // Keep default fallback
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/courses`);
      if (res.data.success) {
        setCourses(res.data.courses || []);
      }
    } catch (err) {
      setCourses([]);
    }
  };

  const fetchCustomServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/gov-services`);
      if (res.data.success) {
        setCustomServices(res.data.services || []);
      }
    } catch (err) {
      setCustomServices([]);
    }
  };

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

  const handleNavClick = (path) => {
    if (path.startsWith('#')) {
      const element = document.getElementById(path.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  const navLinks = currentUser 
    ? [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/dashboard/courses' },
        { name: 'Classroom', path: '/dashboard/courses' },
        { name: 'Dashboard', path: '/dashboard' }
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '#courses' },
        { name: 'About', path: '#about' }
      ];

  const defaultCourses = [
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
  ];

  const displayCourses = [];
  const colors = [
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-600',
    'from-orange-600 to-amber-600',
    'from-rose-600 to-pink-600'
  ];

  courses.forEach((c, idx) => {
    const color = colors[idx % colors.length];
    let title = c.name;
    let subtitle = '';
    const match = c.name.match(/^([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      title = match[1].trim();
      subtitle = match[2].trim();
    } else {
      subtitle = c.duration || '';
    }
    const price = c.fees || 0;
    const originalPrice = Math.round(price * 1.5);
    displayCourses.push({
      id: c.id,
      title,
      subtitle,
      duration: c.duration || 'Flexible',
      image: c.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=50&w=400',
      color,
      price,
      originalPrice,
      discount: '33% Off',
      mode: 'Offline',
      language: 'Hinglish',
      isReal: true
    });
  });

  defaultCourses.forEach(dc => {
    if (displayCourses.length < 4) {
      const exists = displayCourses.some(c => c.title.toLowerCase() === dc.title.toLowerCase());
      if (!exists) {
        displayCourses.push(dc);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF9FF] to-white overflow-hidden relative selection:bg-indigo-500/10">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-white/10">
              <Logo className="w-6 h-6 sm:w-8 sm:h-8" showText={false} />
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
            {navLinks.map((link) => {
              const isActive = (link.name === 'Home' && activeSection === 'Home') ||
                               (link.name === 'Courses' && activeSection === 'Courses') ||
                               (link.name === 'About' && activeSection === 'About');
              return (
                <button 
                  key={link.name} 
                  onClick={() => handleNavClick(link.path)}
                  className={`text-base font-neue-machina-medium hover:text-indigo-400 transition-colors tracking-normal normal-case relative group ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-300'}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 bg-indigo-400 transition-all duration-300 rounded-full ${isActive ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
                </button>
              );
            })}
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
            {navLinks.map((link, idx) => {
              const isActive = (link.name === 'Home' && activeSection === 'Home') ||
                               (link.name === 'Courses' && activeSection === 'Courses') ||
                               (link.name === 'About' && activeSection === 'About');
              return (
                <button 
                  key={link.name} 
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleNavClick(link.path);
                  }}
                  className={`py-5 text-xl font-bold transition-all flex items-center justify-between group border-b border-indigo-950/50 w-full text-left ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}
                  style={{ transitionDelay: `${idx * 40}ms` }}
                >
                  <span className={`transition-all duration-500 ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                    {link.name}
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-all ${isActive ? 'text-indigo-400 translate-x-1' : 'text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1'}`} />
                </button>
              );
            })}
            
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
              <div className="absolute top-1/2 left-2 sm:-left-6 -translate-y-1/2 p-3 bg-slate-900/85 backdrop-blur-md border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 shadow-2xl shadow-indigo-950/50 z-20 hover:scale-105 transition-transform duration-300">
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10">
                   <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Active Learners</p>
                  <p className="text-base sm:text-lg font-black text-white leading-none">1.2k+</p>
                </div>
              </div>

              {/* Floating Badge 2 - Interactive Courses / Verified */}
              <div className="absolute bottom-6 right-2 sm:right-6 p-3 bg-slate-900/85 backdrop-blur-md border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 shadow-2xl shadow-indigo-950/50 z-20 hover:scale-105 transition-transform duration-300">
                <div className="w-9 h-9 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/10">
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
          @keyframes tab-switch {
            from {
              opacity: 0;
              transform: translateY(4px) scale(0.995);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-float-1 { animation: float-card 4s ease-in-out infinite; }
          .animate-float-2 { animation: float-card 5s ease-in-out infinite 0.5s; }
          .animate-float-3 { animation: float-card 4.5s ease-in-out infinite 1s; }
          .animate-float-4 { animation: float-card 5.5s ease-in-out infinite 1.5s; }
          .animate-float-mascot { animation: float-mascot 6s ease-in-out infinite; }
          .animate-tab-switch { animation: tab-switch 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes marquee {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
        
        {/* Why Choose NextGen Header Section */}
        <div id="about" className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/85 text-indigo-600 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-5">
            <Star className="w-3.5 h-3.5 fill-indigo-600 text-indigo-600" />
            WHY CHOOSE NEXTGEN
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-5">
            Everything You Need to <br />
            <span className="text-indigo-600">Learn, Grow & Succeed</span>
          </h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
            Powerful tools and personalized support to help you master new skills and achieve your goals.
          </p>
        </div>

        {/* Stats Grid Card */}
        {showStats && (
          <div className="bg-white rounded-[2rem] border border-slate-100/85 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 items-center mb-20">
            {/* Stat 1 */}
            <div className="flex items-center gap-4.5 justify-center lg:justify-start lg:pl-6">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-100/30">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-none">{stats.studentsCount.toLocaleString()}+</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Students Empowered</p>
              </div>
            </div>
            
            {/* Stat 2 */}
            <div className="flex items-center gap-4.5 justify-center lg:justify-start lg:pl-8 border-l-0 lg:border-l border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-100/30">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-none">{stats.coursesCount}+</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Courses Available</p>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4.5 justify-center lg:justify-start lg:pl-8 border-l-0 lg:border-l border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-100/30">
                <TrendingUp className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-none">{stats.successRate}%</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Success Rate</p>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4.5 justify-center lg:justify-start lg:pl-8 border-l-0 lg:border-l border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-100/30">
                <Award className="w-5.5 h-5.5" />
              </div>
              <div className="text-left">
                <h4 className="text-xl md:text-2xl font-black text-slate-800 leading-none">{stats.certificatesCount.toLocaleString()}+</h4>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Certificates Issued</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature Highlights - Compact Interactive Tabs */}
        <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 text-left">
          
          {/* Tabs Menu */}
          <div className="bg-[#FAF9FF] p-1.5 rounded-3xl border border-slate-100/80 shadow-[0_4px_15px_rgba(99,102,241,0.02)] grid grid-cols-2 md:grid-cols-4 gap-1.5 w-full relative">
            {features.map((feat, idx) => {
              const TabHeaderIcon = feat.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => switchTab(idx)}
                  className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors duration-200 w-full select-none cursor-pointer z-10 ${
                    isActive
                      ? 'text-white scale-[1.01]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40 border border-transparent'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabHighlight"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-md shadow-indigo-500/15 -z-10"
                      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                    />
                  )}
                  <TabHeaderIcon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-slate-400'}`} />
                  {feat.title}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Display Card */}
          <div className="bg-gradient-to-br from-[#FAF9FF]/95 via-white/90 to-[#EEF2FF]/85 backdrop-blur-xl border border-indigo-500/30 rounded-3xl shadow-[0_20px_50px_-12px_rgba(79,70,229,0.15),0_0_30px_rgba(99,102,241,0.15)] p-5 md:p-8 hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden min-h-[380px] md:min-h-[320px] flex items-center">
            {/* Background Ambient Glows using the theme's indigo colors */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-gradient-to-tr from-indigo-500/5 to-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-gradient-to-tr from-indigo-500/5 to-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                custom={activeTab >= prevTab ? 1 : -1}
                variants={{
                  enter: (dir) => ({
                    x: dir * 30,
                    opacity: 0,
                    scale: 0.98
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1]
                    }
                  },
                  exit: (dir) => ({
                    x: dir * -30,
                    opacity: 0,
                    scale: 0.98,
                    transition: {
                      duration: 0.18,
                      ease: [0.7, 0, 0.84, 0]
                    }
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center w-full relative z-10"
              >
                <div className={`flex flex-col justify-center ${activeTab % 2 === 0 ? 'order-2 md:order-1' : 'order-2 md:order-2'}`}>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 border border-indigo-100/50 shadow-sm text-indigo-600">
                    {(() => {
                      const TabIcon = features[activeTab].icon;
                      return <TabIcon className="w-5 h-5" />;
                    })()}
                  </div>
                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{features[activeTab].subtitle}</p>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-3 tracking-tight">
                    {features[activeTab].title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed mb-5">
                    {features[activeTab].description}
                  </p>
                  <div className="space-y-2.5">
                    {features[activeTab].bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-sm font-semibold">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-200/30 text-indigo-600 shrink-0">
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image container */}
                <div className={`flex justify-center items-center w-full h-full min-h-[200px] sm:min-h-[220px] rounded-2xl p-4 relative overflow-hidden group ${activeTab % 2 === 0 ? 'order-1 md:order-2' : 'order-1 md:order-1'}`}>
                  <div className="absolute w-48 h-48 sm:w-36 sm:h-36 bg-gradient-to-tr from-indigo-500/10 to-indigo-600/5 opacity-40 rounded-full blur-[50px] group-hover:opacity-60 transition-all duration-500 pointer-events-none -z-10"></div>
                  <img 
                    src={features[activeTab].image} 
                    alt={features[activeTab].title} 
                    className="w-full max-w-[200px] xs:max-w-[220px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[230px] h-auto object-contain drop-shadow-[0_8px_16px_rgba(99,102,241,0.1)] sm:drop-shadow-[0_12px_24px_rgba(99,102,241,0.15)] hover:scale-105 transition-transform duration-500 relative z-10"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* CTA Journey Banner Card */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50/80 via-[#F5F3FF]/40 to-indigo-50/80 rounded-[2rem] border border-indigo-100 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border border-indigo-100/35">
              <Rocket className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-800 mb-1 leading-tight">Start Your Learning Journey Today</h4>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">Join thousands of learners growing their skills with NextGen.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>


        {/* Popular Courses Section */}
        <div id="courses" className="mt-32">
          <div className="text-center mb-16 animate-in fade-in duration-1000">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Our Popular <span className="text-indigo-700">Courses</span>
            </h2>
            <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-2xl mx-auto">
              Choose from our wide range of professional computer courses designed to make you industry-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayCourses.map((course, idx) => (
              <div 
                key={idx}
                className="relative group flex flex-col h-full hover:-translate-y-2 transition-all duration-500 max-w-[340px] sm:max-w-none mx-auto w-full isolate"
              >
                {/* Glowing background light effect behind the card */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:blur-3xl transition-all duration-500 -z-10" />
                
                {/* Main Card Container */}
                <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-2xl border border-indigo-100/80 group-hover:border-indigo-300/80 shadow-[0_8px_30px_rgba(99,102,241,0.02)] group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.22)] transition-all duration-500 flex flex-col flex-1 overflow-hidden relative">
                  
                  {/* Course Image */}
                  <div className="relative h-48 sm:h-40 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${course.color} mix-blend-multiply opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-65"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-sm border border-white/20">
                      {course.duration}
                    </div>
                  </div>

                  {/* Always visible base top border */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
                  
                  {/* Hover state gradient top border */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      {/* Combined Title and Subtitle */}
                      <h3 className="text-base font-NeueMachina-Medium text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors mb-3 min-h-[44px] flex items-center">
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
                    <div className="mt-auto pt-4 border-t border-slate-100 border-dashed">
                      <p className="text-emerald-600 text-[8px] font-NeueMachina-Medium uppercase tracking-wider mb-1">
                        Limited Time Discount
                      </p>
                      <div className="flex items-center gap-2.5 mb-5">
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

                    {/* Integrated Details Button */}
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-NeueMachina-Medium font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
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
                  className="relative group h-full hover:-translate-y-2 transition-all duration-500 isolate"
                >
                  {/* Glowing background light effect behind the card */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-25 group-hover:opacity-85 group-hover:blur-3xl group-hover:scale-[1.05] transition-all duration-500 -z-10" />
                  
                  {/* Card container */}
                  <div className="bg-[#0F0C20]/60 group-hover:bg-[#0F0C20]/80 backdrop-blur-xl rounded-2xl border border-indigo-500/15 group-hover:border-indigo-500/40 shadow-2xl shadow-indigo-950/50 group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.35)] transition-all duration-500 flex flex-col h-full overflow-hidden relative">
                    {/* Always visible base top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
                    
                    {/* Hover state gradient top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
                    
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            test.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            test.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {test.difficulty}
                          </span>
                          <h3 className="text-base font-black text-white leading-snug group-hover:text-indigo-300 transition-colors duration-300">
                            {test.title}
                          </h3>
                        </div>
                        <div className="w-9 h-9 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
                          <ClipboardList className="w-4 h-4 text-indigo-400" />
                        </div>
                      </div>

                      {test.description && (
                        <p className="text-[11px] text-slate-400 mb-4 line-clamp-2 leading-relaxed">{test.description}</p>
                      )}

                      <div className="flex flex-col gap-2.5 mb-5 mt-auto pt-4 border-t border-indigo-950/40 border-dashed">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                              <ClipboardList className="w-3 h-3 text-indigo-400" />
                            </div>
                            <span>Questions</span>
                          </div>
                          <span className="font-extrabold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-[10px]">{test.questions}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-100/20">
                              <Clock className="w-3 h-3 text-amber-400" />
                            </div>
                            <span>Duration</span>
                          </div>
                          <span className="font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[10px]">{test.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-100/20">
                              <Award className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span>Total Marks</span>
                          </div>
                          <span className="font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">{test.totalMarks}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/tests/public/${test.id}`)}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-xs transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 group/btn cursor-pointer"
                      >
                        Start Free Test <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content Continuation */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-12">
        {leaderboard?.length > 0 && (
          <div className="mt-4">
            <div className="text-center mb-8 animate-in fade-in duration-1000">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-4">
                <Trophy className="w-3 h-3" />
                <span>Hall of Fame</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">
                Top <span className="text-amber-600">Performers</span>
              </h2>
              <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-xl mx-auto">
                See who's leading the charts! Take a test and compete for the top spot.
              </p>
            </div>

            <div className="max-w-xl mx-auto bg-indigo-50/40 rounded-3xl border border-indigo-100/80 shadow-xl shadow-indigo-100/5 overflow-hidden p-4 sm:p-5">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4.5 py-2 bg-indigo-600 rounded-xl text-[9px] font-black text-white uppercase tracking-wider mb-2">
                <div className="col-span-2">Rank</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2 text-center">Tests</div>
                <div className="col-span-2 text-center">Avg %</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
              {leaderboard.slice(0, 10).map((entry) => (
                <div key={entry.rank} className="grid grid-cols-12 items-center px-4.5 py-1.5 bg-white border border-indigo-100/30 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all rounded-xl mb-1.5 last:mb-0 animate-in fade-in duration-300">
                  <div className="col-span-2 flex items-center justify-start">
                    {entry.rank <= 3 ? (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-sm ${
                        entry.rank === 1 ? 'bg-amber-50 border-amber-200 text-amber-500' : 
                        entry.rank === 2 ? 'bg-slate-50 border-slate-200 text-slate-400' : 
                        'bg-orange-50 border-orange-200 text-orange-600'
                      }`}>
                        {entry.rank === 1 ? <Trophy className="w-3.5 h-3.5 text-amber-500" /> : 
                         entry.rank === 2 ? <Medal className="w-3.5 h-3.5 text-slate-400" /> : 
                         <Award className="w-3.5 h-3.5 text-orange-500" />}
                      </div>
                    ) : (
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-slate-400 bg-slate-50 border border-slate-100">{entry.rank}</span>
                    )}
                  </div>
                  <div className="col-span-4">
                    <p className="text-xs font-bold text-slate-800 truncate">{entry.name}</p>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">{entry.testsAttempted}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      entry.avgPercentage >= 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                      entry.avgPercentage >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-100/50' : 
                      'bg-rose-50 text-rose-600 border border-rose-100/50'
                    }`}>
                      {entry.avgPercentage}%
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[11px] font-extrabold text-slate-700">{entry.totalScore}/{entry.totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ─── GOVERNMENT SERVICES AND JOBS SECTION (MARQUEE SCROLLER — DARK THEME) ─── */}
      <div id="gov-services" className="w-full bg-[#0F0C20] border-t border-indigo-950/80 pt-10 pb-4 relative overflow-hidden text-left">
        {/* Animated ambient gradient blobs */}
        <div className="absolute top-[-10%] right-[-15%] w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[450px] h-[450px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 animate-in fade-in duration-1000">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/35 text-indigo-300 text-[9px] font-bold uppercase tracking-wider mb-3.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Job Updates & E-Governance shortcuts</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mb-2 tracking-tight">
                Government Services & <span className="text-indigo-400">Jobs Info</span>
              </h2>
              <p className="text-slate-400 font-medium text-[11px] sm:text-xs max-w-xl leading-relaxed">
                Stay updated with direct portal links for essential identity services, welfare schemes, and job update directories.
              </p>
            </div>
            
            {/* View All Services Page Button */}
            <button 
              onClick={() => navigate('/services')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-NeueMachina-Medium font-bold text-[10px] transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 self-start md:self-end"
            >
              View All Services <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Marquee Wrapper with side-fading gradient overlays - FULL WIDTH BREAKOUT */}
          <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden py-4">
            {/* Left fade overlay */}
            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#0F0C20] via-[#0F0C20]/80 to-transparent z-10 pointer-events-none" />
            {/* Right fade overlay */}
            <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#0F0C20] via-[#0F0C20]/80 to-transparent z-10 pointer-events-none" />

            {/* Marquee Scrolling Container */}
            <div className="animate-marquee select-none font-NeueMachina-Medium">
              {(() => {
                const categoryIconMap = {
                  'Job Alerts': Briefcase,
                  'Identity Cards': Shield,
                  'Results & Certs': Download,
                  'Welfare & Schemes': FileText
                };
                const displayServices = customServices.length > 0 ? customServices : govServicesList;
                return [...displayServices, ...displayServices].map((item, itemIdx) => {
                  const ItemIcon = item.icon || categoryIconMap[item.category] || Briefcase;
                  return (
                    <a 
                      key={itemIdx}
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group/card relative w-[200px] sm:w-[230px] p-3.5 bg-[#151230]/70 hover:bg-[#1a1650]/90 backdrop-blur-md rounded-2xl border border-indigo-500/20 hover:border-indigo-400/40 shadow-[0_4px_15px_rgba(99,102,241,0.03)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 shrink-0 ml-5 overflow-hidden cursor-pointer animate-in fade-in duration-300"
                    >
                      {/* Dark visible top border */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-950 z-10" />
                      
                      {/* Hover border gradient */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20" />

                      {/* Icon / Image Container */}
                      <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 shadow-inner overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300" />
                        ) : (
                          <ItemIcon className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-[11px] font-black text-white font-NeueMachina-Medium truncate group-hover/card:text-indigo-300 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[9px] text-slate-500 font-semibold truncate mt-0.5 leading-none">{item.tagline}</p>
                      </div>

                      {/* Action Link Arrow */}
                      <div className="text-slate-500 group-hover/card:text-indigo-400 transition-colors shrink-0 group-hover/card:translate-x-0.5 duration-200">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SMART TOOLS SECTION (MARQUEE SCROLLER — MATCHING GOV SERVICES DESIGN) ─── */}
      <div className="w-full bg-[#0F0C20] border-y border-indigo-950/80 pt-4 pb-10 relative overflow-hidden text-left">
        {/* Animated ambient gradient blobs */}
        <div className="absolute top-[-10%] right-[-15%] w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-15%] w-[450px] h-[450px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 animate-in fade-in duration-1000">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/35 text-indigo-300 text-[9px] font-bold uppercase tracking-wider mb-3.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Smart Utilities and Skill Builders</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white mb-2 tracking-tight">
                Interactive Smart <span className="text-indigo-400">Tools</span>
              </h2>
              <p className="text-slate-400 font-medium text-[11px] sm:text-xs max-w-xl leading-relaxed">
                Test your keyboard speed, calculate ages for competitive exams, find percentages, and count words — directly on our platform.
              </p>
            </div>
            
            {/* View All Tools Page Button */}
            <button 
              onClick={() => navigate('/tools')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-NeueMachina-Medium font-bold text-[10px] transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 self-start md:self-end"
            >
              View All Tools <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Marquee Wrapper with side-fading gradient overlays - FULL WIDTH BREAKOUT */}
          <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden py-4">
            {/* Left fade overlay */}
            <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#0F0C20] via-[#0F0C20]/80 to-transparent z-10 pointer-events-none" />
            {/* Right fade overlay */}
            <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#0F0C20] via-[#0F0C20]/80 to-transparent z-10 pointer-events-none" />

            {/* Marquee Scrolling Container */}
            <div className="animate-marquee select-none font-NeueMachina-Medium">
              {[
                { name: "Typing Speed Tester", tagline: "Test your WPM speed", icon: Keyboard, link: "/tools/typing-test" },
                { name: "Job Age Calculator", tagline: "Verify exam eligibility", icon: Calculator, link: "/tools/age-calculator" },
                { name: "Percentage Calculator", tagline: "Marks & score percentage", icon: Zap, link: "/tools/percentage-calculator" },
                { name: "Word & Char Counter", tagline: "Count words & sentences", icon: FileText, link: "/tools/word-counter" },
                { name: "Typing Speed Tester", tagline: "Test your WPM speed", icon: Keyboard, link: "/tools/typing-test" },
                { name: "Job Age Calculator", tagline: "Verify exam eligibility", icon: Calculator, link: "/tools/age-calculator" },
                { name: "Percentage Calculator", tagline: "Marks & score percentage", icon: Zap, link: "/tools/percentage-calculator" },
                { name: "Word & Char Counter", tagline: "Count words & sentences", icon: FileText, link: "/tools/word-counter" },
              ].map((tool, idx) => {
                const ToolIcon = tool.icon;
                return (
                  <div 
                    key={idx}
                    onClick={() => navigate(tool.link)}
                    className="group/card relative w-[200px] sm:w-[230px] p-3.5 bg-[#151230]/70 hover:bg-[#1a1650]/90 backdrop-blur-md rounded-2xl border border-indigo-500/20 hover:border-indigo-400/40 shadow-[0_4px_15px_rgba(99,102,241,0.03)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.12)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 shrink-0 ml-5 overflow-hidden cursor-pointer"
                  >
                    {/* Dark visible top border */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-950 z-10" />
                    
                    {/* Hover border gradient */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20" />

                    {/* Icon Container */}
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                      <ToolIcon className="w-3.5 h-3.5 group-hover/card:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Title & Tagline */}
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-[11px] font-black text-white font-NeueMachina-Medium truncate group-hover/card:text-indigo-300 transition-colors">
                        {tool.name}
                      </h4>
                      <p className="text-[9px] text-slate-500 font-semibold truncate mt-0.5 leading-none">{tool.tagline}</p>
                    </div>

                    {/* Action arrow */}
                    <div className="text-slate-500 group-hover/card:text-indigo-400 transition-colors shrink-0 group-hover/card:translate-x-0.5 duration-200">
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      </div>
      <Footer />
    </div>
  );
}

