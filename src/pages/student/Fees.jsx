import React from 'react';
import { CreditCard, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function Fees() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Fees & Payments</h2>
          <p className="text-slate-400 mt-2 font-medium">Manage your course fees and download receipts.</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95 text-[10px]">
          <CreditCard className="w-4 h-4" />
          Pay Now
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Next Payment Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex items-start justify-between mb-10">
            <div>
              <p className="text-slate-500 font-black tracking-[0.2em] text-[10px] uppercase">Next Payment</p>
              <p className="text-5xl sm:text-6xl font-black mt-3 tracking-tighter">₹4,500</p>
            </div>
            <span className="px-4 py-1.5 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-xl border border-rose-500/20 uppercase tracking-widest">
              DUE IN 05 DAYS
            </span>
          </div>
          
          <div className="relative z-10 border-t border-white/5 pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-white font-bold text-lg">Web Design Authority</p>
              <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">DEADLINE: MARCH 15, 2026</p>
            </div>
            <button className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all active:scale-95">
              PAY NOW
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="glass-dark p-8 flex flex-col justify-center border border-white/5">
          <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest">Fee Summary</h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Fees</span>
              <span className="text-white font-black">₹15,000</span>
            </div>
            <div className="flex justify-between items-center pb-5 border-b border-white/5">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Paid Amount</span>
              <span className="text-emerald-400 font-black">₹7,500</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">Outstanding</span>
              <span className="text-white font-black text-2xl tracking-tighter">₹7,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Placeholder */}
      <div className="glass-dark border border-white/5 overflow-hidden mt-10">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Payment History</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {/* Mock Transaction */}
          <div className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/5 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white uppercase tracking-tight">Phase 1 - Web Development</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">Payment Date: Feb 10, 2026 via UPI</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-2xl font-black text-white tracking-widest">₹3,000</span>
              <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 hover:text-primary-300 transition-colors bg-white/5 px-5 py-3 rounded-xl border border-white/5">
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
