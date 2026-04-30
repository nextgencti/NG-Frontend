import React from 'react';
import { X, CheckCircle2, XCircle, Award, User, Clock, FileText } from 'lucide-react';

export default function DetailedResultModal({ isOpen, onClose, result }) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-5">
            {result.studentPhoto ? (
              <img 
                src={result.studentPhoto} 
                alt={result.studentName} 
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-slate-400" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{result.studentName}</h3>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                {result.studentEmail} 
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                Attempt #{result.attemptNumber}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
          <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Score</span>
             <span className="text-2xl font-bold text-slate-900">{result.score}</span>
          </div>
          <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Accuracy</span>
             <span className="text-2xl font-bold text-primary-600">{Number(result.percentage || 0).toFixed(1)}%</span>
          </div>
          <div className="bg-white p-6 flex flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Grade</span>
             <span className={`text-2xl font-bold ${
                 result.grade.startsWith('A') ? 'text-emerald-600' :
                 result.grade === 'B' ? 'text-blue-600' :
                 result.grade === 'C' ? 'text-amber-600' : 'text-rose-600'
             }`}>{result.grade}</span>
          </div>
           <div className="bg-white p-6 sm:flex hidden flex-col items-center justify-center text-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Status</span>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
             </span>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar bg-slate-50/30">
          
          <div className="flex items-center gap-3 mb-8">
             <FileText className="w-6 h-6 text-slate-400" />
             <h4 className="text-xl font-bold text-slate-900">Itemized Question Analysis</h4>
          </div>

          {!result.detailedReport || result.detailedReport.length === 0 ? (
            <div className="text-center py-12">
               <p className="text-slate-500 font-medium">No detailed question data found for this attempt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {result.detailedReport.map((item, index) => (
                <div key={item.questionId || index} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-slate-200 transition-all">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border mt-1 shadow-sm ${
                            item.isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>
                           <span className="text-xs font-bold">{index + 1}</span>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-slate-900 leading-relaxed">{item.question}</p>
                            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
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

                        let style = "bg-slate-50 border-slate-200 text-slate-600"; // Default
                        
                        if (isCorrectAnswer && isStudentAnswer) {
                            style = "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-sm";
                        } else if (isStudentAnswer && !isCorrectAnswer) {
                            style = "bg-rose-50 border-rose-200 text-rose-700 font-bold";
                        } else if (isCorrectAnswer) {
                             style = "bg-emerald-50/50 border-emerald-200 text-emerald-600 border-dashed"; // Show what the right answer was if they missed it
                        }

                        return (
                            <div key={opt} className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${style}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    isStudentAnswer ? (isCorrectAnswer ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white') : 
                                    (isCorrectAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')
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
