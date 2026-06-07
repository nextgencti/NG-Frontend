import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import useStudyTracker from '../../hooks/useStudyTracker';

export default function StudentClassroom() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lessonId');
  const moduleIdParam = searchParams.get('moduleId');

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

  // Track study time — heartbeat every 60 seconds while on this page
  useStudyTracker('classroom', courseId, course?.name || '', !loading);

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
        
        let initialLesson = null;
        let initialModuleId = null;

        // Check if query params specify lessonId or moduleId
        if (lessonIdParam) {
          for (const mod of mods) {
            const match = (mod.lessons || []).find(l => l.id === lessonIdParam);
            if (match) {
              initialLesson = { ...match, moduleId: mod.id, moduleTitle: mod.title };
              initialModuleId = mod.id;
              break;
            }
          }
        }

        if (!initialLesson && moduleIdParam) {
          const mod = mods.find(m => m.id === moduleIdParam);
          if (mod && mod.lessons?.length > 0) {
            initialLesson = { ...mod.lessons[0], moduleId: mod.id, moduleTitle: mod.title };
            initialModuleId = mod.id;
          }
        }

        if (initialLesson) {
          setActiveLesson(initialLesson);
          setActiveModuleId(initialModuleId);
          setExpandedModules(prev => ({ ...prev, [initialModuleId]: true }));
        } else {
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
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 border-4 border-primary-100 rounded-full"></div>
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Entering Classroom…</p>
      </div>
    );
  }

  // ─── SIDEBAR CONTENT ───
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl relative">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/courses')}
        className="flex items-center gap-2 px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-primary-600 hover:bg-slate-50 transition-all border-b border-slate-100 w-full cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Courses
      </button>

      {/* Course Info Card */}
      <div className="mx-4 mt-4 p-4 bg-slate-900 rounded-[20px] text-white shadow-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-2.5 mb-3.5 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <BookOpen className="w-4 h-4 text-primary-400" />
          </div>
          <h3 className="text-xs font-bold leading-snug line-clamp-2 uppercase tracking-wide">{course?.name || 'Classroom'}</h3>
        </div>
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">Overall Progress</span>
          <span className="text-xs font-black text-primary-400">{progressPercentage}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
          <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-400 rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="px-5 pt-4 pb-2 shrink-0">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.16em]">Chapters Sequence</h4>
      </div>

      {/* Modules Scroll List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5 scrollbar-hide">
        {curriculum.map((mod, mIdx) => {
          const isExpanded = expandedModules[mod.id];
          const moduleLessons = mod.lessons || [];
          const completedInModule = moduleLessons.filter(l => completedLessons.includes(l.id)).length;
          const allDone = completedInModule === moduleLessons.length && moduleLessons.length > 0;

          return (
            <div key={mod.id} className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50/20">
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-3 text-left transition-all cursor-pointer ${
                  isExpanded ? 'bg-primary-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  allDone ? 'bg-emerald-100 text-emerald-600'
                    : isExpanded ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {allDone ? <CheckCircle className="w-3.5 h-3.5" /> : (mIdx + 1)}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-wide truncate flex-1 ${isExpanded ? 'text-primary-800' : 'text-slate-700'}`}>
                  Module {mIdx + 1}: {mod.title}
                </p>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden bg-white border-t border-slate-50/60"
                  >
                    <div className="p-2 space-y-1">
                      {moduleLessons.map((lesson, lIdx) => {
                        const status = getLessonStatus(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => selectLesson({ ...lesson, moduleId: mod.id, moduleTitle: mod.title })}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                              isActive ? 'bg-primary-50 text-primary-700 border border-primary-100/50'
                                : status === 'locked' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-50/50'
                            }`}
                            disabled={status === 'locked'}
                          >
                            {status === 'completed' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : isActive ? (
                              <div className="w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-white shrink-0 shadow-sm" />
                            ) : status === 'locked' ? (
                              <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                            ) : lesson.type === 'test' ? (
                              <ClipboardList className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-[10px] font-black truncate leading-tight ${isActive ? 'text-primary-800' : 'text-slate-600'}`}>
                                {mIdx + 1}.{lIdx + 1} {lesson.title}
                              </p>
                              <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {lesson.type === 'video' ? 'Video Class' : lesson.type === 'pdf' ? 'Syllabus PDF' : lesson.type === 'test' ? 'Assessment' : 'Class Note'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Need Help Onboarding */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
        <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100/60">
          <HelpCircle className="w-4.5 h-4.5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Assistance Menu</p>
          <p className="text-[9px] text-slate-400 mb-3">Facing any issues with modules? contact support.</p>
          <button
            onClick={() => toast('Support feature coming soon!', { icon: '📬' })}
            className="w-full py-2 border border-slate-200 hover:border-primary-200 text-slate-600 hover:text-primary-600 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-primary-50 transition-all cursor-pointer"
          >
            Contact Tutor
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] -m-4 lg:-m-6 overflow-hidden bg-[#F8FAFC] relative">
      
      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      <AnimatePresence>
        {mobileSidebar && (
          <div className="absolute inset-0 z-50 xl:hidden flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
              onClick={() => setMobileSidebar(false)} 
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="absolute left-0 top-0 bottom-0 w-[270px] bg-white flex flex-col shadow-2xl z-10"
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chapters Menu</span>
                <button onClick={() => setMobileSidebar(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className="w-[260px] min-w-[260px] bg-white/80 backdrop-blur-2xl border-r border-white/60 flex flex-col h-full overflow-hidden hidden xl:flex">
        <SidebarContent />
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#F8FAFC]">
        {/* Mobile Top Bar */}
        <div className="xl:hidden flex items-center justify-between px-4 py-3 border-b border-white/60 bg-white/80 backdrop-blur-xl shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <motion.button 
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.06 }}
              animate={{ 
                scale: [1, 1.06, 1],
                boxShadow: ["0px 0px 0px rgba(79, 70, 229, 0)", "0px 0px 10px rgba(79, 70, 229, 0.3)", "0px 0px 0px rgba(79, 70, 229, 0)"]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              onClick={() => setMobileSidebar(true)} 
              className="p-2 bg-primary-600 text-white hover:bg-primary-700 border border-primary-600 rounded-xl transition-colors cursor-pointer shadow-md flex items-center justify-center shrink-0"
            >
              <PanelLeftOpen className="w-4 h-4 text-white/90" />
            </motion.button>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{course?.name}</span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary-50 text-primary-600 border border-primary-100/30">
            M{currentModuleIndex + 1}
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-dashboard-grid bg-repeat">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-5 flex-wrap">
              <button onClick={() => navigate('/dashboard/courses')} className="hover:text-primary-600 transition-colors cursor-pointer">Catalog</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-500 max-w-[120px] truncate">{course?.name}</span>
              {currentModule && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-500">M {currentModuleIndex + 1}</span>
                </>
              )}
              {activeLesson && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-primary-600 font-bold">
                    L {currentModuleIndex + 1}.{currentLessonIndex + 1}
                  </span>
                </>
              )}
            </nav>

            {activeLesson ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Lesson Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-2xl rounded-3xl p-5 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 border ${
                        activeLesson.type === 'pdf' ? 'bg-blue-50 text-blue-700 border-blue-100/50'
                          : activeLesson.type === 'video' ? 'bg-purple-50 text-purple-700 border-purple-100/50 animate-pulse'
                            : activeLesson.type === 'test' ? 'bg-rose-50 text-rose-700 border-rose-100/50'
                            : 'bg-amber-50 text-amber-700 border-amber-100/50'
                      }`}>
                        {activeLesson.type === 'pdf' ? '📄 Syllabus PDF' : activeLesson.type === 'video' ? '🎥 Lecture Video' : activeLesson.type === 'test' ? '📝 Test Exam' : '📝 Notes Sheet'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lesson {currentModuleIndex + 1}.{currentLessonIndex + 1}</p>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-snug uppercase">
                      {activeLesson.title}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {isLessonCompleted ? (
                      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100/50 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </div>
                    ) : (
                      <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                      >
                        {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-primary-500" />}
                        Complete
                      </button>
                    )}
                    {hasNext && (
                      <button
                        onClick={handleNextLesson}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer shadow-primary-500/10 hover:shadow-primary-500/20"
                      >
                        Next Lesson
                        <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ═══ CONTENT VIEWER ═══ */}
                <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.03)]">
                  {activeLesson.type === 'pdf' && activeLesson.url && (
                    <div className="flex flex-col">
                      <div className="flex items-center px-6 py-3.5 bg-slate-50/50 border-b border-slate-100">
                        <FileText className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{activeLesson.title}.pdf</span>
                      </div>
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(activeLesson.url)}&embedded=true`}
                        className="w-full border-none bg-slate-50"
                        style={{ height: 'calc(100vh - 280px)', minHeight: '450px' }}
                        title="PDF Viewer"
                      />
                    </div>
                  )}

                  {activeLesson.type === 'video' && activeLesson.url && (
                    <div className="aspect-video bg-slate-950 shadow-inner relative overflow-hidden group">
                      {/* Cinematic video overlay glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none z-10"></div>
                      <iframe
                        src={getYouTubeEmbedUrl(activeLesson.url)}
                        className="w-full h-full border-none relative z-20"
                        title="Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {activeLesson.type === 'note' && (
                    <div className="p-6 sm:p-10 md:p-12">
                      <div
                        className="prose prose-slate max-w-none rich-content"
                        dangerouslySetInnerHTML={{ __html: activeLesson.content || '<p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] text-center">No Content Available</p>' }}
                      />
                    </div>
                  )}

                  {activeLesson.type === 'test' && (
                    <div className="p-8 sm:p-12 md:p-16 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
                      <div className="absolute inset-0 bg-dot-pattern opacity-[0.3]"></div>
                      
                      <div className="w-16 h-16 rounded-[22px] bg-rose-50 flex items-center justify-center mb-6 border border-rose-100 shadow-md relative z-10 animate-bounce">
                        <ClipboardList className="w-7 h-7 text-rose-500" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 uppercase tracking-wide relative z-10">Ready for Assessment?</h3>
                      <p className="text-slate-400 text-xs max-w-md mb-8 leading-relaxed font-medium relative z-10">
                        This test is linked to this module. Please ensure you have covered all previous lessons before starting the test.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8 relative z-10">
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center hover:border-primary-100 transition-colors">
                          <Clock className="w-5 h-5 text-amber-500 mb-2" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                          <span className="text-xs font-black text-slate-800 mt-1 uppercase">Course Exam</span>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center hover:border-emerald-100 transition-colors">
                          <CheckCircle className="w-5 h-5 text-emerald-500 mb-2" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                          <span className="text-xs font-black text-slate-800 mt-1 uppercase">Unlocked</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/dashboard/tests/${activeLesson.testId}/take`)}
                        className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-[0.16em] transition-all shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 active:scale-95 relative z-10 cursor-pointer"
                      >
                        Start Assessment
                      </button>
                    </div>
                  )}

                  {!activeLesson.url && activeLesson.type !== 'note' && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/20">
                      <FileIcon className="w-10 h-10 mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Lesson Content Coming Soon</p>
                    </div>
                  )}
                </div>

                {/* Bottom Syllabus Banner */}
                <div className="bg-gradient-to-r from-primary-50/50 via-indigo-50/30 to-blue-50/30 rounded-3xl p-5 flex items-center justify-between border border-primary-100/30">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white border border-primary-100 flex items-center justify-center shrink-0 shadow-sm">
                      <GraduationCap className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Next Module Progress Indicator</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {isLessonCompleted ? 'Fabulous work! Move on to the next syllabus module.' : 'Complete this lesson to advance overall syllabus points.'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:block text-2xl animate-pulse">🎓</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white/70 backdrop-blur-2xl rounded-[32px] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                <BookOpen className="w-10 h-10 text-slate-200 mb-4" />
                <h3 className="text-base font-black text-slate-700 mb-1.5 uppercase tracking-wider">No Content Configured</h3>
                <p className="text-slate-400 text-xs font-medium">This course syllabus does not contain active files.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rich Content Styles */}
      <style>{`
        .rich-content h1 { font-size: 1.6em; font-weight: 800; margin-bottom: 0.6em; color: #1e293b; text-transform: uppercase; letter-spacing: -0.02em; }
        .rich-content h2 { font-size: 1.3em; font-weight: 800; margin-top: 1.2em; margin-bottom: 0.5em; color: #1e293b; border-bottom: 2px solid #F8FAFC; padding-bottom: 0.4em; text-transform: uppercase; letter-spacing: -0.01em; }
        .rich-content h3 { font-size: 1.1em; font-weight: 800; margin-top: 1em; margin-bottom: 0.4em; color: #334155; text-transform: uppercase; }
        .rich-content p { margin-bottom: 1.2em; line-height: 1.8; color: #64748b; font-size: 0.85rem; font-weight: 500; }
        .rich-content ul, .rich-content ol { margin-bottom: 1.2em; padding-left: 1.5em; list-style-type: square; }
        .rich-content li { margin-bottom: 0.4em; line-height: 1.7; color: #64748b; font-size: 0.85rem; font-weight: 500; }
        .rich-content img { max-width: 100%; border-radius: 20px; margin: 1.5em 0; border: 1px solid #f1f5f9; box-shadow: 0 10px 30px rgb(0 0 0 / 0.04); }
        .rich-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; border-radius: 16px; overflow: hidden; font-size: 0.8rem; border: 1px solid #f1f5f9; }
        .rich-content th, .rich-content td { padding: 10px 14px; text-align: left; }
        .rich-content td { border-top: 1px solid #f8fafc; color: #64748b; font-weight: 500; }
        .rich-content th { background: #f8fafc; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
        .rich-content strong { color: #4f46e5; font-weight: 800; }
      `}</style>
    </div>
  );
}
