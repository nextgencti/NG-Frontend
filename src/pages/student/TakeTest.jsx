import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Maximize, Minimize } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { q1: 'A', q2: 'C' }
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);
  
  // Theme and Fullscreen state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Fullscreen toggle logic
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change events (e.g. via ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    fetchTestDetails();
  }, [testId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || isFinished || isLoading) return;
    
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isLoading]);

  const fetchTestDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/student/tests/${testId}`);
      if (response.data.success) {
        setTest(response.data.test);
        
        // Shuffle questions using Fisher-Yates algorithm
        const shuffledQuestions = [...response.data.questions];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
        }
        setQuestions(shuffledQuestions);
        
        // Parse duration (e.g., "45 min" or "60") to seconds
        const durationStr = response.data.test.duration;
        const minutes = parseInt(durationStr.replace(/[^0-9]/g, '')) || 30; // default 30 min
        setTimeLeft(minutes * 60);
      }
    } catch (error) {
      console.error('Fetch test details error:', error);
      toast.error(error.response?.data?.message || 'Failed to load test');
      navigate('/dashboard/tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers({
      ...answers,
      [questionId]: optionKey
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`/student/tests/${testId}/submit`, { answers });
      if (response.data.success) {
        setIsFinished(true);
        setResult(response.data.result);
        toast.success('Test submitted successfully!');
      }
    } catch (error) {
      console.error('Submit test error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to submit your test now?')) {
        return;
      }
    }
    submitTest();
  };

  const handleAutoSubmit = () => {
    toast.error("Time's up! Auto-submitting test...", { duration: 4000 });
    submitTest();
  };

   if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Preparing your test environment...</p>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <div className={`min-h-screen transition-colors duration-500 flex flex-col items-center py-12 px-4 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`${isDarkMode ? 'glass-dark' : 'bg-white shadow-xl'} rounded-3xl p-8 max-w-3xl w-full space-y-8 border ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          
          {/* Header Summary */}
          <div className="text-center space-y-6">
            <div className={`w-24 h-24 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-500'} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>Test Completed!</h2>
              <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>You have successfully submitted the test. Here is your detailed analysis.</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-2xl border p-6 space-y-4 max-w-lg mx-auto`}>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-slate-900 shadow-xl border border-white/5' : 'bg-white shadow-sm border border-slate-100'} rounded-xl p-4 text-center`}>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Score</p>
                  <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-primary-600'}`}>{result.score} <span className={`text-base ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/ {result.totalMarks}</span></p>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-900 shadow-xl border border-white/5' : 'bg-white shadow-sm border border-slate-100'} rounded-xl p-4 text-center`}>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-400'} uppercase tracking-wider mb-1`}>Grade</p>
                  <p className={`text-3xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{result.grade}</p>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-200'} h-4 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full rounded-full ${result.percentage >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${result.percentage}%` }}
                />
              </div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{result.percentage.toFixed(1)}% Achieved</p>
            </div>
          </div>

          <hr className={isDarkMode ? 'border-white/5' : 'border-slate-100'} />

          {/* Detailed Report */}
          <div className="space-y-6">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Detailed Report</h3>
            {result.detailedReport?.map((item, index) => (
              <div key={item.questionId} className={`p-6 rounded-2xl border-2 ${item.isCorrect ? (isDarkMode ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/30') : (isDarkMode ? 'border-rose-500/20 bg-rose-500/5' : 'border-rose-100 bg-rose-50/30')}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm ${item.isCorrect ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') : (isDarkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600')}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-bold leading-snug ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>{item.question}</h4>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} mt-1 uppercase tracking-wider`}>{item.marks} Marks</p>
                  </div>
                </div>

                <div className="space-y-3 pl-12">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    if (!item.options[opt]) return null;
                    
                    const isSelected = item.studentAnswer === opt;
                    const isCorrectOption = item.correctAnswer === opt;
                    
                    let bgClass = isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-200";
                    let textClass = isDarkMode ? "text-slate-400" : "text-slate-600";
                    let icon = null;

                    if (isCorrectOption) {
                      bgClass = isDarkMode ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-100 border-emerald-300";
                      textClass = isDarkMode ? "text-emerald-400 font-bold" : "text-emerald-800 font-bold";
                      icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                    } else if (isSelected && !isCorrectOption) {
                      bgClass = isDarkMode ? "bg-rose-500/20 border-rose-500/30" : "bg-rose-100 border-rose-300";
                      textClass = isDarkMode ? "text-rose-400 font-bold" : "text-rose-800 font-bold";
                      icon = <AlertCircle className="w-4 h-4 text-rose-500" />;
                    }

                    return (
                      <div key={opt} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass}`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${isCorrectOption ? (isDarkMode ? 'bg-emerald-500/30 text-emerald-400' : 'bg-emerald-200 text-emerald-800') : isSelected ? (isDarkMode ? 'bg-rose-500/30 text-rose-400' : 'bg-rose-200 text-rose-800') : (isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500')}`}>
                            {opt}
                          </span>
                          <span className={`${textClass} text-sm`}>{item.options[opt]}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                  
                  {!item.studentAnswer && (
                    <div className="mt-2 text-sm font-bold text-amber-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" /> You omitted this question.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={() => navigate('/dashboard/tests')}
              className={`w-full py-4 ${isDarkMode ? 'bg-primary-600 hover:bg-primary-500' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-xl font-bold shadow-lg transition-all active:scale-95`}
            >
              Go Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-colors duration-500 flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} ${isFullscreen ? 'h-screen overflow-y-auto' : ''}`}
    >
      {/* Test Header */}
      <header className={`border-b sticky top-0 z-10 shadow-sm transition-colors duration-500 ${isFullscreen ? 'py-2' : ''} ${isDarkMode ? 'bg-slate-900/80 backdrop-blur-md border-white/5' : 'bg-white border-slate-200'}`}>
        <div className={`${isFullscreen ? 'max-w-full px-6' : 'max-w-7xl px-4 lg:px-8'} mx-auto h-20 flex items-center justify-between`}>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block">
              <h1 className={`text-xl font-black uppercase tracking-wide truncate max-w-xs sm:max-w-md ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{test?.title}</h1>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{test?.course}</p>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2.5 rounded-lg transition-all ${isDarkMode ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
               >
                 {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               </button>
               <button 
                onClick={toggleFullscreen}
                className={`p-2.5 rounded-lg transition-all ${isFullscreen ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
               >
                 {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
               </button>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 border-l border-white/5 pl-4 sm:pl-6">
            <div className={`flex flex-col items-end ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Time Left</span>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 opacity-60" />
                <span className="text-2xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Finish Test'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto flex flex-col lg:flex-row gap-8 ${isFullscreen ? 'max-w-full px-6 py-4' : 'max-w-7xl px-4 lg:px-8 py-8'}`}>
        
        {/* Left Col: Desktop Question Nav */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className={`rounded-2xl border p-5 sticky top-28 transition-colors duration-500 ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                      isCurrent 
                        ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-600 ring-offset-2' 
                        : isAnswered 
                          ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
                          : (isDarkMode ? 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200')
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className={`mt-8 pt-6 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-emerald-500/40 border border-emerald-500/50' : 'bg-emerald-100 border border-emerald-200'}`}></div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Answered ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-slate-100 border border-slate-200'}`}></div>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>Unanswered ({questions.length - Object.keys(answers).length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Question View */}
        <div className="flex-1">
          {questions.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center text-slate-500 flex flex-col items-center shadow-sm ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200'}`}>
              <AlertCircle className="w-12 h-12 mb-4 text-slate-700 opacity-20" />
              <p className="font-bold">No questions found for this test.</p>
            </div>
          ) : (
            <>
              <div className={`rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full min-h-[500px] transition-colors duration-500 ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-200'}`}>
              
              {/* Question Meta */}
              <div className={`px-8 py-6 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50/50'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-primary-600/30 text-white border-primary-500/40 shadow-lg shadow-primary-500/10' : 'bg-primary-50 text-primary-600 border-primary-100'}`}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Marks: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{currentQuestion.marks} Marks</span>
                </span>
              </div>

              {/* Question Text */}
              <div className="p-8 pb-4 flex-1">
                <h2 className={`text-xl sm:text-3xl font-bold leading-tight mb-10 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {currentQuestion.question}
                </h2>

                {/* Options */}
                <div className="space-y-4">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optionText = currentQuestion.options[optKey];
                    if (!optionText) return null;
                    const isSelected = answers[currentQuestion.id] === optKey;

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                        className={`w-full text-left p-4 sm:p-6 rounded-[1.5rem] border-2 transition-all group flex items-center sm:items-start gap-4 sm:gap-5 ${
                          isSelected 
                            ? (isDarkMode ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_50px_rgba(79,70,229,0.1)] ring-1 ring-primary-500/20' : 'border-primary-500 bg-primary-50 shadow-sm ring-1 ring-primary-500/20') 
                            : (isDarkMode ? 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10' : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50')
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm transition-all ${
                          isSelected 
                            ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/40' 
                            : (isDarkMode ? 'bg-white/5 text-slate-500 group-hover:bg-white/10' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200')
                        }`}>
                          {optKey}
                        </div>
                        <span className={`text-sm sm:text-base font-bold flex-1 pt-0 sm:pt-2 ${isSelected ? (isDarkMode ? 'text-white' : 'text-primary-900') : (isDarkMode ? 'text-slate-300' : 'text-slate-700')}`}>
                          {optionText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next Controls */}
              <div className={`p-4 sm:p-8 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isDarkMode ? 'text-slate-500 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-20`}
                >
                  <ChevronLeft className="w-5 h-5" /> Previous<span className="hidden sm:inline"> Question</span>
                </button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                  <button
                    onClick={handleManualSubmit}
                    disabled={isSubmitting}
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                  >
                    Submit Test <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                    className={`px-6 sm:px-10 py-3 sm:py-4 ${isDarkMode ? 'bg-primary-600 hover:bg-primary-500' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-xl active:scale-95 disabled:opacity-30`}
                  >
                    Next<span className="hidden sm:inline"> Question</span> <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Question Navigator (Horizontal) */}
            <div className="lg:hidden mt-8 overflow-x-auto pb-6 scrollbar-hide">
              <div className="flex gap-3 w-max px-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-12 h-12 flex-shrink-0 rounded-2xl font-black text-sm flex items-center justify-center transition-all ${
                        isCurrent 
                          ? 'bg-primary-600 text-white shadow-xl ring-2 ring-primary-600 ring-offset-2' 
                          : isAnswered 
                            ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
                            : (isDarkMode ? 'bg-white/5 text-slate-500 border border-white/5' : 'bg-white text-slate-500 border border-slate-200 shadow-sm')
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

