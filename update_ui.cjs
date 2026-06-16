const fs = require('fs');
const path = './src/pages/public/typing-games/SkyStrikeGame.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables
const stateTarget = `const [, setSavingScore] = useState(false);`;
const stateReplacement = `const [, setSavingScore] = useState(false);
  
  const [targetWordStr, setTargetWordStr] = useState('');
  const [typedStr, setTypedStr] = useState('');
  const [nextWordStr, setNextWordStr] = useState('');

  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
       const state = stateRef.current;
       if (state.targetWord) {
           setTargetWordStr(state.targetWord.text);
           setTypedStr(state.targetWord.typed);
       } else {
           setTargetWordStr('');
           setTypedStr('');
       }
       const untargeted = state.words.filter(w => w.id !== state.targetWord?.id);
       if (untargeted.length > 0) {
           const lowest = untargeted.reduce((prev, current) => (prev.y > current.y) ? prev : current);
           setNextWordStr(lowest.text);
       } else {
           setNextWordStr('');
       }
    }, 100);
    return () => clearInterval(interval);
  }, [gameState]);`;
content = content.replace(stateTarget, stateReplacement);

// 2. Add Leaderboard Data
const importTarget = `import api from '../../../lib/axios';`;
const importReplacement = `import api from '../../../lib/axios';
const LEADERBOARD_DATA = [
  { name: 'Rahul', score: 5200 },
  { name: 'Aman', score: 4800 },
  { name: 'Priya', score: 4500 },
  { name: 'Neha', score: 4100 },
  { name: 'Arjun', score: 3900 }
];`;
content = content.replace(importTarget, importReplacement);

// 3. Update Asteroid rendering
const astTarget = `        const isLocked = state.targetWord?.id === w.id;
        ctx.save();
        ctx.font = '900 16px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        const textWidth = ctx.measureText(w.text).width;
        const radius = Math.max(textWidth / 2 + 16, 28);

        // Drawing a rugged procedurally shaped asteroid circle
        ctx.beginPath();
        const steps = 8;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          // Rugged bumpy multiplier
          const bump = 1 + Math.sin(angle * 4.5 + w.id) * 0.12; 
          const rx = w.x + Math.cos(angle) * radius * bump;
          const ry = w.y + Math.sin(angle) * radius * bump;
          if (i === 0) ctx.moveTo(rx, ry);
          else ctx.lineTo(rx, ry);
        }
        ctx.closePath();

        // Fill color based on word difficulty/size
        let rockColor = '#05020D';`;

const astReplacement = `        const isLocked = state.targetWord?.id === w.id;
        ctx.save();
        ctx.font = '900 16px Inter, sans-serif';
        ctx.letterSpacing = '2px';
        const textWidth = ctx.measureText(w.text).width;
        const radius = Math.max(textWidth / 2 + 16, 28);

        const padX = 24;
        const padY = 16;
        const pillWidth = textWidth + padX * 2;
        const pillHeight = 36;
        const rx = w.x - pillWidth / 2;
        const ry = w.y - pillHeight / 2;

        ctx.beginPath();
        ctx.roundRect(rx, ry, pillWidth, pillHeight, 18);

        let rockColor = '#05020D';`;

if (content.includes('// Drawing a rugged procedurally shaped asteroid circle')) {
  // Try dynamic replace if exact string fails
  const astRegex = /const isLocked = state\.targetWord\?\.id === w\.id;[\s\S]*?let rockColor = '#[A-Z0-9]+';/i;
  content = content.replace(astRegex, astReplacement);
} else {
  content = content.replace(astTarget, astReplacement);
}

// 4. Update the JSX Layout
const jsxRegex = /\{gameState === 'playing' && \([\s\S]*?(?=\{gameState === 'gameover')/;

const newJsx = `{gameState === 'playing' && (
        <div className="w-full flex flex-col gap-4 text-left">
          {/* Top HUD Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center bg-[#0C0A1D]/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 shadow-[0_0_15px_rgba(34,211,238,0.05)]">
            <div className="border-r border-indigo-950/40">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Award className="w-3 h-3 text-amber-400"/> Score</p>
              <span className="text-xl font-black text-amber-400 font-mono">{score}</span>
            </div>
            <div className="border-r border-indigo-950/40">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3 text-emerald-400"/> Speed</p>
              <span className="text-xl font-black text-emerald-400 font-mono uppercase">{difficulty}</span>
            </div>
            <div className="border-r border-indigo-950/40 hidden md:block">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Level</p>
              <span className="text-xl font-black text-purple-400 font-mono">{level}</span>
            </div>
            <div className="border-r border-indigo-950/40">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3 text-cyan-400"/> WPM</p>
              <span className="text-xl font-black text-cyan-400 font-mono">{wpm}</span>
            </div>
            <div className="border-r border-indigo-950/40 hidden md:block">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Accuracy</p>
              <span className="text-xl font-black text-amber-200 font-mono">{accuracy}%</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-1">Lives</p>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3].map((s) => (
                  <Heart key={s} className={\`w-4 h-4 \${s <= shields ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]' : 'text-slate-800'}\`} />
                ))}
              </div>
            </div>
          </div>

          {/* Level Progress & Combo */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full flex items-center gap-4 bg-[#0C0A1D]/60 border border-indigo-500/20 rounded-xl px-4 py-3">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider whitespace-nowrap">Level Progress</span>
              <div className="flex-1 bg-slate-900/80 h-2.5 rounded-full overflow-hidden border border-black/50">
                <div 
                  style={{ width: \`\${levelProgress}%\` }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold w-8 text-right">{Math.round(levelProgress)}%</span>
            </div>
            <div className="bg-[#0C0A1D]/80 border border-indigo-500/30 rounded-xl px-6 py-2.5 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <span className="text-amber-500 animate-pulse text-lg">🔥</span>
              <span className="text-xs text-slate-300 font-black uppercase tracking-wider">Combo</span>
              <span className="text-lg font-black text-amber-400 font-mono ml-1">x{combo}</span>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column: Leaderboard */}
            <div className="hidden lg:flex flex-col bg-[#0C0A1D]/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-5 shadow-lg">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-4 text-center">Leaderboard</p>
              <div className="flex-1 flex flex-col gap-3">
                {LEADERBOARD_DATA.map((player, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {idx === 0 ? <span className="text-amber-400">👑</span> : 
                       idx === 1 ? <span className="text-slate-300">🥈</span> : 
                       idx === 2 ? <span className="text-amber-700">🥉</span> : 
                       <span className="text-slate-600 font-mono w-5 text-center">{idx + 1}</span>}
                      <span className="text-slate-200 font-bold">{player.name}</span>
                    </div>
                    <span className="text-indigo-300 font-mono font-black">{player.score}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors">
                View Full Leaderboard >
              </button>
            </div>

            {/* Center Column: Game Canvas */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div 
                className="w-full bg-[#05020D] border border-indigo-500/30 rounded-3xl p-1 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden"
                style={{ background: 'radial-gradient(circle at top, #110B29 0%, #05020D 100%)' }}
              >
                {bossActive && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-500/20 border border-rose-500 text-rose-400 text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full animate-pulse z-20 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                    🚨 BOSS DETECTED 🚨
                  </div>
                )}
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={500} 
                  className="w-full h-[400px] md:h-[500px] block rounded-[22px] max-w-full relative z-10"
                />
                
                {/* Fake Input Field */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-md bg-[#0C0A1D]/90 backdrop-blur-md border border-indigo-400/40 rounded-2xl p-4 flex items-center shadow-[0_0_20px_rgba(99,102,241,0.2)] z-20">
                  <div className="w-full relative">
                    {!typedStr && <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium pointer-events-none">Type matching word here...</span>}
                    <div className="w-full flex items-center text-lg font-mono tracking-wider">
                      <span className="text-emerald-400 font-bold">{typedStr}</span>
                      <span className="w-2 h-5 bg-indigo-400 animate-pulse ml-0.5"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Next Word & Stats */}
            <div className="hidden lg:flex flex-col gap-4">
              {/* Next Word Box */}
              <div className="bg-[#0C0A1D]/80 border border-indigo-500/20 rounded-2xl p-5 text-center flex flex-col justify-center flex-1 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-3 relative z-10">Next Word</p>
                <p className="text-xl font-mono font-black text-amber-400 relative z-10 h-8">{nextWordStr || '...'}</p>
              </div>

              {/* Typing Box */}
              <div className="bg-[#0C0A1D]/80 border border-indigo-500/20 rounded-2xl p-5 text-center flex flex-col justify-center flex-1 shadow-lg">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-3">Typing...</p>
                <div className="text-2xl font-mono font-black tracking-widest h-8 flex justify-center gap-1">
                  {targetWordStr ? targetWordStr.split('').map((char, i) => (
                    <span key={i} className={i < typedStr.length ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 border-b-2 border-slate-700'}>
                      {char}
                    </span>
                  )) : <span className="text-slate-600">-</span>}
                </div>
              </div>

              {/* Combo Banner */}
              <div className="bg-[#150A21] border border-fuchsia-500/30 rounded-2xl p-5 text-center flex flex-col justify-center flex-1 shadow-[0_0_20px_rgba(217,70,239,0.1)]">
                <p className="text-[10px] text-fuchsia-400/70 font-black uppercase tracking-wider mb-1">Combo</p>
                <p className="text-4xl font-black text-fuchsia-400 font-mono drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">x{combo}</p>
                {combo > 5 && <p className="text-xs text-fuchsia-300 font-bold mt-2 animate-pulse">Awesome!</p>}
              </div>

              {/* Stats Box */}
              <div className="bg-[#0C0A1D]/80 border border-indigo-500/20 rounded-2xl p-5 text-sm font-medium text-slate-400 shadow-lg flex-1 flex flex-col justify-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-4 text-center">Stats</p>
                <div className="flex justify-between mb-2"><span>Words Typed</span><span className="text-white font-mono">{stateRef.current?.wordsCleared || 0}</span></div>
                <div className="flex justify-between mb-2"><span>Correct</span><span className="text-emerald-400 font-mono">{(stateRef.current?.totalCharsTyped || 0) - (stateRef.current?.errorsTyped || 0)}</span></div>
                <div className="flex justify-between mb-2"><span>Wrong</span><span className="text-rose-400 font-mono">{stateRef.current?.errorsTyped || 0}</span></div>
                <div className="flex justify-between mb-2"><span>Best Combo</span><span className="text-amber-400 font-mono">{stateRef.current?.maxCombo || 0}</span></div>
                <div className="flex justify-between mt-auto">
                   <button onClick={() => {}} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl transition-colors mx-auto mt-2 cursor-pointer">
                     <RotateCcw className="w-3 h-3"/> Pause
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* `;

content = content.replace(jsxRegex, newJsx);
fs.writeFileSync(path, content, 'utf8');
console.log('Update completed successfully.');
