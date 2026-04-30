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
              className="bg-white rounded-[24px] border border-slate-100 overflow-hidden group hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full"
            >
              {/* Thumbnail Container - Fixed Height */}
              <div className="relative h-44 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10"></div>
                {course.thumbnailUrl || course.image ? (
                  <img 
                    src={course.thumbnailUrl || course.image} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                
                {/* Status Badge - Smaller */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white ${
                    course.enrollmentStatus === 'pending' ? 'bg-amber-500/90' : 'bg-primary-600/90'
                  }`}>
                    {course.enrollmentStatus === 'pending' ? 'Pending' : 'Active'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="flex items-center gap-1.5 mb-1 opacity-80">
                    <Calendar className="w-3 h-3 text-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                      {course.duration || '3 Months'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight uppercase tracking-tight line-clamp-1">
                    {course.name || course.title}
                  </h3>
                </div>
              </div>

              {/* Details Section - More compact padding */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                    <p className="text-xl font-black text-slate-900 leading-none">{course.progress || 0}%</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <BarChart className="w-5 h-5" />
                  </div>
                </div>

                {/* Progress Bar - Thinner */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-primary-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>

                {/* Stats Row - Smaller font */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-5 border-b border-slate-50">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Modules</span>
                    <p className="text-[12px] font-bold text-slate-700">
                      {course.completedModules || 0} / {course.totalModules || 10}
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Schedule</span>
                    <p className="text-[12px] font-bold text-slate-700 truncate">
                      {course.nextClass || 'TBA'}
                    </p>
                  </div>
                </div>

                {/* Action Button - More compact */}
                <button 
                  disabled={course.enrollmentStatus === 'pending'}
                  onClick={() => course.enrollmentStatus !== 'pending' && navigate(`/dashboard/courses/${course.id}/classroom`)}
                  className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2 group/btn"
                >
                  {course.enrollmentStatus === 'pending' ? 'Pending Approval' : (
                    <>
                      Enter Classroom
                      <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
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
