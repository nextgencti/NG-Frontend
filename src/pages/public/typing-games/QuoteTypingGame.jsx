import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ArrowLeft, BookOpen, Award, Zap } from 'lucide-react';
import api from '../../../lib/axios';

const QUOTES_DB = {
  easy: [
    "To be or not to be, that is the question.",
    "I think, therefore I am.",
    "Be yourself; everyone else is already taken.",
    "In the end, we only regret the chances we did not take.",
    "Life is what happens when you are busy making other plans.",
    "Do what you can, with what you have, where you are."
  ],
  medium: [
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    "If you want to live a happy life, tie it to a goal, not to people or things.",
    "In three words I can sum up everything I've learned about life: it goes on.",
    "Success is not how high you have climbed, but how you make a positive difference to the world."
  ],
  hard: [
    "The software industry is a constant struggle between engineers trying to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots. So far, the Universe is winning.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. The question is not who is going to let me; it's who is going to stop me.",
    "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking."
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
      osc.frequency.setValueAtTime(140 + Math.random() * 20, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch (e) {}
};

export default function QuoteTypingGame({ onBack, isAuthenticated }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('lobby'); // lobby | playing | gameover
  const [quote, setQuote] = useState('');
  const [typedText, setTypedText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [savingScore, setSavingScore] = useState(false);

  const inputRef = useRef(null);

  const startGame = () => {
    const list = QUOTES_DB[difficulty];
    const selected = list[Math.floor(Math.random() * list.length)];
    setQuote(selected);
    setTypedText('');
    setStartTime(Date.now());
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setGameState('playing');
    playSound('success');

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length > quote.length) return;

    playSound('click');

    // Count errors
    if (val.length > typedText.length) {
      const idx = val.length - 1;
      if (val[idx] !== quote[idx]) {
        setErrors(prev => prev + 1);
      }
    }

    setTypedText(val);

    // Calculate live stats
    const elapsedMin = (Date.now() - startTime) / 60000;
    
    // Count correct chars
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === quote[i]) correct++;
    }

    const liveWpm = elapsedMin > 0 ? Math.round((correct / 5) / elapsedMin) : 0;
    const totalAttempted = val.length + errors;
    const liveAcc = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 100;

    setWpm(liveWpm);
    setAccuracy(liveAcc);

    // Check completion
    if (val.length === quote.length) {
      setGameState('gameover');
      playSound('success');
    }
  };

  // Score Saving
  useEffect(() => {
    if (gameState !== 'gameover' || !isAuthenticated) return;

    const saveScore = async () => {
      setSavingScore(true);
      try {
        await api.post('/student/typing-scores', {
          gameName: 'Quote Typing',
          wpm: wpm,
          accuracy: accuracy,
          score: Math.round(wpm * (accuracy / 100) * 5),
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

  // Render highlighted text
  const renderText = () => {
    return quote.split('').map((char, index) => {
      const isTyped = index < typedText.length;
      const isCorrect = isTyped && typedText[index] === char;
      const isCursor = index === typedText.length;

      let colorClass = 'text-slate-500/60';
      if (isTyped) {
        colorClass = isCorrect ? 'text-slate-200' : 'text-rose-500 underline decoration-rose-500/60 decoration-2';
      }

      return (
        <span key={index} className={`font-mono text-lg md:text-xl transition-colors duration-100 ${colorClass} relative`}>
          {isCursor && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[1.2em] bg-indigo-400 caret-blink rounded-sm" />
          )}
          {char}
        </span>
      );
    });
  };

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
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Quote Typing</h2>
        </div>
        <div className="w-24"></div>
      </div>

      {gameState === 'lobby' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Quote Typing</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
            Practice typing classic quotes of great figures. Helps you focus on speed, rhythm, punctuation, and capitalization.
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
            <Play className="w-4 h-4 fill-current" /> Start Typing
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full flex flex-col gap-5 max-w-2xl mx-auto">
          {/* Stats Bar */}
          <div className="flex justify-between items-center bg-slate-950/40 border border-indigo-950 rounded-2xl px-5 py-3 text-xs font-bold text-slate-400">
            <div>
              <span>Live WPM:</span>
              <span className="text-indigo-400 text-sm font-black font-mono ml-1">{wpm}</span>
            </div>
            <div>
              <span>Accuracy:</span>
              <span className="text-indigo-400 text-sm font-black font-mono ml-1">{accuracy}%</span>
            </div>
            <div>
              <span>Errors:</span>
              <span className="text-rose-500 text-sm font-black font-mono ml-1">{errors}</span>
            </div>
          </div>

          {/* Interactive Typing Board */}
          <div 
            onClick={() => inputRef.current && inputRef.current.focus()}
            className="bg-[#151230]/70 border border-indigo-500/20 hover:border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative cursor-text min-h-[160px] text-left leading-relaxed flex items-center justify-center select-none"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
            <div className="w-full">{renderText()}</div>
          </div>

          {/* Hidden input to capture typed text */}
          <textarea
            ref={inputRef}
            value={typedText}
            onChange={handleInputChange}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            autoFocus
          />
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="bg-[#151230]/75 border border-indigo-500/20 rounded-3xl p-8 text-center max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-indigo-400">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Quote Completed!</h3>
          
          <div className="grid grid-cols-2 gap-3 bg-slate-950/40 border border-indigo-950 rounded-2xl p-4 mb-6">
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{wpm}</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">WPM</span>
            </div>
            <div>
              <p className="text-xl font-black text-indigo-400 font-mono">{accuracy}%</p>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Accuracy</span>
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
              <RotateCcw className="w-4 h-4" /> Type Next Quote
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
