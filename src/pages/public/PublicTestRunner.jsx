import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, User, Phone, Mail, ArrowRight, Trophy, Medal, Award, Sun, Moon, Maximize, Minimize } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api';

export default function PublicTestRunner() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // States
  const [stage, setStage] = useState('register'); // register | test | result
  const [participant, setParticipant] = useState({ name: '', contact: '' });
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    try {
      if (!document.fullscreenElement) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen().then(() => setIsFullScreen(true)).catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => setIsFullScreen(false));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Timer
  useEffect(() => {
    if (stage !== 'test' || timeLeft === null || timeLeft <= 0) return;
    if (timeLeft <= 0) { handleAutoSubmit(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, stage]);

  useEffect(() => {
    if (timeLeft === 0 && stage === 'test') handleAutoSubmit();
  }, [timeLeft]);

  const fetchTest = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/public/tests/${testId}`);
      if (res.data.success) {
        setTest(res.data.test);
        setQuestions(res.data.questions);
        const minutes = parseInt(res.data.test.duration?.replace(/[^0-9]/g, '')) || 30;
        setTimeLeft(minutes * 60);
        setStage('test');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load test');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const name = participant.name.trim();
    const contact = participant.contact.trim();

    if (!name) return toast.error('Please enter your full name');
    if (!contact) return toast.error('Please enter your Mobile or Email');

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    const isEmail = emailRegex.test(contact);
    const isMobile = mobileRegex.test(contact);

    if (!isEmail && !isMobile) {
      return toast.error('Please enter a valid 10-digit Mobile Number or Email Address');
    }

    fetchTest();
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers({ ...answers, [questionId]: optionKey });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitTest = async () => {
    const toastId = toast.loading('Submitting your test...');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/public/tests/${testId}/submit`, {
        answers,
        participant
      });
      if (res.data.success) {
        toast.success('Test submitted successfully!', { id: toastId });
        setResult(res.data.result);
        setStage('result');
        fetchLeaderboard();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit test', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/tests/${testId}/leaderboard`);
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) { /* silent fail */ }
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-rose-500/10' : 'bg-rose-50'} flex items-center justify-center flex-shrink-0`}>
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Final Submission</p>
            {unansweredCount > 0 ? (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                {unansweredCount} Questions Unanswered
              </p>
            ) : (
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                All Questions Attempted
              </p>
            )}
          </div>
        </div>
        
        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Are you sure you want to end the test? You won't be able to change your answers after this.
        </p>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Go Back
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              submitTest();
            }}
            className="px-6 py-2 text-[10px] font-black bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20 active:scale-95 transition-all uppercase tracking-widest"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-center',
      style: {
        borderRadius: '1.5rem',
        padding: '1.25rem',
        border: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }
    });
  };

  const handleAutoSubmit = () => {
    toast.error("Time's up! Auto-submitting...", { duration: 4000 });
    submitTest();
  };

  if (stage === 'register') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
        <Toaster position="top-right" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-primary-600 transition-all font-black text-[10px] uppercase tracking-widest group"
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-primary-200 group-hover:bg-primary-50 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          Back to Home
        </button>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Public Practice Test</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your details to start the test</p>
          </div>

          <form onSubmit={handleRegister} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={participant.name}
                  onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile / Email</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={participant.contact}
                  onChange={(e) => setParticipant({ ...participant, contact: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="e.g. 9876543210 or email@gmail.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Start Test <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Your details are only used for the leaderboard. We respect your privacy.
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ─── TEST TAKING SCREEN ───────────────────────────────────────────────────────
  if (stage === 'test') {
    const currentQuestion = questions[currentQuestionIndex];
    const theme = {
      bg: isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900',
      card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm',
      header: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200',
      textMain: isDarkMode ? 'text-slate-100' : 'text-slate-800',
      textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
      btnGhost: isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100',
      option: isDarkMode ? 'border-slate-800 hover:border-slate-700 bg-slate-900/50' : 'border-slate-100 hover:border-slate-200 bg-white',
      navBtn: isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-700 border border-slate-200 hover:border-primary-300 hover:bg-primary-50',
    };

    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme.bg}`}>
        <Toaster position="top-right" />
        {/* Header */}
        <header className={`${theme.header} border-b sticky top-0 z-50 backdrop-blur-md`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Participant & Test Info */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="overflow-hidden">
                <h1 className={`text-sm font-black truncate ${theme.textMain}`}>{participant.name}</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                  {test?.title} • {test?.course}
                </p>
              </div>
            </div>

            {/* Right: Controls & Timer */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Toggles */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-all ${theme.btnGhost}`}
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleFullScreen}
                  className={`p-2 rounded-lg transition-all ${theme.btnGhost}`}
                  title="Toggle Fullscreen"
                >
                  {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

              {/* Timer */}
              <div className={`flex flex-col items-end ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : theme.textMain}`}>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Remaining</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 opacity-50" />
                  <span className="text-lg font-black font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                </div>
              </div>

              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="hidden sm:block px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 px-4 lg:px-8 py-8">
          {/* Question Navigator */}
          <div className="hidden lg:block w-56 xl:w-64 shrink-0">
            <div className={`${theme.card} rounded-2xl border sticky top-28`}>
              <div className="flex items-center justify-between px-4 py-3 bg-[#4f46e5] rounded-t-2xl">
                <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/80">Question Matrix</h3>
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[11px] font-extrabold text-white">
                  {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              <div className="px-3 py-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                <div className={`grid gap-1.5 ${questions.length > 50 ? 'grid-cols-6' : 'grid-cols-5'}`}>
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`aspect-square rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                          questions.length > 50 ? 'text-[9px]' : 'text-[10px]'
                        } ${
                          isCurrent
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 ring-2 ring-primary-600 ring-offset-2'
                            : isAnswered
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : theme.navBtn
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-600 flex-shrink-0"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                  <span>Unattempted</span>
                </div>
              </div>
            </div>
            <style>{`
              .scrollbar-thin::-webkit-scrollbar { width: 4px; }
              .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
              .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 99px; }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
              .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
            `}</style>
          </div>

          {/* Question Area */}
          <div className="flex-1 space-y-6">
            <div className={`${theme.card} rounded-3xl border overflow-hidden`}>
              <div className="px-6 py-4 border-b border-primary-500/10 dark:border-primary-500/30 bg-primary-50/50 dark:bg-transparent flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-white dark:bg-primary-600 dark:text-white px-3 py-1 rounded-full border border-primary-100 dark:border-primary-400/30 shadow-sm">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <div className="h-4 w-px bg-primary-200 dark:bg-primary-500/30"></div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-primary-400' : 'text-primary-500/70'}`}>
                    {currentQuestion?.marks} Point{currentQuestion?.marks > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <h2 className={`text-lg lg:text-xl font-black leading-snug mb-8 ${theme.textMain}`}>
                  {currentQuestion?.question}
                </h2>
                
                <div className="grid grid-cols-1 gap-3">
                  {['A', 'B', 'C', 'D'].map(optKey => {
                    const optionText = currentQuestion?.options?.[optKey];
                    if (!optionText) return null;
                    const isSelected = answers[currentQuestion.id] === optKey;
                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                        className={`group w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50/80 dark:bg-primary-500/20 ring-1 ring-primary-500/30 shadow-lg shadow-primary-500/10'
                            : `${theme.option}`
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-black text-sm transition-all duration-300 ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/40'
                            : `${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'} group-hover:bg-primary-50 group-hover:text-primary-600`
                        }`}>
                          {optKey}
                        </div>
                        <span className={`text-sm font-bold flex-1 ${isSelected ? 'text-primary-600 dark:text-primary-400' : theme.textMain}`}>
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-primary-500/10 dark:border-primary-500/30 bg-primary-50/50 dark:bg-transparent flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-20 ${theme.btnGhost}`}
                >
                  <ChevronLeft className="w-5 h-5" /> Previous
                </button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-600/20 hover:-translate-y-0.5 active:scale-95"
                  >
                    Submit Test <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className="px-10 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95"
                  >
                    Next <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Navigator */}
            <div className="lg:hidden">
              <div className={`${theme.card} p-4 rounded-3xl overflow-x-auto border`}>
                <div className="flex gap-2 w-max">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-11 h-11 flex-shrink-0 rounded-xl font-black text-xs flex items-center justify-center transition-all ${
                        idx === currentQuestionIndex
                          ? 'bg-primary-600 text-white shadow-xl'
                          : answers[q.id]
                            ? 'bg-emerald-500 text-white shadow-md'
                            : theme.navBtn
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Finish Button */}
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className="sm:hidden w-full py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-600/20 active:scale-95"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test Now'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ─── RESULT SCREEN ────────────────────────────────────────────────────────────
  if (stage === 'result' && result) {
    const theme = {
      bg: isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900',
      card: isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-lg',
      textMain: isDarkMode ? 'text-slate-100' : 'text-slate-900',
      textSub: isDarkMode ? 'text-slate-400' : 'text-slate-500',
      innerCard: isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100',
    };

    const getRankIcon = (rank) => {
      if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
      if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
      if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
      return <span className="text-xs font-bold text-slate-400">#{rank}</span>;
    };

    return (
      <div className={`min-h-screen transition-colors duration-300 ${theme.bg} py-8 px-4`}>
        <Toaster position="top-right" />
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Theme Toggle in Result Page too */}
          <div className="flex justify-end mb-2">
             <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
          </div>

          {/* Score Card */}
          <div className={`${theme.card} rounded-[2.5rem] p-8 text-center space-y-6`}>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-black ${theme.textMain}`}>Test Completed!</h2>
              <p className={`text-sm ${theme.textSub}`}>Great job, {participant.name}! Here's your performance.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className={`${theme.innerCard} p-4 rounded-2xl`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-black text-primary-600">{result.score}<span className="text-sm text-slate-400">/{result.totalMarks}</span></p>
              </div>
              <div className={`${theme.innerCard} p-4 rounded-2xl`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Percentage</p>
                <p className={`text-2xl font-black ${theme.textMain}`}>{result.percentage.toFixed(1)}%</p>
              </div>
              <div className={`${theme.innerCard} p-4 rounded-2xl`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Grade</p>
                <p className={`text-2xl font-black ${result.percentage >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.grade}</p>
              </div>
            </div>
            <div className="bg-slate-200 h-3 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${result.percentage >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${result.percentage}%` }}
              />
            </div>
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className={`${theme.card} rounded-[2.5rem] p-8`}>
              <h3 className={`text-lg font-black mb-6 flex items-center gap-3 ${theme.textMain}`}>
                <Trophy className="w-6 h-6 text-amber-500" />
                Public Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      entry.name === participant.name
                        ? 'bg-primary-500/10 border-primary-500'
                        : theme.innerCard
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border border-slate-200/10 shadow-sm`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${theme.textMain}`}>{entry.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grade: {entry.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary-600">{entry.percentage}%</p>
                      <p className="text-[10px] font-bold text-slate-400">{entry.score}/{entry.totalMarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Report */}
          <div className={`${theme.card} rounded-[2.5rem] p-8 space-y-6`}>
            <h3 className={`text-lg font-black ${theme.textMain}`}>Detailed Analysis</h3>
            {result.detailedReport?.map((item, index) => (
              <div key={item.questionId} className={`p-6 rounded-2xl border-2 transition-all ${
                item.isCorrect 
                  ? 'border-emerald-500/20 bg-emerald-500/5' 
                  : 'border-rose-500/20 bg-rose-500/5'
              }`}>
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm ${
                    item.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <h4 className={`text-base font-bold leading-relaxed ${theme.textMain}`}>{item.question}</h4>
                </div>
                <div className="space-y-3 pl-12">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    if (!item.options[opt]) return null;
                    const isSelected = item.studentAnswer === opt;
                    const isCorrectOption = item.correctAnswer === opt;
                    
                    let bgClass = isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100';
                    let textClass = theme.textMain;
                    let icon = null;
                    
                    if (isCorrectOption) {
                      bgClass = 'bg-emerald-500/10 border-emerald-500/50';
                      textClass = 'text-emerald-600 font-black';
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                    } else if (isSelected && !isCorrectOption) {
                      bgClass = 'bg-rose-500/10 border-rose-500/50';
                      textClass = 'text-rose-600 font-black';
                      icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
                    }
                    
                    return (
                      <div key={opt} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${bgClass}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${
                            isCorrectOption ? 'bg-emerald-500 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>{opt}</span>
                          <span className={`text-sm ${textClass}`}>{item.options[opt]}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
