import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, ShieldAlert, Award, Bomb } from 'lucide-react';
import api from '../../../lib/axios';

const WORDS_POOL = [
  "danger", "explode", "warning", "fusebox", "diffuse", "trigger", "hazard", "seconds", "firewall",
  "nuclear", "chemical", "protect", "terminal", "console", "caution", "emergency", "defense", "secure",
  "circuit", "voltage", "element", "battery", "system", "command", "control", "destruct", "mission"
];

const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tick') {
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } else if (type === 'diffuse') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.07); // C#5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.14); // E5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
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
      
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
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
    <div className="w-full text-center max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <div className="flex items-center gap-2">
          <Bomb className="w-4 h-4 text-rose-500 animate-bounce" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Word Bomb</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Bomb className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Word Bomb</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Type the word before the bomb explodes! Every successful diffusion gives you a streak bonus. The countdown gets faster with each word!
          </p>

          {/* Difficulty Selector */}
          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-2">Difficulty Mode</span>
            <div className="flex justify-center bg-slate-950/40 rounded-xl p-1 border border-indigo-950">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex-1 ${difficulty === level ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Start Diffusing
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-slate-950/40 border border-indigo-950 rounded-2xl px-5 py-3 text-xs font-bold text-slate-400">
            <div>
              <span>Score:</span>
              <span className="text-indigo-400 text-sm font-black font-mono ml-1">{score}</span>
            </div>
            <div>
              <span>Streak:</span>
              <span className="text-amber-400 text-sm font-black font-mono ml-1">{streak}🔥</span>
            </div>
            <div>
              <span>Time:</span>
              <span className={`text-sm font-black font-mono ml-1 ${timeLeft < 1.5 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                {timeLeft.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Bomb Visual Area */}
          <div className="bg-[#151230]/70 border border-indigo-500/20 rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[200px]">
            {/* Visual fuse bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-950/50 rounded-t-3xl overflow-hidden">
              <div 
                style={{ width: `${progressPercentage}%` }}
                className={`h-full transition-all duration-100 ${progressPercentage > 50 ? 'bg-indigo-500' : progressPercentage > 25 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'}`}
              />
            </div>

            <div className={`mb-4 ${timeLeft < 1.5 ? 'animate-bounce text-rose-500' : 'text-slate-300'}`}>
              <Bomb className="w-16 h-16 transition-all" />
            </div>

            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-2">Diffuse Code</p>
            <h1 className="text-2xl sm:text-3xl font-mono font-black text-white tracking-wide">
              {currentWord}
            </h1>
          </div>

          {/* Input Box */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type code quickly..."
            className="w-full bg-[#151230]/70 border border-indigo-500/30 focus:border-indigo-500/80 text-white rounded-xl py-3 px-4 text-sm font-semibold outline-none text-center font-mono shadow-2xl transition-all"
            autoFocus
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-rose-500 mb-2">BOOM! Exploded</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            The bomb exploded! You successfully diffused <span className="text-indigo-400 font-bold font-mono">{score / 10}</span> words with a high streak of <span className="text-amber-400 font-bold font-mono">{streak}</span>.
          </p>

          {!isAuthenticated && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-[10px] text-amber-300 font-semibold leading-relaxed">
              🔑 Log in or create an account to save your typing stats and compete on the leaderboards!
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-indigo-300 border border-indigo-500/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              All Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
