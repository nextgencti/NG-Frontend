import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Hourglass, Award, Zap, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const WORD_DIFFICULTIES = {
  easy: [
    "cat", "dog", "sun", "run", "hop", "red", "sky", "fly", "cup", "pen",
    "box", "hat", "map", "net", "pin", "toy", "car", "bus", "key", "mud",
    "day", "ice", "bad", "big", "hot", "new", "old", "wet", "dry", "fast"
  ],
  medium: [
    "about", "beach", "clock", "dream", "earth", "fight", "globe", "house", "image",
    "joint", "light", "mouse", "night", "ocean", "paper", "queen", "river", "stone", "table",
    "uncle", "voice", "water", "young", "zebra", "happy", "brave", "clean", "fresh", "great"
  ],
  hard: [
    "knowledge", "frequency", "algorithm", "keyboard", "beautiful", "challenge", "different",
    "education", "guideline", "important", "navigator", "languages", "structure", "substance",
    "yesterday", "architect", "treatment", "signature", "operation", "standards", "stability"
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
      osc.frequency.setValueAtTime(200 + Math.random() * 30, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'gameover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    }
  } catch { /* ignore */ }
};

export default function SpeedBurstGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [timeLeft, setTimeLeft] = useState(30);
  const [wordList, setWordList] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState({ correct: 0, total: 0, totalChars: 0, wpm: 0, errors: 0 });
  const [, setSavingScore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const generateWords = (diff) => {
    const pool = WORD_DIFFICULTIES[diff];
    const shuffed = [...pool].sort(() => Math.random() - 0.5);
    // Duplicate pool elements to make a long list
    return [...shuffed, ...shuffed, ...shuffed, ...shuffed];
  };

  const startGame = () => {
    const list = generateWords(difficulty);
    setWordList(list);
    setCurrentWordIndex(0);
    setTimeLeft(30);
    setInputValue('');
    setStats({ correct: 0, total: 0, totalChars: 0, wpm: 0, errors: 0 });
    setGameState('playing');
    playSound('success');

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    const targetWord = wordList[currentWordIndex];

    // Check for correct character click sounds
    if (val.length > inputValue.length) {
      playSound('click');
      const latestChar = val[val.length - 1];
      const targetChar = targetWord[val.length - 1];
      if (latestChar !== targetChar && targetChar !== undefined) {
        setStats(prev => ({ ...prev, errors: prev.errors + 1 }));
      }
    }

    setInputValue(val);

    // If matches word exactly, advance to next word
    if (val.trim().toLowerCase() === targetWord.toLowerCase()) {
      playSound('success');
      const correctWordLength = targetWord.length;
      
      setStats(prev => {
        const nextCorrect = prev.correct + 1;
        const nextTotal = prev.total + 1;
        const nextChars = prev.totalChars + correctWordLength + 1; // plus space
        const elapsedMin = (30 - timeLeft + 0.1) / 60; // elapsed time
        const wpm = Math.round((nextChars / 5) / (elapsedMin > 0 ? elapsedMin : 0.5));
        
        return {
          ...prev,
          correct: nextCorrect,
          total: nextTotal,
          totalChars: nextChars,
          wpm
        };
      });

      setCurrentWordIndex(prev => prev + 1);
      setInputValue('');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          playSound('gameover');
          clearInterval(interval);
          return 0;
        }
        
        // Recalculate WPM
        setStats(s => {
          const elapsedMin = (30 - (prev - 1)) / 60;
          const wpm = elapsedMin > 0 ? Math.round((s.totalChars / 5) / elapsedMin) : 0;
          return { ...s, wpm };
        });

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Score Saving
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        const accuracy = stats.total > 0 ? Math.max(0, Math.round(((stats.totalChars - stats.errors) / stats.totalChars) * 100)) : 100;
        await api.post('/student/typing-scores', {
          gameName: 'Speed Burst',
          wpm: stats.wpm,
          accuracy: accuracy,
          score: stats.correct * 10,
          difficulty: difficulty
        });
      } catch (err) {
        console.error('Error saving score:', err);
      } finally {
        setSavingScore(false);
      }
    };

    saveScore();
  }, [gameState, isAuthenticated, stats, difficulty]);

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

  const accuracy = stats.totalChars > 0 ? Math.max(0, Math.round(((stats.totalChars - stats.errors) / stats.totalChars) * 100)) : 100;

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
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Speed Burst</h2>
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
        <div className="bg-white border-4 border-sky-400 rounded-[2rem] p-8 text-center max-w-md mx-auto shadow-[0_12px_0_0_rgba(56,189,248,1)] animate-in zoom-in-95 mt-4">
          <div className="w-20 h-20 bg-amber-400 border-4 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white shadow-inner">
            <span className="text-4xl">🚀</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-2">Speed Burst</h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6">
            A fast-paced 30-second sprint test! Type as fast as you can. Are you ready?
          </p>

          {/* Difficulty Selector */}
          <div className="mb-6">
            <span className="text-xs text-sky-500 font-black uppercase tracking-wider block mb-3">Choose Level</span>
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
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-[0_8px_0_0_rgba(168,85,247,1)] hover:shadow-[0_4px_0_0_rgba(168,85,247,1)] hover:translate-y-1 active:shadow-none active:translate-y-2 cursor-pointer"
          >
            Play Now! 🎯
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-6 max-w-2xl mx-auto mt-4">
          {/* Stats Header */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border-4 border-sky-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(56,189,248,1)]">
              <div className="text-3xl mb-1">🕒</div>
              <p className="text-3xl font-black text-sky-500">{timeLeft}s</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Time Left</span>
            </div>
            <div className="bg-white border-4 border-pink-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(244,114,182,1)] transform scale-110 z-10">
              <div className="text-4xl mb-1 animate-pulse">🚀</div>
              <p className="text-4xl font-black text-pink-500">{stats.wpm}</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Speed (WPM)</span>
            </div>
            <div className="bg-white border-4 border-amber-400 rounded-3xl p-4 text-center shadow-[0_6px_0_0_rgba(251,191,36,1)]">
              <div className="text-3xl mb-1">⭐</div>
              <p className="text-3xl font-black text-amber-500">{stats.correct}</p>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Words Typed</span>
            </div>
          </div>

          {/* Word Display Board */}
          <div className="bg-white border-4 border-violet-400 rounded-[3rem] p-10 flex flex-col items-center justify-center relative min-h-[200px] shadow-[0_12px_0_0_rgba(167,139,250,1)] mt-4 overflow-hidden">
            <div className="absolute -top-10 -right-10 text-6xl opacity-20 rotate-12">☁️</div>
            <div className="absolute -bottom-10 -left-10 text-6xl opacity-20 -rotate-12">🌈</div>
            
            <p className="text-sm text-violet-400 font-black uppercase tracking-wider mb-2">Type This Word</p>
            <h1 className="text-5xl sm:text-7xl font-black text-slate-800 tracking-wide animate-bounce mt-2 mb-4">
              {wordList[currentWordIndex]}
            </h1>
            
            {/* Next word preview */}
            <div className="bg-violet-100 text-violet-500 font-bold px-4 py-1.5 rounded-full text-sm">
              Next: {wordList[currentWordIndex + 1]}
            </div>
          </div>

          {/* Input Panel */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type here! 🎯"
            className="w-full bg-white border-4 border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 text-slate-800 rounded-full py-5 px-8 text-2xl font-black outline-none text-center shadow-[0_8px_0_0_rgba(52,211,153,1)] transition-all placeholder:text-emerald-200 mt-2"
            autoFocus
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-white border-4 border-emerald-400 rounded-[2rem] p-8 text-center max-w-md mx-auto shadow-[0_12px_0_0_rgba(52,211,153,1)] animate-in zoom-in-95 mt-4">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h3 className="text-3xl font-black text-slate-800 mb-2">Awesome Job!</h3>
          <p className="text-sm text-slate-600 font-bold leading-relaxed mb-6">
            You typed super fast! Here are your amazing stats:
          </p>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 mb-6">
            <div>
              <p className="text-2xl font-black text-pink-500">{stats.wpm}</p>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mt-1">Speed</span>
            </div>
            <div>
              <p className="text-2xl font-black text-sky-500">{accuracy}%</p>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mt-1">Accuracy</span>
            </div>
            <div>
              <p className="text-2xl font-black text-amber-500">{stats.correct}</p>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mt-1">Words</span>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-100 border border-amber-200 rounded-xl p-3 mb-6 text-xs text-amber-700 font-bold">
              🔑 Log in to save your awesome scores!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={startGame}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_6px_0_0_rgba(5,150,105,1)] hover:translate-y-1 hover:shadow-[0_3px_0_0_rgba(5,150,105,1)] cursor-pointer"
            >
              🔄 Play Again!
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
