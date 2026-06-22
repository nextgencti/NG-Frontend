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
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600 flex justify-between items-center">
            <h3 className="text-lg font-bold text-white tracking-tight">Update Profile</h3>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Photo Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-primary-500 ring-4 ring-primary-50 shadow-sm overflow-hidden flex items-center justify-center relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <User className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-primary-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Edit Icon Badge */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-slate-200 shadow-md flex items-center justify-center text-primary-600 group-hover:text-primary-700 group-hover:bg-primary-50 transition-colors z-10">
                  <Camera className="w-4 h-4" />
                </div>

                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  title="Update photo"
                />
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-4 uppercase tracking-wider">Update Photo</p>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              {currentUser?.role === 'student' && currentUser?.rollNumber && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    Student Roll Number (ID)
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-500 select-all tracking-wider">
                    {currentUser.rollNumber}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
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
