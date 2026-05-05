import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Users, 
  Clock, 
  BookOpen, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddCourseModal from '../../components/admin/AddCourseModal';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, pendingRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/enrollments/pending')
      ]);
      setCourses(coursesRes.data.courses || []);
      if (pendingRes.data.success) setPendingRequests(pendingRes.data.pendingRequests || []);
    } catch (error) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (enrollmentId, newStatus) => {
    setProcessingId(enrollmentId);
    try {
      const response = await api.put(`/admin/enrollments/${enrollmentId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Enrollment ${newStatus} successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update enrollment');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Approvals', value: pendingRequests.length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Students', value: courses.reduce((acc, curr) => acc + (curr.students || 0), 0), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Platform Growth', value: '+12%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-6 pb-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Course <span className="text-indigo-600">Management</span>
          </h2>
          <p className="text-slate-500 text-[11px] font-medium mt-0.5">Design, deploy, and monitor your educational curriculum.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="group relative px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <Plus className="w-4 h-4" /> 
          <span>Create New Course</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 group hover:border-indigo-100 transition-all duration-300">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-lg font-black text-slate-900 leading-none mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Navigation & Filters */}
        <div className="p-4 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'courses' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Course Catalog
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'pending' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="w-4 h-4 bg-indigo-600 text-white rounded-full text-[8px] flex items-center justify-center animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search curriculum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 lg:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
               <div className="w-10 h-10 rounded-full border-[3px] border-slate-100 border-t-indigo-600 animate-spin"></div>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Synchronizing...</p>
            </div>
          ) : activeTab === 'courses' ? (
            <>
              {filteredCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No courses found</h3>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">Try adjusting your search or add a new course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex flex-col relative overflow-hidden">
                      <div className="h-1 bg-indigo-600/10 group-hover:bg-indigo-600 transition-colors"></div>

                      <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                            course.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {course.status}
                          </div>
                          <div className="text-sm font-black text-slate-900 tracking-tight">₹{course.fees}</div>
                        </div>

                        <h3 className="text-base font-black text-slate-800 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {course.name}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                              <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                              <span className="text-[10px] font-bold text-slate-700">{course.duration}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Learners</span>
                              <span className="text-[10px] font-bold text-slate-700">{course.students}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50/50 border-t border-slate-50 flex gap-2">
                        <button 
                          onClick={() => navigate(`/admin/courses/${course.id}/content`)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all rounded-lg shadow-sm active:scale-95"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Curriculum
                        </button>
                        <button className="flex items-center justify-center w-10 h-10 bg-white text-slate-400 border border-slate-100 hover:text-indigo-600 hover:border-indigo-100 rounded-lg transition-all active:scale-95">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="p-4">Applicant Info</th>
                    <th className="p-4">Requested Curriculum</th>
                    <th className="p-4">Submission Date</th>
                    <th className="p-4 text-center">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-16 text-center">
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-10 h-10 text-emerald-100 mb-3" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Clear</h4>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map(req => (
                      <tr key={req.enrollmentId} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-black text-[10px]">
                              {req.studentName?.[0]}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.studentName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{req.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-white border border-slate-100 rounded-md text-[9px] font-black text-slate-600 uppercase tracking-widest">
                            {req.courseName}
                          </span>
                        </td>
                        <td className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">{req.enrolledAt}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              disabled={processingId === req.enrollmentId}
                              onClick={() => handleStatusUpdate(req.enrollmentId, 'active')}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all disabled:opacity-20 active:scale-95 flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Authorize
                            </button>
                            <button 
                              disabled={processingId === req.enrollmentId}
                              onClick={() => handleStatusUpdate(req.enrollmentId, 'rejected')}
                              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg border border-slate-100 transition-all disabled:opacity-20 active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddCourseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCourseAdded={(newCourse) => setCourses([newCourse, ...courses])} 
      />
    </div>
  );
}
