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
  Image,
  GripVertical
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// Helper function to process markdown table rows and return clean HTML table
const processTableRows = (rows) => {
  const cleanRows = rows.filter(r => !r.includes('---'));
  if (cleanRows.length === 0) return '';

  const parseCells = (rowText) => {
    return rowText.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
  };

  const headers = parseCells(cleanRows[0]);
  const bodyRows = cleanRows.slice(1).map(r => parseCells(r));

  let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 11.5px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">';
  
  // Header
  tableHtml += '<thead style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;"><tr>';
  headers.forEach(h => {
    tableHtml += `<th style="padding: 6px 8px; font-weight: bold; color: #1e293b; border: 1px solid #e2e8f0; text-align: left;">${h}</th>`;
  });
  tableHtml += '</tr></thead>';

  // Body
  tableHtml += '<tbody style="background: #ffffff;">';
  bodyRows.forEach(row => {
    tableHtml += '<tr style="border-bottom: 1px solid #f1f5f9;">';
    row.forEach(cell => {
      tableHtml += `<td style="padding: 6px 8px; color: #475569; border: 1px solid #e2e8f0;">${cell}</td>`;
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';

  return tableHtml;
};

const convertMarkdownToHtml = (md) => {
  if (!md) return '';
  let html = md;

  // Code blocks: ```javascript ... ```
  html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, (match, p1) => {
    return `<pre style="background: #0f172a; color: #f8fafc; padding: 10px; border-radius: 6px; font-family: monospace; overflow-x: auto; margin: 8px 0; font-size: 11px; border: 1px solid #334155;"><code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f1f5f9; color: #e11d48; padding: 1px 4px; border-radius: 4px; font-family: monospace; font-size: 90%;">$1</code>');

  // Parse Tables
  const lines = html.split('\n');
  let newLines = [];
  let isTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      isTable = true;
      tableRows.push(line);
    } else {
      if (isTable) {
        const tableHtml = processTableRows(tableRows);
        newLines.push(tableHtml);
        tableRows = [];
        isTable = false;
      }
      newLines.push(lines[i]);
    }
  }
  if (isTable && tableRows.length > 0) {
    const tableHtml = processTableRows(tableRows);
    newLines.push(tableHtml);
  }

  html = newLines.join('\n');

  // Horizontal Rules: ---
  html = html.replace(/^\s*---\s*$/gm, '<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;" />');

  // Headings
  html = html.replace(/^###### (.*?)$/gm, '<h6 style="color: #1e1b4b; font-weight: bold; margin: 6px 0 3px 0; font-size: 12px;">$1</h6>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 style="color: #1e1b4b; font-weight: bold; margin: 8px 0 4px 0; font-size: 13px;">$1</h5>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 style="color: #1e1b4b; font-weight: 800; margin: 10px 0 5px 0; font-size: 14px;">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, '<h3 style="color: #1e1b4b; font-weight: 800; margin: 12px 0 6px 0; font-size: 15px;">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 style="color: #1e1b4b; font-weight: 900; margin: 14px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-size: 17px;">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 style="color: #1e1b4b; font-weight: 900; margin: 18px 0 8px 0; font-size: 20px;">$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italics: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Contiguous bullet lists
  const listLines = html.split('\n');
  let processedLines = [];
  let isInsideList = false;

  for (let i = 0; i < listLines.length; i++) {
    const line = listLines[i];
    const match = line.match(/^\s*[-*]\s+(.*?)$/);
    if (match) {
      if (!isInsideList) {
        processedLines.push('<ul style="margin: 6px 0; padding-left: 18px; list-style-type: disc;">');
        isInsideList = true;
      }
      processedLines.push(`<li style="margin: 3px 0; color: #334155; line-height: 1.5;">${match[1]}</li>`);
    } else {
      if (isInsideList) {
        processedLines.push('</ul>');
        isInsideList = false;
      }
      processedLines.push(line);
    }
  }
  if (isInsideList) {
    processedLines.push('</ul>');
  }

  html = processedLines.join('\n');

  // Contiguous ordered lists
  const olLines = html.split('\n');
  let olProcessed = [];
  let isInsideOl = false;

  for (let i = 0; i < olLines.length; i++) {
    const line = olLines[i];
    const match = line.match(/^\s*(\d+)\.\s+(.*?)$/);
    if (match) {
      if (!isInsideOl) {
        olProcessed.push('<ol style="margin: 6px 0; padding-left: 18px; list-style-type: decimal;">');
        isInsideOl = true;
      }
      olProcessed.push(`<li style="margin: 3px 0; color: #334155; line-height: 1.5;">${match[2]}</li>`);
    } else {
      if (isInsideOl) {
        olProcessed.push('</ol>');
        isInsideOl = false;
      }
      olProcessed.push(line);
    }
  }
  if (isInsideOl) {
    olProcessed.push('</ol>');
  }

  html = olProcessed.join('\n');

  // Wrap normal text lines in paragraphs
  const finalLines = html.split('\n');
  html = finalLines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<pre') || trimmed.endsWith('</pre>') ||
      trimmed.startsWith('<h') || trimmed.startsWith('</h') ||
      trimmed.startsWith('<li') || trimmed.startsWith('</li') ||
      trimmed.startsWith('<ul') || trimmed.startsWith('</ul>') ||
      trimmed.startsWith('<ol') || trimmed.startsWith('</ol>') ||
      trimmed.startsWith('<table') || trimmed.startsWith('</table>') ||
      trimmed.startsWith('<tr') || trimmed.startsWith('</tr>') ||
      trimmed.startsWith('<thead') || trimmed.startsWith('</thead>') ||
      trimmed.startsWith('<tbody') || trimmed.startsWith('</tbody>') ||
      trimmed.startsWith('<td') || trimmed.startsWith('</td>') ||
      trimmed.startsWith('<th') || trimmed.startsWith('</th>') ||
      trimmed.startsWith('<hr')
    ) {
      return line;
    }
    return `<p style="margin: 6px 0; color: #334155; line-height: 1.5;">${line}</p>`;
  }).join('\n');

  return html;
};

const RenderMessageText = ({ text }) => {
  if (!text) return null;
  const html = convertMarkdownToHtml(text);

  return (
    <div 
      className="rich-notes-preview text-[11px] leading-relaxed space-y-1 text-slate-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default function AdminCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const editor = useRef(null);
  const [course, setCourse] = useState(null);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    
    // Check if it's a short share link (youtu.be)
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } 
    // Check if it's a standard watch link (youtube.com/watch?v=)
    else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    }
    // Check if it's an embed link already
    else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };
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
  const [lessonPosition, setLessonPosition] = useState(1);
  const [currentLessonsCount, setCurrentLessonsCount] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null); // { mIndex, lIndex }
  const [dragOverItem, setDragOverItem] = useState(null); // { mIndex, lIndex }

  // Preview Modal States
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState(null);

  // Sanju AI Chat States
  const [aiMessages, setAiMessages] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Jodit Editor Configuration with Cloudinary Upload
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Write your professional notes here...',
    height: 300,
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

  // Initialize Sanju AI greeting
  useEffect(() => {
    if (isLessonModalOpen && newLesson.type === 'note') {
      setAiMessages([
        {
          role: 'model',
          parts: [{ text: `नमस्ते! मैं आपका AI Tutor **Sanju** हूँ। 🤖\n\nआप मुझसे किसी भी कंप्यूटर टॉपिक पर नोट्स डिस्कस कर सकते हैं। आप यहाँ अपना टॉपिक लिख सकते हैं (जैसे: "Generate detailed notes on CSS Grid") और मैं उसे विस्तृत रूप से तैयार कर दूंगा जिसे आप एक क्लिक में अपने नोटपैड में सेव कर सकते हैं।` }]
        }
      ]);
    } else {
      setAiMessages([]);
    }
  }, [isLessonModalOpen, newLesson.type]);

  const handleSendAiPrompt = async (e) => {
    e?.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    const userMsg = {
      role: 'user',
      parts: [{ text: aiPrompt }]
    };

    setAiMessages(prev => [...prev, userMsg]);
    const currentPrompt = aiPrompt;
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await api.post('/admin/chat-ai', {
        prompt: currentPrompt,
        history: aiMessages
      });

      if (res.data.success) {
        setAiMessages(prev => [...prev, {
          role: 'model',
          parts: [{ text: res.data.reply }]
        }]);
      } else {
        toast.error("Failed to get response from Sanju AI");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with AI");
    } finally {
      setAiLoading(false);
    }
  };

  const handleInsertIntoEditor = (text, append = false) => {
    const formattedHtml = convertMarkdownToHtml(text);
    if (append) {
      setNewLesson(prev => ({
        ...prev,
        content: (prev.content || '') + '<br/><br/>' + formattedHtml
      }));
      toast.success("Appended to notes!");
    } else {
      setNewLesson(prev => ({
        ...prev,
        content: formattedHtml
      }));
      toast.success("Inserted into notes!");
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
    const activeMod = modules.find(m => m.id === moduleId);
    const lessonsList = activeMod?.lessons || [];
    setCurrentLessonsCount(lessonsList.length);

    if (lesson) {
      setEditingLessonId(lesson.id);
      setNewLesson({ ...lesson });
      const currentIdx = lessonsList.findIndex(l => l.id === lesson.id);
      setLessonPosition(currentIdx + 1);
    } else {
      setEditingLessonId(null);
      setNewLesson({ title: '', type: 'video', url: '', duration: '', content: '', testId: '' });
      setLessonPosition(lessonsList.length + 1);
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = (e) => {
    if (e) e.preventDefault();
    if (!newLesson.title.trim()) { toast.error('Please enter a lesson title'); return; }

    const updatedModules = modules.map(m => {
      if (m.id === activeModuleId) {
        let lessons = [...m.lessons];
        if (editingLessonId) {
          // Remove the lesson from its current position
          const currentIdx = lessons.findIndex(l => l.id === editingLessonId);
          lessons = lessons.filter(l => l.id !== editingLessonId);
          // Insert it at the new selected position (lessonPosition - 1)
          const insertIdx = Math.max(0, Math.min(lessons.length, lessonPosition - 1));
          lessons.splice(insertIdx, 0, { ...newLesson });
        } else {
          // Add a new lesson at the end
          lessons.push({ ...newLesson, id: Date.now().toString() });
        }
        return { ...m, lessons };
      }
      return m;
    });

    setModules(updatedModules);
    setIsLessonModalOpen(false);
    setEditingLessonId(null);
    toast.success(editingLessonId ? 'Lesson updated & reordered' : 'Lesson added');
  };

  const handleMoveLesson = (moduleId, lIndex, direction) => {
    const targetIndex = direction === 'up' ? lIndex - 1 : lIndex + 1;
    if (targetIndex < 0) return;
    
    const updatedModules = modules.map(m => {
      if (m.id === moduleId) {
        const lessons = [...m.lessons];
        if (targetIndex >= lessons.length) return m;
        // Swap the elements
        const temp = lessons[lIndex];
        lessons[lIndex] = lessons[targetIndex];
        lessons[targetIndex] = temp;
        return { ...m, lessons };
      }
      return m;
    });
    setModules(updatedModules);
    toast.success('Lesson order updated');
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e, mIndex, lIndex) => {
    setDraggedItem({ mIndex, lIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, mIndex, lIndex) => {
    if (draggedItem && draggedItem.mIndex === mIndex) {
      setDragOverItem({ mIndex, lIndex });
    }
  };

  const handleDrop = (e, mIndex, lIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.mIndex !== mIndex) {
      toast.error('Lessons can only be reordered within the same Topic');
      return;
    }

    const fromIdx = draggedItem.lIndex;
    const toIdx = lIndex;
    if (fromIdx === toIdx) return;

    const updatedModules = [...modules];
    const moduleItem = updatedModules[mIndex];
    const lessons = [...moduleItem.lessons];

    const [movedLesson] = lessons.splice(fromIdx, 1);
    lessons.splice(toIdx, 0, movedLesson);

    updatedModules[mIndex] = { ...moduleItem, lessons };
    setModules(updatedModules);
    toast.success('Lesson reordered successfully');
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
      <div className="flex items-center gap-3 mb-0.5">
        <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-primary-600 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-[#111827] tracking-tight">{course?.name}</h2>
          <p className="text-[#6B7280] text-[11.5px] font-medium tracking-wide">Course Curriculum Authoring</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-[12px] border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-6 px-1">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-[0.05em]">Topics</span>
            <span className="text-[16px] font-bold text-[#111827]">{modules.length}</span>
          </div>
          <div className="w-px h-6 bg-[#F1F5F9]"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-[0.05em]">Lessons</span>
            <span className="text-[16px] font-bold text-[#111827]">{modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsTopicModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#E5E7EB] text-[#374151] rounded-[8px] text-[12px] font-bold hover:bg-[#F8FAFC] transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </button>
          <button onClick={handlePublish} disabled={isPublishing || isUploading} className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-600 text-white rounded-[8px] text-[12px] font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/10 disabled:opacity-50">
            {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isPublishing ? 'Publishing...' : 'Publish Now'}
          </button>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-2.5">
        {modules.map((module, mIndex) => (
          <div key={module.id} className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm overflow-hidden group">
            <div className={`py-3 px-4 flex items-center justify-between cursor-pointer transition-colors ${expandedModules[module.id] ? 'bg-[#F8FAFC]' : 'hover:bg-[#F8FAFC]'}`} onClick={() => toggleModule(module.id)}>
              <div className="flex items-center gap-3">
                <div className="w-7.5 h-7.5 rounded-[8px] bg-[#EEF2FF] flex items-center justify-center text-[12px] font-bold text-[#4F46E5] shrink-0">{mIndex + 1}</div>
                <div>
                  <h3 className="font-bold text-[#111827] text-[14px] tracking-tight leading-tight">{module.title}</h3>
                  <p className="text-[11px] text-[#6B7280] font-semibold leading-tight mt-0.5">{module.lessons.length} Lessons</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-[#94A3B8] hover:text-[#4F46E5] hover:bg-white rounded-lg transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                <button className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-white rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                <div className="w-px h-5 bg-[#E5E7EB] mx-0.5"></div>
                {expandedModules[module.id] ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
              </div>
            </div>

            {expandedModules[module.id] && (
              <div className="border-t border-[#F1F5F9] bg-[#FFFFFF] divide-y divide-[#F1F5F9]">
                {module.lessons.map((lesson, lIndex) => (
                  <div 
                    key={lesson.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, mIndex, lIndex)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, mIndex, lIndex)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, mIndex, lIndex)}
                    className={`py-2 px-4 pl-12 flex items-center justify-between hover:bg-[#F8FAFC] transition-all group/lesson cursor-move relative ${
                      dragOverItem && dragOverItem.mIndex === mIndex && dragOverItem.lIndex === lIndex 
                        ? 'border-t-2 border-t-primary-500 bg-primary-50/10' 
                        : ''
                    } ${
                      draggedItem && draggedItem.mIndex === mIndex && draggedItem.lIndex === lIndex 
                        ? 'opacity-30 bg-slate-50' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <GripVertical className="w-3.5 h-3.5 text-slate-350 cursor-grab active:cursor-grabbing hover:text-slate-600 shrink-0 -ml-4 mr-0.5" />
                      <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[9px] font-bold text-[#6B7280] group-hover/lesson:bg-primary-50 group-hover/lesson:text-primary-600 transition-colors shrink-0">{lIndex + 1}</div>
                      {lesson.type === 'video' ? <PlayCircle className="w-3.5 h-3.5 text-primary-500 shrink-0" /> : 
                       lesson.type === 'test' ? <ClipboardList className="w-3.5 h-3.5 text-rose-500 shrink-0" /> :
                       lesson.type === 'note' ? <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : 
                       <FileIcon className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                      <div>
                        <p className="text-[12px] font-bold text-[#374151] group-hover/lesson:text-[#111827] transition-colors leading-tight">{lesson.title}</p>
                        <p className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider leading-none mt-0.5">
                          {lesson.type === 'test' ? 'Examination' : (lesson.duration || (lesson.type === 'note' ? 'Reading' : 'File'))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                      {/* Move Up */}
                      {lIndex > 0 && (
                        <button 
                          type="button"
                          onClick={() => handleMoveLesson(module.id, lIndex, 'up')}
                          className="p-1 text-[#6B7280] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-md transition-all border border-transparent hover:border-[#E5E7EB]"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                      )}
                      {/* Move Down */}
                      {lIndex < module.lessons.length - 1 && (
                        <button 
                          type="button"
                          onClick={() => handleMoveLesson(module.id, lIndex, 'down')}
                          className="p-1 text-[#6B7280] hover:text-[#4F46E5] hover:bg-[#EEF2FF] rounded-md transition-all border border-transparent hover:border-[#E5E7EB]"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                      <button type="button" onClick={() => handlePreviewLesson(lesson)} className="p-1 text-[#6B7280] hover:text-primary-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-[#E5E7EB]"><Eye className="w-3 h-3" /></button>
                      <button type="button" onClick={() => handleOpenLessonModal(module.id, lesson)} className="p-1 text-[#6B7280] hover:text-primary-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-[#E5E7EB]"><Pencil className="w-3 h-3" /></button>
                      <button type="button" onClick={() => handleDeleteLesson(module.id, lesson.id)} className="p-1 text-[#6B7280] hover:text-rose-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-[#E5E7EB]"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleOpenLessonModal(module.id)} className="w-full py-2.5 px-4 pl-12 flex items-center gap-1.5 text-[11.5px] font-bold text-primary-600 hover:bg-primary-50/40 transition-colors">
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
          <div className={`bg-white rounded-[16px] w-full ${newLesson.type === 'note' ? 'max-w-6xl' : 'max-w-3xl'} shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh] lg:ml-32`}>
            <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center shrink-0 bg-[#F8FAFC]">
              <h3 className="text-[15px] font-bold text-[#111827]">{editingLessonId ? 'Modify Lesson' : 'New Lesson'}</h3>
              <button onClick={() => setIsLessonModalOpen(false)} className="text-[#94A3B8] hover:text-[#111827]"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden min-h-0">
              <form onSubmit={handleSaveLesson} className={`flex-1 overflow-y-auto p-4 space-y-4 ${newLesson.type === 'note' ? 'md:w-3/5 border-r border-[#F1F5F9]' : 'w-full'}`}>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Lesson Title</label>
                  <input autoFocus type="text" required value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} placeholder="e.g. Master React Hooks" className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none focus:ring-4 focus:ring-primary-600/5 transition-all" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Type</label>
                    <select value={newLesson.type} onChange={(e) => setNewLesson({...newLesson, type: e.target.value})} className="w-full px-2 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none cursor-pointer">
                      <option value="video">🎥 Video</option>
                      <option value="pdf">📄 PDF Doc</option>
                      <option value="image">🖼️ Image (PNG, JPG)</option>
                      <option value="note">📝 Text Note</option>
                      <option value="test">📝 Test / Exam</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">{newLesson.type === 'note' ? 'Reading Time' : 'Duration'}</label>
                    <input type="text" value={newLesson.duration} onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})} placeholder="e.g. 15 mins" className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none focus:ring-4 focus:ring-primary-600/5 transition-all" />
                  </div>
                </div>

                {editingLessonId && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Position (Serial Number)</label>
                    <select 
                      value={lessonPosition} 
                      onChange={(e) => setLessonPosition(Number(e.target.value))} 
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none cursor-pointer focus:ring-4 focus:ring-primary-600/5 transition-all bg-select-arrow"
                    >
                      {Array.from({ length: currentLessonsCount }, (_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {newLesson.type === 'test' ? (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Select Test from Library</label>
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
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none cursor-pointer"
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
                  <div className="space-y-3 bg-[#F8FAFC] p-4 rounded-[12px] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Resource Link / File</label>
                      {(newLesson.type === 'pdf' || newLesson.type === 'image') && (
                        <div className="relative">
                          <input type="file" accept={newLesson.type === 'pdf' ? '.pdf' : 'image/*'} onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                          <button type="button" className={`flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5E7EB] rounded-[6px] text-[10.5px] font-bold text-primary-600 hover:bg-primary-50 transition-all shadow-sm ${isUploading ? 'opacity-50' : ''}`}>
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {isUploading ? 'Uploading...' : `Upload ${newLesson.type === 'pdf' ? 'PDF' : 'Image'}`}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                      <input type="url" value={newLesson.url} onChange={(e) => setNewLesson({...newLesson, url: e.target.value})} placeholder="https://..." className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] outline-none focus:border-primary-600 transition-all" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 min-h-[300px] flex-1 flex flex-col">
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase ml-0.5 tracking-wider">Detailed Content</label>
                    <div className="flex-1 border border-[#E5E7EB] rounded-[8px] overflow-hidden bg-white shadow-inner relative ring-1 ring-[#F1F5F9]">
                      <JoditEditor ref={editor} value={newLesson.content} config={config} onChange={(newContent) => setNewLesson({...newLesson, content: newContent})} />
                    </div>
                  </div>
                )}
              </form>

              {newLesson.type === 'note' && (
                <div className="md:w-2/5 flex flex-col bg-slate-50 border-l border-[#E5E7EB] h-[500px] md:h-auto overflow-hidden">
                  {/* AI Header */}
                  <div className="p-3 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center border border-primary-100 overflow-hidden shrink-0">
                        <img 
                          src="/AI_Tutor_sunju.png" 
                          alt="Sanju" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
                          }} 
                        />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black text-slate-800 leading-none">Sanju - AI Notes Assistant</h4>
                        <span className="text-[8.5px] text-slate-400 font-bold mt-0.5 block">Discuss topics & build notes</span>
                      </div>
                    </div>
                    {aiLoading && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-primary-50 border border-primary-100 rounded-full text-[8.5px] text-primary-600 font-black animate-pulse">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Thinking...
                      </div>
                    )}
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-[#F8FAFC]">
                    {aiMessages.map((msg, index) => (
                      <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-[12px] px-3 py-2 text-xs shadow-sm border ${
                          msg.role === 'user' 
                            ? 'bg-primary-600 border-primary-700 text-white rounded-br-none' 
                            : 'bg-white border-[#E5E7EB] text-slate-700 rounded-bl-none'
                        }`}>
                          {msg.role === 'model' && (
                            <div className="text-[8.5px] font-bold text-primary-600 mb-0.5 flex items-center gap-0.5">
                              🤖 Sanju AI
                            </div>
                          )}
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap">{msg.parts?.[0]?.text || msg.content}</p>
                          ) : (
                            <RenderMessageText text={msg.parts?.[0]?.text || msg.content} />
                          )}
                        </div>

                        {/* Action buttons for model replies */}
                        {msg.role === 'model' && index > 0 && (
                          <div className="flex gap-1.5 mt-1 ml-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleInsertIntoEditor(msg.parts?.[0]?.text || msg.content, false)}
                              className="px-2 py-0.5 bg-white border border-[#E5E7EB] rounded-md text-[8.5px] font-black text-slate-650 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              📥 Replace
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertIntoEditor(msg.parts?.[0]?.text || msg.content, true)}
                              className="px-2 py-0.5 bg-[#10B981] hover:bg-[#0D9668] border border-emerald-600 rounded-md text-[8.5px] font-black text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              ➕ Append
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Quick Chips */}
                  <div className="px-3 py-1.5 bg-white border-t border-[#E5E7EB] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
                    {[
                      { label: "💡 Explain", prompt: `Explain the current topic in detail with real-world examples.` },
                      { label: "💻 Code", prompt: `Provide structured code examples with detailed comments for this topic.` },
                      { label: "📝 Notes", prompt: `Generate a complete, structured textbook-style note for this topic.` },
                      { label: "🎯 Summary", prompt: `Provide a quick bullet-point summary of the core concepts of this topic.` }
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(chip.prompt)}
                        className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-full text-[8.5px] font-bold text-slate-650 hover:bg-[#F1F5F9] transition-all whitespace-nowrap cursor-pointer"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendAiPrompt} className="p-2 bg-white border-t border-[#E5E7EB] flex gap-1.5 shrink-0">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask Sanju to write notes..."
                      className="flex-1 px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-xs outline-none focus:border-primary-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={aiLoading || !aiPrompt.trim()}
                      className="px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer shadow-md shadow-primary-600/10"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[#F1F5F9] flex gap-2.5 shrink-0 bg-[#F8FAFC]">
              <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-2.5 text-[12px] font-bold text-[#6B7280] bg-white border border-[#E5E7EB] rounded-[8px] hover:bg-[#F1F5F9]">Cancel</button>
              <button onClick={handleSaveLesson} type="button" className="flex-[2] py-2.5 text-[12px] font-bold text-white bg-primary-600 rounded-[8px] hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/10">
                {editingLessonId ? 'Update Lesson' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111827]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[20px] w-full max-w-md shadow-2xl border border-[#E5E7EB] animate-in zoom-in-95 duration-200 lg:ml-32">
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
        <div className="bg-white rounded-[24px] w-full max-w-3xl shadow-2xl border border-[#E5E7EB] animate-in slide-in-from-bottom-6 duration-400 overflow-hidden flex flex-col max-h-[85vh] lg:ml-32">
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
              <div className="aspect-video bg-[#111827] rounded-[16px] overflow-hidden border border-[#1E293B] shadow-2xl relative">
                {previewLesson.url ? (
                  previewLesson.url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i) ? (
                    <video 
                      src={previewLesson.url} 
                      controls 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      src={getYouTubeEmbedUrl(previewLesson.url)}
                      className="w-full h-full border-none relative z-10"
                      title="Video Player Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <Video className="w-16 h-16 opacity-25 mb-2 animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-wider">No video URL provided</p>
                  </div>
                )}
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
