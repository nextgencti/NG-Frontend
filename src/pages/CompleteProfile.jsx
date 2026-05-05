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
  const [institutes, setInstitutes] = useState([]);
  const fileInputRef = useRef(null);
  
  // Fetch available courses and institutes for signup
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, instRes] = await Promise.all([
          api.get('/student/all-courses'),
          api.get('/student/all-institutes')
        ]);
        setCourses(courseRes.data.courses || []);
        const fetchedInstitutes = instRes.data.institutes || [];
        setInstitutes(fetchedInstitutes);
        
        // Auto-select first institute if available
        if (fetchedInstitutes.length > 0) {
          setFormData(prev => ({ ...prev, instituteId: fetchedInstitutes[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch signup data', error);
      }
    };
    fetchData();
  }, []);
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    address: '',
    phone: '',
    courseId: '',
    instituteId: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'instituteId') {
      // Reset selected course when changing the institute
      setFormData((prev) => ({ ...prev, instituteId: value, courseId: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
        instituteId: formData.instituteId,
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F8FAFC]">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-primary-600/[0.03] rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-primary-600/[0.03] rounded-full blur-[140px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-lg p-8 sm:p-12 bg-white rounded-[24px] border border-[#E5E7EB] m-4 shadow-soft">
        
        <div className="flex justify-center mb-6">
          <Logo className="w-20 h-20" />
        </div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#111827] mb-2 tracking-tight">Complete Profile</h2>
          <p className="text-[#6B7280] text-[14px] font-medium">Just a few more details to get you started.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 px-4">
          <div className="h-1.5 flex-1 rounded-full bg-[#4F46E5] shadow-sm"></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#4F46E5]' : 'bg-[#F1F5F9]'}`}></div>
        </div>

        <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-3 mb-2">
                <div
                  className="relative w-24 h-24 rounded-full cursor-pointer group"
                  onClick={() => fileInputRef.current.click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#4F46E5]/20 p-0.5"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#F8FAFC] border-2 border-dashed border-[#E5E7EB] flex items-center justify-center group-hover:border-[#4F46E5]/50 transition-colors">
                      <User className="w-10 h-10 text-[#94A3B8]" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-[#111827]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Click to upload photo</p>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <input
                    type="text" name="fullName" required
                    value={formData.fullName} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                    placeholder="Sanjay Rajpoot"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <input
                    type="tel" name="phone" required
                    value={formData.phone} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Full Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3 h-5 w-5 text-[#94A3B8]" />
                  <textarea
                    name="address" required rows="2"
                    value={formData.address} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none resize-none"
                    placeholder="Muskara, Hamirpur..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Select Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8] z-10" />
                  <select
                    name="courseId" required
                    value={formData.courseId} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none appearance-none cursor-pointer relative"
                  >
                    <option value="" disabled>Choose a course</option>
                    {courses
                      .filter(course => !formData.instituteId || course.instituteId === formData.instituteId || !course.instituteId)
                      .map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-[#111827] uppercase tracking-wider ml-1">Setup Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#94A3B8]" />
                  <input
                    type="password" name="password" required minLength="6"
                    value={formData.password} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[10px] text-[#111827] text-[14px] placeholder-[#94A3B8] focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none"
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
                className="flex-1 py-3.5 px-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#6B7280] rounded-[12px] text-[14px] font-bold border border-[#E5E7EB] transition-all"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] py-3.5 px-4 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[12px] text-[14px] font-bold shadow-lg shadow-[#4F46E5]/10 transition-all flex items-center justify-center group active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : step === 1 ? (
                 <>Continue <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              ) : (
                 <>Complete Setup <CheckCircle className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
