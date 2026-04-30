import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Clock, CheckCircle2, Loader2, Sparkles, TrendingUp } from 'lucide-react';
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
          className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
        >
          {/* Header - More compact */}
          <div className="p-5 px-7 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Catalog</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Browse <span className="text-amber-200">Courses</span></h3>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar - Smaller padding */}
          <div className="p-4 px-7 border-b border-slate-50 bg-slate-50/30 shrink-0">
            <div className="relative max-w-xl mx-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search programs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-900 focus:outline-none focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Catalog List */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Loading...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-5">
                {filtered.map((course) => (
                  <div 
                    key={course.id} 
                    className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Course Image - Reduced height */}
                    <div className="h-36 bg-slate-50 relative overflow-hidden">
                      {course.thumbnailUrl || course.image ? (
                        <img 
                          src={course.thumbnailUrl || course.image} 
                          alt={course.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 z-20">
                         <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-900 text-[8px] font-black uppercase tracking-widest rounded-md border border-slate-200 shadow-sm">
                           {course.duration || '3 Months'}
                         </span>
                      </div>
                    </div>

                    {/* Content Section - Compact padding */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                         <TrendingUp className="w-3 h-3 text-primary-500" />
                         <span className="text-[8px] font-black text-primary-600 uppercase tracking-widest">Popular</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 uppercase leading-tight mb-2 line-clamp-1">
                        {course.name}
                      </h4>
                      <p className="text-slate-500 text-[11px] line-clamp-2 mb-6 font-medium leading-relaxed">
                        {course.description || "Master the skills needed to excel in your field with our expert-led curriculum."}
                      </p>
                      
                      {/* Pricing & CTA */}
                      <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Fees</p>
                          <p className="text-lg font-black text-slate-900 tracking-tighter">₹{Number(course.fees).toLocaleString()}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingId === course.id}
                          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 group/btn"
                        >
                          {enrollingId === course.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          Join Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">No results found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
