import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, BookOpen, Lock, CheckCircle, ArrowRight, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import Logo from '../components/Logo';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, loginWithGoogle } = useAuth(); // getting auth fns to mimic update state
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photoURL || null);
  const [courses, setCourses] = useState([]);
  const fileInputRef = useRef(null);
  
  // Fetch available courses for signup
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/student/all-courses');
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      }
    };
    fetchCourses();
  }, []);
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    address: '',
    phone: '',
    courseId: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
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
      // Upload photo to Cloudinary if user selected one
      let photoURL = currentUser?.photoURL || null;
      if (photoFile) {
        photoURL = await uploadPhotoToBackend(photoFile);
      }

      const response = await api.post('/student/complete-profile', {
        name: formData.fullName,
        courseId: formData.courseId,
        address: formData.address,
        phone: formData.phone,
        dob: '2000-01-01',
        photoURL,
        password: formData.password
      });
      
      setIsLoading(false);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      toast.success("Profile Completed! Redirecting...", { icon: '🎉' });
      navigate('/pending-approval');
      
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px]"></div>

      <div className="z-10 w-full max-w-lg p-8 sm:p-10 glass-dark rounded-3xl border border-white/10 m-4">
        
        <div className="flex justify-center mb-6">
          <Logo className="w-20 h-20" />
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Complete Profile</h2>
          <p className="text-slate-400">Just a few more details to get you started.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500"></div>
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-gradient-to-r from-accent-500 to-primary-500' : 'bg-white/10'}`}></div>
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
          
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">

              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="relative w-24 h-24 rounded-full cursor-pointer group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary-500/50"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <p className="text-xs text-slate-500">Click to upload profile photo</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="text" name="fullName" required
                    value={formData.fullName} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="Sanjay Rajpoot"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="tel" name="phone" required
                    value={formData.phone} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 h-5 w-5 text-slate-500" />
                  <textarea
                    name="address" required rows="2"
                    value={formData.address} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Muskara, Hamirpur..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Select Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <select
                    name="courseId" required
                    value={formData.courseId} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Setup Password (for future logins)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                  <input
                    type="password" name="password" required minLength="6"
                    value={formData.password} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
             {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-500 hover:to-accent-400 text-white rounded-xl font-medium shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all flex items-center justify-center group"
            >
              {isLoading ? (
                <span className="animate-pulse">Saving Profile...</span>
              ) : step === 1 ? (
                 <>Continue <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                 <>Complete Setup <CheckCircle className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
