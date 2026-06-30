import React, { useState, useEffect, useMemo } from 'react';
import { Users, BookOpen, CreditCard, AlertCircle, TrendingUp, ArrowRight, Activity, UserPlus, PlusCircle, Receipt, ShieldPlus, IndianRupee, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

// ─── Custom SVG Bar Chart ────────────────────────────────────────────────────
function BarChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => Math.max(d.Paid, d.Pending)), 1);
  const chartH = 180;
  const chartW = 100; // percentage based
  const barGroupW = chartW / data.length;
  const barW = barGroupW * 0.3;
  const gap = barGroupW * 0.08;

  // Y-axis gridlines (4 steps)
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const formatAmount = (v) => {
    if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
    return `₹${v}`;
  };

  return (
    <div className="w-full">
      <div className="relative" style={{ height: chartH + 40 }}>
        {/* Grid lines */}
        {gridLines.map((ratio, i) => (
          <div key={i} className="absolute left-10 right-0 border-t border-slate-100" style={{ bottom: 28 + ratio * chartH }}>
            <span className="absolute -left-10 -top-2.5 text-[9px] font-bold text-slate-300 w-9 text-right">
              {formatAmount(Math.round(maxVal * ratio))}
            </span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute left-10 right-0 bottom-0 flex items-end" style={{ height: chartH + 28 }}>
          {data.map((item, idx) => {
            const paidH = (item.Paid / maxVal) * chartH;
            const pendingH = (item.Pending / maxVal) * chartH;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center" style={{ paddingBottom: 28 }}>
                <div className="flex items-end gap-[3px] group relative">
                  {/* Paid bar */}
                  <div className="relative group/paid">
                    <div
                      className="rounded-t-[4px] transition-all duration-500 ease-out hover:opacity-80"
                      style={{
                        width: `${barW}%`,
                        minWidth: 14,
                        height: Math.max(paidH, 3),
                        background: 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
                      }}
                    />
                    <div className="opacity-0 group-hover/paid:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none transition-opacity">
                      {formatAmount(item.Paid)}
                    </div>
                  </div>
                  {/* Pending bar */}
                  <div className="relative group/pending">
                    <div
                      className="rounded-t-[4px] transition-all duration-500 ease-out hover:opacity-80"
                      style={{
                        width: `${barW}%`,
                        minWidth: 14,
                        height: Math.max(pendingH, 3),
                        background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
                      }}
                    />
                    <div className="opacity-0 group-hover/pending:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold py-1 px-2 rounded-md whitespace-nowrap z-20 pointer-events-none transition-opacity">
                      {formatAmount(item.Pending)}
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{item.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }} />
          <span className="text-[10px] font-bold text-slate-500">Paid</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: 'linear-gradient(180deg, #f97316, #ea580c)' }} />
          <span className="text-[10px] font-bold text-slate-500">Pending</span>
        </div>
      </div>
    </div>
  );
}

// ─── Custom SVG Donut Chart ──────────────────────────────────────────────────
function DonutChart({ data }) {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 70;
  const stroke = 22;
  const center = 90;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  const segments = data.map((item, i) => {
    const ratio = item.value / total;
    const dashLen = circumference * ratio;
    const dashOffset = circumference - cumulativeOffset;
    cumulativeOffset += dashLen;
    return {
      ...item,
      color: COLORS[i % COLORS.length],
      dashLen,
      dashOffset,
      percentage: Math.round(ratio * 100),
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`}>
          {/* Background ring */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-700 ease-out hover:opacity-75"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${center}px ${center}px` }}
            />
          ))}
          {/* Center text */}
          <text x={center} y={center - 6} textAnchor="middle" className="fill-slate-800 text-[22px] font-extrabold">{total}</text>
          <text x={center} y={center + 12} textAnchor="middle" className="fill-slate-400 text-[9px] font-bold uppercase tracking-widest">Students</text>
        </svg>
      </div>

      {/* Legend list */}
      <div className="w-full space-y-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between px-1 py-1 rounded-md hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[140px]">{seg.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">{seg.value}</span>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{seg.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ────────────────────────────────────────────────
export default function SuperAdminOverview() {
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('superadmin_stats_v2');
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached superadmin stats:', e);
    }
    return { 
      totalStudents: 0, 
      activeCourses: 0, 
      paidFees: 0,
      pendingFees: 0,
      totalRevenue: 0,
      totalAdmins: 0
    };
  });
  const [charts, setCharts] = useState(() => {
    try {
      const cached = localStorage.getItem('superadmin_charts');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return { trend: [], distribution: [] };
  });
  const [isLoading, setIsLoading] = useState(() => {
    return !localStorage.getItem('superadmin_stats_v2');
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/superadmin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts || { trend: [], distribution: [] });
        localStorage.setItem('superadmin_stats_v2', JSON.stringify(res.data.stats));
        localStorage.setItem('superadmin_charts', JSON.stringify(res.data.charts || { trend: [], distribution: [] }));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Also try the admin stats endpoint as a fallback for basic numbers
      try {
        const adminRes = await api.get('/admin/stats');
        if (adminRes.data.success) {
          setStats(prev => ({ ...prev, ...adminRes.data.stats }));
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const statCards = useMemo(() => [
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      gradient: 'from-indigo-500 to-violet-600',
      bgGlow: 'bg-indigo-500/10',
      iconBg: 'bg-indigo-500/15',
      iconColor: 'text-indigo-600',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Active Courses', 
      value: stats.activeCourses, 
      icon: BookOpen, 
      gradient: 'from-emerald-500 to-teal-600',
      bgGlow: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      trend: 'Live',
      trendUp: true
    },
    { 
      title: 'Fees Collected', 
      value: formatCurrency(stats.paidFees), 
      icon: Wallet, 
      gradient: 'from-green-500 to-emerald-600',
      bgGlow: 'bg-green-500/10',
      iconBg: 'bg-green-500/15',
      iconColor: 'text-green-600',
      trend: 'Paid',
      trendUp: true
    },
    { 
      title: 'Pending Fees', 
      value: formatCurrency(stats.pendingFees), 
      icon: AlertCircle, 
      gradient: 'from-rose-500 to-pink-600',
      bgGlow: 'bg-rose-500/10',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      trend: 'Due',
      trendUp: false
    },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-7 w-52 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
          <div className="lg:col-span-7 h-72 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-5 h-72 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Institute Dashboard</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Real-time analytics and financial overview.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          Live Data
        </div>
      </div>

      {/* ── Stat Cards Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="relative bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-300">
              {/* Background glow */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 ${stat.bgGlow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 sm:p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    stat.trendUp 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {stat.trendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none tracking-tight">{stat.value}</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Fee Collections Trend - Bar Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Fee Collections Trend
              </h3>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Last 6 months payment activity</p>
            </div>
            <div className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              Monthly
            </div>
          </div>
          <BarChart data={charts.trend} />
        </div>

        {/* Course Enrollment Share - Donut Chart */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-500" />
                Course Distribution
              </h3>
              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Student enrollment share by course</p>
            </div>
          </div>
          <DonutChart data={charts.distribution} />
        </div>
      </div>

      {/* ── Staff & Revenue Mini Stats ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-5 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Staff Members</span>
            </div>
            <h3 className="text-2xl font-extrabold">{stats.totalAdmins}</h3>
            <p className="text-[10px] text-white/60 font-medium mt-1">Active team members</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-5 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Total Revenue</span>
            </div>
            <h3 className="text-2xl font-extrabold">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="text-[10px] text-white/60 font-medium mt-1">Lifetime collections</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 rounded-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/15 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Outstanding</span>
            </div>
            <h3 className="text-2xl font-extrabold">{formatCurrency(stats.pendingFees)}</h3>
            <p className="text-[10px] text-white/60 font-medium mt-1">Pending dues balance</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Add Student */}
          <Link
            to="/admin/students"
            className="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white">Add Student</h4>
                <p className="text-[10px] text-white/60 font-medium">New enrollment</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Add Course */}
          <Link
            to="/admin/courses"
            className="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <PlusCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white">Add Course</h4>
                <p className="text-[10px] text-white/60 font-medium">Create curriculum</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Transactions */}
          <Link
            to="/admin/finance"
            className="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white">Transactions</h4>
                <p className="text-[10px] text-white/60 font-medium">View payments</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          {/* Add Staff */}
          <Link
            to="/superadmin/admins"
            className="group relative p-4 rounded-xl overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl" />
            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm group-hover:bg-white/25 transition-colors">
                <ShieldPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-white">Add Staff</h4>
                <p className="text-[10px] text-white/60 font-medium">New team member</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
