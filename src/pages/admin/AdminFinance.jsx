import React from 'react';
import { CreditCard, TrendingUp, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminFinance() {
  const transactions = [
    { id: 'TXN-901', student: 'Sanjay Rajpoot', course: 'Web Development', amount: '₹4,500', date: 'Mar 10, 2026', status: 'completed', method: 'UPI' },
    { id: 'TXN-902', student: 'Amit Kumar', course: 'UI/UX Design', amount: '₹3,000', date: 'Mar 09, 2026', status: 'pending', method: 'Bank Transfer' },
    { id: 'TXN-903', student: 'Neha Sharma', course: 'App Development', amount: '₹6,000', date: 'Mar 08, 2026', status: 'completed', method: 'Card ending 4242' },
  ];

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Ledger</h2>
          <p className="text-slate-500 text-xs font-semibold">Monitor revenue streams, outstanding dues, and fiscal operations.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all border border-slate-200 shadow-sm active:scale-95 cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          Export Data
        </button>
      </div>

      {/* Grid - Compact Spacing */}
      <div className="grid sm:grid-cols-2 gap-4">
        
        {/* Revenue Overview Card - Sleeker and Compact */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4.5 text-white shadow-lg shadow-primary-500/10 relative overflow-hidden flex flex-col justify-between min-h-[160px] border border-white/10 group transition-all hover:shadow-xl hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:scale-105 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-primary-100/60 font-bold tracking-widest text-[9px] uppercase flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Capital Intake
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">₹1,25,400</p>
            </div>
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 border-t border-white/10 pt-3 flex justify-between items-center text-primary-50">
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">+15.2% Velocity</span>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">42 Dispersals</span>
          </div>
        </div>

        {/* Pending Card - Sleeker and Compact */}
        <div className="bg-white rounded-xl p-4.5 border border-slate-200 flex flex-col justify-between min-h-[160px] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-xl -mr-10 -mt-10"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Dues</h3>
              <p className="text-2xl font-extrabold text-rose-600 tracking-tight">₹42,000</p>
            </div>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-bold uppercase tracking-widest rounded-md border border-rose-100 animate-pulse">Critical Priority</span>
          </div>
          
          <div className="relative z-10 border-t border-slate-100 pt-3 flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">18 Delinquent Records</span>
            <button className="py-1 px-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md font-bold text-[9px] uppercase tracking-widest transition-all border border-slate-200 active:scale-95 cursor-pointer">
              Send Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List - Compact Rows */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Transaction Logs</h3>
          <button className="text-primary-600 hover:text-primary-700 text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer">Access Archives</button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="py-3 px-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 shadow-sm ${
                  txn.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                } group-hover:scale-105 transition-transform duration-500`}>
                  {txn.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors">{txn.student}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{txn.course} <span className="text-slate-200 mx-1.5">|</span> {txn.method}</p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-1">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight">{txn.amount}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter sm:block hidden">{txn.date}</span>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                  txn.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
