import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Sparkles, Camera, CheckCircle, ChevronDown, Award, BookOpen, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import IDCard from '../../components/shared/IDCard';

export default function MyProfile() {
  const { currentUser, setCurrentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    fatherName: currentUser?.fatherName || '',
    motherName: currentUser?.motherName || '',
    dob: currentUser?.dob || '',
    gender: currentUser?.gender || '',
    aadhaar: currentUser?.aadhaar || '',
    address: currentUser?.address || '',
  });

  const [focusedField, setFocusedField] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(currentUser?.photoURL || null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [courseName, setCourseName] = useState('Loading...');

  // Fetch course name for the ID card preview info
  useEffect(() => {
    const fetchCourse = async () => {
      if (currentUser?.courseId) {
        try {
          const res = await api.get('/student/courses');
          const course = res.data.courses.find(c => c.id === currentUser.courseId || c.courseId === currentUser.courseId);
          if (course) setCourseName(course.name);
        } catch (error) {
          console.error('Failed to resolve course name:', error);
        }
      }
    };
    fetchCourse();
  }, [currentUser?.courseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }
    if (name === 'aadhaar') {
      const cleanValue = value.replace(/\D/g, '').slice(0, 12);
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const uploadPhoto = async (file) => {
    const data = new FormData();
    data.append('photo', file);
    const response = await api.post('/student/upload-photo', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.photoURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict front-end validation
    if (formData.phone.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    if (formData.aadhaar.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }

    setIsUpdating(true);
    try {
      let photoURL = currentUser?.photoURL || null;
      if (photoFile) {
        photoURL = await uploadPhoto(photoFile);
      }

      const res = await api.put('/student/profile', {
        name: formData.fullName,
        phone: formData.phone,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        gender: formData.gender,
        aadhaar: formData.aadhaar,
        address: formData.address,
        photoURL
      });

      if (res.data.success) {
        toast.success('Admission profile saved! 🎉');
        // Update user state session
        const updatedUser = res.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setPhotoFile(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const getLabelClass = (value, isFocused, hasIcon = true, isTextarea = false) => {
    if (value || isFocused) {
      return `absolute left-4 -top-2.5 text-[9px] font-black text-[#4F46E5] bg-white px-1.5 uppercase tracking-wider transition-all duration-200 pointer-events-none z-10`;
    }
    const leftPadding = hasIcon ? 'left-11' : 'left-4';
    const topClass = isTextarea ? 'top-3.5' : 'top-1/2 -translate-y-1/2';
    return `absolute ${leftPadding} ${topClass} text-slate-400 text-xs font-bold transition-all duration-200 pointer-events-none z-10`;
  };

  // Evaluate profile completion percentage
  const getCompletionStats = () => {
    const fields = [
      formData.fullName,
      formData.phone,
      formData.fatherName,
      formData.motherName,
      formData.dob,
      formData.gender,
      formData.aadhaar,
      formData.address,
      photoPreview
    ];
    const completed = fields.filter(Boolean).length;
    const percentage = Math.round((completed / fields.length) * 100);
    return { completed, total: fields.length, percentage };
  };

  const stats = getCompletionStats();
  const isProfileComplete = stats.percentage === 100;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - ID preview and quick stats */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Clickable Photo Circle */}
            <div 
              className="relative w-28 h-28 rounded-full cursor-pointer group mb-4 border-4 border-slate-50 shadow-inner"
              onClick={() => fileInputRef.current.click()}
            >
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Student Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[8px] font-black uppercase tracking-wider">
                <Camera className="w-5 h-5 mb-1 animate-pulse" />
                Upload Photo
              </div>
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              className="hidden" 
            />

            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide leading-tight">{currentUser?.name || 'Student'}</h3>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-widest">{currentUser?.email || ''}</p>

            {/* Completion Meter */}
            <div className="w-full mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Profile Completed</span>
                <span className={`text-[10px] font-black ${isProfileComplete ? 'text-emerald-600' : 'text-primary-600'}`}>{stats.percentage}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${isProfileComplete ? 'from-emerald-500 to-emerald-600' : 'from-primary-500 to-indigo-500'}`}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
              <p className="text-[8.5px] font-bold text-slate-400 mt-2.5 uppercase tracking-wide leading-relaxed">
                {isProfileComplete ? 'Your student profile is fully verified!' : `${stats.total - stats.completed} fields remaining to complete activation.`}
              </p>
            </div>

            {/* Preview ID Card CTA */}
            <button
              onClick={() => {
                if (!isProfileComplete) {
                  toast.error('Complete all profile fields to unlock your student card! 🔒');
                  return;
                }
                setIsIdCardOpen(true);
              }}
              className={`w-full mt-5 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                isProfileComplete 
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md border-transparent hover:scale-[1.02]' 
                  : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              View Student ID Card
            </button>
          </div>
          
        </div>

        {/* Right Column - Admission profile edits */}
        <div className="lg:col-span-2">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm"
          >
            <div>
              <h3 className="text-xs font-black text-[#4F46E5] uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#4F46E5]" /> 
                Student Admission Record
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <input 
                  type="text" 
                  name="fullName" 
                  required
                  value={formData.fullName} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold"
                />
                <label className={getLabelClass(formData.fullName, focusedField === 'fullName')}>
                  Student Full Name *
                </label>
              </div>

              {/* Phone Number */}
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <input 
                  type="tel" 
                  name="phone" 
                  required
                  maxLength={10}
                  value={formData.phone} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold"
                />
                <label className={getLabelClass(formData.phone, focusedField === 'phone')}>
                  Enter Phone Number *
                </label>
              </div>

              {/* Father's Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <input 
                  type="text" 
                  name="fatherName" 
                  required
                  value={formData.fatherName} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('fatherName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold"
                />
                <label className={getLabelClass(formData.fatherName, focusedField === 'fatherName')}>
                  Father's Name *
                </label>
              </div>

              {/* Mother's Name */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <input 
                  type="text" 
                  name="motherName" 
                  required
                  value={formData.motherName} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('motherName')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold"
                />
                <label className={getLabelClass(formData.motherName, focusedField === 'motherName')}>
                  Mother's Name *
                </label>
              </div>

              {/* DOB */}
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors pointer-events-none" />
                <input 
                  type="date" 
                  name="dob" 
                  required
                  value={formData.dob} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('dob')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold cursor-pointer"
                />
                <label className={getLabelClass(formData.dob, focusedField === 'dob')}>
                  Date of Birth *
                </label>
              </div>

              {/* Gender */}
              <div className="relative group">
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 pointer-events-none z-10" />
                <select 
                  name="gender" 
                  required
                  value={formData.gender} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('gender')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-4 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none appearance-none cursor-pointer relative font-semibold"
                >
                  <option value=""></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className={getLabelClass(formData.gender, focusedField === 'gender', false)}>
                  Select Gender *
                </label>
              </div>

              {/* Aadhaar Number */}
              <div className="relative group md:col-span-2">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <input 
                  type="text" 
                  name="aadhaar" 
                  required
                  maxLength={12}
                  value={formData.aadhaar} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('aadhaar')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none font-semibold"
                />
                <label className={getLabelClass(formData.aadhaar, focusedField === 'aadhaar')}>
                  Aadhaar Number (12 Digits) *
                </label>
              </div>

              {/* Full Address */}
              <div className="relative group md:col-span-2">
                <MapPin className="absolute left-4 top-3.5 h-4 h-4 text-slate-400 group-focus-within:text-[#4F46E5] transition-colors" />
                <textarea 
                  name="address" 
                  required
                  rows={2}
                  value={formData.address} 
                  onChange={handleChange}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] text-xs focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all outline-none resize-none font-semibold"
                />
                <label className={getLabelClass(formData.address, focusedField === 'address', true, true)}>
                  Full Permanent Address *
                </label>
              </div>

            </div>

            {/* Read-only school details */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Institutional Enrollment Information (Read Only)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Registered Course</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{courseName}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Enrollment Roll No.</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{currentUser?.rollNumber || 'Not Assigned Yet'}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">Institute Center</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{currentUser?.instituteName || 'Default Center'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdating}
                className="px-6 py-3.5 bg-[#4F46E5] hover:bg-[#3B32B3] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md shadow-[#4F46E5]/20 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Dynamic ID Card Print Modal Overlay */}
      {isIdCardOpen && (
        <IDCard 
          student={{
            ...currentUser,
            name: currentUser?.name || '',
            course: courseName
          }}
          onClose={() => setIsIdCardOpen(false)}
        />
      )}

    </div>
  );
}
