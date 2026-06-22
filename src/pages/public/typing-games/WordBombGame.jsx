import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const WORDS_POOL = [
  "danger", "explode", "warning", "fusebox", "diffuse", "trigger", "hazard", "seconds", "firewall",
  "nuclear", "chemical", "protect", "terminal", "console", "caution", "emergency", "defense", "secure",
  "circuit", "voltage", "element", "battery", "system", "command", "control", "destruct", "mission"
];

let globalVolume = 3.0; // Increased default volume by 3x

const playSound = (type, vol = globalVolume) => {
  if (vol <= 0) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tick') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.04 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } else if (type === 'diffuse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.07); // C#5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.14); // E5
      gain.gain.setValueAtTime(0.05 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'explosion') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(20, audioCtx.currentTime + 0.6);
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.6);
      
      osc.disconnect(gain);
      osc.connect(filter);
      filter.connect(gain);
      
      gain.gain.setValueAtTime(0.3 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.7);
    }
  } catch (e) {}
};

export default function WordBombGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [maxTime, setMaxTime] = useState(5.0);
  const [savingScore, setSavingScore] = useState(false);
  const [volume, setVolume] = useState(3.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    globalVolume = volume;
  }, [volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const getDifficultyTime = () => {
    switch (difficulty) {
      case 'easy': return 8.0;
      case 'hard': return 3.0;
      case 'medium':
      default: return 5.0;
    }
  };

  const getNewWord = () => {
    let word = WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)];
    // Add letters depending on streak to increase challenge
    if (streak > 5) {
      const prefixes = ["crypto", "cyber", "hyper", "mega", "ultra"];
      word = prefixes[Math.floor(Math.random() * prefixes.length)] + word;
    }
    return word;
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    const startT = getDifficultyTime();
    setTimeLeft(startT);
    setMaxTime(startT);
    setInputValue('');
    setGameState('playing');
    setCurrentWord(WORDS_POOL[Math.floor(Math.random() * WORDS_POOL.length)]);
    playSound('diffuse');

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  // Input typing check
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    // Click sound
    if (val.length > inputValue.length) {
      playSound('tick');
    }

    if (val.trim().toLowerCase() === currentWord.toLowerCase()) {
      playSound('diffuse');
      
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(prev => prev + 10 + Math.min(newStreak, 5));

      // Calculate next countdown limit: decreases slightly as streak goes up
      const diffBase = getDifficultyTime();
      const speedFactor = Math.max(0.65, 1 - (newStreak * 0.02)); // up to 35% faster
      const newMax = diffBase * speedFactor;

      setCurrentWord(getNewWord());
      setInputValue('');
      setTimeLeft(newMax);
      setMaxTime(newMax);
    }
  };

  // Timer Tick (fractional seconds for fuse look)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const intervalMs = 100;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          playSound('explosion');
          setGameState('gameover');
          clearInterval(timerRef.current);
          return 0;
        }

        // Ticking sound every integer second boundary
        if (Math.floor(prev) !== Math.floor(prev - 0.1)) {
          playSound('tick');
        }

        return Number((prev - 0.1).toFixed(1));
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Score Saving
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        const wpmCalc = Math.round((score / 10) * 8); // approximate wpm based on words cleared
        await api.post('/student/typing-scores', {
          gameName: 'Word Bomb',
          wpm: wpmCalc,
          accuracy: 100,
          score: score,
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

  const progressPercentage = (timeLeft / maxTime) * 100;

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
          <span className="text-lg">💣</span>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Word Bomb</h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/30 border border-indigo-950 px-3 py-1.5 rounded-xl">
          <button 
            onClick={toggleFullscreen}
            className={`p-1 rounded transition-colors cursor-pointer text-slate-500 hover:text-slate-200`}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <div className="w-[1px] h-4 bg-slate-700/50 mx-1"></div>
          <button 
            onClick={() => setVolume(volume > 0 ? 0 : 3.0)}
            className={`p-1 rounded transition-colors cursor-pointer ${volume > 0 ? 'text-indigo-400 hover:bg-indigo-500/20' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            {volume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <input 
            type="range" 
            min="0" max="5" step="0.1" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-white border-4 border-rose-400 rounded-[2rem] p-8 text-center max-w-md mx-auto shadow-[0_12px_0_0_rgba(251,113,133,1)] animate-in zoom-in-95 mt-4">
          <div className="text-6xl mb-4 animate-bounce">💣</div>
          <h3 className="text-3xl font-black text-slate-800 mb-2">Word Bomb</h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6">
            Type the code before the bomb explodes! Every successful diffusion gives you a streak bonus. Ready?
          </p>

          {/* Difficulty Selector */}
          <div className="mb-6">
            <span className="text-xs text-rose-500 font-black uppercase tracking-wider block mb-3">Choose Level</span>
            <div className="flex justify-center gap-3">
              {[
                { level: 'easy', color: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-600', hoverBg: 'hover:bg-emerald-50', hoverBorder: 'hover:border-emerald-400', text: 'text-emerald-700', label: '🟢 Easy' },
                { level: 'medium', color: 'amber', bg: 'bg-amber-400', border: 'border-amber-500', hoverBg: 'hover:bg-amber-50', hoverBorder: 'hover:border-amber-400', text: 'text-amber-700', label: '🟡 Med' },
                { level: 'hard', color: 'rose', bg: 'bg-rose-500', border: 'border-rose-600', hoverBg: 'hover:bg-rose-50', hoverBorder: 'hover:border-rose-400', text: 'text-rose-700', label: '🔴 Hard' }
              ].map((s) => (
                <button
                  key={s.level}
                  onClick={() => setDifficulty(s.level)}
                  className={`px-3 py-2 rounded-2xl font-black tracking-wider transition-all duration-200 cursor-pointer flex-1 border-2 border-b-4 ${difficulty === s.level ? `${s.bg} ${s.border} text-white translate-y-[2px] border-b-2` : `bg-white border-${s.color}-200 ${s.text} ${s.hoverBorder} ${s.hoverBg}`}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_8px_0_0_rgba(225,29,72,1)] hover:shadow-[0_4px_0_0_rgba(225,29,72,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 cursor-pointer"
          >
            Start Diffusing! 🚀
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-6 max-w-2xl mx-auto mt-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border-4 border-sky-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(56,189,248,1)]">
              <div className="text-3xl mb-1">⭐</div>
              <p className="text-3xl font-black text-sky-500">{score}</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score</span>
            </div>
            <div className="bg-white border-4 border-amber-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(251,191,36,1)] z-10 transform scale-110">
              <div className="text-4xl mb-1 animate-pulse">🔥</div>
              <p className="text-4xl font-black text-amber-500">{streak}</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Streak</span>
            </div>
            <div className="bg-white border-4 border-emerald-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(52,211,153,1)]">
              <div className="text-3xl mb-1">⏳</div>
              <p className={`text-3xl font-black ${timeLeft < 1.5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>{timeLeft.toFixed(1)}s</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time</span>
            </div>
          </div>

          {/* Bomb Visual Area */}
          <div className="bg-white border-4 border-rose-400 rounded-[3rem] p-10 flex flex-col items-center justify-center relative min-h-[200px] shadow-[0_12px_0_0_rgba(251,113,133,1)] mt-4 overflow-hidden">
            {/* Visual fuse bar */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-slate-100 overflow-hidden">
              <div 
                style={{ width: `${progressPercentage}%` }}
                className={`h-full transition-all duration-100 ${progressPercentage > 50 ? 'bg-emerald-400' : progressPercentage > 25 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'}`}
              />
            </div>

            <div className={`mt-6 mb-4 ${timeLeft < 1.5 ? 'animate-ping' : timeLeft < 3 ? 'animate-bounce' : 'animate-pulse'}`}>
              <div className="text-7xl">💣</div>
            </div>

            <p className="text-sm text-rose-400 font-black uppercase tracking-wider mb-2">Diffuse Code</p>
            <h1 className="text-5xl sm:text-6xl font-black text-slate-800 tracking-wide mt-2 mb-4">
              {currentWord}
            </h1>
          </div>

          {/* Input Box */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type code here! 🎯"
            className="w-full bg-white border-4 border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 text-slate-800 rounded-full py-5 px-8 text-2xl font-black outline-none text-center shadow-[0_8px_0_0_rgba(251,191,36,1)] transition-all placeholder:text-amber-200 mt-2"
            autoFocus
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white border-4 border-rose-500 rounded-[2rem] p-8 text-center max-w-md mx-auto shadow-[0_12px_0_0_rgba(225,29,72,1)] animate-in zoom-in-95 mt-4">
          <div className="text-7xl mb-4 animate-bounce">💥</div>
          <h3 className="text-4xl font-black text-rose-500 mb-2">BOOM!</h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6">
            The bomb exploded! You diffused <span className="text-pink-500 font-black text-lg">{score / 10}</span> words with a top streak of <span className="text-amber-500 font-black text-lg">{streak}</span>🔥!
          </p>

          {!isAuthenticated && (
            <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-700 font-bold">
              🔑 Log in to save your awesome scores!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={startGame}
              className="w-full py-4 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_6px_0_0_rgba(159,18,57,1)] hover:translate-y-1 hover:shadow-[0_3px_0_0_rgba(159,18,57,1)] cursor-pointer"
            >
              🔄 Try Again!
            </button>
            <button
              onClick={onBack}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest transition-all cursor-pointer border-2 border-slate-200"
            >
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
