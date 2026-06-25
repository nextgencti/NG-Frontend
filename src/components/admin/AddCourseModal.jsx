import React, { useState } from 'react';
import { X, Upload, BookOpen, Clock, IndianRupee, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';

export default function AddCourseModal({ isOpen, onClose, onCourseAdded, institutes = [] }) {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const [formData, setFormData] = useState({ 
    name: '', 
    duration: '', 
    fees: '', 
    status: 'active', 
    instituteId: '',
    courseFeeType: 'fixed',
    monthlyFee: '',
    fixedFee: ''
  });
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
    if (isSuperAdmin && !formData.instituteId) {
      toast.error('Please select an institute');
      return;
    }
    setLoading(true);

    const finalFees = formData.courseFeeType === 'monthly' ? formData.monthlyFee : (formData.fixedFee || formData.fees);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('duration', formData.duration);
    submitData.append('fees', finalFees);
    submitData.append('courseFeeType', formData.courseFeeType);
    submitData.append('monthlyFee', formData.courseFeeType === 'fixed' ? '0' : formData.monthlyFee);
    submitData.append('fixedFee', formData.courseFeeType === 'monthly' ? '0' : (formData.fixedFee || finalFees));
    submitData.append('status', formData.status);
    if (isSuperAdmin) {
      submitData.append('instituteId', formData.instituteId);
    }
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
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center relative z-10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Course</h2>
            <p className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">Enter course details to publish</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5 relative z-10 overflow-y-auto flex-1 scrollbar-hide">
          <div className="flex justify-center">
            <div className="relative w-full h-32 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group hover:border-primary-500/50 transition-all cursor-pointer shadow-sm">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg border border-white/20">Change Image</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center border border-primary-200 mb-2 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5 text-primary-600" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Upload Course Thumbnail</p>
                  <p className="text-[8px] font-medium text-slate-400 mt-0.5 uppercase">1200x800 Recommended Resolution</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            {isSuperAdmin && (
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <select 
                  name="instituteId" 
                  required 
                  value={formData.instituteId} 
                  onChange={handleChange} 
                  className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer uppercase font-bold"
                >
                  <option value="" disabled>Select Institute</option>
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input type="text" name="name" required placeholder="Course Name (e.g., Web Development)" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold font-bold text-slate-800" />
            </div>
            
            <div className="relative group">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input type="text" name="duration" required placeholder="Duration (e.g., 3 Months)" value={formData.duration} onChange={handleChange} className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold font-bold text-slate-800" />
            </div>

            <div className="space-y-3 pt-0.5">
              <label className="text-[9px] font-bold text-slate-400 block uppercase tracking-widest ml-0.5">Fee Structure Model</label>
              <div className="relative group">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <select
                  name="courseFeeType"
                  value={formData.courseFeeType}
                  onChange={handleChange}
                  className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer uppercase font-bold"
                >
                  <option value="fixed">Fixed Course Fee Only</option>
                  <option value="monthly">Monthly Installments Only</option>
                  <option value="both">Both Options (Monthly / Fixed)</option>
                </select>
              </div>

              <div className="flex gap-3">
                {(formData.courseFeeType === 'fixed' || formData.courseFeeType === 'both') && (
                  <div className="relative flex-1 group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <input 
                      type="number" 
                      name="fixedFee" 
                      required 
                      placeholder="Total Fixed Fee" 
                      value={formData.fixedFee} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold font-bold text-slate-800" 
                    />
                  </div>
                )}
                {(formData.courseFeeType === 'monthly' || formData.courseFeeType === 'both') && (
                  <div className="relative flex-1 group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <input 
                      type="number" 
                      name="monthlyFee" 
                      required 
                      placeholder="Monthly Installment Fee" 
                      value={formData.monthlyFee} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold font-bold text-slate-800" 
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <label className="text-[9px] font-bold text-slate-400 mb-2 block uppercase tracking-widest ml-0.5">Course Status</label>
              <div className="flex gap-3">
                 <label className={`flex-1 py-3 px-3 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${formData.status === 'active' ? 'border-emerald-500/50 bg-emerald-100 text-emerald-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                   <input type="radio" name="status" value="active" checked={formData.status === 'active'} onChange={handleChange} className="hidden" />
                   <span className="text-[9px] uppercase tracking-widest">Active</span>
                 </label>
                 <label className={`flex-1 py-3 px-3 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${formData.status === 'upcoming' ? 'border-amber-500/50 bg-amber-100 text-amber-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                   <input type="radio" name="status" value="upcoming" checked={formData.status === 'upcoming'} onChange={handleChange} className="hidden" />
                   <span className="text-[9px] uppercase tracking-widest">Upcoming</span>
                 </label>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl font-bold text-[9px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-lg shadow-primary-600/10 transition-all flex justify-center items-center active:scale-95">
              {loading ? <span className="animate-pulse">Saving...</span> : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


