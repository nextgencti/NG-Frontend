import React from 'react';
import { CreditCard, TrendingUp, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminFinance() {
  const transactions = [
    { id: 'TXN-901', student: 'Sanjay Rajpoot', course: 'Web Development', amount: '₹4,500', date: 'Mar 10, 2026', status: 'completed', method: 'UPI' },
    { id: 'TXN-902', student: 'Amit Kumar', course: 'UI/UX Design', amount: '₹3,000', date: 'Mar 09, 2026', status: 'pending', method: 'Bank Transfer' },
    { id: 'TXN-903', student: 'Neha Sharma', course: 'App Development', amount: '₹6,000', date: 'Mar 08, 2026', status: 'completed', method: 'Card ending 4242' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Ledger</h2>
          <p className="text-slate-500 text-sm font-medium">Monitor revenue streams, outstanding dues, and fiscal operations.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-200 shadow-sm active:scale-95">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        
        {/* Revenue Overview Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/10 relative overflow-hidden flex flex-col justify-between min-h-[220px] border border-white/10 group transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div>
              <p className="text-primary-100/60 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Capital Intake
              </p>
              <p className="text-4xl sm:text-5xl font-bold mt-2 tracking-tight">₹1,25,400</p>
            </div>
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 border-t border-white/10 pt-4 flex justify-between items-center text-primary-50">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg">+15.2% Velocity</span>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg">42 Dispersals</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-dark rounded-2xl p-6 border border-slate-100 flex flex-col justify-center min-h-[220px] shadow-sm relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-rose-500/10 transition-colors"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-lg font-bold text-slate-900">Outstanding Dues</h3>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-rose-100 animate-pulse">Critical Priority</span>
          </div>
          <p className="text-4xl font-bold text-rose-600 mb-1 tracking-tight relative z-10">₹42,000</p>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest relative z-10">Inventory: 18 Delinquent Records</p>
          <div className="mt-6 pt-6 border-t border-slate-50 relative z-10">
            <button className="w-full py-3 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border border-slate-100 active:scale-95 shadow-sm">
              Execute Automated Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-dark rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Transaction Logs</h3>
          <button className="text-primary-600 hover:text-primary-700 text-[10px] font-bold uppercase tracking-widest transition-colors">Access Archives</button>
        </div>
        
        <div className="divide-y divide-slate-50">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm ${
                  txn.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                } group-hover:scale-110 transition-transform duration-500`}>
                  {txn.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{txn.student}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{txn.course} <span className="text-slate-100 mx-2">|</span> {txn.method}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-xl font-bold text-slate-900 tracking-tight">{txn.amount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{txn.date}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 px-2.5 py-1 rounded-lg border ${
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
