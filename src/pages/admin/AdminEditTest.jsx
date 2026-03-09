import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Clock, BookOpen, BarChart2, Hash, FileText, Calendar, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function AdminEditTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Edit Question Modal State
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Reschedule State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    fetchTestDetails();
    fetchCourses();
  }, [testId]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchTestDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/tests/${testId}/full`);
      if (response.data.success) {
        setTest(response.data.test);
        setQuestions(response.data.questions || []);
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test details.');
      navigate('/admin/tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestChange = (e) => {
    setTest({ ...test, [e.target.name]: e.target.value });
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put(`/admin/tests/${testId}`, test);
      if (response.data.success) {
        toast.success('Test configuration saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save test details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleTime) {
      toast.error('Please pick a new date and time');
      return;
    }
    setIsRescheduling(true);
    try {
      const response = await api.put(`/admin/tests/${testId}`, {
        ...test,
        date: rescheduleDate,
        time: rescheduleTime,
        status: 'upcoming'
      });
      if (response.data.success) {
        setTest({ ...test, date: rescheduleDate, time: rescheduleTime, status: 'upcoming' });
        setIsRescheduleOpen(false);
        toast.success('Test rescheduled successfully! Status reset to Upcoming.');
      }
    } catch (error) {
      toast.error('Failed to reschedule test');
    } finally {
      setIsRescheduling(false);
    }
  };

  const openQuestionModal = (q = null) => {
    if (q) {
      setEditingQuestion({ ...q });
    } else {
      setEditingQuestion({
        question: '',
        options: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        marks: 1
      });
    }
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion.id) {
        // Update existing
        const response = await api.put(`/admin/tests/${testId}/questions/${editingQuestion.id}`, editingQuestion);
        if (response.data.success) {
          setQuestions(questions.map(q => q.id === editingQuestion.id ? response.data.question : q));
          toast.success('Question updated!');
        }
      } else {
        // Create new
        const response = await api.post(`/admin/tests/${testId}/questions`, editingQuestion);
        if (response.data.success) {
          setQuestions([...questions, response.data.question]);
          setTest({ ...test, questions: test.questions + 1 });
          toast.success('Question added!');
        }
      }
      setIsQuestionModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const response = await api.delete(`/admin/tests/${testId}/questions/${qId}`);
      if (response.data.success) {
        setQuestions(questions.filter(q => q.id !== qId));
        setTest({ ...test, questions: Math.max(0, test.questions - 1) });
        toast.success('Question deleted');
      }
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/5 border-t-primary-500 animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Decrypting Test Data...</p>
      </div>
    );
  }

  if (!test) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate('/admin/tests')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </button>
          <h2 className="text-3xl font-black text-white tracking-tight">Edit Assessment</h2>
          <p className="text-slate-400 font-medium">Modify test configurations and restructure questions.</p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => { setRescheduleDate(test.date || ''); setRescheduleTime((test.time || '').substring(0, 5)); setIsRescheduleOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-400 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
          >
            <Calendar className="w-5 h-5" />
            Reschedule
          </button>
          <button
            onClick={handleSaveTest}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Config'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Test Metadata Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-dark border border-white/5 rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
            
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-8">
              <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400">
                <FileText className="w-4 h-4" />
              </span>
              Configuration
            </h3>

            <form onSubmit={handleSaveTest} className="space-y-6">
              {/* Title */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</label>
                <input
                  name="title" required value={test.title} onChange={handleTestChange}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all font-bold placeholder:text-slate-600"
                />
              </div>

              {/* Course */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</label>
                <select
                  name="course" required value={test.course} onChange={handleTestChange}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer font-bold appearance-none"
                >
                  <option value="" className="bg-slate-900">Select a course</option>
                  {courses.map(c => <option key={c.id || c.name} value={c.name} className="bg-slate-900">{c.name}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  name="status" required value={test.status} onChange={handleTestChange}
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer font-bold appearance-none"
                >
                  <option value="upcoming" className="bg-slate-900">Upcoming (Hidden)</option>
                  <option value="published" className="bg-slate-900">Published (Live)</option>
                  <option value="completed" className="bg-slate-900">Completed (Closed)</option>
                </select>
              </div>

              {/* Type Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                  <select
                    name="type" required value={test.type} onChange={handleTestChange}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer font-bold appearance-none"
                  >
                    <option value="Live" className="bg-slate-900">Live</option>
                    <option value="Practice" className="bg-slate-900">Practice</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Difficulty</label>
                  <select
                    name="difficulty" required value={test.difficulty} onChange={handleTestChange}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer font-bold appearance-none"
                  >
                    <option value="Easy" className="bg-slate-900 text-emerald-500">Easy</option>
                    <option value="Medium" className="bg-slate-900 text-amber-500">Medium</option>
                    <option value="Hard" className="bg-slate-900 text-rose-500">Hard</option>
                  </select>
                </div>
              </div>

              {/* Time Data */}
              {test.type === 'Live' && (
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</label>
                    <input
                      type="date" name="date" required value={test.date} onChange={handleTestChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</label>
                    <input
                      type="time" name="time" required value={test.time} onChange={handleTestChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3"/> Duration</label>
                   <input
                    name="duration" required value={test.duration} onChange={handleTestChange}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><BarChart2 className="w-3 h-3"/> Marks</label>
                   <input
                    type="number" name="totalMarks" required value={test.totalMarks} onChange={handleTestChange}
                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                        <Hash className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Total Questions</p>
                        <p className="text-lg font-black text-white">{test.questions}</p>
                      </div>
                   </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Right Col: Questions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-dark border border-white/5 rounded-[2.5rem] shadow-2xl p-8 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BookOpen className="w-4 h-4" />
                </span>
                Question Database
              </h3>
              <button
                onClick={() => openQuestionModal()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/40 text-primary-400 border border-primary-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Question
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
                <p className="text-lg font-bold text-white mb-2">No Questions Found</p>
                <p className="text-sm text-slate-400 max-w-sm">This test currently has no questions. Add some questions manually using the button above.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {questions.map((q, index) => (
                  <div key={q.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group relative">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2.5 py-1 rounded bg-white/5 text-[10px] font-black text-slate-400 tracking-widest">Q{index + 1}</span>
                          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-[10px] font-black text-amber-500 tracking-widest border border-amber-500/20">{q.marks} Marks</span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-relaxed mb-4">{q.question}</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {['A', 'B', 'C', 'D'].map(optKey => {
                            const isCorrect = q.correctAnswer === optKey;
                            return (
                              <div key={optKey} className={`p-3 rounded-xl border flex gap-3 text-sm ${
                                isCorrect 
                                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-50' 
                                  : 'border-white/5 bg-white/5 text-slate-400'
                              }`}>
                                <span className={`font-black ${isCorrect ? 'text-emerald-400' : 'text-slate-500'}`}>{optKey}.</span>
                                <span className="flex-1 break-words">{q.options[optKey]}</span>
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                         <button
                           onClick={() => openQuestionModal(q)}
                           className="p-2.5 text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 rounded-xl transition-all border border-transparent hover:border-primary-400/20"
                           title="Edit Question"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => handleDeleteQuestion(q.id)}
                           className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all border border-transparent hover:border-rose-400/20"
                           title="Delete Question"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal for Question */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="glass-dark border border-white/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col">
              <div className="sticky top-0 glass-dark border-b border-white/5 px-8 py-6 flex items-center justify-between z-10">
                <h3 className="text-xl font-black text-white tracking-widest uppercase">
                  {editingQuestion.id ? 'Edit Question' : 'Add Question'}
                </h3>
                <button onClick={() => setIsQuestionModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="p-8 space-y-6">
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Text</label>
                  <textarea
                    required rows="3"
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all resize-none font-bold placeholder:text-slate-600"
                    placeholder="Enter the question here..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map(optKey => (
                    <div key={optKey} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                        <span>Option {optKey}</span>
                        {editingQuestion.correctAnswer === optKey && (
                          <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Correct</span>
                        )}
                      </label>
                      <input
                        required
                        value={editingQuestion.options[optKey] || ''}
                        onChange={(e) => setEditingQuestion({...editingQuestion, options: {...editingQuestion.options, [optKey]: e.target.value}})}
                        className={`w-full px-4 py-3 bg-white/5 border-2 rounded-xl text-sm transition-all font-medium ${
                          editingQuestion.correctAnswer === optKey ? 'border-emerald-500/50 text-white' : 'border-white/5 text-slate-300 focus:border-white/20'
                        }`}
                        placeholder={`Option ${optKey}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-4">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Correct Answer</label>
                      <select
                        value={editingQuestion.correctAnswer}
                        onChange={(e) => setEditingQuestion({...editingQuestion, correctAnswer: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/5 border border-emerald-500/30 rounded-2xl text-sm text-emerald-400 font-black focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer appearance-none"
                      >
                        {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt} className="bg-slate-900">Option {opt}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marks</label>
                      <input
                        type="number" min="1" required
                        value={editingQuestion.marks}
                        onChange={(e) => setEditingQuestion({...editingQuestion, marks: parseInt(e.target.value) || 1})}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-primary-500/30 transition-all font-bold"
                      />
                   </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button" onClick={() => setIsQuestionModalOpen(false)}
                    className="flex-1 py-4 px-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all"
                  >
                    Save Question
                  </button>
                </div>

              </form>
           </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="glass-dark border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">Reschedule Test</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Status will reset to Upcoming</p>
                </div>
              </div>
              <button onClick={() => setIsRescheduleOpen(false)} className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>

            <form onSubmit={handleReschedule} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> New Date
                  </label>
                  <input
                    type="date" required
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> New Time
                  </label>
                  <input
                    type="time" required
                    value={rescheduleTime}
                    onChange={e => setRescheduleTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ℹ️ Auto-launch will publish this test at the new scheduled time.</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button" onClick={() => setIsRescheduleOpen(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isRescheduling}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isRescheduling ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
