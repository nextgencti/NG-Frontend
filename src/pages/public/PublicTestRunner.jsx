import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Loader2, User, Phone, Mail, ArrowRight, Trophy, Medal, Award, Sun, Moon, Maximize, Minimize, Sparkles, Globe, Wifi, WifiOff, RotateCcw, Home, BookOpen, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Email Report States
  const [emailInput, setEmailInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Exit Confirmation & Navigation Trap States
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const isConfirmedExitRef = useRef(false);

  // Offline & Resilience States
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Language & Translation States
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi');
  const [translationsCache, setTranslationsCache] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Network Online / Offline Listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("🟢 Internet Connection Restored!", { id: 'net-status', duration: 2500 });
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      toast.dismiss();
    };
  }, []);

  // Back-button navigation trap & Beforeunload protection during active test
  useEffect(() => {
    if (stage !== 'test') return;

    // Push a dummy history state so that browser back button pops this entry first
    window.history.pushState({ testRunning: true }, '', window.location.href);

    const handlePopState = () => {
      if (isConfirmedExitRef.current) return;

      // Keep trapped on the test runner URL
      window.history.pushState({ testRunning: true }, '', window.location.href);

      // Open the Exit Warning Alert Modal
      setIsExitModalOpen(true);
    };

    const handleBeforeUnload = (e) => {
      if (stage === 'test' && !isConfirmedExitRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stage]);

  // Auto-save public test progress to localStorage continuously
  useEffect(() => {
    if (!testId || stage !== 'test') return;
    const storageKey = `public_test_progress_${testId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        testId,
        participant,
        answers,
        currentQuestionIndex,
        timeLeft,
        questions,
        selectedLanguage,
        stage: 'test',
        lastSavedAt: Date.now()
      }));
    } catch (e) {
      console.error("Public local storage save error:", e);
    }
  }, [answers, currentQuestionIndex, timeLeft, testId, stage, participant, questions, selectedLanguage]);

  // Restore active test progress on mount if exists and not expired
  useEffect(() => {
    toast.dismiss();
    const storageKey = `public_test_progress_${testId}`;
    const savedProgressStr = localStorage.getItem(storageKey);
    if (savedProgressStr) {
      try {
        const saved = JSON.parse(savedProgressStr);
        if (saved && saved.stage === 'test' && saved.answers && saved.questions) {
          const elapsedSeconds = saved.lastSavedAt ? Math.floor((Date.now() - saved.lastSavedAt) / 1000) : 0;
          const remainingTime = (saved.timeLeft !== undefined ? saved.timeLeft : 1800) - elapsedSeconds;

          // If test time has expired, discard old session so user starts fresh
          if (remainingTime <= 0) {
            localStorage.removeItem(storageKey);
            setAnswers({});
            setStage('register');
          } else {
            setParticipant(saved.participant || { name: '', contact: '' });
            setQuestions(saved.questions);
            setAnswers(saved.answers || {});
            if (saved.selectedLanguage) setSelectedLanguage(saved.selectedLanguage);
            if (saved.currentQuestionIndex !== undefined) setCurrentQuestionIndex(saved.currentQuestionIndex);
            setTimeLeft(remainingTime);
            setStage('test');
          }
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch(e) {
        localStorage.removeItem(storageKey);
      }
    }
  }, [testId]);

  useEffect(() => {
    let isCancelled = false;

    const prefetchUpcomingTranslations = async () => {
      if (!questions || questions.length === 0 || !selectedLanguage) return;

      // 1. Translate current question immediately if needed
      const currentQ = questions[currentQuestionIndex];
      if (currentQ) {
        const isCurrentHindi = /[\u0900-\u097F]/.test(currentQ.question || '');
        const currentNeedsTrans = (selectedLanguage === 'Hindi' && !isCurrentHindi && (!currentQ.questionHindi || !currentQ.optionsHindi)) ||
                                  (selectedLanguage === 'English' && isCurrentHindi && (!currentQ.questionEnglish || !currentQ.optionsEnglish));
        const currentCacheKey = `${currentQ.id || currentQuestionIndex}_${selectedLanguage}`;

        if (currentNeedsTrans && !translationsCache[currentCacheKey]) {
          setIsTranslating(true);
          try {
            const res = await axios.post(`${API_BASE}/public/translate`, {
              question: currentQ.question,
              options: currentQ.options,
              targetLang: selectedLanguage
            });
            if (!isCancelled && res.data.success && res.data.translation) {
              setTranslationsCache(prev => ({ ...prev, [currentCacheKey]: res.data.translation }));
            }
          } catch (err) {
            console.error('Translation error:', err);
          } finally {
            if (!isCancelled) setIsTranslating(false);
          }
        }
      }

      // 2. Pre-fetch remaining untranslated questions in background chunks
      const untranslatedList = [];
      questions.forEach((q, idx) => {
        const isHindi = /[\u0900-\u097F]/.test(q.question || '');
        const needsTrans = (selectedLanguage === 'Hindi' && !isHindi && (!q.questionHindi || !q.optionsHindi)) ||
                           (selectedLanguage === 'English' && isHindi && (!q.questionEnglish || !q.optionsEnglish));
        const cKey = `${q.id || idx}_${selectedLanguage}`;
        if (needsTrans && !translationsCache[cKey]) {
          untranslatedList.push({ id: q.id || idx, question: q.question, options: q.options, originalIndex: idx });
        }
      });

      if (untranslatedList.length === 0 || isCancelled) return;

      for (let i = 0; i < untranslatedList.length; i += 8) {
        if (isCancelled) break;
        const chunk = untranslatedList.slice(i, i + 8);
        try {
          const res = await axios.post(`${API_BASE}/public/translate-batch`, {
            questions: chunk,
            targetLang: selectedLanguage
          });
          if (!isCancelled && res.data.success && Array.isArray(res.data.translations)) {
            const newCache = {};
            res.data.translations.forEach((t, tIdx) => {
              const originalItem = chunk[tIdx] || chunk.find(c => c.id === t.id);
              if (originalItem) {
                const cKey = `${originalItem.id}_${selectedLanguage}`;
                newCache[cKey] = { question: t.question, options: t.options };
              }
            });
            setTranslationsCache(prev => ({ ...prev, ...newCache }));
          }
        } catch (batchErr) {
          console.error('Batch pre-translation error:', batchErr);
        }
      }
    };

    prefetchUpcomingTranslations();

    return () => { isCancelled = true; };
  }, [currentQuestionIndex, selectedLanguage, questions]);

  const getDisplayedQuestionDetails = (q) => {
    if (!q) return { question: '', options: {} };

    if (selectedLanguage === 'Hindi') {
      if (q.questionHindi && q.optionsHindi) return { question: q.questionHindi, options: q.optionsHindi };
      if (/[\u0900-\u097F]/.test(q.question || '')) return { question: q.question, options: q.options };
    }

    if (selectedLanguage === 'English') {
      if (q.questionEnglish && q.optionsEnglish) return { question: q.questionEnglish, options: q.optionsEnglish };
      if (!/[\u0900-\u097F]/.test(q.question || '')) return { question: q.question, options: q.options };
    }

    const cacheKey = `${q.id || currentQuestionIndex}_${selectedLanguage}`;
    if (translationsCache[cacheKey]) {
      return translationsCache[cacheKey];
    }

    return { question: q.question, options: q.options };
  };

  const getItemDisplayedDetails = (item, index) => {
    const originalQ = questions.find(q => q.id === item.questionId) || questions[index];
    if (originalQ) {
      return getDisplayedQuestionDetails(originalQ);
    }
    return { question: item.question, options: item.options || {} };
  };

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
        // Explicitly clear answers and reset index for a clean test run
        setAnswers({});
        setCurrentQuestionIndex(0);
        setResult(null);
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

  const handleContactChange = (e) => {
    setParticipant(prev => ({ ...prev, contact: e.target.value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const name = participant.name.trim();
    const contact = participant.contact.trim();

    if (!name) {
      return toast.error('Please enter your name');
    }
    if (name.length < 2) {
      return toast.error('Name must be at least 2 characters long');
    }
    if (!contact) {
      return toast.error('Please enter your email or phone number');
    }

    const isEmailAttempt = contact.includes('@') || /[a-zA-Z]/.test(contact);

    if (isEmailAttempt) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact)) {
        return toast.error('Please enter a valid email address');
      }
    } else {
      const digits = contact.replace(/\D/g, '');
      if (digits.length !== 10) {
        return toast.error('Mobile number must be exactly 10 digits');
      }
      if (!/^[6-9]/.test(digits)) {
        return toast.error('Mobile number must start with 6, 7, 8, or 9');
      }
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

  const handleRetakeTest = () => {
    isConfirmedExitRef.current = false;
    try {
      localStorage.removeItem(`public_test_progress_${testId}`);
    } catch (e) {}
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setParticipant({ name: '', contact: '' });
    setTimeLeft(null);
    setStage('register');
  };

  const handleConfirmExit = () => {
    isConfirmedExitRef.current = true;
    setIsExitModalOpen(false);
    try {
      localStorage.removeItem(`public_test_progress_${testId}`);
    } catch (e) {}
    toast.error('Test cancel ho gaya hai.', { id: 'test-cancelled' });
    navigate('/practice-tests');
  };

  const handleResetTestPrompt = () => {
    toast((t) => (
      <div className="flex flex-col gap-3 min-w-[280px]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50'} flex items-center justify-center flex-shrink-0`}>
            <RotateCcw className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Restart Test?</p>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
              All answers will be cleared
            </p>
          </div>
        </div>
        
        <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Are you sure you want to restart this test from the beginning? All your currently chosen answers will be reset.
        </p>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleRetakeTest();
            }}
            className="px-6 py-2 text-[10px] font-black bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-lg shadow-amber-600/20 active:scale-95 transition-all uppercase tracking-widest cursor-pointer"
          >
            Confirm & Restart
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
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

  const submitTest = async () => {
    isConfirmedExitRef.current = true;
    const toastId = toast.loading('Submitting your test...');
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE}/public/tests/${testId}/submit`, {
        answers,
        participant
      });
      if (res.data.success) {
        toast.success('Test submitted successfully!', { id: toastId });
        
        // Remove active saved progress so any re-visit starts completely fresh
        try {
          localStorage.removeItem(`public_test_progress_${testId}`);
        } catch (e) {
          console.error("Failed to remove public test progress:", e);
        }

        setAnswers({});
        setResult(res.data.result);
        if (participant.contact && (participant.contact.includes('@') || /[a-zA-Z]/.test(participant.contact))) {
          setEmailInput(participant.contact.trim());
        }
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

  const handleSendEmailReport = async (overrideEmail = null) => {
    const targetEmail = (overrideEmail || emailInput || '').trim();
    if (!targetEmail) {
      toast.error('Kripya apna email address enter karein.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      toast.error('Kripya ek valid email format enter karein (e.g. name@gmail.com).');
      return;
    }

    setIsSendingEmail(true);
    const toastId = toast.loading('Sending test report to your email...');
    try {
      const res = await axios.post(`${API_BASE}/public/tests/${testId}/email-report`, {
        email: targetEmail,
        resultId: result?.id,
        reportData: {
          testId,
          testTitle: test?.title || 'Practice Assessment',
          participantName: participant?.name || 'Candidate',
          score: result?.score,
          totalMarks: result?.totalMarks,
          percentage: result?.percentage,
          grade: result?.grade,
          detailedReport: result?.detailedReport || [],
          submittedAt: new Date().toISOString()
        }
      });

      if (res.data.success) {
        toast.success(res.data.message || `Report email ho gaya: ${targetEmail}`, { id: toastId, duration: 5000 });
        setEmailSentSuccess(true);
        setIsEmailModalOpen(false);
      } else {
        toast.error(res.data.message || 'Email send karne me error aaya.', { id: toastId });
      }
    } catch (error) {
      console.error('Email report error:', error);
      toast.error(error.response?.data?.message || 'Email send karne me error aaya. Kripya dobara koshish karein.', { id: toastId });
    } finally {
      setIsSendingEmail(false);
    }
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
    toast.error("Time's up! Auto-submitting test...");
    submitTest();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  // ─── REGISTRATION STAGE ────────────────────────────────────────────────────────
  if (stage === 'register') {
    const contactVal = participant.contact.trim();
    const isEmailAttempt = contactVal.includes('@') || /[a-zA-Z]/.test(contactVal);
    const digitsOnly = contactVal.replace(/\D/g, '');

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactVal);
    const isValidMobile = !isEmailAttempt && digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly);
    const isInvalidMobileStart = !isEmailAttempt && digitsOnly.length > 0 && !/^[6-9]/.test(digitsOnly);
    const isValidContact = isValidEmail || isValidMobile;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
        <Toaster position="top-right" />
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
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={participant.name}
                  onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Enter Your Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email or Phone</label>
                {!isEmailAttempt && digitsOnly.length > 0 && (
                  <span className={`text-[10px] font-bold ${
                    isValidMobile 
                      ? 'text-emerald-600' 
                      : isInvalidMobileStart 
                        ? 'text-rose-500' 
                        : 'text-slate-400'
                  }`}>
                    {digitsOnly.length}/10 Digits
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  {isEmailAttempt ? (
                    <Mail className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={participant.contact}
                  onChange={handleContactChange}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl outline-none transition-all font-medium ${
                    isInvalidMobileStart
                      ? 'border-rose-300 focus:ring-2 focus:ring-rose-400 bg-rose-50/20 text-rose-900'
                      : isValidContact
                        ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-400 bg-emerald-50/20 text-emerald-950'
                        : 'border-slate-200 focus:ring-2 focus:ring-primary-500 text-slate-800'
                  }`}
                  placeholder="Enter Email or Phone"
                />
                {isValidContact && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
              {isInvalidMobileStart && (
                <p className="text-[11px] text-rose-500 font-medium ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Mobile number must start with 6, 7, 8, or 9
                </p>
              )}
              {!isEmailAttempt && !isInvalidMobileStart && digitsOnly.length > 0 && digitsOnly.length < 10 && (
                <p className="text-[11px] text-amber-600 font-medium ml-1">
                  Enter {10 - digitsOnly.length} more digit{10 - digitsOnly.length > 1 ? 's' : ''} for valid mobile
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Start Assessment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3">
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

        {/* Offline Warning Banner */}
        {isOffline && (
          <div className="bg-amber-500 text-white text-[11px] font-extrabold py-2 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md animate-pulse">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently Offline. Don't worry! All your answers are saved locally. Please reconnect to submit your test.</span>
          </div>
        )}

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
              {/* Language Switcher */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('Hindi')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5 leading-none ${
                    selectedLanguage === 'Hindi'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 opacity-80 shrink-0" />
                  <span>हिंदी</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('English')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1.5 leading-none ${
                    selectedLanguage === 'English'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 opacity-80 shrink-0" />
                  <span>ENGLISH</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 sm:pr-4">
                <button
                  onClick={handleResetTestPrompt}
                  className={`p-2 rounded-lg transition-all ${theme.btnGhost}`}
                  title="Reset / Start Over"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
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
                          isCurrent
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105 ring-2 ring-primary-500/40'
                            : isAnswered
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : `${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border border-slate-200'}`
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
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleResetTestPrompt}
                    className="w-full py-1.5 text-[9px] font-bold text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset / Start Over</span>
                  </button>
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
          {(() => {
            const currentQuestion = questions[currentQuestionIndex];
            const displayedQuestion = getDisplayedQuestionDetails(currentQuestion);
            return (
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
                    <div className="flex items-start justify-between gap-3 mb-8">
                      <h2 className={`text-lg lg:text-xl font-black leading-snug ${theme.textMain}`}>
                        {displayedQuestion.question || currentQuestion?.question}
                      </h2>
                      {isTranslating && (
                        <span className="text-[10px] font-bold text-indigo-500 animate-pulse flex items-center gap-1 shrink-0 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200/50">
                          <Sparkles className="w-3 h-3 animate-spin" /> Translating...
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {['A', 'B', 'C', 'D'].map(optKey => {
                        const optionText = (displayedQuestion.options && displayedQuestion.options[optKey]) || currentQuestion?.options?.[optKey];
                        if (!optionText) return null;
                        const isSelected = answers[currentQuestion?.id] === optKey;
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
                            <span className={`text-sm font-semibold flex-1 ${theme.textMain}`}>
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
            );
          })()}
        </main>

        {/* Exit / Back Warning Alert Modal */}
        <AnimatePresence>
          {isExitModalOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsExitModalOpen(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
              />

              {/* Modal Dialog Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Warning Header & Icon */}
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/10">
                    <AlertTriangle className="w-8 h-8 animate-pulse text-rose-500" />
                  </div>

                  <h3 className="text-lg font-black tracking-tight">
                    Test Chhodna Chahte Hain?
                  </h3>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-1">
                    ⚠️ Dhyan Dein: Test Submit Nahi Hoga!
                  </p>

                  <div className={`mt-4 p-3.5 rounded-2xl text-left border ${
                    isDarkMode ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-rose-50/60 border-rose-200/60 text-slate-700'
                  }`}>
                    <p className="text-xs leading-relaxed font-medium">
                      Aapka test abhi <strong>in-progress</strong> hai. Agar aap abhi back karte hain ya page chhodte hain:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 list-disc list-inside">
                      <li>Aapka test submit <strong>NAHI</strong> hoga.</li>
                      <li>Aapka test turant <strong>CANCEL</strong> ho jayega.</li>
                      <li>Saare chune huye answers discard ho jayenge.</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`p-4 border-t flex flex-col sm:flex-row-reverse items-center gap-2.5 ${
                  isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-100'
                }`}>
                  {/* Keep Testing (Primary Recommendation) */}
                  <button
                    type="button"
                    onClick={() => setIsExitModalOpen(false)}
                    className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Nahi, Test Continue Karein
                  </button>

                  {/* Confirm Cancel & Exit */}
                  <button
                    type="button"
                    onClick={handleConfirmExit}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all border border-rose-200 dark:border-rose-900/60 cursor-pointer"
                  >
                    Haan, Test Cancel Karein
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
          {/* Top Navigation & Action Header (Red Circles 1 & 2) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2 no-print">
            {/* Left: Navigation Buttons (Red Circle 1) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  try { localStorage.removeItem(`public_test_progress_${testId}`); } catch(e) {}
                  navigate('/');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
                title="Go to Home Page"
              >
                <Home className="w-3.5 h-3.5 text-primary-600" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  try { localStorage.removeItem(`public_test_progress_${testId}`); } catch(e) {}
                  navigate('/practice-tests');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
                title="View All Practice Tests"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>All Tests</span>
              </button>
            </div>

            {/* Right: Language, Print & Theme Controls (Red Circle 2) */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('Hindi')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none ${
                    selectedLanguage === 'Hindi'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3 opacity-80 shrink-0" />
                  <span>हिंदी</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('English')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center gap-1 leading-none ${
                    selectedLanguage === 'English'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Globe className="w-3 h-3 opacity-80 shrink-0" />
                  <span>English</span>
                </button>
              </div>

              {/* Print Report Button */}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>

              {/* Email Report Button */}
              <button
                type="button"
                onClick={() => {
                  if (!emailInput && participant.contact && (participant.contact.includes('@') || /[a-zA-Z]/.test(participant.contact))) {
                    setEmailInput(participant.contact.trim());
                  }
                  setIsEmailModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  emailSentSuccess 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                title="Email Report"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{emailSentSuccess ? 'Email Sent ✔' : 'Email Report'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Printable Official Header (Visible only during printing) */}
          <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">NextGen Computer Training Institute</h1>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">Muskara, Hamirpur (U.P.) • ISO Certified Center</p>
                <h2 className="text-base font-bold text-indigo-700 mt-2">{test?.title || 'Public Practice Test'} • Assessment Report</h2>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-[10px] font-bold uppercase text-slate-700">
                  Language: {selectedLanguage === 'Hindi' ? 'हिंदी (Hindi)' : 'English'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Name</span>
                <span className="font-bold text-slate-800">{participant.name}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact / Mobile</span>
                <span className="font-bold text-slate-800">{participant.contact}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score Obtained</span>
                <span className="font-bold text-indigo-600">{result.score} / {result.totalMarks} ({result.percentage.toFixed(1)}%)</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Final Grade</span>
                <span className={`font-bold ${result.percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{result.grade}</span>
              </div>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body, html {
                background: #ffffff !important;
                color: #000000 !important;
                font-size: 11pt !important;
              }
              .no-print, button, .action-buttons {
                display: none !important;
              }
              .print\\:block {
                display: block !important;
              }
              .max-w-3xl {
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                box-shadow: none !important;
                border: none !important;
              }
              .print-card {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 12px !important;
                border: 1px solid #cbd5e1 !important;
                background: #ffffff !important;
                padding: 14px !important;
                border-radius: 12px !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}} />

          {/* Score Card (Web only, official header prints for paper report) */}
          <div className={`${theme.card} rounded-[2.5rem] p-8 text-center space-y-6 no-print`}>
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

          {/* Email Report Card */}
          <div className={`${theme.card} rounded-[2.5rem] p-6 sm:p-8 no-print border transition-all ${
            emailSentSuccess 
              ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/20' 
              : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  emailSentSuccess 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-black ${theme.textMain} flex items-center gap-2`}>
                    Email Me This Report
                    {emailSentSuccess && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                        Sent Successfully!
                      </span>
                    )}
                  </h3>
                  <p className={`text-xs ${theme.textSub} mt-0.5`}>
                    Apna score, percentage aur sabhi questions ka solution apne email par prapt karein.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendEmailReport();
                    }
                  }}
                  placeholder="Apna email address daalein (e.g. name@gmail.com)"
                  className={`w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={() => handleSendEmailReport()}
                disabled={isSendingEmail}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 active:scale-95 ${
                  emailSentSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/20'
                }`}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : emailSentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resend Email</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Send Report</span>
                  </>
                )}
              </button>
            </div>

            {emailSentSuccess && (
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Report aapke email ({emailInput}) par bhej di gayi hai. Kripya apna Inbox aur Spam folder check karein!
              </p>
            )}
          </div>

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className={`${theme.card} rounded-[2.5rem] p-8 no-print`}>
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
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-black ${theme.textMain}`}>Detailed Analysis</h3>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/40">
                Language: {selectedLanguage === 'Hindi' ? 'हिंदी (Hindi)' : 'English'}
              </span>
            </div>
            {result.detailedReport?.map((item, index) => {
              const displayedDetails = getItemDisplayedDetails(item, index);
              return (
                <div key={item.questionId || index} className={`p-6 rounded-2xl border-2 transition-all print-card ${
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
                    <h4 className={`text-base font-bold leading-relaxed ${theme.textMain}`}>{displayedDetails.question || item.question}</h4>
                  </div>
                  <div className="space-y-3 pl-12">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optText = displayedDetails.options?.[opt] || item.options?.[opt];
                      if (!optText) return null;
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
                            <span className={`text-sm ${textClass}`}>{optText}</span>
                          </div>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 no-print">
            <button
              onClick={handleRetakeTest}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-primary-600/30 flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Test
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem(`public_test_progress_${testId}`);
                } catch(e) {}
                navigate('/');
              }}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer"
            >
              Back to Home
            </button>
          </div>

          {/* Email Report Modal */}
          <AnimatePresence>
            {isEmailModalOpen && (
              <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsEmailModalOpen(false)}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className={`relative w-full max-w-md rounded-3xl shadow-2xl p-6 z-10 border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-600 flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black">Email Test Report</h3>
                      <p className="text-xs text-slate-500">Get complete assessment results in your inbox</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Apna email address enter karein. Hum aapka score, percentage aur detailed solution seedhe aapke email par bhejenge.
                  </p>

                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendEmailReport();
                          }
                        }}
                        placeholder="Apna email address daalein (e.g. name@gmail.com)"
                        className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500' 
                            : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:bg-white'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(false)}
                        className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendEmailReport()}
                        disabled={isSendingEmail}
                        className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            <span>Send Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return null;
}
