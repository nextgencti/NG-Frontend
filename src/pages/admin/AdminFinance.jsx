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
          <h2 className="text-3xl font-black text-white tracking-tight">Financial Ledger</h2>
          <p className="text-slate-500 font-medium">Monitor revenue streams, outstanding dues, and fiscal operations.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-white/5 backdrop-blur-md shadow-xl active:scale-95">
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        
        {/* Revenue Overview Card */}
        <div className="bg-gradient-to-br from-emerald-600/90 to-emerald-400/90 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-500/10 relative overflow-hidden flex flex-col justify-between min-h-[250px] border border-white/10 group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-start justify-between mb-8">
            <div>
              <p className="text-emerald-100/60 font-black tracking-[0.2em] text-[10px] uppercase flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Capital Intake (Current Cycle)
              </p>
              <p className="text-5xl sm:text-6xl font-black mt-3 tracking-tighter">₹1,25,400</p>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="relative z-10 border-t border-white/10 pt-6 flex justify-between items-center text-emerald-50">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">+15.2% Velocity</span>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-lg">42 Dispersals</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-center min-h-[250px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <h3 className="text-xl font-black text-white">Outstanding Dues</h3>
            <span className="px-3 py-1 bg-rose-400/10 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-400/20 animate-pulse">Critical Priority</span>
          </div>
          <p className="text-5xl font-black text-rose-400 mb-2 tracking-tighter relative z-10">₹42,000</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest relative z-10">Inventory: 18 Delinquent Records</p>
          <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
            <button className="w-full py-4 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95">
              Execute Automated Reminders
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="glass-dark rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xl font-black text-white">Transaction Logs</h3>
          <button className="text-primary-400 hover:text-primary-300 text-[10px] font-black uppercase tracking-widest transition-colors">Access Archives</button>
        </div>
        
        <div className="divide-y divide-white/5">
          {transactions.map((txn) => (
            <div key={txn.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-start gap-6 flex-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                  txn.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                } group-hover:scale-110 transition-transform duration-500`}>
                  {txn.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                </div>
                <div>
                  <p className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{txn.student}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{txn.course} <span className="text-white/10 mx-2">|</span> {txn.method}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="text-2xl font-black text-white tracking-widest">{txn.amount}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{txn.date}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-1 px-3 py-1 rounded-lg border ${
                  txn.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
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
