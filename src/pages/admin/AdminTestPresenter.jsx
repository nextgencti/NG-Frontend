import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Play, Pause, X, Maximize, Minimize, Timer, Sparkles, CheckCircle2, Volume2, VolumeX, BarChart3, HelpCircle, RefreshCw, ClipboardList, BookOpen, Clock, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import logoImg from '../../assets/logo.png';
import sanjuAvatar from '../../assets/AI_Tutor_sunju.png';
import { useAuth } from '../../context/AuthContext';

const renderExplanation = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const splitParts = line.split(regex);
    
    const parsedLine = splitParts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-extrabold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={partIdx} className="italic text-indigo-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={partIdx}>{part}</span>;
    });

    return (
      <p 
        key={lineIdx} 
        className="min-h-[1.5rem] text-slate-200 font-medium text-[13px] tracking-wide"
        style={{ lineHeight: '2.0', wordSpacing: '0.15em' }}
      >
        {parsedLine}
      </p>
    );
  });
};

export default function AdminTestPresenter() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isStudent = currentUser?.role === 'student';

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation States
  // 0: Cover Slide, 1 to questions.length: Question Slides, questions.length + 1: Answer Key Slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Presenter Feature States
  const [showAnswer, setShowAnswer] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  
  // Poll States
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30); // Default 30s
  const [customSeconds, setCustomSeconds] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [pollFinished, setPollFinished] = useState(false);
  const [pollResults, setPollResults] = useState(null);

  // Autoplay States
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);
  const [autoplayQuestionTime, setAutoplayQuestionTime] = useState(15); // default 15s
  const [autoplayRevealTime, setAutoplayRevealTime] = useState(5); // default 5s
  const [autoplayPhase, setAutoplayPhase] = useState('question'); // 'question' or 'reveal'
  const [autoplayTimeLeft, setAutoplayTimeLeft] = useState(15);
  const [isAutoplaySettingsOpen, setIsAutoplaySettingsOpen] = useState(false);

  const timerIntervalRef = useRef(null);
  const presenterContainerRef = useRef(null);
  const currentQuestion = currentSlide > 0 && currentSlide <= questions.length ? questions[currentSlide - 1] : null;

  // Synthesize tick sound using Web Audio API
  const playTick = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime); // sharp tick
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }, [isMuted]);

  // Synthesize success chime sound using Web Audio API
  const playChime = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // C5, E5, G5 major triad arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.7);
      });
    } catch (e) {
      console.warn('Audio synthesis failed:', e);
    }
  }, [isMuted]);

  // Fetch Test data
  useEffect(() => {
    const fetchPresenterData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/admin/tests/${testId}/full`);
        if (response.data.success) {
          setTest(response.data.test);
          setQuestions(response.data.questions || []);
        } else {
          toast.error(response.data.message || 'Failed to retrieve test details.');
          navigate(isStudent ? '/dashboard/tests' : '/admin/tests');
        }
      } catch (error) {
        console.error('Error fetching test for presenter:', error);
        toast.error(error.response?.data?.message || 'Failed to load presentation slides.');
        navigate(isStudent ? '/dashboard/tests' : '/admin/tests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPresenterData();
  }, [testId, navigate, isStudent]);

  // Handle Poll Simulation Result Generation
  const generateSimulatedResults = useCallback((q) => {
    const optKeys = ['A', 'B', 'C', 'D'].filter(key => q.options && q.options[key]);
    if (optKeys.length === 0) return;

    // Find which key is correct
    let correctKey = 'A';
    for (const key of optKeys) {
      const optText = q.options[key];
      if (q.correctAnswer === key || 
          (q.correctAnswer && 
           (q.correctAnswer.toString().toUpperCase() === key || 
            q.correctAnswer.toString().toUpperCase() === optText.toString().toUpperCase()))) {
        correctKey = key;
        break;
      }
    }
    
    // Bias results so correct answer has the highest percentage
    const results = {};
    let remaining = 100;
    
    // Assign 50% - 75% to the correct option
    const correctPercentage = Math.floor(Math.random() * 26) + 50; 
    results[correctKey] = correctPercentage;
    remaining -= correctPercentage;

    const wrongOptions = optKeys.filter(k => k !== correctKey);
    if (wrongOptions.length > 0) {
      wrongOptions.forEach((key, idx) => {
        if (idx === wrongOptions.length - 1) {
          results[key] = remaining;
        } else {
          const val = Math.floor(Math.random() * (remaining - (wrongOptions.length - idx - 1)));
          results[key] = val;
          remaining -= val;
        }
      });
    } else {
      results[correctKey] = 100;
    }

    setPollResults(results);
  }, []);

  // Poll Timer Tick Handler
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            setPollFinished(true);
            playChime();
            const currentQ = questions[currentSlide - 1];
            if (currentQ) generateSimulatedResults(currentQ);
            return 0;
          }
          const nextVal = prev - 1;
          if (nextVal <= 5) {
            playTick();
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timeLeft, playTick, playChime, questions, currentSlide, generateSimulatedResults]);

  // Clean timer on slide changes and reset autoplay settings
  useEffect(() => {
    setShowAnswer(false);
    setIsPollOpen(false);
    setPollFinished(false);
    setIsTimerRunning(false);
    setPollResults(null);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Reset autoplay timers for the new slide
    if (isAutoplayActive) {
      setAutoplayPhase('question');
      setAutoplayTimeLeft(autoplayQuestionTime);
    }
  }, [currentSlide, isAutoplayActive, autoplayQuestionTime]);

  // Autoplay countdown and page turning effect
  useEffect(() => {
    let interval = null;
    if (isAutoplayActive && !isPollOpen && currentSlide > 0 && currentSlide <= questions.length) {
      interval = setInterval(() => {
        setAutoplayTimeLeft(prev => {
          if (prev <= 1) {
            if (autoplayPhase === 'question') {
              // Question time finished! Reveal correct answer
              setShowAnswer(true);
              playChime();
              setAutoplayPhase('reveal');
              return autoplayRevealTime;
            } else if (autoplayPhase === 'reveal') {
              // Answer reveal time finished! Go to next slide
              setShowAnswer(false);
              if (currentSlide < questions.length) {
                setCurrentSlide(prevSlide => prevSlide + 1);
                setAutoplayPhase('question');
                return autoplayQuestionTime;
              } else {
                // Reached the end - go to Answer Key
                setCurrentSlide(questions.length + 1);
                setIsAutoplayActive(false);
                setAutoplayPhase('question');
                toast.success('Autoplay presentation complete! 🎓');
                return 0;
              }
            }
          }
          const nextVal = prev - 1;
          // Play countdown ticks during the final 3 seconds of question thinking phase
          if (nextVal <= 3 && autoplayPhase === 'question') {
            playTick();
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoplayActive, autoplayPhase, autoplayQuestionTime, autoplayRevealTime, currentSlide, questions.length, isPollOpen, playChime, playTick]);

  // Handle Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid triggering when focused on custom seconds input
      if (document.activeElement.tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault();
          if (currentSlide < questions.length + 1) {
            setCurrentSlide(prev => prev + 1);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
          }
          break;
        case 's':
        case 'S':
          // Only toggle answer on question slides
          if (currentSlide > 0 && currentSlide <= questions.length) {
            setShowAnswer(prev => !prev);
          }
          break;
        case 'p':
        case 'P':
          // Toggle poll on question slides (only for admin)
          if (!isStudent && currentSlide > 0 && currentSlide <= questions.length) {
            setIsPollOpen(prev => !prev);
          }
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            navigate(isStudent ? '/dashboard/tests' : '/admin/tests');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, questions.length, navigate, isStudent]);

  // Track Fullscreen Change Events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!presenterContainerRef.current) return;
    if (!document.fullscreenElement) {
      presenterContainerRef.current.requestFullscreen().catch(err => {
        toast.error('Unable to enter fullscreen mode.');
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Poll Controller Actions
  const handleStartPoll = () => {
    setPollFinished(false);
    setPollResults(null);
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
    if (timerDuration <= 5) playTick();
  };

  const handlePausePoll = () => {
    setIsTimerRunning(false);
  };

  const handleResumePoll = () => {
    setIsTimerRunning(true);
  };

  const handleResetPoll = () => {
    setIsTimerRunning(false);
    setPollFinished(false);
    setPollResults(null);
    setTimeLeft(timerDuration);
  };

  const handleClosePoll = () => {
    setIsPollOpen(false);
    setIsTimerRunning(false);
    setPollFinished(false);
    setPollResults(null);
  };

  const handleCustomDurationSubmit = (e) => {
    e.preventDefault();
    const secs = parseInt(customSeconds);
    if (secs > 0 && secs <= 900) {
      setTimerDuration(secs);
      setCustomSeconds('');
      toast.success(`Timer set to ${secs}s!`);
    } else {
      toast.error('Please enter a duration between 1 and 900 seconds.');
    }
  };

  const fetchExplanation = useCallback(async (q) => {
    if (!q) return;
    setIsExplaining(true);
    setExplanation('');
    try {
      const response = await api.post('/admin/explain-question', {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      });
      if (response.data.success) {
        setExplanation(response.data.explanation);
      } else {
        setExplanation('स्पष्टीकरण लोड करने में असमर्थ।');
      }
    } catch (error) {
      console.error(error);
      setExplanation('स्पष्टीकरण लोड करने में त्रुटि।');
    } finally {
      setIsExplaining(false);
    }
  }, []);

  useEffect(() => {
    if (showAnswer && currentQuestion) {
      fetchExplanation(currentQuestion);
    }
  }, [showAnswer, currentSlide, currentQuestion, fetchExplanation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090816] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">Initializing Web PPT Presentation...</p>
      </div>
    );
  }

  if (!test) return null;



  return (
    <div 
      ref={presenterContainerRef}
      className="min-h-screen w-full bg-gradient-to-br from-[#090816] via-[#12102E] to-[#090816] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none"
    >
      {/* ─── TOP BAR HUD ─── */}
      <div className="px-8 py-3.5 border-b border-indigo-950/40 bg-[#0c0a1f]/75 backdrop-blur-md flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(isStudent ? '/dashboard/tests' : '/admin/tests')}
            className="p-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-900/30 text-indigo-300 hover:text-white transition-all cursor-pointer"
            title="Exit Presentation"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-indigo-300 max-w-[300px] truncate" title={test.title}>
              {test.title}
            </h1>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Course: {test.course}
            </p>
          </div>
        </div>

        {/* Slide Counter Indicator */}
        <div className="px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-900/40 text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">
          {currentSlide === 0 ? 'Cover' : currentSlide === questions.length + 1 ? 'Answer Key' : `Slide ${currentSlide} / ${questions.length}`}
        </div>

        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-950/40 border-rose-900/40 text-rose-400 hover:bg-rose-900/40' 
                : 'bg-indigo-950/50 border-indigo-900/30 text-indigo-300 hover:text-white hover:bg-indigo-900/60'
            }`}
            title={isMuted ? 'Unmute countdown chimes' : 'Mute countdown chimes'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-900/30 text-indigo-300 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen [F]' : 'Fullscreen Mode [F]'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ─── MAIN SLIDE DISPLAY AREA ─── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">
        
        {/* ─── COVER SLIDE (Index 0) ─── */}
        {currentSlide === 0 && (
          <div className="w-full max-w-4xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
            {/* Logo Badge Container */}
            <div className="inline-flex p-3 rounded-2xl bg-white border border-indigo-100 shadow-xl shadow-indigo-950/40 mb-1 hover:rotate-6 transition-transform">
              <img src={logoImg} alt="Brand Logo" className="w-12 h-12 object-contain" />
            </div>
            
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                Interactive Slideshow
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase text-white max-w-3xl mx-auto drop-shadow-md">
                {test.title}
              </h2>
              <p className="text-xs md:text-sm font-bold text-indigo-300 uppercase tracking-widest">
                DEPARTMENT: {test.course}
              </p>
            </div>

            {/* Underline */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto rounded-full"></div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
              {[
                { label: 'Questions Count', value: `${questions.length} Qs`, icon: ClipboardList, color: 'text-indigo-400' },
                { label: 'Total Weightage', value: `${test.totalMarks || 100}M`, icon: BookOpen, color: 'text-emerald-400' },
                { label: 'Time Allocated', value: test.duration || '—', icon: Clock, color: 'text-amber-400' },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/30 backdrop-blur-sm flex flex-col items-center">
                    <Icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                    <span className="text-sm font-black text-white">{stat.value}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 text-center">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4">
              <button
                onClick={() => setCurrentSlide(1)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                Start Presentation
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── QUESTIONS SLIDES (Index 1 to N) ─── */}
        {currentQuestion && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-stretch justify-center animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Left Column: Question and Options */}
            <div className="flex-1 flex flex-col justify-center py-2 min-w-0">
              {/* Question Header Meta */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black tracking-widest text-indigo-400 uppercase">
                    QUESTION {currentSlide} OF {questions.length}
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-indigo-950/60 border border-indigo-900/40 text-[10px] font-black text-indigo-300 tracking-wider">
                  {currentQuestion.marks || 1} MARKS
                </span>
              </div>

              {/* Centered Circular Autoplay Timer */}
              {isAutoplayActive && (
                <div className="flex flex-col items-center justify-center mb-8 animate-in zoom-in-95 duration-300">
                  <style>{`
                    @keyframes timerPulse {
                      0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 12px rgba(244, 63, 94, 0.4));
                      }
                      50% {
                        transform: scale(1.06);
                        filter: drop-shadow(0 0 24px rgba(244, 63, 94, 0.8));
                      }
                    }
                    @keyframes timerPulseNormal {
                      0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.25));
                      }
                      50% {
                        transform: scale(1.03);
                        filter: drop-shadow(0 0 16px rgba(99, 102, 241, 0.5));
                      }
                    }
                    @keyframes progressReveal {
                      0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.25));
                      }
                      50% {
                        transform: scale(1.03);
                        filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.5));
                      }
                    }
                    .timer-pulse-critical {
                      animation: timerPulse 0.5s infinite ease-in-out;
                    }
                    .timer-pulse-normal {
                      animation: timerPulseNormal 2s infinite ease-in-out;
                    }
                    .timer-pulse-reveal {
                      animation: progressReveal 1.5s infinite ease-in-out;
                    }
                  `}</style>
                  <div className={`relative w-20 h-20 flex items-center justify-center ${
                    autoplayPhase === 'question'
                      ? (autoplayTimeLeft <= 3 ? 'timer-pulse-critical' : 'timer-pulse-normal')
                      : 'timer-pulse-reveal'
                  }`}>
                    {/* Backdrop glass circle */}
                    <div className="absolute inset-1.5 rounded-full bg-indigo-950/45 border border-indigo-900/40 backdrop-blur-sm shadow-inner shadow-indigo-950/60"></div>
                    
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                      {/* Circle Track */}
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        stroke="#151336" 
                        strokeWidth="4" 
                        fill="transparent" 
                      />
                      {/* Dynamic Circle Progress Indicator */}
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="34" 
                        stroke={autoplayPhase === 'question' ? (autoplayTimeLeft <= 3 ? '#f43f5e' : '#6366f1') : '#10b981'} 
                        strokeWidth="5" 
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 34}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - autoplayTimeLeft / (autoplayPhase === 'question' ? autoplayQuestionTime : autoplayRevealTime))}
                        className="transition-all duration-1000 ease-linear"
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Timer Text in Circle */}
                    <div className="flex flex-col items-center justify-center z-10">
                      <span className={`text-2xl font-black tracking-tight leading-none ${
                        autoplayPhase === 'question' 
                          ? (autoplayTimeLeft <= 3 ? 'text-rose-500 animate-pulse font-black' : 'text-white')
                          : 'text-emerald-400 animate-pulse'
                      }`}>
                        {autoplayTimeLeft}
                      </span>
                      <span className="text-[6.5px] font-black uppercase tracking-widest text-slate-400 mt-0.5">secs</span>
                    </div>
                  </div>
                  
                  {/* Timer Subtext */}
                  <span className={`text-[9px] font-black uppercase tracking-widest mt-2.5 px-2.5 py-0.5 rounded-full border transition-all ${
                    autoplayPhase === 'question' 
                      ? 'text-indigo-300 bg-indigo-950/60 border-indigo-900/40'
                      : 'text-emerald-400 bg-emerald-950/40 border-emerald-900/40 font-extrabold animate-pulse'
                  }`}>
                    {autoplayPhase === 'question' ? '• Thinking Time' : '✓ Reveal Answer'}
                  </span>
                </div>
              )}

              {/* Question Statement */}
              <div className="mb-4 min-h-[50px] flex items-center">
                <h3 className="text-xl md:text-2xl font-extrabold text-white leading-relaxed tracking-wide select-text">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].filter(key => currentQuestion.options && currentQuestion.options[key]).map((key) => {
                  const optText = currentQuestion.options[key];
                  const isCorrect = currentQuestion.correctAnswer === key || 
                                    (currentQuestion.correctAnswer && 
                                     (currentQuestion.correctAnswer.toString().toUpperCase() === key || 
                                      currentQuestion.correctAnswer.toString().toUpperCase() === optText.toString().toUpperCase()));
                  const highlight = showAnswer && isCorrect;

                  return (
                    <div
                      key={key}
                      className={`p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 relative group ${
                        highlight 
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] text-emerald-100'
                          : showAnswer
                            ? 'bg-indigo-950/10 border-indigo-950/50 text-slate-500 opacity-40'
                            : 'bg-indigo-950/30 border-indigo-900/30 hover:border-indigo-700/50 hover:bg-indigo-950/50 text-slate-200'
                      }`}
                    >
                      {/* Circle badge */}
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold transition-all ${
                        highlight 
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                          : showAnswer
                            ? 'bg-indigo-950/20 border-indigo-950/50 text-indigo-900'
                            : 'bg-indigo-900/50 border-indigo-800 text-indigo-200 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400'
                      }`}>
                        {key}
                      </div>

                      <div className="flex-1 text-sm font-semibold select-text break-words pr-6">
                        {optText}
                      </div>

                      {highlight && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 absolute right-5 top-1/2 -translate-y-1/2 animate-in zoom-in-75 duration-300" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: AI Explanation Panel */}
            {showAnswer && (
              <div className="w-full lg:w-96 shrink-0 bg-[#12102E]/60 backdrop-blur-md border border-indigo-500/25 rounded-3xl p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right-6 duration-500 text-left min-h-[350px]">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 border-b border-indigo-950/60 pb-3">
                    <img src={sanjuAvatar} alt="Sanju Avatar" className="w-6 h-6 object-contain rounded-full border border-indigo-500/35" />
                    <span className="text-xs font-black text-indigo-200 uppercase tracking-widest">Sanju - AI Explanation</span>
                  </div>

                  <div className="text-slate-300 text-xs leading-relaxed space-y-3 select-text max-h-[320px] overflow-y-auto pr-1">
                    {isExplaining ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">Sanju is thinking...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {renderExplanation(explanation) || (
                          <p className="font-medium text-slate-300">कोई स्पष्टीकरण उपलब्ध नहीं है।</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-950/60 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  <span>Powered by Gemini</span>
                  <span>NextGen AI Tutor</span>
                </div>
              </div>
            )}

            {/* ─── POLL OVERLAY COMPONENT ─── */}
            {isPollOpen && (
              <div className="absolute inset-0 bg-[#090816]/90 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="bg-[#12102E] border border-indigo-900/60 rounded-3xl w-full max-w-lg shadow-2xl p-8 relative flex flex-col items-center">
                  
                  {/* Close button */}
                  <button 
                    onClick={handleClosePoll}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-indigo-950/60 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2 mb-6">
                    <Timer className="w-5 h-5 text-indigo-400 animate-pulse" />
                    <span className="text-sm font-black text-indigo-200 uppercase tracking-widest">Interactive Classroom Poll</span>
                  </div>

                  {!isTimerRunning && !pollFinished ? (
                    /* TIMER CONFIGURATION PANEL */
                    <div className="w-full space-y-6 text-center">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Timer Duration</p>
                      
                      {/* Presets */}
                      <div className="grid grid-cols-4 gap-3">
                        {[15, 30, 60, 90].map(secs => (
                          <button
                            key={secs}
                            onClick={() => setTimerDuration(secs)}
                            className={`py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              timerDuration === secs
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                                : 'bg-indigo-950/40 border-indigo-900/50 text-indigo-300 hover:bg-indigo-900/40'
                            }`}
                          >
                            {secs}s
                          </button>
                        ))}
                      </div>

                      {/* Custom input */}
                      <form onSubmit={handleCustomDurationSubmit} className="flex gap-2 justify-center max-w-[280px] mx-auto">
                        <input
                          type="number"
                          min="1"
                          max="900"
                          value={customSeconds}
                          onChange={e => setCustomSeconds(e.target.value)}
                          placeholder="Custom duration..."
                          className="px-4 py-2 text-xs bg-indigo-950/60 border border-indigo-900/60 rounded-xl text-center font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] placeholder:text-slate-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-950 border border-indigo-900 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                        >
                          Set
                        </button>
                      </form>

                      <div className="pt-4 border-t border-indigo-950/60">
                        <button
                          onClick={handleStartPoll}
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          Start Countdown ({timerDuration}s)
                        </button>
                      </div>
                    </div>
                  ) : isTimerRunning ? (
                    /* COUNTDOWN TICKER */
                    <div className="w-full flex flex-col items-center py-6 text-center space-y-6">
                      
                      {/* Circular Timer Visual */}
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          {/* Track */}
                          <circle cx="72" cy="72" r="62" stroke="#1e1b4b" strokeWidth="6" fill="transparent" />
                          {/* Indicator */}
                          <circle 
                            cx="72" cy="72" r="62" 
                            stroke={timeLeft <= 5 ? '#f43f5e' : '#6366f1'} 
                            strokeWidth="6" 
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 62}
                            strokeDashoffset={2 * Math.PI * 62 * (1 - timeLeft / timerDuration)}
                            className="transition-all duration-1000 ease-linear"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="flex flex-col items-center">
                          <span className={`text-4xl font-black tracking-tighter ${timeLeft <= 5 ? 'text-rose-500 animate-ping font-extrabold scale-110' : 'text-white'}`}>
                            {timeLeft}
                          </span>
                          <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">SECONDS</span>
                        </div>
                      </div>

                      <p className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase animate-pulse">
                        Poll in progress. Cast your votes...
                      </p>

                      {/* Controls */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handlePausePoll}
                          className="px-5 py-2.5 bg-indigo-950 border border-indigo-900 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                        </button>
                        <button
                          onClick={() => { setTimeLeft(0); setIsTimerRunning(false); setPollFinished(true); playChime(); generateSimulatedResults(currentQuestion); }}
                          className="px-5 py-2.5 bg-rose-950 border border-rose-900 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* POLL RESULTS CHART Display */
                    <div className="w-full space-y-6">
                      <div className="text-center space-y-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          Poll Finished
                        </span>
                        <h4 className="text-sm font-black text-slate-200 uppercase tracking-wider mt-2">Simulated Responses Distribution</h4>
                      </div>

                      {/* Results Bar Chart */}
                      <div className="space-y-4 pt-2">
                        {pollResults && Object.keys(pollResults).map((key) => {
                          const percentage = pollResults[key];
                          const isCorrect = currentQuestion.correctAnswer === key || 
                                            (currentQuestion.correctAnswer && 
                                             (currentQuestion.correctAnswer.toString().toUpperCase() === key || 
                                              (currentQuestion.options[key] && currentQuestion.correctAnswer.toString().toUpperCase() === currentQuestion.options[key].toString().toUpperCase())));
                          
                          return (
                            <div key={key} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wide">
                                <span className={`flex items-center gap-1.5 ${isCorrect ? 'text-emerald-400' : 'text-slate-300'}`}>
                                  Option {key} {isCorrect && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="h-4 bg-indigo-950 rounded-full overflow-hidden border border-indigo-900/20">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    isCorrect 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                      : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Restart or close */}
                      <div className="flex gap-4 pt-4 border-t border-indigo-950/60">
                        <button
                          onClick={handleResetPoll}
                          className="flex-1 py-3 bg-indigo-950 border border-indigo-900 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Restart Poll
                        </button>
                        <button
                          onClick={handleClosePoll}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-extrabold flex items-center justify-center"
                        >
                          Close Overlay
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── ANSWER KEY SLIDE (Questions.length + 1) ─── */}
        {currentSlide === questions.length + 1 && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2 mb-8">
              <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-black text-indigo-400 uppercase tracking-widest">
                Verification Phase
              </span>
              <h2 className="text-4xl font-black uppercase tracking-wide text-white">
                Final Answer Key
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Assessment: {test.title}
              </p>
            </div>

            {/* Answer Grid columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 p-8 rounded-3xl bg-indigo-950/20 border border-indigo-900/30 backdrop-blur-sm shadow-xl shadow-indigo-950/40">
              {questions.map((q, idx) => (
                <div 
                  key={q.id || idx} 
                  className="p-3.5 rounded-2xl border border-indigo-900/30 bg-indigo-950/40 flex flex-col items-center justify-center hover:border-emerald-500/40 hover:bg-emerald-950/10 transition-colors group"
                >
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-400">Q{idx + 1}</span>
                  <span className="text-xl font-black text-emerald-400 group-hover:scale-110 transition-transform">{q.correctAnswer || '—'}</span>
                </div>
              ))}
            </div>

            <div className="pt-8 text-center">
              <button
                onClick={() => setCurrentSlide(0)}
                className="px-8 py-3.5 bg-indigo-950 border border-indigo-900 hover:bg-indigo-900 text-indigo-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                Restart Slideshow
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Autoplay Settings Card */}
      {isAutoplaySettingsOpen && currentQuestion && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#12102E]/95 border border-indigo-900/80 rounded-3xl p-6 shadow-2xl z-40 w-full max-w-xs backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-indigo-200 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Autoplay Settings
            </span>
            <button 
              onClick={() => setIsAutoplaySettingsOpen(false)}
              className="p-1 rounded bg-indigo-950/50 hover:bg-indigo-900 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Question duration input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Question Timer</span>
                <span className="text-indigo-400 font-extrabold">{autoplayQuestionTime}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={autoplayQuestionTime}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  setAutoplayQuestionTime(val);
                  if (isAutoplayActive && autoplayPhase === 'question') {
                    setAutoplayTimeLeft(val);
                  }
                }}
                className="w-full accent-indigo-500 bg-indigo-950 rounded-lg cursor-pointer h-1"
              />
            </div>

            {/* Answer Reveal duration input */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Answer Show Timer</span>
                <span className="text-emerald-400 font-extrabold">{autoplayRevealTime}s</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={autoplayRevealTime}
                onChange={e => {
                  setAutoplayRevealTime(parseInt(e.target.value));
                }}
                className="w-full accent-emerald-500 bg-indigo-950 rounded-lg cursor-pointer h-1"
              />
            </div>

            <div className="pt-2 border-t border-indigo-950/60 flex items-center justify-between gap-3">
              {isAutoplayActive ? (
                <button
                  type="button"
                  onClick={() => setIsAutoplayActive(false)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/10"
                >
                  <Pause className="w-3 h-3 fill-white" />
                  Pause Autoplay
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoplayActive(true);
                    setAutoplayPhase('question');
                    setAutoplayTimeLeft(autoplayQuestionTime);
                    setIsPollOpen(false); // Close poll if open
                    setIsAutoplaySettingsOpen(false); // Close settings panel
                    toast.success('Autoplay active!');
                  }}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                  Start Autoplay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PRESENTER CONTROL CONSOLE (HUD) ─── */}
      <div className="px-8 py-4 bg-[#0a0818]/90 border-t border-indigo-950/60 backdrop-blur-md flex items-center justify-between z-20">
        
        {/* Navigation Shortcuts Info */}
        <div className="hidden lg:flex items-center gap-4 text-slate-500 text-[9px] font-bold uppercase tracking-widest">
          <span>Shortcuts:</span>
          <span>[← / →] Prev / Next</span>
          {currentQuestion && (
            <>
              <span>[S] Show Answer</span>
              {!isStudent && <span>[P] Toggle Poll</span>}
            </>
          )}
          <span>[F] Fullscreen</span>
          <span>[Esc] Exit</span>
        </div>

        {/* Console Action Buttons (Center HUD) */}
        <div className="flex items-center justify-center gap-3.5 mx-auto lg:mx-0">
          <button
            onClick={() => currentSlide > 0 && setCurrentSlide(prev => prev - 1)}
            disabled={currentSlide === 0}
            className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Previous Slide"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Contextual Actions (only for question slides) */}
          {currentQuestion && (
            <>
              {/* Show Answer Toggle */}
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className={`px-5 py-3 rounded-2xl border text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  showAnswer 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                    : 'bg-indigo-950/60 border-indigo-900/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60'
                }`}
                title="Toggle correct answer highlight [S]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </button>

              {/* Toggles classroom poll overlay (hidden for students) */}
              {!isStudent && (
                <button
                  onClick={() => setIsPollOpen(!isPollOpen)}
                  className={`px-5 py-3 rounded-2xl border text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                    isPollOpen 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                      : 'bg-indigo-950/60 border-indigo-900/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60'
                  }`}
                  title="Launch timer poll on slide [P]"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Poll Mode
                </button>
              )}

              {/* Auto Play Configuration Toggle */}
              <button
                onClick={() => setIsAutoplaySettingsOpen(!isAutoplaySettingsOpen)}
                className={`px-5 py-3 rounded-2xl border text-[9.5px] font-black uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  isAutoplayActive 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                    : 'bg-indigo-950/60 border-indigo-900/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60'
                }`}
                title="Set autoplay timers and play/pause auto question slides changer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoplayActive ? 'animate-spin' : ''}`} />
                Auto Play
              </button>
            </>
          )}

          <button
            onClick={() => currentSlide < questions.length + 1 && setCurrentSlide(prev => prev + 1)}
            disabled={currentSlide === questions.length + 1}
            className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            title="Next Slide [Spacebar]"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar visual indicator */}
        <div className="hidden md:flex items-center gap-3 w-40">
          <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
            Progress:
          </div>
          <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden border border-indigo-900/20">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${(currentSlide / (questions.length + 1)) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
