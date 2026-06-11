import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function PercentageCalculator() {
  const navigate = useNavigate();
  const [percObtained, setPercObtained] = useState('');
  const [percTotal, setPercTotal] = useState('');
  const [percResult, setPercResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Reverse calculator
  const [reversePerc, setReversePerc] = useState('');
  const [reverseTotal, setReverseTotal] = useState('');
  const [reverseResult, setReverseResult] = useState(null);

  useEffect(() => {
    const obtained = parseFloat(percObtained);
    const total = parseFloat(percTotal);
    if (!isNaN(obtained) && !isNaN(total) && total > 0) {
      setPercResult(((obtained / total) * 100).toFixed(2));
    } else {
      setPercResult(null);
    }
  }, [percObtained, percTotal]);

  useEffect(() => {
    const perc = parseFloat(reversePerc);
    const total = parseFloat(reverseTotal);
    if (!isNaN(perc) && !isNaN(total) && total > 0) {
      setReverseResult(((perc / 100) * total).toFixed(2));
    } else {
      setReverseResult(null);
    }
  }, [reversePerc, reverseTotal]);

  const getGrade = (p) => {
    if (p >= 90) return { text: "Outstanding! (A+ Grade)", color: "text-emerald-400" };
    if (p >= 80) return { text: "Excellent! (A Grade)", color: "text-emerald-400" };
    if (p >= 70) return { text: "Very Good (B+ Grade)", color: "text-indigo-400" };
    if (p >= 60) return { text: "Good (B Grade)", color: "text-indigo-400" };
    if (p >= 50) return { text: "Average (C Grade)", color: "text-amber-400" };
    if (p >= 33) return { text: "Below Average (D Grade)", color: "text-orange-400" };
    return { text: "Needs Improvement (F Grade)", color: "text-rose-400" };
  };

  const addToHistory = () => {
    if (percResult !== null) {
      setHistory(prev => [{ obtained: percObtained, total: percTotal, percentage: percResult, grade: getGrade(parseFloat(percResult)).text }, ...prev.slice(0, 9)]);
    }
  };

  const clearAll = () => {
    setPercObtained('');
    setPercTotal('');
    setPercResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C20] via-[#13102B] to-[#0F0C20] overflow-hidden relative selection:bg-indigo-500/20">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 to-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0"><Logo className="w-7.5 h-7.5" showText={false} /></div>
            <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center"><span className="text-white">Next</span><span className="text-indigo-400 ml-0.5">Gen</span></h2>
          </div>
          <button onClick={() => navigate('/tools')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> All Tools
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Percent className="w-4 h-4" />
            <span>Marks & Score Calculator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Percentage <span className="text-indigo-400">Calculator</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Calculate your exam percentage, check your grade, and find required marks — all in one tool.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Main Calculator */}
          <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden group text-left">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400"><Percent className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-black text-white">Marks → Percentage</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Enter marks to get percentage</p>
                </div>
              </div>
              <button onClick={clearAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-300 hover:text-indigo-200 transition-colors border border-white/5 cursor-pointer" title="Clear">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Marks Obtained</label>
                <input type="number" value={percObtained} onChange={(e) => setPercObtained(e.target.value)} placeholder="e.g. 425" className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors placeholder-slate-600" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Total Marks</label>
                <input type="number" value={percTotal} onChange={(e) => setPercTotal(e.target.value)} placeholder="e.g. 500" className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors placeholder-slate-600" />
              </div>
            </div>

            {percResult !== null ? (
              <div className="space-y-4">
                <div className="bg-slate-950/40 border border-indigo-950 rounded-xl p-6 text-center">
                  <p className="text-5xl font-black text-indigo-400">{percResult}%</p>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-2 block">Your Percentage</span>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Grade</p>
                    <p className={`text-sm font-bold ${getGrade(parseFloat(percResult)).color}`}>{getGrade(parseFloat(percResult)).text}</p>
                  </div>
                </div>
                <button onClick={addToHistory} className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-indigo-300 rounded-xl font-bold text-xs transition-all cursor-pointer">
                  Save to History
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/30 border border-indigo-950/50 text-slate-500 rounded-xl p-10 text-xs font-bold text-center flex flex-col items-center justify-center gap-2">
                <BarChart3 className="w-8 h-8 text-slate-600 mb-1" />
                <span>Enter marks to calculate percentage and grade.</span>
              </div>
            )}
          </div>

          {/* Reverse Calculator */}
          <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden group text-left">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400"><BarChart3 className="w-5 h-5" /></div>
              <div>
                <h3 className="text-lg font-black text-white">Percentage → Marks</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Find marks needed for a target %</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Target Percentage (%)</label>
                <input type="number" value={reversePerc} onChange={(e) => setReversePerc(e.target.value)} placeholder="e.g. 75" className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors placeholder-slate-600" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Total Marks</label>
                <input type="number" value={reverseTotal} onChange={(e) => setReverseTotal(e.target.value)} placeholder="e.g. 500" className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors placeholder-slate-600" />
              </div>
            </div>

            {reverseResult !== null ? (
              <div className="bg-slate-950/40 border border-indigo-950 rounded-xl p-6 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">You need to score</p>
                <p className="text-5xl font-black text-indigo-400">{reverseResult}</p>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2 block">marks out of {reverseTotal}</span>
              </div>
            ) : (
              <div className="bg-slate-950/30 border border-indigo-950/50 text-slate-500 rounded-xl p-10 text-xs font-bold text-center flex flex-col items-center justify-center gap-2">
                <Percent className="w-8 h-8 text-slate-600 mb-1" />
                <span>Enter target percentage and total marks to find required score.</span>
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-indigo-950/45 border-dashed text-[10px] text-slate-500 font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
              Useful for setting targets before exams.
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">📊 Calculation History</h4>
            <div className="space-y-2">
              {history.map((entry, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-4 bg-slate-950/30 border border-indigo-950/40 rounded-xl px-5 py-3 text-center text-xs font-bold">
                  <div className="text-slate-400">{entry.obtained}/{entry.total}</div>
                  <div className="text-indigo-400">{entry.percentage}%</div>
                  <div className="col-span-2 text-slate-300 text-left truncate">{entry.grade}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
