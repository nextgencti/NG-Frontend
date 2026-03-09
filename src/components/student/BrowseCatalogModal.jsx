import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrowseCatalogModal({ isOpen, onClose, onEnrolled }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const response = await api.get('/student/all-courses');
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      toast.error('Failed to load course catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const response = await api.post('/student/enroll', { courseId });
      if (response.data.success) {
        toast.success('Enrollment requested. Waiting for admin approval!', { duration: 5000 });
        onEnrolled();
        onClose();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Enrollment failed';
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const filtered = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/5"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                Course Catalog
              </h3>
              <p className="text-primary-100 text-sm font-medium mt-1">Discover new skills and advance your career.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-white/5 bg-white/5 shrink-0">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search for available courses..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-[10px] uppercase font-black tracking-widest text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Catalog List */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Fetching Catalog...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {filtered.map((course) => (
                  <div key={course.id} className="group flex flex-col glass-dark border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-300">
                    <div className="h-44 bg-white/5 relative">
                      {course.thumbnailUrl ? (
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <BookOpen className="w-12 h-12 text-slate-800" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                         <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest rounded-xl border border-white/10">
                           {course.duration}
                         </span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-xl font-black text-white uppercase leading-snug mb-2 group-hover:text-primary-400 transition-colors">
                        {course.name}
                      </h4>
                      <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">
                        {course.description || "Master the skills needed to excel in your field with our expert-led curriculum."}
                      </p>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">FEES</p>
                          <p className="text-xl font-black text-white leading-none tracking-tighter">₹{course.fees}</p>
                        </div>
                        <button 
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                          {enrollingId === course.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No courses found matching your search</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
