import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, CheckCircle2, Clock, Trash, AlertTriangle, X } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddStudentModal from '../../components/admin/AddStudentModal';
import IDCard from '../../components/shared/IDCard';
import { CreditCard } from 'lucide-react';

export default function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteStudent = async (e) => {
    e.preventDefault();
    if (!deletePin || deletePin.length < 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete(`/admin/students/${studentToDelete.id}`, {
        data: { pin: deletePin } // React Axios DELETE body goes in `data` prop
      });
      
      if (response.data.success) {
        toast.success("Student deleted successfully");
        setStudents(students.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        setDeletePin('');
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to delete student. Check PIN.");
    } finally {
      setIsDeleting(false);
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Management</h2>
          <p className="text-slate-500 text-sm font-medium">Provision and manage student institutional access.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input type="text" placeholder="Search by name or email..." className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all w-64 shadow-sm placeholder:text-slate-400" />
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/10 transition-all flex items-center gap-3 active:scale-95">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glass-dark p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex p-1 gap-2">
          {['all', 'pending'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-100 text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              {t === 'all' ? 'Active Students' : 'Pending Requests'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-l border-slate-100">
           <Filter className="w-4 h-4 text-slate-400" />
           <select className="bg-transparent text-[10px] font-bold text-slate-500 uppercase tracking-widest focus:outline-none cursor-pointer hover:text-slate-900 transition-colors">
              <option>All Modules</option>
              <option>Web Systems</option>
              <option>UI Architecture</option>
           </select>
        </div>
      </div>
      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onStudentAdded={(newStudent) => setStudents([newStudent, ...students])} 
      />

      <div className="flex space-x-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'all' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Active Directory
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'pending' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Approval Queue
          {students.filter(s => s.status === 'pending').length > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold animate-pulse">
              {students.filter(s => s.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">

        
        {/* Table Tools */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-5 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Student Information</th>
                <th className="p-5">Course</th>
                <th className="p-5">Enrolled Date</th>
                <th className="p-5 text-center">Fees Status</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {student.photoURL ? (
                        <img 
                          src={student.photoURL} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover shadow-sm bg-white border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-50 text-primary-600 flex items-center justify-center font-bold text-[10px] shadow-sm border border-slate-200">
                          {student.name ? student.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                     <span className="text-xs font-bold text-slate-400">{student.course}</span>
                  </td>
                  <td className="p-6 text-xs font-bold text-slate-400 uppercase tracking-tighter">{student.enrolledDate}</td>
                  <td className="p-5 text-center">
                    {student.payment === 'cleared' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                         Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                         Pending
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100" title="Active">
                        <UserCheck className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : student.status === 'pending' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 animate-pulse" title="Pending">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200" title="Inactive">
                        <UserX className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    {activeTab === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'active')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'rejected')}
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-200 active:scale-95 shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        {student.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'inactive')}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Deactivate"
                          >
                            <UserX className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'active')}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Activate"
                          >
                            <UserCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedStudentForID(student)}
                          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                          title="Generate ID Card"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setStudentToDelete(student)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete Student"
                        >
                          <Trash className="w-5 h-5" />
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
        <div className="p-5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/30">
          <span>Inventory: 1 to 3 of 1,248 Records</span>
          <div className="flex gap-3">
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-20 uppercase tracking-widest shadow-sm">Previous</button>
            <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors uppercase tracking-widest shadow-sm">Next</button>
          </div>
        </div>


      </div>

      {selectedStudentForID && (
        <IDCard 
          student={selectedStudentForID} 
          onClose={() => setSelectedStudentForID(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Delete Student?</h3>
               </div>
               <button 
                 onClick={() => { setStudentToDelete(null); setDeletePin(''); }}
                 className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                You are about to permanently delete <strong className="text-slate-900">{studentToDelete.name}</strong>. 
                This action cannot be undone and will remove all their data.
              </p>
              
              <form onSubmit={handleDeleteStudent} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Security PIN</label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={deletePin}
                    onChange={(e) => setDeletePin(e.target.value)}
                    placeholder="Enter your PIN to confirm"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none font-mono tracking-widest shadow-sm"
                  />
                  <p className="text-[10px] text-slate-400 ml-1 font-bold uppercase tracking-widest">Requires your 4-digit Admin PIN.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStudentToDelete(null); setDeletePin(''); }}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deletePin}
                    className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
