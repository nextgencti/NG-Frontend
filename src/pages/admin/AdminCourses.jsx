import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Users, Clock } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import AddCourseModal from '../../components/admin/AddCourseModal';

export default function AdminCourses() {
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
          <h2 className="text-3xl font-black text-white tracking-tight">Manage Courses</h2>
          <p className="text-slate-400 font-medium">Create and manage your institutional course catalog.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all flex items-center gap-3 active:scale-95">
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
      <div className="flex gap-8 border-b border-white/5">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
            activeTab === 'courses' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-3 ${
            activeTab === 'pending' 
              ? 'border-amber-500 text-amber-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Active Enrollments
          {pendingRequests.length > 0 && (
            <span className="bg-amber-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-primary-500 animate-spin"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Synchronizing Data...</p>
        </div>
      ) : activeTab === 'courses' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
          <div key={course.id} className="glass-dark rounded-[2.5rem] border border-white/5 flex flex-col group hover:border-white/10 hover:-translate-y-2 transition-all duration-500 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="p-8 border-b border-white/5 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                  course.status === 'active' 
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' 
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                }`}>
                  {course.status}
                </span>
                <span className="text-xl font-black text-white tracking-widest">₹{course.fees}</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-3 leading-tight group-hover:text-primary-400 transition-colors">
                {course.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Clock className="w-4 h-4 text-primary-400" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Users className="w-4 h-4 text-primary-400" />
                  {course.students} Enrolled
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end relative z-10">
              <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Edit3 className="w-4 h-4" /> Edit Course
              </button>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="p-6">Student</th>
                  <th className="p-6">Course</th>
                  <th className="p-6">Enrolled At</th>
                  <th className="p-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">
                      Pipeline clear. No pending enrollment signals.
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map(req => (
                    <tr key={req.enrollmentId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{req.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{req.studentEmail}</p>
                      </td>
                      <td className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">{req.courseName}</td>
                      <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-tighter">{req.enrolledAt}</td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            disabled={processingId === req.enrollmentId}
                            onClick={() => handleStatusUpdate(req.enrollmentId, 'active')}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-20 active:scale-95"
                          >
                            Authorize
                          </button>
                          <button 
                            disabled={processingId === req.enrollmentId}
                            onClick={() => handleStatusUpdate(req.enrollmentId, 'rejected')}
                            className="px-6 py-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-black text-[10px] uppercase tracking-widest rounded-xl border border-white/5 transition-all disabled:opacity-20 active:scale-95"
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
