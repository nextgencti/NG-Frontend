import React, { useState, useEffect } from 'react';
import { X, Award, Trash, Plus, Loader2, Calendar, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function ManageCertificatesModal({ isOpen, onClose, student, courses = [] }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState(null);

  // Fetch student certificates
  const fetchCertificates = async () => {
    if (!student) return;
    setLoading(true);
    try {
      const response = await api.get(`/superadmin/students/${student.id}/certificates`);
      if (response.data.success) {
        setCertificates(response.data.certificates || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      fetchCertificates();
      // Set default selected course from student's enrolled course
      if (student.courseId) {
        setSelectedCourseId(student.courseId);
      } else if (student.course) {
        // Fallback for names
        const matchingCourse = courses.find(c => c.name === student.course || c.id === student.course);
        if (matchingCourse) {
          setSelectedCourseId(matchingCourse.id);
        }
      }
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) {
      toast.error('Please enter a certificate title');
      return;
    }
    if (!file) {
      toast.error('Please select a certificate file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('issueDate', issueDate);
    formData.append('file', file);
    
    if (selectedCourseId) {
      formData.append('courseId', selectedCourseId);
      const course = courses.find(c => c.id === selectedCourseId);
      if (course) {
        formData.append('courseName', course.name);
      }
    }

    try {
      const response = await api.post(`/superadmin/students/${student.id}/certificates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Certificate awarded successfully');
        setTitle('');
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('cert-file-input');
        if (fileInput) fileInput.value = '';
        fetchCertificates();
      }
    } catch (error) {
      console.error('Upload certificate error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/superadmin/certificates/${certificateId}`);
      if (response.data.success) {
        toast.success('Certificate deleted successfully');
        setCertificates(prev => prev.filter(c => c.id !== certificateId));
      }
    } catch (error) {
      console.error('Delete certificate error:', error);
      toast.error('Failed to delete certificate');
    }
  };

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-[24px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[600px]">
        
        {/* Left Section: Existing Certificates list */}
        <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-1/2 md:h-full bg-slate-50/20">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Awarded Certificates
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{student.name} • {student.rollNumber}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3.5 scrollbar-hide">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
              </div>
            ) : certificates.length > 0 ? (
              certificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-xs flex items-center justify-between group hover:border-slate-200 transition-all">
                  <div className="min-w-0 flex-1 pr-3">
                    <h4 className="text-xs font-extrabold text-slate-800 truncate uppercase tracking-wide">{cert.title}</h4>
                    {cert.courseName && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">{cert.courseName}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-350" /> {getFormattedDate(cert.issueDate)}</span>
                      <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-mono text-[8px] truncate">ID: {cert.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a 
                      href={cert.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-50 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-lg transition-all"
                      title="View Certificate"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button 
                      onClick={() => handleDelete(cert.id)}
                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                      title="Delete Certificate"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <h5 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">No Certificates</h5>
                <p className="text-slate-400 text-[10px] max-w-[180px] mt-0.5">Use the form to award the first credential to this student.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Award New Certificate Form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col h-1/2 md:h-full justify-between">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 shrink-0">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary-500" /> Award Certificate
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Super Admin privileges required</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleUpload} className="flex-1 py-5 space-y-4 overflow-y-auto scrollbar-hide">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Certificate Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Course on Computer Concepts (CCC)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all outline-none shadow-xs font-semibold"
              />
            </div>

            {/* Course Select */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Select Course Scope</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-primary-500 rounded-xl text-xs text-slate-600 focus:outline-none cursor-pointer outline-none shadow-xs font-semibold"
              >
                <option value="">Select Course Scope (Optional)</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Issue Date</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 rounded-xl text-xs text-slate-900 transition-all outline-none shadow-xs font-semibold"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Upload PDF or Image File</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4.5 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all relative">
                <input
                  type="file"
                  id="cert-file-input"
                  required
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-1 relative z-0">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wide">
                    {file ? file.name : 'Choose file...'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">PDF, JPG, PNG (Max 10MB)</p>
                </div>
              </div>
            </div>
          </form>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !title || !file}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> Award & Upload
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
