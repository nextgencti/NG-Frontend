import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, CheckCircle2, Clock, Trash, AlertTriangle, X, CreditCard, Users, ShieldAlert, Award, Printer, Edit, Sparkles, GraduationCap, Wifi } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddStudentModal from '../../components/admin/AddStudentModal';
import IDCard from '../../components/shared/IDCard';
import ManageCertificatesModal from '../../components/admin/ManageCertificatesModal';
import { useAuth } from '../../context/AuthContext';
import { printAdmissionForm } from '../../utils/printHelper';

export default function AdminStudents() {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'pending', or 'all'
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForID, setSelectedStudentForID] = useState(null);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const fetchData = async () => {
    try {
      const [studentsResponse, coursesResponse] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/courses')
      ]);
      setStudents(studentsResponse.data.students || []);
      setCourses(coursesResponse.data.courses || []);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStudentSaved = (savedStudent, isEdit) => {
    if (isEdit) {
      setStudents(prev => prev.map(s => s.id === savedStudent.id ? { ...s, ...savedStudent } : s));
    } else {
      setStudents(prev => [savedStudent, ...prev]);
    }
    // Instant sync: background re-fetch so all badges, course counts, and directory lists update immediately
    fetchData();
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Optimistic instant state update
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      await api.put(`/admin/students/${id}/status`, { status: newStatus });
      const statusLabels = {
        active: 'Active (Offline + Online Access)',
        old: 'Old Student (Online Only Access - Offline Exited)',
        inactive: 'Deactivated / Inactive (All Access Blocked)',
        rejected: 'Rejected'
      };
      toast.success(`Student status updated to ${statusLabels[newStatus] || newStatus}.`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update student status');
      fetchData();
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
        setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
        setStudentToDelete(null);
        setDeletePin('');
        fetchData();
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
      
    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = student.status === 'active';
    } else if (activeTab === 'old') {
      matchesTab = student.status === 'old';
    } else if (activeTab === 'inactive') {
      matchesTab = student.status === 'inactive' || student.status === 'rejected';
    } else if (activeTab === 'pending') {
      matchesTab = student.status === 'pending' || student.status === 'trial';
    } else if (activeTab === 'all') {
      matchesTab = true;
    }
    
    const matchesCourse = selectedCourse === 'All' || student.courseId === selectedCourse || student.course === selectedCourse;
    
    return matchesSearch && matchesTab && matchesCourse;
  });

  // Calculate statistics from current data
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'active').length;
  const oldCount = students.filter(s => s.status === 'old').length;
  const pendingCount = students.filter(s => s.status === 'pending' || s.status === 'trial').length;
  const inactiveCount = students.filter(s => s.status === 'inactive' || s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {activeDropdownId && (
        <div className="fixed inset-0 z-30 cursor-default" onClick={() => setActiveDropdownId(null)} />
      )}
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

      {/* Dynamic Statistics Section - 5 Clear Institutional Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Students Card */}
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300 cursor-pointer ${activeTab === 'all' ? 'bg-primary-50/50 border-primary-300 ring-2 ring-primary-500/20' : 'bg-white border-slate-100'}`}
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">{totalCount}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Active Students Card */}
        <div 
          onClick={() => setActiveTab('active')}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300 cursor-pointer ${activeTab === 'active' ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-100'}`}
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Members</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">{activeCount}</p>
            <span className="text-[8px] font-bold text-slate-400 block uppercase">Offline + Online</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <UserCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Old Students (Online Only) Card */}
        <div 
          onClick={() => setActiveTab('old')}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300 cursor-pointer ${activeTab === 'old' ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-white border-slate-100'}`}
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Old Students</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{oldCount}</p>
            <span className="text-[8px] font-bold text-slate-400 block uppercase">Online Only Access</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Inactive Accounts Card */}
        <div 
          onClick={() => setActiveTab('inactive')}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300 cursor-pointer ${activeTab === 'inactive' ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-slate-100'}`}
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Inactive Accounts</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">{inactiveCount}</p>
            <span className="text-[8px] font-bold text-slate-400 block uppercase">All Access Blocked</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
            <UserX className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Pending Approvals Card */}
        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300 cursor-pointer ${activeTab === 'pending' ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-100'}`}
        >
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Approval Queue</p>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{pendingCount}</p>
            <span className="text-[8px] font-bold text-slate-400 block uppercase">Trial / Signup</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm relative">
            <Clock className="w-4.5 h-4.5" />
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
          </div>
        </div>
      </div>

      {/* Unified Tab Bar & Filters */}
      <div className="flex space-x-4 border-b border-slate-200 overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'active' 
              ? 'border-emerald-600 text-emerald-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Active Directory (Offline + Online)
          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('old')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'old' 
              ? 'border-indigo-600 text-indigo-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Old Students (Online Only)
          <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-full border border-indigo-100">
            {oldCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'inactive' 
              ? 'border-rose-600 text-rose-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Inactive / Blocked
          <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-100">
            {inactiveCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'pending' 
              ? 'border-amber-600 text-amber-700 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Approval Queue
          {pendingCount > 0 ? (
            <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-full text-[8px] font-extrabold animate-pulse">
              {pendingCount}
            </span>
          ) : (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              0
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 px-1 text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'all' 
              ? 'border-primary-600 text-primary-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          All Students
          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
            {totalCount}
          </span>
        </button>
      </div>

      <AddStudentModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }} 
        student={editingStudent}
        onStudentAdded={handleStudentSaved} 
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
        <div className="overflow-x-auto min-h-[280px]">
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
              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
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
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200" title="Active (Offline Class + Online Access)">
                        <UserCheck className="w-3 h-3 text-emerald-600" /> Active (Offline+Online)
                      </span>
                    ) : student.status === 'old' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200" title="Old Student (Online Only Access - Exited Offline Class)">
                        <GraduationCap className="w-3 h-3 text-indigo-600" /> Old Student (Online Only)
                      </span>
                    ) : student.status === 'trial' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-indigo-50 text-primary-650 border border-indigo-100/80" title="Trial Access">
                        <Sparkles className="w-3 h-3 text-primary-500 animate-pulse" /> Trial Access
                      </span>
                    ) : student.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200 animate-pulse" title="Pending Approval">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-200" title="Inactive (All Access Blocked)">
                        <UserX className="w-3 h-3 text-rose-500" /> Inactive (Blocked)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4.5 text-right relative">
                    <div className="relative flex items-center justify-end gap-1.5">
                      {(student.status === 'trial' || student.status === 'pending') && (
                        <button
                          onClick={() => handleStatusUpdate(student.id, 'active')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          title="Approve & Grant Full Access"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => setActiveDropdownId(activeDropdownId === student.id ? null : student.id)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-800"
                        title="Actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      
                      {activeDropdownId === student.id && (() => {
                        const openUpward = index > 0 && index >= filteredStudents.length - 2;
                        return (
                          <div className={`absolute right-0 ${openUpward ? 'bottom-8 origin-bottom animate-in fade-in slide-in-from-bottom-1' : 'top-8 origin-top animate-in fade-in slide-in-from-top-1'} w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-left duration-150`}>
                            {(activeTab === 'pending' || student.status === 'trial' || student.status === 'pending') && (
                              <>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'active');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-emerald-700 hover:text-emerald-800 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  Approve Full Access
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'rejected');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                                  Reject Student
                                </button>
                                <div className="border-t border-slate-100 my-1" />
                              </>
                            )}

                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setIsAddModalOpen(true);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                              Edit Profile
                            </button>

                            {/* Status Change Transitions */}
                            {student.status === 'active' && (
                              <>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'old');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Exit from offline classes and grant online-only access"
                                >
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                  Move to Old Student (Online Only)
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'inactive');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Suspend both online and offline access"
                                >
                                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                                  Deactivate (Block All Access)
                                </button>
                              </>
                            )}

                            {student.status === 'old' && (
                              <>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'active');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Re-enroll in offline class with online access"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  Restore to Active (Offline + Online)
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'inactive');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Suspend both online and offline access"
                                >
                                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                                  Deactivate (Block All Access)
                                </button>
                              </>
                            )}

                            {(student.status === 'inactive' || student.status === 'rejected') && (
                              <>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'active');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Re-enroll in regular offline class + online access"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  Re-activate: Active (Offline + Online)
                                </button>
                                <button
                                  onClick={() => {
                                    handleStatusUpdate(student.id, 'old');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                                  title="Activate only online classes access (offline exited)"
                                >
                                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                                  Re-activate: Old Student (Online Only)
                                </button>
                              </>
                            )}

                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedStudentForCert(student);
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <Award className="w-3.5 h-3.5 text-slate-400" />
                                Award Certificate
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedStudentForID(student);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              Generate ID Card
                            </button>

                            <button
                              onClick={() => {
                                printAdmissionForm(student, getCourseName(student.course));
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-400" />
                              Print Admission Form
                            </button>

                            <div className="border-t border-slate-100 my-1"></div>

                            <button
                              onClick={() => {
                                setStudentToDelete(student);
                                setActiveDropdownId(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-rose-50 text-rose-600 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5 text-rose-500" />
                              Delete Student
                            </button>
                          </div>
                        );
                      })()}
                    </div>
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

      <ManageCertificatesModal
        isOpen={!!selectedStudentForCert}
        onClose={() => setSelectedStudentForCert(null)}
        student={selectedStudentForCert}
        courses={courses}
      />

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
