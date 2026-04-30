import React, { useState, useEffect } from 'react';
import { Building2, Users, Shield, Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';


export default function SuperAdminOverview() {
  const [stats, setStats] = useState({ totalInstitutes: 0, totalStudents: 0, totalAdmins: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/superadmin/stats');
      setStats(prev => ({ ...prev, ...response.data.stats }));
      
      // Also fetch pending requests count
      const reqResponse = await api.get('/superadmin/institute-requests');
      const pendingCount = reqResponse.data.requests.filter(r => r.status === 'pending').length;
      setStats(prev => ({ ...prev, pendingRequests: pendingCount }));
    } catch (error) {

      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Institutes', value: stats.totalInstitutes, icon: Building2, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { title: 'Total Admins', value: stats.totalAdmins, icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight">System Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="glass-dark p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.pendingRequests > 0 && (
        <div className="bg-gradient-to-r from-amber-600/20 to-amber-500/10 border border-amber-500/30 p-6 rounded-2xl flex items-center justify-between text-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold">Pending Registration Requests</h4>
              <p className="text-sm text-amber-200/70">You have {stats.pendingRequests} new institution registration request(s) waiting for approval.</p>
            </div>
          </div>
          <Link to="/superadmin/requests" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold transition-all flex items-center gap-2 group whitespace-nowrap">
            Review Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

    </div>
  );
}
