import React, { useState, useEffect } from 'react';
import { X, Upload, User, Mail, Phone, BookOpen, MapPin, Calendar, CreditCard, Clock, FileText, Printer, Users, IndianRupee, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { printAdmissionForm } from '../../utils/printHelper';

export default function AddStudentModal({ isOpen, onClose, onStudentAdded, student = null }) {
  const { currentUser } = useAuth();
  
  const getLocalDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    courseId: '',
    address: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: '',
    aadhaar: '',
    batchTiming: '',
    admissionDate: getLocalDateString(),
    totalFee: '',
    feePaid: '',
    paymentMode: '',
    admissionTakenBy: currentUser?.name || currentUser?.fullName || '',
    receiptNumber: '',
    feeModel: 'fixed',
    password: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  const generateRandomPassword = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `NG@${randomDigits}`;
  };

  const getLabelClass = (value, isFocused, hasIcon = true) => {
    if (value || isFocused) {
      return `absolute left-4 -top-2.5 text-[9px] font-black text-[#4F46E5] bg-white px-1.5 uppercase tracking-wider transition-all duration-200 pointer-events-none z-10`;
    }
    const leftPadding = hasIcon ? 'left-11' : 'left-4';
    return `absolute ${leftPadding} top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold transition-all duration-200 pointer-events-none z-10`;
  };

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
      
      if (student) {
        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          courseId: student.courseId || student.course || '',
          address: student.address || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          dob: student.dob || '',
          gender: student.gender || '',
          aadhaar: student.aadhaar || '',
          batchTiming: student.batchTiming || '',
          admissionDate: student.admissionDate || getLocalDateString(),
          totalFee: student.totalFee || '',
          feePaid: student.feePaid || '',
          paymentMode: student.paymentMode || '',
          admissionTakenBy: student.admissionTakenBy || currentUser?.name || currentUser?.fullName || '',
          receiptNumber: student.receiptNumber || '',
          feeModel: student.feeModel || 'fixed',
          password: student.password || ''
        });
        setPreviewUrl(student.photoURL || null);
      } else {
        // Reset form to default on open and auto-generate password
        setFormData({
          ...initialFormState,
          admissionTakenBy: currentUser?.name || currentUser?.fullName || '',
          password: generateRandomPassword()
        });
        setPreviewUrl(null);
      }
      setProfilePic(null);
    }
  }, [isOpen, currentUser, student]);

  if (!isOpen) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selectedCourseObj = courses.find(c => c.id === courseId);
    
    let defaultFeeModel = 'fixed';
    let defaultFee = '';
    
    if (selectedCourseObj) {
      if (selectedCourseObj.courseFeeType === 'monthly') {
        defaultFeeModel = 'monthly';
        defaultFee = selectedCourseObj.monthlyFee || '';
      } else {
        defaultFeeModel = 'fixed';
        defaultFee = selectedCourseObj.fixedFee || selectedCourseObj.fees || '';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      courseId,
      feeModel: defaultFeeModel,
      totalFee: defaultFee
    }));
  };

  const handleFeeModelChange = (e) => {
    const feeModel = e.target.value;
    const selectedCourseObj = courses.find(c => c.id === formData.courseId);
    let fee = '';
    
    if (selectedCourseObj) {
      if (feeModel === 'monthly') {
        fee = selectedCourseObj.monthlyFee || '';
      } else {
        fee = selectedCourseObj.fixedFee || selectedCourseObj.fees || '';
      }
    }
    
    setFormData(prev => ({
      ...prev,
      feeModel,
      totalFee: fee
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    const selectedCourseObj = courses.find(c => c.id === formData.courseId);
    const courseName = selectedCourseObj ? selectedCourseObj.name : '';
    
    // Inject local preview image if uploaded but not saved yet
    const printData = {
      ...formData,
      photoURL: previewUrl || null
    };
    printAdmissionForm(printData, courseName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });
    
    if (profilePic) {
      submitData.append('profilePic', profilePic);
    }

    try {
      let response;
      if (student) {
        response = await api.put(`/admin/students/${student.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(response.data.message);
        onStudentAdded(response.data.student, true);
      } else {
        response = await api.post('/admin/students', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(response.data.message);
        onStudentAdded(response.data.student, false);
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${student ? 'update' : 'add'} student`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center relative z-10 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {student ? 'Edit Student Profile' : 'Student Admission Form'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">
              {student ? 'Modify existing student institutional details' : 'Enroll and register a new student'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left & Middle Column (Form Fields) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-primary-600 tracking-wider uppercase border-b border-slate-100 pb-1">1. Student Personal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formData.name} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.name, focusedField === 'name')}>
                      Full Name *
                    </label>
                  </div>
                  
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.email, focusedField === 'email')}>
                      Email Address *
                    </label>
                  </div>

                  <div className="relative group flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-accent-500/20 transition-all">
                    <div className="flex-1 relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                      <input 
                        type="text" 
                        name="password" 
                        required 
                        value={formData.password} 
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-11 pr-12 py-3 bg-transparent border-none text-xs text-slate-900 focus:outline-none font-semibold" 
                      />
                      <label className={getLabelClass(formData.password, focusedField === 'password')}>
                        Login Password *
                      </label>
                    </div>
                    {!student && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, password: generateRandomPassword() }))}
                        className="mr-3 px-2.5 py-1 text-[9px] font-black text-[#4F46E5] hover:text-[#3B32B3] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm shrink-0 uppercase tracking-widest active:scale-95 cursor-pointer"
                        title="Regenerate Password"
                      >
                        Auto
                      </button>
                    )}
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      value={formData.phone} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.phone, focusedField === 'phone')}>
                      Phone Number *
                    </label>
                  </div>

                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="text" 
                      name="fatherName" 
                      value={formData.fatherName} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('fatherName')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.fatherName, focusedField === 'fatherName')}>
                      Father's Name
                    </label>
                  </div>

                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="text" 
                      name="motherName" 
                      value={formData.motherName} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('motherName')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.motherName, focusedField === 'motherName')}>
                      Mother's Name
                    </label>
                  </div>

                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                    <input 
                      type="date" 
                      name="dob" 
                      value={formData.dob} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('dob')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.dob, focusedField === 'dob')}>
                      Date of Birth
                    </label>
                  </div>

                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('gender')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold cursor-pointer appearance-none"
                    >
                      <option value=""></option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <label className={getLabelClass(formData.gender, focusedField === 'gender')}>
                      Select Gender
                    </label>
                  </div>

                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="text" 
                      name="aadhaar" 
                      maxLength="12" 
                      value={formData.aadhaar} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('aadhaar')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.aadhaar, focusedField === 'aadhaar')}>
                      Aadhaar Number
                    </label>
                  </div>
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                  <textarea 
                    name="address" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    onFocus={() => setFocusedField('address')}
                    onBlur={() => setFocusedField(null)}
                    rows="2" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold resize-none" 
                  />
                  <label className={getLabelClass(formData.address, focusedField === 'address', true)}>
                    Student Address *
                  </label>
                </div>
              </div>

              {/* Course Details Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-primary-600 tracking-wider uppercase border-b border-slate-100 pb-1">2. Course Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                    <select 
                      name="courseId" 
                      required 
                      value={formData.courseId} 
                      onChange={handleCourseChange} 
                      onFocus={() => setFocusedField('courseId')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold cursor-pointer appearance-none"
                    >
                      <option value=""></option>
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
                    <label className={getLabelClass(formData.courseId, focusedField === 'courseId')}>
                      Select Course *
                    </label>
                  </div>

                  {/* Fee structure model selector based on course definition */}
                  {(() => {
                    const selectedCourse = courses.find(c => c.id === formData.courseId);
                    if (!selectedCourse) {
                      return (
                        <div className="relative group" key="fee-model-empty">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input 
                            type="text" 
                            disabled 
                            value=""
                            readOnly
                            className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold cursor-not-allowed placeholder:text-slate-400" 
                          />
                          <label className="absolute left-11 top-1 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                            Fee Installment Model
                          </label>
                        </div>
                      );
                    }

                    if (selectedCourse.courseFeeType === 'both') {
                      return (
                        <div className="relative group" key="fee-model-select">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                          <select 
                            name="feeModel" 
                            value={formData.feeModel} 
                            onChange={handleFeeModelChange} 
                            onFocus={() => setFocusedField('feeModel')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold cursor-pointer appearance-none"
                          >
                            <option value="fixed">Full Fixed Fee (Rs. {selectedCourse.fixedFee})</option>
                            <option value="monthly">Monthly Installment (Rs. {selectedCourse.monthlyFee})</option>
                          </select>
                          <label className={getLabelClass(formData.feeModel, focusedField === 'feeModel')}>
                            Fee Installment Model
                          </label>
                        </div>
                      );
                    }

                    const isMonthlyOnly = selectedCourse.courseFeeType === 'monthly';
                    return (
                      <div className="relative group" key="fee-model-disabled">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          type="text" 
                          disabled 
                          value={isMonthlyOnly ? `Monthly Installment Only (Rs. ${selectedCourse.monthlyFee})` : `Fixed Total Fee Only (Rs. ${selectedCourse.fixedFee || selectedCourse.fees})`}
                          readOnly
                          className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold cursor-not-allowed" 
                        />
                        <label className="absolute left-11 top-1 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                          Fee Installment Model
                        </label>
                      </div>
                    );
                  })()}

                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="text" 
                      name="batchTiming" 
                      value={formData.batchTiming} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('batchTiming')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.batchTiming, focusedField === 'batchTiming')}>
                      Batch Timing (e.g. 10:00 AM)
                    </label>
                  </div>

                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                    <input 
                      type="date" 
                      name="admissionDate" 
                      required 
                      value={formData.admissionDate} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('admissionDate')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.admissionDate, focusedField === 'admissionDate')}>
                      Admission Date
                    </label>
                  </div>

                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="number" 
                      name="totalFee" 
                      value={formData.totalFee} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('totalFee')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.totalFee, focusedField === 'totalFee')}>
                      Total Course Fee
                    </label>
                  </div>

                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
                    <input 
                      type="number" 
                      name="feePaid" 
                      value={formData.feePaid} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('feePaid')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.feePaid, focusedField === 'feePaid')}>
                      Fee Paid
                    </label>
                  </div>

                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                    <select 
                      name="paymentMode" 
                      value={formData.paymentMode} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('paymentMode')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold cursor-pointer appearance-none"
                    >
                      <option value=""></option>
                      <option value="Cash">Cash</option>
                      <option value="Online">Online</option>
                    </select>
                    <label className={getLabelClass(formData.paymentMode, focusedField === 'paymentMode')}>
                      Select Payment Mode
                    </label>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Right Column (Photo & Office Details) */}
            <div className="space-y-6">
              
              {/* Photo Upload Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Student Profile Picture</h4>
                
                <div className="relative w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group hover:border-accent-500/50 transition-all cursor-pointer shadow-inner">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-300 group-hover:scale-110 transition-transform" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <input type="file" required={!student} accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
                <p className="text-[9px] text-slate-400 mt-3 text-center">Click block to upload photo.<br/>Supports JPG, PNG (Max 2MB).</p>
              </div>

              {/* Office Use Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-primary-600 tracking-wider uppercase border-b border-slate-100 pb-1">3. Office Use Only</h3>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent-600 transition-colors pointer-events-none" />
                    <input 
                      type="text" 
                      name="admissionTakenBy" 
                      value={formData.admissionTakenBy} 
                      onChange={handleChange} 
                      onFocus={() => setFocusedField('admissionTakenBy')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent-500/20 transition-all font-semibold" 
                    />
                    <label className={getLabelClass(formData.admissionTakenBy, focusedField === 'admissionTakenBy')}>
                      Admission Taken By
                    </label>
                  </div>

                  <div className="relative group">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input 
                      type="text" 
                      disabled 
                      value={formData.receiptNumber} 
                      readOnly
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold cursor-not-allowed" 
                    />
                    <label className="absolute left-11 top-1 text-[8px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                      Receipt Number (Auto-Generated)
                    </label>
                  </div>
                </div>
              </div>

              {/* Declaration Text Box */}
              <div className="text-[10px] text-slate-400 border border-slate-100 rounded-xl p-3 bg-slate-50/50 leading-relaxed">
                <span className="font-extrabold text-slate-500 uppercase block mb-1">Declaration:</span>
                I hereby declare that the information provided above is true to the best of my knowledge. I shall follow all the rules and regulations of the institute.
              </div>

            </div>
          </div>
          
          {/* Modal Action Buttons Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm">
              Cancel
            </button>
            <button type="button" onClick={handlePrint} className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-primary-700 hover:text-primary-800 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-sm border border-indigo-100">
              <Printer className="w-3.5 h-3.5" /> Print Form
            </button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-accent-600/10 transition-all flex justify-center items-center gap-2 active:scale-95">
              {loading ? <span className="animate-pulse">Saving...</span> : student ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
