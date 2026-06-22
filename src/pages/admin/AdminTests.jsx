import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardList, Clock, CheckCircle2, Trash2, Edit2, BookOpen, BarChart2, Loader2, Trophy, Globe, Presentation, X, Play, Download, Sparkles } from 'lucide-react';
import AddTestModal from '../../components/admin/AddTestModal';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const difficultyStyle = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusStyle = {
  upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function AdminTests() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Presentation & PPT Modal State
  const [selectedTestForPPT, setSelectedTestForPPT] = useState(null);
  const [isPPTModalOpen, setIsPPTModalOpen] = useState(false);
  const [isPPTExporting, setIsPPTExporting] = useState(false);
  const [isLoadingPPTData, setIsLoadingPPTData] = useState(false);
  const [pptQuestions, setPptQuestions] = useState([]);

  useEffect(() => {
    fetchTests();
    // Auto-refresh every 60s to pick up auto-launched tests
    const interval = setInterval(fetchTests, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/tests');
      if (response.data.success) {
        setTests(response.data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error(error.response?.data?.message || 'Failed to load tests.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await api.post('/admin/tests/update-status', { id, status: newStatus });
      if (response.data.success) {
        setTests(tests.map(t => t.id === id ? { ...t, status: newStatus } : t));
        toast.success(`Test ${newStatus} successfully!`);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = tests.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.course.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      const response = await api.post('/admin/tests/delete', { id });
      if (response.data.success) {
        setTests(tests.filter(t => t.id !== id));
        toast.success('Test deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const handleTogglePublic = async (id, currentStatus) => {
    try {
      await api.put(`/admin/tests/${id}`, { isPublic: !currentStatus });
      setTests(tests.map(t => t.id === id ? { ...t, isPublic: !currentStatus } : t));
      toast.success(!currentStatus ? 'Test is now public!' : 'Test is now private.');
    } catch (error) {
      toast.error('Failed to update public status');
    }
  };

  const handleOpenPPTModal = async (testItem) => {
    setSelectedTestForPPT(testItem);
    setIsPPTModalOpen(true);
    setIsLoadingPPTData(true);
    setPptQuestions([]);
    try {
      const response = await api.get(`/admin/tests/${testItem.id}/full`);
      if (response.data.success) {
        setPptQuestions(response.data.questions || []);
      } else {
        toast.error('Failed to retrieve test questions.');
        setIsPPTModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching questions for PPT:', error);
      toast.error('Failed to fetch test details.');
      setIsPPTModalOpen(false);
    } finally {
      setIsLoadingPPTData(false);
    }
  };

  const handleDownloadPPT = async (isTeachingMode) => {
    if (!selectedTestForPPT || pptQuestions.length === 0) return;
    setIsPPTExporting(true);
    const toastId = toast.loading(`Preparing PowerPoint slides... 🎥`);
    try {
      const { exportTestToPPTX } = await import('../../utils/pptxExporter');
      await exportTestToPPTX(selectedTestForPPT, pptQuestions, { isTeachingMode });
      toast.success('PowerPoint slideshow downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Error in PPT export:', error);
      toast.error('Failed to export PowerPoint slideshow.', { id: toastId });
    } finally {
      setIsPPTExporting(false);
    }
  };

  const handleLaunchWebPresentation = () => {
    if (!selectedTestForPPT) return;
    window.open(`/admin/tests/${selectedTestForPPT.id}/present`, '_blank');
    setIsPPTModalOpen(false);
  };

  const upcomingCount = tests.filter(t => t.status === 'upcoming').length;
  const completedCount = tests.filter(t => t.status === 'completed').length;

  // Returns true if the test's scheduled date+time is already past
  const isScheduledTimePassed = (test) => {
    if (!test.date || !test.time) return false;
    const scheduled = new Date(`${test.date}T${test.time}:00`);
    return !isNaN(scheduled.getTime()) && new Date() >= scheduled;
  };

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Test Management</h2>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Create and manage student examinations and practice tests.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all shadow-md shadow-primary-500/10 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Provision Test
        </button>
      </div>

      <AddTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestAdded={(t) => setTests([t, ...tests])}
      />

      {/* Stats - Compact Padding */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Assessments', value: tests.length, icon: ClipboardList, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Pending Launch', value: upcomingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Concluded', value: completedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-xl shadow-sm p-4.5 flex items-center gap-3.5 hover:shadow-md transition-all duration-300 group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-50 ${stat.bg} group-hover:scale-105 transition-transform duration-500`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-800 tracking-tight leading-none mb-1">{stat.value}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar - Compact padding */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row gap-3.5 justify-between items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search assessments..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
          <div className="flex gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
            {['all', 'upcoming', 'published', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === s
                    ? 'bg-white text-primary-600 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table - Compact Heights and Paddings */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Syncing Test Database...</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="py-3 px-4.5">Assessment Matrix</th>
                  <th className="py-3 px-4.5">Department</th>
                  <th className="py-3 px-4.5">Temporal Data</th>
                  <th className="py-3 px-4.5 text-center">Parameters</th>
                  <th className="py-3 px-4.5 text-center">Complexity</th>
                  <th className="py-3 px-4.5 text-center">Fleet Status</th>
                  <th className="py-3 px-4.5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? filtered.map(test => (
                  <tr key={test.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg border border-primary-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <ClipboardList className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-xs font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors max-w-[180px] truncate" title={test.title}>{test.title}</p>
                          {test.isPublic && (
                            <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 mt-0.5">
                              <Globe className="w-2.5 h-2.5" /> Public
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4.5">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest max-w-[140px] truncate">{test.course}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4.5">
                      {test.type === 'Practice' ? (
                        <div className="flex flex-col">
                          <span className="inline-flex w-fit items-center px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-primary-50 text-primary-600 uppercase tracking-widest border border-primary-100">Practice Mode</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{test.duration} limit</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">
                            {test.date ? test.date.split('-').reverse().join('/') : '—'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{test.time} · {test.duration}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                          {test.totalMarks}M
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{test.questions} Qs</span>
                      </div>
                    </td>
                    <td className="py-3 px-4.5 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                        test.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        test.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="py-3 px-4.5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${
                        test.status === 'upcoming' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        test.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {test.status === 'upcoming' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {test.status}
                      </span>
                    </td>
                    <td className="py-3 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {test.status === 'upcoming' && !isScheduledTimePassed(test) && (
                          <button
                            onClick={() => handleUpdateStatus(test.id, 'published')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-widest rounded-md transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            Launch
                          </button>
                        )}
                        <button
                          onClick={() => handleTogglePublic(test.id, test.isPublic)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${test.isPublic ? 'text-indigo-600 bg-indigo-50 border border-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent'}`}
                          title={test.isPublic ? 'Make Private' : 'Make Public'}
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                        {test.questions > 0 && (
                          <button
                            onClick={() => handleOpenPPTModal(test)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                            title="Presentation & Export Hub"
                          >
                            <Presentation className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/tests/${test.id}/results`)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all cursor-pointer"
                          title="View Results"
                        >
                          <Trophy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/tests/${test.id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Settings"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center text-slate-500">
                      <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-10" />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">No tests found in this sector.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-4.5 py-2.5 border-t border-slate-100 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/30">
          Analysis: {filtered.length} of {tests.length} Operational Units
        </div>
      </div>

      {/* Presentation & PPT Modal */}
      {isPPTModalOpen && selectedTestForPPT && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-150 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-600">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Presentation Hub</h3>
                  <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Choose export format or presentation mode</p>
                </div>
              </div>
              <button onClick={() => setIsPPTModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingPPTData ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Retrieving test database...</p>
              </div>
            ) : (
              <div className="p-8 space-y-4">
                {/* Option 1: Exam PPT */}
                <button
                  type="button"
                  disabled={isPPTExporting}
                  onClick={() => handleDownloadPPT(false)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 text-left flex items-start gap-4 transition-all group active:scale-[0.98] disabled:opacity-50 font-bold"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">Download Exam PPT</span>
                      <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Default</span>
                    </div>
                    <span className="block text-[10px] text-slate-400 font-medium mt-1 normal-case leading-relaxed">Generates standard slides. Answers are grouped into a compact answer key slide at the end.</span>
                  </div>
                </button>

                {/* Option 2: Solution PPT */}
                <button
                  type="button"
                  disabled={isPPTExporting}
                  onClick={() => handleDownloadPPT(true)}
                  className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 text-left flex items-start gap-4 transition-all group active:scale-[0.98] disabled:opacity-50 font-bold"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">Download Solution PPT</span>
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wider">Answers Highlighted</span>
                    </div>
                    <span className="block text-[10px] text-slate-400 font-medium mt-1 normal-case leading-relaxed">Highlights the correct answer on every question slide in emerald green. Ideal for study sheets or screen shares.</span>
                  </div>
                </button>

                {/* Option 3: Launch Web PPT */}
                <button
                  type="button"
                  disabled={isPPTExporting}
                  onClick={handleLaunchWebPresentation}
                  className="w-full p-4 rounded-2xl border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50 hover:border-indigo-200 text-left flex items-start gap-4 transition-all group active:scale-[0.98] font-bold"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white border border-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm shadow-indigo-500/20">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  <div className="flex-1 text-left font-bold">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-black text-slate-800 uppercase tracking-wide">Launch Web Presentation</span>
                      <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold animate-pulse">Web PPT</span>
                    </div>
                    <span className="block text-[10px] text-slate-400 font-medium mt-1 normal-case leading-relaxed">Open interactive browser slide presenter with dynamic answer reveal shortcuts and custom poll timers.</span>
                  </div>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPPTModalOpen(false)}
                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                Close Hub
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
