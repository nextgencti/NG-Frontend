import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarCheck, 
  CreditCard, 
  Award, 
  LogOut,
  Menu,
  X,
  User,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRef, useEffect } from 'react';
import UpdateProfileModal from '../components/student/UpdateProfileModal';
import Logo from '../components/Logo';

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
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Tests', path: '/dashboard/tests', icon: ClipboardList },
    { name: 'Attendance', path: '/dashboard/attendance', icon: CalendarCheck },
    { name: 'Fees', path: '/dashboard/fees', icon: CreditCard },
    { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Students', path: '/admin/students', icon: User },
    { name: 'All Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Tests', path: '/admin/tests', icon: ClipboardList },
    { name: 'Fees & Revenue', path: '/admin/finance', icon: CreditCard },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const superAdminLinks = [
    { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
    { name: 'Institutes', path: '/superadmin/institutes', icon: BookOpen },
    { name: 'Admins', path: '/superadmin/admins', icon: User },
  ];

  const sidebarLinks = isSuperAdmin ? superAdminLinks : (isAdmin ? adminLinks : studentLinks);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative overflow-hidden font-sans">
      {/* Background Gradients - Very subtle */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-600/[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-[#E5E7EB] transform transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-6 border-b border-[#F1F5F9] transition-all relative group`}>
          <div className="flex items-center gap-3">
            <Logo 
              className={isCollapsed ? "w-8 h-8" : "w-8 h-8"} 
              showText={!isCollapsed} 
              textClassName="text-base font-bold text-[#111827] tracking-tight"
            />
          </div>
          
          {/* Desktop Collapse Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-[#E5E7EB] rounded-full items-center justify-center text-[#94A3B8] hover:text-[#4F46E5] hover:border-[#4F46E5] transition-all shadow-sm z-50 group-hover:opacity-100 opacity-0 lg:opacity-100"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {!isCollapsed && (
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#6B7280] hover:text-[#111827] transition-colors">
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
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 rounded-lg font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group w-full`}
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
        <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 sm:px-8 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {isAdmin && currentUser?.instituteLogoURL && (
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] p-1 flex items-center justify-center overflow-hidden hidden sm:flex">
                  <img 
                    src={currentUser.instituteLogoURL} 
                    alt="Institute Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-[#111827] tracking-tight truncate max-w-[200px]">
                  {isSuperAdmin ? 'Super Admin' : (isAdmin ? (currentUser?.instituteName || 'Admin Portal') : 'Student Portal')}
                </h1>
                <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider -mt-0.5">
                  {isSuperAdmin ? 'System Control' : (isAdmin ? 'Institute Management' : 'Dashboard')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-3 text-left cursor-pointer hover:bg-[#F8FAFC] p-1.5 px-2 rounded-lg transition-all active:scale-95 group"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors">{currentUser?.name || 'User'}</span>
                <span className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{currentUser?.role || 'Student'}</span>
              </div>
              {/* Avatar block */}
              <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center border border-[#E0E7FF] overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-bold text-[#4F46E5]">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'UI'}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} />
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-semibold"
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
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm font-semibold"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 transition-colors text-sm font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout Account
                </button>
              </div>
            )}
          </div>
        </header>

        <UpdateProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
