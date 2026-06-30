import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  IndianRupee, 
  Clock, 
  Sparkles,
  Printer,
  X,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Fingerprint,
  FileText,
  Laptop,
  MessageCircle,
  Calendar,
  User,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import logoImg from '../../assets/logo.png';
import paidStampImg from '../../assets/paid stamp.png';

// Helper to convert number to words in Indian Rupee format
const convertNumberToWords = (amount) => {
  const sWords = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tensWords = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (!amount || isNaN(amount)) return "Rupees Zero Only";
  let num = Math.floor(amount);
  if (num === 0) return "Rupees Zero Only";
  
  const convertLessThanOneThousand = (number) => {
    let word = "";
    if (number % 100 < 20) {
      word = sWords[number % 100];
      number = Math.floor(number / 100);
    } else {
      const ones = number % 10;
      const tens = Math.floor((number % 100) / 10);
      word = tensWords[tens] + (ones ? " " + sWords[ones] : "");
      number = Math.floor(number / 100);
    }
    if (number === 0) return word;
    return sWords[number] + " Hundred" + (word ? " and " + word : "");
  };

  let crore = Math.floor(num / 10000000);
  num = num % 10000000;
  let lakh = Math.floor(num / 100000);
  num = num % 100000;
  let thousand = Math.floor(num / 1000);
  num = num % 1000;
  let hundred = num;
  
  let result = "";
  if (crore > 0) {
    result += convertLessThanOneThousand(crore) + " Crore ";
  }
  if (lakh > 0) {
    result += convertLessThanOneThousand(lakh) + " Lakh ";
  }
  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + " Thousand ";
  }
  if (hundred > 0) {
    result += convertLessThanOneThousand(hundred) + " ";
  }
  
  return `Rupees ${result.trim()} Only`;
};

// Helper to extract separate Date and Time formatted values safely
const getTransactionDateTime = (txn) => {
  let dateObj = new Date();
  if (txn && txn.paidAt) {
    if (typeof txn.paidAt.toDate === 'function') {
      dateObj = txn.paidAt.toDate();
    } else if (txn.paidAt._seconds) {
      dateObj = new Date(txn.paidAt._seconds * 1000);
    } else if (txn.paidAt.seconds) {
      dateObj = new Date(txn.paidAt.seconds * 1000);
    } else if (typeof txn.paidAt === 'string' || typeof txn.paidAt === 'number') {
      dateObj = new Date(txn.paidAt);
    }
  } else if (txn && txn.date) {
    const parsed = new Date(txn.date);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    }
  }

  // Format Date: e.g. "21 June 2026"
  const day = dateObj.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  // Format Time: e.g. "11:35 AM"
  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedTime = `${hours}:${minutes} ${ampm}`;

  return { date: formattedDate, time: formattedTime };
};

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
  const [studentDetails, setStudentDetails] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await api.get('/student/finance');
      if (response.data.success) {
        setData({
          summary: response.data.summary,
          nextPayment: response.data.nextPayment,
          history: response.data.history,
          loading: false
        });
        setStudentDetails(response.data.studentDetails);
      }
    } catch (error) {
      console.error('Failed to fetch student finance data:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePayNow = () => {
    toast.success("To deposit fees, please visit the institute counter or transfer digitally to UPI: 9140737374", {
      duration: 6000,
      position: 'top-center'
    });
  };

  const handleWhatsAppShare = () => {
    if (!selectedTxn) return;
    const dateTime = getTransactionDateTime(selectedTxn);
    const shareText = `*Nextgen computer training institute*
*FEE RECEIPT*
---------------------------------
*Receipt No:* ${selectedTxn.receiptNo}
*Date:* ${dateTime.date}
*Time:* ${dateTime.time}
---------------------------------
*Student Name:* ${selectedTxn.studentName}
*Roll Number:* ${selectedTxn.studentRollNumber}
*Course:* ${selectedTxn.courseName}
*Payment Method:* ${selectedTxn.paymentMethod}
---------------------------------
*Total Paid:* ₹${selectedTxn.amount.toFixed(2)}
*Amount in Words:* ${convertNumberToWords(selectedTxn.amount)}
---------------------------------
_This is a computer generated receipt._
_Thank you for your payment!_`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Receipt details copied to clipboard!');
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }).catch((err) => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy receipt details');
    });
  };

  // Helper to format months (e.g. 2026-03 to Mar 2026)
  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

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
      className="space-y-8 pb-16 px-1 max-w-5xl mx-auto bg-dashboard-grid bg-repeat text-slate-800"
    >
      {/* Dynamic Printing Styles Block */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Hide all general page content */
          body * {
            visibility: hidden !important;
          }
          
          /* Show ONLY the receipt modal and its parents */
          .print-receipt-overlay,
          .print-receipt-overlay *,
          #print-receipt-modal,
          #print-receipt-modal * {
            visibility: visible !important;
          }
          
          /* Position overlay to fill the printed page */
          .print-receipt-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            backdrop-filter: none !important;
          }
          
          /* Style container parent on print */
          .print-receipt-overlay > div {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Style container */
          #print-receipt-modal {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 30px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Hide buttons and no-print helpers */
          .no-print, button, .no-print * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}} />

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
          onClick={handlePayNow}
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
        {/* Next Payment Card */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          className="lg:col-span-2 bg-slate-900/95 backdrop-blur-3xl rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden flex flex-col justify-between border border-slate-700/50 shadow-[0_16px_36px_rgba(0,0,0,0.03)] group"
        >
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
              {data.nextPayment ? (data.nextPayment.daysLeft > 0 ? `Due in ${data.nextPayment.daysLeft} Days` : 'Due Today / Immediate') : 'All Paid'}
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
              onClick={handlePayNow}
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
          
          <div className="space-y-4 text-xs font-medium">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total Fees</span>
              <span className="text-slate-800 font-black font-mono">₹{data.summary.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Total Settled</span>
              <span className="text-emerald-600 font-black font-mono">₹{data.summary.paid.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Fee Type</span>
              <span className="text-indigo-600 font-black uppercase text-[8px] bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded tracking-wide">
                {studentDetails?.feeType || 'fixed'}
              </span>
            </div>
            {studentDetails?.discountText && studentDetails.discountText !== 'None' && (
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Applied Discount</span>
                <span className="text-emerald-600 font-black text-[8px] bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded tracking-wide">
                  {studentDetails.discountText}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-1.5">
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
          <div className="w-1.5 h-5 bg-slate-400 rounded-full mr-2"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoices History</h3>
        </div>
        
        {data.history.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {data.history.map((item, i) => (
              <div key={item.id || i} className="px-6 py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 border border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-wide truncate">
                      {item.paymentType === 'monthly' ? `Fee installment - ${item.monthsPaid?.map(m => formatMonth(m).split(' ')[0]).join(', ')}` : 'Fixed Syllabus Fee'}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">
                      Receipt: {item.receiptNo} • {item.date} • {item.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-sm font-black text-slate-850 font-mono">₹{item.amount.toLocaleString()}</span>
                  <button 
                    onClick={() => setSelectedTxn(item)}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-slate-655 hover:text-indigo-600 transition-colors bg-white border border-slate-200 hover:border-slate-350 px-3.5 py-2 rounded-lg shrink-0 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
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

      {/* ─── MODAL: INVOICE RECEIPT OVERLAY ─── */}
      {selectedTxn && (() => {
        const dateTime = getTransactionDateTime(selectedTxn);
        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-slate-805 print-receipt-overlay">
            <div className="bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] relative border-t-[8px] border-indigo-900 scrollbar-hide">
              
              {/* Top Corner Ribbon Badge */}
              <div className="absolute top-0 right-12 bg-indigo-900 text-white text-[9px] font-black uppercase tracking-wider px-5 py-2 rounded-b-xl no-print select-none">
                FEE RECEIPT
              </div>

              <div id="print-receipt-modal" className="p-5 space-y-3 relative bg-white">
                
                {/* Background Paid Stamp Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.09] print:opacity-[0.11] z-10">
                  <img 
                    src={paidStampImg} 
                    alt="Paid Stamp Watermark" 
                    className="w-72 h-72 object-contain rotate-[-15deg]" 
                  />
                </div>

                {/* PAID Stamp overlay */}
                <div className="absolute right-8 top-12 flex items-center gap-1.5 border border-emerald-500 text-emerald-600 bg-emerald-50/50 rounded-lg px-3 py-1 text-[10px] font-black tracking-wider uppercase rotate-[-12deg] select-none shrink-0 print:opacity-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PAID</span>
                </div>

                {/* Close Button (No Print) */}
                <button 
                  onClick={() => setSelectedTxn(null)}
                  className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer no-print"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Receipt Header (Logo + Institute details) */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3.5 pb-1 w-full">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center p-0.5 shadow-sm shrink-0">
                      <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-indigo-950 tracking-tight leading-tight uppercase font-sans">
                        Nextgen computer training institute
                      </h3>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Empowering Minds, Shaping Futures
                      </p>
                      
                      <div className="flex flex-col gap-0.5 mt-1.5 text-[8.5px] text-slate-500 font-semibold items-center sm:items-start">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-indigo-700 shrink-0" />
                          <span>Near Shri Jaylal Vidya Mandir , Muskara</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Phone className="w-2 h-2 text-indigo-700 shrink-0" />
                            <span>+91 9140737374</span>
                          </div>
                          <span className="text-slate-300">|</span>
                          <div className="flex items-center gap-1">
                            <Mail className="w-2 h-2 text-indigo-700 shrink-0" />
                            <span>nextgencomputermuskara@gmail.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Meta details columns */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 border-b border-slate-100 pb-2.5 text-[10px] sm:text-[11px]">
                  <div>
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Receipt No.</span>
                    <span className="font-mono font-bold text-indigo-900 mt-0.5 block">{selectedTxn.receiptNo}</span>
                  </div>
                  <div className="border-l border-slate-100 pl-2 sm:pl-4">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Date</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{dateTime.date}</span>
                  </div>
                  <div className="border-l border-slate-100 pl-2 sm:pl-4">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block">Receipt Time</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{dateTime.time}</span>
                  </div>
                </div>

                {/* Student Enrolment information block */}
                <div className="relative pt-1.5">
                  <div className="absolute -top-1 left-4 bg-indigo-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                    Student Details
                  </div>
                  <div className="border border-slate-200/80 rounded-xl p-3.5 pt-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-[11px]">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Student Name</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.studentName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Enrollment Roll No.</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.studentRollNumber}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Course</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.courseName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block">Payment Method</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of Particulars (Billing description & amount) */}
                <div className="relative pt-1.5">
                  <div className="absolute -top-1 left-4 bg-indigo-900 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                    Fee Details
                  </div>
                  
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-indigo-50/40 text-indigo-950 font-black uppercase tracking-wider text-[7.5px]">
                          <th className="p-2 pl-4 w-14">S. No.</th>
                          <th className="p-2">DESCRIPTION</th>
                          <th className="p-2 pr-4 text-right w-32">AMOUNT (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-[11px]">
                        {selectedTxn.paymentType === 'monthly' && selectedTxn.monthsPaid?.length > 0 ? (
                          selectedTxn.monthsPaid.map((m, idx) => {
                            const standardAmount = (studentDetails?.monthlyFeeDetails?.[m]) ?? (selectedTxn.amount + (selectedTxn.discountApplied || 0)) / selectedTxn.monthsPaid.length;
                            return (
                              <tr key={m} className="hover:bg-slate-50/50">
                                <td className="p-2 pl-4 font-mono text-slate-400">{idx + 1}</td>
                                <td className="p-2">Installment Month — {formatMonth(m)}</td>
                                <td className="p-2 pr-4 text-right font-mono">{(standardAmount).toFixed(2)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className="hover:bg-slate-50/50">
                            <td className="p-2 pl-4 font-mono text-slate-400">1</td>
                            <td className="p-2">Fixed Syllabus Fee — Course Payment</td>
                            <td className="p-2 pr-4 text-right font-mono">{(selectedTxn.amount + (selectedTxn.discountApplied || 0)).toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Remarks/Notes */}
                {selectedTxn.notes && (
                  <div className="text-[11px] bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block leading-none">Transaction Remarks</span>
                    <span className="italic text-slate-650 mt-0.5 block font-medium">"{selectedTxn.notes}"</span>
                  </div>
                )}

                {/* Total Paid block with discount details */}
                <div className="space-y-1.5">
                  {selectedTxn.discountApplied > 0 && (
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold px-2">
                      <div className="flex items-center gap-1">
                        <span>Gross Subtotal: ₹{(selectedTxn.amount + selectedTxn.discountApplied).toFixed(2)}</span>
                        <span>|</span>
                        <span className="text-rose-600 font-bold">Waiver Discount: -₹{selectedTxn.discountApplied.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-emerald-800">
                    <span className="text-[9px] font-black uppercase tracking-widest">Total Paid</span>
                    <span className="text-xl font-black tracking-tight font-sans">₹{selectedTxn.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Amount in Words */}
                <div className="flex items-center gap-1.5 text-[8.5px] text-slate-500 font-semibold">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-2 h-2 text-indigo-700" />
                  </div>
                  <span>Amount in Words:</span>
                  <span className="font-bold text-slate-700 italic">{convertNumberToWords(selectedTxn.amount)}</span>
                </div>

                {/* Dotted separator line */}
                <div className="border-t border-dashed border-slate-200 my-2"></div>

                {/* Verification Grid Footer */}
                <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 pt-0">
                  {/* Scan to Verify QR Code */}
                  <div className="flex items-start gap-2">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Receipt: ${selectedTxn.receiptNo}, Student: ${selectedTxn.studentName}, Roll: ${selectedTxn.studentRollNumber}, Course: ${selectedTxn.courseName}, Amount: ₹${selectedTxn.amount}`)}`} 
                        alt="QR Verification" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block leading-none">Scan to Verify</span>
                      <span className="text-[6.5px] text-slate-400 mt-1 block leading-normal font-medium">
                        Scan this QR code to verify the authenticity of this receipt.
                      </span>
                    </div>
                  </div>

                  {/* Metadata Generation details */}
                  <div className="flex flex-col gap-1.5 text-[8.5px] text-slate-500 font-semibold border-t min-[450px]:border-t-0 min-[450px]:border-l border-slate-100 pt-3.5 min-[450px]:pt-0 min-[450px]:pl-3">
                    <div className="flex items-start gap-1">
                      <Calendar className="w-3 h-3 text-indigo-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block leading-none">Generated On</span>
                        <span className="mt-0.5 block text-slate-650">{dateTime.date}, {dateTime.time}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-1">
                      <Laptop className="w-3 h-3 text-indigo-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block leading-none">Generated By</span>
                        <span className="mt-0.5 block text-slate-650 truncate max-w-[100px]" title="Nextgen computer training institute Management System">Nextgen Management</span>
                      </div>
                    </div>
                  </div>

                  {/* Double circular Verified Seal stamp */}
                  <div className="flex justify-center items-center border-t md:border-t-0 md:border-l border-slate-100 pt-3.5 md:pt-0 md:pl-3 shrink-0">
                    <div className="w-14 h-14 rounded-full border-[3px] border-double border-indigo-700/60 flex flex-col items-center justify-center relative select-none rotate-[-6deg]">
                      <div className="text-[4.5px] font-black text-indigo-700/60 uppercase tracking-widest text-center leading-tight">
                        NEXTGEN
                      </div>
                      <div className="text-[3.5px] font-extrabold text-indigo-500/60 uppercase text-center mt-0.5">
                        COMPUTER
                      </div>
                      <div className="text-[4.5px] font-black text-indigo-700/60 uppercase tracking-widest text-center leading-tight mt-0.5">
                        MUSKARA
                      </div>
                      <div className="absolute inset-1 rounded-full border border-dashed border-indigo-600/30"></div>
                    </div>
                  </div>

                  {/* Mock handwritten Signature */}
                  <div className="flex flex-col items-center justify-end border-t min-[450px]:border-t-0 min-[450px]:border-l border-slate-100 pt-3.5 min-[450px]:pt-0 min-[450px]:pl-3 h-full shrink-0 text-center font-sans">
                    <span className="font-serif text-indigo-700/80 text-base font-medium tracking-wide leading-none" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                      Sanjay Rajoot
                    </span>
                    <div className="w-16 border-t border-slate-300 my-0.5"></div>
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block leading-none">Authorized Signature</span>
                    <span className="text-[6.5px] text-slate-455 capitalize mt-0.5 block leading-none">Nextgen Computer Training</span>
                  </div>
                </div>

                {/* Bottom warning banner */}
                <div className="bg-indigo-950 text-white rounded-xl p-2.5 flex items-center justify-center gap-1.5 text-[7.5px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span>This is a computer generated receipt and does not require any physical signature.</span>
                </div>

                {/* Actions panel (No Print) */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center pt-3 border-t border-slate-100 no-print">
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Share on WhatsApp
                  </button>
                  
                  <div className="flex gap-2.5 sm:gap-3 justify-end w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedTxn(null)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 transition-colors cursor-pointer text-center"
                    >
                      Close Receipt
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 text-center"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Receipt
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>,
          document.body
        );
      })()}

    </motion.div>
  );
}
