import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, CheckCircle2, Clock } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddStudentModal from '../../components/admin/AddStudentModal';

export default function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/admin/students');
        setStudents(response.data.students);
      } catch (error) {
        toast.error('Failed to load students.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/admin/students/${id}/status`, { status: newStatus });
      toast.success(`Student ${newStatus === 'active' ? 'approved' : 'rejected'} successfully.`);
      // Update local state
      setStudents(students.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      toast.error('Failed to update student status');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ? student.status !== 'pending' : student.status === 'pending';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Student Management</h2>
          <p className="text-slate-400 font-medium">Provision and manage student institutional access.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
            <input type="text" placeholder="Search by name or email..." className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all w-64 backdrop-blur-md placeholder:text-slate-500" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 active:scale-95">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glass-dark p-2 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex p-1.5 gap-2">
          {['all', 'pending'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {t === 'all' ? 'Active Students' : 'Pending Requests'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-l border-white/5">
           <Filter className="w-4 h-4 text-slate-400" />
           <select className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest focus:outline-none cursor-pointer hover:text-white transition-colors">
              <option className="bg-slate-900">All Modules</option>
              <option className="bg-slate-900">Web Systems</option>
              <option className="bg-slate-900">UI Architecture</option>
           </select>
        </div>
      </div>
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onStudentAdded={(newStudent) => setStudents([newStudent, ...students])} 
      />

      <div className="flex space-x-8 border-b border-white/5">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
            activeTab === 'all' 
              ? 'border-accent-500 text-accent-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          Active Directory
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pending' 
              ? 'border-accent-500 text-accent-400' 
              : 'border-transparent text-slate-500 hover:text-white'
          }`}
        >
          Approval Queue
          {students.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {students.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">

        
        {/* Table Tools */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row gap-6 justify-between bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-transparent transition-all placeholder:text-slate-600"
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 text-slate-400 rounded-2xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all transition-colors">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/[0.02] text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6">Student Information</th>
                <th className="p-6">Course</th>
                <th className="p-6">Enrolled Date</th>
                <th className="p-6 text-center">Fees Status</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {student.photoURL ? (
                        <img 
                          src={student.photoURL} 
                          alt={student.name} 
                          className="w-12 h-12 rounded-full object-cover shadow-xl bg-white/5 border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/[0.08] to-transparent text-primary-400 flex items-center justify-center font-black text-xs shadow-xl border border-white/10">
                          {student.name ? student.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                     <span className="text-xs font-bold text-slate-400">{student.course}</span>
                  </td>
                  <td className="p-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">{student.enrolledDate}</td>
                  <td className="p-6 text-center">
                    {student.payment === 'cleared' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                         Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-400 border border-amber-400/20">
                         Pending
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-center">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Active">
                        <UserCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : student.status === 'pending' ? (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse" title="Pending">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 border border-white/10" title="Inactive">
                        <UserX className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {activeTab === 'pending' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'active')}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'rejected')}
                          className="px-4 py-2 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {student.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'inactive')}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                            title="Deactivate"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'active')}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all"
                            title="Activate"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No matching students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white/[0.02]">
          <span>Inventory: 1 to 3 of 1,248 Records</span>
          <div className="flex gap-4">
            <button className="px-5 py-2 glass-dark border border-white/10 rounded-xl hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 uppercase tracking-widest">Previous</button>
            <button className="px-5 py-2 glass-dark border border-white/10 rounded-xl hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest">Next</button>
          </div>
        </div>


      </div>
    </div>

  );
}
