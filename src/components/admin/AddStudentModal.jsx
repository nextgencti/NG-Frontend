import React, { useState, useEffect } from 'react';
import { X, Upload, User, Mail, Phone, BookOpen, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function AddStudentModal({ isOpen, onClose, onStudentAdded }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', courseId: '', address: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch available courses for the dropdown
      const fetchCourses = async () => {
        try {
          const res = await api.get('/admin/courses');
          setCourses(res.data.courses);
        } catch (error) {
          console.error(error);
        }
      };
      fetchCourses();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('courseId', formData.courseId);
    submitData.append('address', formData.address);
    if (profilePic) {
      submitData.append('profilePic', profilePic);
    }

    try {
      const response = await api.post('/admin/students', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message);
      onStudentAdded(response.data.student);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Student</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">Enroll a new student into the system</p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden group hover:border-accent-500/50 transition-all cursor-pointer shadow-sm">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform" />
              )}
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <input type="file" required accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Profile Picture</p>
          </div>

          <div className="space-y-6">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
            </div>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <input type="tel" name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold" />
            </div>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <textarea name="address" required placeholder="Student Address" value={formData.address} onChange={handleChange} rows="2" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:font-bold resize-none" />
            </div>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <select name="courseId" required value={formData.courseId} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all appearance-none cursor-pointer uppercase font-bold">
                <option value="" disabled>Select Course</option>
                {(() => {
                  const uniqueCourses = [];
                  const seenNames = new Set();
                  courses.forEach(c => {
                    if (c && c.name && !seenNames.has(c.name.trim().toLowerCase())) {
                      seenNames.add(c.name.trim().toLowerCase());
                      uniqueCourses.push(c);
                    }
                  });
                  return uniqueCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ));
                })()}
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-4 px-4 bg-accent-600 hover:bg-accent-700 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-accent-600/10 transition-all flex justify-center items-center active:scale-95">
              {loading ? <span className="animate-pulse">Saving...</span> : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>


  );
}
