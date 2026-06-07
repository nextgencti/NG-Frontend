import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle2, IndianRupee, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 85, 
      damping: 14 
    } 
  }
};

export default function Fees() {
  const [data, setData] = useState({
    summary: { total: 0, paid: 0, outstanding: 0 },
    nextPayment: null,
    history: [],
    loading: true
  });

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setTimeout(() => {
          setData({
            summary: { total: 0, paid: 0, outstanding: 0 },
            nextPayment: null,
            history: [],
            loading: false
          });
        }, 800);
      } catch (error) {
        console.error(error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchFees();
  }, []);

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-10 h-10 border-4 border-primary-100 rounded-full"></div>
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Consulting Ledger…</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-16 px-1 max-w-5xl mx-auto bg-dashboard-grid bg-repeat"
    >
      {/* Header */}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: -10 },
          show: { opacity: 1, y: 0 }
        }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100/50 text-primary-600">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.18em]">Finance Board</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Fees & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Ledgers</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Monitor course dues, compile fee summaries, and access printed receipts.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md shrink-0"
        >
          <CreditCard className="w-4 h-4 text-white/80" />
          Pay Now
        </motion.button>
      </motion.div>

      {/* Bento Finance Blocks */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Next Payment Card (Holographic Credit Card Layout) */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="lg:col-span-2 bg-slate-900/95 backdrop-blur-3xl rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between border border-slate-700/50 shadow-[0_16px_36px_rgba(0,0,0,0.03)] group"
        >
          {/* Holographic glowing orb background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/20 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.08] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Active Dues
              </div>
              <p className="text-3xl sm:text-4xl font-black mt-2 tracking-tight text-white font-mono">
                ₹{(data.nextPayment?.amount || 0).toLocaleString()}
              </p>
            </div>
            
            <span className={`px-2.5 py-1 text-[8px] font-black rounded-lg border uppercase tracking-widest shrink-0 shadow-sm ${
              data.nextPayment 
                ? 'bg-rose-500/25 text-rose-350 border-rose-500/20' 
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}>
              {data.nextPayment ? `Due in ${data.nextPayment.daysLeft} Days` : 'All Paid'}
            </span>
          </div>
          
          <div className="relative z-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate uppercase tracking-wider">{data.nextPayment?.course || 'No Outstanding Course Fee'}</p>
              <p className="text-slate-500 text-[8px] mt-0.5 font-bold uppercase tracking-widest">
                {data.nextPayment?.deadline ? `Deadline: ${data.nextPayment.deadline}` : 'Account fully cleared'}
              </p>
            </div>
            
            <button 
              disabled={!data.nextPayment}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 disabled:bg-white/5 disabled:text-slate-650 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-md"
            >
              Pay Dues
            </button>
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div 
          variants={cardVariants}
          className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 sm:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.02)] flex flex-col justify-center space-y-5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300"
        >
          <div className="flex items-center gap-2 pb-1">
            <div className="w-1.5 h-4 bg-primary-600 rounded-full"></div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ledger Balance</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3.5 border-b border-slate-50 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total Fees</span>
              <span className="text-slate-800 font-black font-mono">₹{data.summary.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3.5 border-b border-slate-50 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total Settled</span>
              <span className="text-emerald-600 font-black font-mono">₹{data.summary.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1.5 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Outstanding</span>
              <span className="text-slate-900 font-black text-xl tracking-tight font-mono">₹{data.summary.outstanding.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div 
        variants={cardVariants}
        className="bg-white/70 backdrop-blur-2xl border border-white/60 rounded-[32px] shadow-[0_12px_36px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] hover:border-white transition-all duration-300"
      >
        <div className="px-6 py-5 border-b border-white/50 flex items-center bg-white/40 backdrop-blur-sm">
          <div className="w-1.5 h-4.5 bg-slate-400 rounded-full mr-2"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoices History</h3>
        </div>
        
        {data.history.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.history.map((item, i) => (
              <div key={i} className="px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 border border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide truncate">{item.description}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">{item.date} • {item.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-sm font-black text-slate-850 font-mono">₹{item.amount.toLocaleString()}</span>
                  <button className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-650 hover:text-slate-800 transition-colors bg-white border border-slate-200 hover:border-slate-300 px-3.5 py-2 rounded-lg shrink-0 cursor-pointer shadow-sm">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
               <Clock className="w-6 h-6 text-slate-350" />
            </div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">No Settlements Found</h4>
            <p className="text-slate-400 mt-1 max-w-sm mx-auto font-medium text-xs leading-relaxed">
              No financial invoices recorded yet on this enrollment.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
