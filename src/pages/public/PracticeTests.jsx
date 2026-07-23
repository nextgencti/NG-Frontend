import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Zap, Trophy, Clock, ClipboardList, Award, ArrowLeft, Search, Star } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api';

export default function PracticeTests() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [publicTests, setPublicTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchPublicTests();
  }, []);

  const fetchPublicTests = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/public/tests`);
      if (res.data.success) {
        setPublicTests(res.data.tests || []);
      }
    } catch (err) {
      console.error("Failed to fetch public tests", err);
      setPublicTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedAndFilteredTests = () => {
    let result = publicTests.filter(test => {
      const matchesDifficulty = selectedDifficulty === 'All' || test.difficulty === selectedDifficulty;
      const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (test.course && test.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (Array.isArray(test.courses) && test.courses.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesDifficulty && matchesSearch;
    });

    const getTestTime = (t) => {
      if (t.createdAt) {
        if (t.createdAt._seconds) return t.createdAt._seconds * 1000;
        if (t.createdAt.seconds) return t.createdAt.seconds * 1000;
        return new Date(t.createdAt).getTime();
      }
      return t.date ? new Date(t.date).getTime() : 0;
    };

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return getTestTime(b) - getTestTime(a);
        case 'oldest':
          return getTestTime(a) - getTestTime(b);
        case 'questions_desc':
          return (Number(b.questions) || 0) - (Number(a.questions) || 0);
        case 'questions_asc':
          return (Number(a.questions) || 0) - (Number(b.questions) || 0);
        case 'marks_desc':
          return (Number(b.totalMarks) || 0) - (Number(a.totalMarks) || 0);
        case 'duration_desc':
          const durA = parseInt(a.duration) || 0;
          const durB = parseInt(b.duration) || 0;
          return durB - durA;
        default:
          return 0;
      }
    });
  };

  const filteredTests = getSortedAndFilteredTests();

  const isNewTest = (createdAt, dateStr) => {
    let createdDate;
    if (createdAt) {
      if (createdAt._seconds) {
        createdDate = new Date(createdAt._seconds * 1000);
      } else if (createdAt.seconds) {
        createdDate = new Date(createdAt.seconds * 1000);
      } else {
        createdDate = new Date(createdAt);
      }
    } else if (dateStr) {
      createdDate = new Date(dateStr);
    } else {
      return false;
    }
    if (isNaN(createdDate.getTime())) return false;
    const diffTime = Math.abs(new Date() - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 10;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C20] via-[#151230] to-[#1E1B4B] overflow-hidden relative selection:bg-indigo-500/10 text-white">
      
      {/* Ambient decorative light orbs inside dark page */}
      <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/80 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <Logo className="w-8 h-8" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-5">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>Free & Open for Everyone</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-none">
            All Practice <span className="text-indigo-400">Tests</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Test your knowledge with our free practice assessments. No login required — just choose any test, enter your name and start instantly!
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-[#0F0C20]/50 backdrop-blur-xl border border-indigo-500/10 rounded-3xl p-5 shadow-2xl shadow-indigo-950/50 mb-12 flex flex-col md:flex-row items-center justify-between gap-5 text-left">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests (e.g. MS Word, Operating System)..."
              className="w-full bg-[#1A1635]/60 border border-indigo-500/15 focus:border-indigo-500/40 text-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Difficulty Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="flex flex-wrap gap-2">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#1A1635]/40 hover:bg-[#1A1635]/80 border border-indigo-500/10 text-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#1A1635]/60 border border-indigo-500/15 text-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-indigo-500/40 cursor-pointer"
              >
                <option value="newest" className="bg-[#0F0C20]">Newest First</option>
                <option value="oldest" className="bg-[#0F0C20]">Oldest First</option>
                <option value="questions_desc" className="bg-[#0F0C20]">Questions (High to Low)</option>
                <option value="questions_asc" className="bg-[#0F0C20]">Questions (Low to High)</option>
                <option value="marks_desc" className="bg-[#0F0C20]">Total Marks</option>
                <option value="duration_desc" className="bg-[#0F0C20]">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-950 border-t-indigo-500 animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-450 animate-pulse">Loading assessments...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] bg-[#0F0C20]/45 border border-indigo-500/10 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
              <ClipboardList className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Practice Tests Found</h3>
            <p className="text-xs text-slate-450 max-w-sm leading-relaxed">
              We couldn't find any test matching your search criteria. Try using different keywords or filter values.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTests.map((test) => {
              const testCoursesList = Array.isArray(test.courses) && test.courses.length > 0 
                ? test.courses.join(', ') 
                : test.course || 'CCC Class';

              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="relative group h-full hover:-translate-y-2 transition-all duration-500 isolate"
                >
                  {/* Glowing background light effect behind the card */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-15 group-hover:opacity-65 group-hover:blur-3xl group-hover:scale-[1.05] transition-all duration-500 -z-10" />
                  
                  {/* Card container */}
                  <div className="bg-[#0F0C20]/60 group-hover:bg-[#0F0C20]/80 backdrop-blur-xl rounded-2xl border border-indigo-500/15 group-hover:border-indigo-500/40 shadow-2xl shadow-indigo-950/50 group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.35)] transition-all duration-500 flex flex-col h-full overflow-hidden relative">
                    {/* Always visible base top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
                    
                    {/* Hover state gradient top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
                    
                    {isNewTest(test.createdAt, test.date) && (
                      <span className="absolute top-[32px] right-[70px] z-30 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-lg shadow-rose-500/35 border border-rose-400/20 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        New
                      </span>
                    )}

                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              test.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              test.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {test.difficulty}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 min-w-0 pt-0.5">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest truncate max-w-[150px]" title={testCoursesList}>
                              {testCoursesList}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-white leading-snug group-hover:text-indigo-300 transition-colors duration-300 line-clamp-2">
                            {test.title}
                          </h3>
                        </div>
                        <div className="w-9 h-9 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
                          <ClipboardList className="w-4 h-4 text-indigo-400" />
                        </div>
                      </div>

                      {test.description && (
                        <p className="text-[11px] text-slate-400 mb-4 line-clamp-2 leading-relaxed">{test.description}</p>
                      )}

                      <div className="flex flex-col gap-2.5 mb-5 mt-auto pt-4 border-t border-indigo-950/40 border-dashed">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-355 font-bold">
                            <div className="w-6 h-6 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                              <ClipboardList className="w-3 h-3 text-indigo-400" />
                            </div>
                            <span>Questions</span>
                          </div>
                          <span className="font-extrabold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 text-[10px]">{test.questions}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-355 font-bold">
                            <div className="w-6 h-6 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-100/20">
                              <Clock className="w-3 h-3 text-amber-400" />
                            </div>
                            <span>Duration</span>
                          </div>
                          <span className="font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[10px]">{test.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-355 font-bold">
                            <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-100/20">
                              <Award className="w-3 h-3 text-emerald-400" />
                            </div>
                            <span>Total Marks</span>
                          </div>
                          <span className="font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px]">{test.totalMarks}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/tests/public/${test.id}`)}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-xs transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 group/btn cursor-pointer"
                      >
                        Start Free Test <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
