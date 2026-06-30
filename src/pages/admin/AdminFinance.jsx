import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CreditCard, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Printer, 
  X, 
  IndianRupee, 
  Percent, 
  Plus, 
  Clock, 
  Award,
  BookOpen,
  Settings,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
  Fingerprint,
  FileText,
  Laptop,
  MessageCircle
} from 'lucide-react';
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

export default function AdminFinance() {
  const [summary, setSummary] = useState({ totalRevenue: 0, totalDues: 0, delinquentCount: 0, studentsCount: 0 });
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  
  // Config form state
  const [configForm, setConfigForm] = useState({
    feeType: 'fixed',
    amount: '',
    discountType: 'none',
    discountValue: ''
  });
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    payAmount: '',
    paymentMethod: 'UPI',
    selectedMonths: [],
    notes: ''
  });

  const [savingConfig, setSavingConfig] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, studentsRes, transactionsRes, instituteRes] = await Promise.all([
        api.get('/admin/finance/summary'),
        api.get('/admin/finance/students'),
        api.get('/admin/finance/transactions'),
        api.get('/admin/institute').catch(() => null)
      ]);
      
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.stats);
      }
      if (transactionsRes.data.success) {
        setTransactions(transactionsRes.data.transactions || []);
      }
      if (studentsRes.data.success) {
        setStudents(studentsRes.data.students || []);
      }
      if (instituteRes && instituteRes.data.success) {
        setInstitute(instituteRes.data.institute || null);
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
      toast.error('Failed to load finance ledger records.');
    } finally {
      setLoading(false);
    }
  };

  // Triggered when editing fee config
  const handleOpenConfig = (student) => {
    setSelectedStudent(student);
    setConfigForm({
      feeType: student.feeType || 'fixed',
      amount: student.baseFee || '',
      discountType: student.discountType || 'none',
      discountValue: student.discountValue || ''
    });
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const response = await api.post(`/admin/finance/students/${selectedStudent.id}/config`, {
        feeType: configForm.feeType,
        amount: configForm.amount === '' ? null : Number(configForm.amount),
        discountType: configForm.discountType,
        discountValue: configForm.discountValue === '' ? 0 : Number(configForm.discountValue)
      });
      if (response.data.success) {
        toast.success('Fee configuration saved successfully');
        setIsConfigOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update fee configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // Triggered when collecting fee
  const handleOpenCollectFee = (student) => {
    setSelectedStudent(student);
    
    // Auto-calculate suggested installment or balance amount
    let suggestAmount = '';
    if (student.feeType === 'monthly') {
      // Suggest monthly installment amount
      suggestAmount = student.baseFee || '';
      
      // Calculate net monthly amount after discount
      let discountAmount = 0;
      if (student.discountType === 'flat') {
        discountAmount = student.discountValue;
      } else if (student.discountType === 'percentage') {
        discountAmount = (Number(student.baseFee) * Number(student.discountValue)) / 100;
      }
      suggestAmount = Math.max(0, Number(student.baseFee) - discountAmount);
      
      if (student.dueMonths.length > 0) {
        const firstDue = student.dueMonths[0];
        suggestAmount = student.monthlyFeeDetails?.[firstDue] ?? suggestAmount;
      }
    } else {
      // Suggest total remaining dues for fixed fee model
      suggestAmount = student.totalDue || '';
    }

    setPaymentForm({
      payAmount: suggestAmount,
      paymentMethod: 'UPI',
      selectedMonths: student.feeType === 'monthly' && student.dueMonths.length > 0 ? [student.dueMonths[0]] : [],
      notes: '',
      discountApplied: ''
    });
    setIsCollectFeeOpen(true);
  };

  const handleMonthToggle = (month) => {
    const isSelected = paymentForm.selectedMonths.includes(month);
    let updatedMonths = [];
    if (isSelected) {
      updatedMonths = paymentForm.selectedMonths.filter(m => m !== month);
    } else {
      updatedMonths = [...paymentForm.selectedMonths, month];
    }
    
    // Auto-calculate payment amount based on months checked
    let discountAmount = 0;
    if (selectedStudent.discountType === 'flat') {
      discountAmount = selectedStudent.discountValue;
    } else if (selectedStudent.discountType === 'percentage') {
      discountAmount = (Number(selectedStudent.baseFee) * Number(selectedStudent.discountValue)) / 100;
    }
    const netMonthlyAmount = Math.max(0, Number(selectedStudent.baseFee) - discountAmount);
    
    let newAmount = 0;
    updatedMonths.forEach(m => {
      newAmount += selectedStudent.monthlyFeeDetails?.[m] ?? netMonthlyAmount;
    });

    setPaymentForm(prev => ({
      ...prev,
      selectedMonths: updatedMonths,
      payAmount: updatedMonths.length > 0 ? newAmount : ''
    }));
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (selectedStudent.feeType === 'monthly' && paymentForm.selectedMonths.length === 0) {
      toast.error('Please select at least one installment month');
      return;
    }
    
    const totalAmount = Number(paymentForm.payAmount);
    const discountVal = Number(paymentForm.discountApplied) || 0;
    const netCashAmount = Math.max(0, totalAmount - discountVal);
    
    if (discountVal > totalAmount) {
      toast.error('Discount cannot exceed the total payment amount');
      return;
    }

    setSavingPayment(true);
    try {
      const response = await api.post('/admin/finance/pay-fee', {
        studentId: selectedStudent.id,
        amount: netCashAmount,
        discountApplied: discountVal,
        paymentMethod: paymentForm.paymentMethod,
        paymentType: selectedStudent.feeType,
        months: paymentForm.selectedMonths,
        notes: paymentForm.notes
      });
      if (response.data.success) {
        toast.success('Payment recorded successfully');
        setIsCollectFeeOpen(false);
        fetchData();
        
        // Open receipt print preview
        setSelectedTxn(response.data.transaction);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record fee payment');
    } finally {
      setSavingPayment(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  // Calculate precise elapsed months and days from admission date to now
  const calculateTimeElapsed = (admissionDateStr) => {
    if (!admissionDateStr) return 'N/A';
    const admissionDate = new Date(admissionDateStr);
    const today = new Date();
    
    let years = today.getFullYear() - admissionDate.getFullYear();
    let months = today.getMonth() - admissionDate.getMonth();
    let days = today.getDate() - admissionDate.getDate();
    
    if (days < 0) {
      // Borrow days from the previous month
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    const totalMonths = (years * 12) + months;
    
    if (totalMonths === 0 && days === 0) {
      return '0 Months & 0 Days (Joined Today)';
    }
    
    let textParts = [];
    if (totalMonths > 0) {
      textParts.push(`${totalMonths} Month${totalMonths > 1 ? 's' : ''}`);
    }
    if (days > 0) {
      textParts.push(`${days} Day${days > 1 ? 's' : ''}`);
    }
    
    return textParts.join(' & ');
  };

  // Helper to format dates to user-friendly string
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleOpenHistory = (student) => {
    setSelectedStudentHistory(student);
    setIsHistoryOpen(true);
  };

  // Filter students based on active tab and search query
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'defaulters') {
      return matchesSearch && s.totalDue > 0;
    }
    return matchesSearch;
  });

  const filteredTransactions = transactions.filter(t => 
    t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Financial <span className="text-indigo-600">Ledger</span>
          </h2>
          <p className="text-slate-500 text-[11px] font-medium mt-0.5">Manage student invoices, monthly collections, discounts, and dues tracking.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData}
            className="p-2 bg-white hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-200 shadow-sm active:scale-95 cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dashboard Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg shadow-indigo-600/10 relative overflow-hidden flex flex-col justify-between min-h-[130px] border border-white/10 group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3 group-hover:scale-105 transition-transform duration-700"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <span className="text-indigo-100/60 font-black tracking-widest text-[8.5px] uppercase block mb-1">Capital Intake</span>
              <h3 className="text-2xl font-black tracking-tight">₹{summary.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-9 h-9 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10 border-t border-white/10 pt-2 flex justify-between items-center text-indigo-50">
            <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" /> Collections Logged</span>
            <span className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">{transactions.length} receipts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[130px] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-slate-400 font-black tracking-widest text-[8.5px] uppercase block mb-1">Outstanding Dues</span>
              <h3 className="text-2xl font-black text-rose-600 tracking-tight">₹{summary.totalDues.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100 shadow-sm">
              <IndianRupee className="w-4.5 h-4.5 text-rose-600" />
            </div>
          </div>
          <div className="relative z-10 border-t border-slate-50 pt-2 flex justify-between items-center text-slate-400">
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-rose-50 border border-rose-100/50 text-rose-600 rounded-md">Pending Balances</span>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{summary.delinquentCount} Students</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[130px] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-slate-400 font-black tracking-widest text-[8.5px] uppercase block mb-1">Defaulters</span>
              <h3 className="text-2xl font-black text-amber-600 tracking-tight">{summary.delinquentCount}</h3>
            </div>
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
            </div>
          </div>
          <div className="relative z-10 border-t border-slate-50 pt-2 flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-50 border border-amber-100/50 text-amber-600 rounded-md">Action Required</span>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase">Warning Alerts</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 flex flex-col justify-between min-h-[130px] shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="text-slate-400 font-black tracking-widest text-[8.5px] uppercase block mb-1">Active Learners</span>
              <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{summary.studentsCount}</h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
              <User className="w-4.5 h-4.5 text-emerald-600" />
            </div>
          </div>
          <div className="relative z-10 border-t border-slate-50 pt-2 flex justify-between items-center text-slate-400">
            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-50 border border-emerald-100/50 text-emerald-600 rounded-md">Total Enrollments</span>
            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">Logged</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Content Box */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Navigation Filters & Tab bar */}
        <div className="p-4 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* Tab Selector */}
          <div className="flex bg-slate-50 p-1 rounded-xl w-full lg:w-auto">
            <button
              onClick={() => { setActiveTab('students'); setSearchQuery(''); }}
              className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'students' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Fee Ledger (Students)
            </button>
            <button
              onClick={() => { setActiveTab('transactions'); setSearchQuery(''); }}
              className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'transactions' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Receipts Logs
            </button>
            <button
              onClick={() => { setActiveTab('defaulters'); setSearchQuery(''); }}
              className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'defaulters' 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Defaulters
              {summary.delinquentCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[8px] font-black">
                  {summary.delinquentCount}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder={
                activeTab === 'students' 
                  ? "Search student name or roll no..." 
                  : activeTab === 'defaulters'
                    ? "Search outstanding dues..."
                    : "Search receipt, student, course..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Tab Data rendering */}
        <div className="flex-1 p-5 lg:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-[3px] border-slate-100 border-t-indigo-600 animate-spin"></div>
              <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Ledgers...</p>
            </div>
          ) : activeTab === 'students' || activeTab === 'defaulters' ? (
            /* STUDENTS / DEFAULTERS LIST VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="p-4">Student & Course details</th>
                    <th className="p-4">Fee Structure</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Paid amount</th>
                    <th className="p-4">Outstanding due</th>
                    <th className="p-4">Instalments/Dues</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-16 text-center">
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="w-10 h-10 text-emerald-100 mb-3" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Student Records Found</h4>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50/40 transition-all group">
                        {/* Student Info */}
                        <td className="p-4">
                          <div>
                            <p className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{student.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              Roll: {student.rollNumber} <span className="text-slate-200 mx-1">|</span> {student.courseName}
                            </p>
                          </div>
                        </td>
                        
                        {/* Fee Type */}
                        <td className="p-4 text-xs font-bold text-slate-700">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            student.feeType === 'monthly' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {student.feeType}
                          </span>
                          <span className="ml-2">₹{student.baseFee.toLocaleString('en-IN')}</span>
                        </td>

                        {/* Discount */}
                        <td className="p-4 text-xs font-semibold text-slate-600">
                          {student.discountType === 'none' ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase tracking-wider">
                              {student.discountText}
                            </span>
                          )}
                        </td>

                        {/* Paid Amount */}
                        <td className="p-4 text-xs font-black text-slate-900">
                          ₹{student.paidAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Total Due */}
                        <td className="p-4 text-xs">
                          {student.totalDue > 0 ? (
                            <span className="font-black text-rose-600">₹{student.totalDue.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest">Paid</span>
                          )}
                        </td>

                        {/* Instalment months track */}
                        <td className="p-4">
                          {student.feeType === 'monthly' ? (
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {student.allMonths.map(m => {
                                const isPaid = student.paidMonths.includes(m);
                                return (
                                  <span 
                                    key={m} 
                                    className={`px-1.5 py-0.5 rounded-[4px] text-[7.5px] font-black uppercase tracking-wider border ${
                                      isPaid 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                        : 'bg-rose-50 border-rose-100 text-rose-500'
                                    }`}
                                    title={`${isPaid ? 'Paid' : 'Unpaid'} (₹${(student.monthlyFeeDetails?.[m] ?? student.baseFee).toLocaleString('en-IN')})`}
                                  >
                                    {formatMonth(m).split(' ')[0]}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fixed Pricing</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCollectFee(student)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all active:scale-95 flex items-center gap-1"
                              title="Record payment"
                            >
                              <Plus className="w-3 h-3" /> Collect
                            </button>
                            <button
                              onClick={() => handleOpenHistory(student)}
                              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-200 transition-all active:scale-95"
                              title="View Student Fee Profile & History"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenConfig(student)}
                              className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-200 transition-all active:scale-95"
                              title="Configure Custom Fee & Discount"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* TRANSACTION LOGS VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                    <th className="p-4">Receipt #</th>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Paid Amount</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Transaction Date</th>
                    <th className="p-4">Particulars</th>
                    <th className="p-4 text-center">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-16 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="w-10 h-10 text-slate-200 mb-3" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Transactions Registered</h4>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors group">
                        {/* Receipt */}
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {txn.receiptNo}
                          </span>
                        </td>
                        
                        {/* Student Name */}
                        <td className="p-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{txn.studentName}</p>
                            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Roll: {txn.studentRollNumber}</p>
                          </div>
                        </td>

                        {/* Course */}
                        <td className="p-4 text-xs font-semibold text-slate-600">
                          {txn.courseName}
                        </td>

                        {/* Paid Amount */}
                        <td className="p-4 text-xs font-black text-emerald-600">
                          ₹{txn.amount.toLocaleString('en-IN')}
                        </td>

                        {/* Payment Method */}
                        <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {txn.paymentMethod}
                        </td>

                        {/* Date */}
                        <td className="p-4 text-xs text-slate-500">
                          {txn.date}
                        </td>

                        {/* Particulars (months or fixed info) */}
                        <td className="p-4 text-[10px] font-semibold text-slate-600">
                          {txn.paymentType === 'monthly' ? (
                            <div className="flex flex-wrap gap-1">
                              {txn.monthsPaid.map(m => (
                                <span key={m} className="px-1 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-600 text-[8px] uppercase tracking-wide">
                                  {formatMonth(m).split(' ')[0]}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-amber-600 uppercase tracking-widest text-[8px] font-black bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Fixed payment</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedTxn(txn)}
                            className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg border border-slate-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 justify-center mx-auto"
                            title="Generate print invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: ADJUST CONFIG ─── */}
      {isConfigOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center relative z-10 bg-indigo-950 text-white">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Adjust Student Fee Configuration</h3>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">Custom billing configs & discounts</p>
              </div>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-indigo-300 hover:text-white hover:bg-indigo-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-5 relative z-10 text-slate-800">
              {/* Student overview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <p className="font-bold text-slate-900">{selectedStudent.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Enrolled Course: {selectedStudent.courseName}</p>
              </div>

              {/* Fee model */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Fee Type Model</label>
                <div className="flex gap-4">
                  <label className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${configForm.feeType === 'monthly' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    <input 
                      type="radio" 
                      name="feeType" 
                      value="monthly" 
                      checked={configForm.feeType === 'monthly'} 
                      onChange={e => setConfigForm(prev => ({ ...prev, feeType: e.target.value }))}
                      className="hidden" 
                    />
                    <span className="text-[9px] uppercase tracking-widest">Monthly Installments</span>
                  </label>
                  <label className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${configForm.feeType === 'fixed' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    <input 
                      type="radio" 
                      name="feeType" 
                      value="fixed" 
                      checked={configForm.feeType === 'fixed'} 
                      onChange={e => setConfigForm(prev => ({ ...prev, feeType: e.target.value }))}
                      className="hidden" 
                    />
                    <span className="text-[9px] uppercase tracking-widest">Fixed Amount</span>
                  </label>
                </div>
              </div>

              {/* Amount override */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                  Custom Base Fee Amount (Optional)
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-sans">₹</span>
                  <input 
                    type="number" 
                    placeholder="Leave empty to use course defaults" 
                    value={configForm.amount}
                    onChange={e => setConfigForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              {/* Discount Structure */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Discount structure</label>
                <div className="grid grid-cols-3 gap-2">
                  {['none', 'percentage', 'flat'].map(type => (
                    <label key={type} className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1 cursor-pointer transition-all text-[8px] font-black uppercase tracking-wider ${configForm.discountType === type ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                      <input 
                        type="radio" 
                        name="discountType" 
                        value={type} 
                        checked={configForm.discountType === type} 
                        onChange={e => setConfigForm(prev => ({ ...prev, discountType: e.target.value, discountValue: e.target.value === 'none' ? '' : prev.discountValue }))}
                        className="hidden" 
                      />
                      {type === 'none' ? 'No discount' : type === 'percentage' ? 'Percentage %' : 'Flat Amount (₹)'}
                    </label>
                  ))}
                </div>
              </div>

              {/* Discount Value */}
              {configForm.discountType !== 'none' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">
                    Discount Value {configForm.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-sans">
                      {configForm.discountType === 'percentage' ? '%' : '₹'}
                    </span>
                    <input 
                      type="number" 
                      required
                      placeholder={configForm.discountType === 'percentage' ? "e.g., 10" : "e.g., 500"} 
                      value={configForm.discountValue}
                      onChange={e => setConfigForm(prev => ({ ...prev, discountValue: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                </div>
              )}

              {/* Submit actions */}
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsConfigOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingConfig}
                  className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-all flex justify-center items-center active:scale-95 cursor-pointer"
                >
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: COLLECT FEE ─── */}
      {isCollectFeeOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center relative z-10 bg-indigo-950 text-white">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Record Fees Payment</h3>
                <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5">Collect school cash / digital fee transaction</p>
              </div>
              <button 
                onClick={() => setIsCollectFeeOpen(false)}
                className="p-1 text-indigo-300 hover:text-white hover:bg-indigo-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-5 relative z-10 text-slate-800">
              {/* Student context box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{selectedStudent.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Course: {selectedStudent.courseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outstanding Balance</p>
                  <p className="text-sm font-black text-rose-600 mt-0.5">₹{selectedStudent.totalDue.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Monthly picker list */}
              {selectedStudent.feeType === 'monthly' && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Select Installments Months to Pay</label>
                  <div className="grid grid-cols-3 gap-2.5 max-h-[140px] overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    {selectedStudent.dueMonths.length === 0 ? (
                      <p className="text-[9.5px] font-black text-emerald-600 uppercase tracking-wide text-center col-span-3 py-4">All monthly installments paid! 🎓</p>
                    ) : (
                      selectedStudent.dueMonths.map(month => {
                        const isChecked = paymentForm.selectedMonths.includes(month);
                        return (
                           <button
                            key={month}
                            type="button"
                            onClick={() => handleMonthToggle(month)}
                            className={`py-2.5 px-3 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                              isChecked
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-500/10'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <span>{formatMonth(month).split(' ')[0]}</span>
                            <span className={`text-[8.5px] font-bold ${isChecked ? 'text-indigo-200' : 'text-slate-400'}`}>
                              ₹{(selectedStudent.monthlyFeeDetails?.[month] ?? selectedStudent.baseFee).toLocaleString('en-IN')}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Pay amount and method */}
              <div className="flex gap-4">
                <div className="relative flex-1 group space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Amount to pay</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-sans">₹</span>
                    <input 
                      type="number" 
                      required 
                      disabled={selectedStudent.feeType === 'monthly'} // For monthly, enforce exact net months sum
                      placeholder="Enter amount" 
                      value={paymentForm.payAmount}
                      onChange={e => setPaymentForm(prev => ({ ...prev, payAmount: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" 
                    />
                  </div>
                  {selectedStudent.feeType === 'monthly' && (
                    <p className="text-[8px] text-slate-400 ml-0.5 font-bold uppercase tracking-widest">Amount calculated from months checked.</p>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={paymentForm.paymentMethod}
                    onChange={e => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold cursor-pointer"
                  >
                    <option value="UPI">UPI (Google Pay/PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Bank Transfer">Net Banking / Transfer</option>
                  </select>
                </div>
              </div>

              {/* Discount Applied */}
              <div className="flex gap-4">
                <div className="relative flex-1 group space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Discount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-sans">₹</span>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={paymentForm.discountApplied}
                      onChange={e => {
                        const val = e.target.value;
                        setPaymentForm(prev => ({ ...prev, discountApplied: val }));
                      }}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold" 
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-1 flex flex-col justify-end">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex justify-between items-center h-[46px]">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Net Cash Collected</span>
                      <span className="text-xs font-black text-indigo-650 block mt-1">
                        ₹{Math.max(0, Number(paymentForm.payAmount) - (Number(paymentForm.discountApplied) || 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Transaction Notes (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g., Receipt details, reference number, remarks" 
                  value={paymentForm.notes}
                  onChange={e => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-450 placeholder:font-medium font-semibold" 
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCollectFeeOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={savingPayment || (selectedStudent.feeType === 'monthly' && paymentForm.selectedMonths.length === 0)}
                  className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-all flex justify-center items-center active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                  {savingPayment ? 'Processing...' : 'Register Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: STUDENT FEE PROFILE & HISTORY ─── */}
      {isHistoryOpen && selectedStudentHistory && (() => {
        const studentTxns = transactions.filter(t => t.studentId === selectedStudentHistory.id);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              {/* Header */}
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center relative z-10 bg-indigo-950 text-white shrink-0">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Student Fee Profile & Ledger</h3>
                  <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mt-0.5 font-sans">
                    Admission details & payment timeline log
                  </p>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-900 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Container */}
              <div className="p-8 overflow-y-auto space-y-6 flex-1">
                {/* Profile Overview Banner */}
                <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between gap-4 md:items-center">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{selectedStudentHistory.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Roll Number: {selectedStudentHistory.rollNumber} <span className="mx-2 text-slate-350">|</span> Course: {selectedStudentHistory.courseName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shadow-sm">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Adm: {formatDate(selectedStudentHistory.createdAt)}
                    </span>
                    <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      Duration: {calculateTimeElapsed(selectedStudentHistory.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Financial Configuration Ledger Details */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Billing Config */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Fee Configuration</h5>
                      
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Payment Model:</span>
                          <span className="font-extrabold uppercase tracking-wide text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            {selectedStudentHistory.feeType}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Base Tuition Fee:</span>
                          <span className="font-bold text-slate-800">
                            ₹{selectedStudentHistory.baseFee.toLocaleString('en-IN')}
                            {selectedStudentHistory.feeType === 'monthly' ? ' / month' : ' (Fixed Total)'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold">Discount Applied:</span>
                          <span className={`font-bold ${selectedStudentHistory.discountType !== 'none' ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {selectedStudentHistory.discountText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ledger Summary Stats */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Dues Statement</h5>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Paid</span>
                          <span className="text-base font-black text-emerald-650 tracking-tight block mt-1">
                            ₹{selectedStudentHistory.paidAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Outstanding</span>
                          <span className={`text-base font-black tracking-tight block mt-1 ${selectedStudentHistory.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            ₹{selectedStudentHistory.totalDue.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Installments Tracking list */}
                    {selectedStudentHistory.feeType === 'monthly' && (
                      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">Installment Timeline Dues</h5>
                        
                        <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                          {selectedStudentHistory.allMonths.map(m => {
                            const isPaid = selectedStudentHistory.paidMonths.includes(m);
                            return (
                              <span 
                                key={m} 
                                className={`px-2.5 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                                  isPaid 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                    : 'bg-rose-50 border-rose-100 text-rose-500'
                                }`}
                              >
                                <span>{formatMonth(m)}</span>
                                <span className="opacity-65 font-bold">
                                  (₹{(selectedStudentHistory.monthlyFeeDetails?.[m] ?? selectedStudentHistory.baseFee).toLocaleString('en-IN')})
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Complete Student Payment Logs Timeline */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col h-full min-h-[350px]">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4 shrink-0">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Transactions</h5>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[8.5px] font-black uppercase tracking-widest">
                          {studentTxns.length} payment{studentTxns.length !== 1 ? 's' : ''} logged
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[350px]">
                        {studentTxns.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                            <CreditCard className="w-10 h-10 text-slate-200 mb-2" />
                            <p className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">No payment receipts registered</p>
                          </div>
                        ) : (
                          studentTxns.map((txn, index) => (
                            <div key={txn.id || index} className="p-4 bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all rounded-2xl flex justify-between items-center group">
                              <div className="space-y-1 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                    {txn.receiptNo}
                                  </span>
                                  <span className="text-[10px] font-black text-emerald-600">
                                    ₹{txn.amount.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    via {txn.paymentMethod}
                                  </span>
                                </div>
                                <p className="text-[9.5px] text-slate-500 font-semibold mt-1">
                                  Paid Date: {txn.date}
                                </p>
                                {txn.notes && (
                                  <p className="text-[9.5px] text-slate-400 italic font-medium mt-0.5">
                                    "{txn.notes}"
                                  </p>
                                )}
                                {txn.paymentType === 'monthly' && txn.monthsPaid?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {txn.monthsPaid.map(m => (
                                      <span key={m} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-500 text-[8px] uppercase font-bold tracking-wide">
                                        {formatMonth(m).split(' ')[0]}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedTxn(txn);
                                }}
                                className="p-2 bg-white hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 transition-all active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm"
                                title="Print Cash Invoice"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Footer */}
              <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── MODAL: INVOICE RECEIPT OVERLAY ─── */}
      {selectedTxn && (() => {
        const dateTime = getTransactionDateTime(selectedTxn);
        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800 print-receipt-overlay">
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
                            const standardAmount = (selectedStudent?.id === selectedTxn.studentId ? selectedStudent.monthlyFeeDetails?.[m] : null) ?? (selectedTxn.amount + (selectedTxn.discountApplied || 0)) / selectedTxn.monthsPaid.length;
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

    </div>
  );
}
