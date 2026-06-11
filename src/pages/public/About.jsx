import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Users, Award, Menu, X, Facebook, Youtube, Instagram, Star, Landmark, GraduationCap, Laptop, ChevronDown, User, LogOut } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import expertGuidanceImg from '../../assets/expert_guidance.png';

export default function About() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleNavClick = (path) => {
    navigate(path);
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
        { name: 'Courses', path: '/#courses' },
        { name: 'About', path: '/about' }
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
            </div>
          </div>

          {/* Centered Desktop Menu Links */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 gap-8">
            {navLinks.map((link) => (
              <button 
                key={link.name} 
                onClick={() => handleNavClick(link.path)}
                className={`text-base font-neue-machina-medium hover:text-indigo-400 transition-colors tracking-normal normal-case relative group ${link.name === 'About' ? 'text-indigo-400 font-black' : 'text-slate-300'}`}
              >
                {link.name}
                <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 bg-indigo-400 transition-all duration-300 rounded-full ${link.name === 'About' ? 'w-4' : 'w-0 group-hover:w-4'}`}></span>
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
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/dashboard');
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-indigo-950/50 text-slate-300 hover:text-indigo-400 transition-colors w-full text-left group/item"
                      >
                        <User className="w-4 h-4 text-slate-500 group-hover/item:text-indigo-400 transition-colors" />
                        <span className="text-sm font-bold">My Profile</span>
                      </button>
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
                  handleNavClick(link.path);
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
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#0F0C20] via-[#151230] to-[#0A0815] border-b border-indigo-950/45 relative overflow-hidden pt-36 pb-24">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-purple-500/15 to-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/10 to-violet-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-black uppercase tracking-wider mb-6">
            <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400 animate-spin duration-3000" />
            ABOUT OUR INSTITUTE
          </div>
          <h1 className="text-4xl sm:text-6xl font-neue-machina-ultrabold text-white mb-6 tracking-tight leading-none">
            Empowering Careers Through <br />
            <span className="text-indigo-400">Quality Computer Education</span>
          </h1>
          <p className="font-helvetica-light text-base sm:text-lg text-slate-350 max-w-2xl mx-auto font-medium leading-relaxed">
            NextGen Computer Training Institute (NGCTI) is a leading educational hub in Muskara, Hamirpur, committed to delivering top-tier technical training and digital literacy to shape future professionals.
          </p>
        </div>
      </section>

      {/* Center Details & History */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        
        {/* Core Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 hover:border-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100/50 shadow-sm text-indigo-650">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Our Mission</h3>
              <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
                To simplify and standardize digital education in rural and semi-urban communities by providing high-quality practical training, modern software courses, and standardized certifications that help students secure corporate and governmental roles.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <span>NextGen Excellence</span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 hover:border-indigo-500/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100/50 shadow-sm text-indigo-650">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Our Vision</h3>
              <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
                To create a digitally empowered generation capable of driving technological innovation. We envision a future where digital literacy is accessible to all, bridging the gap between local talent and global career opportunities.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-widest">
              <span>Technological Growth</span>
            </div>
          </div>
        </div>

        {/* Why Choose Section with mascot representation */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              GOVERNMENT & ISO COMPLIANT
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">
              An Institute Built on <br />
              <span className="text-indigo-600">Trust, Accreditations & Quality</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
              At NextGen, we believe that education extends beyond classrooms. Our state-of-the-art computer labs, certified curriculum, and student-focused learning ecosystem prepare you to meet modern business demands.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-4">
              {[
                { title: 'ISO 9001:2015 Certified', desc: 'Ensuring global service standards.' },
                { title: 'Expert Local Educators', desc: 'Direct, focused classroom support.' },
                { title: 'Interactive Online Tests', desc: 'Test yourself inside our student portal.' },
                { title: 'Verified Digital Credentials', desc: 'Shareable certificates linked online.' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200/35 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide leading-none mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-[11px] font-medium leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-gradient-to-br from-indigo-50/40 to-indigo-50/10 border border-indigo-100/50 rounded-[2rem] p-10 relative overflow-hidden flex items-center justify-center w-full max-w-[340px] aspect-square">
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]"></div>
              <div className="w-24 h-24 rounded-full bg-indigo-550/10 absolute -top-10 -right-10 blur-xl"></div>
              
              <div className="text-center space-y-4">
                <Landmark className="w-20 h-20 text-indigo-600 mx-auto drop-shadow-md animate-bounce duration-[4000ms]" />
                <h4 className="text-lg font-black text-slate-800">Muskara Main Center</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Hamirpur, Uttar Pradesh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Journey Call to Action */}
        <div className="bg-gradient-to-r from-indigo-900 to-[#1E1B4B] rounded-[2.5rem] p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-dot-pattern opacity-[0.05] pointer-events-none"></div>
          <div className="absolute w-[20%] aspect-square rounded-full bg-indigo-500/20 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <h3 className="text-3xl sm:text-4xl font-black mb-5 tracking-tight relative z-10">Start Your Professional Path Today</h3>
          <p className="text-slate-350 text-sm sm:text-base max-w-xl mx-auto mb-8 relative z-10 leading-relaxed font-medium">
            Explore our professional computer certification courses like ADCA, DCA, CCC, and Tally Prime, and build real-world career foundations.
          </p>
          <div className="flex justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 bg-white hover:bg-slate-50 text-indigo-950 font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              Get Started <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-3.5 bg-indigo-600/35 hover:bg-indigo-600/50 border border-indigo-400/20 text-white font-bold rounded-xl text-sm transition-all active:scale-95 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
