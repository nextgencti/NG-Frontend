import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Medal, User, Award, Loader2, Eye } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import DetailedResultModal from '../../components/admin/DetailedResultModal';

export default function AdminTestResults() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedResult, setSelectedResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`/admin/tests/${testId}/results`);
      if (response.data.success) {
        setResults(response.data.results);
        setTestTitle(response.data.testTitle);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      toast.error('Failed to load test results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/tests')}
            className="p-3 bg-white/[0.02] hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl border border-white/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Test Results</h2>
            <p className="text-slate-400 font-medium">{testTitle || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Computing Rankings...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="glass-dark border border-white/5 rounded-[2.5rem] shadow-2xl p-20 text-center">
            <User className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-50" />
            <h3 className="text-xl font-black text-white mb-2">No Submissions Yet</h3>
            <p className="text-slate-500 font-medium">No students have completed this test.</p>
        </div>
      ) : (
        <div className="glass-dark border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Rank</th>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4 text-center">Score</th>
                  <th className="px-8 py-4 text-center">Percentage</th>
                  <th className="px-8 py-4 text-center">Grade</th>
                  <th className="px-8 py-4 text-right">Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((result, index) => {
                  const isTopper = index === 0;
                  const isRunnerUp = index === 1;
                  const isSecondRunnerUp = index === 2;
                  
                  return (
                    <tr key={result.id} className={`hover:bg-white/[0.02] transition-colors group ${isTopper ? 'bg-amber-500/5' : ''}`}>
                      <td className="px-8 py-6">
                        {isTopper ? (
                           <div className="flex flex-col items-center justify-center w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl relative">
                               <Trophy className="w-6 h-6 text-amber-400" />
                               <div className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-black px-1.5 rounded-md shadow-lg">1st</div>
                           </div>
                        ) : isRunnerUp ? (
                           <div className="w-12 h-12 bg-slate-400/20 border border-slate-400/30 rounded-2xl flex items-center justify-center relative">
                               <Medal className="w-6 h-6 text-white" />
                                <div className="absolute -top-2 -right-2 bg-slate-100 text-black text-[10px] font-black px-1.5 rounded-md shadow-lg">2nd</div>
                           </div>
                        ) : isSecondRunnerUp ? (
                           <div className="w-12 h-12 bg-orange-700/20 border border-orange-700/30 rounded-2xl flex items-center justify-center relative">
                               <Medal className="w-6 h-6 text-orange-400" />
                                <div className="absolute -top-2 -right-2 bg-orange-700 text-white text-[10px] font-black px-1.5 rounded-md shadow-lg">3rd</div>
                           </div>
                        ) : (
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-white/5 transition-colors">
                               <span className="text-xl font-black text-slate-600">#{index + 1}</span>
                           </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${isTopper ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                            {isTopper ? <Award className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold transition-colors ${isTopper ? 'text-amber-400' : 'text-white'}`}>{result.studentName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{result.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`text-lg font-black ${isTopper ? 'text-amber-400' : 'text-slate-300'}`}>{result.score}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className="text-sm font-bold text-slate-400">{Number(result.percentage).toFixed(1)}%</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-black border ${
                            result.grade === 'A+' || result.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            result.grade === 'B' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            result.grade === 'C' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold text-slate-500 mr-2">Attempt #{result.attemptNumber}</span>
                            <button
                              onClick={() => { setSelectedResult(result); setIsModalOpen(true); }}
                              className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                              title="View Detailed Report"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Result Modal */}
      <DetailedResultModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedResult(null); }}
        result={selectedResult}
      />
    </div>
  );
}
