import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, TrendingUp, CalendarCheck, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

export default function AdminOverview() {
  const [statsData, setStatsData] = useState(() => {
    try {
      const cached = localStorage.getItem('admin_stats');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached admin stats:', e);
    }
    return { totalStudents: 0, activeCourses: 0, totalRevenue: '₹0' };
  });
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('admin_stats');
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.stats) {
          setStatsData(response.data.stats);
          localStorage.setItem('admin_stats', JSON.stringify(response.data.stats));
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Students', value: statsData.totalStudents, trend: '+12%', icon: Users, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
    { label: 'Active Courses', value: statsData.activeCourses, trend: '+2', icon: BookOpen, color: 'text-[#0EA5E9]', bg: 'bg-[#F0F9FF]' },
    { label: 'Total Revenue', value: statsData.totalRevenue, trend: '+8.5%', icon: CreditCard, color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
  ];

  return (
    <div className="space-y-5">
      
      {/* Metrics Cards - Compacted Padding & Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-[#4F46E5]/30 transition-all group">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">{stat.value}</h3>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center ${
                    stat.trend.startsWith('+') ? 'text-[#16A34A] bg-[#F0FDF4]' : 'text-[#DC2626] bg-[#FEF2F2]'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-5">
        
        {/* Recent Students Table (8/12 width) - Compact Padding & Sleek Row Heights */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">Recent Students</h3>
            <button className="text-[#4F46E5] hover:text-[#4338CA] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[9px] font-bold uppercase tracking-widest border-b border-slate-100">
                  <th className="px-4.5 py-3">Student</th>
                  <th className="px-4.5 py-3">Course</th>
                  <th className="px-4.5 py-3">Enrolled On</th>
                  <th className="px-4.5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[9px] font-extrabold text-[#4F46E5]">
                          SR
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#4F46E5] transition-colors">Sanjay Rajpoot</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">sanjay@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4.5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50/50 text-[#4F46E5] border border-indigo-100/50">
                        Web Systems
                      </span>
                    </td>
                    <td className="px-4.5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Mar {10 - i}, 2026</td>
                    <td className="px-4.5 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[9px] font-extrabold text-[#4F46E5]">
                        SR
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Sanjay Rajpoot</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">sanjay@example.com</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Course: <span className="text-slate-800 font-bold uppercase">Web Systems</span></span>
                    <span className="text-slate-400 uppercase font-bold tracking-tighter">Mar {10 - i}, 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (4/12 width) - Compacted Spacing & Sizes */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-[#F8FAFC]/50">
              <h3 className="text-base font-extrabold text-slate-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2.5">
              {[
                { label: 'Add New Course', icon: BookOpen, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
                { label: 'Add New Student', icon: Users, iconColor: 'text-[#0EA5E9]', bg: 'bg-[#F0F9FF]' },
                { label: 'Take Attendance', icon: CalendarCheck, iconColor: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
              ].map((action, idx) => (
                <button 
                  key={idx} 
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#4F46E5]/30 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center transition-all group-hover:scale-105`}>
                      <action.icon className={`w-4 h-4 ${action.color || action.iconColor}`} />
                    </div>
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{action.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-[#4F46E5] rounded-xl p-4.5 text-white relative overflow-hidden group shadow-lg shadow-[#4F46E5]/10">
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14 group-hover:scale-105 transition-transform"></div>
            <div className="relative z-10">
              <h4 className="font-extrabold text-sm mb-1 uppercase tracking-wide">Need help?</h4>
              <p className="text-xs text-white/80 mb-3.5 leading-relaxed">Check our documentation or contact support for assistance.</p>
              <button className="bg-white text-[#4F46E5] px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-[#EEF2FF] transition-colors shadow-sm cursor-pointer">
                Get Support
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
