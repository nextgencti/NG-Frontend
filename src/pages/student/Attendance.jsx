import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../lib/axios';

export default function Attendance() {
  const [data, setData] = useState({ stats: null, loading: true });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get('/student/attendance');
        setData({ stats: response.data.stats, loading: false });
      } catch (error) {
        console.error(error);
        setData({ stats: null, loading: false });
      }
    };
    fetchAttendance();
  }, []);

  const statsList = [
    { label: 'Total Present', value: data.stats?.totalPresent ? `${data.stats.totalPresent} Days` : '-', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Absent', value: data.stats?.totalAbsent ? `${data.stats.totalAbsent} Days` : '-', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Overall %', value: data.stats?.percentage || '-', icon: CalendarIcon, color: 'text-primary-500', bg: 'bg-primary-50' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Attendance</h2>
          <p className="text-slate-400 mt-2 font-medium">Track your class attendance and overall performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statsList.map((stat, index) => {
          const Icon = stat.icon;
          const statColors = {
            'text-emerald-500': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            'text-rose-500': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            'text-primary-500': 'text-primary-400 bg-primary-500/10 border-primary-500/20'
          };
          const colorClass = statColors[stat.color] || 'text-white bg-white/5 border-white/10';

          return (
            <div key={index} className="glass-dark p-6 flex flex-col gap-5 hover:border-white/20 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorClass} group-hover:scale-110 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                {data.loading ? (
                   <div className="w-24 h-9 bg-white/5 animate-pulse mt-2 rounded-xl"></div>
                ) : (
                   <p className="text-3xl font-bold text-white tracking-tighter mt-1">{stat.value}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Details Table */}
      <div className="glass-dark border border-white/5 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white tracking-tight">Attendance Logs</h3>
          <button className="text-xs font-black uppercase tracking-widest text-primary-400 hover:text-primary-300 transition-colors">
            View Full Month
          </button>
        </div>
        
        {data.loading ? (
           <div className="p-12 text-center text-slate-500 animate-pulse font-bold tracking-widest uppercase text-xs">Loading Logs...</div>
        ) : data.stats?.recent?.length > 0 ? (
           <div className="divide-y divide-white/5">
             {data.stats.recent.map((rec, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary-500/20 transition-all">
                      <CalendarIcon className="text-slate-500 w-5 h-5 group-hover:text-primary-400 transition-colors"/>
                    </div>
                    <span className="font-bold text-white tracking-wide">{rec.date}</span>
                  </div>
                  <div>
                    {rec.status === 'present' ? 
                      <span className="inline-flex gap-2 items-center px-4 py-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>
                      : 
                      <span className="inline-flex gap-2 items-center px-4 py-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> Absent</span>
                    }
                  </div>
                </div>
             ))}
           </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
              <Clock className="w-10 h-10 text-slate-700 relative" />
            </div>
            <h4 className="text-2xl font-black text-white uppercase tracking-widest">No Records Found</h4>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              Your attendance records will appear here once you start attending classes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
