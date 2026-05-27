import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Clock, CheckCircle2, Trophy, 
  Search, Filter, Calendar, BarChart2, ChevronRight,
  TrendingUp, Star, Loader2, Lock, AlertCircle, BookOpen
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const difficultyColors = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-rose-100 text-rose-700'
};

const gradeColor = (pct) => {
  if (pct >= 85) return 'text-emerald-600';
  if (pct >= 65) return 'text-amber-600';
  return 'text-rose-600';
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
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-neue-machina-medium uppercase">My Tests</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide mt-0.5">View upcoming quizzes and track your academic progress.</p>
        </div>
      </div>

      {/* Stats Row (Tactile Premium Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {[
          { label: 'Total Tests', value: totalTests, icon: ClipboardList, color: 'text-[#4F46E5] bg-[#EEF2FF] border-[#E0E7FF]' },
          { label: 'Upcoming', value: upcomingCount, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: BarChart2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label} 
              className="bg-gradient-to-b from-white to-[#F8FAFC] rounded-2xl border border-[#E2E8F0] shadow-sm p-4 px-4.5 flex items-center gap-3.5 hover:border-indigo-300 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-300 group-hover:scale-105 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2.5xl font-extrabold text-slate-900 leading-none mb-1 font-neue-machina-medium tracking-tight">{stat.value}</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Insights Banner - Luxury Dark Theme */}
      {bestScore > 0 && (
        <div className="bg-gradient-to-br from-[#0B0F19] via-[#151D35] to-[#0F172A] rounded-2.5xl p-5 sm:p-6 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_25px_60px_rgba(79,70,229,0.18)] hover:border-slate-700 animate-in slide-in-from-top-4 duration-500">
          {/* Glowing Ambient Mesh */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

          {/* Top Row - Badge + Button */}
          <div className="flex items-center justify-between gap-4 relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] group-hover:scale-105 transition-transform duration-300">
                <Trophy className="w-5 h-5 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-[13px] font-medium tracking-tight">Outstanding Performance</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-slate-400 text-[11px] font-normal leading-relaxed mt-0.5">Outperforming <span className="text-emerald-400 font-medium">85%</span> of your cohort</p>
              </div>
            </div>

            <button 
              onClick={handleViewBestReport}
              className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-full text-[10px] font-medium uppercase tracking-widest hover:shadow-lg transition-all duration-300 active:scale-95 shrink-0 cursor-pointer items-center gap-1.5 relative z-10 border border-white/10"
            >
              <span>Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Score Cards Row */}
          <div className="grid grid-cols-2 gap-3 relative z-10">
            <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-xl px-4 py-3.5 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Best Score</span>
              <span className="text-[22px] font-semibold text-amber-400 tracking-tight leading-none">{bestScore}<span className="text-[14px] text-amber-400/60 ml-0.5">%</span></span>
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] backdrop-blur-md rounded-xl px-4 py-3.5 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Avg Score</span>
              <span className="text-[22px] font-semibold text-indigo-300 tracking-tight leading-none">{avgScore}<span className="text-[14px] text-indigo-300/60 ml-0.5">%</span></span>
            </div>
          </div>

          {/* Mobile Analytics Button */}
          <button 
            onClick={handleViewBestReport}
            className="sm:hidden w-full mt-3 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-full text-[10px] font-medium uppercase tracking-widest transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 relative z-10 border border-white/10"
          >
            <span>View Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Tabs Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-fit backdrop-blur-sm">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4.5 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {tab}
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition-colors duration-300 ${
                  activeTab === tab ? 'bg-indigo-50 text-indigo-650' : 'bg-slate-200 text-slate-500'
                }`}>
                  {tab === 'Upcoming' ? upcomingCount : completedCount}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 w-fit">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
                  filterDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="py-1 min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <ClipboardList className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest animate-pulse">Loading tests...</p>
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {filteredTests.map((test, index) => (
              <div 
                key={index}
                className="group relative p-4.5 bg-gradient-to-b from-white to-[#F8FAFC] rounded-2.5xl border border-[#E2E8F0] hover:border-indigo-300 hover:shadow-[0_15px_30px_rgba(79,70,229,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Visual Glow Indicator */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          test.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          test.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {test.difficulty}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          test.type === 'Practice' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' : 'bg-rose-50 text-rose-600 border border-rose-100/50'
                        }`}>
                          {test.type || 'Live'} Test
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest truncate">{test.course}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-650 font-neue-machina-medium transition-colors uppercase leading-snug line-clamp-1 mt-1">
                        {test.title}
                      </h4>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform shadow-sm">
                      <ClipboardList className="w-5 h-5 text-indigo-500" />
                    </div>
                  </div>

                  {/* Stats Cards inside (Tactile Grid) */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      test.attemptsCount ? { icon: BookOpen, label: `${test.attemptsCount} Attempts`, sub: 'Attempt Status' } : null,
                      test.type === 'Live Test' || test.type === 'Fixed' ? { icon: Calendar, label: test.date, sub: 'Scheduled Date' } : null,
                      { icon: Clock, label: test.duration, sub: 'Duration' },
                      { icon: BarChart2, label: `${test.questions} Qs`, sub: 'Questions' },
                      { icon: Trophy, label: `${test.totalMarks} Marks`, sub: 'Max Points' }
                    ].filter(Boolean).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/70 p-2 rounded-xl border border-slate-200/50 transition-all group-hover:border-indigo-100 shadow-inner">
                        <div className="w-6.5 h-6.5 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm">
                          <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-extrabold text-slate-700 truncate uppercase tracking-tight leading-none mb-0.5">{item.label}</span>
                          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest truncate leading-none">{item.sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer / Actions */}
                  <div className="flex flex-wrap items-center justify-between pt-3.5 gap-2 border-t border-slate-100">
                    {test.attemptsCount > 0 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="text-left">
                          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Grade</p>
                          <span className={`text-base font-extrabold leading-none ${gradeColor(test.score / test.totalMarks * 100)}`}>{test.grade || 'A'}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200" />
                        <div>
                          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Score</p>
                          <span className="text-xs leading-none font-extrabold text-slate-900">{test.score || 0}<span className="text-slate-400 text-[10px] font-bold">/{test.totalMarks}</span></span>
                        </div>
                      </div>
                    ) : test.type === 'Practice' ? (
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Access</p>
                          <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">Anytime</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                          <Clock className="w-3.5 h-3.5 text-amber-650" />
                        </div>
                        <div>
                          <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Start Time</p>
                          <span className="text-[9px] font-bold text-slate-700 tracking-wide font-neue-machina-medium">{test.time}</span>
                        </div>
                      </div>
                    )}
                    {test.attemptsCount > 0 ? (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                          onClick={() => navigate(`/dashboard/tests/${test.id}/take?view=result`)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer bg-slate-950 text-white hover:bg-slate-900 hover:shadow-md hover:shadow-slate-950/15 border border-slate-800"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          View Result
                        </button>
                        {test.status === 'published' && (
                          <button 
                            onClick={() => navigate(`/dashboard/tests/${test.id}/take`)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200/60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                            Retake Test
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
                        className={`flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer ${
                          test.status === 'published'
                            ? 'bg-gradient-to-r from-indigo-650 to-[#4F46E5] text-white hover:from-indigo-700 hover:to-[#4F46E5] shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 w-full sm:w-auto'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed w-full sm:w-auto shadow-none'
                        }`}
                      >
                        {test.status === 'published' ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" />Start Test</>
                        ) : (
                          <><Lock className="w-3.5 h-3.5" />Upcoming</>
                        )}
                        {test.status === 'published' && <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 text-indigo-100" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2.5xl border border-[#E2E8F0] shadow-soft py-14 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl border border-indigo-100/50 flex items-center justify-center shrink-0 shadow-inner mb-3">
              <ClipboardList className="w-5.5 h-5.5 text-[#4F46E5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-neue-machina-medium">No Tests Available</h3>
              <p className="text-slate-400 font-semibold text-[10px] leading-relaxed max-w-[240px] mx-auto">There are no {activeTab.toLowerCase()} tests found matching your selected filters.</p>
            </div>
            <button 
              onClick={() => { setFilterDifficulty('All'); setActiveTab('Upcoming'); }}
              className="px-4.5 py-2 bg-slate-950 hover:bg-slate-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer mt-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

