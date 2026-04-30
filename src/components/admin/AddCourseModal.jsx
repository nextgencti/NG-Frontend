import React, { useState } from 'react';
import { X, Upload, BookOpen, Clock, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AddCourseModal({ isOpen, onClose, onCourseAdded }) {
  const [formData, setFormData] = useState({ name: '', duration: '', fees: '', status: 'active' });
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('duration', formData.duration);
    submitData.append('fees', formData.fees);
    submitData.append('status', formData.status);
    if (thumbnail) {
      submitData.append('thumbnail', thumbnail);
    }

    try {
      const response = await api.post('/admin/courses', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message);
      onCourseAdded(response.data.course);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Course</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">Enter course details to publish</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
          <div className="flex justify-center">
            <div className="relative w-full h-44 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-primary-500/50 transition-all cursor-pointer shadow-sm">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg border border-white/20">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center border border-primary-200 mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Course Thumbnail</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">1200x800 Recommended Resolution</p>
                </>
              )}
              <input type="file" required accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input type="text" name="name" required placeholder="Course Name (e.g., Web Development)" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
            </div>
            
            <div className="flex gap-6">
              <div className="relative flex-1 group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input type="text" name="duration" required placeholder="Duration (e.g., 3 Months)" value={formData.duration} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
              </div>
              <div className="relative flex-1 group">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input type="number" name="fees" required placeholder="Course Fees" value={formData.fees} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-bold text-slate-400 mb-4 block uppercase tracking-widest">Course Status</label>
              <div className="flex gap-4">
                 <label className={`flex-1 py-4 px-4 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.status === 'active' ? 'border-emerald-500/50 bg-emerald-100 text-emerald-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                   <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleChange} className="hidden" />
                   <span className="text-[10px] uppercase tracking-widest">Active</span>
                 </label>
                 <label className={`flex-1 py-4 px-4 rounded-2xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${formData.status === 'upcoming' ? 'border-amber-500/50 bg-amber-100 text-amber-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                   <input type="radio" name="status" value="upcoming" checked={formData.status === 'upcoming'} onChange={handleChange} className="hidden" />
                   <span className="text-[10px] uppercase tracking-widest">Upcoming</span>
                 </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary-600/10 transition-all flex justify-center items-center active:scale-95">
              {loading ? <span className="animate-pulse">Saving...</span> : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>


  );
}
