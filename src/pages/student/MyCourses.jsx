import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, BarChart, ChevronRight, Loader2, Plus, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import BrowseCatalogModal from '../../components/student/BrowseCatalogModal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 15 
    } 
  }
};

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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 border-4 border-primary-100 rounded-full"></div>
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Cataloging Courses…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 px-1 bg-dashboard-grid bg-repeat">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100/50 text-primary-600">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.18em]">Learning Board</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Registered <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Courses</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Access lessons, modules, and track syllabus progress.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCatalogOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-black transition-all shadow-md hover:bg-primary-700 cursor-pointer text-xs uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4 text-white/80" />
          Browse Catalog
        </motion.button>
      </motion.div>

      <BrowseCatalogModal 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        onEnrolled={fetchCourses} 
      />

      {courses.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {courses.map((course) => (
            <motion.div 
              key={course.id} 
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="bg-white/70 backdrop-blur-2xl rounded-[28px] border border-white/60 shadow-[0_12px_36px_rgba(79,70,229,0.035),0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden group hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.08)] hover:border-white transition-all duration-300 flex flex-col h-full relative"
            >
              {/* Thumbnail Container */}
              <div className="relative h-40 overflow-hidden bg-slate-50 border-b border-slate-200/60">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10"></div>
                {course.thumbnailUrl || course.image ? (
                  <img 
                    src={course.thumbnailUrl || course.image} 
                    alt={course.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-50 to-slate-100 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                      <BookOpen className="w-6.5 h-6.5 text-slate-300 group-hover:text-primary-400 transition-colors duration-500" />
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md border ${
                    course.enrollmentStatus === 'pending' 
                      ? 'bg-amber-500/90 border-amber-400/20 shadow-md' 
                      : 'bg-emerald-500/90 border-emerald-400/20 shadow-md'
                  }`}>
                    {course.enrollmentStatus === 'pending' ? 'Pending Approval' : 'Active'}
                  </span>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-4 left-4 z-20">
                  <div className="flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">
                      {course.duration || '3 Months'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CCC Module</span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary-600 transition-colors line-clamp-1 uppercase mt-0.5">
                    {course.name || course.title}
                  </h3>
                </div>

                <div className="mb-5 flex-1">
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {course.description || "Master the fundamentals and advanced concepts of this course."}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="flex justify-between items-center text-[10px] mb-1.5">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Syllabus Covered</span>
                    <span className="font-black text-primary-600">{course.progress || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 border border-slate-200/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress || 0}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 rounded-full"
                    ></motion.div>
                  </div>
                </div>

                {/* Stats Blocks */}
                <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-slate-200/55">
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-3 border border-white/50 hover:bg-white/60 shadow-sm transition-colors duration-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0 border border-primary-100/30">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Modules</span>
                      <p className="text-[11px] font-black text-slate-800 truncate">
                        {course.completedModules || 0}<span className="text-[10px] text-slate-400 font-medium">/{course.totalModules || 10}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-3 border border-white/50 hover:bg-white/60 shadow-sm transition-colors duration-200 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/30">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Schedule</span>
                      <p className="text-[11px] font-black text-slate-800 truncate">
                        {course.nextClass || 'TBA'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  disabled={course.enrollmentStatus === 'pending'}
                  onClick={() => course.enrollmentStatus !== 'pending' && navigate(`/dashboard/courses/${course.id}/classroom`)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.16em] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 group/btn cursor-pointer shadow-md shadow-primary-500/10 hover:shadow-primary-500/20"
                >
                  {course.enrollmentStatus === 'pending' ? 'Pending Approval' : (
                    <>
                      Enter Classroom
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform text-white/80" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <BookOpen className="w-6.5 h-6.5 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1.5 uppercase tracking-wider">No Courses Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto mb-8 font-medium">
            Enroll in a course from our catalogue to begin learning.
          </p>
          <button 
            onClick={() => setIsCatalogOpen(true)}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-md hover:shadow-lg"
          >
            Explore Catalogue
          </button>
        </motion.div>
      )}
    </div>
  );
}
