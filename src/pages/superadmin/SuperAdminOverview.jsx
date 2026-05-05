import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CreditCard, Shield, TrendingUp, CalendarCheck, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    activeCourses: 0, 
    totalRevenue: '₹0',
    totalAdmins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [adminRes, saRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/superadmin/stats')
      ]);

      setStats({
        ...adminRes.data.stats,
        totalAdmins: saRes.data.stats.totalAdmins
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
    { title: 'Active Courses', value: stats.activeCourses, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Total Revenue', value: stats.totalRevenue, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Staff Members', value: stats.totalAdmins, icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Institute Overview</h2>
          <p className="text-xs font-medium text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-primary-500/30 transition-all">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{stat.title}</p>
                  <h3 className="text-lg font-bold text-slate-900 leading-none">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Quick Management */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />
            Quick Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Student Directory', desc: 'Manage enrollments', path: '/admin/students', color: 'primary' },
              { title: 'Course Catalog', desc: 'Edit curriculum', path: '/admin/courses', color: 'emerald' },
              { title: 'Fee Management', desc: 'Track revenue', path: '/admin/finance', color: 'amber' },
              { title: 'Staff Control', desc: 'Manage admins', path: '/superadmin/admins', color: 'rose' }
            ].map((item, idx) => (
              <Link 
                key={idx} 
                to={item.path} 
                className={`p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-${item.color}-50 hover:border-${item.color}-200 transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-sm font-bold text-slate-900 group-hover:text-${item.color}-600 transition-colors`}>{item.title}</h4>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-slate-300 group-hover:text-${item.color}-500 transition-all group-hover:translate-x-1`} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Status Card - Refactored to Light Mode */}
        <div className="lg:col-span-4 bg-primary-50/50 p-5 rounded-xl border border-primary-100 flex flex-col relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-base font-bold text-slate-900 mb-4">Institute Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-primary-100 shadow-sm">
                <span className="text-slate-600 text-[13px] font-medium">Server Status</span>
                <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-primary-100 shadow-sm">
                <span className="text-slate-600 text-[13px] font-medium">Database</span>
                <span className="text-emerald-600 text-[11px] font-bold uppercase tracking-wider">Connected</span>
              </div>
              
              <div className="mt-2 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-primary-200/50">
                <p className="text-[11px] text-primary-800 leading-relaxed font-medium">
                  <span className="font-bold">Note:</span> Running in **Single Institute Mode**. All features are optimized for your institution.
                </p>
              </div>
            </div>
          </div>
          {/* Decorative subtle gradient */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-200/30 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}
