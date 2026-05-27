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
  Monitor
} from 'lucide-react';
import api from '../../lib/axios';

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
          const completed = response.data.tests.filter(t => t.hasAttempts || t.status === 'completed');
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
    { label: 'Last Login', value: formatLastLogin(data.stats.lastLogin), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Study Time', value: data.stats.studyTime, icon: Monitor, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Days', value: data.stats.activeDays, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Course Progress', value: data.stats.progress, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lesson_complete': return { icon: CheckCircle2, color: 'text-emerald-500' };
      case 'video': return { icon: PlayCircle, color: 'text-blue-500' };
      case 'pdf': return { icon: FileText, color: 'text-red-500' };
      default: return { icon: ActivityIcon, color: 'text-slate-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Loading Activity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Activity</h2>
          <p className="text-slate-500 text-sm mt-1">Track your learning engagement and progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search activity..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all w-full sm:w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-slate-300 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-xl w-fit">
          {['overview', 'learning activity', 'attendance', 'test results'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab 
                ? 'bg-white text-primary-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tab Content */}
          <div className="lg:col-span-2">
            
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Activity Graph Placeholder */}
                <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30"></div>
                  
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-bold text-slate-900">Weekly Activity</h3>
                    <select className="bg-slate-50 border-none text-[10px] font-bold uppercase tracking-widest text-slate-500 rounded-lg px-3 py-1 focus:ring-0 cursor-pointer outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[40, 70, 45, 90, 65, 30, 80].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                        <div className="relative w-full flex justify-center items-end h-full">
                          <div 
                            className="w-full max-w-[28px] bg-primary-100 rounded-t-lg group-hover:bg-primary-500 transition-all duration-500 relative" 
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                              {height} mins
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Highlights */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-primary-100 transition-all">
                    <h4 className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest">Top Course</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{data.stats.topCourse || 'No Enrolled Course'}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Keep progressing! 👋</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-amber-100 transition-all">
                    <h4 className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest">Skill Points</h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <Award className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">1,250 XP Earned</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">You're in top 10% 🚀</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learning activity' && (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="divide-y divide-slate-50">
                  {data.logs.length > 0 ? data.logs.map((act, i) => {
                    const { icon: Icon, color } = getActivityIcon(act.type);
                    return (
                      <div key={i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:border-primary-200 transition-all shadow-sm`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{act.action}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">
                              {new Date(act.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • 
                              {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-all group-hover:translate-x-1" />
                      </div>
                    );
                  }) : (
                    <div className="p-20 text-center">
                       <ActivityIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity recorded yet</p>
                    </div>
                  )}
                </div>
                {data.logs.length > 5 && (
                  <button className="w-full py-5 bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-primary-600 transition-all border-t border-slate-50">
                    Load More Activity
                  </button>
                )}
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Auto-Generated Attendance</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Status based on platform engagement</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">{data.attendancePercentage}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Overall (30D)</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {data.attendance.length > 0 ? data.attendance.map((day, i) => (
                    <div key={i} className="px-6 py-4.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${day.status === 'present' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                             {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{day.activity}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest border ${
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
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No records found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'test results' && (
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">Completed Quizzes & Test Results</h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Review your detailed performance analysis and reports.</p>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {testsLoading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loading results...</p>
                    </div>
                  ) : completedTests.length > 0 ? (
                    completedTests.map((t, i) => (
                      <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{t.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {t.course}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="flex items-center gap-4 text-left sm:text-right">
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Score</p>
                              <span className="text-sm font-bold text-slate-800">{t.score}<span className="text-slate-400 text-xs">/{t.totalMarks}</span></span>
                            </div>
                            <div className="h-6 w-[1px] bg-slate-200" />
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Grade</p>
                              <span className={`text-sm font-extrabold ${(t.score / t.totalMarks * 100) >= 85 ? 'text-emerald-600' : (t.score / t.totalMarks * 100) >= 65 ? 'text-amber-600' : 'text-rose-600'}`}>{t.grade || 'A'}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => navigate(`/dashboard/tests/${t.id}/take?view=result`)}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5 border border-slate-800"
                          >
                            <span>Report</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center">
                       <Award className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No completed test results found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Insights & Rules */}
          <div className="space-y-8">
            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Insights</h3>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">15% Increase</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">In study time this week</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Goal Reached</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Completed 3 key modules</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Engagement Rule</h3>
              <div className="bg-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50 group hover:scale-[1.02] transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
                      <Monitor className="w-5 h-5 text-white" />
                   </div>
                   <p className="text-sm font-bold leading-relaxed">
                    Perform any activity like <span className="text-indigo-200">Videos, PDF, or Tests</span> to automatically mark your attendance as <span className="text-emerald-300">Present</span> for the day.
                   </p>
                   <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-[0.2em]">Auto-Generation System</p>
                   </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
