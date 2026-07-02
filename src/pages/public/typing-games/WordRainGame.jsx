import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Heart, ShieldAlert, Award, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const WORDS_POOL = {
  easy: ["cat", "dog", "sun", "run", "hop", "red", "sky", "fly", "cup", "pen", "box", "hat", "map", "net", "pin", "toy", "car", "bus", "key", "mud", "day", "ice", "bad", "big", "hot", "new", "old", "wet", "dry", "fast"],
  medium: ["about", "beach", "clock", "dream", "earth", "fight", "globe", "house", "image", "joint", "light", "mouse", "night", "ocean", "paper", "queen", "river", "stone", "table", "uncle", "voice", "water", "young", "zebra", "happy", "brave", "clean", "fresh", "great"],
  hard: ["knowledge", "frequency", "algorithm", "keyboard", "beautiful", "challenge", "different", "education", "guideline", "important", "navigator", "languages", "structure", "substance", "yesterday", "architect", "treatment", "signature", "operation", "standards", "stability"]
};

const LETTERS_POOL = "abcdefghijklmnopqrstuvwxyz".split('');

let globalVolume = 3.0;

const playSound = (type, vol = globalVolume) => {
  if (vol <= 0) return;
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
      gain.gain.setValueAtTime(0.05 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.05 * vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }
  } catch { /* ignore */ }
};

const BALLOON_COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#A855F7', '#EC4899', '#06B6D4'];

export default function WordRainGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameType, setGameType] = useState('word'); // 'word' | 'letter'
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [volume, setVolume] = useState(3.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [inputValue, setInputValue] = useState('');
  
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [analytics, setAnalytics] = useState(null);
  
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const stateRef = useRef({
    words: [],
    particles: [],
    speedMult: 1,
    spawnTimer: 0,
    wordIdCounter: 0,
    startTime: null
  });

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

  const getSettings = () => {
    let speedMultType = gameType === 'letter' ? 1.2 : 1.0;
    let spawnRateType = gameType === 'letter' ? 0.7 : 1.0;
    
    switch(difficulty) {
      case 'easy': return { speed: 0.6 * speedMultType, spawnRate: 2000 * spawnRateType, maxWords: 4 };
      case 'hard': return { speed: 1.5 * speedMultType, spawnRate: 1000 * spawnRateType, maxWords: 8 };
      case 'medium': 
      default: return { speed: 1.0 * speedMultType, spawnRate: 1500 * spawnRateType, maxWords: 6 };
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
    
    if (gameType === 'letter') {
      // In letter mode, we just check the last typed character
      if (val.length === 0) return;
      const char = val[val.length - 1];
      const matchIndex = state.words.findIndex(w => w.text === char);
      
      if (matchIndex !== -1) {
        popBalloon(matchIndex, char, state);
      }
      setInputValue(''); // always clear in letter mode
      return;
    }

    // Word mode logic
    const matchIndex = state.words.findIndex(w => w.text === val);
    if (matchIndex !== -1) {
      popBalloon(matchIndex, val, state);
    }
  };

  const popBalloon = (matchIndex, matchedString, state) => {
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
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 4;
      state.particles.push({
        x: matchedWord.x,
        y: matchedWord.y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        alpha: 1,
        color: matchedWord.color
      });
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
      
      // Clear canvas (white background for kid-friendly theme)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const state = stateRef.current;
      state.speedMult += 0.0001; // gradually increase speed

      // Spawn words
      state.spawnTimer += dt;
      if (state.spawnTimer > settings.spawnRate && state.words.length < settings.maxWords) {
        state.spawnTimer = 0;
        const pool = gameType === 'letter' ? LETTERS_POOL : WORDS_POOL[difficulty];
        const text = pool[Math.floor(Math.random() * pool.length)];
        ctx.font = 'bold 20px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;
        
        state.words.push({
          id: state.wordIdCounter++,
          text,
          x: Math.max(textWidth + 20, Math.random() * (canvas.width - textWidth * 2 - 40)),
          y: -40,
          color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]
        });
      }

      // Draw and update particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) return false;
        
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      // Draw and update words
      let lostLife = false;
      state.words = state.words.filter(w => {
        w.y += settings.speed * state.speedMult * (dt / 16);
        
        if (w.y > canvas.height - 20) {
          lostLife = true;
          playSound('hit');
          
          for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = 1 + Math.random() * 4;
            state.particles.push({
              x: w.x, y: canvas.height - 20,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 3,
              alpha: 1,
              color: w.color
            });
          }
          return false;
        }

        ctx.font = '900 20px Inter, sans-serif';
        const tw = ctx.measureText(w.text).width;
        const bw = tw + 30; // balloon width
        const bh = 50; // balloon height
        
        // Draw Balloon String
        ctx.strokeStyle = '#CBD5E1'; // slate-300
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w.x, w.y + bh/2);
        ctx.lineTo(w.x - 5, w.y + bh/2 + 10);
        ctx.lineTo(w.x + 5, w.y + bh/2 + 20);
        ctx.stroke();

        // Draw Balloon shape
        ctx.fillStyle = w.color;
        ctx.beginPath();
        ctx.ellipse(w.x, w.y, bw/2, bh/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Balloon knot
        ctx.beginPath();
        ctx.moveTo(w.x - 5, w.y + bh/2 - 2);
        ctx.lineTo(w.x + 5, w.y + bh/2 - 2);
        ctx.lineTo(w.x, w.y + bh/2 + 5);
        ctx.fill();
        
        // Shine/Reflection on balloon
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(w.x - bw/4, w.y - bh/4, bw/8, bh/6, Math.PI/4, 0, Math.PI * 2);
        ctx.fill();

        // Draw Text inside balloon
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        // Highlight matched part
        if (gameType === 'word' && inputValue && w.text.startsWith(inputValue)) {
          const matchW = ctx.measureText(inputValue).width;
          const remW = ctx.measureText(w.text.substring(inputValue.length)).width;
          const startX = w.x - (matchW + remW) / 2;
          
          ctx.textAlign = 'left';
          ctx.fillStyle = '#111827'; // Dark matched text
          ctx.fillText(inputValue, startX, w.y);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(w.text.substring(inputValue.length), startX + matchW, w.y);
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(w.text, w.x, w.y);
        }
        
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
  }, [gameState, difficulty, inputValue, score, stats, gameType]);

  useEffect(() => {
    if (gameState === 'gameover' && isAuthenticated && analytics) {
      api.post('/student/typing-scores', {
        gameName: 'Word Rain',
        wpm: analytics.wpm,
        accuracy: 100,
        score: analytics.score,
        difficulty: difficulty
      }).catch(err => console.error("Failed saving score", err));
    }
  }, [gameState, isAuthenticated, analytics, difficulty]);

  return (
    <div ref={containerRef} className={`w-full text-center max-w-4xl mx-auto ${isFullscreen ? 'bg-[#0B091B] h-screen p-6 md:p-10 overflow-y-auto' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Games
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">🎈</span>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Word Rain</h2>
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
        <div className="bg-white border-4 border-sky-400 rounded-3xl p-6 text-center max-w-sm mx-auto shadow-[0_8px_0_0_rgba(56,189,248,1)] animate-in zoom-in-95 mt-2">
          <div className="text-5xl mb-3 animate-bounce">🎈</div>
          <h3 className="text-2xl font-black text-slate-800 mb-1">Word Rain</h3>
          <p className="text-[11.5px] text-slate-500 font-bold leading-relaxed mb-4">
            Pop the balloons by typing the letters or words before they float away! 
          </p>

          {/* Game Type Selector */}
          <div className="mb-4">
            <span className="text-[9.5px] text-sky-500 font-black uppercase tracking-wider block mb-2">Game Type</span>
            <div className="flex justify-center gap-3">
              {[
                { type: 'letter', label: '🅰️ Letter Rain', color: 'pink', bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-700', hoverBg: 'hover:bg-pink-50', hoverBorder: 'hover:border-pink-400' },
                { type: 'word', label: '🔤 Word Rain', color: 'indigo', bg: 'bg-indigo-500', border: 'border-indigo-600', text: 'text-indigo-700', hoverBg: 'hover:bg-indigo-50', hoverBorder: 'hover:border-indigo-400' }
              ].map((m) => (
                <button
                  key={m.type}
                  onClick={() => setGameType(m.type)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 cursor-pointer flex-1 border-2 border-b-4 ${gameType === m.type ? `${m.bg} ${m.border} text-white translate-y-[1px] border-b-2` : `bg-white border-${m.color}-200 ${m.text} ${m.hoverBorder} ${m.hoverBg}`}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="mb-4">
            <span className="text-[9.5px] text-sky-500 font-black uppercase tracking-wider block mb-2">Difficulty Level</span>
            <div className="flex justify-center gap-3">
              {[
                { level: 'easy', color: 'emerald', bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-700', hoverBg: 'hover:bg-emerald-50', hoverBorder: 'hover:border-emerald-400', label: '🟢 Easy' },
                { level: 'medium', color: 'amber', bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-amber-700', hoverBg: 'hover:bg-amber-50', hoverBorder: 'hover:border-amber-400', label: '🟡 Med' },
                { level: 'hard', color: 'rose', bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-700', hoverBg: 'hover:bg-rose-50', hoverBorder: 'hover:border-rose-400', label: '🔴 Hard' }
              ].map((s) => (
                <button
                  key={s.level}
                  onClick={() => setDifficulty(s.level)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all duration-200 cursor-pointer flex-1 border-2 border-b-4 ${difficulty === s.level ? `${s.bg} ${s.border} text-white translate-y-[1px] border-b-2` : `bg-white border-${s.color}-200 ${s.text} ${s.hoverBorder} ${s.hoverBg}`}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_4px_0_0_rgba(14,165,233,1)] hover:shadow-[0_2px_0_0_rgba(14,165,233,1)] hover:translate-y-[2px] active:shadow-none active:translate-y-1 cursor-pointer">
            Start Popping! 🎈
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col gap-4 max-w-md mx-auto mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border-4 border-amber-400 rounded-2xl py-1.5 px-3 flex items-center justify-center gap-2.5 shadow-[0_4px_0_0_rgba(251,191,36,1)]">
              <span className="text-lg">⭐</span>
              <div className="flex flex-col items-start leading-none">
                <span className="text-lg font-black text-amber-500 leading-none">{score}</span>
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Score</span>
              </div>
            </div>
            <div className="bg-white border-4 border-rose-400 rounded-2xl py-1.5 px-3 flex items-center justify-center gap-2.5 shadow-[0_4px_0_0_rgba(251,113,133,1)]">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart key={i} className={`w-5 h-5 transition-all ${i < lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">Lives</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-white border-4 border-sky-400 rounded-2xl overflow-hidden shadow-[0_6px_0_0_rgba(56,189,248,1)] relative mt-1">
            <canvas ref={canvasRef} width={600} height={400} className="w-full h-auto block" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-rose-500 animate-pulse opacity-20"></div>
            <div className="absolute top-2 left-2 px-2.5 py-1 bg-sky-100 text-sky-600 rounded-lg text-[9.5px] font-black uppercase shadow-sm">
              {gameType === 'letter' ? '🅰️ Letter Mode' : '🔤 Word Mode'}
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={gameType === 'letter' ? "Type the letters!" : "Type the words!"}
            className="w-full bg-white border-4 border-emerald-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 text-slate-800 rounded-2xl py-3 px-6 text-lg font-black outline-none text-center shadow-[0_4px_0_0_rgba(52,211,153,1)] transition-all placeholder:text-emerald-250 mt-1"
          />
        </div>
      )}

      {gameState === 'gameover' && analytics && (
        <div className="bg-white border-4 border-rose-500 rounded-3xl p-6 text-center max-w-sm mx-auto shadow-[0_8px_0_0_rgba(225,29,72,1)] animate-in zoom-in-95 mt-2">
          <div className="text-5xl mb-3 animate-bounce">🎈💥</div>
          <h3 className="text-3xl font-black text-rose-500 mb-1">Game Over!</h3>
          <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">
            The balloons got away!
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-amber-100 border-2 border-amber-300 rounded-xl p-3">
              <p className="text-2xl font-black text-amber-500">{analytics.score}</p>
              <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider block mt-0.5">Final Score</span>
            </div>
            <div className="bg-sky-100 border-2 border-sky-300 rounded-xl p-3">
              <p className="text-2xl font-black text-sky-500">{analytics.wpm}</p>
              <span className="text-[9px] text-sky-700 font-bold uppercase tracking-wider block mt-0.5">{gameType === 'letter' ? 'LPM' : 'WPM'}</span>
            </div>
          </div>
          
          {!isAuthenticated && (
            <div className="bg-amber-100 border border-amber-250 rounded-xl p-2.5 mb-4 text-[10px] text-amber-800 font-black">
              🔑 Log in to save your awesome scores!
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button onClick={startGame} className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_rgba(159,18,57,1)] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_rgba(159,18,57,1)] cursor-pointer">
              🔄 Play Again!
            </button>
            <button onClick={onBack} className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer border border-slate-200">
              Back to Games
            </button>
          </div>
        </div>
      )}
    </div>
  );
}