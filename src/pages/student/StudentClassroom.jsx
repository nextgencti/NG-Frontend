import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle,
  Lock, 
  FileText, 
  PlayCircle, 
  FileIcon, 
  Loader2, 
  GraduationCap,
  HelpCircle, 
  ChevronUp, 
  PanelLeftOpen, 
  X,
  ClipboardList,
  Clock
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function StudentClassroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const allLessons = useMemo(() => {
    const list = [];
    curriculum.forEach(mod => {
      (mod.lessons || []).forEach(lesson => {
        list.push({ ...lesson, moduleId: mod.id, moduleTitle: mod.title });
      });
    });
    return list;
  }, [curriculum]);

  const getLessonStatus = (lessonId) => {
    if (completedLessons.includes(lessonId)) return 'completed';
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx === 0) return 'unlocked';
    const prevId = allLessons[idx - 1]?.id;
    if (prevId && completedLessons.includes(prevId)) return 'unlocked';
    return 'locked';
  };

  useEffect(() => { fetchClassroomData(); }, [courseId]);

  const fetchClassroomData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/student/courses/${courseId}/classroom`);
      if (res.data.success) {
        setCourse(res.data.course);
        setCurriculum(res.data.curriculum || []);
        setCompletedLessons(res.data.completedLessons || []);
        setProgressPercentage(res.data.progressPercentage || 0);
        setTotalLessons(res.data.totalLessons || 0);

        const mods = res.data.curriculum || [];
        const completed = res.data.completedLessons || [];
        let found = false;
        for (const mod of mods) {
          for (const lesson of (mod.lessons || [])) {
            if (!completed.includes(lesson.id)) {
              setActiveLesson({ ...lesson, moduleId: mod.id, moduleTitle: mod.title });
              setActiveModuleId(mod.id);
              setExpandedModules(prev => ({ ...prev, [mod.id]: true }));
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found && mods.length > 0 && mods[0].lessons?.length > 0) {
          const fl = mods[0].lessons[0];
          setActiveLesson({ ...fl, moduleId: mods[0].id, moduleTitle: mods[0].title });
          setActiveModuleId(mods[0].id);
          setExpandedModules({ [mods[0].id]: true });
        }
      }
    } catch (err) {
      toast.error('Failed to load classroom data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || marking) return;
    setMarking(true);
    try {
      const res = await api.post(`/student/courses/${courseId}/lessons/${activeLesson.id}/complete`);
      if (res.data.success) {
        setCompletedLessons(res.data.completedLessons);
        setProgressPercentage(res.data.progressPercentage);
        toast.success('Lesson completed! 🎉');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete');
    } finally {
      setMarking(false);
    }
  };

  const handleNextLesson = () => {
    if (!activeLesson) return;
    const ci = allLessons.findIndex(l => l.id === activeLesson.id);
    if (ci < allLessons.length - 1) {
      const next = allLessons[ci + 1];
      if (getLessonStatus(next.id) !== 'locked') {
        selectLesson(next);
      } else {
        toast('Complete current lesson first', { icon: '🔒' });
      }
    }
  };

  const selectLesson = (lesson) => {
    if (getLessonStatus(lesson.id) === 'locked') {
      toast('Complete previous lessons first', { icon: '🔒' });
      return;
    }
    setActiveLesson(lesson);
    setActiveModuleId(lesson.moduleId);
    setExpandedModules(prev => ({ ...prev, [lesson.moduleId]: true }));
    setMobileSidebar(false);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^?\s]+)/,
      /(?:youtube\.com\/embed\/)([^?\s]+)/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
    }
    return url;
  };

  const isLessonCompleted = activeLesson ? completedLessons.includes(activeLesson.id) : false;
  const currentIdx = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const hasNext = currentIdx >= 0 && currentIdx < allLessons.length - 1;
  const currentModule = curriculum.find(m => m.id === activeLesson?.moduleId);
  const currentModuleIndex = curriculum.indexOf(currentModule);
  const currentLessonIndex = currentModule?.lessons?.findIndex(l => l.id === activeLesson?.id) ?? -1;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading Classroom...</p>
      </div>
    );
  }

  // ─── SIDEBAR CONTENT (shared between desktop & mobile drawer) ───
  const SidebarContent = () => (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/courses')}
        className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold text-slate-500 hover:text-primary-600 hover:bg-slate-50 transition-all border-b border-slate-100 w-full"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to My Courses
      </button>

      {/* Course Info Card */}
      <div className="mx-3 mt-3 p-3 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-[11px] font-bold leading-tight line-clamp-2">{course?.name || 'Course'}</h3>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Overall Progress</span>
          <span className="text-[11px] font-black">{progressPercentage}%</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Course Content Header */}
      <div className="px-4 pt-3 pb-1.5">
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em]">Course Content</h4>
      </div>

      {/* Modules List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 scrollbar-hide">
        {curriculum.map((mod, mIdx) => {
          const isExpanded = expandedModules[mod.id];
          const moduleLessons = mod.lessons || [];
          const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const allDone = completedInModule === moduleLessons.length && moduleLessons.length > 0;

          return (
            <div key={mod.id} className="mb-0.5">
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all ${
                  isExpanded ? 'bg-primary-50/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  allDone ? 'bg-emerald-100 text-emerald-600'
                    : isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {allDone ? <CheckCircle className="w-3 h-3" /> : (mIdx + 1)}
                </div>
                <p className={`text-[10px] font-bold truncate flex-1 ${isExpanded ? 'text-primary-700' : 'text-slate-700'}`}>
                  Module {mIdx + 1}: {mod.title}
                </p>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" /> : <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />}
              </button>

              {isExpanded && (
                <div className="ml-2.5 pl-3 border-l-2 border-slate-100 mt-0.5 space-y-px">
                  {moduleLessons.map((lesson, lIdx) => {
                    const status = getLessonStatus(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson({ ...lesson, moduleId: mod.id, moduleTitle: mod.title })}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all ${
                          isActive ? 'bg-primary-50 border border-primary-200'
                            : status === 'locked' ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'
                        }`}
                        disabled={status === 'locked'}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : isActive ? (
                          <div className="w-3 h-3 rounded-full bg-primary-600 border-2 border-primary-200 shrink-0" />
                        ) : status === 'locked' ? (
                          <Lock className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                        ) : lesson.type === 'test' ? (
                          <ClipboardList className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-semibold truncate ${isActive ? 'text-primary-700' : 'text-slate-600'}`}>
                            {mIdx + 1}.{lIdx + 1} {lesson.title}
                          </p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {lesson.type === 'video' ? 'Video' : lesson.type === 'pdf' ? 'PDF' : lesson.type === 'test' ? 'Assessment' : 'Note'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Need Help */}
      <div className="p-3 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <HelpCircle className="w-4 h-4 text-primary-400 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-slate-700">Need Help?</p>
          <p className="text-[8px] text-slate-400 mb-2">Contact your instructor for assistance.</p>
          <button
            onClick={() => toast('Contact feature coming soon!', { icon: '📬' })}
            className="w-full py-1.5 border border-primary-200 text-primary-600 rounded-md text-[9px] font-bold hover:bg-primary-50 transition-all"
          >
            Contact Instructor
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] -m-4 lg:-m-6 overflow-hidden bg-[#F8FAFC] relative">

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {mobileSidebar && (
        <div className="absolute inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-white flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course Content</span>
              <button onClick={() => setMobileSidebar(false)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className="w-[240px] min-w-[240px] bg-white border-r border-slate-200 flex-col h-full overflow-hidden hidden xl:flex">
        <SidebarContent />
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile Top Bar */}
        <div className="xl:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-white shrink-0">
          <button onClick={() => setMobileSidebar(true)} className="p-1.5 text-slate-500 hover:text-primary-600 rounded-md hover:bg-slate-50">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-semibold text-slate-500 truncate">{course?.name}</span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-3 sm:px-5 lg:px-6 py-4">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mb-4 flex-wrap">
              <button onClick={() => navigate('/dashboard/courses')} className="hover:text-primary-600 transition-colors">My Courses</button>
              <ChevronRight className="w-2.5 h-2.5" />
              <span className="text-slate-500 max-w-[160px] truncate">{course?.name}</span>
              {currentModule && (
                <>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span className="text-slate-500">Module {currentModuleIndex + 1}</span>
                </>
              )}
              {activeLesson && (
                <>
                  <ChevronRight className="w-2.5 h-2.5" />
                  <span className="text-primary-600 font-semibold">
                    {currentModuleIndex + 1}.{currentLessonIndex + 1} {activeLesson.title}
                  </span>
                </>
              )}
            </nav>

            {activeLesson ? (
              <>
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                        {currentModuleIndex + 1}.{currentLessonIndex + 1} {activeLesson.title}
                      </h1>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                        activeLesson.type === 'pdf' ? 'bg-blue-100 text-blue-600'
                          : activeLesson.type === 'video' ? 'bg-purple-100 text-purple-600'
                            : activeLesson.type === 'test' ? 'bg-rose-100 text-rose-600'
                            : 'bg-amber-100 text-amber-600'
                      }`}>
                        {activeLesson.type === 'pdf' ? '📄 PDF' : activeLesson.type === 'video' ? '🎥 Video' : activeLesson.type === 'test' ? '📝 Test' : '📝 Note'}
                      </span>
                    </div>
                     <p className="text-[11px] text-slate-500 font-medium">
                      {activeLesson.type === 'pdf' ? 'Read through this document to learn the concepts.'
                        : activeLesson.type === 'video' ? 'Watch this video lesson carefully.'
                          : activeLesson.type === 'test' ? 'Complete this assessment to test your knowledge.'
                          : 'Read through these notes carefully.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLessonCompleted ? (
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-primary-200 text-primary-600 rounded-lg text-[10px] font-bold hover:bg-primary-50 transition-all disabled:opacity-50"
                      >
                        {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Mark as Complete
                      </button>
                    )}
                    {hasNext && (
                      <button
                        onClick={handleNextLesson}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white rounded-lg text-[10px] font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
                      >
                        Next Lesson
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ═══ CONTENT VIEWER ═══ */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-4">
                  {activeLesson.type === 'pdf' && activeLesson.url && (
                    <div className="flex flex-col">
                      <div className="flex items-center px-4 py-2 bg-slate-50 border-b border-slate-200">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mr-2" />
                        <span className="text-[11px] font-semibold text-slate-600 truncate">{activeLesson.title}.pdf</span>
                      </div>
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.url)}&embedded=true`}
                        className="w-full border-none"
                        style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}
                        title="PDF Viewer"
                      />
                    </div>
                  )}

                  {activeLesson.type === 'video' && activeLesson.url && (
                    <div className="aspect-video bg-slate-900">
                      <iframe
                        src={getYouTubeEmbedUrl(activeLesson.url)}
                        className="w-full h-full border-none"
                        title="Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {activeLesson.type === 'note' && (
                    <div className="p-5 sm:p-8">
                      <div
                        className="prose prose-sm prose-slate max-w-none rich-content"
                        dangerouslySetInnerHTML={{ __html: activeLesson.content || '<p>No content available.</p>' }}
                      />
                    </div>
                  )}

                  {activeLesson.type === 'test' && (
                    <div className="p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50">
                      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5 border border-rose-100 shadow-sm">
                        <ClipboardList className="w-8 h-8 text-rose-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for Assessment?</h3>
                      <p className="text-[13px] text-slate-500 max-w-md mb-8 leading-relaxed">
                        This test is linked to this module. Please ensure you have covered all previous lessons before starting the test.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                          <Clock className="w-5 h-5 text-amber-500 mb-2" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                          <span className="text-[13px] font-bold text-slate-700">Course Exam</span>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                          <span className="text-[13px] font-bold text-slate-700">Available</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/dashboard/tests/${activeLesson.testId}/take`)}
                        className="px-10 py-3.5 bg-rose-600 text-white rounded-xl font-bold text-[14px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                      >
                        Start Assessment Now
                      </button>
                    </div>
                  )}

                  {!activeLesson.url && activeLesson.type !== 'note' && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <FileIcon className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-[12px] font-semibold">No content uploaded for this lesson yet.</p>
                    </div>
                  )}
                </div>

                {/* Bottom Banner */}
                <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-indigo-50 rounded-xl p-3.5 flex items-center justify-between border border-primary-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800">Keep Learning!</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {isLessonCompleted ? 'Great job! Move on to the next lesson.' : 'Complete this lesson to unlock the next content.'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:block text-2xl">🎓</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="w-10 h-10 text-slate-200 mb-3" />
                <h3 className="text-base font-bold text-slate-700 mb-1">No Content Available</h3>
                <p className="text-[11px] text-slate-400">This course doesn't have any content yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rich Content Styles */}
      <style>{`
        .rich-content h1 { font-size: 1.75em; font-weight: 800; margin-bottom: 0.5em; color: #111827; }
        .rich-content h2 { font-size: 1.4em; font-weight: 700; margin-bottom: 0.5em; color: #111827; border-bottom: 2px solid #F1F5F9; padding-bottom: 0.4em; }
        .rich-content h3 { font-size: 1.15em; font-weight: 700; margin-bottom: 0.4em; color: #1E293B; }
        .rich-content p { margin-bottom: 1em; line-height: 1.75; color: #374151; font-size: 0.9rem; }
        .rich-content ul, .rich-content ol { margin-bottom: 1em; padding-left: 1.25em; }
        .rich-content li { margin-bottom: 0.3em; line-height: 1.7; color: #374151; font-size: 0.9rem; }
        .rich-content img { max-width: 100%; border-radius: 10px; margin: 1em 0; box-shadow: 0 4px 12px rgb(0 0 0 / 0.08); }
        .rich-content table { width: 100%; border-collapse: collapse; margin: 1em 0; border-radius: 8px; overflow: hidden; font-size: 0.85rem; }
        .rich-content th, .rich-content td { border: 1px solid #E5E7EB; padding: 8px 12px; text-align: left; }
        .rich-content th { background: #F8FAFC; font-weight: 700; }
        .rich-content strong { color: #4F46E5; }
      `}</style>
    </div>
  );
}
