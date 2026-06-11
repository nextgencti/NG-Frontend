import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Keyboard, RefreshCw, Zap, ArrowRight, Settings, 
  Volume2, VolumeX, Smile, Eye, EyeOff, Edit3, BarChart2, Clock, 
  RotateCcw, History, Sparkles, BookOpen, SmilePlus
} from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import api from '../../lib/axios';

// Mechanical keyboard switch sounds synthesized using Web Audio API
const playKeyClick = (key, isSoundEnabled) => {
  if (!isSoundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    let freq = key === ' ' ? 90 : 160;
    let duration = key === ' ' ? 0.05 : 0.035;
    
    // Slight randomized pitch for natural mechanical key feel
    freq += (Math.random() - 0.5) * 15;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Fail silently if audio context is blocked
  }
};

const WORD_DATABASES = {
  english: {
    normal: [
      "the quick brown fox jumps over the lazy dog",
      "practice typing every day to master keyboard shortcut keys and improve accuracy",
      "learning to code opens up many opportunities for career growth in the digital world",
      "focus on your goals and take small steps every day towards achieving them",
      "technology is best when it brings people together and solves real problems",
      "a journey of a thousand miles begins with a single step forward in life",
      "success is not final failure is not fatal it is the courage to continue that counts",
      "education is the most powerful weapon which you can use to change the world",
      "the only way to do great work is to love what you do and never give up",
      "nextgen training institute empowers students to achieve their career dreams"
    ],
    advanced: [
      "NextGen Computer Training Institute (NGCTI) was established in 2018, providing top-tier certifications!",
      "To run a local React app, developers execute: 'npm run dev', which launches a Vite-powered server on port 5173.",
      "Success is not final; failure is not fatal: it is the courage to continue that counts in the end.",
      "The rapid rise of AI tools, e.g., ChatGPT, Gemini, and Copilot, has transformed modern software engineering forever.",
      "Coding isn't just about writing code; it's about solving complex problems efficiently under tight deadlines.",
      "JavaScript, Python, C++, Java, and Go are some of the most popular programming languages in the world today."
    ]
  },
  javascript: {
    normal: [
      "const calculateWpm = (chars, time) => Math.round((chars / 5) / time);",
      "const [wpm, setWpm] = useState(0); useEffect(() => { return () => {}; }, []);",
      "function handleKeyDown(event) { if (event.key === 'Backspace') { handleBackspace(); } }",
      "const data = items.filter(item => item.active).map(item => item.value);",
      "export default function TypingTest() { return <div className='container' />; }",
      "const root = createRoot(document.getElementById('root')); root.render(<App />);",
      "console.log('User typed: ' + inputVal + ' with accuracy: ' + accuracy + '%');"
    ],
    advanced: [
      "import React, { useState, useEffect, useRef } from 'react'; export default function App() { return <div />; }",
      "const renderChart = (data) => { const maxVal = Math.max(...data.map(d => d.wpm)); return maxVal; };",
      "try { await fetch('/api/stats', { method: 'POST', body: JSON.stringify(stats) }); } catch (err) { console.error(err); }",
      "const memoizedCallback = useCallback(() => { doSomething(a, b); }, [a, b]);",
      "const reduced = array.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.name }), {});"
    ]
  },
  numbers: {
    normal: [
      "10 + 20 = 30; 50 * 2 = 100; 99 / 9 = 11; 45 - 15 = 30; 123 456 789 0",
      "789 + 123 = 912; 456 - 200 = 256; 333 * 3 = 999; 888 / 4 = 222; 0123456789",
      "12 + 34 + 56 = 102; 98 - 76 - 12 = 10; 4 * 5 * 6 = 120; 240 / 6 = 40; 11 22 33 44",
      "1000 - 550 = 450; 25 * 40 = 1000; 750 / 25 = 30; 100 + 200 - 50 = 250; 5555"
    ],
    advanced: [
      "The client's phone number is +1-555-019-2834, and their account balance is $10,450.75 (updated on 2026-06-11).",
      "Pi value is approximately 3.14159265; Golden Ratio is 1.618; Euler number e is 2.71828; coordinate is (45.32, -122.05).",
      "ISBN-13 is 978-3-16-148410-0; Order #98234-A; Serial: 550E8400-E29B-41D4-A716-446655440000; Year: 2026.",
      "The average height was 1.75m, standard deviation was 0.05m, and variance was 0.0025m^2 for N = 1500 students."
    ]
  }
};

export default function TypingTest() {
  const navigate = useNavigate();

  // Settings State
  const [language, setLanguage] = useState('english'); // english | javascript | numbers
  const [mode, setMode] = useState('normal'); // normal | advanced
  const [duration, setDuration] = useState(60); // 15 | 30 | 60 | 120 seconds
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [smileyType, setSmileyType] = useState('happy'); // happy | wink | neutral
  const [fontSize, setFontSize] = useState('md'); // xs | sm | md | lg | xl
  const [rowLimit, setRowLimit] = useState(3); // lines limit / text length multiplier
  const [showLiveWPM, setShowLiveWPM] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [isEyeActive, setIsEyeActive] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isCustomTextActive, setIsCustomTextActive] = useState(false);

  // Custom DB State
  const [customDatabases, setCustomDatabases] = useState(WORD_DATABASES);

  useEffect(() => {
    const fetchCustomParagraphs = async () => {
      try {
        const response = await api.get('/public/typing-paragraphs');
        if (response.data.success && response.data.paragraphs.length > 0) {
          const merged = JSON.parse(JSON.stringify(WORD_DATABASES));
          response.data.paragraphs.forEach(para => {
            if (merged[para.language] && merged[para.language][para.mode]) {
              merged[para.language][para.mode].push(para.text);
            }
          });
          setCustomDatabases(merged);
        }
      } catch (error) {
        console.error('Failed to fetch custom paragraphs', error);
      }
    };
    fetchCustomParagraphs();
  }, []);

  // Core Typing Tester State
  const [textToType, setTextToType] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [startTime, setStartTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [backspaces, setBackspaces] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Live Stats & Graph Data
  const [secStats, setSecStats] = useState([]); // [{ second, wpm, errors, modifications }]
  const [currentSecErrors, setCurrentSecErrors] = useState(0);
  const [currentSecBackspaces, setCurrentSecBackspaces] = useState(0);
  const [testHistory, setTestHistory] = useState([]);

  // Refs for tracking values inside timing intervals
  const typedTextRef = useRef('');
  const textToTypeRef = useRef('');
  const currentSecErrorsRef = useRef(0);
  const currentSecBackspacesRef = useRef(0);
  const inputRef = useRef(null);

  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  useEffect(() => {
    textToTypeRef.current = textToType;
  }, [textToType]);

  useEffect(() => {
    currentSecErrorsRef.current = currentSecErrors;
  }, [currentSecErrors]);

  useEffect(() => {
    currentSecBackspacesRef.current = currentSecBackspaces;
  }, [currentSecBackspaces]);

  // Generate current typing text
  const generateText = () => {
    if (isCustomTextActive && customText.trim()) {
      return customText.trim();
    }
    const db = customDatabases[language][mode] || WORD_DATABASES[language][mode];
    const sentenceCount = Math.max(1, Math.min(rowLimit, db.length));
    const selected = [];
    
    // Pick randomly to ensure variety
    for (let i = 0; i < sentenceCount; i++) {
      selected.push(db[Math.floor(Math.random() * db.length)]);
    }
    return selected.join(' ');
  };

  // Reset Test
  const resetTest = () => {
    setTypedText('');
    setIsStarted(false);
    setIsFinished(false);
    setTimeLeft(duration);
    setStartTime(null);
    setErrors(0);
    setBackspaces(0);
    setSecStats([]);
    setCurrentSecErrors(0);
    setCurrentSecBackspaces(0);
    const newText = generateText();
    setTextToType(newText);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
      }
    }, 50);
  };

  // Re-generate text on database setting changes
  useEffect(() => {
    resetTest();
  }, [language, mode, rowLimit, isCustomTextActive, duration, customDatabases]);

  // Focus caret when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Timer Countdown and Stats Logging
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true);
          clearInterval(timer);
          return 0;
        }

        const elapsedSec = duration - (prev - 1);
        const currentTyped = typedTextRef.current;
        const targetText = textToTypeRef.current;
        
        // Count correct characters
        let correctCount = 0;
        const minLen = Math.min(currentTyped.length, targetText.length);
        for (let i = 0; i < minLen; i++) {
          if (currentTyped[i] === targetText[i]) correctCount++;
        }

        const elapsedMin = elapsedSec / 60;
        const currentWpm = elapsedMin > 0 ? Math.round((correctCount / 5) / elapsedMin) : 0;

        // Log stats for graph
        setSecStats(stats => [
          ...stats,
          {
            second: elapsedSec,
            wpm: currentWpm,
            errors: currentSecErrorsRef.current,
            modifications: currentSecBackspacesRef.current
          }
        ]);

        // Reset per-second trackers
        setCurrentSecErrors(0);
        setCurrentSecBackspaces(0);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, duration]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const val = e.target.value;
    if (isFinished) return;

    if (!isStarted && val.length > 0) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    // Detect new character typing and track errors
    if (val.length > typedText.length) {
      const addedCharIndex = val.length - 1;
      if (addedCharIndex < textToType.length) {
        const typedChar = val[addedCharIndex];
        const targetChar = textToType[addedCharIndex];
        if (typedChar !== targetChar) {
          setErrors(prev => prev + 1);
          setCurrentSecErrors(prev => prev + 1);
        }
      }
    }

    setTypedText(val);

    // End test if the text is fully typed
    if (val.length >= textToType.length) {
      setIsFinished(true);
    }
  };

  // Keyboard Click Audio & backspaces
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      resetTest();
      return;
    }
    
    if (isFinished) return;

    playKeyClick(e.key, isSoundEnabled);

    if (e.key === 'Backspace') {
      setBackspaces(prev => prev + 1);
      setCurrentSecBackspaces(prev => prev + 1);
    }
  };

  // Global keyboard shortcuts (F1 - F4)
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        resetTest();
      } else if (e.key === 'F2') {
        e.preventDefault();
        setLanguage(prev => {
          const list = ['english', 'javascript', 'numbers'];
          const nextIdx = (list.indexOf(prev) + 1) % list.length;
          return list[nextIdx];
        });
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsSoundEnabled(prev => !prev);
      } else if (e.key === 'F4') {
        e.preventDefault();
        setShowLiveWPM(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [language, isSoundEnabled, showLiveWPM, duration, mode, rowLimit, customText, isCustomTextActive]);

  // Duration toggle handler
  const toggleDuration = () => {
    const list = [60, 120, 300, 600];
    const nextIdx = (list.indexOf(duration) + 1) % list.length;
    setDuration(list[nextIdx]);
  };

  // Calculate live statistics
  const getLiveStats = () => {
    let correctChars = 0;
    const minLen = Math.min(typedText.length, textToType.length);
    for (let i = 0; i < minLen; i++) {
      if (typedText[i] === textToType[i]) correctChars++;
    }

    const elapsedMin = startTime ? (Date.now() - startTime) / 60000 : 0;
    const currentWPM = elapsedMin > 0.005 ? Math.round((correctChars / 5) / elapsedMin) : 0;
    const totalAttempted = correctChars + errors;
    const currentAcc = totalAttempted > 0 ? Math.round((correctChars / totalAttempted) * 100) : 100;

    return { wpm: currentWPM, accuracy: currentAcc, correct: correctChars };
  };

  const liveWpmVal = getLiveStats().wpm;
  const liveAccVal = getLiveStats().accuracy;

  // Custom font size mapper
  const getFontSizeStyle = () => {
    switch (fontSize) {
      case 'xs': return 'text-sm';
      case 'sm': return 'text-base';
      case 'md': return 'text-lg md:text-xl';
      case 'lg': return 'text-xl md:text-2xl';
      case 'xl': return 'text-2xl md:text-3xl';
      default: return 'text-lg md:text-xl';
    }
  };

  // Word-by-word visual rendering with cursor tracking
  const renderTextScroller = () => {
    const words = textToType.split(' ');
    let absoluteCharCounter = 0;

    return words.map((word, wordIdx) => {
      const wordStartIndex = absoluteCharCounter;
      absoluteCharCounter += word.length + 1; // Count word letters + 1 for space separator
      const chars = word.split('');

      return (
        <div key={wordIdx} className="inline-block mr-2.5 mb-1.5 relative select-none">
          {chars.map((char, charIdx) => {
            const charAbsIndex = wordStartIndex + charIdx;
            const isCharTyped = charAbsIndex < typedText.length;
            const isCharCorrect = isCharTyped && typedText[charAbsIndex] === char;
            const isCursorHere = charAbsIndex === typedText.length;

            let charColorClass = 'text-slate-500/60';
            if (isCharTyped) {
              charColorClass = isCharCorrect ? 'text-slate-200' : 'text-rose-500 underline decoration-rose-500/65 decoration-2';
            }

            return (
              <span key={charIdx} className={`relative font-mono transition-colors duration-100 ${charColorClass}`}>
                {isCursorHere && isFocused && (
                  <>
                    {/* Blinking Cursor caret */}
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[1.2em] bg-indigo-400 caret-blink rounded-sm" />
                    
                    {/* Floating live WPM badge above cursor */}
                    {showLiveWPM && isStarted && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-75 duration-200">
                        {liveWpmVal} wpm
                      </span>
                    )}
                  </>
                )}
                {isEyeActive ? char : '*'}
              </span>
            );
          })}
          
          {/* Space rendering */}
          {wordIdx < words.length - 1 && (() => {
            const spaceIndex = wordStartIndex + word.length;
            const isSpaceTyped = spaceIndex < typedText.length;
            const isSpaceCorrect = isSpaceTyped && typedText[spaceIndex] === ' ';
            const isCursorAtSpace = spaceIndex === typedText.length;

            let spaceColorClass = 'text-transparent';
            if (isSpaceTyped && !isSpaceCorrect) {
              spaceColorClass = 'bg-rose-500/20 text-rose-500 underline decoration-rose-500/65 decoration-2';
            }

            return (
              <span key="space" className={`font-mono relative ${spaceColorClass}`}>
                {isCursorAtSpace && isFocused && (
                  <>
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[1.2em] bg-indigo-400 caret-blink rounded-sm" />
                    {showLiveWPM && isStarted && (
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-75 duration-200">
                        {liveWpmVal} wpm
                      </span>
                    )}
                  </>
                )}
                &nbsp;
              </span>
            );
          })()}
        </div>
      );
    });
  };

  // Render SVG Chart
  const renderSVGChart = () => {
    if (secStats.length === 0) return null;

    const width = 600;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;

    const chartWidth = width - 2 * paddingX;
    const chartHeight = height - 2 * paddingY;

    const maxX = duration;
    const minX = 1;

    const maxWpmVal = Math.max(...secStats.map(d => d.wpm), 0);
    const maxY = Math.max(Math.ceil((maxWpmVal + 10) / 10) * 10, 50); 
    const minY = 0;

    const getX = (sec) => paddingX + ((sec - minX) / (maxX - minX)) * chartWidth;
    const getY = (wpm) => height - paddingY - ((wpm - minY) / (maxY - minY)) * chartHeight;

    let wpmPoints = secStats.map(d => ({ x: getX(d.second), y: getY(d.wpm) }));

    let lineD = "";
    if (wpmPoints.length > 0) {
      lineD = `M ${wpmPoints[0].x} ${wpmPoints[0].y}`;
      for (let i = 1; i < wpmPoints.length; i++) {
        lineD += ` L ${wpmPoints[i].x} ${wpmPoints[i].y}`;
      }
    }

    let areaD = "";
    if (wpmPoints.length > 0) {
      areaD = `${lineD} L ${wpmPoints[wpmPoints.length - 1].x} ${height - paddingY} L ${wpmPoints[0].x} ${height - paddingY} Z`;
    }

    const yTicks = [0, Math.round(maxY * 0.25), Math.round(maxY * 0.5), Math.round(maxY * 0.75), maxY];

    const xTicksCount = Math.min(10, duration);
    const xTicks = [];
    for (let i = 0; i <= xTicksCount; i++) {
      const sec = Math.round((i / xTicksCount) * duration);
      if (sec > 0) xTicks.push(sec);
    }

    return (
      <div className="w-full relative bg-slate-950/20 border border-indigo-950/60 rounded-2xl p-4 sm:p-5 select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-400 overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, idx) => {
            const y = getY(tick);
            return (
              <g key={idx}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#1E1B4B" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
                <text x={paddingX - 10} y={y + 3} textAnchor="end" className="text-[9px] font-bold fill-slate-500 font-mono">{tick}</text>
              </g>
            );
          })}

          {/* X axis labels */}
          {xTicks.map((tick, idx) => {
            const x = getX(tick);
            return (
              <text key={idx} x={x} y={height - paddingY + 14} textAnchor="middle" className="text-[9px] font-bold fill-slate-500 font-mono">{tick}</text>
            );
          })}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#chartGradient)" />}

          {/* WPM Line */}
          {lineD && (
            <path 
              d={lineD} 
              fill="none" 
              stroke="#818CF8" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_8px_rgba(99,102,241,0.4)]"
            />
          )}

          {/* Error and Modification Dots */}
          {secStats.map((d, idx) => {
            const x = getX(d.second);
            
            const errorGroup = [];
            if (d.errors > 0) {
              const yErr = height - paddingY - 10 - (d.errors * 5);
              errorGroup.push(
                <g key={`err-${idx}`}>
                  <circle cx={x} cy={yErr} r="3.5" fill="#EF4444" />
                  {d.errors > 1 && (
                    <text x={x} y={yErr - 6} textAnchor="middle" className="text-[7px] font-black fill-red-400 font-mono">{d.errors}</text>
                  )}
                </g>
              );
            }

            const modGroup = [];
            if (d.modifications > 0) {
              const yMod = height - paddingY - 26 - (d.modifications * 5);
              modGroup.push(
                <g key={`mod-${idx}`}>
                  <circle cx={x} cy={yMod} r="3.5" fill="#F97316" />
                  {d.modifications > 1 && (
                    <text x={x} y={yMod - 6} textAnchor="middle" className="text-[7px] font-black fill-orange-400 font-mono">{d.modifications}</text>
                  )}
                </g>
              );
            }

            return (
              <g key={idx}>
                {errorGroup}
                {modGroup}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex justify-center items-center gap-6 mt-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span>WPM</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Error</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span>Modifications</span>
          </div>
        </div>
      </div>
    );
  };

  const totalTimeElapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C20] via-[#13102B] to-[#0F0C20] overflow-hidden relative selection:bg-indigo-500/20" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes caret-blink-anim {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .caret-blink {
          animation: caret-blink-anim 0.9s step-end infinite;
        }
      `}</style>
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 to-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="w-[95%] max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <Logo className="w-7.5 h-7.5" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>
          <button onClick={() => navigate('/tools')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> All Tools
          </button>
        </div>
      </nav>

      <main className="w-[95%] max-w-[1600px] mx-auto px-4 sm:px-6 pt-28 pb-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/35 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-2.5">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Typing Speed Tester</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">
            Typing Speed <span className="text-indigo-400">Tester</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs max-w-lg mx-auto leading-relaxed">
            Test your keyboard typing speeds and WPM with advanced visual statistics and charts.
          </p>
        </div>

        {!isFinished ? (
          <>
            {/* Top Bar controls */}
            <div className="bg-[#151230]/65 border border-indigo-500/15 rounded-2xl px-5 py-3.5 mb-3 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-400 relative">
              {/* Language Selection */}
              <div className="flex items-center gap-2">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-900/80 border border-indigo-950 text-slate-200 text-xs rounded-xl px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500/50 font-bold"
                >
                  <option value="english">English (english)</option>
                  <option value="javascript">JavaScript (code)</option>
                  <option value="numbers">Numbers (standard)</option>
                </select>
              </div>

              {/* Mode Toggle & duration */}
              <div className="flex items-center gap-5">
                <div className="flex items-center bg-slate-950/40 rounded-xl p-1 border border-indigo-950">
                  <button 
                    onClick={() => setMode('normal')}
                    className={`px-3.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${mode === 'normal' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => setMode('advanced')}
                    className={`px-3.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${mode === 'advanced' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Advanced
                  </button>
                </div>

                {/* Duration select */}
                <button 
                  onClick={toggleDuration}
                  className="flex items-center gap-1.5 bg-slate-950/40 border border-indigo-950 px-3 py-1.5 rounded-xl hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono">
                    {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </button>

                {/* Retry */}
                <button 
                  onClick={resetTest}
                  title="Restart test (or press TAB)"
                  className="p-2 bg-slate-950/40 hover:bg-slate-950/80 border border-indigo-950 hover:text-indigo-300 rounded-xl transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Settings Gear */}
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${isSettingsOpen ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-950/40 hover:bg-slate-950/80 border-indigo-950 text-slate-400'}`}
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible settings sub-bar */}
            <div className={`grid transition-all duration-300 ease-in-out overflow-hidden`} style={{ gridTemplateRows: isSettingsOpen ? '1fr' : '0fr' }}>
              <div className="min-h-0">
                <div className="bg-[#13102B]/60 p-4 border border-indigo-500/10 rounded-2xl mb-4 flex flex-wrap gap-6 items-center justify-between text-xs font-semibold text-slate-400">
                  {/* F1-F4 rounded keys */}
                  <div className="flex gap-2">
                    {[
                      { key: 'F1', label: 'Reset' },
                      { key: 'F2', label: 'Lang' },
                      { key: 'F3', label: 'Sound' },
                      { key: 'F4', label: 'Live' }
                    ].map(item => (
                      <button 
                        key={item.key} 
                        onClick={() => {
                          if (item.key === 'F1') resetTest();
                          if (item.key === 'F2') setLanguage(prev => prev === 'english' ? 'javascript' : prev === 'javascript' ? 'numbers' : 'english');
                          if (item.key === 'F3') setIsSoundEnabled(!isSoundEnabled);
                          if (item.key === 'F4') setShowLiveWPM(!showLiveWPM);
                        }}
                        className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 font-mono hover:bg-indigo-500/25 transition-all text-[10px] cursor-pointer"
                        title={item.label}
                      >
                        {item.key}
                      </button>
                    ))}
                  </div>

                  {/* Audio & Emoji controls */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isSoundEnabled ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 border-indigo-950 text-slate-500'}`}
                      title={isSoundEnabled ? "Mute typing clicks" : "Unmute typing clicks"}
                    >
                      {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    
                    <button 
                      onClick={() => setSmileyType(prev => prev === 'happy' ? 'wink' : prev === 'wink' ? 'neutral' : 'happy')}
                      className="p-1.5 bg-slate-950/40 border border-indigo-950 text-indigo-300 rounded-lg cursor-pointer flex items-center justify-center"
                      title="Toggle visual style"
                    >
                      {smileyType === 'happy' && <Smile className="w-3.5 h-3.5" />}
                      {smileyType === 'wink' && <SmilePlus className="w-3.5 h-3.5" />}
                      {smileyType === 'neutral' && <Keyboard className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Font Sizes options */}
                  <div className="flex items-center gap-2 bg-slate-950/30 border border-indigo-950 px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Size</span>
                    {['xs', 'sm', 'md', 'lg', 'xl'].map((sz) => (
                      <button 
                        key={sz} 
                        onClick={() => setFontSize(sz)}
                        className={`px-2 py-0.5 rounded uppercase font-mono text-[10px] transition-all cursor-pointer ${fontSize === sz ? 'bg-indigo-600/35 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Lines / Content Multiplier Limit */}
                  <div className="flex items-center gap-1.5 bg-slate-950/30 border border-indigo-950 px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Lines</span>
                    {[1, 2, 3, 4, 5, 7, 10, 20, 30].map((num) => (
                      <button 
                        key={num} 
                        onClick={() => setRowLimit(num)}
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-all cursor-pointer ${rowLimit === num ? 'bg-indigo-600/35 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Duration Options */}
                  <div className="flex items-center gap-1.5 bg-slate-950/30 border border-indigo-950 px-3 py-1 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Time</span>
                    {[60, 120, 300, 600].map((time) => (
                      <button 
                        key={time} 
                        onClick={() => setDuration(time)}
                        className={`px-1.5 py-0.5 rounded font-mono text-[10px] transition-all cursor-pointer ${duration === time ? 'bg-indigo-600/35 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {time / 60}m
                      </button>
                    ))}
                  </div>

                  {/* Feature Toggles */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowLiveWPM(!showLiveWPM)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${showLiveWPM ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 border-indigo-950 text-slate-500'}`}
                      title="show live wpm above cursor"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setShowTimer(!showTimer)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${showTimer ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 border-indigo-950 text-slate-500'}`}
                      title="show timer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setIsEyeActive(!isEyeActive)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isEyeActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 border-indigo-950 text-slate-500'}`}
                      title={isEyeActive ? "Mask text characters" : "Show text characters"}
                    >
                      {isEyeActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${isEditMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-950/40 border-indigo-950 text-slate-500'}`}
                      title="Paste custom text"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Text editor mode container */}
            {isEditMode && (
              <div className="bg-[#13102B]/80 border border-indigo-500/20 rounded-2xl p-4 mb-4 text-left animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" /> Paste Custom Text
                  </h4>
                  <span className="text-[9px] text-slate-500 font-bold">Press ESC or toggle edit icon to close</span>
                </div>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste your own paragraphs here to practice typing..."
                  className="w-full h-24 bg-slate-950/60 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl p-3 text-xs font-semibold outline-none resize-none font-mono"
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      setIsCustomTextActive(true);
                      resetTest();
                    }} 
                    disabled={!customText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Apply Custom Text
                  </button>
                  {isCustomTextActive && (
                    <button 
                      onClick={() => {
                        setIsCustomTextActive(false);
                        resetTest();
                      }} 
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-indigo-300 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Reset to Database
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Hidden Input to capture typing */}
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              autoFocus
            />

            {/* Primary Interactive Typing Container */}
            <div 
              onClick={() => inputRef.current && inputRef.current.focus()}
              className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 relative shadow-2xl overflow-hidden group cursor-text text-left mb-6 min-h-[160px] flex items-center justify-center transition-all duration-300 hover:border-indigo-500/30"
            >
              {/* Unfocused Blur Overlay */}
              {!isFocused && (
                <div className="absolute inset-0 bg-[#0F0C20]/45 backdrop-blur-[3.5px] z-30 flex items-center justify-center flex-col gap-2 transition-all duration-300 animate-in fade-in">
                  <Keyboard className="w-8 h-8 text-indigo-400 animate-bounce" />
                  <p className="text-sm font-semibold text-indigo-200 tracking-wide">
                    click here to continue (or press TAB)
                  </p>
                </div>
              )}

              {/* Glowing decorative border line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-950 z-20" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-100 transition-opacity duration-500 z-30" />

              {/* Text Display area */}
              <div 
                className={`w-full leading-relaxed select-none tracking-wide text-left relative z-10 transition-all ${getFontSizeStyle()}`}
                style={{ wordBreak: 'break-word' }}
              >
                {renderTextScroller()}
              </div>

              {/* Dynamic WPM indicators inside the corner */}
              {showTimer && isStarted && (
                <div className="absolute top-4 right-5 text-indigo-400 font-mono text-xs font-bold tracking-wider z-20 bg-slate-900/50 border border-indigo-950 px-2.5 py-1 rounded-full backdrop-blur-md">
                  {timeLeft}s
                </div>
              )}
            </div>

            {/* Live Stats footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/30 border border-indigo-950/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-indigo-400">{liveWpmVal}</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Words Per Minute</span>
              </div>
              <div className="bg-slate-950/30 border border-indigo-950/40 rounded-xl p-3 text-center">
                <p className={`text-2xl font-black ${liveAccVal >= 90 ? 'text-emerald-400' : liveAccVal >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{liveAccVal}%</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Accuracy</span>
              </div>
              <div className="bg-slate-950/30 border border-indigo-950/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-indigo-400">{typedText.length}</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Characters</span>
              </div>
              <div className="bg-slate-950/30 border border-indigo-950/40 rounded-xl p-3 text-center flex flex-col items-center justify-center">
                <p className="text-xl font-black text-amber-400 flex items-center gap-1.5 leading-none">
                  {isStarted && !isFinished ? (
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  ) : '✓'}
                  <span className="text-base uppercase tracking-wider">{isFinished ? 'Done' : isStarted ? 'Type' : 'Ready'}</span>
                </p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1">Status</span>
              </div>
            </div>
          </>
        ) : (
          /* High-Fidelity Results Screen matching Image 5 */
          <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left animate-in zoom-in-95 duration-300">
            {/* Header controls inside results */}
            <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
              <div className="flex gap-4 text-slate-400">
                <button className="p-1.5 hover:text-white transition-colors"><History className="w-4 h-4" /></button>
                <button className="p-1.5 hover:text-white transition-colors"><Zap className="w-4 h-4" /></button>
                <button className="p-1.5 hover:text-white transition-colors"><Sparkles className="w-4 h-4" /></button>
                <button className="p-1.5 hover:text-white transition-colors"><BookOpen className="w-4 h-4" /></button>
              </div>
              <button 
                onClick={resetTest}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>

            {/* Metric Boxes & Chart Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {/* Left Column Stats */}
              <div className="flex flex-col gap-5 text-left md:col-span-1">
                <div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Words Per Minute</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-indigo-400 tracking-tight mt-1">
                    {liveWpmVal} <span className="text-xs font-semibold text-slate-400">wpm</span>
                  </h2>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Accuracy</span>
                  <h2 className="text-4xl sm:text-5xl font-black text-violet-400 tracking-tight mt-1">
                    {liveAccVal}%
                  </h2>
                </div>

                <div className="border-t border-indigo-950/60 pt-4 grid grid-cols-2 gap-3 text-xs font-bold">
                  <div>
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider block">Time</span>
                    <span className="text-slate-200 font-mono block mt-0.5">{totalTimeElapsed}s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider block">Mistakes</span>
                    <span className="text-rose-500 font-mono block mt-0.5">{errors}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[8px] uppercase tracking-wider block">Correct / Total</span>
                    <span className="text-emerald-400 font-mono block mt-0.5">{getLiveStats().correct} / {typedText.length}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Custom SVG graph */}
              <div className="md:col-span-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                  <span>WPM Progression Over Time</span>
                  <span className="text-[10px] text-slate-500">Language: {language} ({mode})</span>
                </div>
                {renderSVGChart()}
              </div>
            </div>

            {/* session summaries */}
            {testHistory.length > 1 && (
              <div className="mt-8 border-t border-indigo-950/60 pt-5 text-left">
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-400" /> Previous attempts this session
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {testHistory.slice(0, -1).reverse().map((entry, idx) => (
                    <div key={idx} className="bg-slate-950/35 border border-indigo-950/50 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-slate-500 uppercase tracking-wider">Attempt #{testHistory.length - 1 - idx}</span>
                        <span className="text-slate-400 text-[10px]">{entry.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400 font-mono">{entry.wpm} WPM</span>
                        <span className={`font-mono ${entry.accuracy >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{entry.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typing Instructions */}
        <div className="mt-6 bg-[#151230]/40 border border-indigo-500/10 rounded-2xl p-5 text-left">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">💡 Pro Typing Tips</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Keep your fingers rest on the middle row: A-S-D-F and J-K-L-;",
              "Avoid looking at your keyboard, keep eyes on target characters",
              "Maintain high accuracy first; speed follows naturally with practice",
              "You can quickly restart any test anytime by pressing TAB key"
            ].map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500 font-semibold leading-relaxed">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

