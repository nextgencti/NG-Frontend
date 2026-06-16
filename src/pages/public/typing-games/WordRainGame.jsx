import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Heart, ShieldAlert, Award, Zap } from 'lucide-react';
import api from '../../../lib/axios';

const WORDS_POOL = {
  easy: ["cat", "dog", "sun", "run", "hop", "red", "sky", "fly", "cup", "pen", "box", "hat", "map", "net", "pin", "toy", "car", "bus", "key", "mud", "day", "ice", "bad", "big", "hot", "new", "old", "wet", "dry", "fast"],
  medium: ["about", "beach", "clock", "dream", "earth", "fight", "globe", "house", "image", "joint", "light", "mouse", "night", "ocean", "paper", "queen", "river", "stone", "table", "uncle", "voice", "water", "young", "zebra", "happy", "brave", "clean", "fresh", "great"],
  hard: ["knowledge", "frequency", "algorithm", "keyboard", "beautiful", "challenge", "different", "education", "guideline", "important", "navigator", "languages", "structure", "substance", "yesterday", "architect", "treatment", "signature", "operation", "standards", "stability"]
};

const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }
  } catch { /* ignore */ }
};

export default function WordRainGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [inputValue, setInputValue] = useState('');
  
  const [stats, setStats] = useState({ correct: 0, totalChars: 0, errors: 0, startTime: null });
  const [analytics, setAnalytics] = useState(null);
  
  const canvasRef = useRef(null);
  const stateRef = useRef({
    words: [],
    particles: [],
    speedMult: 1,
    spawnTimer: 0,
    wordIdCounter: 0,
    startTime: null
  });

  const getSettings = () => {
    switch(difficulty) {
      case 'easy': return { speed: 0.6, spawnRate: 2000, maxWords: 4 };
      case 'hard': return { speed: 1.5, spawnRate: 1000, maxWords: 8 };
      case 'medium': 
      default: return { speed: 1.0, spawnRate: 1500, maxWords: 6 };
    }
  };

  const startGame = () => {
    setScore(0);
    setLives(3);
    setInputValue('');
    setStats({ correct: 0, totalChars: 0, errors: 0, startTime: Date.now() });
    setAnalytics(null);
    stateRef.current = {
      words: [],
      particles: [],
      speedMult: 1,
      spawnTimer: 0,
      wordIdCounter: 0,
      startTime: Date.now()
    };
    setGameState('playing');
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toLowerCase().trim();
    setInputValue(val);

    const state = stateRef.current;
    const matchIndex = state.words.findIndex(w => w.text === val);

    if (matchIndex !== -1) {
      // Word cleared
      const matchedWord = state.words[matchIndex];
      state.words.splice(matchIndex, 1);
      
      playSound('success');
      setScore(s => s + (matchedWord.text.length * 10));
      setStats(prev => ({
        ...prev,
        correct: prev.correct + 1,
        totalChars: prev.totalChars + matchedWord.text.length
      }));
      setInputValue('');
      
      // Explosion particles
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 3;
        state.particles.push({
          x: matchedWord.x,
          y: matchedWord.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          alpha: 1,
          color: '#10B981'
        });
      }
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = performance.now();

    const settings = getSettings();

    const draw = (time) => {
      const dt = time - lastTime;
      lastTime = time;
      
      ctx.fillStyle = '#0B091B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const state = stateRef.current;
      state.speedMult += 0.0001; // gradually increase speed

      // Spawn words
      state.spawnTimer += dt;
      if (state.spawnTimer > settings.spawnRate && state.words.length < settings.maxWords) {
        state.spawnTimer = 0;
        const pool = WORDS_POOL[difficulty];
        const text = pool[Math.floor(Math.random() * pool.length)];
        ctx.font = 'bold 16px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;
        
        state.words.push({
          id: state.wordIdCounter++,
          text,
          x: Math.max(textWidth, Math.random() * (canvas.width - textWidth * 2)),
          y: -20
        });
      }

      // Draw and update particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.05;
        if (p.alpha <= 0) return false;
        
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      // Draw and update words
      let lostLife = false;
      state.words = state.words.filter(w => {
        w.y += settings.speed * state.speedMult * (dt / 16);
        
        if (w.y > canvas.height - 30) {
          lostLife = true;
          playSound('hit');
          
          for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 3;
            state.particles.push({
              x: w.x, y: canvas.height - 30,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 2,
              alpha: 1,
              color: '#EF4444'
            });
          }
          return false;
        }

        ctx.font = '900 16px Inter, sans-serif';
        ctx.letterSpacing = '1px';
        ctx.textAlign = 'center';
        
        // Shadow/glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#6366F1';
        ctx.fillStyle = '#FFFFFF';
        
        // Highlight matched part
        if (inputValue && w.text.startsWith(inputValue)) {
          const matchW = ctx.measureText(inputValue).width;
          const remW = ctx.measureText(w.text.substring(inputValue.length)).width;
          const startX = w.x - (matchW + remW) / 2;
          
          ctx.textAlign = 'left';
          ctx.fillStyle = '#10B981';
          ctx.fillText(inputValue, startX, w.y);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(w.text.substring(inputValue.length), startX + matchW, w.y);
        } else {
          ctx.fillText(w.text, w.x, w.y);
        }
        
        ctx.shadowBlur = 0;
        ctx.letterSpacing = '0px';
        return true;
      });

      if (lostLife) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            cancelAnimationFrame(animationId);
            const elapsedMin = (Date.now() - state.startTime) / 60000;
            const finalWpm = elapsedMin > 0 ? Math.round((stats.totalChars / 5) / elapsedMin) : 0;
            setAnalytics({ score, wpm: finalWpm, words: stats.correct });
            setGameState('gameover');
            playSound('gameover');
          }
          return newLives;
        });
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, difficulty, inputValue, score, stats]);

  useEffect(() => {
    if (gameState === 'gameover' && isAuthenticated && analytics) {
      api.post('/student/typing-scores', {
        gameName: 'Word Rain',
        wpm: analytics.wpm,
        accuracy: 100, // Word rain assumes perfectly typed words
        score: analytics.score,
        difficulty: difficulty
      }).catch(err => console.error("Failed saving score", err));
    }
  }, [gameState, isAuthenticated, analytics, difficulty]);

  return (
    <div className="w-full text-center max-w-3xl mx-auto">
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Word Rain</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Word Rain</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">
            Type the words before they hit the bottom. You have 3 lives!
          </p>

          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-2">Difficulty</span>
            <div className="flex justify-center bg-slate-950/40 rounded-xl p-1 border border-indigo-950">
              {['easy', 'medium', 'hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex-1 ${difficulty === level ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-lg">
            <Play className="w-4 h-4" /> Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-slate-950/40 border border-indigo-950 rounded-xl p-4">
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{score}</p>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">Score</span>
            </div>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-5 h-5 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
              ))}
            </div>
          </div>

          <div className="w-full bg-[#0B091B] border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
            <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto block" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500/20"></div>
          </div>

          <input
            autoFocus
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type falling words..."
            className="w-full bg-[#151230]/70 border border-indigo-500/30 focus:border-indigo-500 text-white rounded-xl py-3 px-4 text-center font-mono outline-none shadow-xl"
          />
        </div>
      )}

      {gameState === 'gameover' && analytics && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Game Over!</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">The words overwhelmed your defenses.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-950/40 border border-indigo-950 rounded-xl p-3">
              <p className="text-xl font-black text-indigo-400 font-mono">{analytics.score}</p>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">Final Score</span>
            </div>
            <div className="bg-slate-950/40 border border-indigo-950 rounded-xl p-3">
              <p className="text-xl font-black text-indigo-400 font-mono">{analytics.wpm}</p>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">WPM</span>
            </div>
          </div>

          <button onClick={startGame} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
}