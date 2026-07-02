import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Keyboard, Award, Zap, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const CODE_DATABASE = {
  easy: [
    "let score = 100;",
    "const user = { name: 'Sanjay' };",
    "console.log('Success: ', score);",
    "const isActive = false;",
    "let elements = [1, 2, 3, 4, 5];",
    "const sum = (a, b) => a + b;"
  ],
  medium: [
    "for (let i = 0; i < array.length; i++) { }",
    "const filtered = items.filter(x => x.active);",
    "const [data, setData] = useState(null);",
    "useEffect(() => { return () => {}; }, []);",
    "if (err) { throw new Error('Failed to run'); }",
    "const result = await fetch('/api/v1/scores');"
  ],
  hard: [
    "import React, { useState, useEffect } from 'react';",
    "const response = await api.post('/student/scores', { score });",
    "export default function Button({ label, onClick }) { return <button onClick={onClick}>{label}</button>; }",
    "const reducer = (state, action) => { switch (action.type) { case 'ADD': return state + 1; default: return state; } };",
    "try { const { data } = await axios.get(url); return data; } catch (e) { console.error(e); }"
  ]
};

const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'click') {
      osc.frequency.setValueAtTime(190 + Math.random() * 25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    }
  } catch (e) {}
};

export default function CodeRushGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [snippet, setSnippet] = useState('');
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [savingScore, setSavingScore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const startGame = () => {
    const list = CODE_DATABASE[difficulty];
    const selected = list[Math.floor(Math.random() * list.length)];
    setSnippet(selected);
    setTypedText('');
    setStartTime(Date.now());
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setGameState('playing');
    playSound('success');

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus({ preventScroll: true });
    }, 50);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length > snippet.length) return;

    playSound('click');

    // Count error
    if (val.length > typedText.length) {
      const idx = val.length - 1;
      if (val[idx] !== snippet[idx]) {
        setErrors(prev => prev + 1);
      }
    }

    setTypedText(val);

    // Calculate stats
    const elapsedMin = (Date.now() - startTime) / 60000;
    
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === snippet[i]) correct++;
    }

    const liveWpm = elapsedMin > 0 ? Math.round((correct / 5) / elapsedMin) : 0;
    const totalAttempted = val.length + errors;
    const liveAcc = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 100;

    setWpm(liveWpm);
    setAccuracy(liveAcc);

    // Completion check
    if (val.length === snippet.length) {
      setGameState('gameover');
      playSound('success');
    }
  };

  // Score saving
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        await api.post('/student/typing-scores', {
          gameName: 'Code Rush',
          wpm: wpm,
          accuracy: accuracy,
          score: Math.round(wpm * (accuracy / 100) * 6),
          difficulty: difficulty
        });
      } catch (err) {
        console.error('Error saving game score:', err);
      } finally {
        setSavingScore(false);
      }
    };

    saveScore();
  }, [gameState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      // Focus input without scrolling the viewport down
      inputRef.current.focus({ preventScroll: true });
    }
  }, [gameState]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const renderSnippet = () => {
    return snippet.split('').map((char, index) => {
      const isTyped = index < typedText.length;
      const isCorrect = isTyped && typedText[index] === char;
      const isCursor = index === typedText.length;

      let colorClass = 'text-slate-500/60';
      if (isTyped) {
        colorClass = isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-500 underline decoration-rose-500/60 decoration-2';
      }

      return (
        <span key={index} className={`font-mono text-sm sm:text-base transition-colors duration-100 ${colorClass} relative`}>
          {isCursor && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[1.2em] bg-indigo-400 caret-blink rounded-sm" />
          )}
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div ref={containerRef} className={`w-full text-center max-w-4xl mx-auto ${isFullscreen ? 'bg-[#0B091B] h-screen p-6 md:p-10 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Code Rush</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/30 border border-indigo-950 px-3 py-1.5 rounded-xl">
          <button 
            onClick={toggleFullscreen}
            className={`p-1 rounded transition-colors cursor-pointer text-slate-500 hover:text-slate-200`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 mt-2">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Keyboard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Code Rush</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
            Practice typing actual syntax and syntax formatting tokens: semicolons, curly brackets, parenthesis, and function calls. Crucial for web developer muscle memory!
          </p>

          {/* Difficulty Selector */}
          <div className="mb-4">
            <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider block mb-2">Difficulty Mode</span>
            <div className="flex justify-center bg-slate-950/40 rounded-xl p-1 border border-indigo-950">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex-1 ${difficulty === level ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Start Code Rush
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-4 max-w-md mx-auto mt-2">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-slate-950/40 border border-indigo-950 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-400">
            <div>
              <span>Coding WPM:</span>
              <span className="text-indigo-400 text-xs font-black font-mono ml-1">{wpm}</span>
            </div>
            <div>
              <span>Accuracy:</span>
              <span className="text-indigo-400 text-xs font-black font-mono ml-1">{accuracy}%</span>
            </div>
            <div>
              <span>Syntax Errors:</span>
              <span className="text-rose-500 text-xs font-black font-mono ml-1">{errors}</span>
            </div>
          </div>

          {/* Code Typing Box */}
          <div 
            onClick={() => inputRef.current && inputRef.current.focus({ preventScroll: true })}
            className="bg-[#0F0C20]/90 border border-indigo-500/20 hover:border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative cursor-text min-h-[120px] text-left leading-relaxed flex items-center justify-center select-none"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 opacity-35" />
            <div className="w-full font-mono text-slate-300 tracking-wide break-all">
              {renderSnippet()}
            </div>
          </div>

          {/* Hidden input to capture typed text */}
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleInputChange}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 mt-2">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Code Snippet Clear!</h3>
          
          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/40 border border-indigo-950 rounded-xl p-3 mb-4">
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{wpm}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">WPM</span>
            </div>
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{accuracy}%</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Accuracy</span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 mb-4 text-[10px] text-amber-300 font-semibold leading-relaxed">
              🔑 Log in or create an account to save your typing stats and compete on the leaderboards!
            </div>
          )}

          <div className="flex gap-2.5">
            <button
              onClick={startGame}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Next Snippet
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-indigo-300 border border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              All Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
