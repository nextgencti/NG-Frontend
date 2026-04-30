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
            className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Test Results</h2>
            <p className="text-slate-500 font-medium">{testTitle || 'Loading...'}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Computing Rankings...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-20 text-center">
            <User className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Submissions Yet</h3>
            <p className="text-slate-500 font-medium">No students have completed this test.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">Rank</th>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4 text-center">Score</th>
                  <th className="px-8 py-4 text-center">Percentage</th>
                  <th className="px-8 py-4 text-center">Grade</th>
                  <th className="px-8 py-4 text-right">Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((result, index) => {
                  const isTopper = index === 0;
                  const isRunnerUp = index === 1;
                  const isSecondRunnerUp = index === 2;
                  
                  return (
                    <tr key={result.id} className={`hover:bg-slate-50 transition-colors group ${isTopper ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-8 py-6">
                        {isTopper ? (
                           <div className="flex flex-col items-center justify-center w-12 h-12 bg-amber-100 border border-amber-200 rounded-2xl relative shadow-sm">
                               <Trophy className="w-6 h-6 text-amber-600" />
                               <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 rounded-md shadow-sm">1st</div>
                           </div>
                        ) : isRunnerUp ? (
                           <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center relative shadow-sm">
                               <Medal className="w-6 h-6 text-slate-600" />
                                <div className="absolute -top-2 -right-2 bg-slate-400 text-white text-[10px] font-bold px-1.5 rounded-md shadow-sm">2nd</div>
                           </div>
                        ) : isSecondRunnerUp ? (
                           <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center relative shadow-sm">
                               <Medal className="w-6 h-6 text-orange-600" />
                                <div className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 rounded-md shadow-sm">3rd</div>
                           </div>
                        ) : (
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 shadow-sm group-hover:shadow-sm">
                               <span className="text-xl font-bold text-slate-400">#{index + 1}</span>
                           </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${isTopper ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            {isTopper ? <Award className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold transition-colors ${isTopper ? 'text-amber-700' : 'text-slate-900'}`}>{result.studentName}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{result.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <span className={`text-lg font-bold ${isTopper ? 'text-amber-600' : 'text-slate-700'}`}>{result.score}</span>
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
                            <span className="text-xs font-bold text-slate-400 mr-2">Attempt #{result.attemptNumber}</span>
                            <button
                              onClick={() => { setSelectedResult(result); setIsModalOpen(true); }}
                              className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-200"
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
