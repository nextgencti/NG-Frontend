import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle2, IndianRupee, Clock } from 'lucide-react';
import api from '../../lib/axios';

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
        // Since backend doesn't have fees endpoint yet, we set it to empty
        // In future, this will be api.get('/student/fees')
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Fees & Payments</h2>
          <p className="text-slate-500 mt-0.5 text-[11px] font-medium">Manage your course fees and download receipts.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs">
          <CreditCard className="w-4 h-4" />
          Pay Now
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Next Payment Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 text-slate-900 relative overflow-hidden flex flex-col justify-between shadow-sm group hover:border-primary-100 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
            <div>
              <p className="text-slate-400 font-black tracking-widest text-[9px] uppercase">Next Payment</p>
              {data.loading ? (
                <div className="w-32 h-10 bg-slate-100 animate-pulse rounded-xl mt-2"></div>
              ) : (
                <p className="text-3xl sm:text-4xl font-black mt-2 text-slate-900 tracking-tight">
                  ₹{data.nextPayment?.amount || '0'}
                </p>
              )}
            </div>
            {!data.loading && (
              <span className={`px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-wider shrink-0 ${data.nextPayment ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                {data.nextPayment ? `Due in ${data.nextPayment.daysLeft} Days` : 'No Dues'}
              </span>
            )}
          </div>
          
          <div className="relative z-10 border-t border-slate-50 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-800 font-bold text-sm">{data.nextPayment?.course || 'No Active Course Fee'}</p>
              <p className="text-slate-400 text-[9px] mt-1 font-bold uppercase tracking-wider">
                {data.nextPayment?.deadline ? `Deadline: ${data.nextPayment.deadline}` : 'All caught up!'}
              </p>
            </div>
            <button 
              disabled={!data.nextPayment}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Now
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest">Fee Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total Fees</span>
              <span className="text-slate-900 font-bold text-sm">₹{data.summary.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-50">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Paid Amount</span>
              <span className="text-emerald-600 font-bold text-sm">₹{data.summary.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Outstanding</span>
              <span className="text-slate-900 font-black text-xl tracking-tight">₹{data.summary.outstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment History</h3>
        </div>
        
        {data.loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">Loading History...</div>
        ) : data.history.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.history.map((item, i) => (
              <div key={i} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{item.date} • {item.method}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-base font-black text-slate-900">₹{item.amount.toLocaleString()}</span>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg border border-primary-100 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 relative">
               <div className="absolute inset-0 bg-primary-100/30 rounded-full blur-xl animate-pulse"></div>
               <Clock className="w-6 h-6 text-slate-300 relative" />
            </div>
            <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">No History</h4>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium text-xs">
              You haven't made any payments yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
