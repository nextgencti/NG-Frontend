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

  return (
    <div className="space-y-4 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">My Tests</h2>
          <p className="text-[12px] text-slate-500">View upcoming quizzes and track your performance.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Tests', value: totalTests, icon: ClipboardList, color: 'text-primary-600 bg-primary-50' },
          { label: 'Upcoming', value: upcomingCount, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg. Score', value: `${avgScore}%`, icon: BarChart2, color: 'text-indigo-600 bg-indigo-50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg border border-slate-100 shadow-sm p-2.5 sm:p-3 flex items-center gap-2.5 hover:shadow-md transition-shadow">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-800 leading-none mb-0.5">{stat.value}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banners Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        
        {/* Best Score Banner */}
        {bestScore > 0 && (
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-[2rem] p-6 flex flex-col xl:flex-row items-center gap-4 xl:gap-6 shadow-xl shadow-primary-500/20 text-center xl:text-left h-full">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce">
              <Trophy className="w-9 h-9 text-yellow-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-center xl:justify-start gap-2 mb-1">
                <span className="px-2 py-0.5 bg-accent-400/30 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Outstanding</span>
                <TrendingUp className="w-3.5 h-3.5 text-accent-300" />
              </div>
              <p className="text-white font-black text-xl sm:text-2xl mt-1">Your Best Performance: {bestScore}%</p>
              <p className="text-white/70 text-sm font-medium mt-1">You're outperforming 85% of your batch.</p>
            </div>
            <button className="w-full xl:w-auto px-6 py-3 bg-white text-primary-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-lg shadow-white/10 active:scale-95 flex-shrink-0 mt-2 xl:mt-0">
              View Analytics
            </button>
          </div>
        )}

        {/* Tests List Section Banner */}
        <div className={`bg-gradient-to-r from-primary-600 to-primary-800 p-6 rounded-[2rem] relative overflow-hidden group shadow-lg shadow-primary-500/20 h-full flex flex-col justify-center ${bestScore > 0 ? '' : 'lg:col-span-2'}`}>
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-white mb-1.5 tracking-tight">Test Your Knowledge 🚀</h2>
              <p className="text-primary-100 text-sm leading-relaxed">
                Track your progress, challenge yourself, and see how much you've learned.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <div className="flex-1 xl:flex-none px-5 py-3 bg-white/95 rounded-xl border border-white shadow-xl shadow-black/5 backdrop-blur-md">
                <p className="text-[8px] font-black text-primary-600 uppercase tracking-[0.2em] mb-0.5">Avg Score</p>
                <p className="text-xl font-black text-slate-900 leading-none">{avgScore}%</p>
              </div>
              <div className="flex-1 xl:flex-none px-5 py-3 bg-white/95 rounded-xl border border-white shadow-xl shadow-black/5 backdrop-blur-md">
                <p className="text-[8px] font-black text-primary-600 uppercase tracking-[0.2em] mb-0.5">Best Perf</p>
                <p className="text-xl font-black text-slate-900 leading-none">{bestScore}%</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {tab}
                <span className={`px-1.5 py-0.5 rounded text-[8px] ${activeTab === tab ? 'bg-primary-50 text-primary-600' : 'bg-slate-200 text-slate-500'}`}>
                  {tab === 'Upcoming' ? upcomingCount : completedCount}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${
                  filterDifficulty === diff
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>
        {/* List Content */}
        <div className="p-4 sm:p-8 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
                <ClipboardList className="w-6 h-6 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Loading tests...</p>
            </div>
          ) : filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTests.map((test, index) => (
                <div 
                  key={index}
                  className="group relative p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500"
                >
                  <div className="flex flex-col gap-5">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] ${difficultyColors[test.difficulty] || 'bg-slate-800 text-slate-400'}`}>
                            {test.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] ${test.type === 'Practice' ? 'bg-primary-500/10 text-primary-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {test.type || 'Live'} Test
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/5 rounded-lg w-fit mt-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{test.course}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 group-hover:text-primary-600 transition-colors uppercase leading-tight line-clamp-1 mt-1">
                          {test.title}
                        </h4>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center group-hover:rotate-6 transition-all group-hover:border-primary-500/20 shadow-inner">
                        <ClipboardList className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        test.attemptsCount ? { icon: BookOpen, label: `${test.attemptsCount} Attempts`, sub: 'Attempt Status' } : null,
                        test.type === 'Live Test' || test.type === 'Fixed' ? { icon: Calendar, label: test.date, sub: 'Scheduled Date' } : null,
                        { icon: Clock, label: test.duration, sub: 'Duration' },
                        { icon: BarChart2, label: `${test.questions} Qs`, sub: 'Questions' },
                        { icon: Trophy, label: `${test.totalMarks} Marks`, sub: 'Max Points' }
                      ].filter(Boolean).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100 transition-colors group-hover:border-primary-100">
                          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary-600 transition-colors" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-slate-700 truncate uppercase tracking-tight">{item.label}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.sub}</span>
                          </div>
                        </div>
                      ))}
                    </div>                    {/* Footer / Actions */}
                    <div className="flex flex-wrap items-center justify-between pt-4 gap-4 border-t border-slate-100">
                      {test.attemptsCount > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="text-left hidden sm:block">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Grade</p>
                            <span className={`text-xl font-black leading-none ${gradeColor(test.score / test.totalMarks * 100)}`}>{test.grade || 'A'}</span>
                          </div>
                          <div className="h-7 w-[1px] bg-slate-100 hidden sm:block" />
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Score</p>
                            <span className="text-base leading-none font-black text-slate-900">{test.score || 0}<span className="text-slate-400 text-xs font-bold">/{test.totalMarks}</span></span>
                          </div>
                        </div>
                      ) : test.type === 'Practice' ? (
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Access</p>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Anytime</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Start Time</p>
                            <span className="text-xs font-bold text-slate-800 tracking-wide">{test.time}</span>
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          if (test.status === 'published') {
                            navigate(`/dashboard/tests/${test.id}/take`);
                          }
                        }}
                        disabled={test.status !== 'published'}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 whitespace-nowrap ${
                        test.status === 'completed' 
                          ? 'bg-slate-800 text-white hover:bg-slate-900 w-full sm:w-auto' 
                          : test.status === 'published'
                            ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/30 w-full sm:w-auto'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed w-full sm:w-auto'
                      }`}>
                        {test.status === 'completed' ? (
                          <><TrendingUp className="w-4 h-4" />View Result</>
                        ) : test.status === 'published' ? (
                          <><CheckCircle2 className="w-4 h-4" />
                            {test.attemptsCount > 0 ? 'Retake Test' : 'Start Test'}
                          </>
                        ) : (
                          <><Lock className="w-4 h-4" />Upcoming</>
                        )}
                        {test.status !== 'completed' && <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${test.status === 'published' ? 'text-primary-100' : 'text-slate-600'}`} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <ClipboardList className="w-24 h-24 text-slate-800 relative" />
              </div>
              <div className="space-y-2 relative">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">Clear For Now</h3>
                <p className="text-slate-500 font-medium text-xs max-w-xs mx-auto">There are no {activeTab.toLowerCase()} tests found matching your current filters.</p>
              </div>
              <button 
                onClick={() => { setFilterDifficulty('All'); setActiveTab('Upcoming'); }}
                className="px-8 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
    </div>
  );
}

