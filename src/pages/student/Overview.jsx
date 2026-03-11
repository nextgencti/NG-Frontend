import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, CalendarCheck, Clock, CheckCircle2, Zap, CreditCard } from 'lucide-react';
import IDCard from '../../components/shared/IDCard';
import { useState } from 'react';

export default function StudentOverview() {
  const { currentUser } = useAuth();
  const [showIDCard, setShowIDCard] = useState(false);
  
  const stats = [
    { label: 'Attendance', value: '85%', icon: CalendarCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Active Courses', value: '2', icon: BookOpen, color: 'text-primary-400', bg: 'bg-primary-500/10 border-primary-500/20' },
    { label: 'Next Class', value: '10:00 AM', icon: Clock, color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/20' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-dark p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primary-600/20 to-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative z-10 flex-1">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-300">{currentUser?.name?.split(' ')[0]}</span>! 👋
          </h2>
          <p className="text-slate-400 max-w-xl text-lg leading-relaxed">
            You have a Web Development class coming up in 2 hours. Keep up the great work! Your attendance is looking solid this week.
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setShowIDCard(true)}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5 text-primary-400" />
            My ID Card
          </button>
          <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-accent-300" />
            Join Class
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-dark p-6 flex items-center gap-5 hover:border-white/20 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${stat.bg} group-hover:scale-110 transition-transform`}>
                <Icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity / Agenda */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col - 2/3 */}
        <div className="lg:col-span-2 glass-dark overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white tracking-tight">Today's Schedule</h3>
            <span className="text-xs font-bold text-primary-400">View Full Schedule</span>
          </div>
          <div className="divide-y divide-white/5">
            {/* Mock Schedule Item */}
            <div className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors group">
              <div className="min-w-[4.5rem] text-sm font-bold text-slate-500 mt-1 uppercase tracking-tighter">10:00 AM</div>
              <div className="relative mt-2">
                <div className="w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-500/20"></div>
                <div className="absolute top-3 left-1.5 w-[1px] h-12 bg-white/5"></div>
              </div>
              <div className="flex-1 ml-2">
                <h4 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">Advanced React Patterns</h4>
                <p className="text-sm text-slate-400 mt-1">Web Development Bootcamp • Zoom MTG</p>
              </div>
              <span className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-500/20">Upcoming</span>
            </div>
            
            {/* Mock Schedule Item */}
            <div className="p-6 flex items-start gap-4 hover:bg-white/5 transition-colors opacity-60 group">
              <div className="min-w-[4.5rem] text-sm font-bold text-slate-500 mt-1 uppercase tracking-tighter">08:00 AM</div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 ring-4 ring-emerald-500/20"></div>
              <div className="flex-1 ml-2">
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">JavaScript DOM Basics</h4>
                <p className="text-sm text-slate-400 mt-1">Web Development Bootcamp • Recorded</p>
              </div>
              <span className="px-3 py-1.5 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 border border-white/10">
                <CheckCircle2 className="w-3 h-3" /> Attended
              </span>
            </div>
          </div>
        </div>

        {/* Right Col - 1/3 */}
        <div className="glass-dark p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-8">Quick Links</h3>
          <div className="space-y-6 relative z-10">
            <div className="relative pl-6 border-l-2 border-primary-500/30 group cursor-pointer">
              <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-150 transition-transform"></span>
              <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Hackathon Registrations Open</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Join the upcoming weekend hackathon to level up your portfolio.</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> 2 hours ago
              </div>
            </div>
            <div className="relative pl-6 border-l-2 border-white/10 group cursor-pointer">
              <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-700 transition-colors group-hover:bg-accent-500"></span>
              <p className="text-sm font-bold text-white group-hover:text-accent-400 transition-colors">New Course Material Added</p>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Module 4 resources are now available in your dashboard.</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Clock className="w-3 h-3" /> Yesterday
              </div>
            </div>
          </div>
          <button className="w-full mt-10 py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/5 shadow-xl">
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
