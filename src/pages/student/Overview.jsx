import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CalendarCheck, Clock, CheckCircle2, Zap, CreditCard } from 'lucide-react';
import IDCard from '../../components/shared/IDCard';
import { useState } from 'react';

export default function StudentOverview() {
  const { currentUser } = useAuth();
  const [showIDCard, setShowIDCard] = useState(false);
  
  const stats = [
    { label: 'Attendance', value: '85%', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Active Courses', value: '2', icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-100' },
    { label: 'Next Class', value: '10:00 AM', icon: Clock, color: 'text-accent-600', bg: 'bg-accent-50 border-accent-100' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-dark p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group rounded-2xl border border-slate-100 shadow-sm bg-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 flex-1 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
            Welcome back, <span className="text-primary-600">{currentUser?.name?.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed font-medium">
            You have a Web Development class coming up in 2 hours. Keep up the great work! Your attendance is looking solid this week.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setShowIDCard(true)}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold border border-slate-200 transition-all hover:shadow-sm flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <CreditCard className="w-4 h-4 text-primary-600" />
            My ID Card
          </button>
          <button className="w-full sm:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/10 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-accent-300" />
            Join Class
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-dark p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bg} group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity / Agenda */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col - 2/3 */}
        <div className="lg:col-span-2 glass-dark overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest cursor-pointer hover:text-primary-700">Full Schedule</span>
          </div>
          <div className="divide-y divide-slate-50">
            {/* Mock Schedule Item */}
            <div className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="min-w-[4rem] text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">10:00 AM</div>
              <div className="relative mt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-600 ring-4 ring-primary-500/10"></div>
                <div className="absolute top-2.5 left-[4.5px] w-[1px] h-12 bg-slate-100"></div>
              </div>
              <div className="flex-1 ml-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Advanced React Patterns</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Web Development • Zoom</p>
              </div>
              <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-primary-100">Upcoming</span>
            </div>
            
            {/* Mock Schedule Item */}
            <div className="p-5 flex items-start gap-4 hover:bg-slate-50/50 transition-colors opacity-60 group">
              <div className="min-w-[4rem] text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">08:00 AM</div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-2 ring-4 ring-emerald-500/10"></div>
              <div className="flex-1 ml-1">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">JavaScript DOM Basics</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Web Development • Recorded</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" /> Attended
              </span>
            </div>
          </div>
        </div>

        {/* Right Col - 1/3 */}
        <div className="glass-dark p-5 relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6">Quick Links</h3>
          <div className="space-y-5 relative z-10">
            <div className="relative pl-5 border-l border-primary-500/30 group cursor-pointer">
              <span className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(99,102,241,0.2)] group-hover:scale-125 transition-transform"></span>
              <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Hackathon Registrations</p>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Join the upcoming weekend hackathon to level up your portfolio.</p>
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> 2 hours ago
              </div>
            </div>
            <div className="relative pl-5 border-l border-slate-100 group cursor-pointer">
              <span className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-200 transition-colors group-hover:bg-accent-500"></span>
              <p className="text-sm font-bold text-slate-900 group-hover:text-accent-600 transition-colors">New Course Material</p>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Module 4 resources are now available in your dashboard.</p>
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> Yesterday
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-3 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all border border-slate-200 shadow-sm active:scale-95">
            View All Updates
          </button>
        </div>

      </div>

      {showIDCard && (
        <IDCard 
          student={currentUser} 
          onClose={() => setShowIDCard(false)} 
        />
      )}
    </div>
  );
}
