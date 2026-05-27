import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, BarChart, ChevronRight, Loader2, Plus, Calendar } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import BrowseCatalogModal from '../../components/student/BrowseCatalogModal';

export default function MyCourses() {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 px-2">
      {/* Header Section - More compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.15em]">Learning Dashboard</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            My <span className="text-primary-600">Courses</span>
          </h2>
          <p className="text-slate-500 text-[13px] font-medium max-w-lg">
            Track your progress and access your registered courses.
          </p>
        </div>
        
        <button 
          onClick={() => setIsCatalogOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/5 active:scale-95 group"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[12px] uppercase tracking-wider">Browse Catalog</span>
        </button>
      </div>

      <BrowseCatalogModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onEnrolled={fetchCourses} 
      />

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className="bg-white rounded-[28px] border border-slate-100 overflow-hidden group hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative"
            >
              {/* Thumbnail Container - Fixed Height */}
              <div className="relative h-36 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
                {course.thumbnailUrl || course.image ? (
                  <img 
                    src={course.thumbnailUrl || course.image} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-slate-300 animate-pulse" />
                  </div>
                )}
                
                {/* Status Badge - Sleek Glassmorphism */}
                <div className="absolute top-3 left-3 z-20">
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-sm border ${
                    course.enrollmentStatus === 'pending' 
                      ? 'bg-amber-500/90 border-amber-400/20' 
                      : 'bg-emerald-500/90 border-emerald-400/20'
                  }`}>
                    {course.enrollmentStatus === 'pending' ? 'Pending' : 'Active'}
                  </span>
                </div>

                {/* Duration Badge - Floating */}
                <div className="absolute bottom-3 left-3 z-20">
                  <div className="flex items-center gap-1 bg-slate-900/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3 text-white" />
                    <span className="text-[8px] font-extrabold text-white uppercase tracking-wider">
                      {course.duration || '3 Months'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Course Name - High contrast and bold */}
                <div className="mb-2">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary-600 transition-colors uppercase line-clamp-1">
                    {course.name || course.title}
                  </h3>
                </div>

                {/* Course Description */}
                <div className="mb-4 flex-1">
                  <p className="text-slate-500 text-[12px] font-medium leading-relaxed line-clamp-2">
                    {course.description || "Master the fundamentals and advanced concepts of this course."}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Course Progress</span>
                    <span className="text-xs font-black text-[#4F46E5]">{course.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.25)] transition-all duration-1000 ease-out"
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats Blocks */}
                <div className="grid grid-cols-2 gap-2.5 mb-4 pb-4 border-b border-slate-100">
                  <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/50 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <div className="w-7.5 h-7.5 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Modules</span>
                      <p className="text-xs font-black text-slate-800">
                        {course.completedModules || 0} <span className="text-[10px] text-slate-400 font-medium">/{course.totalModules || 10}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/50 hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <div className="w-7.5 h-7.5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Schedule</span>
                      <p className="text-xs font-black text-slate-800 truncate max-w-[65px]">
                        {course.nextClass || 'TBA'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  disabled={course.enrollmentStatus === 'pending'}
                  onClick={() => course.enrollmentStatus !== 'pending' && navigate(`/dashboard/courses/${course.id}/classroom`)}
                  className="w-full mt-auto py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-1.5 group/btn shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  {course.enrollmentStatus === 'pending' ? 'Pending Approval' : (
                    <>
                      Enter Classroom
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
          <BookOpen className="w-10 h-10 text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-wider">No Courses</h3>
          <p className="text-slate-500 text-xs font-medium max-w-xs mx-auto mb-8">
            Explore our catalog to find professional courses.
          </p>
          <button 
            onClick={() => setIsCatalogOpen(true)}
            className="px-8 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
}
