import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Hourglass, Award, Zap } from 'lucide-react';
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

  const accuracy = stats.totalChars > 0 ? Math.max(0, Math.round(((stats.totalChars - stats.errors) / stats.totalChars) * 100)) : 100;

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
          <Zap className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Speed Burst</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <Hourglass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Speed Burst</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            A fast-paced 30-second sprint test. Type as many single words as you can. How high can your WPM burst?
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
            <Play className="w-4 h-4 fill-current" /> Start Sprint
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-5 max-w-lg mx-auto">
          {/* Stats Header */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/40 border border-indigo-950 rounded-2xl p-4 text-center">
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{timeLeft}s</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Time Left</span>
            </div>
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{stats.wpm}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Burst WPM</span>
            </div>
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{stats.correct}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Words Typed</span>
            </div>
          </div>

          {/* Word Display Board */}
          <div className="bg-[#151230]/70 border border-indigo-500/20 rounded-3xl p-10 flex flex-col items-center justify-center relative min-h-[160px]">
            {/* Glowing borders */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
            
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-2">Type This Word</p>
            <h1 className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wide">
              {wordList[currentWordIndex]}
            </h1>
            
            {/* Next word preview */}
            <p className="text-xs text-slate-500 font-mono mt-3 opacity-60">
              next: {wordList[currentWordIndex + 1]}
            </p>
          </div>

          {/* Input Panel */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type word..."
            className="w-full bg-[#151230]/70 border border-indigo-500/30 focus:border-indigo-500/80 text-white rounded-xl py-3 px-4 text-sm font-semibold outline-none text-center font-mono shadow-2xl transition-all"
            autoFocus
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sprint Completed</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Congratulations! You completed the sprint with:
          </p>

          <div className="grid grid-cols-3 gap-3 bg-slate-950/40 border border-indigo-950 rounded-2xl p-4 mb-6">
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{stats.wpm}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">WPM</span>
            </div>
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{accuracy}%</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Accuracy</span>
            </div>
            <div>
              <p className="text-lg font-black text-indigo-400 font-mono">{stats.correct}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Words</span>
            </div>
          </div>

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
              <RotateCcw className="w-4 h-4" /> Reset Sprint
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
