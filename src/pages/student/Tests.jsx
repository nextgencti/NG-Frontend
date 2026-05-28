import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Clock, CheckCircle2, Trophy, 
  Search, Filter, Calendar, BarChart2, ChevronRight,
  TrendingUp, Star, Loader2, Lock, AlertCircle, BookOpen, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const difficultyColors = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  Hard: 'bg-rose-50 text-rose-700 border-rose-100'
};

const gradeColor = (pct) => {
  if (pct >= 85) return 'text-emerald-600';
  if (pct >= 65) return 'text-amber-600';
  return 'text-rose-600';
};

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

export default function Tests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/student/tests');
      if (response.data.success) {
        setTests(response.data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = ['Upcoming', 'Completed'];

  const filteredTests = tests.filter(test => {
    const isCompleted = test.hasAttempts || test.status === 'completed';
    const matchTab = activeTab === 'Upcoming' ? !isCompleted : isCompleted;
    const matchDifficulty = filterDifficulty === 'All' || test.difficulty === filterDifficulty;
    return matchTab && matchDifficulty;
  });

  // Calculate Stats
  const totalTests = tests.length;
  const upcomingCount = tests.filter(t => !t.hasAttempts && t.status !== 'completed').length;
  const completedCount = tests.filter(t => t.hasAttempts || t.status === 'completed').length;
  
  const completedTestsData = tests.filter(t => (t.hasAttempts || t.status === 'completed') && t.score !== undefined);
  const avgScore = completedTestsData.length > 0
    ? Math.round(completedTestsData.reduce((acc, curr) => acc + (curr.score / curr.totalMarks * 100), 0) / completedTestsData.length)
    : 0;
  
  const bestScore = completedTestsData.length > 0
    ? Math.max(...completedTestsData.map(t => Math.round(t.score / t.totalMarks * 100)))
    : 0;

  const handleViewBestReport = () => {
    if (completedTestsData.length > 0) {
      const bestTest = completedTestsData.reduce((prev, current) => {
        const prevPct = prev.score / prev.totalMarks;
        const currentPct = current.score / current.totalMarks;
        return (currentPct > prevPct) ? current : prev;
      });
      navigate(`/dashboard/tests/${bestTest.id}/take?view=result`);
    } else {
      navigate('/dashboard/activity?tab=results');
    }
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
              <ClipboardList className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.18em]">Exam Center</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Assessments</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Complete active tests, review scores, and analyze cohort diagnostics.
          </p>
        </div>
      </motion.div>

      {/* Stats Row (Bento Tactile Blocks) */}
      <motion.div variants={cardVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Tests', value: totalTests, icon: ClipboardList, color: 'text-primary-600 bg-primary-50 border-primary-100/50' },
          { label: 'Upcoming', value: upcomingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100/50' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50' },
          { label: 'Average Score', value: `${avgScore}%`, icon: BarChart2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100/50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i} 
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${stat.color}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{stat.value}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dynamic Performance Insights Banner */}
      {bestScore > 0 && (
        <motion.div 
          variants={cardVariants}
          className="bg-slate-900 rounded-[32px] p-6 border border-slate-800 shadow-[0_16px_36px_rgba(0,0,0,0.03)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_24px_48px_rgba(79,70,229,0.12)] hover:border-slate-700"
        >
          {/* Glowing Ambient Mesh */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-tr from-primary-500/10 to-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.1] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)] animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-black uppercase tracking-wider">Top-Tier Performance</span>
                  <div className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Top 15%
                  </div>
                </div>
                <p className="text-slate-400 text-[11px]">Keep pushing! You are matching standard criteria of top scholars.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex gap-3">
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3 flex flex-col items-center">
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Best Score</span>
                  <span className="text-lg font-black text-amber-400 mt-0.5">{bestScore}%</span>
                </div>
                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl px-5 py-3 flex flex-col items-center">
                  <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Avg Score</span>
                  <span className="text-lg font-black text-indigo-300 mt-0.5">{avgScore}%</span>
                </div>
              </div>

              <button 
                onClick={handleViewBestReport}
                className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              >
                Analytics
                <ChevronRight className="w-4 h-4 text-primary-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters & Segmented Tab Bars */}
      <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 w-fit backdrop-blur-sm gap-0.5 select-none relative">
          {tabs.map(tab => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer focus:outline-none focus:ring-0 select-none z-10 active:scale-95 duration-200"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTestsTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.08)] border border-slate-100/50"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-20 flex items-center gap-2">
                  <span className={`transition-colors duration-200 ${
                    isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-700'
                  }`}>
                    {tab}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black transition-colors duration-300 ${
                    isActive ? 'bg-primary-50 text-primary-650' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {tab === 'Upcoming' ? upcomingCount : completedCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 w-fit">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-4.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  filterDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-250/20'
                    : 'text-slate-450 hover:text-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tests Grid Area */}
      <div className="py-2 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 border-4 border-primary-100 rounded-full"></div>
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Assembling Tests List…</p>
          </div>
        ) : filteredTests.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredTests.map((test, index) => (
                <motion.div 
                  key={test.id || index}
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="group relative p-6 bg-white rounded-[28px] border border-slate-100 hover:shadow-[0_20px_40px_rgba(79,70,229,0.05)] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Subtle Grid Accent */}
                  <div className="absolute inset-0 bg-dot-pattern opacity-[0.2] pointer-events-none"></div>

                  <div className="space-y-5 relative z-10">
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 border ${
                            test.difficulty === 'Easy' ? difficultyColors.Easy :
                            test.difficulty === 'Medium' ? difficultyColors.Medium :
                            difficultyColors.Hard
                          }`}>
                            {test.difficulty}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shrink-0 border ${
                            test.type === 'Practice' ? 'bg-indigo-50 text-indigo-600 border-indigo-100/50' : 'bg-rose-50 text-rose-600 border-rose-100/50 animate-pulse'
                          }`}>
                            {test.type || 'Assessment'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 pt-1 min-w-0">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{test.course || 'CCC Class'}</span>
                        </div>
                        <h4 className="text-base font-black text-slate-800 group-hover:text-primary-600 transition-colors uppercase leading-snug line-clamp-1">
                          {test.title}
                        </h4>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform shadow-inner">
                        <ClipboardList className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </div>

                    {/* Stats capsule grids */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        test.attemptsCount ? { icon: BookOpen, label: `${test.attemptsCount} Attempts`, sub: 'Attempt Status' } : null,
                        test.type === 'Live Test' || test.type === 'Fixed' ? { icon: Calendar, label: test.date, sub: 'Date' } : null,
                        { icon: Clock, label: test.duration, sub: 'Duration' },
                        { icon: BarChart2, label: `${test.questions} Qs`, sub: 'Questions' },
                        { icon: Trophy, label: `${test.totalMarks} Marks`, sub: 'Max Score' }
                      ].filter(Boolean).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors duration-250">
                          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                            <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-550" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[9px] font-black text-slate-800 truncate uppercase leading-none mb-0.5">{item.label}</span>
                            <span className="block text-[7.5px] font-bold text-slate-400 uppercase tracking-widest leading-none">{item.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Action items */}
                  <div className="flex flex-wrap items-center justify-between pt-5 mt-5 border-t border-slate-50 gap-4 relative z-10">
                    {test.attemptsCount > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Grade</p>
                          <span className={`text-sm font-black leading-none uppercase ${gradeColor(test.score / test.totalMarks * 100)}`}>{test.grade || 'A'}</span>
                        </div>
                        <div className="h-6 w-px bg-slate-100" />
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Score</p>
                          <span className="text-xs leading-none font-black text-slate-800">{test.score}<span className="text-slate-400 text-[10px] font-bold">/{test.totalMarks}</span></span>
                        </div>
                      </div>
                    ) : test.type === 'Practice' ? (
                      <div className="flex flex-col text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Accessibility</p>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50 shadow-inner">UNLOCKED</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                          <Clock className="w-3.5 h-3.5 text-amber-550" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Start Time</p>
                          <span className="text-[9px] font-bold text-slate-700 tracking-wide">{test.time || 'Schedule TBA'}</span>
                        </div>
                      </div>
                    )}

                    {test.attemptsCount > 0 ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => navigate(`/dashboard/tests/${test.id}/take?view=result`)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-white/80" />
                          View Result
                        </button>
                        {test.status === 'published' && (
                          <button 
                            onClick={() => navigate(`/dashboard/tests/${test.id}/take`)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer shrink-0"
                          >
                            Retake
                          </button>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          if (test.status === 'published') {
                            navigate(`/dashboard/tests/${test.id}/take`);
                          }
                        }}
                        disabled={test.status !== 'published'}
                        className={`flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.16em] transition-all shadow-sm active:scale-95 w-full sm:w-auto cursor-pointer ${
                          test.status === 'published'
                            ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100/50 shadow-none'
                        }`}
                      >
                        {test.status === 'published' ? (
                          <>Start Test <ChevronRight className="w-3.5 h-3.5 text-white/80" /></>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" />Locked</>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.01)] py-16 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shrink-0 mb-4 shadow-inner">
              <ClipboardList className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1.5">No Tests Available</h3>
            <p className="text-slate-400 font-medium text-xs leading-relaxed max-w-[260px] mx-auto">There are no {activeTab.toLowerCase()} tests configured for this difficulty category.</p>
            <button 
              onClick={() => { setFilterDifficulty('All'); setActiveTab('Upcoming'); }}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer mt-6 shadow-md hover:shadow-lg"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
