import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import { 
  Plus, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Edit2, 
  PlusCircle, 
  PlayCircle,
  FileIcon,
  ArrowLeft,
  CheckCircle, 
  X,
  Eye,
  Pencil,
  Save,
  Link2, 
  Loader2, 
  Upload, 
  Video,
  ClipboardList,
  CloudUpload,
  Image
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [savedCurriculumJson, setSavedCurriculumJson] = useState('[]');
  const [loading, setLoading] = useState(true);

  const isDirty = JSON.stringify(modules) !== savedCurriculumJson;

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm("You have unpublished changes. Are you sure you want to leave without publishing?")) {
        navigate('/admin/courses');
      }
    } else {
      navigate('/admin/courses');
    }
  };

  // Browser-level event blocker for reloads, tab closure, and external link clicks
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required standard for modern browser compatibility
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Topic Modal States
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [availableTests, setAvailableTests] = useState([]);

  // Lesson Modal States
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video',
    url: '',
    duration: '',
    content: '',
    testId: ''
  });

  // Preview Modal States
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);

  // Jodit Editor Configuration with Cloudinary Upload
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Write your professional notes here...',
    height: 400,
    toolbarButtonSize: 'middle',
    buttons: [
      'source', '|',
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', '|',
      'fullsize', 'print'
    ],
    uploader: {
      url: `${import.meta.env.VITE_API_URL}/admin/upload-content-image`,
      format: 'json',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      isSuccess: (resp) => resp.success,
      process: (resp) => ({
        files: [resp.url],
        path: resp.url,
        error: resp.success ? 0 : 1,
        msg: resp.message
      }),
      defaultHandlerSuccess: function (data) {
        this.selection.insertImage(data.files[0]);
        toast.success("Image uploaded to cloud");
      }
    },
    events: {
      beforeUpload: () => {
        setIsUploading(true);
        toast.loading("Uploading image...", { id: 'editor-upload' });
      },
      afterUpload: () => {
        setIsUploading(false);
        toast.dismiss('editor-upload');
      },
      error: (e) => {
        setIsUploading(false);
        toast.dismiss('editor-upload');
        toast.error("Upload failed");
      }
    }
  }), []);

  useEffect(() => {
    fetchCourseAndContent();
    fetchAvailableTests();
  }, [courseId]);

  const fetchAvailableTests = async () => {
    try {
      const res = await api.get('/admin/tests');
      if (res.data.success) {
        setAvailableTests(res.data.tests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchCourseAndContent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/courses');
      const foundCourse = response.data.courses.find(c => c.id === courseId);
      setCourse(foundCourse);
      const curriculum = foundCourse?.curriculum || [];
      setModules(curriculum);
      setSavedCurriculumJson(JSON.stringify(curriculum));
    } catch (error) {
      toast.error('Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is greater than 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10 MB');
      e.target.value = null; // Reset the file input
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await api.post('/admin/upload-content-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewLesson(prev => ({ ...prev, url: response.data.url }));
      toast.success('Resource uploaded to cloud!', { id: toastId });
    } catch (error) {
      toast.error('Upload failed. Please check file type.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const toastId = toast.loading("Publishing curriculum...");
    try {
      await api.put(`/admin/courses/${courseId}/curriculum`, {
        curriculum: modules
      });
      setSavedCurriculumJson(JSON.stringify(modules));
      toast.success('Course updated successfully!', { id: toastId });
    } catch (error) {
      toast.error('Failed to publish changes.', { id: toastId });
    } finally {
      setIsPublishing(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    const newModule = { id: Date.now().toString(), title: newTopicTitle, lessons: [] };
    setModules([...modules, newModule]);
    setNewTopicTitle('');
    setIsTopicModalOpen(false);
    toast.success('Topic added');
  };

  const handleOpenLessonModal = (moduleId, lesson = null) => {
    setActiveModuleId(moduleId);
    if (lesson) {
      setEditingLessonId(lesson.id);
      setNewLesson({ ...lesson });
    } else {
      setEditingLessonId(null);
      setNewLesson({ title: '', type: 'video', url: '', duration: '', content: '', testId: '' });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e) => {
    if (e) e.preventDefault();
    if (!newLesson.title.trim()) { toast.error('Please enter a lesson title'); return; }

    const updatedModules = modules.map(m => {
      if (m.id === activeModuleId) {
        if (editingLessonId) {
          return { ...m, lessons: m.lessons.map(l => l.id === editingLessonId ? { ...newLesson } : l) };
        } else {
          return { ...m, lessons: [...m.lessons, { ...newLesson, id: Date.now().toString() }] };
        }
      }
      return m;
    });

    setModules(updatedModules);
    setIsLessonModalOpen(false);
    setEditingLessonId(null);
    toast.success(editingLessonId ? 'Lesson updated' : 'Lesson added');
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    if (window.confirm('Delete this lesson?')) {
      setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m));
      toast.success('Lesson removed');
    }
  };

  const handlePreviewLesson = (lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#F1F5F9] border-t-[#4F46E5] animate-spin"></div>
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-widest">Initialising Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10 relative">
      {/* Cloud Status Indicator - Sticky to stay centered in content area */}
      <div className="sticky top-2 z-[60] flex justify-center mb-4">
        <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#E5E7EB] shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"></div>
            <span className="text-[11px] font-bold tracking-wider uppercase">Direct Cloud Access</span>
          </div>
          <div className="w-px h-3 bg-[#E5E7EB]"></div>
          <p className="text-[11px] text-[#6B7280] font-medium">Changes sync instantly after publishing</p>
        </div>
      </div>

      {/* Uploading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 z-[200] bg-white/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="bg-white p-5 rounded-[20px] shadow-2xl border border-[#E5E7EB] flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-[#F1F5F9] border-t-primary-600 animate-spin"></div>
              <CloudUpload className="absolute inset-0 m-auto w-5 h-5 text-primary-600" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-bold text-[#111827]">Uploading Asset...</p>
              <p className="text-[11px] text-[#6B7280] font-medium">Processing on Cloudinary</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-1">
        <button onClick={handleBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-primary-600 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">{course?.name}</h2>
          <p className="text-[#6B7280] text-[13px] font-medium tracking-wide">Course Curriculum Authoring</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center bg-white px-5 py-3 rounded-[16px] border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-8 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.05em]">Topics</span>
            <span className="text-[18px] font-bold text-[#111827]">{modules.length}</span>
          </div>
          <div className="w-px h-8 bg-[#F1F5F9]"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.05em]">Lessons</span>
            <span className="text-[18px] font-bold text-[#111827]">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => setIsTopicModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-[10px] text-[13px] font-bold hover:bg-[#F8FAFC] transition-all">
            <Plus className="w-4 h-4" /> Add Topic
          </button>
          <button onClick={handlePublish} disabled={isPublishing || isUploading} className="flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-[10px] text-[13px] font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/10 disabled:opacity-50">
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-4">
        {modules.map((module, mIndex) => (
          <div key={module.id} className="bg-white rounded-[16px] border border-[#E5E7EB] shadow-sm overflow-hidden group">
            <div className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${expandedModules[module.id] ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'}`} onClick={() => toggleModule(module.id)}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[13px] font-bold text-[#4F46E5]">{mIndex + 1}</div>
                <div>
                  <h3 className="font-bold text-[#111827] text-[16px] tracking-tight">{module.title}</h3>
                  <p className="text-[12px] text-[#6B7280] font-semibold">{module.lessons.length} Lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 text-[#94A3B8] hover:text-[#4F46E5] hover:bg-white rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                <button className="p-2.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                <div className="w-px h-6 bg-[#E5E7EB] mx-1"></div>
                {expandedModules[module.id] ? <ChevronUp className="w-5 h-5 text-[#6B7280]" /> : <ChevronDown className="w-5 h-5 text-[#6B7280]" />}
              </div>
            </div>

            {expandedModules[module.id] && (
              <div className="border-t border-[#F1F5F9] bg-[#FFFFFF] divide-y divide-[#F1F5F9]">
                {module.lessons.map((lesson, lIndex) => (
                  <div key={lesson.id} className="p-3.5 pl-14 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors group/lesson">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[10px] font-bold text-[#6B7280] group-hover/lesson:bg-primary-50 group-hover/lesson:text-primary-600 transition-colors">{lIndex + 1}</div>
                      {lesson.type === 'video' ? <PlayCircle className="w-4 h-4 text-primary-500" /> : 
                       lesson.type === 'test' ? <ClipboardList className="w-4 h-4 text-rose-500" /> :
                       lesson.type === 'note' ? <FileText className="w-4 h-4 text-amber-500" /> : 
                       <FileIcon className="w-4 h-4 text-sky-500" />}
                      <div>
                        <p className="text-[13px] font-bold text-[#374151] group-hover/lesson:text-[#111827] transition-colors">{lesson.title}</p>
                        <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                          {lesson.type === 'test' ? 'Examination' : (lesson.duration || (lesson.type === 'note' ? 'Reading' : 'File'))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                      <button onClick={() => handlePreviewLesson(lesson)} className="p-1.5 text-[#6B7280] hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#E5E7EB]"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleOpenLessonModal(module.id, lesson)} className="p-1.5 text-[#6B7280] hover:text-primary-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#E5E7EB]"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteLesson(module.id, lesson.id)} className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#E5E7EB]"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleOpenLessonModal(module.id)} className="w-full p-3.5 pl-14 flex items-center gap-2 text-[12px] font-bold text-primary-600 hover:bg-primary-50/40 transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" /> Add Lesson to this Topic
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] w-full max-w-4xl shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[94vh]">
            <div className="p-5 border-b border-[#F1F5F9] flex justify-between items-center shrink-0 bg-[#F8FAFC]">
              <h3 className="text-[17px] font-bold text-[#111827]">{editingLessonId ? 'Modify Lesson' : 'New Lesson'}</h3>
              <button onClick={() => setIsLessonModalOpen(false)} className="text-[#94A3B8] hover:text-[#111827]"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Lesson Title</label>
                <input autoFocus type="text" required value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} placeholder="e.g. Master React Hooks" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] text-[14px] outline-none focus:ring-4 focus:ring-primary-600/5 transition-all" />
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Type</label>
                  <select value={newLesson.type} onChange={(e) => setNewLesson({...newLesson, type: e.target.value})} className="w-full px-3 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] text-[14px] outline-none cursor-pointer">
                    <option value="video">🎥 Video</option>
                    <option value="pdf">📄 PDF Doc</option>
                    <option value="image">🖼️ Image (PNG, JPG)</option>
                    <option value="note">📝 Text Note</option>
                    <option value="test">📝 Test / Exam</option>
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">{newLesson.type === 'note' ? 'Reading Time' : 'Duration'}</label>
                  <input type="text" value={newLesson.duration} onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})} placeholder="e.g. 15 mins" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] text-[14px] outline-none focus:ring-4 focus:ring-primary-600/5 transition-all" />
                </div>
              </div>

              {newLesson.type === 'test' ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Select Test from Library</label>
                  <select 
                    value={newLesson.testId} 
                    onChange={(e) => {
                      const selectedTest = availableTests.find(t => t.id === e.target.value);
                      setNewLesson({
                        ...newLesson, 
                        testId: e.target.value,
                        title: selectedTest ? selectedTest.title : newLesson.title
                      });
                    }} 
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[12px] text-[14px] outline-none cursor-pointer"
                  >
                    <option value="">-- Choose a Test --</option>
                    {availableTests.map(t => (
                      <option key={t.id} value={t.id}>{t.title} ({t.questions} Qs)</option>
                    ))}
                  </select>
                  {availableTests.length === 0 && (
                    <p className="text-[11px] text-rose-500 font-medium ml-1">No tests found. Please create a test in Test Management first.</p>
                  )}
                </div>
              ) : newLesson.type !== 'note' ? (
                <div className="space-y-4 bg-[#F8FAFC] p-5 rounded-[16px] border border-[#E5E7EB]">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Resource Link / File</label>
                    {(newLesson.type === 'pdf' || newLesson.type === 'image') && (
                      <div className="relative">
                        <input type="file" accept={newLesson.type === 'pdf' ? '.pdf' : 'image/*'} onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                        <button type="button" className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-[8px] text-[11px] font-bold text-primary-600 hover:bg-primary-50 transition-all shadow-sm ${isUploading ? 'opacity-50' : ''}`}>
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {isUploading ? 'Uploading...' : `Upload ${newLesson.type === 'pdf' ? 'PDF' : 'Image'}`}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input type="url" value={newLesson.url} onChange={(e) => setNewLesson({...newLesson, url: e.target.value})} placeholder="https://..." className="w-full pl-11 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-[12px] text-[14px] outline-none focus:border-primary-600 transition-all" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 min-h-[400px] flex flex-col">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Detailed Content</label>
                  <div className="flex-1 border border-[#E5E7EB] rounded-[12px] overflow-hidden bg-white shadow-inner relative ring-1 ring-[#F1F5F9]">
                    <JoditEditor ref={editor} value={newLesson.content} config={config} onChange={(newContent) => setNewLesson({...newLesson, content: newContent})} />
                  </div>
                </div>
              )}
            </form>

            <div className="p-5 border-t border-[#F1F5F9] flex gap-3 shrink-0 bg-[#F8FAFC]">
              <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-3 text-[13px] font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-[12px] hover:bg-[#F1F5F9]">Cancel</button>
              <button onClick={handleSaveLesson} type="button" className="flex-[2] py-3 text-[13px] font-bold text-white bg-primary-600 rounded-[12px] hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/10">
                {editingLessonId ? 'Update Lesson' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#F1F5F9] flex justify-between items-center">
              <h3 className="text-[17px] font-bold text-[#111827]">Add New Topic</h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-[#94A3B8] hover:text-[#111827]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddModule} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase ml-1 tracking-wider">Topic Title</label>
                <input autoFocus type="text" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="e.g. Master React Hooks" className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] text-[14px] outline-none focus:ring-4 focus:ring-primary-600/5 transition-all" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsTopicModalOpen(false)} className="flex-1 py-3 text-[13px] font-bold text-[#6B7280] bg-[#F8FAFC] rounded-[10px] hover:bg-[#F1F5F9]">Cancel</button>
                <button type="submit" className="flex-1 py-3 text-[13px] font-bold text-white bg-[#111827] rounded-[10px] hover:bg-black transition-all shadow-xl shadow-black/10">Create Topic</button>
              </div>
            </form>
          </div>
        </div>
      )}

    {/* Preview Modal */}
    {isPreviewModalOpen && previewLesson && (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#111827]/60 backdrop-blur-md">
        <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl border border-[#E5E7EB] animate-in slide-in-from-bottom-6 duration-400 overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E5E7EB] flex items-center justify-center text-[#4F46E5]">
                {previewLesson.type === 'video' ? <PlayCircle className="w-6 h-6" /> : previewLesson.type === 'image' ? <Image className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] leading-tight">{previewLesson.title}</h3>
                <p className="text-[10px] text-[#6B7280] font-bold uppercase">{previewLesson.type} Lesson • {previewLesson.duration}</p>
              </div>
            </div>
            <button onClick={() => setIsPreviewModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] text-[#6B7280]"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
            {previewLesson.type === 'note' ? (
              <div className="prose prose-indigo max-w-none">
                <div className="rich-content" dangerouslySetInnerHTML={{ __html: previewLesson.content }} />
              </div>
            ) : previewLesson.type === 'video' ? (
              <div className="aspect-video bg-[#111827] rounded-[16px] flex items-center justify-center text-white flex-col gap-4 border border-[#1E293B] shadow-2xl">
                <Video className="w-16 h-16 opacity-20" />
                <p className="text-[12px] font-bold opacity-60 uppercase tracking-widest">Video Stream Integration</p>
                <a href={previewLesson.url} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-[#4F46E5] rounded-full text-[13px] font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-[#4F46E5]/30">Open Stream</a>
              </div>
            ) : previewLesson.type === 'image' ? (
              <div className="flex flex-col items-center justify-center bg-[#F8FAFC] p-6 rounded-[16px] border border-[#E5E7EB] min-h-[300px]">
                <img 
                  src={previewLesson.url} 
                  alt={previewLesson.title} 
                  className="max-h-[50vh] object-contain rounded-lg shadow-md border border-slate-200"
                />
              </div>
            ) : (
              <div className="flex flex-col h-[65vh]">
                <div className="flex-1 bg-[#F8FAFC] rounded-[16px] border border-[#E5E7EB] overflow-hidden shadow-inner relative">
                  <iframe 
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewLesson.url)}&embedded=true`} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-[#F1F5F9] bg-[#F8FAFC] flex justify-end">
            <button onClick={() => setIsPreviewModalOpen(false)} className="px-8 py-2.5 bg-[#111827] text-white rounded-[12px] text-xs font-bold hover:bg-black transition-all">Close Preview</button>
          </div>
        </div>
      </div>
    )}

      <style>{`
        .rich-content h1 { font-size: 2.25em; font-weight: 800; margin-bottom: 0.75em; color: #111827; }
        .rich-content h2 { font-size: 1.75em; font-weight: 700; margin-bottom: 0.75em; color: #111827; border-bottom: 2px solid #F1F5F9; }
        .rich-content p { margin-bottom: 1.25em; line-height: 1.8; color: #374151; font-size: 1.05rem; }
        .rich-content img { max-width: 100%; border-radius: 12px; margin: 1.5em 0; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .rich-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; border-radius: 12px; overflow: hidden; }
        .rich-content th, .rich-content td { border: 1px solid #E5E7EB; padding: 12px; }
        .rich-content th { background: #F8FAFC; font-weight: 700; }
      `}</style>

    </div>
  );
}
