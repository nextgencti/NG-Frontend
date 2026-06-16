import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, Heart, ShieldAlert, Award, Zap, Maximize, Minimize } from 'lucide-react';
import api from '../../../lib/axios';

const WORDS_POOL = {
  easy: ["apple", "grape", "lemon", "mango", "peach", "plum", "onion", "noun", "verb", "byte", "mouse", "logic", "pixel", "virus", "data", "code", "file", "disk", "port", "ram", "cpu", "kiwi", "pear"],
  medium: ["banana", "orange", "cherry", "carrot", "potato", "tomato", "garlic", "pepper", "radish", "celery", "turnip", "syntax", "grammar", "server", "router", "network", "monitor", "printer", "browser", "english", "screen", "laptop", "folder"],
  hard: ["vegetable", "hardware", "software", "keyboard", "internet", "adjective", "vocabulary", "sentence", "spelling", "processor", "algorithm", "database", "pineapple", "cucumber", "broccoli", "eggplant", "pumpkin"]
};

const BOSS_WORDS = ["ARCHITECTURE", "PROGRAMMING", "DEVELOPMENT", "STRAWBERRY", "POMEGRANATE", "CAULIFLOWER", "DICTIONARY", "CYBERSECURITY", "MOTHERBOARD"];

const ACHIEVEMENTS = [
  { id: 'first_flight', name: 'First Flight', desc: 'Launched your fighter for the first time.', icon: '🚀' },
  { id: 'combo_king', name: 'Combo King', desc: 'Achieved a combo multiplier of x5 (20+ streak).', icon: '🔥' },
  { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Defeated the mothership boss.', icon: '👾' },
  { id: 'wpm_master', name: 'WPM Master', desc: 'Reached a speed of 60+ WPM.', icon: '⚡' },
  { id: 'perfect_defense', name: 'Perfect Defense', desc: 'Finished with 95%+ typing accuracy.', icon: '🛡️' }
];

// Synth sounds using Web Audio API
const playSound = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const dest = audioCtx.destination;

    const createOscillator = (oscType, freq, duration, gainStart, gainEnd = 0.001) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(gainStart, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(gainEnd, audioCtx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(dest);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
      return { osc, gainNode };
    };

    if (type === 'laser') {
      const { osc } = createOscillator('sawtooth', 750, 0.1, 0.04);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
    } else if (type === 'hit') {
      createOscillator('triangle', 180, 0.05, 0.06);
    } else if (type === 'explosion') {
      // Low rumble
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.4);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(dest);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'shield-down') {
      const { osc } = createOscillator('sawtooth', 220, 0.35, 0.08);
      osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.3);
    } else if (type === 'combo-up') {
      // Ascending chime
      createOscillator('sine', 523.25, 0.08, 0.04); // C5
      setTimeout(() => createOscillator('sine', 659.25, 0.08, 0.04), 80); // E5
      setTimeout(() => createOscillator('sine', 783.99, 0.12, 0.04), 160); // G5
    } else if (type === 'level-up') {
      // Triumphant chord
      createOscillator('sine', 261.63, 0.3, 0.05); // C4
      createOscillator('sine', 329.63, 0.3, 0.05); // E4
      createOscillator('sine', 392.00, 0.3, 0.05); // G4
      setTimeout(() => {
        createOscillator('sine', 523.25, 0.4, 0.06); // C5
        createOscillator('sine', 659.25, 0.4, 0.06); // E5
      }, 150);
    } else if (type === 'boss-incoming') {
      // Alert siren
      const siren = () => {
        const { osc } = createOscillator('sawtooth', 300, 0.25, 0.06);
        osc.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.25);
      };
      siren();
      setTimeout(siren, 300);
      setTimeout(siren, 600);
    }
  } catch { /* ignore */ }
};

export default function SkyStrikeGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  
  // Game metrics
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(3);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [combo, setCombo] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  // Alert flags
  const [bossActive, setBossActive] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [newBadgeAlert, setNewBadgeAlert] = useState(null); // { name, icon }

  // Game over analytics
  const [analytics, setAnalytics] = useState(null);
  const [, setSavingScore] = useState(false);

  const canvasRef = useRef(null);
  const shipImageRef = useRef(null);
  const gameContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      gameContainerRef.current?.requestFullscreen?.().catch(err => console.error(err));
    } else {
      document.exitFullscreen?.().catch(err => console.error(err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = '/spaceship_a.png';
    img.onload = () => {
      shipImageRef.current = img;
    };
  }, []);

  // Reference properties for animation frame closure
  const stateRef = useRef({
    words: [],          // [{ id, text, typed, x, y, speed, type, maxHp, hp }]
    bullets: [],        // [{ x, y, tx, ty, vx, vy, color }]
    particles: [],      // [{ x, y, vx, vy, color, alpha, radius }]
    stars: [],          // [{ x, y, size, speed }]
    shootingStars: [],  // [{ x, y, vx, vy, length, alpha }]
    planeAngle: -Math.PI / 2,
    targetWord: null,
    score: 0,
    shields: 3,
    level: 1,
    xp: 0,
    combo: 0,
    maxCombo: 0,
    totalCharsTyped: 0,
    errorsTyped: 0,
    wordsCleared: 0,
    bossTimer: 0,
    bossActive: false,
    textPopups: [],     // [{ x, y, text, color, alpha, scale, vy }]
    badges: [],
    startTime: null
  });

  const generateStarfield = (width, height) => {
    const stars = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 1.5,
        speed: 0.2 + Math.random() * 0.8
      });
    }
    return stars;
  };

  // Difficulty settings are inline in draw loop

  const triggerBadgeUnlock = (badgeId) => {
    const badge = ACHIEVEMENTS.find(a => a.id === badgeId);
    if (badge && !stateRef.current.badges.includes(badgeId)) {
      stateRef.current.badges.push(badgeId);
      setUnlockedBadges([...stateRef.current.badges]);
      setNewBadgeAlert(badge);
      playSound('combo-up');
      setTimeout(() => setNewBadgeAlert(null), 3000);
    }
  };

  const startGame = () => {
    setScore(0);
    setShields(3);
    setLevel(1);
    setXp(0);
    setCombo(0);
    setWpm(0);
    setAccuracy(100);
    setBossActive(false);
    setUnlockedBadges([]);
    setNewBadgeAlert(null);
    setAnalytics(null);

    const canvas = canvasRef.current || { width: 800, height: 480 };
    
    stateRef.current = {
      words: [],
      bullets: [],
      particles: [],
      stars: generateStarfield(canvas.width, canvas.height),
      shootingStars: [],
      planeAngle: -Math.PI / 2,
      targetWord: null,
      score: 0,
      shields: 3,
      level: 1,
      xp: 0,
      combo: 0,
      maxCombo: 0,
      totalCharsTyped: 0,
      errorsTyped: 0,
      wordsCleared: 0,
      bossTimer: 0,
      bossActive: false,
      textPopups: [],
      badges: ['first_flight'],
      startTime: Date.now()
    };
    
    setUnlockedBadges(['first_flight']);
    setGameState('playing');
    playSound('level-up');
  };

  const shootLaser = (target) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const px = canvas.width / 2;
    const py = canvas.height - 40;

    const angle = Math.atan2(target.y - py, target.x - px);
    stateRef.current.planeAngle = angle;

    // Wing offsets for dual firing lasers
    const bSpeed = 18;
    const vx = Math.cos(angle) * bSpeed;
    const vy = Math.sin(angle) * bSpeed;

    stateRef.current.bullets.push({
      x: px + Math.cos(angle + Math.PI/2) * 12,
      y: py + Math.sin(angle + Math.PI/2) * 12,
      vx, vy, color: '#06B6D4'
    });
    stateRef.current.bullets.push({
      x: px + Math.cos(angle - Math.PI/2) * 12,
      y: py + Math.sin(angle - Math.PI/2) * 12,
      vx, vy, color: '#06B6D4'
    });
  };

  const spawnTextPopup = (x, y, text, color = '#FFFFFF') => {
    stateRef.current.textPopups.push({
      x, y, text, color, alpha: 1.0, scale: 1.0, vy: -1.2
    });
  };

  // Keyboard Event Listener
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e) => {
      // Skip systemic shortcuts
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey || e.key === ' ') return;
      e.preventDefault();

      const pressedKey = e.key;
      const state = stateRef.current;
      let target = state.targetWord;

      // Lock target
      if (!target) {
        target = state.words.find(w => w.text[0] === pressedKey);
        if (target) {
          state.targetWord = target;
          target.typed = pressedKey;
          state.totalCharsTyped++;
          state.combo++;
          if (state.combo > state.maxCombo) state.maxCombo = state.combo;

          // Play laser and draw effects
          shootLaser(target);
          playSound('laser');
          spawnTextPopup(target.x, target.y - 12, '+1', '#22D3EE');

          if (state.combo >= 20) {
            triggerBadgeUnlock('combo_king');
          }
        } else {
          // Mistake
          state.errorsTyped++;
          state.combo = 0;
          playSound('hit');
          spawnTextPopup(canvasRef.current.width / 2, canvasRef.current.height - 80, 'MISS!', '#EF4444');
        }
      } else {
        // Feed locked target
        const nextChar = target.text[target.typed.length];
        if (pressedKey === nextChar) {
          target.typed += pressedKey;
          state.totalCharsTyped++;
          state.combo++;
          if (state.combo > state.maxCombo) state.maxCombo = state.combo;
          
          shootLaser(target);
          playSound('laser');

          // Combo alert pops
          if (state.combo === 10) {
            spawnTextPopup(canvasRef.current.width / 2, canvasRef.current.height - 110, 'COMBO x2! 🔥', '#F59E0B');
            playSound('combo-up');
          } else if (state.combo === 20) {
            spawnTextPopup(canvasRef.current.width / 2, canvasRef.current.height - 110, 'UNSTOPPABLE x5! 👑', '#EC4899');
            playSound('combo-up');
          }

          // Word Complete
          if (target.typed === target.text) {
            playSound('explosion');
            
            // Score with combo multipliers
            const multiplier = state.combo >= 20 ? 5 : state.combo >= 10 ? 3 : state.combo >= 5 ? 2 : 1;
            const pointsAwarded = 10 * multiplier;
            state.score += pointsAwarded;
            
            // Check if word belongs to boss
            if (target.type === 'boss') {
              target.hp--;
              spawnTextPopup(target.x, target.y - 30, `HP -1 💥`, '#EF4444');
              if (target.hp <= 0) {
                // Boss Defeated!
                playSound('level-up');
                state.score += 200;
                spawnTextPopup(target.x, target.y - 10, 'BOSS DESTROYED! +200 👾', '#EF4444');
                state.words = state.words.filter(w => w.id !== target.id);
                state.targetWord = null;
                state.bossActive = false;
                setBossActive(false);
                triggerBadgeUnlock('boss_slayer');
              } else {
                // Next boss sub-word
                const nextWords = BOSS_WORDS;
                target.text = nextWords[Math.floor(Math.random() * nextWords.length)];
                target.typed = '';
                state.targetWord = null;
              }
            } else {
              // Standard asteroid word cleared
              state.words = state.words.filter(w => w.id !== target.id);
              state.targetWord = null;
              state.wordsCleared++;
              
              // Spawning explosion debris
              const debrisColors = target.text.length < 5 ? ['#10B981', '#FFFFFF'] : target.text.length < 8 ? ['#F59E0B', '#FFFFFF'] : ['#EF4444', '#FFFFFF'];
              for (let d = 0; d < 20; d++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = 1.5 + Math.random() * 4.5;
                state.particles.push({
                  x: target.x,
                  y: target.y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
                  alpha: 1.0,
                  radius: 1.5 + Math.random() * 3
                });
              }

              spawnTextPopup(target.x, target.y - 10, `+${pointsAwarded} PERFECT!`, '#10B981');
              
              // Level XP progression
              state.xp += 10;
              const nextLvlXp = state.level * 60;
              if (state.xp >= nextLvlXp) {
                state.level++;
                state.xp = 0;
                setLevel(state.level);
                playSound('level-up');
                spawnTextPopup(canvasRef.current.width / 2, canvasRef.current.height / 2, `LEVEL UP! LEVEL ${state.level} ⚡`, '#818CF8');
              }
            }

            setScore(state.score);
            setXp(state.xp);
            
            // Calculate live WPM/Accuracy
            const elapsedMin = (Date.now() - state.startTime) / 60000;
            const wpmVal = elapsedMin > 0 ? Math.round((state.totalCharsTyped / 5) / elapsedMin) : 0;
            setWpm(wpmVal);
            if (wpmVal >= 60) {
              triggerBadgeUnlock('wpm_master');
            }
          }
        } else {
          // Wrong key
          state.errorsTyped++;
          state.combo = 0;
          playSound('hit');
          spawnTextPopup(canvasRef.current.width / 2, canvasRef.current.height - 80, 'MISS!', '#EF4444');
        }
      }

      setCombo(state.combo);
      const accVal = state.totalCharsTyped > 0 ? Math.round(((state.totalCharsTyped - state.errorsTyped) / state.totalCharsTyped) * 100) : 100;
      setAccuracy(accVal);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Draw loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let spawnTimer = 0;
    let wordIdCounter = 0;

    const settings = (() => {
      switch (difficulty) {
        case 'easy': return { baseSpeed: 0.45, spawnInterval: 3000, maxWords: 4 };
        case 'hard': return { baseSpeed: 1.4, spawnInterval: 1400, maxWords: 8 };
        case 'medium':
        default: return { baseSpeed: 0.85, spawnInterval: 2000, maxWords: 5 };
      }
    })();

    const draw = () => {
      // Clear screen
      ctx.fillStyle = '#0B091B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const state = stateRef.current;

      // 1. Nebula background draws
      const nebulaGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 300);
      nebulaGlow.addColorStop(0, 'rgba(99, 102, 241, 0.04)');
      nebulaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Parallax Starfield Movement
      ctx.fillStyle = '#FFFFFF';
      state.stars.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.globalAlpha = 0.3 + Math.random() * 0.7; // twinkle
        ctx.fillRect(s.x, s.y, s.size, s.size);
        ctx.restore();
      });

      // 3. Spawning Random Shooting Stars
      if (Math.random() < 0.007 && state.shootingStars.length < 2) {
        state.shootingStars.push({
          x: Math.random() * canvas.width * 0.7,
          y: 0,
          vx: 4 + Math.random() * 4,
          vy: 4 + Math.random() * 4,
          length: 30 + Math.random() * 40,
          alpha: 1.0
        });
      }

      state.shootingStars = state.shootingStars.filter(ss => {
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.alpha -= 0.04;
        if (ss.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = ss.alpha;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x - ss.vx * 1.5, ss.y - ss.vy * 1.5);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // 4. Drawing Debris/Explosion Particles
      state.particles = state.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.035;
        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // 5. Drawing Bullet Lasers
      state.bullets = state.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;

        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 0.5, b.y - b.vy * 0.5);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();

        return b.y > 0 && b.x > 0 && b.x < canvas.width;
      });

      // 6. Spawn Boss or Standard Asteroid
      state.bossTimer += 16.67;
      if (state.bossTimer >= 50000 && !state.bossActive) {
        // Trigger Boss Alert
        state.bossTimer = 0;
        state.bossActive = true;
        setBossActive(true);
        playSound('boss-incoming');
        spawnTextPopup(canvas.width / 2, 100, 'ALERT: BOSS MOTHERSHIP INCOMING 👾', '#EF4444');
        
        state.words.push({
          id: -99,
          text: BOSS_WORDS[Math.floor(Math.random() * BOSS_WORDS.length)],
          typed: '',
          x: canvas.width / 2,
          y: 70,
          speed: 0.1, // static/slow float
          type: 'boss',
          maxHp: 3,
          hp: 3
        });
      }

      spawnTimer += 16.67;
      if (spawnTimer >= settings.spawnInterval && state.words.length < settings.maxWords && !state.bossActive) {
        spawnTimer = 0;
        
        // Pick words based on random choice
        let text = '';
        const levelSelector = Math.random();
        if (levelSelector < 0.5) text = WORDS_POOL.easy[Math.floor(Math.random() * WORDS_POOL.easy.length)];
        else if (levelSelector < 0.85) text = WORDS_POOL.medium[Math.floor(Math.random() * WORDS_POOL.medium.length)];
        else text = WORDS_POOL.hard[Math.floor(Math.random() * WORDS_POOL.hard.length)];

        const x = 70 + Math.random() * (canvas.width - 140);
        state.words.push({
          id: wordIdCounter++,
          text,
          typed: '',
          x,
          y: -20,
          speed: settings.baseSpeed * (0.8 + Math.random() * 0.45)
        });
      }

      // 7. Update and Draw Asteroids & Words
      let hitShieldsCount = 0;
      const speedMultiplier = 1 + (state.level * 0.15);
      
      const triggerExplosion = (ex, ey) => {
        for (let d = 0; d < 30; d++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 5;
          state.particles.push({
            x: ex,
            y: ey,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color: Math.random() > 0.5 ? '#F97316' : '#EF4444',
            alpha: 1.0,
            radius: 2 + Math.random() * 4
          });
        }
      };

      state.words = state.words.filter(w => {
        w.y += w.speed * speedMultiplier;

        if (w.y >= canvas.height - 85) {
          hitShieldsCount++;
          triggerExplosion(w.x, w.y);
          playSound('shield-down');
          if (state.targetWord?.id === w.id) {
            state.targetWord = null;
          }
          return false;
        }

        const isLocked = state.targetWord?.id === w.id;
        ctx.save();
        ctx.font = '900 16px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        const textWidth = ctx.measureText(w.text).width;
        const radius = Math.max(textWidth / 2 + 16, 28);

        // Determine Neon Colors based on Word ID
        const colorPalette = [
          { stroke: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' }, // Blue
          { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.6)' }, // Green
          { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' }, // Orange
          { stroke: '#EF4444', glow: 'rgba(239, 68, 68, 0.6)' },  // Red
          { stroke: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)' }, // Purple
          { stroke: '#06B6D4', glow: 'rgba(6, 182, 212, 0.6)' }   // Cyan
        ];
        const palette = colorPalette[Math.abs(w.id) % colorPalette.length];
        let strokeColor = palette.stroke;
        let strokeGlow = palette.glow;
        let rockColor = 'rgba(15, 10, 25, 0.9)'; // Dark pill background
        
        if (w.type === 'boss') {
          strokeColor = '#EC4899';
          strokeGlow = 'rgba(236, 72, 153, 0.85)';
          rockColor = 'rgba(30, 10, 30, 0.9)';
        }

        const rectW = textWidth + 36; // Extra padding
        const rectH = 38;
        const rX = w.x - rectW / 2;
        const rY = w.y - rectH / 2;
        const cornerRadius = 14; // Pill shape / rounded rect
        
        // --- Draw Vertical Light Beams ---
        ctx.globalCompositeOperation = 'screen';
        
        // Wide fading top beam
        const topGrad = ctx.createLinearGradient(0, rY, 0, rY - 60);
        topGrad.addColorStop(0, strokeColor + '40'); // ~25% opacity
        topGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = topGrad;
        ctx.fillRect(rX + 10, rY - 60, rectW - 20, 60);

        // Wide fading bottom beam
        const botGrad = ctx.createLinearGradient(0, rY + rectH, 0, rY + rectH + 60);
        botGrad.addColorStop(0, strokeColor + '40');
        botGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = botGrad;
        ctx.fillRect(rX + 10, rY + rectH, rectW - 20, 60);

        // Add 2 thin bright laser beams in the middle
        const thinTopGrad = ctx.createLinearGradient(0, rY, 0, rY - 80);
        thinTopGrad.addColorStop(0, strokeColor + '80');
        thinTopGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = thinTopGrad;
        ctx.fillRect(w.x - 12, rY - 80, 4, 80);
        ctx.fillRect(w.x + 8, rY - 80, 4, 80);

        const thinBotGrad = ctx.createLinearGradient(0, rY + rectH, 0, rY + rectH + 80);
        thinBotGrad.addColorStop(0, strokeColor + '80');
        thinBotGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = thinBotGrad;
        ctx.fillRect(w.x - 12, rY + rectH, 4, 80);
        ctx.fillRect(w.x + 8, rY + rectH, 4, 80);

        ctx.globalCompositeOperation = 'source-over';

        // --- Draw Rounded Pill Shape ---
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(rX, rY, rectW, rectH, cornerRadius);
        } else {
          // Fallback if roundRect is not supported
          ctx.moveTo(rX + cornerRadius, rY);
          ctx.lineTo(rX + rectW - cornerRadius, rY);
          ctx.quadraticCurveTo(rX + rectW, rY, rX + rectW, rY + cornerRadius);
          ctx.lineTo(rX + rectW, rY + rectH - cornerRadius);
          ctx.quadraticCurveTo(rX + rectW, rY + rectH, rX + rectW - cornerRadius, rY + rectH);
          ctx.lineTo(rX + cornerRadius, rY + rectH);
          ctx.quadraticCurveTo(rX, rY + rectH, rX, rY + rectH - cornerRadius);
          ctx.lineTo(rX, rY + cornerRadius);
          ctx.quadraticCurveTo(rX, rY, rX + cornerRadius, rY);
        }
        ctx.closePath();

        ctx.fillStyle = rockColor;
        ctx.shadowBlur = isLocked ? 20 : 12;
        ctx.shadowColor = isLocked ? strokeColor : strokeGlow;
        ctx.fill();
        ctx.shadowBlur = 0; // reset glow

        ctx.strokeStyle = isLocked ? '#FFFFFF' : strokeColor;
        ctx.lineWidth = isLocked ? 2.5 : 1.5;
        ctx.stroke();

        // If Boss, render health bar
        if (w.type === 'boss') {
          const hpBarW = radius * 1.5;
          const hpBarH = 4;
          const hpPct = w.hp / w.maxHp;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(w.x - hpBarW/2, w.y - radius - 12, hpBarW, hpBarH);
          ctx.fillStyle = '#EC4899';
          ctx.fillRect(w.x - hpBarW/2, w.y - radius - 12, hpBarW * hpPct, hpBarH);
        }

        // Draw Letters inside Asteroid
        ctx.font = '900 16px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const rawText = w.text;
        const typedLen = w.typed.length;

        // Render typed chars vs remaining chars
        if (typedLen > 0) {
          const typedPart = rawText.substring(0, typedLen);
          const remainingPart = rawText.substring(typedLen);
          
          const typedW = ctx.measureText(typedPart).width;
          const remW = ctx.measureText(remainingPart).width;
          const totalW = typedW + remW;

          const startX = w.x - totalW/2;
          ctx.textAlign = 'left';

          // Draw typed letters (faded grey)
          ctx.fillStyle = '#9CA3AF';
          ctx.fillText(typedPart, startX, w.y);
          // Draw strike line
          ctx.fillStyle = '#6366F1';
          ctx.fillRect(startX, w.y + 6, typedW, 1.5);

          // Draw remaining letters (glowing neon)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(remainingPart, startX + typedW, w.y);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillText(rawText, w.x, w.y);
        }

        ctx.restore();
        return true;
      });

      // Apply shield damage check
      if (hitShieldsCount > 0) {
        state.shields = Math.max(0, state.shields - hitShieldsCount);
        setShields(state.shields);
        if (state.shields <= 0) {
          // Game Over triggers
          cancelAnimationFrame(animationId);
          playSound('boss-incoming');
          
          // Submit statistics
          const elapsed = (Date.now() - state.startTime) / 1000;
          const accVal = state.totalCharsTyped > 0 ? Math.round(((state.totalCharsTyped - state.errorsTyped) / state.totalCharsTyped) * 100) : 100;
          if (accVal >= 95) {
            triggerBadgeUnlock('perfect_defense');
          }

          setAnalytics({
            score: state.score,
            accuracy: accVal,
            wpm: wpm,
            wordsCleared: state.wordsCleared,
            chars: state.totalCharsTyped,
            errors: state.errorsTyped,
            maxCombo: state.maxCombo,
            time: elapsed
          });
          setGameState('gameover');
          return;
        }
      }

      // 8. Move and Draw Floating text popups
      state.textPopups = state.textPopups.filter(pop => {
        pop.y += pop.vy;
        pop.alpha -= 0.02;
        if (pop.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = pop.alpha;
        ctx.fillStyle = pop.color;
        ctx.font = 'black 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
        return true;
      });

      // 9. Draw Upgraded Spaceship Fighter & Shield Aura
      const px = canvas.width / 2;
      const py = canvas.height - 40;

      // Draw Engine Flames Particles
      if (Math.random() < 0.8) {
        const exhaustAngle = state.planeAngle + Math.PI;
        state.particles.push({
          x: px + Math.cos(exhaustAngle) * 12 + (Math.random() - 0.5) * 6,
          y: py + Math.sin(exhaustAngle) * 12 + (Math.random() - 0.5) * 6,
          vx: Math.cos(exhaustAngle) * 2 + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(exhaustAngle) * 2 + (Math.random() - 0.5) * 0.5,
          color: Math.random() < 0.6 ? '#F97316' : '#EF4444',
          alpha: 1.0,
          radius: 1.5 + Math.random() * 2
        });
      }

      // Shield Aura Ring
      if (state.shields > 0) {
        ctx.save();
        ctx.strokeStyle = state.shields === 3 ? 'rgba(34, 211, 238, 0.25)' : state.shields === 2 ? 'rgba(245, 158, 11, 0.22)' : 'rgba(239, 68, 68, 0.25)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = ctx.strokeStyle;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Spaceship Body
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(state.planeAngle + Math.PI / 2);

      if (shipImageRef.current) {
        const imgW = 80;
        const imgH = (shipImageRef.current.height / shipImageRef.current.width) * imgW;
        // Offset slightly upwards because the flames make the center of mass higher
        ctx.drawImage(shipImageRef.current, -imgW / 2, -imgH / 2 - 10, imgW, imgH);
      } else {
        // Fallback to triangle
        ctx.fillStyle = '#6366F1';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 10);
        ctx.lineTo(0, 5);
        ctx.lineTo(15, 10);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [gameState, score, difficulty, wpm]);

  // Score persistence to API
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated || !analytics) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        await api.post('/student/typing-scores', {
          gameName: 'Sky Strike',
          wpm: analytics.wpm,
          accuracy: analytics.accuracy,
          score: analytics.score,
          difficulty: difficulty
        });
      } catch (err) {
        console.error('Failed to persist Sky Strike score:', err);
      } finally {
        setSavingScore(false);
      }
    };

    saveScore();
  }, [gameState, analytics, difficulty, isAuthenticated]);

  const levelProgress = (xp / (level * 60)) * 100;

  return (
    <div ref={gameContainerRef} className={`w-full text-center max-w-4xl mx-auto select-none font-sans ${isFullscreen ? 'bg-[#0B091B] min-h-screen p-8 overflow-y-auto flex flex-col justify-center' : ''}`}>
      {/* Dynamic Badge Unlock Banner */}
      {newBadgeAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1D173D]/95 border border-amber-500 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="text-2xl">{newBadgeAlert.icon}</span>
          <div className="text-left">
            <p className="text-[10px] text-amber-400 font-black uppercase tracking-wider leading-none">Badge Unlocked!</p>
            <h4 className="text-xs font-black text-white mt-1">{newBadgeAlert.name}</h4>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-indigo-950/60 pb-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-24"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Sky Strike</h2>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
          {gameState !== 'lobby' && (
            <button
              onClick={startGame}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          )}
        </div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-cyan-400">
            <Zap className="w-8 h-8 fill-current text-cyan-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sky Strike</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            An advanced typing shoot-em-up. Lock lasers and fire upon incoming asteroid debris by typing their text codes. Beat the motherships!
          </p>

          {/* Difficulty selector */}
          <div className="mb-6">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-2">Defense Level</span>
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
            <Play className="w-4 h-4 fill-current" /> Play
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-4">
          {/* Glassmorphism HUD Bar */}
          <div className="bg-[#151230]/75 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="border-r border-indigo-950/40">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">🏆 Score</p>
              <span className="text-lg font-black text-cyan-400 font-mono">{score}</span>
            </div>
            <div className="border-r border-indigo-950/40">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">⚡ Speed</p>
              <span className="text-lg font-black text-white font-mono">{wpm} <span className="text-[10px] text-slate-400">WPM</span></span>
            </div>
            <div className="border-r border-indigo-950/40">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">🎯 Accuracy</p>
              <span className="text-lg font-black text-white font-mono">{accuracy}%</span>
            </div>
            <div className="border-r border-indigo-950/40 flex flex-col items-center justify-center">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">❤️ Shields</p>
              <div className="flex gap-1 mt-0.5">
                {[1, 2, 3].map((s) => (
                  <Heart key={s} className={`w-3.5 h-3.5 ${s <= shields ? 'text-cyan-400 fill-cyan-400/20' : 'text-slate-700'}`} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-none mb-1">🔥 Combo</p>
              <span className="text-lg font-black text-amber-400 font-mono">x{combo}</span>
            </div>
          </div>

          {/* Level Progress Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/40 border border-indigo-950 rounded-xl px-4 py-2 text-xs font-bold text-slate-400">
            <span>LEVEL {level}</span>
            <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden">
              <div 
                style={{ width: `${levelProgress}%` }}
                className="h-full bg-indigo-500 transition-all duration-300"
              />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{Math.round(levelProgress)}% EXP</span>
          </div>

          {/* Boss warning HUD overlay */}
          {bossActive && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-black uppercase tracking-widest py-2 rounded-xl animate-pulse">
              🚨 WARNING: Boss Invader Detected! Eliminate immediately! 🚨
            </div>
          )}

          {/* Canvas Wrapper */}
          <div className="w-full bg-[#0B091B] border border-indigo-500/20 rounded-3xl p-1 shadow-2xl relative">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={460} 
              className="w-full h-auto block rounded-2xl max-w-full"
            />
          </div>
        </div>
      )}

      {gameState === 'gameover' && analytics && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl animate-in zoom-in-95 text-left">
          <div className="flex items-center gap-4 border-b border-indigo-950/60 pb-5 mb-6">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Fighter Base Shield Collapsed</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Excellent combat run! View your analytics logs below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat columns */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-cyan-400 font-mono">{analytics.score}</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Final Score</span>
              </div>
              <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white font-mono">{analytics.wpm} <span className="text-xs font-semibold text-slate-400">WPM</span></p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Combat Speed</span>
              </div>
              <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-white font-mono">{analytics.accuracy}%</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Accuracy Rating</span>
              </div>
              <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-amber-400 font-mono">x{analytics.maxCombo}</p>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Max Key Combo</span>
              </div>
              <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 text-center col-span-2 flex justify-around items-center">
                <div>
                  <p className="text-base font-black text-indigo-200 font-mono">{analytics.wordsCleared}</p>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Debris Smashed</span>
                </div>
                <div className="w-[1px] h-6 bg-indigo-950" />
                <div>
                  <p className="text-base font-black text-indigo-200 font-mono">{Math.floor(analytics.time)}s</p>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Time Survived</span>
                </div>
              </div>
            </div>

            {/* Badges unlocked */}
            <div className="bg-slate-950/45 border border-indigo-950 rounded-xl p-4 flex flex-col">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block mb-3">🏅 Badge Achievements</span>
              <div className="flex flex-col gap-2.5 overflow-y-auto flex-grow max-h-48 pr-1">
                {unlockedBadges.length > 0 ? (
                  unlockedBadges.map((badgeId) => {
                    const badge = ACHIEVEMENTS.find(a => a.id === badgeId);
                    return (
                      <div key={badgeId} className="flex items-center gap-2 bg-[#151230]/40 border border-indigo-500/10 p-2 rounded-lg text-xs">
                        <span className="text-lg">{badge.icon}</span>
                        <div>
                          <p className="font-black text-slate-200 leading-none">{badge.name}</p>
                          <span className="text-[9px] text-slate-500 font-bold leading-none mt-0.5 block">{badge.desc}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-600 font-bold">No badges unlocked</span>
                )}
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-6 text-[10px] text-amber-300 font-semibold leading-relaxed">
              🔑 Log in or create an account to save your space typing stats and list on leaderboards!
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/15"
            >
              <RotateCcw className="w-4 h-4" /> Start Next Run
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
