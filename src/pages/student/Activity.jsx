import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Activity as ActivityIcon, 
  Clock, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  Award, 
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Monitor,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 85, 
      damping: 14 
    } 
  }
};

export default function Activity() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [completedTests, setCompletedTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [data, setData] = useState({
    stats: {
      lastLogin: '-',
      studyTime: '0 Hours',
      activeDays: '0/30',
      progress: '0%'
    },
    logs: [],
    attendance: [],
    attendancePercentage: '0%'
  });

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await api.get('/student/activity');
        if (response.data.success) {
          setData({
            stats: response.data.stats,
            logs: response.data.logs,
            attendance: response.data.attendance,
            attendancePercentage: response.data.stats.attendancePercentage
          });
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'results') {
      setActiveTab('test results');
    }
  }, [location]);

  useEffect(() => {
    const fetchTests = async () => {
      setTestsLoading(true);
      try {
        const response = await api.get('/student/tests');
        if (response.data.success) {
          const completed = response.data.tests.filter(t => t.hasAttempts);
          setCompletedTests(completed);
        }
      } catch (error) {
        console.error('Error fetching completed tests:', error);
      } finally {
        setTestsLoading(false);
      }
    };
    fetchTests();
  }, []);

  const formatLastLogin = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const stats = [
    { label: 'Last Active Session', value: formatLastLogin(data.stats.lastLogin), icon: Clock, color: 'text-blue-600 bg-blue-50 border-blue-100/50' },
    { label: 'Total Study Time', value: data.stats.studyTime, icon: Monitor, color: 'text-purple-600 bg-purple-50 border-purple-100/50' },
    { label: 'Active Days Count', value: data.stats.activeDays, icon: Calendar, color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50' },
    { label: 'Curriculum Progress', value: data.stats.progress, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-100/50' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_complete': return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-100/30' };
      case 'video': return { icon: PlayCircle, color: 'text-blue-500 bg-blue-50 border-blue-100/30' };
      case 'pdf': return { icon: FileText, color: 'text-red-500 bg-red-50 border-red-100/30' };
      default: return { icon: ActivityIcon, color: 'text-slate-500 bg-slate-50 border-slate-150/30' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 border-4 border-primary-100 rounded-full"></div>
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting Timelines…</p>
      </div>
    );
  }

  const getTabLabel = (tab) => {
    const labels = {
      'overview': 'Overview',
      'learning activity': 'Activity',
      'attendance': 'Attendance',
      'test results': 'Results'
    };
    return labels[tab] || tab;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-8 pb-16 px-1 bg-dashboard-grid bg-repeat"
    >
      {/* Header */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: -10 },
          show: { opacity: 1, y: 0 }
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100/50 text-primary-600">
              <ActivityIcon className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.18em]">Activity Board</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Engagement</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Track daily logs, lecture attendances, and detailed progress charts.
          </p>
        </div>
      </motion.div>

      {/* Top Overview Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx} 
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white p-5 rounded-3xl border border-slate-100 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-105 ${stat.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className="text-lg font-black text-slate-850 truncate">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Segmented Control tab buttons */}
      <motion.div variants={cardVariants} className="space-y-6">
        <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex py-1">
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 w-max sm:w-fit backdrop-blur-sm gap-0.5 select-none relative">
            {['overview', 'learning activity', 'attendance', 'test results'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-200 focus:outline-none focus:ring-0 select-none z-10"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStudentTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.08)] border border-slate-100/50"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-20 transition-colors duration-200 ${
                    isActive ? 'text-[#4F46E5]' : 'text-slate-400 hover:text-slate-700'
                  }`}>
                    {getTabLabel(tab)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Premium Weekly Engagement Bar Chart */}
                <div className="bg-white rounded-[32px] border border-slate-100 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)] relative overflow-hidden group">
                  {/* Floating ambient gradient light */}
                  <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-tr from-primary-500/10 to-indigo-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary-500" />
                        Weekly Study Engagement
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Syllabus hours tracking</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest text-[#4F46E5] bg-[#EEF2FF] px-2.5 py-1 rounded-lg border border-[#C7D2FE]/30 shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Synced
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-56 flex gap-4 relative">
                    {/* Y-Axis Guidelines and Labels */}
                    <div className="absolute inset-y-0 left-8 right-0 flex flex-col justify-between pointer-events-none text-[8px] font-bold text-slate-300 uppercase tracking-widest pb-6">
                      {[100, 75, 50, 25, 0].map((val) => (
                        <div key={val} className="w-full flex items-center gap-3">
                          <span className="w-6 text-right shrink-0">{val}m</span>
                          <div className="flex-1 border-t border-slate-100/75"></div>
                        </div>
                      ))}
                    </div>

                    {/* Bars Container */}
                    <div className="flex-1 h-full pl-14 flex items-end justify-between gap-3 relative z-10 pb-6">
                      {[40, 70, 45, 90, 65, 30, 80].map((height, i) => (
                        <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-3.5 group">
                          <div className="relative w-full flex-1 flex justify-center items-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                              className="w-full max-w-[24px] bg-[#EEF2FF] group-hover:bg-gradient-to-t group-hover:from-[#4F46E5] group-hover:to-[#6366F1] rounded-t-xl transition-all duration-300 relative shadow-inner cursor-pointer hover:shadow-[0_8px_20px_rgba(79,70,229,0.25)] border-t border-transparent group-hover:border-[#C7D2FE]/20" 
                            >
                              {/* Glowing Accent Layer on Hover */}
                              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl pointer-events-none"></div>
                              
                              {/* Premium Floating Tooltip */}
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-xl border border-white/15 scale-95 group-hover:scale-100 pointer-events-none">
                                {height} Mins
                              </div>
                            </motion.div>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Highlights Bento Card */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-primary-100 transition-colors group">
                    <h4 className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest leading-none">Active Module</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary-50 flex items-center justify-center border border-primary-100/30">
                        <BookOpen className="w-5.5 h-5.5 text-primary-600 group-hover:scale-105 transition-transform" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase leading-snug line-clamp-1">{data.stats.topCourse || 'Enrollment Open'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Keep advancing modules</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] hover:border-amber-100 transition-colors group">
                    <h4 className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest leading-none">Rank Points</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100/30">
                        <Award className="w-5.5 h-5.5 text-amber-600 group-hover:scale-105 transition-transform animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase leading-none">1,250 Honor XP</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Cohort Top 10% honors</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'learning activity' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.02)]"
              >
                <div className="divide-y divide-slate-50">
                  {data.logs.length > 0 ? data.logs.map((act, i) => {
                    const { icon: Icon, color } = getActivityIcon(act.type);
                    return (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${color}`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate uppercase tracking-wide leading-tight">{act.action}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 leading-none">
                              {new Date(act.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • 
                              {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all group-hover:translate-x-0.5 shrink-0" />
                      </div>
                    );
                  }) : (
                    <div className="p-20 text-center">
                       <ActivityIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No timelines recorded yet</p>
                    </div>
                  )}
                </div>
                
                {data.logs.length > 5 && (
                  <button className="w-full py-5 bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-primary-600 transition-all border-t border-slate-50 cursor-pointer">
                    Load More Activity
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.02)]"
              >
                <div className="p-6 bg-slate-50/30 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-850 leading-tight">System Attendance Sheet</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-none">Status compiled from log registers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">{data.attendancePercentage}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 leading-none">Comp. Score (30D)</p>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {data.attendance.length > 0 ? data.attendance.map((day, i) => (
                    <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full ${day.status === 'present' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-200'}`}></div>
                        <div>
                          <p className="text-sm font-black text-slate-805 uppercase tracking-wide">
                             {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{day.activity}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${
                        day.status === 'present' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {day.status}
                      </span>
                    </div>
                  )) : (
                    <div className="p-20 text-center">
                       <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No record sheets compiled</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'test results' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.02)]"
              >
                <div className="p-6 bg-slate-50/30 border-b border-slate-100">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-855 leading-tight">Assessment score sheets</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Review detailed reports of submitted quiz booklets.</p>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {testsLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Consulting scores...</p>
                    </div>
                  ) : completedTests.length > 0 ? (
                    completedTests.map((t, i) => (
                      <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/50 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 uppercase tracking-wide leading-tight">{t.title}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {t.course}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3.5 sm:pt-0">
                          <div className="flex items-center gap-4 text-left sm:text-right">
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
                              <span className="text-xs font-black text-slate-800">{t.score}<span className="text-slate-450 text-[10px] font-bold">/{t.totalMarks}</span></span>
                            </div>
                            <div className="h-6 w-px bg-slate-100" />
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Grade</p>
                              <span className={`text-xs font-black uppercase ${(t.score / t.totalMarks * 100) >= 85 ? 'text-emerald-650' : (t.score / t.totalMarks * 100) >= 65 ? 'text-amber-650' : 'text-rose-650'}`}>{t.grade || 'A'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/dashboard/tests/${t.id}/take?view=result`)}
                            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                          >
                            <span>Report</span>
                            <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                       <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No reports compiled yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Sidebar Rule & Insights */}
          <div className="space-y-8">
            <motion.section variants={cardVariants}>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Insights</h3>
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 space-y-6 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100/30">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Study time uptick</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">15% increase recorded this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Goal reached</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Completed 3 key syllabus modules</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Engagement Rule */}
            <motion.section variants={cardVariants}>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Attendance Rule</h3>
              <div className="bg-slate-900 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl border border-slate-800 group hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                <div className="absolute inset-0 bg-dot-pattern opacity-[0.08] pointer-events-none"></div>

                <div className="relative z-10 space-y-4">
                   <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <Monitor className="w-5 h-5 text-primary-400" />
                   </div>
                   <p className="text-xs font-medium leading-relaxed text-slate-300">
                    Engaging in platform activities (such as <span className="text-primary-400 font-bold">watching lectures, accessing PDFs, or completing quiz assessments</span>) automatically marks your attendance as <span className="text-emerald-400 font-black">PRESENT</span> for the day.
                   </p>
                   <div className="pt-4 border-t border-white/5">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Live Compliance System</p>
                   </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
