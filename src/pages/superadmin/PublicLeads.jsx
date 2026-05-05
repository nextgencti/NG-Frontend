import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Calendar, Search, Download, Trophy, Clock, ClipboardList, Loader2, UserCheck, Trash2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function PublicLeads() {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState('');
  const [resetDuration, setResetDuration] = useState('never');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchTests();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/tests/public-results');
      if (res.data.success) {
        setLeads(res.data.results);
      }
    } catch (err) {
      console.error('Fetch Leads Error:', err);
      toast.error('Failed to load public leads');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const res = await api.get('/public/tests');
      if (res.data.success) {
        setTests(res.data.tests);
      }
    } catch (err) {
      console.error('Fetch Tests Error:', err);
    }
  };

  const handleManualReset = async () => {
    if (!selectedTestId) return toast.error('Please select a test first');
    
    const selectedTest = tests.find(t => t.id === selectedTestId);
    const testTitle = selectedTest ? selectedTest.title : 'this test';

    if (!window.confirm(`Are you sure you want to PERMANENTLY clear the leaderboard for "${testTitle}"?`)) return;

    setIsResetting(true);
    try {
      const res = await api.post(`/superadmin/tests/${selectedTestId}/reset-leaderboard`);
      if (res.data.success) {
        toast.success(res.data.message || `Leaderboard for "${testTitle}" reset successfully`);
        fetchLeads();
      }
    } catch (err) {
      toast.error('Failed to reset leaderboard');
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateSettings = async () => {
    if (!selectedTestId) return toast.error('Please select a test first');
    
    try {
      const res = await api.patch(`/superadmin/tests/${selectedTestId}/leaderboard-settings`, {
        autoResetDuration: resetDuration
      });
      if (res.data.success) {
        toast.success('Auto-reset settings updated');
      }
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      const res = await api.delete(`/superadmin/tests/public-results/${leadId}`);
      if (res.data.success) {
        toast.success('Lead deleted successfully');
        fetchLeads();
      }
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.participantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.participantContact?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTestId) {
      return matchesSearch && lead.testId === selectedTestId;
    }
    return matchesSearch;
  });

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Avg. Accuracy', value: leads.length ? `${Math.round(leads.reduce((acc, l) => acc + l.percentage, 0) / leads.length)}%` : '0%', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Recent Attempts', value: leads.filter(l => {
      const today = new Date();
      const submissionDate = new Date(l.submittedAt);
      return today.toDateString() === submissionDate.toDateString();
    }).length, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Public Test Leads</h2>
          <p className="text-sm text-slate-500 font-medium">Manage and track students who attempted free practice tests.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95">
          <Download className="w-4 h-4" /> Export Leads
        </button>
      </div>

      {/* Leaderboard Management Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Public Test</label>
            <select 
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">-- Choose a Test --</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Auto-Reset Schedule</label>
            <select 
              value={resetDuration}
              onChange={(e) => setResetDuration(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="never">Never Reset</option>
              <option value="daily">Daily Reset</option>
              <option value="weekly">Weekly Reset</option>
              <option value="monthly">Monthly Reset</option>
            </select>
          </div>

          <button 
            onClick={handleUpdateSettings}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Save Schedule
          </button>

          <button 
            onClick={handleManualReset}
            disabled={isResetting}
            className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Reset Leaderboard Now
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, test or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {filteredLeads.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching public data...</p>
            </div>
          ) : filteredLeads.length > 0 ? (
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Attempted Test</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100">
                          <span className="text-sm font-black text-primary-600">{lead.participantName?.[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{lead.participantName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" /> {lead.participantContact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-slate-800">{lead.testTitle}</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lead.totalMarks} Marks Test</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="text-sm font-black text-slate-800">{lead.score}<span className="text-slate-400 font-bold">/{lead.totalMarks}</span></p>
                      <p className={`text-[10px] font-bold ${lead.percentage >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>{lead.percentage}%</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${lead.percentage >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {lead.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-xs font-bold text-slate-800">{lead.submittedAt ? new Date(lead.submittedAt).toLocaleDateString() : 'N/A'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{lead.submittedAt ? new Date(lead.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View Details">
                          <ClipboardList className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No public leads found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
