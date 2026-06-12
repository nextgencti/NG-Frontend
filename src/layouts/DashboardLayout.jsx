import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import dashboardBg from '../assets/dashboard_bg.png';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  CreditCard, 
  Award, 
  LogOut,
  X,
  User,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Settings,
  Activity,
  ChevronDown,
  Shield,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRef, useEffect } from 'react';
import UpdateProfileModal from '../components/student/UpdateProfileModal';
import Logo from '../components/Logo';
import NotificationBell from '../components/NotificationBell';

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Tests', path: '/dashboard/tests', icon: ClipboardList },
    { name: 'Activity', path: '/dashboard/activity', icon: Activity },
    { name: 'Fees', path: '/dashboard/fees', icon: CreditCard },
    { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Students', path: '/admin/students', icon: User },
    { name: 'All Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Tests', path: '/admin/tests', icon: ClipboardList },
    { name: 'Public Leads', path: '/superadmin/leads', icon: Users },
    { name: 'Fees & Revenue', path: '/admin/finance', icon: CreditCard },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const superAdminLinks = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Manage Students', path: '/admin/students', icon: User },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Tests', path: '/admin/tests', icon: ClipboardList },
    { name: 'Public Leads', path: '/superadmin/leads', icon: Users },
    { name: 'Finance', path: '/admin/finance', icon: CreditCard },
    { name: 'Staff Members', path: '/superadmin/admins', icon: Shield },
    { name: 'Institute Profile', path: '/superadmin/institutes', icon: Building2 },
    { name: 'Web Controls', path: '/superadmin/controls', icon: Settings },
  ];

  const sidebarLinks = isSuperAdmin ? superAdminLinks : (isAdmin ? adminLinks : studentLinks);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getShortName = (name) => {
    const mapping = {
      'My Courses': 'Courses',
      'Manage Students': 'Students',
      'All Courses': 'Courses',
      'Fees & Revenue': 'Fees',
      'Institute Profile': 'Profile',
      'Staff Members': 'Staff',
      'Public Leads': 'Leads',
      'Web Controls': 'Controls'
    };
    return mapping[name] || name;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/courses') return 'My Courses';
    if (path === '/dashboard/tests') return 'Assessments';
    if (path === '/dashboard/activity') return 'Activity Board';
    if (path === '/dashboard/fees') return 'Fees Ledger';
    if (path === '/dashboard/certificates') return 'Certificates';
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/students') return 'Student Directory';
    if (path === '/admin/courses') return 'Course Management';
    if (path === '/admin/tests') return 'Assessment Builder';
    if (path === '/superadmin/leads') return 'Public Leads';
    if (path === '/admin/finance') return 'Finance & Revenue';
    if (path === '/admin/settings') return 'System Settings';
    if (path === '/superadmin') return 'SuperAdmin Dashboard';
    if (path === '/superadmin/admins') return 'Staff Administration';
    if (path === '/superadmin/institutes') return 'Institute Directory';
    if (path === '/superadmin/controls') return 'Webpage Controls';
    return 'Portal';
  };

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Gradients - Very subtle */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Desktop Only */}
      <aside 
        className={`hidden lg:flex flex-col bg-white/80 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.03)] transition-all duration-350 ease-in-out flex flex-col print:hidden ${
          isCollapsed ? 'w-20' : 'w-[260px]'
        } z-40 relative`}
      >
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-6 border-b border-[#F1F5F9] transition-all relative group`}>
          <div className="flex items-center gap-3">
            <Logo 
              className={isCollapsed ? "w-8 h-8" : "w-8 h-8"} 
              showText={!isCollapsed} 
            />
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#EEF2FF] border border-[#C7D2FE] rounded-full items-center justify-center text-[#4F46E5] hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] transition-all shadow-md z-50 group-hover:opacity-100 opacity-0 lg:opacity-100 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {!isCollapsed && (
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-2.5 scrollbar-hide">
          {!isCollapsed && (
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 px-3 flex items-center gap-2">
              {isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin Menu' : 'Student Menu')}
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
            </div>
          )}
          <nav className="space-y-1.5 px-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/dashboard' || link.path === '/admin' || link.path === '/superadmin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'} px-4 py-3.5 rounded-2xl text-[12.5px] transition-all duration-300 relative group overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-500 text-white font-black shadow-[0_8px_20px_rgba(79,70,229,0.25)] scale-[1.02] border border-primary-500/20' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600 font-bold border border-transparent hover:border-slate-100 hover:shadow-sm'
                    }`
                  }
                  title={isCollapsed ? link.name : ""}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 duration-300 ${isActive ? 'text-white drop-shadow-sm' : 'text-slate-400 group-hover:text-primary-500'}`} />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap transition-colors tracking-wide">
                          {link.name}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className={`p-5 border-t border-slate-100/60 bg-slate-50/30 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm border border-transparent hover:border-rose-100 transition-all group w-full cursor-pointer`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className={`w-5 h-5 shrink-0 transition-transform ${isCollapsed ? 'text-slate-400' : 'group-hover:-translate-x-1 group-hover:text-rose-500'}`} />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-300">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative bg-transparent">
        {/* Top Header */}
        <header className="h-20 bg-[#4338CA] text-white border-b border-indigo-950/60 flex items-center justify-between px-4 sm:px-8 z-50 relative sticky top-0 shadow-lg shadow-indigo-950/20">
          {/* Logo - Mobile/Tablet only (since Sidebar shows logo on Desktop) */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 lg:hidden" onClick={() => navigate('/')}>
            <div className="bg-white p-1 sm:p-1.5 rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-white/20 transition-all hover:scale-105 duration-300">
              <Logo className="w-6 h-6 sm:w-8 sm:h-8" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[18px] sm:text-[23px] font-black tracking-tight leading-none flex items-center select-none uppercase">
                <span className="text-white">Next</span>
                <span className="text-indigo-200 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>

          {/* Breadcrumb / Page Title - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 select-none animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Portal</span>
            <span className="text-white/30 font-medium">/</span>
            <span className="text-[11px] font-black text-white tracking-wider uppercase bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4">
            {currentUser?.role === 'student' && <NotificationBell />}

            <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 sm:gap-3 text-left cursor-pointer hover:bg-white/10 p-1 sm:p-1.5 px-2.5 sm:px-3.5 rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 hover:border-white/30 transition-all duration-300 active:scale-95 group shadow-sm text-white"
            >
              <div className="flex flex-col items-end hidden sm:flex pr-1">
                <span className="text-xs font-black text-white group-hover:text-white/90 transition-colors tracking-wide leading-none mb-1">{currentUser?.name || 'User'}</span>
                <span className="text-[8.5px] font-black text-white/60 uppercase tracking-widest leading-none">{currentUser?.role || 'Student'}</span>
              </div>
              {/* Avatar block */}
              <div className="w-8 h-8 sm:w-9 h-9 rounded-xl bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center border-2 border-white ring-2 ring-white/10 overflow-hidden shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-black text-white">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'UI'}
                  </span>
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-transform duration-300" />
            </button>

             {/* User Dropdown Menu */}
             {showUserDropdown && (
               <div className="absolute right-0 mt-3.5 w-52 bg-white/95 backdrop-blur-xl border border-slate-100/80 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800">
                 <div className="px-4 py-2.5 border-b border-slate-100 sm:hidden">
                   <div className="text-xs font-black text-slate-800 truncate">{currentUser?.name}</div>
                   <div className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{currentUser?.role}</div>
                 </div>
                 
                 <button
                   onClick={() => {
                     setShowUserDropdown(false);
                     if (isAdmin) {
                       navigate('/admin/settings');
                     } else if (isSuperAdmin) {
                       navigate('/superadmin/institutes');
                     } else {
                       setIsProfileModalOpen(true);
                     }
                   }}
                   className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:text-primary-600 hover:bg-slate-50/80 transition-colors text-[11px] font-black uppercase tracking-wider cursor-pointer"
                 >
                   <User className="w-4 h-4 text-primary-500" />
                   My Profile
                 </button>
 
                 {isAdmin && (
                   <button
                     onClick={() => {
                       setShowUserDropdown(false);
                       navigate('/admin/settings');
                     }}
                     className="w-full flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:text-primary-600 hover:bg-slate-50/80 transition-colors text-[11px] font-black uppercase tracking-wider cursor-pointer"
                   >
                     <Settings className="w-4 h-4 text-primary-500" />
                     Settings
                   </button>
                 )}
 
                 <div className="h-px bg-slate-100/80 my-1.5 mx-3.5" />
                 
                 <button
                   onClick={() => {
                     setShowUserDropdown(false);
                     handleLogout();
                   }}
                   className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-600 hover:bg-rose-50/80 transition-colors text-[11px] font-black uppercase tracking-wider cursor-pointer"
                 >
                   <LogOut className="w-4 h-4" />
                   Logout Account
                 </button>
               </div>
             )}</div>
          </div>
        </header>

        <UpdateProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />

        {/* Page Content - Bottom padding (pb-28) added for mobile view to prevent navigation overlap */}
        <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 pb-28 lg:pb-6 lg:p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Premium Expanding Floating Dock) */}
        <div className="fixed bottom-5 left-4 right-4 h-16 bg-white/90 backdrop-blur-md border border-slate-200/80 lg:hidden flex items-center justify-between px-4 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[24px] print:hidden">
          {sidebarLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/dashboard' || link.path === '/admin' || link.path === '/superadmin'}
                className={({ isActive }) =>
                  `flex items-center justify-center rounded-xl transition-all duration-300 active:scale-95 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#EEF2FF]/95 to-[#F5F7FF]/95 text-[#4F46E5] px-4 py-2 border border-[#C7D2FE]/30 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-800 p-2.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : 'scale-100'}`} />
                    {isActive && (
                      <span className="text-[10px] font-black tracking-wider uppercase animate-in slide-in-from-left-2 duration-300">
                        {getShortName(link.name)}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </main>
    </div>
  );
}
