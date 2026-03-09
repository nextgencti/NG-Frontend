import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, BarChart, ChevronRight, Loader2, Plus } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import BrowseCatalogModal from '../../components/student/BrowseCatalogModal';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/courses');
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const courseColors = [
    "from-primary-500 to-indigo-600",
    "from-accent-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-orange-600"
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Courses</h2>
          <p className="text-slate-400 mt-2 font-medium">Track your progress and access your registered courses.</p>
        </div>
        <button 
          onClick={() => setIsCatalogOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary-500/20 transition-all active:scale-95 text-xs"
        >
          <Plus className="w-4 h-4" />
          Browse Catalog
        </button>
      </div>

      <BrowseCatalogModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onEnrolled={fetchCourses} 
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] animate-pulse">Synchronizing Data...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <div key={course.id} className="glass-dark border border-white/5 overflow-hidden group hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500">
              {/* Course Header/Image area */}
              <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/40 z-10 transition-opacity group-hover:opacity-60"></div>
                {course.thumbnailUrl || course.image ? (
                  <img 
                    src={course.thumbnailUrl || course.image} 
                    alt={course.name || course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-slate-600" />
                  </div>
                )}
                <div className="absolute top-4 left-4 z-20">
                  <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-xl border ${course.enrollmentStatus === 'pending' ? 'bg-amber-500/80 border-amber-300' : 'bg-white/10 border-white/20'}`}>
                    {course.enrollmentStatus === 'pending' ? 'Pending Approval' : (course.enrollmentStatus || 'Active')}
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-primary-100 transition-colors drop-shadow-lg uppercase tracking-tight line-clamp-1">
                    {course.name || course.title}
                  </h3>
                  <p className="text-sm text-primary-100/80 font-bold drop-shadow-md">Duration: {course.duration || 'Flexible'}</p>
                </div>
              </div>

              {/* Course Details */}
              <div className="p-6 sm:p-10">
                
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Course Progress</span>
                    <span className="text-sm font-black text-white">{course.progress || 0}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden p-0">
                    <div 
                      className={`h-full bg-gradient-to-r ${courseColors[index % courseColors.length]} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mb-10 pt-8 border-t border-white/5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary-400" /> Modules
                    </span>
                    <span className="text-sm font-bold text-white uppercase tracking-tight">
                      {course.completedModules || 0} / {course.totalModules || 10} COMPLETED
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-400" /> SCHEDULE
                    </span>
                    <span className="text-sm font-bold text-white uppercase tracking-tight">
                      {course.nextClass || 'TBA'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button 
                    disabled={course.enrollmentStatus === 'pending'}
                    className="flex-1 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group/btn overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {course.enrollmentStatus === 'pending' ? 'Pending Approval' : <>View Course <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>}
                    </span>
                  </button>
                  <button 
                    disabled={course.enrollmentStatus === 'pending'}
                    className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <BarChart className="w-6 h-6" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center glass-dark border border-white/5">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-pulse"></div>
            <BookOpen className="w-12 h-12 text-slate-700 relative" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-3">No Courses Found</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto mb-10 leading-relaxed">You haven't joined any courses yet. Start your journey today!</p>
          <button 
            onClick={() => setIsCatalogOpen(true)}
            className="px-12 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-500 shadow-2xl shadow-primary-500/30 transition-all active:scale-95"
          >
            Browse Catalog
          </button>
        </div>
      )}
    </div>
  );
}
