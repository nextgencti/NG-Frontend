import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, FileText, Award, ChevronRight, Download, 
  PlayCircle, Loader2, Sparkles, TrendingUp, Calendar, 
  BellRing, ClipboardList, Clock, Search, Shield, 
  Settings, CheckCircle2, Trophy, Video, User, Star, MapPin 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import studentMascot from '../../assets/student_mascot.png';
import courseCover from '../../assets/course_cover.png';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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

export default function StudentOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const cached = localStorage.getItem('student_dashboard_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          isLoading: false // Render instantly with cached data
        };
      }
    } catch (e) {
      console.error('Failed to parse cached student dashboard data:', e);
    }
    return {
      activeCourses: 0,
      attendancePercent: '0%',
      firstCourseId: null,
      courses: [],
      activeCourse: null,
      tests: [],
      classroomData: null,
      stats: {},
      activityLogs: [],
      isLoading: true
    };
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, attendanceRes, testsRes] = await Promise.all([
          api.get('/student/courses'),
          api.get('/student/activity'),
          api.get('/student/tests')
        ]);

        const courses = coursesRes.data.success ? coursesRes.data.courses : [];
        const activeCourses = courses.length;
        const activeCourse = courses.length > 0 ? courses[0] : null;
        const firstCourseId = activeCourse ? activeCourse.id : null;
        const attendancePercent = attendanceRes.data.success ? (attendanceRes.data.stats?.attendancePercentage || '0%') : '0%';
        const tests = testsRes.data.success ? testsRes.data.tests : [];

        // If there's an active course, load its detailed classroom curriculum
        let classroomData = null;
        if (firstCourseId) {
          try {
            const classroomRes = await api.get(`/student/courses/${firstCourseId}/classroom`);
            if (classroomRes.data.success) {
              classroomData = classroomRes.data;
            }
          } catch (classroomErr) {
            console.warn('Failed to load classroom details:', classroomErr);
          }
        }

        const freshData = {
          activeCourses,
          attendancePercent,
          firstCourseId,
          courses,
          activeCourse,
          tests,
          classroomData,
          stats: attendanceRes.data.success ? attendanceRes.data.stats : {},
          activityLogs: attendanceRes.data.success ? attendanceRes.data.logs : [],
          isLoading: false
        };

        setDashboardData(freshData);
        localStorage.setItem('student_dashboard_data', JSON.stringify(freshData));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  // Compute stats
  const completedTestsCount = useMemo(() => {
    return dashboardData.tests.filter(t => t.hasAttempts || t.status === 'completed').length;
  }, [dashboardData.tests]);

  const avgScore = useMemo(() => {
    const completed = dashboardData.tests.filter(t => (t.hasAttempts || t.status === 'completed') && t.score !== undefined);
    if (completed.length === 0) return 0;
    const calculated = Math.round(completed.reduce((acc, curr) => acc + (curr.score / (curr.totalMarks || 100) * 100), 0) / completed.length);
    return Math.min(100, calculated);
  }, [dashboardData.tests]);

  const studyHours = useMemo(() => {
    return (dashboardData.stats?.studyTime || '0').replace(' Hours', '');
  }, [dashboardData.stats]);

  // Score trend data
  const trendScores = useMemo(() => {
    const completed = dashboardData.tests
      .filter(t => (t.hasAttempts || t.status === 'completed') && t.score !== undefined)
      .map(t => Math.min(100, Math.round((t.score / (t.totalMarks || 100)) * 100)));

    if (completed.length === 0) return [0, 0, 0, 0, 0];

    // Pad actual completed scores with 0s if less than 5 to draw a full trend
    const result = [0, 0, 0, 0, 0];
    for (let i = 0; i < Math.min(5, completed.length); i++) {
      result[4 - i] = completed[completed.length - 1 - i];
    }
    return result;
  }, [dashboardData.tests]);

  // Generate line points for SVG score trend
  const svgLinePoints = useMemo(() => {
    const points = [];
    const count = trendScores.length;
    // Spacing inside the 220px width range (from 45 to 265)
    const spacing = count > 1 ? 220 / (count - 1) : 220;
    trendScores.forEach((score, idx) => {
      const x = idx * spacing + 45;
      const y = 99 - (score * 84) / 100; // y range is from 15 (100%) to 99 (0%)
      points.push({ x, y });
    });
    return points;
  }, [trendScores]);

  const linePathD = useMemo(() => {
    if (svgLinePoints.length === 0) return '';
    return `M ${svgLinePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }, [svgLinePoints]);

  const fillPathD = useMemo(() => {
    if (svgLinePoints.length === 0) return '';
    const first = svgLinePoints[0];
    const last = svgLinePoints[svgLinePoints.length - 1];
    return `${linePathD} L ${last.x},99 L ${first.x},99 Z`;
  }, [svgLinePoints, linePathD]);

  // Topic progress calculations
  const syllabusModulesProgress = useMemo(() => {
    const classroom = dashboardData.classroomData;
    if (!classroom || !classroom.curriculum) {
      return [];
    }

    const completed = classroom.completedLessons || [];
    return classroom.curriculum.map((mod) => {
      const lessons = mod.lessons || [];
      const total = lessons.length;
      const done = lessons.filter(l => completed.includes(l.id)).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        id: mod.id,
        name: mod.title || 'Untitled Topic',
        progress: pct
      };
    });
  }, [dashboardData.classroomData]);

  const topModules = useMemo(() => {
    return syllabusModulesProgress.slice(0, 4);
  }, [syllabusModulesProgress]);

  // Dynamic SVG donut segments
  const donutSegments = useMemo(() => {
    if (topModules.length === 0) {
      return [{ strokeDasharray: `238.76 238.76`, strokeDashoffset: 0, color: '#E2E8F0' }];
    }
    const sum = topModules.reduce((acc, m) => acc + (m.progress || 10), 0) || 1;
    const circ = 238.76;
    let currentOffset = 0;
    const colors = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B'];
    
    return topModules.map((m, idx) => {
      const p = ((m.progress || 10) / sum) * circ;
      const segment = { 
        strokeDasharray: `${p} ${circ}`, 
        strokeDashoffset: -currentOffset, 
        color: colors[idx % colors.length] 
      };
      currentOffset += p;
      return segment;
    });
  }, [topModules]);

  // Recent Activity logs
  const recentActivities = useMemo(() => {
    const logs = [];
    const classroom = dashboardData.classroomData;
    const tests = dashboardData.tests;
    const courseId = dashboardData.firstCourseId;

    // 1. Completed tests (highest priority)
    tests.filter(t => t.hasAttempts || t.status === 'completed').forEach(t => {
      logs.push({
        title: `Completed Practice Test - ${t.title}`,
        detail: `Score: ${t.score}/${t.totalMarks || 100}`,
        time: 'Recent',
        color: 'text-emerald-500 bg-emerald-50 border-emerald-100/50',
        icon: CheckCircle2,
        action: () => navigate(`/dashboard/tests/${t.id}/take?view=result`)
      });
    });

    // 2. Real classroom progress activities (completed and unlocked lessons)
    if (classroom && classroom.curriculum && courseId) {
      const completedIds = classroom.completedLessons || [];
      const curriculum = classroom.curriculum || [];
      
      const completedList = [];
      const inProgressList = [];

      curriculum.forEach(mod => {
        (mod.lessons || []).forEach(lesson => {
          const isDone = completedIds.includes(lesson.id);
          const item = {
            id: lesson.id,
            title: lesson.title,
            moduleTitle: mod.title,
            moduleId: mod.id,
            isCompleted: isDone
          };
          if (isDone) {
            completedList.push(item);
          } else {
            inProgressList.push(item);
          }
        });
      });

      // Show completed lessons as recent activities
      completedList.forEach(item => {
        logs.push({
          title: `Completed Lesson - ${item.title}`,
          detail: item.moduleTitle,
          time: 'Recent',
          color: 'text-emerald-500 bg-emerald-50 border-emerald-100/50',
          icon: CheckCircle2,
          action: () => navigate(`/dashboard/courses/${courseId}/classroom?lessonId=${item.id}`)
        });
      });

      // Show current active/unlocked in-progress lessons (up to 2)
      inProgressList.slice(0, 2).forEach(item => {
        logs.push({
          title: `Start Learning - ${item.title}`,
          detail: item.moduleTitle,
          time: 'Active',
          color: 'text-indigo-500 bg-indigo-50 border-indigo-100/50',
          icon: PlayCircle,
          action: () => navigate(`/dashboard/courses/${courseId}/classroom?lessonId=${item.id}`)
        });
      });
    }

    // 3. Enrolled courses
    dashboardData.courses.forEach(c => {
      logs.push({
        title: `Enrolled in Course - ${c.name || c.title}`,
        detail: c.description || 'Access modules & study materials',
        time: 'Registered',
        color: 'text-blue-500 bg-blue-50 border-blue-100/50',
        icon: BookOpen,
        action: () => navigate(`/dashboard/courses/${c.id}/classroom`)
      });
    });

    return logs.slice(0, 4);
  }, [dashboardData.courses, dashboardData.tests, dashboardData.classroomData, dashboardData.firstCourseId, navigate]);

  // Pending tasks list
  const pendingTasks = useMemo(() => {
    const tasks = [];
    const tests = dashboardData.tests;
    
    // Non-attempted tests
    tests.filter(t => !t.hasAttempts).forEach(t => {
      tasks.push({
        title: `${t.title} Quiz`,
        desc: `Course assessment • ${t.difficulty || 'Normal'}`,
        color: 'text-indigo-500 bg-indigo-50 border-indigo-100/50',
        icon: ClipboardList,
        action: () => navigate(`/dashboard/tests/${t.id}/take`)
      });
    });

    return tasks.slice(0, 3);
  }, [dashboardData.tests, navigate]);

  if (dashboardData.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
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
      className="max-w-7xl mx-auto space-y-8 pb-16 bg-dashboard-grid bg-repeat text-slate-800"
    >
      
      {/* Welcome Greeting Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-xl">👋</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Welcome back,</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            {currentUser?.name?.split(' ')[0] || 'Scholar'}
          </h2>
          <p className="text-slate-400 text-xs font-medium pt-0.5">
            Keep learning, keep growing. You're doing great! ✨
          </p>
        </div>
      </div>

      {/* Grid: 3-column content (Left 2 columns, Right 1 column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (2 columns) */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          
          {/* Top Stats Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Active Courses',
                value: dashboardData.activeCourses,
                sub: 'Keep it up!',
                icon: BookOpen,
                color: 'text-white bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500/20 shadow-[0_4px_12px_rgba(99,102,241,0.3)]',
                sparklineColor: 'text-indigo-500',
                sparklineD: 'M 10,25 Q 25,10 40,22 T 70,5 T 100,18 T 120,8'
              },
              {
                label: 'Tests Completed',
                value: completedTestsCount,
                sub: 'This month',
                icon: ClipboardList,
                color: 'text-white bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.3)]',
                sparklineColor: 'text-emerald-500',
                sparklineD: 'M 10,28 L 30,22 L 50,15 L 70,18 L 90,8 L 110,12 L 120,4'
              },
              {
                label: 'Average Score',
                value: `${avgScore}%`,
                sub: 'Great performance!',
                icon: Star,
                color: 'text-white bg-gradient-to-br from-amber-400 to-orange-500 border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.3)]',
                sparklineColor: 'text-amber-500',
                sparklineD: 'M 10,28 Q 30,10 50,25 T 90,5 T 120,15'
              },
              {
                label: 'Study Hours',
                value: `${studyHours}h`,
                sub: 'This month',
                icon: Clock,
                color: 'text-white bg-gradient-to-br from-blue-400 to-cyan-500 border-blue-500/20 shadow-[0_4px_12px_rgba(59,130,246,0.3)]',
                sparklineColor: 'text-blue-500',
                sparklineD: 'M 10,28 L 30,25 L 50,18 L 70,22 L 90,15 L 110,8 L 120,5'
              }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[155px] relative overflow-hidden group transition-all hover:border-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-right leading-snug pt-1 flex-1">{card.label}</span>
                  </div>
                  
                  <div className="pt-3">
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{card.value}</h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">{card.sub}</p>
                  </div>
                  
                  {/* Beautiful Inline SVG Sparkline */}
                  <div className="absolute right-3 bottom-3 w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    <svg className={`w-full h-full ${card.sparklineColor}`} viewBox="0 0 130 30" fill="none">
                      <path d={card.sparklineD} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Row 2: Continue Learning and Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Continue Learning Widget */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[300px] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300 group"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Continue Learning</h3>
                <button 
                  onClick={() => navigate('/dashboard/courses')}
                  className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              {dashboardData.activeCourse ? (
                <div className="flex-1 flex flex-row items-stretch gap-5 pt-5 min-h-[180px]">
                  {/* Left: Cover Image */}
                  <div 
                    onClick={() => navigate(`/dashboard/courses/${dashboardData.activeCourse.id}/classroom`)}
                    className="w-[100px] sm:w-[130px] rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0 cursor-pointer relative group/cover"
                  >
                    <img 
                      src={courseCover} 
                      alt="Course Cover" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-105" 
                    />
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="space-y-1">
                      <span className="inline-flex px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider border border-emerald-100/50">
                        In Progress
                      </span>
                      <h4 className="text-sm font-black text-slate-800 leading-snug truncate mt-1" title={dashboardData.activeCourse.name || dashboardData.activeCourse.title}>
                        {dashboardData.activeCourse.name || dashboardData.activeCourse.title}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-semibold truncate">
                        {dashboardData.classroomData?.curriculum?.[0]?.title || 'Course Syllabus'}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <span>Course Progress</span>
                        <span className="text-primary-600 font-black">{dashboardData.activeCourse.progress || 0}% Complete</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${dashboardData.activeCourse.progress || 0}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button 
                        onClick={() => navigate(`/dashboard/courses/${dashboardData.activeCourse.id}/classroom`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Continue Learning
                      </button>
                      <button 
                        onClick={() => navigate(`/dashboard/courses/${dashboardData.activeCourse.id}/classroom`)}
                        className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-primary-600 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
                      >
                        <PlayCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 pt-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-slate-400 text-xs font-medium max-w-[200px]">No active course found. Explore our course catalog to register.</p>
                  <button 
                    onClick={() => navigate('/dashboard/courses')}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </motion.div>

            {/* Performance Overview (Score Trend and Topic Wise Accuracy) */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Performance Overview</h3>
                <span className="text-[9px] font-black text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  This Month
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-6 pt-5 items-stretch">
                
                {/* Score Trend Mini Line Chart */}
                <div className="space-y-2 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score Trend</span>
                  <div className="relative w-full h-[120px] bg-slate-50/50 rounded-2xl border border-slate-100 p-2 overflow-visible">
                    <svg className="w-full h-full text-primary-500 overflow-visible" viewBox="0 0 300 120" fill="none">
                      {/* Gradient fill */}
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid lines & Labels */}
                      <g className="text-[8px] text-slate-400 font-bold">
                        <text x="5" y="18" fill="currentColor">100%</text>
                        <line x1="32" y1="15" x2="285" y2="15" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                        
                        <text x="5" y="39" fill="currentColor">75%</text>
                        <line x1="32" y1="36" x2="285" y2="36" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                        
                        <text x="5" y="60" fill="currentColor">50%</text>
                        <line x1="32" y1="57" x2="285" y2="57" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                        
                        <text x="5" y="81" fill="currentColor">25%</text>
                        <line x1="32" y1="78" x2="285" y2="78" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3,3" />
                        
                        <text x="5" y="102" fill="currentColor">0%</text>
                        <line x1="32" y1="99" x2="285" y2="99" stroke="#E2E8F0" strokeWidth="1" />
                      </g>

                      {/* Date Labels inside SVG to guarantee alignment */}
                      <g className="text-[8px] text-slate-400 font-bold" textAnchor="middle">
                        <text x="45" y="115" fill="currentColor">May 1</text>
                        <text x="100" y="115" fill="currentColor">May 8</text>
                        <text x="155" y="115" fill="currentColor">May 15</text>
                        <text x="210" y="115" fill="currentColor">May 22</text>
                        <text x="265" y="115" fill="currentColor">May 29</text>
                      </g>
 
                      {/* Line chart path & Fill */}
                      <path d={fillPathD} fill="url(#scoreGrad)" />
                      <path d={linePathD} stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Interactive dots for each coordinate */}
                      {svgLinePoints.map((pt, i) => (
                        <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="1.5" />
                      ))}

                      {/* Peak Tooltip box */}
                      {svgLinePoints.length > 0 && (
                        <g transform={`translate(${svgLinePoints[svgLinePoints.length - 1].x}, ${svgLinePoints[svgLinePoints.length - 1].y})`}>
                          <rect x="-15" y="-22" width="30" height="15" rx="4" fill="#4F46E5" />
                          <text x="0" y="-12" fill="#FFFFFF" fontSize="8" fontWeight="black" textAnchor="middle">{Math.min(100, avgScore)}%</text>
                          <path d="M -3,-7 L 0,-4 L 3,-7 Z" fill="#4F46E5" />
                        </g>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Topic Wise Accuracy */}
                <div className="flex flex-col justify-between space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Topic Wise Accuracy</span>
                  <div className="flex flex-row items-center gap-4 justify-between h-full pt-1">
                    {/* Circle Donut Chart */}
                    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background grey ring */}
                        <circle cx="50" cy="50" r="38" stroke="#F8FAFC" strokeWidth="10" fill="none" />
                        {/* Dynamic segments */}
                        {donutSegments.map((seg, i) => (
                          <circle 
                            key={i} 
                            cx="50" 
                            cy="50" 
                            r="38" 
                            stroke={seg.color} 
                            strokeWidth="10" 
                            fill="none" 
                            strokeDasharray={seg.strokeDasharray} 
                            strokeDashoffset={seg.strokeDashoffset} 
                          />
                        ))}
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-sm font-black text-slate-800 leading-none">{Math.min(100, avgScore)}%</span>
                        <p className="text-[6px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Average</p>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                      {topModules.length > 0 ? topModules.map((item, i) => {
                        const colors = ['bg-[#6366F1]', 'bg-[#3B82F6]', 'bg-[#10B981]', 'bg-[#F59E0B]'];
                        return (
                          <div key={i} className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider min-w-0">
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors[i % colors.length]}`}></span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="text-slate-800 font-black pl-1 shrink-0">{item.progress}%</span>
                          </div>
                        );
                      }) : (
                        <div className="text-[10px] font-bold text-slate-400 uppercase">No topics started</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row 3: Recent Activity and Learning Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Recent Activity */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300 h-full"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Recent Activity</h3>
                <button 
                  onClick={() => navigate('/dashboard/activity')}
                  className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="flex-1 divide-y divide-slate-50 pt-3">
                {recentActivities.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => act.action && act.action()}
                      className="py-3 flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50/50 px-2 -mx-2 rounded-xl transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${act.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-slate-800 group-hover:text-primary-600 transition-colors truncate">{act.title}</h4>
                          <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">{act.detail}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{act.time}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Learning Progress */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300 h-full"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider">Learning Progress</h3>
                <button 
                  onClick={() => navigate('/dashboard/courses')}
                  className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>

              <div className="flex-1 pt-4 space-y-4">
                {syllabusModulesProgress.map((mod, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => dashboardData.firstCourseId && navigate(`/dashboard/courses/${dashboardData.firstCourseId}/classroom?moduleId=${mod.id}`)}
                    className="space-y-1.5 cursor-pointer group/item hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-all duration-200"
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-600 truncate max-w-[75%] group-hover/item:text-primary-600 transition-colors" title={mod.name}>{mod.name}</span>
                      <span className="text-primary-600 font-black">{mod.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${mod.progress}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-primary-500 rounded-full group-hover/item:bg-gradient-to-r group-hover/item:from-primary-500 group-hover/item:to-indigo-500"
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>

        {/* Right Sidebar Column (1 column) */}
        <div className="space-y-8 min-w-0">
          
          {/* Standalone Mascot Illustration */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center bg-transparent p-2"
          >
            <img 
              src={studentMascot} 
              alt="Mascot" 
              className="w-full max-w-[280px] h-auto object-contain drop-shadow-md" 
            />
          </motion.div>

          {/* Pending Tasks */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Pending Tasks</h3>
              </div>
              <button 
                onClick={() => navigate('/dashboard/tests')}
                className="text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] space-y-4 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300">
              {pendingTasks.map((task, idx) => {
                const Icon = task.icon;
                return (
                  <div 
                    key={idx} 
                    onClick={task.action}
                    className="flex items-center justify-between gap-4 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-primary-500 transition-colors shrink-0 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-500 scale-0 group-hover:scale-100 transition-transform"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-800 group-hover:text-primary-600 transition-colors truncate">{task.title}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">{task.desc}</p>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${task.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Achievements */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest">Achievements</h3>
              </div>
              <button 
                onClick={() => navigate('/dashboard/certificates')}
                className="text-[9px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] grid grid-cols-4 gap-3 items-center justify-items-center hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300">
              {[
                { title: 'First Test', desc: 'Completed', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-indigo-500/20' },
                { title: 'Top Scorer', desc: 'Score 90%+', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
                { title: 'Consistent', desc: '7 Day Streak', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
                { title: 'Quick Learner', desc: '10+ Units', color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' }
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group cursor-pointer">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${badge.color} flex items-center justify-center text-white shadow-md ${badge.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <Trophy className="w-5 h-5 text-white/95" />
                  </div>
                  <span className="text-[8px] font-black text-slate-700 leading-tight uppercase tracking-wide mt-2 block w-[58px] truncate" title={badge.title}>{badge.title}</span>
                  <span className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">{badge.desc}</span>
                </div>
              ))}
            </div>
          </motion.section>

        </div>
      </div>
      
    </motion.div>
  );
}
