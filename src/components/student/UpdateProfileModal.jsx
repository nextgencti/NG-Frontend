import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, User, Phone } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function UpdateProfileModal({ isOpen, onClose }) {
  const { currentUser, setCurrentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
      });
      setPhotoPreview(currentUser.photoURL || '');
      setPhotoFile(null);
    }
  }, [isOpen, currentUser]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhotoToBackend = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    const response = await api.post('/student/upload-photo', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (!response.data.photoURL) throw new Error('Upload failed');
    return response.data.photoURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoURL = currentUser?.photoURL || null;
      
      // Upload new photo if changed
      if (photoFile) {
        photoURL = await uploadPhotoToBackend(photoFile);
      }

      const response = await api.put('/student/update-profile', {
        name: formData.name,
        phone: formData.phone,
        photoURL,
      });

      if (response.data.success) {
        toast.success("Profile updated successfully!");
        
        // Update local context/storage
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-widest">Update Profile</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-white/10 shadow-2xl overflow-hidden flex items-center justify-center relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <User className="w-10 h-10 text-slate-700" />
                  )}
                  <div className="absolute inset-0 bg-primary-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-[10px] font-black text-slate-500 mt-4 uppercase tracking-widest">Update Photo</p>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-white placeholder:text-slate-700"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-white placeholder:text-slate-700"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
