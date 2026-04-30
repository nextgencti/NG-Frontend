import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, TrendingUp, CalendarCheck, ArrowRight } from 'lucide-react';
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
    { label: 'Total Students', value: statsData.totalStudents, trend: '+12%', icon: Users, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
    { label: 'Active Courses', value: statsData.activeCourses, trend: '+2', icon: BookOpen, color: 'text-[#0EA5E9]', bg: 'bg-[#F0F9FF]' },
    { label: 'Total Revenue', value: statsData.totalRevenue, trend: '+8.5%', icon: CreditCard, color: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 rounded-[12px] border border-[#E5E7EB] shadow-sm flex items-center justify-between hover:border-[#4F46E5]/30 transition-all group">
              <div>
                <p className="text-[12px] font-medium text-[#6B7280] mb-1">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-[22px] font-bold text-[#111827] leading-none tracking-tight">{stat.value}</h3>
                  <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md flex items-center ${
                    stat.trend.startsWith('+') ? 'text-[#16A34A] bg-[#F0FDF4]' : 'text-[#DC2626] bg-[#FEF2F2]'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-[10px] ${stat.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Recent Students Table (8/12 width) */}
        <div className="lg:col-span-8 bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#F1F5F9] flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-[#111827]">Recent Students</h3>
            <button className="text-[#4F46E5] hover:text-[#4338CA] text-[13px] font-semibold flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#6B7280] text-[12px] font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Enrolled On</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] font-bold text-[#4F46E5]">
                          SR
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors">Sanjay Rajpoot</p>
                          <p className="text-[12px] text-[#6B7280]">sanjay@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-[#4B5563]">Web Systems</span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#6B7280]">Mar {10 - i}, 2026</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[#F1F5F9]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[11px] font-bold text-[#4F46E5]">
                        SR
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#111827]">Sanjay Rajpoot</p>
                        <p className="text-[12px] text-[#6B7280]">sanjay@example.com</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0FDF4] text-[#16A34A]">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#6B7280]">Course: <span className="text-[#111827] font-medium">Web Systems</span></span>
                    <span className="text-[#6B7280]">Mar {10 - i}, 2026</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F1F5F9] bg-[#F8FAFC]/50">
              <h3 className="text-[18px] font-semibold text-[#111827]">Quick Actions</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Add New Course', icon: BookOpen, color: 'text-[#4F46E5]', bg: 'bg-[#EEF2FF]' },
                { label: 'Add New Student', icon: Users, iconColor: 'text-[#0EA5E9]', bg: 'bg-[#F0F9FF]' },
                { label: 'Take Attendance', icon: CalendarCheck, iconColor: 'text-[#16A34A]', bg: 'bg-[#F0FDF4]' },
              ].map((action, idx) => (
                <button 
                  key={idx} 
                  className="w-full flex items-center justify-between p-3 rounded-[8px] border border-[#E5E7EB] bg-white hover:bg-[#F8FAFC] hover:border-[#4F46E5]/30 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg ${action.bg} flex items-center justify-center transition-all group-hover:scale-110`}>
                      <action.icon className={`w-4 h-4 ${action.color || action.iconColor}`} />
                    </div>
                    <span className="font-semibold text-[14px] text-[#111827]">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#4F46E5] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-[#4F46E5] rounded-[12px] p-5 text-white relative overflow-hidden group shadow-lg shadow-[#4F46E5]/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
              <h4 className="font-bold text-[16px] mb-1">Need help?</h4>
              <p className="text-[13px] text-white/80 mb-4 leading-relaxed">Check our documentation or contact support for assistance.</p>
              <button className="bg-white text-[#4F46E5] px-4 py-2 rounded-[8px] text-[13px] font-bold hover:bg-[#EEF2FF] transition-colors shadow-sm">
                Get Support
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

