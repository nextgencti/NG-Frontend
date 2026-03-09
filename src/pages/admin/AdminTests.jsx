import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ClipboardList, Clock, CheckCircle2, Trash2, Edit2, BookOpen, BarChart2, Loader2, Trophy } from 'lucide-react';
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
      toast.error('Failed to load tests.');
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

  const upcomingCount = tests.filter(t => t.status === 'upcoming').length;
  const completedCount = tests.filter(t => t.status === 'completed').length;

  // Returns true if the test's scheduled date+time is already past
  const isScheduledTimePassed = (test) => {
    if (!test.date || !test.time) return false;
    const scheduled = new Date(`${test.date}T${test.time}:00`);
    return !isNaN(scheduled.getTime()) && new Date() >= scheduled;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Test Management</h2>
          <p className="text-slate-400 font-medium">Create and manage student examinations and practice tests.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-accent-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Provision Test
        </button>
      </div>

      <AddTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTestAdded={(t) => setTests([t, ...tests])}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Assessments', value: tests.length, icon: ClipboardList, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Pending Launch', value: upcomingCount, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Concluded', value: completedCount, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-dark border border-white/5 rounded-[2rem] shadow-2xl p-6 flex items-center gap-5 hover:border-white/10 transition-all duration-500 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 ${stat.bg} group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="glass-dark border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'upcoming', 'published', 'completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20'
                    : 'bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-primary-500 animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Syncing Test Core...</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Assessment Matrix</th>
                  <th className="px-8 py-4">Department</th>
                  <th className="px-8 py-4">Temporal Data</th>
                  <th className="px-8 py-4 text-center">Parameters</th>
                  <th className="px-8 py-4 text-center">Complexity</th>
                  <th className="px-8 py-4 text-center">Fleet Status</th>
                  <th className="px-8 py-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length > 0 ? filtered.map(test => (
                  <tr key={test.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary-500/20 rounded-xl border border-primary-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/10">
                          <ClipboardList className="w-5 h-5 text-primary-300" />
                        </div>
                        <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors max-w-[180px] truncate" title={test.title}>{test.title}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest max-w-[140px] truncate">{test.course}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {test.type === 'Practice' ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center px-3 py-1 rounded-lg text-[10px] font-black bg-blue-500/10 text-blue-400 uppercase tracking-widest border border-blue-500/20">Practice Mode</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{test.duration} limit</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">
                            {test.date ? test.date.split('-').reverse().join('/') : '—'}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{test.time} · {test.duration}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <BarChart2 className="w-3.5 h-3.5" />{test.totalMarks}M
                        </span>
                        <span className="text-white/10">|</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{test.questions} Qs</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        test.difficulty === 'Easy' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                        test.difficulty === 'Medium' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' :
                        'bg-rose-400/10 text-rose-400 border-rose-400/20'
                      }`}>
                        {test.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        test.status === 'upcoming' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                        test.status === 'published' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                        'bg-slate-500/10 text-slate-400 border-white/5'
                      }`}>
                        {test.status === 'upcoming' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {test.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {test.status === 'upcoming' && !isScheduledTimePassed(test) && (
                          <button
                            onClick={() => handleUpdateStatus(test.id, 'published')}
                            className="mr-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                          >
                            Launch Now
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/tests/${test.id}/results`)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                          title="View Results"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                          Results
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-2.5 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                          title="Purge Test"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/tests/${test.id}/edit`)}
                          className="p-2.5 text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 rounded-xl transition-all"
                          title="Edit Settings & Questions"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center text-slate-600">
                      <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      <p className="text-xs font-black uppercase tracking-[0.2em]">Zero assessment signals detected in this sector.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/[0.02] flex justify-between items-center">
          <span>Analysis: {filtered.length} of {tests.length} Operational Units</span>
        </div>
      </div>
    </div>

  );
}
