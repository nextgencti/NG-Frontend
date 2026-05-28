import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Loader2, Sun, Moon, Maximize, Minimize, Download, Sparkles, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // Robust, cross-browser Fullscreen toggle logic (supports iOS/Safari, Firefox, and IE/Edge)
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    const element = containerRef.current;

    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      // Request Fullscreen
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          toast.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (element.webkitRequestFullscreen) { /* Safari / iOS */
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
      } else {
        toast.error("Fullscreen mode is not supported on this device/browser.");
      }
      setIsFullscreen(true);
    } else {
      // Exit Fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || 
           document.webkitFullscreenElement || 
           document.mozFullScreenElement || 
           document.msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
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
      const searchParams = new URLSearchParams(location.search);
      const isViewResult = searchParams.get('view') === 'result';

      if (isViewResult) {
        try {
          const response = await api.get(`/student/tests/${testId}/result`, {
            validateStatus: (status) => status < 500
          });
          if (response.status === 200 && response.data.success && response.data.result) {
            const resultData = response.data.result;
            setTest({
              title: resultData.testTitle || 'Test',
              course: resultData.testCourse || 'Course'
            });
            if (resultData.percentage === undefined && resultData.score !== undefined && resultData.totalMarks) {
              resultData.percentage = (resultData.score / resultData.totalMarks) * 100;
            }
            if (!resultData.grade) {
              const pct = resultData.percentage || 0;
              if (pct >= 90) resultData.grade = 'A+';
              else if (pct >= 80) resultData.grade = 'A';
              else if (pct >= 70) resultData.grade = 'B';
              else if (pct >= 60) resultData.grade = 'C';
              else if (pct >= 50) resultData.grade = 'D';
              else resultData.grade = 'F';
            }
            setResult(resultData);
            setIsFinished(true);
          } else {
            // Handled gracefully: No matching result found in the database (either 404 or success: false)
            setTest({ title: 'Test Result', course: '' });
            setResult({ score: 0, totalMarks: 0, percentage: 0, grade: 'N/A', detailedReport: [] });
            setIsFinished(true);
            toast.error(response.data?.message || 'No results found for this test. Please attempt the test first.');
          }
        } catch (resultErr) {
          console.error('Fetch result error:', resultErr);
          setTest({ title: 'Test Result', course: '' });
          setResult({ score: 0, totalMarks: 0, percentage: 0, grade: 'N/A', detailedReport: [] });
          setIsFinished(true);
          toast.error(resultErr.response?.data?.message || 'No results found for this test. Please attempt the test first.');
        }
      } else {
        const response = await api.get(`/student/tests/${testId}`);
        if (response.data.success) {
          setTest(response.data.test);
          
          const shuffledQuestions = [...response.data.questions];
          for (let i = shuffledQuestions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
          }
          setQuestions(shuffledQuestions);
          
          const durationStr = response.data.test.duration;
          const minutes = parseInt(durationStr.replace(/[^0-9]/g, '')) || 30;
          setTimeLeft(minutes * 60);
        }
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
      <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50'}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 border-4 border-primary-100 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse mt-4">Calibrating Focus Room…</p>
      </div>
    );
  }

  if (isFinished && result) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen transition-colors duration-500 flex flex-col items-center py-10 px-4 bg-dashboard-grid bg-repeat ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
      >
        <div className={`${isDarkMode ? 'glass-dark bg-slate-900 border-white/5' : 'bg-white shadow-[0_24px_50px_rgba(0,0,0,0.02)]'} rounded-[36px] p-6 md:p-10 max-w-3xl w-full space-y-8 border ${isDarkMode ? '' : 'border-slate-100'} relative`}>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              html, body, #root, .flex-1, .overflow-auto, .overflow-hidden, .min-h-screen {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                display: block !important;
                position: static !important;
                background: white !important;
                color: black !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .print\\:hidden, aside, nav, [role="navigation"], .fixed.bottom-0, .fixed.top-0, .lg\\:hidden {
                display: none !important;
              }
              button, header, footer { display: none !important; }
              .max-w-3xl {
                display: block !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                background: white !important;
              }
              h2, h3, h4, p, span, div { color: #000000 !important; }
              .print-card {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                margin-bottom: 24px !important;
                background: white !important;
                border: 1px solid #E2E8F0 !important;
              }
            }
          `}} />

          {/* Action Header */}
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-5 print:hidden">
            <button
              onClick={() => navigate('/dashboard/tests')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-white/5 active:scale-95 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" /> Back to List
            </button>
            
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer border border-[#4F46E5] hover:border-[#4338CA]"
            >
              <Download className="w-4 h-4 text-white/90" /> Print Summary
            </button>
          </div>
          
          {/* Header Summary */}
          <div className="text-center space-y-5">
            <div className={`w-20 h-20 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'} rounded-full flex items-center justify-center mx-auto shadow-inner`}>
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary-50 dark:bg-white/5 border border-primary-100/30 dark:border-white/5 text-[9px] font-black text-primary-600 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-amber-500" /> {test?.course || 'Assessment'}
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} mt-2 uppercase tracking-tight`}>
                {test?.title || 'Assessment Complete'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-1 font-medium`}>Assessment scorecard has been generated successfully.</p>
            </div>
            
            <div className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-3xl border p-6 space-y-4 max-w-md mx-auto`}>
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-slate-800 border border-white/5' : 'bg-white border border-slate-100'} rounded-2xl p-4 text-center shadow-sm`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Final Score</p>
                  <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-primary-600'}`}>
                    {result.score ?? 0} <span className="text-xs sm:text-sm text-slate-400 font-medium">/ {result.totalMarks ?? 100}</span>
                  </p>
                </div>
                <div className={`${isDarkMode ? 'bg-slate-800 border border-white/5' : 'bg-white border border-slate-100'} rounded-2xl p-4 text-center shadow-sm`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Passing Grade</p>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-500 leading-none">{result.grade || 'A'}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="h-2 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${(result.percentage || 0) >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${result.percentage || 0}%` }}
                  />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{(result.percentage || 0).toFixed(1)}% Syllabus Score</p>
              </div>
            </div>
          </div>

          <hr className={isDarkMode ? 'border-white/5' : 'border-slate-50'} />

          {/* Question Details Report */}
          <div className="space-y-6">
            <h3 className={`text-base font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Question Assessment Details</h3>
            
            <div className="space-y-4">
              {(result.detailedReport || []).map((item, index) => (
                <div 
                  key={item.questionId || index} 
                  className={`p-6 rounded-[28px] border-2 relative overflow-hidden print-card ${
                    item.isCorrect 
                      ? (isDarkMode ? 'border-emerald-500/10 bg-emerald-500/5' : 'border-emerald-100 bg-emerald-50/20') 
                      : (isDarkMode ? 'border-rose-500/10 bg-rose-500/5' : 'border-rose-100 bg-rose-50/20')
                  }`}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                      item.isCorrect 
                        ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-250') 
                        : (isDarkMode ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-100 text-rose-700 border border-rose-250')
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-base font-black leading-snug uppercase ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.question}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.marks} Points</span>
                        {item.isCorrect ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[7px] font-black uppercase tracking-widest">Correct</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[7px] font-black uppercase tracking-widest">Incorrect</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pl-12">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      if (!item.options || !item.options[opt]) return null;
                      
                      const isSelected = item.studentAnswer === opt;
                      const isCorrectOption = item.correctAnswer === opt;
                      
                      let bgClass = isDarkMode ? "bg-slate-900 border-white/5" : "bg-white border-slate-100 shadow-sm";
                      let textClass = isDarkMode ? "text-slate-400" : "text-slate-650";
                      let badge = null;

                      if (isCorrectOption) {
                        bgClass = isDarkMode ? "bg-emerald-500/20 border-emerald-500/30" : "bg-emerald-100 border-emerald-200/50 shadow-inner";
                        textClass = isDarkMode ? "text-emerald-400 font-black" : "text-emerald-800 font-black";
                        badge = <span className="text-[7.5px] font-black text-emerald-600 uppercase bg-white border border-emerald-200 px-2 py-0.5 rounded shadow-sm">Correct Answer</span>;
                      } else if (isSelected && !isCorrectOption) {
                        bgClass = isDarkMode ? "bg-rose-500/20 border-rose-500/30" : "bg-rose-100 border-rose-200/50 shadow-inner";
                        textClass = isDarkMode ? "text-rose-400 font-black" : "text-rose-800 font-black";
                        badge = <span className="text-[7.5px] font-black text-rose-600 uppercase bg-white border border-rose-200 px-2 py-0.5 rounded shadow-sm">Your Choice</span>;
                      } else if (isSelected) {
                        badge = <span className="text-[7.5px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">Your Choice</span>;
                      }

                      return (
                        <div key={opt} className={`flex items-center justify-between p-3 rounded-2xl border ${bgClass}`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                              isCorrectOption ? (isDarkMode ? 'bg-emerald-500/30 text-emerald-400' : 'bg-emerald-200 text-emerald-800') 
                                : isSelected ? (isDarkMode ? 'bg-rose-500/30 text-rose-400' : 'bg-rose-200 text-rose-800') 
                                : (isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-450')
                            }`}>
                              {opt}
                            </span>
                            <span className={`${textClass} text-xs font-semibold`}>{item.options[opt]}</span>
                          </div>
                          {badge}
                        </div>
                      );
                    })}
                    
                    {!item.studentAnswer && (
                      <div className="mt-3 text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 animate-bounce" /> Omitted Question.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-white/5">
            <button
              onClick={() => navigate('/dashboard/tests')}
              className="w-full py-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all active:scale-95 cursor-pointer border border-[#4F46E5] hover:border-[#4338CA]"
            >
              Go Back to Assessments Center
            </button>
          </div>

        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-colors duration-500 flex flex-col font-sans select-none ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-[#F8FAFC]'}`}
    >
      {/* Immersive distraction-free header bar */}
      <header className={`border-b sticky top-0 z-30 transition-colors duration-500 backdrop-blur-md shadow-sm ${
        isDarkMode ? 'bg-slate-900/80 border-white/5' : 'bg-white/95 border-slate-100'
      }`}>
        <div className="max-w-7xl px-3 sm:px-6 lg:px-8 mx-auto h-20 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-5 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className={`text-[13px] sm:text-base font-black uppercase tracking-wide truncate max-w-[80px] xs:max-w-[120px] sm:max-w-md ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{test?.title}</h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[7.5px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 dark:bg-white/5 border border-primary-100/30 px-1.5 py-0.5 rounded truncate max-w-[60px] xs:max-w-[90px] sm:max-w-none">{test?.course || 'Test exam'}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Environment Active</span>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-white/5 p-0.5 rounded-lg border border-slate-150/40 dark:border-white/5 shrink-0 ml-1.5">
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-1.5 rounded-md transition-all text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer flex items-center justify-center"
               >
                 {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
               </button>
               <button 
                onClick={toggleFullscreen}
                className="p-1.5 rounded-md transition-all text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white cursor-pointer flex items-center justify-center active:scale-90"
                title="Toggle Fullscreen"
               >
                 {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
               </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6 shrink-0 border-l border-slate-100 dark:border-white/5 pl-2 sm:pl-6">
            <div className={`flex flex-col items-end ${timeLeft < 300 ? 'text-rose-500 animate-pulse font-black' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-400 mb-0.5 leading-none hidden xs:inline">Time Left</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 opacity-55" />
                <span className="text-sm sm:text-2xl font-black font-mono tracking-widest leading-none">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <button
              onClick={handleManualSubmit}
              disabled={isSubmitting}
              className="px-3 sm:px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSubmitting ? 'Submitting…' : (
                <>
                  <span className="sm:hidden">Finish</span>
                  <span className="hidden sm:inline">Finish Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Floating progress line */}
      <div className="h-1 w-full bg-slate-100 dark:bg-white/5 sticky top-20 z-30 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / (questions.length || 1)) * 100}%` }}
        />
      </div>

      {/* Main Focus Area */}
      <main className={`flex-1 w-full mx-auto flex flex-col lg:flex-row gap-8 ${isFullscreen ? 'max-w-full px-6 py-6' : 'max-w-7xl px-4 lg:px-8 py-8'}`}>
        
        {/* Left Side: Desktop Question Navigator Grid */}
        <div className="hidden lg:block w-64 shrink-0">
          <div 
            className={`rounded-[28px] border p-5 sticky top-28 transition-colors duration-500 flex flex-col ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}
            style={{ maxHeight: 'calc(100vh - 160px)' }}
          >
            <h3 className={`text-[9px] font-black uppercase tracking-widest mb-4.5 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Questions Matrix</h3>
            <div className="grid grid-cols-4 gap-2 overflow-y-auto pr-1.5 custom-scrollbar flex-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentQuestionIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isCurrent 
                        ? (isDarkMode 
                            ? 'bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white shadow-[0_8px_25px_rgba(99,102,241,0.4)] scale-105 border border-[#6366F1]/55 ring-2 ring-[#6366F1]/30' 
                            : 'bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-[0_6px_20px_rgba(79,70,229,0.35)] scale-105 border border-[#4F46E5]/40 ring-2 ring-[#4F46E5]/20') 
                        : isAnswered 
                          ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100/80')
                          : (isDarkMode ? 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm')
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className={`mt-4 pt-4 border-t flex flex-col gap-2 text-[8px] font-black uppercase tracking-widest shrink-0 ${isDarkMode ? 'border-white/10' : 'border-slate-50'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-md shrink-0 ${isDarkMode ? 'bg-emerald-500/20 border border-emerald-500/35' : 'bg-emerald-100 border border-emerald-200/60'}`}></div>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-650'}>Answered ({Object.keys(answers).length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3.5 h-3.5 rounded-md shrink-0 ${isDarkMode ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-150/40'}`}></div>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-650'}>Unanswered ({questions.length - Object.keys(answers).length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Questions Viewer */}
        <div className="flex-1">
          {questions.length === 0 ? (
            <div className={`rounded-3xl border p-16 text-center flex flex-col items-center justify-center ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <AlertCircle className="w-12 h-12 mb-4 text-slate-350" />
              <p className="font-black text-slate-700 uppercase tracking-wide text-xs">No questions loaded for this assessment.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              
              <div className={`rounded-[32px] border overflow-hidden flex flex-col transition-colors duration-500 ${isDarkMode ? 'glass-dark border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                
                {/* Meta Bar */}
                <div className={`px-6 py-4.5 border-b flex justify-between items-center ${isDarkMode ? 'border-white/5 bg-slate-900/50' : 'border-slate-50 bg-slate-50/20'}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-[#EEF2FF] dark:bg-white/5 text-[#4F46E5] dark:text-[#818CF8] border border-[#C7D2FE]/40 dark:border-white/5 rounded-lg shadow-sm">
                    Q: {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Points: <span className={isDarkMode ? 'text-white' : 'text-slate-850'}>{currentQuestion.marks} Mark</span>
                  </span>
                </div>

                {/* Question Screen */}
                <div className="p-6 sm:p-8">
                  <h2 className={`text-lg sm:text-2xl font-black leading-snug mb-8 uppercase ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
                    {currentQuestion.question}
                  </h2>

                  {/* Choice Tiles */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optionText = currentQuestion.options[optKey];
                      if (!optionText) return null;
                      const isSelected = answers[currentQuestion.id] === optKey;

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectOption(currentQuestion.id, optKey)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group flex items-start gap-4 cursor-pointer ${
                            isSelected 
                              ? (isDarkMode 
                                  ? 'border-[#6366F1] bg-[#6366F1]/10 shadow-[0_8px_30px_rgba(99,102,241,0.15)] scale-[1.01]' 
                                  : 'border-[#4F46E5] bg-[#EEF2FF]/70 shadow-[0_8px_25px_rgba(79,70,229,0.06)] scale-[1.01]') 
                              : (isDarkMode 
                                  ? 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10' 
                                  : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50')
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-xs transition-all duration-300 ${
                            isSelected 
                              ? (isDarkMode ? 'bg-[#6366F1] text-white shadow-md' : 'bg-[#4F46E5] text-white shadow-md') 
                              : (isDarkMode ? 'bg-white/5 text-slate-500 group-hover:bg-white/10' : 'bg-slate-50 text-slate-450 group-hover:bg-slate-100')
                          }`}>
                            {optKey}
                          </div>
                          <span className={`text-xs font-semibold flex-1 pt-1.5 transition-colors duration-300 ${
                            isSelected 
                              ? (isDarkMode ? 'text-white font-bold' : 'text-[#4F46E5] font-bold') 
                              : (isDarkMode ? 'text-slate-400' : 'text-slate-650')
                          }`}>
                            {optionText}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className={`p-4 sm:p-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-colors duration-500 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50/50 border-slate-100'}`}>
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer ${isDarkMode ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-20`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous Question
                  </button>
                  
                  {currentQuestionIndex === questions.length - 1 ? (
                    <button
                      onClick={handleManualSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-600/10 active:scale-95 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
                    >
                      Finish Test & Submit <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                      className="px-6 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-30 cursor-pointer w-full sm:w-auto border border-[#4F46E5] hover:border-[#4338CA]"
                    >
                      Next Question <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Mobile Question list bar (horizontal) */}
              <div className="lg:hidden mt-6 overflow-x-auto select-none">
                <div className="flex gap-2.5 w-max py-2 px-1">
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = idx === currentQuestionIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-11 h-11 flex-shrink-0 rounded-xl font-black text-xs flex items-center justify-center transition-all duration-300 cursor-pointer ${
                          isCurrent 
                            ? (isDarkMode 
                                ? 'bg-gradient-to-tr from-[#6366F1] to-[#818CF8] text-white shadow-[0_8px_25px_rgba(99,102,241,0.4)] scale-105 border border-[#6366F1]/55 ring-2 ring-[#6366F1]/30' 
                                : 'bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] text-white shadow-[0_6px_20px_rgba(79,70,229,0.35)] scale-105 border border-[#4F46E5]/40 ring-2 ring-[#4F46E5]/20') 
                            : isAnswered 
                              ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60')
                              : (isDarkMode ? 'bg-white/5 text-slate-400 border border-white/5' : 'bg-white text-slate-500 border border-slate-200 shadow-sm')
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
