import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Heart, Award, Sparkles, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const LETTER_POOLS = {
  easy: "abcdefghijklmnopqrstuvwxyz",
  medium: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+{}|:\"<>?`-=[]\\;',./"
};

const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'miss') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.07);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {}
};

export default function LetterHuntGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLetter, setCurrentLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(1.5);
  const [maxTime, setMaxTime] = useState(1.5);
  const [hitTimes, setHitTimes] = useState([]); // track reaction times for analytics
  const [savingScore, setSavingScore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const hitTimeRef = useRef(null);

  const getDifficultyTime = () => {
    switch (difficulty) {
      case 'easy': return 2.0;
      case 'hard': return 0.7;
      case 'medium':
      default: return 1.2;
    }
  };

  const getNewLetter = () => {
    const pool = LETTER_POOLS[difficulty];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setHitTimes([]);
    const limit = getDifficultyTime();
    setTimeLeft(limit);
    setMaxTime(limit);
    setGameState('playing');
    setCurrentLetter(getNewLetter());
    hitTimeRef.current = Date.now();
    playSound('win');
  };

  // Keyboard reaction listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      // Avoid browser modifiers
      if (e.ctrlKey || e.altKey || e.metaKey || e.key === 'Tab') return;
      e.preventDefault();

      if (e.key === currentLetter) {
        // Correct hit!
        playSound('hit');
        const reaction = Date.now() - hitTimeRef.current;
        setHitTimes(prev => [...prev, reaction]);
        setScore(s => s + 10);
        
        const limit = getDifficultyTime();
        setCurrentLetter(getNewLetter());
        setTimeLeft(limit);
        setMaxTime(limit);
        hitTimeRef.current = Date.now();
      } else {
        // Incorrect key
        playSound('miss');
        setLives(l => {
          const nextL = l - 1;
          if (nextL <= 0) {
            setGameState('gameover');
            playSound('miss');
            return 0;
          }
          return nextL;
        });
        
        const limit = getDifficultyTime();
        setCurrentLetter(getNewLetter());
        setTimeLeft(limit);
        setMaxTime(limit);
        hitTimeRef.current = Date.now();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentLetter, difficulty]);

  // Frame count timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          // Time expired is a mistake
          playSound('miss');
          setLives(l => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameState('gameover');
              clearInterval(timerRef.current);
              return 0;
            }
            return nextL;
          });

          const limit = getDifficultyTime();
          setCurrentLetter(getNewLetter());
          setMaxTime(limit);
          hitTimeRef.current = Date.now();
          return limit;
        }

        return Number((prev - 0.1).toFixed(2));
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, difficulty, currentLetter]);

  // Score Saving
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        const avgReaction = hitTimes.length > 0 ? Math.round(hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length) : 0;
        const mockWpm = avgReaction > 0 ? Math.round(60000 / avgReaction) : 0; // reactions translated into a typing speed proxy
        
        await api.post('/student/typing-scores', {
          gameName: 'Letter Hunt',
          wpm: mockWpm,
          accuracy: Math.round((hitTimes.length / (hitTimes.length + (3 - lives))) * 100) || 100,
          score: score,
          difficulty: difficulty
        });
      } catch (err) {
        console.error('Error saving score:', err);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const avgReaction = hitTimes.length > 0 ? Math.round(hitTimes.reduce((a, b) => a + b, 0) / hitTimes.length) : 0;
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
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Letter Hunt</h2>
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
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Letter Hunt</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
            Press the correct key showing on screen before time runs out. Great for practicing reactive muscle memory and finger positioning!
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
            <Play className="w-4 h-4 fill-current" /> Start Hunt
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-4 max-w-sm mx-auto mt-2">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-slate-950/40 border border-indigo-950 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-400">
            <div>
              <span>Hits:</span>
              <span className="text-indigo-400 text-xs font-black font-mono ml-1">{score / 10}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Lives:</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((heart) => (
                  <Heart
                    key={heart}
                    className={`w-3.5 h-3.5 ${heart <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Letter Target Display Box */}
          <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[140px] mt-1">
            {/* Visual timer radial/line indicator */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-950/50 rounded-t-2xl overflow-hidden">
              <div 
                style={{ width: `${progressPercentage}%` }}
                className="h-full bg-indigo-500 transition-all duration-100"
              />
            </div>

            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Press This Key</p>
            <h1 className="text-5xl sm:text-6xl font-mono font-black text-indigo-400 animate-pulse tracking-wide select-none">
              {currentLetter === ' ' ? 'Space' : currentLetter}
            </h1>
          </div>

          <p className="text-[10px] text-slate-500 font-bold">Press the key on your physical keyboard now!</p>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-2xl animate-in zoom-in-95 mt-2">
          <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white mb-1">Hunt Over!</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">
            Nice try! You successfully reacted to <span className="text-indigo-400 font-bold font-mono">{score / 10}</span> letters.
          </p>

          <div className="grid grid-cols-2 gap-2.5 bg-slate-950/40 border border-indigo-950 rounded-xl p-3 mb-4">
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{score}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Score</span>
            </div>
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{avgReaction ? `${avgReaction}ms` : '0ms'}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Avg Reaction</span>
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
              <RotateCcw className="w-4 h-4" /> Start Hunt Again
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
