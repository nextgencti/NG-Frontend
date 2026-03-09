import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, TrendingUp, CalendarCheck, MoreVertical } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminOverview() {
  const [statsData, setStatsData] = useState({ totalStudents: 0, activeCourses: 0, totalRevenue: '₹0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStatsData(response.data.stats);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Students', value: statsData.totalStudents, trend: '+12%', icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Active Courses', value: statsData.activeCourses, trend: '+2', icon: BookOpen, color: 'text-accent-500', bg: 'bg-accent-50' },
    { label: 'Total Revenue', value: statsData.totalRevenue, trend: '+8.5%', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h2>
          <p className="text-slate-400 font-medium">Quick summary of your school's performance.</p>
        </div>
        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 backdrop-blur-md shadow-xl active:scale-95">
          Generate Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-dark p-8 rounded-[2.5rem] border border-white/10 flex items-start justify-between group hover:border-white/20 transition-all duration-500 relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors`}></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                  <span className="text-xs font-black text-emerald-400 flex items-center bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Recent Enrollments (8/12 width) */}
        <div className="lg:col-span-8 glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xl font-black text-white">Recent Students</h3>
            <button className="text-primary-400 hover:text-primary-300 text-sm font-black uppercase tracking-widest transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="p-6">Student</th>
                  <th className="p-6">Course</th>
                  <th className="p-6">Enrolled On</th>
                  <th className="p-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-white/10 flex items-center justify-center text-xs font-black text-primary-400">
                          SR
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">Sanjay Rajpoot</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">sanjay@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Web Systems</span>
                    </td>
                    <td className="p-6 text-xs font-bold text-slate-500">Mar {10 - i}, 2026</td>
                    <td className="p-6 text-right">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions (4/12 width) */}
        <div className="lg:col-span-4 glass-dark rounded-[2.5rem] border border-white/5 flex flex-col shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xl font-black text-white">Quick Actions</h3>
          </div>
          <div className="p-8 space-y-5">
            <button className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-primary-600/20 hover:border-primary-500/50 text-slate-300 hover:text-white transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-primary-500/20 flex items-center justify-center transition-all duration-300">
                  <BookOpen className="w-6 h-6 text-slate-400 group-hover:text-primary-400" />
                </div>
                <span className="font-bold text-sm">Add New Course</span>
              </div>
              <MoreVertical className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </button>
            <button className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-accent-600/20 hover:border-accent-500/50 text-slate-300 hover:text-white transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-accent-500/20 flex items-center justify-center transition-all duration-300">
                  <Users className="w-6 h-6 text-slate-400 group-hover:text-accent-400" />
                </div>
                <span className="font-bold text-sm">Add New Student</span>
              </div>
              <MoreVertical className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </button>
            <button className="w-full flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-emerald-600/20 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-emerald-500/20 flex items-center justify-center transition-all duration-300">
                  <CalendarCheck className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <span className="font-bold text-sm">Take Attendance</span>
              </div>
              <MoreVertical className="w-5 h-5 text-slate-600 group-hover:text-white" />
            </button>
          </div>
        </div>

      </div>
    </div>

  );
}
