import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Users, Clock, BookOpen } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddCourseModal from '../../components/admin/AddCourseModal';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'pending'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);

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
      setCourses(coursesRes.data.courses);
      if (pendingRes.data.success) setPendingRequests(pendingRes.data.pendingRequests);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Courses</h2>
          <p className="text-slate-500 text-sm font-medium">Create and manage your institutional course catalog.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/10 transition-all flex items-center gap-3 active:scale-95">
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      <AddCourseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onCourseAdded={(newCourse) => setCourses([newCourse, ...courses])} 
      />

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'courses' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-3 ${
            activeTab === 'pending' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          Active Enrollments
          {pendingRequests.length > 0 && (
            <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-4">
           <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"></div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Synchronizing Data...</p>
        </div>
      ) : activeTab === 'courses' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
          <div key={course.id} className="glass-dark rounded-2xl border border-slate-100 flex flex-col group hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary-500/10 transition-colors"></div>
            
            <div className="p-6 border-b border-slate-50 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-5">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${
                  course.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {course.status}
                </span>
                <span className="text-lg font-bold text-slate-900 tracking-tight">₹{course.fees}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
                {course.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Users className="w-3.5 h-3.5 text-primary-500" />
                  {course.students} Enrolled
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2 relative z-10">
              <button 
                onClick={() => navigate(`/admin/courses/${course.id}/content`)}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-[#4F46E5] border border-[#E5E7EB] hover:bg-[#EEF2FF] rounded-lg transition-all shadow-sm active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" /> Manage Content
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-sm active:scale-95 border border-transparent hover:border-slate-100">
                <Edit3 className="w-3.5 h-3.5" /> Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="glass-dark rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="p-5">Student</th>
                  <th className="p-5">Course</th>
                  <th className="p-5">Enrolled At</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      Pipeline clear. No pending enrollment signals.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map(req => (
                    <tr key={req.enrollmentId} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{req.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{req.studentEmail}</p>
                      </td>
                      <td className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{req.courseName}</td>
                      <td className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{req.enrolledAt}</td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            disabled={processingId === req.enrollmentId}
                            onClick={() => handleStatusUpdate(req.enrollmentId, 'active')}
                            className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-20 active:scale-95"
                          >
                            Authorize
                          </button>
                          <button 
                            disabled={processingId === req.enrollmentId}
                            onClick={() => handleStatusUpdate(req.enrollmentId, 'rejected')}
                            className="px-5 py-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-bold text-[10px] uppercase tracking-widest rounded-lg border border-slate-200 transition-all shadow-sm disabled:opacity-20 active:scale-95"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

  );
}
