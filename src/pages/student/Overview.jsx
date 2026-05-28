import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Award, ChevronRight, Download, PlayCircle, Loader2, Sparkles, TrendingUp, Calendar, BellRing } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 15 
    } 
  }
};

export default function StudentOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    activeCourses: 0,
    attendancePercent: '0%',
    firstCourseId: null,
    isLoading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, attendanceRes] = await Promise.all([
          api.get('/student/courses'),
          api.get('/student/attendance')
        ]);

        const courses = coursesRes.data.success ? coursesRes.data.courses : [];
        const activeCourses = courses.length;
        const firstCourseId = courses.length > 0 ? courses[0].id : null;
        const attendancePercent = attendanceRes.data.success ? attendanceRes.data.stats.percentage : '0%';

        setDashboardData({
          activeCourses,
          attendancePercent,
          firstCourseId,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 border-4 border-primary-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Initializing Board…</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-16 bg-dashboard-grid bg-repeat"
    >
      {/* 1. Bento Hero Banner */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 md:p-10 shadow-[0_16px_36px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group"
      >
        {/* Abstract Glowing Mesh Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-primary-400/10 to-indigo-300/5 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-300/10 to-purple-400/5 rounded-full blur-[80px] pointer-events-none animate-blob animation-delay-2000"></div>
        
        {/* Subtle Grid Accent */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] pointer-events-none"></div>

        <div className="relative z-10 text-center md:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-100/50 text-primary-700 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Academy System
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none pt-1">
            Welcome back, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              {currentUser?.name?.split(' ')[0] || 'Scholar'}
            </span> 👋
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium pt-1">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>
        </div>

        {/* Floating Stats Bento Block */}
        <div className="relative z-10 flex gap-4 w-full md:w-auto justify-center shrink-0">
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-slate-50/50 backdrop-blur-md px-6 py-5 rounded-[22px] border border-slate-100/80 shadow-sm flex flex-col items-center min-w-[120px] flex-1 sm:flex-initial transition-all hover:bg-white hover:shadow-md"
          >
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{dashboardData.activeCourses}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Active Courses</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-slate-50/50 backdrop-blur-md px-6 py-5 rounded-[22px] border border-slate-100/80 shadow-sm flex flex-col items-center min-w-[120px] flex-1 sm:flex-initial transition-all hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{dashboardData.attendancePercent}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Engagement</span>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. Interactive Quick Actions Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            title: 'Continue Learning',
            desc: 'Resume where you left off',
            icon: BookOpen,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            action: () => navigate('/dashboard/courses'),
            hoverShadow: 'hover:shadow-blue-500/5 hover:border-blue-200'
          },
          {
            title: 'Virtual Classroom',
            desc: 'Access your lessons & video lectures',
            icon: PlayCircle,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
            action: () => {
              if (dashboardData.firstCourseId) {
                navigate(`/dashboard/courses/${dashboardData.firstCourseId}/classroom`);
              } else {
                toast('Enroll in a course first to access the classroom', { icon: '🎓' });
                navigate('/dashboard/courses');
              }
            },
            hoverShadow: 'hover:shadow-indigo-500/5 hover:border-indigo-200'
          },
          {
            title: 'Earned Credentials',
            desc: 'View & download certificates',
            icon: Award,
            color: 'text-amber-600 bg-amber-50 border-amber-100',
            action: () => navigate('/dashboard/certificates'),
            hoverShadow: 'hover:shadow-amber-500/5 hover:border-amber-200'
          }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button 
              key={idx}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={item.action}
              className={`flex items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 text-left transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-xl cursor-pointer ${item.hoverShadow} group`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110 ${item.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">{item.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-slate-500 transition-all shrink-0" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Courses & Notes */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          {/* My Active Course */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Active Study</h3>
              </div>
              <button 
                onClick={() => navigate('/dashboard/courses')} 
                className="text-xs font-black text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                All Courses <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 group hover:border-primary-200 transition-colors duration-300">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:bg-primary-50/50 group-hover:border-primary-100 transition-colors duration-300">
                <BookOpen className="w-9 h-9 text-slate-300 group-hover:text-primary-500 transition-colors duration-500" />
              </div>
              <div className="flex-1 w-full space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider border border-emerald-100/50">Primary</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Course Syllabus</span>
                </div>
                <h4 className="text-lg font-black text-slate-800 group-hover:text-primary-600 transition-colors leading-snug">
                  Course on Computer Concepts (CCC)
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md pb-2">
                  Master the essential fundamentals of computer hardware, software applications, and network concepts.
                </p>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Syllabus Completed</span>
                    <span className="font-black text-primary-600">30% (3/10 Modules)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '30%' }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/dashboard/courses')} 
                className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap cursor-pointer hover:shadow-lg"
              >
                Study Modules
              </button>
            </div>
          </motion.section>

          {/* Recent Notes & Study Sheets */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Syllabus Guides</h3>
            </div>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] overflow-hidden">
              <div className="divide-y divide-slate-50">
                {[
                  { title: 'Chapter 1 – Basics of Computer', type: 'PDF • Study Sheet', color: 'bg-red-50 text-red-500 border-red-100/50' },
                  { title: 'Chapter 2 – Hardware Components', type: 'PDF • Material Guide', color: 'bg-indigo-50 text-indigo-500 border-indigo-100/50' },
                  { title: 'Chapter 3 – Introduction to Operating Systems', type: 'PDF • Overview Note', color: 'bg-emerald-50 text-emerald-500 border-emerald-100/50' }
                ].map((note, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors duration-200 group cursor-pointer gap-4 min-w-0"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${note.color}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-800 truncate" title={note.title}>{note.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{note.type}</p>
                      </div>
                    </div>
                    
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm shrink-0 cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      View Material
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

        </div>

        {/* Right Column: Tracking & Updates */}
        <div className="space-y-8 min-w-0">
          
          {/* Performance Dashboard Ring Card */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Progress Metrics</h3>
            </div>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Metrics Overview</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live metrics feed</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Lecture Engagement</span>
                    <span className="font-black text-emerald-600">{dashboardData.attendancePercent}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: dashboardData.attendancePercent === '0%' ? '0%' : dashboardData.attendancePercent }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-600">Modules Cleared</span>
                    <span className="font-black text-primary-600">30% (3 of 10)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '30%' }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-primary-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Academic Timeline Updates */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Platform updates</h3>
            </div>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] p-6 sm:p-8 space-y-6">
              <ul className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {[
                  { title: 'Chapter 4 Materials Added', desc: 'Access the latest PDF materials under courses.', color: 'bg-primary-500 border-white ring-primary-100' },
                  { title: 'Syllabus Updated', desc: 'Check the updated modules sequence.', color: 'bg-amber-500 border-white ring-amber-100' },
                  { title: 'System Upgrades Planned', desc: 'Brief system diagnostics this Sunday.', color: 'bg-slate-300 border-white ring-slate-100' }
                ].map((update, idx) => (
                  <li key={idx} className="flex items-start gap-4 relative pl-1 group">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ring-4 shrink-0 mt-1.5 z-10 transition-transform group-hover:scale-110 ${update.color}`}></div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wide group-hover:text-primary-600 transition-colors">
                        {update.title}
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {update.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

        </div>
      </div>
    </motion.div>
  );
}
