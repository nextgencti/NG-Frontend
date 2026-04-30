import React, { useState, useEffect } from 'react';
import { X, ClipboardList, BookOpen, Clock, Hash, BarChart2, Calendar, AlignLeft, Upload, FileText, Download } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const initialForm = {
  title: '',
  course: '',
  date: '',
  time: '',
  duration: '',
  totalMarks: '',
  questions: '',
  difficulty: 'Easy',
  description: '',
  type: 'Live',
};

export default function AddTestModal({ isOpen, onClose, onTestAdded }) {
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCourses, setIsFetchingCourses] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    setIsFetchingCourses(true);
    try {
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setIsFetchingCourses(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
    } else {
      toast.error('Please select a valid CSV file.');
      e.target.value = null;
    }
  };

  const handleDownloadSample = () => {
    // Creating a dummy CSV link since the file is on the server
    const csvContent = "question,option_a,option_b,option_c,option_d,correct_answer,marks\nWhat does HTML stand for?,HyperText Markup Language,High Tech Markup Language,HyperText Machine Language,HyperTransfer Markup Language,A,2";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.csv';
    a.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.course || !form.duration) {
      toast.error('Please fill in required fields (Title, Course, Duration).');
      return;
    }
    if (form.type === 'Live' && (!form.date || !form.time)) {
      toast.error('Date and Time are required for Live tests.');
      return;
    }
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      
      if (csvFile) {
        formData.append('questionsCSV', csvFile);
      }

      const response = await api.post('/admin/tests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        onTestAdded(response.data.test);
        toast.success(response.data.message || 'Test added successfully! 🎉');
        setForm(initialForm);
        setCsvFile(null);
        onClose();
      }
    } catch (error) {
      console.error('Error adding test:', error);
      toast.error(error.response?.data?.message || 'Failed to add test');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 pt-6 pb-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/10">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Add New Test</h3>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest mt-0.5 uppercase">Schedule a new examination for students</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Test Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Test Title <span className="text-rose-500">*</span></label>
            <div className="relative group">
              <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                name="title" required value={form.title} onChange={handleChange}
                placeholder="e.g. JavaScript Fundamentals Quiz"
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 placeholder:uppercase"
              />
            </div>
          </div>

          {/* Course */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Course <span className="text-rose-500">*</span></label>
            <div className="relative group">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <select
                name="course" required value={form.course} onChange={handleChange}
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all appearance-none cursor-pointer disabled:opacity-50 uppercase font-bold"
                disabled={isFetchingCourses}
              >
                <option value="">{isFetchingCourses ? 'Loading courses...' : 'Select a course'}</option>
                {courses.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Test Type */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Test Type <span className="text-rose-500">*</span></label>
            <div className="flex gap-3">
              {['Live', 'Practice'].map(t => (
                <label key={t} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] border cursor-pointer transition-all ${
                  form.type === t 
                    ? 'border-primary-600 bg-primary-50 text-primary-600 font-bold shadow-lg shadow-primary-600/5' 
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                  <input
                    type="radio" name="type" className="hidden"
                    checked={form.type === t}
                    onChange={() => setForm({ ...form, type: t })}
                  />
                  <span className="text-[10px] uppercase tracking-widest">{t} Test</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date & Time (Only for Live) */}
          {form.type === 'Live' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Test Date <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="date" name="date" required value={form.date} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Start Time <span className="text-rose-500">*</span></label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  <input
                    type="time" name="time" required value={form.time} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Duration, Marks, Questions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Duration</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  name="duration" required value={form.duration} onChange={handleChange}
                  placeholder="45 min"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-[12px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Marks</label>
              <div className="relative group">
                <BarChart2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="number" name="totalMarks" required min="1" value={form.totalMarks} onChange={handleChange}
                  placeholder="100"
                  className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-[12px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Questions</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="number" name="questions" required min="1" value={form.questions} onChange={handleChange}
                  placeholder="40"
                  className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-[12px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Difficulty Level</label>
            <div className="flex gap-3">
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d} type="button"
                  onClick={() => setForm({ ...form, difficulty: d })}
                  className={`flex-1 py-2.5 rounded-[12px] text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    form.difficulty === d
                      ? d === 'Easy' ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : d === 'Medium' ? 'border-amber-500 bg-amber-50 text-amber-600'
                        : 'border-rose-500 bg-rose-50 text-rose-600'
                      : 'border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description <span className="text-slate-500 font-normal lowercase">(optional)</span></label>
            <div className="relative group">
              <AlignLeft className="absolute left-4 top-3 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <textarea
                name="description" rows="2" value={form.description} onChange={handleChange}
                placeholder="Brief details about this test..."
                className="w-full pl-11 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-[14px] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* CSV Upload */}
          <div className="p-5 bg-slate-50 rounded-[20px] border border-dashed border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question CSV File</span>
              </div>
              <button 
                type="button"
                onClick={handleDownloadSample}
                className="text-[9px] font-bold text-slate-600 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all border border-slate-200 shadow-sm"
              >
                <Download className="w-3 h-3 text-emerald-600" /> SAMPLE
              </button>
            </div>
            
            <div className="relative group">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${
                csvFile ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 group-hover:border-primary-500/30'
              }`}>
                {csvFile ? (
                  <>
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{csvFile.name}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setCsvFile(null); }} className="text-[9px] text-rose-600 font-bold uppercase tracking-widest hover:text-rose-500">Remove</button>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary-500/50 transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click or drag CSV to upload</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary-600/10 transition-all disabled:opacity-30 active:scale-95"
            >
              {isLoading ? 'Processing...' : 'Add Test'}
            </button>
          </div>
        </form>
      </div>
    </div>


  );
}
