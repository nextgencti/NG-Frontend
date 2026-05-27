import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, CheckCircle2, Clock, Trash, AlertTriangle, X, CreditCard, Users, ShieldAlert } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddStudentModal from '../../components/admin/AddStudentModal';
import IDCard from '../../components/shared/IDCard';

export default function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'pending'
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          api.get('/admin/students'),
          api.get('/admin/courses')
        ]);
        setStudents(studentsResponse.data.students || []);
        setCourses(coursesResponse.data.courses || []);
      } catch (error) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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

  const getCourseName = (courseId) => {
    if (!courseId || courseId === 'Unassigned') return 'Unassigned';
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : courseId;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesTab = activeTab === 'all' ? student.status !== 'pending' : student.status === 'pending';
    const matchesCourse = selectedCourse === 'All' || student.courseId === selectedCourse || student.course === selectedCourse;
    
    return matchesSearch && matchesTab && matchesCourse;
  });

  // Calculate statistics from current data
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const pendingCount = students.filter(s => s.status === 'pending').length;
  const inactiveCount = students.filter(s => s.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Management</h2>
          <p className="text-slate-500 text-xs font-semibold">Provision and manage student institutional access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all w-56 shadow-sm placeholder:text-slate-400" 
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-[9px] uppercase tracking-widest shadow-md shadow-primary-500/10 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>
      </div>

      {/* Dynamic Statistics Section - Compact Padding and Sizing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Students Card */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Members</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Approvals</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm relative">
            <Clock className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
        </div>

        {/* Inactive Accounts Card */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Inactive Accounts</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Unified Tab Bar & Filters */}
      <div className="flex space-x-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer ${
            activeTab === 'all' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Active Directory
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pending' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Approval Queue
          {pendingCount > 0 && (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-extrabold animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onStudentAdded={(newStudent) => setStudents([newStudent, ...students])} 
      />

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Compact Table Tools */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-3.5 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          
          {/* Compact Dynamic Course Filter Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <select 
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-transparent text-[10px] font-bold text-slate-600 focus:outline-none cursor-pointer hover:text-slate-900 transition-colors uppercase tracking-wider outline-none border-none pr-1.5"
              >
                <option value="All">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Compact Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-[9px] font-bold uppercase tracking-widest border-b border-slate-100">
                <th className="py-3.5 px-4.5">Student Information</th>
                <th className="py-3.5 px-4.5">Course</th>
                <th className="py-3.5 px-4.5">Enrolled Date</th>
                <th className="py-3.5 px-4.5 text-center">Fees Status</th>
                <th className="py-3.5 px-4.5 text-center">Status</th>
                <th className="py-3.5 px-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-4.5">
                    <div className="flex items-center gap-2.5">
                      {student.photoURL ? (
                        <img 
                          src={student.photoURL} 
                          alt={student.name} 
                          className="w-8 h-8 rounded-full object-cover shadow-sm bg-white border border-slate-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-50 text-primary-600 flex items-center justify-center font-bold text-[9px] shadow-sm border border-slate-200 uppercase">
                          {student.name ? student.name.split(' ').map(n => n?.[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">{student.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4.5">
                     <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50/50 text-primary-700 border border-indigo-100/50">
                       {getCourseName(student.course)}
                     </span>
                  </td>
                  <td className="py-3 px-4.5 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{student.enrolledDate}</td>
                  <td className="py-3 px-4.5 text-center">
                    {student.payment === 'cleared' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                         Cleared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                         Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4.5 text-center">
                    {student.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100" title="Active">
                        <UserCheck className="w-3 h-3" /> Active
                      </span>
                    ) : student.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 animate-pulse" title="Pending">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200" title="Inactive">
                        <UserX className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4.5 text-right">
                    {activeTab === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'active')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(student.id, 'rejected')}
                          className="px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all border border-slate-200 active:scale-95 shadow-sm cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {student.status === 'active' ? (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'inactive')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Deactivate"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(student.id, 'active')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="Activate"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedStudentForID(student)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all cursor-pointer"
                          title="Generate ID Card"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    No matching students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/30">
          <span>Total Records: {filteredStudents.length} of {totalCount}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-20 uppercase tracking-widest shadow-sm cursor-pointer">Previous</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded-md hover:text-slate-900 hover:bg-slate-50 transition-colors uppercase tracking-widest shadow-sm cursor-pointer">Next</button>
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-rose-50">
               <div className="flex items-center gap-2.5">
                 <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle className="w-4 h-4" />
                 </div>
                 <h3 className="text-base font-bold text-slate-900">Delete Student?</h3>
               </div>
               <button 
                 onClick={() => { setStudentToDelete(null); setDeletePin(''); }}
                 className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>
            <div className="p-5 space-y-3.5">
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                You are about to permanently delete <strong className="text-slate-900">{studentToDelete.name}</strong>. 
                This action cannot be undone and will remove all their data.
              </p>
              
              <form onSubmit={handleDeleteStudent} className="space-y-3 pt-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Admin Security PIN</label>
                  <input
                    type="password"
                    maxLength={8}
                    required
                    value={deletePin}
                    onChange={(e) => setDeletePin(e.target.value)}
                    placeholder="Enter your PIN to confirm"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none font-mono tracking-widest shadow-sm"
                  />
                  <p className="text-[9px] text-slate-400 ml-0.5 font-bold uppercase tracking-widest">Requires your 4-digit Admin PIN.</p>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => { setStudentToDelete(null); setDeletePin(''); }}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || !deletePin}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
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
