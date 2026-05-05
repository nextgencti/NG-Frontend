import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Award, ChevronRight, Download, PlayCircle, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function StudentOverview() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    activeCourses: 0,
    attendancePercent: '0%',
    firstCourseId: null,
    isLoading: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, attendanceRes] = await Promise.all([
          api.get('/student/courses'),
          api.get('/student/attendance')
        ]);

        const courses = coursesRes.data.success ? coursesRes.data.courses : [];
        const activeCourses = courses.length;
        const firstCourseId = courses.length > 0 ? courses[0].id : null;
        const attendancePercent = attendanceRes.data.success ? attendanceRes.data.stats.percentage : '0%';

        setDashboardData({
          activeCourses,
          attendancePercent,
          firstCourseId,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setDashboardData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (dashboardData.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white rounded-3xl p-8 sm:p-10 border border-indigo-100/50 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Decorative subtle background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
            Welcome, <span className="text-primary-600">{currentUser?.name?.split(' ')[0] || 'Student'}</span> 👋
          </h2>
          <p className="text-slate-500 text-sm font-medium">Continue your learning journey today.</p>
        </div>

        {/* Hero Stats */}
        <div className="relative z-10 flex gap-4 sm:gap-6">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white shadow-sm flex flex-col items-center md:items-start min-w-[120px]">
            <span className="text-3xl font-black text-slate-900">{dashboardData.activeCourses}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Courses</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white shadow-sm flex flex-col items-center md:items-start min-w-[120px]">
            <span className="text-3xl font-black text-slate-900">{dashboardData.attendancePercent}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Progress</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <button 
          onClick={() => navigate('/dashboard/courses')}
          className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900">Continue Course</h3>
            <p className="text-xs text-slate-500 mt-0.5">Resume where you left off</p>
          </div>
        </button>

        <button 
          onClick={() => {
            if (dashboardData.firstCourseId) {
              navigate(`/dashboard/courses/${dashboardData.firstCourseId}/classroom`);
            } else {
              toast('Enroll in a course first to access the classroom', { icon: '🎓' });
              navigate('/dashboard/courses');
            }
          }}
          className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <PlayCircle className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900">Classroom</h3>
            <p className="text-xs text-slate-500 mt-0.5">Access your lessons</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/dashboard/certificates')}
          className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-900">Certificates</h3>
            <p className="text-xs text-slate-500 mt-0.5">Download credentials</p>
          </div>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Courses & Notes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 3. My Courses Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">My Courses</h3>
              <button onClick={() => navigate('/dashboard/courses')} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer">
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6 group hover:border-primary-200 transition-colors">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-10 h-10 text-slate-300" />
              </div>
              <div className="flex-1 w-full">
                <h4 className="text-lg font-bold text-slate-900 mb-1">Course on Computer Concepts (CCC)</h4>
                <p className="text-sm text-slate-500 mb-4">Master the fundamentals of computer hardware and software.</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Progress</span>
                  <span className="text-xs font-bold text-primary-600">30% (3/10 Modules)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <button onClick={() => navigate('/dashboard/courses')} className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap cursor-pointer">
                Continue Learning
              </button>
            </div>
          </section>

          {/* 4. Course Content / Notes */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Notes & Materials</h3>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[
                  { title: 'Chapter 1 – Basics of Computer', type: 'PDF' },
                  { title: 'Chapter 2 – Hardware Components', type: 'PDF' },
                  { title: 'Chapter 3 – Introduction to Operating Systems', type: 'PDF' }
                ].map((note, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Course Material • {note.type}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Tracking & Updates */}
        <div className="space-y-8">
          
          {/* 5. Progress Tracking */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Performance</h3>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">Engagement Score</span>
                  <span className="text-sm font-bold text-emerald-600">{dashboardData.attendancePercent}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: dashboardData.attendancePercent === '0%' ? '0%' : dashboardData.attendancePercent }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">Modules Completed</span>
                  <span className="text-sm font-bold text-primary-600">3 of 10</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Updates Section */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Institute Updates</h3>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">New notes added for Chapter 4</p>
                    <p className="text-xs text-slate-500 mt-1">Access the latest PDF materials in your course.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Course Syllabus Updated</p>
                    <p className="text-xs text-slate-500 mt-1">Check the updated curriculum for CCC.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Platform Maintenance</p>
                    <p className="text-xs text-slate-500 mt-1">Scheduled for this weekend.</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
