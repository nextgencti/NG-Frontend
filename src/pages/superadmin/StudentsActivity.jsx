import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  X, 
  BarChart2,
  TrendingUp,
  Inbox,
  Award,
  Globe,
  Monitor,
  CalendarDays,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 85, damping: 14 } 
  }
};

const Portal = ({ children }) => {
  return createPortal(children, document.body);
};

export default function StudentsActivity() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'study_classroom', 'study_test', 'lesson_complete'
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  // Modal Data State
  const [detailedData, setDetailedData] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  // Date filter state inside modal
  const [filterRangeType, setFilterRangeType] = useState('today'); // 'all', 'today', 'yesterday', '7days', '30days', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentDetails(selectedStudentId);
      // Reset filter options on student change
      setFilterRangeType('today');
      setStartDate('');
      setEndDate('');
    } else {
      setDetailedData(null);
    }
  }, [selectedStudentId]);

  // Filtered detailed activity logs in modal
  const filteredDetailedActivities = useMemo(() => {
    if (!detailedData || !detailedData.activities) return [];
    const logs = detailedData.activities;

    if (filterRangeType === 'all') {
      return logs;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return logs.filter(log => {
      if (!log.timestamp) return false;
      const logDate = new Date(log.timestamp);

      if (filterRangeType === 'today') {
        return logDate >= today;
      }
      if (filterRangeType === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(today);
        return logDate >= yesterday && logDate < endOfYesterday;
      }
      if (filterRangeType === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return logDate >= sevenDaysAgo;
      }
      if (filterRangeType === '30days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return logDate >= thirtyDaysAgo;
      }
      if (filterRangeType === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (logDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (logDate > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [detailedData, filterRangeType, startDate, endDate]);

  // Filtered detailed test results in modal
  const filteredDetailedTestResults = useMemo(() => {
    if (!detailedData || !detailedData.testResults) return [];
    const tests = detailedData.testResults;

    if (filterRangeType === 'all') {
      return tests;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tests.filter(test => {
      if (!test.submittedAt) return false;
      const submitDate = new Date(test.submittedAt);

      if (filterRangeType === 'today') {
        return submitDate >= today;
      }
      if (filterRangeType === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(today);
        return submitDate >= yesterday && submitDate < endOfYesterday;
      }
      if (filterRangeType === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return submitDate >= sevenDaysAgo;
      }
      if (filterRangeType === '30days') {
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return submitDate >= thirtyDaysAgo;
      }
      if (filterRangeType === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (submitDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (submitDate > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [detailedData, filterRangeType, startDate, endDate]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/superadmin/student-activities');
      if (response.data.success) {
        setActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch student activities');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    setIsDetailLoading(true);
    try {
      const response = await api.get(`/superadmin/students/${studentId}/activity-details`);
      if (response.data.success) {
        setDetailedData(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to retrieve student activity details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Helper to format timestamp
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const dateObj = new Date(dateStr);
    
    const day = dateObj.getDate();
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const month = monthNames[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  };

  // Helper to get relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Stats Computations (Platform Overall Summary)
  const stats = useMemo(() => {
    const totalMinutes = activities.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    
    const uniqueStudents = new Set(activities.map(a => a.studentId).filter(Boolean)).size;
    const lessonCompletions = activities.filter(a => a.type === 'lesson_complete').length;
    
    // Active sessions in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeSessions24h = activities.filter(a => {
      if (!a.timestamp) return false;
      const t = new Date(a.timestamp);
      return t >= oneDayAgo && (a.type === 'study_classroom' || a.type === 'study_test');
    }).length;

    return {
      totalHours,
      uniqueStudents,
      lessonCompletions,
      activeSessions24h
    };
  }, [activities]);

  // Filtered Activities Timeline
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = 
        activity.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.studentRollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || activity.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [activities, searchQuery, selectedType]);

  // Calculated Student-Specific Metrics from Detailed Data
  const studentAnalytics = useMemo(() => {
    if (!detailedData) return null;
    const allLogs = detailedData.activities || [];
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0,0,0,0);
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0,0,0,0);
    
    // Daily (Today) minutes (computed from all logs for historical dashboard profile)
    const dailyMins = allLogs
      .filter(l => l.timestamp && new Date(l.timestamp) >= today)
      .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
      
    // Weekly (7 days) minutes (computed from all logs for historical dashboard profile)
    const weeklyMins = allLogs
      .filter(l => l.timestamp && new Date(l.timestamp) >= oneWeekAgo)
      .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
      
    // Monthly (30 days) minutes (computed from all logs for historical dashboard profile)
    const monthlyMins = allLogs
      .filter(l => l.timestamp && new Date(l.timestamp) >= oneMonthAgo)
      .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
      
    // Now compute detailed stats based on the active filtered detailed activities
    const logs = filteredDetailedActivities;
      
    // Sort chronologically
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const openTimes = sortedLogs.map(l => {
      const d = new Date(l.timestamp);
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      // Determine if it was today, if not show month name and day
      const isLogToday = d.toDateString() === today.toDateString();
      const timeStr = `${hours}:${minutes} ${ampm}`;
      
      const day = d.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const dateStr = `${day} ${monthNames[d.getMonth()]}`;

      let label = 'App Open';
      if (l.type === 'study_classroom') label = 'Classroom';
      else if (l.type === 'study_test') label = 'Practice Test';
      else if (l.type === 'lesson_complete') label = 'Lesson Finished';

      return {
        time: isLogToday ? timeStr : `${dateStr}, ${timeStr}`,
        label,
        type: l.type
      };
    });

    const totalMins = logs.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
    const completedLessons = logs.filter(l => l.type === 'lesson_complete').length;

    // Study Allocation Time
    const classroomMins = logs
      .filter(l => l.type === 'study_classroom')
      .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);

    const testMins = logs
      .filter(l => l.type === 'study_test')
      .reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);

    return {
      dailyHours: (dailyMins / 60).toFixed(1),
      weeklyHours: (weeklyMins / 60).toFixed(1),
      monthlyHours: (monthlyMins / 60).toFixed(1),
      appOpenCount: openTimes.length,
      openTimes,
      totalHours: (totalMins / 60).toFixed(1),
      completedLessons,
      classroomHours: (classroomMins / 60).toFixed(1),
      testHours: (testMins / 60).toFixed(1)
    };
  }, [detailedData, filteredDetailedActivities]);

  // Activity Badge Styles
  const getActivityStyle = (type) => {
    switch (type) {
      case 'lesson_complete':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          label: 'Lesson Completed',
          icon: CheckCircle2
        };
      case 'study_classroom':
        return {
          bg: 'bg-indigo-50 border-indigo-100 text-indigo-700',
          label: 'Classroom Study',
          icon: BookOpen
        };
      case 'study_test':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-700',
          label: 'Practice Test',
          icon: FileText
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100 text-slate-700',
          label: 'Activity',
          icon: Activity
        };
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-16 max-w-5xl mx-auto text-slate-800"
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
            <div className="w-6.5 h-6.5 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50 text-indigo-600">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.18em]">Super Admin Board</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-primary-600">Activity Tracker</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Monitor real-time student study heartbeats, completed lessons, and curriculum analytics across the platform.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Study Time',
            value: `${stats.totalHours} hrs`,
            sub: 'Cumulative platform usage',
            icon: Clock,
            color: 'from-indigo-500 to-purple-600 bg-indigo-50 text-indigo-600 border-indigo-100'
          },
          {
            label: 'Active Students',
            value: stats.uniqueStudents,
            sub: 'Unique scholars logged',
            icon: User,
            color: 'from-emerald-400 to-teal-500 bg-emerald-50 text-emerald-600 border-emerald-100'
          },
          {
            label: 'Lessons Completed',
            value: stats.lessonCompletions,
            sub: 'Curriculum steps completed',
            icon: CheckCircle2,
            color: 'from-amber-400 to-orange-500 bg-amber-50 text-amber-600 border-amber-100'
          },
          {
            label: 'Sessions (Last 24h)',
            value: stats.activeSessions24h,
            sub: 'Study sessions in last day',
            icon: Activity,
            color: 'from-blue-400 to-cyan-500 bg-blue-50 text-blue-600 border-blue-100'
          }
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="bg-white/70 backdrop-blur-2xl rounded-2xl border border-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px] relative overflow-hidden group transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${card.color} bg-opacity-10`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right leading-snug pt-1 flex-1">{card.label}</span>
              </div>
              <div className="pt-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{card.value}</h3>
                <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{card.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Container - Filter and Timeline list */}
      <motion.div 
        variants={itemVariants}
        className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] shadow-[0_12px_36px_rgba(0,0,0,0.02)] p-6 space-y-6 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300"
      >
        {/* Filters Header Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all text-slate-700 cursor-pointer shadow-sm"
            >
              <option value="all">All Activities</option>
              <option value="study_classroom">Classroom Study</option>
              <option value="study_test">Practice Tests</option>
              <option value="lesson_complete">Lesson Completions</option>
            </select>
            
            {(searchQuery || selectedType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
                className="text-[9px] font-black uppercase text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Timeline Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Syncing platform timelines…</p>
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="relative border-l border-slate-100 ml-4.5 sm:ml-6 pl-6 sm:pl-8 space-y-6">
            {filteredActivities.map((activity, idx) => {
              const style = getActivityStyle(activity.type);
              const Icon = style.icon;
              return (
                <div key={activity.id || idx} className="relative group animate-in fade-in slide-in-from-bottom-2 duration-350">
                  {/* Timeline point icon indicator */}
                  <div className={`absolute -left-[38px] sm:-left-[46px] top-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 z-10 ${style.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Main activity card */}
                  <div 
                    onClick={() => setSelectedStudentId(activity.studentId)}
                    className="p-4 sm:p-5 bg-white hover:bg-slate-50/60 border border-slate-200/80 hover:border-indigo-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Left: User Details and Action */}
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200/40 flex items-center justify-center overflow-hidden shadow-inner shrink-0 mt-0.5">
                        {activity.studentPhotoURL ? (
                          <img src={activity.studentPhotoURL} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-black text-indigo-700">
                            {activity.studentName ? activity.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'UI'}
                          </span>
                        )}
                      </div>

                      {/* Info & action descriptions */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <h4 className="text-xs font-black text-slate-800 hover:text-indigo-600 transition-colors uppercase tracking-wide">
                            {activity.studentName}
                          </h4>
                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded leading-none">
                            {activity.studentRollNumber || 'N/A'}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg}`}>
                            {style.label}
                          </span>
                        </div>
                        
                        <p className="text-xs font-semibold text-slate-700 mt-2 truncate">
                          {activity.action}
                        </p>
                        
                        <p className="text-[9.5px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">
                          {activity.studentEmail}
                        </p>
                      </div>
                    </div>

                    {/* Right: Duration metrics & timestamps */}
                    <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center sm:text-right gap-2 border-t sm:border-t-0 border-slate-50 pt-2.5 sm:pt-0 shrink-0">
                      {activity.duration && (
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-600 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{activity.duration} min{activity.duration > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-[9.5px] text-slate-400 font-bold block" title={formatDateTime(activity.timestamp)}>
                          {formatDateTime(activity.timestamp)}
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mt-0.5 block">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50">
            <Inbox className="w-10 h-10 text-slate-350 mx-auto mb-4" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">No Logs Found</h4>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto font-medium text-xs leading-relaxed">
              No matching activity records tracked on the platform matching your filters.
            </p>
          </div>
        )}
      </motion.div>

      {/* ─── DETAILED STUDENT ANALYTICS CENTER POPUP MODAL ─── */}
      <AnimatePresence>
        {selectedStudentId && (
          <Portal>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
            {/* Backdrop click close */}
            <div 
              onClick={() => setSelectedStudentId(null)}
              className="absolute inset-0 cursor-pointer"
            />

            {/* Modal Dialog Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-4xl h-[70vh] bg-white rounded-[2rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden text-slate-800 z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4.5 h-4.5 text-indigo-650" />
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Student Activities Details</span>
                </div>
                <button 
                  onClick={() => setSelectedStudentId(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-hide">
                {isDetailLoading || !detailedData ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-32">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting dynamic stats…</p>
                  </div>
                ) : (
                  <>
                    {/* Profile Summary Card Banner */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden shrink-0">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-700/20 rounded-full blur-2xl pointer-events-none"></div>
                      
                      {/* Left side details */}
                      <div className="flex items-center gap-4 z-10 min-w-0">
                        {/* Photo */}
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {detailedData.student.photoURL ? (
                            <img src={detailedData.student.photoURL} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-black text-indigo-200">
                              {detailedData.student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-base uppercase tracking-wide truncate leading-tight">{detailedData.student.name}</h3>
                          <span className="inline-block mt-1 text-[8.5px] font-mono font-bold text-indigo-200 bg-white/10 border border-white/15 px-2 py-0.5 rounded leading-none">
                            Roll No: {detailedData.student.rollNumber}
                          </span>
                          <p className="text-[9px] text-indigo-200 mt-1 truncate font-medium">{detailedData.student.email}</p>
                        </div>
                      </div>

                      {/* Right side: Date Filter Controls */}
                      <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 shrink-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-indigo-200" />
                          <select
                            value={filterRangeType}
                            onChange={(e) => {
                              setFilterRangeType(e.target.value);
                              if (e.target.value !== 'custom') {
                                setStartDate('');
                                setEndDate('');
                              }
                            }}
                            className="bg-indigo-950 border border-white/25 text-white rounded-xl px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer hover:bg-indigo-900 transition-colors"
                          >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="custom">Custom Range</option>
                          </select>
                        </div>

                        {filterRangeType === 'custom' && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="bg-indigo-950 border border-white/20 text-white rounded-xl px-2 py-1 text-[9px] font-bold outline-none text-indigo-200 focus:text-white"
                            />
                            <span className="text-[9px] text-indigo-200 font-bold self-center">to</span>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="bg-indigo-950 border border-white/20 text-white rounded-xl px-2 py-1 text-[9px] font-bold outline-none text-indigo-200 focus:text-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Stats Indicators Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
                      {/* Total Spent */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Spent</span>
                        <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{studentAnalytics?.totalHours} hrs</span>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block mt-1">Platform Time</span>
                      </div>
                      
                      {/* Tests Attempted */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Tests Attempted</span>
                        <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{filteredDetailedTestResults?.length || 0} Tests</span>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block mt-1">Total Submissions</span>
                      </div>

                      {/* App opens today */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                          {filterRangeType === 'today' ? 'Today Opens' : 'Period Opens'}
                        </span>
                        <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{studentAnalytics?.appOpenCount} Times</span>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block mt-1">
                          {filterRangeType === 'today' ? "Today's Visits" : "Visits in Period"}
                        </span>
                      </div>

                      {/* Completed lessons */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Lessons Done</span>
                        <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{studentAnalytics?.completedLessons}</span>
                        <span className="text-[7.5px] text-slate-400 font-bold uppercase block mt-1">Syllabus Steps</span>
                      </div>
                    </div>

                    {/* Last Login and Platform Access Info */}
                    <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Monitor className="w-4.5 h-4.5 text-indigo-650" />
                        </div>
                        <div>
                          <span className="text-[7.5px] font-black text-indigo-600 uppercase tracking-widest block leading-none">Last Login Time</span>
                          <span className="text-xs font-black text-slate-700 mt-1.5 block leading-none">
                            {formatDateTime(detailedData.student.lastLogin)}
                          </span>
                        </div>
                      </div>
                      
                      {detailedData.student.lastLogin && (
                        <div className="px-3.5 py-1.5 bg-white border border-indigo-100/60 rounded-xl text-[9px] font-black uppercase text-indigo-700 tracking-wider shadow-sm shrink-0">
                          Active {getRelativeTime(detailedData.student.lastLogin)}
                        </div>
                      )}
                    </div>

                    {/* Daily, Weekly, Monthly Activity Tracker Cards */}
                    <div className="space-y-3 shrink-0">
                      <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 text-left flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        Platform Usage Distribution
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Daily */}
                        <div className="p-4 rounded-2xl border border-slate-200 text-left bg-gradient-to-br from-white to-slate-50/20">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Daily Activity</span>
                          <span className="text-lg font-black text-indigo-650 mt-1 block font-mono">{studentAnalytics?.dailyHours} hrs</span>
                          <span className="text-[7px] text-slate-455 font-bold uppercase block mt-1">Today's Duration</span>
                        </div>
                        {/* Weekly */}
                        <div className="p-4 rounded-2xl border border-slate-200 text-left bg-gradient-to-br from-white to-slate-50/20">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Weekly (7D)</span>
                          <span className="text-lg font-black text-emerald-650 mt-1 block font-mono">{studentAnalytics?.weeklyHours} hrs</span>
                          <span className="text-[7px] text-slate-455 font-bold uppercase block mt-1">Last 7 Days</span>
                        </div>
                        {/* Monthly */}
                        <div className="p-4 rounded-2xl border border-slate-200 text-left bg-gradient-to-br from-white to-slate-50/20">
                          <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Monthly (30D)</span>
                          <span className="text-lg font-black text-amber-650 mt-1 block font-mono">{studentAnalytics?.monthlyHours} hrs</span>
                          <span className="text-[7px] text-slate-455 font-bold uppercase block mt-1">Last 30 Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Today's Access Timelines (Open patterns) */}
                    <div className="space-y-3 text-left">
                      <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {filterRangeType === 'today' && "Today's App Open Timelines"}
                        {filterRangeType === 'yesterday' && "Yesterday's App Open Timelines"}
                        {filterRangeType === 'all' && "All-Time App Open Timelines"}
                        {filterRangeType === '7days' && "Last 7 Days App Open Timelines"}
                        {filterRangeType === '30days' && "Last 30 Days App Open Timelines"}
                        {filterRangeType === 'custom' && "Custom Period App Open Timelines"}
                        {" "} ({studentAnalytics?.appOpenCount} sessions)
                      </h4>
                      {studentAnalytics?.openTimes && studentAnalytics.openTimes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {studentAnalytics.openTimes.map((item, idx) => {
                            const typeStyle = item.type === 'lesson_complete' 
                              ? 'bg-emerald-50 border-emerald-100/50 text-emerald-700' 
                              : item.type === 'study_test' 
                                ? 'bg-amber-50 border-amber-100/50 text-amber-700' 
                                : 'bg-indigo-50 border-indigo-100/50 text-indigo-700';
                            return (
                              <div key={idx} className={`px-3 py-1.5 rounded-xl text-[9.5px] font-bold border flex items-center gap-1.5 shadow-sm hover:scale-102 transition-transform select-none ${typeStyle}`}>
                                <span className="font-mono">{item.time}</span>
                                <span className="text-slate-300">|</span>
                                <span className="uppercase text-[8.5px] tracking-wide font-black">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                          <p className="text-xs text-slate-400 font-medium">
                            {filterRangeType === 'today' && "No study or page heartbeat activity logged today."}
                            {filterRangeType === 'yesterday' && "No study or page heartbeat activity logged yesterday."}
                            {filterRangeType === 'all' && "No study or page heartbeat activity logged."}
                            {filterRangeType === '7days' && "No study or page heartbeat activity logged in last 7 days."}
                            {filterRangeType === '30days' && "No study or page heartbeat activity logged in last 30 days."}
                            {filterRangeType === 'custom' && "No study or page heartbeat activity logged in custom period."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Study Hours Allocation Bar */}
                    <div className="space-y-3 bg-slate-50/50 border border-slate-150 p-5 rounded-2xl text-left">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-650" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syllabus Study Time Distribution</h4>
                      </div>
                      <div className="space-y-3 text-xs font-semibold">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500">
                            <span>Classroom Curriculum Lectures</span>
                            <span className="text-indigo-600 font-black">{studentAnalytics?.classroomHours} hrs</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ 
                                width: `${(parseFloat(studentAnalytics?.classroomHours || 0) / (parseFloat(studentAnalytics?.totalHours || 1) || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500">
                            <span>Practice Assessments & Tests</span>
                            <span className="text-amber-600 font-black">{studentAnalytics?.testHours} hrs</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className="h-full bg-amber-500 rounded-full"
                              style={{ 
                                width: `${(parseFloat(studentAnalytics?.testHours || 0) / (parseFloat(studentAnalytics?.totalHours || 1) || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Academic Tests Records timeline list */}
                    <div className="space-y-3 text-left">
                      <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-slate-400" />
                        Academic Test Submissions ({filteredDetailedTestResults?.length || 0} attempts)
                      </h4>
                      
                      {filteredDetailedTestResults && filteredDetailedTestResults.length > 0 ? (
                        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-slate-150">
                          {filteredDetailedTestResults.map((result, idx) => (
                            <div key={result.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wide truncate">{result.testTitle}</h5>
                                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                  Submitted On: {formatDateTime(result.submittedAt)} • Attempt #{result.attemptNumber}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                                <div className="text-right">
                                  <span className="text-xs font-black text-slate-800 block font-mono">
                                    Score: {result.score} / {result.totalMarks}
                                  </span>
                                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                    ({result.percentage?.toFixed(0)}%)
                                  </span>
                                </div>
                                
                                <span className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${
                                  result.percentage >= 60 
                                    ? 'bg-emerald-50 border-emerald-150 text-emerald-700' 
                                    : 'bg-rose-50 border-rose-150 text-rose-700'
                                }`}>
                                  {result.grade || 'F'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                          <p className="text-xs text-slate-400 font-medium">
                            {filterRangeType === 'today' && "No quiz or test result submissions recorded today."}
                            {filterRangeType === 'yesterday' && "No quiz or test result submissions recorded yesterday."}
                            {filterRangeType === 'all' && "No quiz or test result submissions recorded on this enrollment."}
                            {filterRangeType === '7days' && "No quiz or test result submissions recorded in last 7 days."}
                            {filterRangeType === '30days' && "No quiz or test result submissions recorded in last 30 days."}
                            {filterRangeType === 'custom' && "No quiz or test result submissions recorded in custom period."}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4.5 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Close Analytics
                </button>
              </div>
            </motion.div>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
    </motion.div>
  );
}
