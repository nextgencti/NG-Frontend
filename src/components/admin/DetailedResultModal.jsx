import React from 'react';
import { X, CheckCircle2, XCircle, Award, User, Clock, FileText } from 'lucide-react';

export default function DetailedResultModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-5">
            {result.studentPhoto ? (
              <img 
                src={result.studentPhoto} 
                alt={result.studentName} 
                className="w-14 h-14 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-slate-400" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{result.studentName}</h3>
              <p className="text-slate-400 font-medium flex items-center gap-2 mt-1">
                {result.studentEmail} 
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                Attempt #{result.attemptNumber}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-white/5 border-b border-white/5">
          <div className="bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Score</span>
             <span className="text-2xl font-black text-white">{result.score}</span>
          </div>
          <div className="bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Accuracy</span>
             <span className="text-2xl font-black text-primary-100">{Number(result.percentage || 0).toFixed(1)}%</span>
          </div>
          <div className="bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Grade</span>
             <span className={`text-2xl font-black ${
                 result.grade.startsWith('A') ? 'text-emerald-400' :
                 result.grade === 'B' ? 'text-blue-400' :
                 result.grade === 'C' ? 'text-amber-400' : 'text-rose-400'
             }`}>{result.grade}</span>
          </div>
           <div className="bg-slate-900 p-6 sm:flex hidden flex-col items-center justify-center text-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</span>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
             </span>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          
          <div className="flex items-center gap-3 mb-8">
             <FileText className="w-6 h-6 text-slate-400" />
             <h4 className="text-xl font-black text-white">Itemized Question Analysis</h4>
          </div>

          {!result.detailedReport || result.detailedReport.length === 0 ? (
            <div className="text-center py-12">
               <p className="text-slate-500 font-medium">No detailed question data found for this attempt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {result.detailedReport.map((item, index) => (
                <div key={item.questionId || index} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border mt-1 ${
                            item.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                           <span className="text-xs font-black">{index + 1}</span>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-white leading-relaxed">{item.question}</p>
                            <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-2.5 py-1 rounded-md">
                                {item.marks} Point{item.marks !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    {item.isCorrect ? (
                       <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    ) : (
                       <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-12">
                    {['A', 'B', 'C', 'D'].map(opt => {
                        const optionText = item.options[opt];
                        if (!optionText) return null;

                        const isStudentAnswer = item.studentAnswer === opt;
                        const isCorrectAnswer = item.correctAnswer === opt;

                        let style = "bg-slate-800 border-slate-700 text-slate-300"; // Default
                        
                        if (isCorrectAnswer && isStudentAnswer) {
                            style = "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                        } else if (isStudentAnswer && !isCorrectAnswer) {
                            style = "bg-rose-500/20 border-rose-500/50 text-rose-400 font-bold";
                        } else if (isCorrectAnswer) {
                             style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 border-dashed"; // Show what the right answer was if they missed it
                        }

                        return (
                            <div key={opt} className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${style}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                    isStudentAnswer ? (isCorrectAnswer ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-white') : 
                                    (isCorrectAnswer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300')
                                }`}>
                                    {opt}
                                </div>
                                <span className="text-sm leading-relaxed">
                                    {optionText}
                                </span>
                            </div>
                        )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
