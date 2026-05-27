import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  ];

  const sidebarLinks = isSuperAdmin ? superAdminLinks : (isAdmin ? adminLinks : studentLinks);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getShortName = (name) => {
    const mapping = {
      'Manage Students': 'Students',
      'All Courses': 'Courses',
      'Fees & Revenue': 'Fees',
      'Institute Profile': 'Profile',
      'Staff Members': 'Staff',
      'Public Leads': 'Leads'
    };
    return mapping[name] || name;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden font-sans">
      {/* Background Gradients - Very subtle */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Desktop Only */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-[#E5E7EB] transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
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

        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
          {!isCollapsed && (
            <div className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4 px-3">
              {isSuperAdmin ? 'Super Admin' : (isAdmin ? 'Admin Menu' : 'Student Menu')}
            </div>
          )}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/dashboard' || link.path === '/admin' || link.path === '/superadmin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 group ${
                      isActive 
                        ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#111827]'
                    }`
                  }
                  title={isCollapsed ? link.name : ""}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4F46E5]' : 'text-[#94A3B8] group-hover:text-[#4F46E5]'}`} />
                      {!isCollapsed && (
                        <span className="whitespace-nowrap transition-colors">
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

        <div className={`p-4 border-t border-slate-100 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group w-full cursor-pointer`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className={`w-5 h-5 shrink-0 transition-transform ${isCollapsed ? '' : 'group-hover:-translate-x-1'}`} />
            {!isCollapsed && (
              <span className="animate-in fade-in duration-300">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-3 sm:px-8 z-50 relative">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0" onClick={() => navigate('/')}>
            <div className="bg-[#F8FAFC] p-1 sm:p-1.5 rounded-lg sm:rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
              <Logo className="w-5.5 h-5.5 sm:w-7.5 sm:h-7.5" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[17px] sm:text-[24px] font-helvetica-light tracking-wide leading-none flex items-center select-none">
                <span className="text-slate-800">Next</span>
                <span className="text-[#4F46E5] ml-0.5">Gen</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {currentUser?.role === 'student' && <NotificationBell />}

            <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 sm:gap-3 text-left cursor-pointer hover:bg-slate-50 p-1 sm:p-1.5 px-2 sm:px-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all duration-300 active:scale-95 group shadow-sm"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-slate-800 group-hover:text-[#4F46E5] transition-colors">{currentUser?.name || 'User'}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{currentUser?.role || 'Student'}</span>
              </div>
              {/* Avatar block */}
              <div className="w-7.5 h-7.5 sm:w-9 h-9 rounded-full bg-[#EEF2FF] flex items-center justify-center border-2 border-[#4F46E5] ring-2 ring-white overflow-hidden shadow-sm shrink-0">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#4F46E5]">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'UI'}
                  </span>
                )}
              </div>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-[#4F46E5] transition-transform duration-300" />
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 sm:hidden">
                  <div className="text-sm font-bold text-slate-900">{currentUser?.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser?.role}</div>
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-[13px] font-semibold rounded-md"
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-[13px] font-semibold rounded-md"
                  >
                    <Settings className="w-4 h-4 text-accent-500" />
                    Settings
                  </button>
                )}

                <div className="h-px bg-slate-100 my-1 mx-2" />
                
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-500 hover:bg-rose-50 transition-colors text-[13px] font-bold rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

        <UpdateProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />

        {/* Page Content - Bottom padding (pb-20) added for mobile view to prevent navigation overlap */}
        <div className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden p-4 pb-20 lg:pb-6 lg:p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (Instagram Style) */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] lg:hidden flex items-center justify-around px-2 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          {sidebarLinks.slice(0, 5).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/dashboard' || link.path === '/admin' || link.path === '/superadmin'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all active:scale-90 ${
                    isActive 
                      ? 'text-[#4F46E5] font-extrabold' 
                      : 'text-slate-400 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                    <span className="text-[9px] font-extrabold mt-1 tracking-wider uppercase">
                      {getShortName(link.name)}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </main>
    </div>
  );
}
