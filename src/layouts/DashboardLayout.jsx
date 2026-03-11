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
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UpdateProfileModal from '../components/student/UpdateProfileModal';
import Logo from '../components/Logo';

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
  ];

  const sidebarLinks = isAdmin ? adminLinks : studentLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[550px] h-[550px] bg-accent-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-72'} glass-dark !bg-slate-900/40 border-r border-white/5 transform transition-all duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-6 border-b border-white/5 transition-all`}>
          <div className="flex items-center gap-3">
            <Logo 
              className={isCollapsed ? "w-10 h-10" : "w-10 h-10"} 
              showText={!isCollapsed} 
              textClassName="text-xl font-bold text-white tracking-tight animate-in fade-in duration-300"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden lg:flex p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-3 animate-in fade-in duration-300">
              {isAdmin ? 'Admin Menu' : 'Student Menu'}
            </div>
          )}
          <nav className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/dashboard' || link.path === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary-600/20 to-transparent border-l-2 border-primary-500 text-white shadow-lg shadow-primary-500/10' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  title={isCollapsed ? link.name : ""}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-primary-400'}`} />
                      {!isCollapsed && (
                        <span className="animate-in fade-in slide-in-from-left-2 duration-300 whitespace-nowrap">
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

        <div className={`p-4 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group w-full`}
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
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative bg-dashboard-grid">
        {/* Top Header */}
        <header className="h-20 glass-dark !bg-slate-900/40 border-b border-white/5 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">
              {isAdmin ? 'Admin Portal' : 'Student Portal'}
            </h1>
          </div>

          <button 
            onClick={() => !isAdmin && setIsProfileModalOpen(true)}
            className={`flex items-center gap-4 text-left ${!isAdmin ? 'cursor-pointer hover:bg-white/5 p-2 px-3 -mr-3 rounded-2xl transition-all active:scale-95 group' : 'cursor-default'}`}
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-white group-hover:text-primary-300 transition-colors">{currentUser?.name || 'User'}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{currentUser?.role || 'Student'}</span>
            </div>
            {/* Avatar block */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[2px] shadow-lg shadow-primary-500/10 group-hover:shadow-primary-500/30 transition-shadow">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-white">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'UI'}
                  </span>
                )}
              </div>
            </div>
          </button>
        </header>

        <UpdateProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
