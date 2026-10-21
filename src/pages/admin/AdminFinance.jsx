import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Users,
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
  MessageCircle,
  CalendarCheck,
  Check,
  FileSpreadsheet,
  PauseCircle,
  PlayCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  History,
  UserCheck,
  UserX,
  Share2,
  Sparkles,
  Layers,
  HelpCircle,
  BadgePercent,
  Loader2,
  BellRing,
  Trash2
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
  if (crore > 0) result += convertLessThanOneThousand(crore) + " Crore ";
  if (lakh > 0) result += convertLessThanOneThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertLessThanOneThousand(thousand) + " Thousand ";
  if (hundred > 0) result += convertLessThanOneThousand(hundred) + " ";
  
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
    if (!isNaN(parsed.getTime())) dateObj = parsed;
  }

  const day = dateObj.getDate();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;

  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours}:${minutes} ${ampm}`;

  return { date: formattedDate, time: formattedTime };
};

// Helper to format months (e.g. 2026-03 to Mar 2026)
const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const [year, month] = parts;
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export default function AdminFinance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'status';

  // Dedicated Top Tabs: 'status' | 'pay' | 'records' | 'attendance' | 'receipts'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Core Data States
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalDues: 0,
    delinquentCount: 0,
    studentsCount: 0,
    onLeaveCount: 0,
    fullyPaidCount: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'due' | 'clear' | 'delinquent' | 'leave'
  const [courseFilter, setCourseFilter] = useState('all');

  // Modals state
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configStudent, setConfigStudent] = useState(null);

  // Config Form State
  const [configForm, setConfigForm] = useState({
    feeStartDate: '',
    feeType: 'monthly',
    amount: '',
    discountType: 'none',
    discountValue: '',
    pastSettledThrough: '',
    notes: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Quick Pay Desk State (Dedicated Tab)
  const [quickPayStudentSearch, setQuickPayStudentSearch] = useState('');
  const [quickPayStudent, setQuickPayStudent] = useState(null);
  const [quickPayForm, setQuickPayForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    selectedMonths: [],
    notes: ''
  });
  const [submittingQuickPay, setSubmittingQuickPay] = useState(false);

  // 360° Student Records State (Dedicated Tab)
  const [search360Query, setSearch360Query] = useState('');
  const [selectedStudent360, setSelectedStudent360] = useState(null);
  const [student360Txns, setStudent360Txns] = useState([]);
  const [loading360, setLoading360] = useState(false);

  // Daily Attendance Register State (Dedicated Tab)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceCourseFilter, setAttendanceCourseFilter] = useState('all');
  const [dailyAttendanceSheet, setDailyAttendanceSheet] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, leave: 0, unmarked: 0 });
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Fee Transaction Deletion State
  const [deleteConfirmTxn, setDeleteConfirmTxn] = useState(null);
  const [deletingTxn, setDeletingTxn] = useState(false);

  // Sync tab with URL param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['status', 'pay', 'records', 'attendance', 'receipts'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Initial Data Fetching
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch Attendance when tab or date changes
  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchDailyAttendance(attendanceDate, attendanceCourseFilter === 'all' ? '' : attendanceCourseFilter);
    }
  }, [activeTab, attendanceDate, attendanceCourseFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, studentsRes, transactionsRes, instituteRes, coursesRes] = await Promise.all([
        api.get('/admin/finance/summary'),
        api.get('/admin/finance/students'),
        api.get('/admin/finance/transactions'),
        api.get('/admin/institute').catch(() => null),
        api.get('/admin/courses').catch(() => null)
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
      if (coursesRes && coursesRes.data.courses) {
        setCourses(coursesRes.data.courses || []);
      }
    } catch (error) {
      console.error('Failed to load finance data:', error);
      toast.error('Failed to load finance records.');
    } finally {
      setLoading(false);
    }
  };

  // ─── ATTENDANCE METHODS ───
  const fetchDailyAttendance = async (dateStr, courseId = '') => {
    setLoadingAttendance(true);
    try {
      const params = { date: dateStr || attendanceDate };
      if (courseId) params.courseId = courseId;
      const res = await api.get('/admin/attendance/daily', { params });
      if (res.data.success) {
        setDailyAttendanceSheet(res.data.students || []);
        setAttendanceStats(res.data.stats || { total: 0, present: 0, absent: 0, leave: 0, unmarked: 0 });
      }
    } catch (err) {
      console.error('Fetch Attendance Error:', err);
      toast.error('Failed to load daily attendance sheet');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleAttendanceStatusChange = (studentId, newStatus) => {
    setDailyAttendanceSheet(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, status: newStatus };
      }
      return s;
    }));
  };

  const handleAttendanceRemarksChange = (studentId, remarks) => {
    setDailyAttendanceSheet(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return { ...s, remarks };
      }
      return s;
    }));
  };

  const handleMarkAllPresent = () => {
    setDailyAttendanceSheet(prev => prev.map(s => ({ ...s, status: 'present' })));
    toast.success('All marked as Present! Click "Save Attendance" to confirm.');
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = dailyAttendanceSheet.map(s => ({
        studentId: s.studentId,
        studentName: s.name,
        rollNumber: s.rollNumber,
        courseId: s.courseId,
        status: s.status === 'unmarked' ? 'present' : s.status,
        remarks: s.remarks || ''
      }));

      const res = await api.post('/admin/attendance/daily', {
        date: attendanceDate,
        records
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Attendance saved successfully!');
        fetchDailyAttendance(attendanceDate, attendanceCourseFilter === 'all' ? '' : attendanceCourseFilter);
      }
    } catch (err) {
      console.error('Save Attendance Error:', err);
      toast.error('Failed to save daily attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  // ─── 360° LEDGER METHODS ───
  const fetchStudent360 = async (studentId) => {
    setLoading360(true);
    try {
      const res = await api.get(`/admin/finance/students/${studentId}/ledger`);
      if (res.data.success) {
        setSelectedStudent360(res.data.student);
        setStudent360Txns(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Fetch 360 Ledger Error:', err);
      toast.error('Failed to load 360 student ledger');
    } finally {
      setLoading360(false);
    }
  };

  const handleToggleLeaveMonth = async (studentId, monthStr) => {
    try {
      const res = await api.post(`/admin/finance/students/${studentId}/toggle-leave`, { month: monthStr });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchStudent360(studentId);
        fetchData();
      }
    } catch (err) {
      console.error('Toggle Leave Error:', err);
      toast.error('Failed to toggle leave month');
    }
  };

  // ─── CONFIGURATION MODAL METHODS ───
  const handleOpenConfig = (student) => {
    setConfigStudent(student);
    setConfigForm({
      feeStartDate: student.feeStartDate || student.createdAt?.split('T')[0] || '',
      feeType: student.feeType || 'monthly',
      amount: student.baseFee || '',
      discountType: student.discountType || 'none',
      discountValue: student.discountValue || '',
      pastSettledThrough: student.pastSettledThrough || '',
      notes: ''
    });
    setIsConfigOpen(true);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!configStudent) return;

    setSavingConfig(true);
    try {
      const res = await api.post(`/admin/finance/students/${configStudent.id}/config`, {
        feeStartDate: configForm.feeStartDate,
        feeType: configForm.feeType,
        amount: configForm.amount === '' ? null : Number(configForm.amount),
        discountType: configForm.discountType,
        discountValue: configForm.discountValue === '' ? 0 : Number(configForm.discountValue),
        pastSettledThrough: configForm.pastSettledThrough || null,
        notes: configForm.notes || ''
      });

      if (res.data.success) {
        toast.success('Fee configuration updated successfully!');
        setIsConfigOpen(false);
        fetchData();
        if (selectedStudent360 && selectedStudent360.id === configStudent.id) {
          fetchStudent360(configStudent.id);
        }
      }
    } catch (err) {
      console.error('Save Config Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  // ─── QUICK PAY DESK METHODS ───
  const handleSelectQuickPayStudent = (student) => {
    setQuickPayStudent(student);
    const dueMonths = student.dueMonths || [];
    const firstDue = dueMonths.length > 0 ? [dueMonths[0]] : [];
    
    let initialAmount = 0;
    if (student.feeType === 'monthly') {
      firstDue.forEach(m => {
        const item = student.monthlyTimeline?.find(x => x.month === m);
        initialAmount += item ? item.netFee : student.netMonthlyFee;
      });
    } else {
      initialAmount = student.totalDue;
    }

    setQuickPayForm({
      amount: initialAmount || student.netMonthlyFee || '',
      paymentMethod: 'Cash',
      paymentDate: new Date().toISOString().split('T')[0],
      selectedMonths: firstDue,
      notes: ''
    });
  };

  const handleQuickPayMonthToggle = (month) => {
    if (!quickPayStudent) return;
    const isSelected = quickPayForm.selectedMonths.includes(month);
    let updatedMonths = [];
    if (isSelected) {
      updatedMonths = quickPayForm.selectedMonths.filter(m => m !== month);
    } else {
      updatedMonths = [...quickPayForm.selectedMonths, month];
    }

    let calculatedAmount = 0;
    updatedMonths.forEach(m => {
      const item = quickPayStudent.monthlyTimeline?.find(x => x.month === m);
      calculatedAmount += item ? item.netFee : quickPayStudent.netMonthlyFee;
    });

    setQuickPayForm(prev => ({
      ...prev,
      selectedMonths: updatedMonths,
      amount: updatedMonths.length > 0 ? calculatedAmount : ''
    }));
  };

  const handleQuickPaySubmit = async (e) => {
    e.preventDefault();
    if (!quickPayStudent) {
      toast.error('Please select a student');
      return;
    }
    const amt = Number(quickPayForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setSubmittingQuickPay(true);
    try {
      const res = await api.post('/admin/finance/pay-fee', {
        studentId: quickPayStudent.id,
        amount: amt,
        paymentMethod: quickPayForm.paymentMethod,
        paymentDate: quickPayForm.paymentDate,
        months: quickPayForm.selectedMonths,
        notes: quickPayForm.notes
      });

      if (res.data.success) {
        if (res.data.emailDispatched) {
          toast.success(`Payment recorded & receipt emailed to ${res.data.studentEmail} ✉️`);
        } else {
          toast.success('Payment recorded and receipt generated!');
        }
        fetchData();
        if (selectedStudent360 && selectedStudent360.id === quickPayStudent.id) {
          fetchStudent360(quickPayStudent.id);
        }
        setSelectedTxn(res.data.transaction);
        // Reset Desk
        setQuickPayStudent(null);
        setQuickPayStudentSearch('');
        setQuickPayForm({
          amount: '',
          paymentMethod: 'Cash',
          paymentDate: new Date().toISOString().split('T')[0],
          selectedMonths: [],
          notes: ''
        });
      }
    } catch (err) {
      console.error('Quick Pay Error:', err);
      toast.error(err.response?.data?.message || 'Payment submission failed');
    } finally {
      setSubmittingQuickPay(false);
    }
  };

  // ─── FEE REMINDER METHODS ───
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [bulkReminderLoading, setBulkReminderLoading] = useState(false);

  const handleSendReminder = async (student) => {
    if (!student || !student.id) return;
    setSendingReminderId(student.id);
    try {
      const res = await api.post(`/admin/finance/send-reminder/${student.id}`);
      if (res.data.success) {
        toast.success(res.data.message || `Fee reminder email & notification sent to ${student.name}!`);
      } else {
        toast.error(res.data.message || 'Failed to send reminder');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send fee reminder');
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleBulkReminders = async () => {
    const dueCount = students.filter(s => s.status === 'active' && s.totalDue > 0).length;
    if (dueCount === 0) {
      toast.success('All active students have cleared fees. No reminders needed!');
      return;
    }
    const confirmSend = window.confirm(`Send automated fee reminder email & in-app alert to all ${dueCount} student(s) with dues?`);
    if (!confirmSend) return;

    setBulkReminderLoading(true);
    try {
      const res = await api.post('/admin/finance/send-bulk-reminders');
      if (res.data.success) {
        toast.success(res.data.message || `Fee reminders dispatched to ${res.data.sentCount} student(s)!`);
      } else {
        toast.error(res.data.message || 'Failed to send bulk reminders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send bulk reminders');
    } finally {
      setBulkReminderLoading(false);
    }
  };

  // ─── FEE TRANSACTION DELETION (REVERT BALANCE) ───
  const handleDeleteTransaction = async () => {
    if (!deleteConfirmTxn) return;
    setDeletingTxn(true);
    try {
      const res = await api.delete(`/admin/finance/transactions/${deleteConfirmTxn.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Fee transaction deleted and student balance reverted successfully!');
        setTransactions(prev => prev.filter(t => t.id !== deleteConfirmTxn.id));
        setStudent360Txns(prev => prev.filter(t => t.id !== deleteConfirmTxn.id));
        fetchData();
        if (selectedStudent360 && (selectedStudent360.id === deleteConfirmTxn.studentId || selectedStudent360.studentId === deleteConfirmTxn.studentId)) {
          fetchStudent360(selectedStudent360.id || selectedStudent360.studentId);
        }
        setDeleteConfirmTxn(null);
      } else {
        toast.error(res.data.message || 'Failed to delete fee transaction');
      }
    } catch (error) {
      console.error('Delete transaction error:', error);
      toast.error(error.response?.data?.message || 'Server error while deleting fee record');
    } finally {
      setDeletingTxn(false);
    }
  };

  // ─── EXPORT TO EXCEL (.CSV WITH UTF-8 BOM) ───
  const exportToExcel = (dataToExport) => {
    const list = dataToExport || filteredStudents;
    if (!list || list.length === 0) {
      toast.error('No student records found to export');
      return;
    }

    const headers = [
      'Roll Number',
      'Student Name',
      'Phone',
      'Father Name',
      'Course',
      'Fee Start Date',
      'Fee Model',
      'Base Monthly Fee',
      'Monthly Discount',
      'Net Monthly Fee',
      'Total Billed Months',
      'Total Paid (Rs)',
      'Total Due (Rs)',
      'Status',
      'Pending Due Months'
    ];

    const rows = list.map(s => [
      `"${s.rollNumber || 'N/A'}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.phone || 'N/A'}"`,
      `"${(s.fatherName || 'N/A').replace(/"/g, '""')}"`,
      `"${(s.courseName || '').replace(/"/g, '""')}"`,
      `"${s.feeStartDate || s.createdAt?.split('T')[0] || 'N/A'}"`,
      `"${s.feeType || 'monthly'}"`,
      s.baseFee || 0,
      `"${s.discountText || 'None'}"`,
      s.netMonthlyFee || 0,
      s.monthlyTimeline?.length || 0,
      s.paidAmount || 0,
      s.totalDue || 0,
      `"${(s.overallStatus || 'clear').toUpperCase()}"`,
      `"${(s.dueMonths || []).join('; ')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Nextgen_Student_Fees_Master_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fee master sheet exported to Excel (.csv) successfully!');
  };

  // ─── WHATSAPP SHARE & RECEIPT PRINT ───
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!selectedTxn) return;
    const dateTime = getTransactionDateTime(selectedTxn);
    const shareText = `*Nextgen computer training institute*
*FEE PAYMENT RECEIPT*
---------------------------------
*Receipt No:* ${selectedTxn.receiptNo}
*Date:* ${dateTime.date} (${dateTime.time})
---------------------------------
*Student Name:* ${selectedTxn.studentName}
*Roll Number:* ${selectedTxn.studentRollNumber}
*Course:* ${selectedTxn.courseName}
*Payment Method:* ${selectedTxn.paymentMethod}
*Paid Amount:* ₹${Number(selectedTxn.amount).toLocaleString('en-IN')}
*Amount in Words:* ${convertNumberToWords(selectedTxn.amount)}
---------------------------------
_Thank you for your timely payment!_
*Nextgen Computer Training Institute, Muskara*`;

    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('Receipt details copied to clipboard!');
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    }).catch(() => {
      toast.error('Failed to copy receipt details');
    });
  };

  // Status breakdown counts
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  const oldStudentsCount = students.filter(s => s.status === 'old').length;
  const dueStudentsCount = students.filter(s => s.status === 'active' && s.totalDue > 0).length;
  const delinquentStudentsCount = students.filter(s => s.status === 'active' && (s.overallStatus === 'delinquent' || (s.feeType === 'monthly' && s.dueMonths?.length >= 2))).length;
  const clearedStudentsCount = students.filter(s => s.status === 'active' && s.totalDue === 0).length;
  const leaveStudentsCount = students.filter(s => s.status === 'active' && (s.overallStatus === 'leave' || s.leaveMonths?.length > 0)).length;
  const inactiveStudentsCount = students.filter(s => s.status === 'inactive' || s.status === 'rejected' || s.status === 'exit' || s.status === 'dropped').length;

  // Filter students for Master Sheet
  const filteredStudents = students.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(query)) ||
      (s.phone && s.phone.toLowerCase().includes(query)) ||
      (s.courseName && s.courseName.toLowerCase().includes(query));

    const matchesCourse = courseFilter === 'all' || s.courseId === courseFilter;

    const isOld = s.status === 'old';
    const isInactive = s.status === 'inactive' || s.status === 'rejected' || s.status === 'exit' || s.status === 'dropped';

    let matchesStatus = true;
    if (statusFilter === 'old') {
      matchesStatus = isOld;
    } else if (statusFilter === 'inactive') {
      matchesStatus = isInactive;
    } else {
      // All active operational tabs only include ACTIVE enrolled students
      if (s.status !== 'active') return false;

      if (statusFilter === 'due') matchesStatus = s.totalDue > 0;
      else if (statusFilter === 'clear') matchesStatus = s.totalDue === 0;
      else if (statusFilter === 'delinquent') matchesStatus = s.overallStatus === 'delinquent' || (s.feeType === 'monthly' && s.dueMonths?.length >= 2);
      else if (statusFilter === 'leave') matchesStatus = s.overallStatus === 'leave' || s.leaveMonths?.length > 0;
    }

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16 w-full max-w-[1650px] mx-auto px-2 sm:px-4 lg:px-6 font-sans antialiased text-slate-800">
      {/* Dynamic Print CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden !important; }
          .print-receipt-overlay,
          .print-receipt-overlay *,
          #print-receipt-modal,
          #print-receipt-modal * {
            visibility: visible !important;
          }
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
          }
          #print-receipt-modal {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            padding: 24px !important;
            background: white !important;
          }
          .no-print, button, .no-print * {
            display: none !important;
          }
        }
      `}} />

      {/* ─── PAGE HEADER (ALIGNED WITH ADMIN STUDENTS & COURSES) ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[10px] font-bold uppercase tracking-wider border border-primary-200/60">
              Institutional Finance
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Fees, Ledger & <span className="text-primary-600">Daily Attendance</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">
            Real-time student fee collection, monthly discounts, 360° ledgers & 1-click attendance register.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => exportToExcel()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* ─── SEGMENTED NAVIGATION TABS BAR ─── */}
      <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        {[
          { id: 'status', label: 'Fee Status & Sheet', icon: FileSpreadsheet, badge: `${students.length}` },
          { id: 'pay', label: 'Quick Fee Pay', icon: CreditCard, badge: 'Cashier Desk' },
          { id: 'records', label: 'Student 360° Records', icon: UserCheck, badge: 'Ledger' },
          { id: 'attendance', label: 'Daily Attendance Register', icon: CalendarCheck, badge: 'Daily' },
          { id: 'receipts', label: 'Receipts Log', icon: History, badge: `${transactions.length}` }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? 'bg-primary-600 text-white font-extrabold shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: FEE STATUS & MASTER SHEET (TABULAR + EXCEL) ─── */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Dynamic Statistics Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Collections</p>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                  ₹{summary.totalRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Today: <strong className="text-slate-800">₹{summary.todayRevenue?.toLocaleString('en-IN') || 0}</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Outstanding Dues</p>
                <p className="text-2xl font-extrabold text-rose-600 tracking-tight group-hover:text-rose-700 transition-colors">
                  ₹{summary.totalDues.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-rose-500 font-semibold">
                  {summary.delinquentCount} Students Pending
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Critical Defaulters</p>
                <p className="text-2xl font-extrabold text-amber-600 tracking-tight group-hover:text-amber-700 transition-colors">
                  {summary.delinquentCount}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Fully Cleared: <strong className="text-emerald-600">{summary.fullyPaidCount || 0}</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group duration-300">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Active Students</p>
                <p className="text-2xl font-extrabold text-emerald-600 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {summary.studentsCount}
                </p>
                <p className="text-[11px] text-purple-600 font-semibold">
                  {summary.onLeaveCount || 0} On Approved Leave
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Master Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Filter and Search Bar - 2 Tier Clean Layout */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/60 space-y-3.5">
              {/* Tier 1: Search, Course Selector, and Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by student name, roll no, phone..."
                      className="w-full pl-9.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400 font-medium shadow-2xs"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Course Filter */}
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Courses ({courses.length})</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <span className="text-xs text-slate-500 font-medium hidden xl:inline-block pl-1">
                    Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of {students.length} students
                  </span>
                </div>

                {/* Top Right Quick Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {dueStudentsCount > 0 && (
                    <button
                      onClick={handleBulkReminders}
                      disabled={bulkReminderLoading}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                      title="Send automated email and in-app fee reminders to all students with dues"
                    >
                      {bulkReminderLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <BellRing className="w-3.5 h-3.5" />
                      )}
                      <span>Notify Due Students ({dueStudentsCount})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tier 2: Dedicated Full-Width Segmented Status Filter Tabs */}
              <div className="pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {[
                    { id: 'all', label: 'All Active', count: activeStudentsCount },
                    { id: 'due', label: 'Due Balances', count: dueStudentsCount },
                    { id: 'delinquent', label: 'Defaulters', count: delinquentStudentsCount },
                    { id: 'clear', label: 'Cleared', count: clearedStudentsCount },
                    { id: 'leave', label: 'On Leave', count: leaveStudentsCount },
                    { id: 'old', label: 'Old (Online Only)', count: oldStudentsCount },
                    { id: 'inactive', label: 'Inactive / Blocked', count: inactiveStudentsCount }
                  ].map(f => {
                    const isSelected = statusFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                          isSelected
                            ? 'bg-white text-primary-700 font-extrabold shadow-xs border-primary-200/80 ring-1 ring-primary-500/20'
                            : 'bg-white/60 hover:bg-white text-slate-600 hover:text-slate-900 border-slate-200/70'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          isSelected 
                            ? 'bg-primary-50 text-primary-700 border border-primary-200/60' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tabular Student List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="p-3.5 pl-6 whitespace-nowrap min-w-[130px]">Roll No</th>
                    <th className="p-3.5 min-w-[180px]">Student Name</th>
                    <th className="p-3.5 min-w-[150px] whitespace-nowrap">Course</th>
                    <th className="p-3.5 whitespace-nowrap">Fee Start Date</th>
                    <th className="p-3.5 whitespace-nowrap">Fee Structure</th>
                    <th className="p-3.5 whitespace-nowrap">Total Paid</th>
                    <th className="p-3.5 whitespace-nowrap">Total Due</th>
                    <th className="p-3.5 text-center whitespace-nowrap">Status</th>
                    <th className="p-3.5 pr-6 text-right whitespace-nowrap sticky right-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-16 text-center text-slate-400">
                        <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-sm text-slate-600">No student records match the selected filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(student => {
                      const isClear = student.totalDue === 0;
                      const isDelinquent = student.overallStatus === 'delinquent';
                      const isOnLeave = student.overallStatus === 'leave';
                      const isOld = student.status === 'old';
                      const isInactive = student.status === 'inactive' || student.status === 'rejected' || student.status === 'exit' || student.status === 'dropped';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-all group">
                          {/* Roll Number */}
                          <td className="p-3.5 pl-6 whitespace-nowrap min-w-[130px]">
                            <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200/60 whitespace-nowrap inline-block tracking-tight">
                              {student.rollNumber}
                            </span>
                          </td>

                          {/* Student Details */}
                          <td className="p-3.5 min-w-[180px]">
                            <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{student.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal truncate max-w-[220px]">
                              Phone: {student.phone} • Father: {student.fatherName}
                            </div>
                          </td>

                          {/* Course */}
                          <td className="p-3.5 min-w-[150px]">
                            <span className="font-semibold text-slate-800 block whitespace-nowrap">{student.courseName}</span>
                            <span className={`block text-[10px] uppercase font-bold whitespace-nowrap ${student.feeType === 'fixed' ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {student.feeType === 'fixed' ? 'Fixed Fee' : 'Monthly Fee'}
                            </span>
                          </td>

                          {/* Fee Start Date */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="text-slate-700 font-medium whitespace-nowrap">
                              {student.feeStartDate || 'From Admission'}
                            </span>
                          </td>

                          {/* Fee Structure & Discount */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 whitespace-nowrap">
                              {student.feeType === 'fixed' ? (
                                <span className="text-slate-900">₹{student.baseFee?.toLocaleString('en-IN')}</span>
                              ) : (
                                <span>₹{student.netMonthlyFee}/mo</span>
                              )}
                              {student.discountValue > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 whitespace-nowrap">
                                  {student.discountText}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                              {student.feeType === 'fixed' ? 'Total Course Fee' : `Base: ₹${student.baseFee}/mo`}
                            </span>
                          </td>

                          {/* Total Paid */}
                          <td className="p-3.5 font-bold text-emerald-600 text-sm whitespace-nowrap tabular-nums">
                            ₹{student.paidAmount.toLocaleString('en-IN')}
                          </td>

                          {/* Total Due */}
                          <td className="p-3.5 whitespace-nowrap">
                            {student.totalDue > 0 ? (
                              <div>
                                <span className="font-extrabold text-rose-600 text-sm whitespace-nowrap tabular-nums">
                                  ₹{student.totalDue.toLocaleString('en-IN')}
                                </span>
                                {student.feeType === 'monthly' && student.dueMonths?.length > 0 ? (
                                  <span className="block text-[10px] text-rose-500 font-medium whitespace-nowrap">
                                    ({student.dueMonths.length} mos due)
                                  </span>
                                ) : student.feeType === 'fixed' ? (
                                  <span className="block text-[10px] text-amber-600 font-semibold whitespace-nowrap">
                                    (Balance Due)
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="font-bold text-emerald-600 whitespace-nowrap tabular-nums">
                                ₹0 (Cleared)
                              </span>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {isOld ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-200 whitespace-nowrap" title="Old Student: Only Online Access, Offline Fee Stopped">
                                Old (Online Only)
                              </span>
                            ) : isInactive ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200 whitespace-nowrap" title="Account Inactive / Blocked">
                                Inactive (Blocked)
                              </span>
                            ) : isOnLeave ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider border border-purple-200 whitespace-nowrap">
                                On Leave
                              </span>
                            ) : isClear ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 whitespace-nowrap">
                                Cleared
                              </span>
                            ) : isDelinquent ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-200 whitespace-nowrap">
                                Defaulter
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-200 whitespace-nowrap">
                                Due
                              </span>
                            )}
                          </td>

                          {/* Row Actions */}
                          <td className="p-3.5 pr-6 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50/95 transition-colors z-10 shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.06)]">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Collect Fee Button */}
                              <button
                                onClick={() => {
                                  handleSelectQuickPayStudent(student);
                                  handleTabChange('pay');
                                }}
                                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="Collect Fee on Cashier Desk"
                              >
                                Pay Fee
                              </button>

                              {/* View 360 Ledger */}
                              <button
                                onClick={() => {
                                  fetchStudent360(student.id);
                                  handleTabChange('records');
                                }}
                                className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="Open Complete 360 Ledger"
                              >
                                360° Ledger
                              </button>

                              {/* Send Due Reminder Button */}
                              {student.totalDue > 0 && (
                                <button
                                  onClick={() => handleSendReminder(student)}
                                  disabled={sendingReminderId === student.id}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-all cursor-pointer"
                                  title="Send Fee Due Reminder Email & In-App Alert"
                                >
                                  {sendingReminderId === student.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                  ) : (
                                    <Mail className="w-4 h-4" />
                                  )}
                                </button>
                              )}

                              {/* Configure */}
                              <button
                                onClick={() => handleOpenConfig(student)}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                                title="Edit Fee Start Date & Discounts"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Counter */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Showing {filteredStudents.length} of {students.length} students</span>
              <button
                onClick={() => exportToExcel(filteredStudents)}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Filtered View as Excel (.csv)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: QUICK FEE PAY (CASHIER DESK) ─── */}
      {activeTab === 'pay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Student Selector & Search */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Search className="w-4 h-4 text-primary-600" />
                Select Student for Fee Payment
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Search by student name or enrollment roll number to load due months instantly.
              </p>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickPayStudentSearch}
                  onChange={(e) => setQuickPayStudentSearch(e.target.value)}
                  placeholder="Type student name or roll number..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>

              {/* Student Search Results / Fast Picker */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {students
                  .filter(s => {
                    const q = quickPayStudentSearch.toLowerCase().trim();
                    return !q || s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.phone.includes(q);
                  })
                  .slice(0, 8)
                  .map(s => {
                    const isSelected = quickPayStudent?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectQuickPayStudent(s)}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary-50/80 border-primary-300 ring-2 ring-primary-500/20 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                            isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                            <div className="text-[11px] text-slate-500">
                              Roll: {s.rollNumber} • {s.courseName}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-extrabold block ${s.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {s.totalDue > 0 ? `₹${s.totalDue}` : 'Cleared'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {s.totalDue > 0 ? `${s.dueMonths?.length || 0} mos due` : 'Paid'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Quick Student Profile Badge if Selected */}
            {quickPayStudent && (
              <div className="bg-white rounded-2xl p-5 border border-primary-200/80 shadow-sm space-y-3.5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">Selected Payer</span>
                    <h4 className="text-base font-extrabold text-slate-900">{quickPayStudent.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">Roll: {quickPayStudent.rollNumber} • {quickPayStudent.courseName}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    quickPayStudent.totalDue > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {quickPayStudent.totalDue > 0 ? `Due: ₹${quickPayStudent.totalDue}` : 'Fully Paid'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Start Date</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{quickPayStudent.feeStartDate || 'From Admission'}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Rate</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">₹{quickPayStudent.netMonthlyFee}/mo</span>
                    {quickPayStudent.discountValue > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold block">{quickPayStudent.discountText}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Payment Counter Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Cashier Payment Desk
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Collect fees, select specific installment months, backdate for offline records, and print official receipts.
                </p>
              </div>

              {!quickPayStudent ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <User className="w-12 h-12 mx-auto text-slate-300" />
                  <h4 className="font-bold text-sm text-slate-700">No Student Selected</h4>
                  <p className="text-xs max-w-sm mx-auto text-slate-400">
                    Please search and select a student from the left panel to record a fee payment.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickPaySubmit} className="space-y-6">
                  {/* Select Months to Settle (if monthly model) */}
                  {quickPayStudent.feeType === 'monthly' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Select Installment Month(s) to Pay
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                        {quickPayStudent.monthlyTimeline?.map(m => {
                          const isSelected = quickPayForm.selectedMonths.includes(m.month);
                          const isPaid = m.isPaid;
                          const isLeave = m.isLeave;

                          return (
                            <button
                              key={m.month}
                              type="button"
                              disabled={isPaid || isLeave}
                              onClick={() => handleQuickPayMonthToggle(m.month)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                                isPaid
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed opacity-75'
                                  : isLeave
                                  ? 'bg-purple-50 border-purple-200 text-purple-700 cursor-not-allowed opacity-75'
                                  : isSelected
                                  ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-primary-400'
                              }`}
                            >
                              <span>{m.monthName}</span>
                              <span className="text-[11px] opacity-85">
                                (₹{m.netFee})
                              </span>
                              {isPaid && <Check className="w-3 h-3 text-emerald-600" />}
                              {isLeave && <span className="text-[9px] uppercase font-bold">Leave</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Payment Amount & Payment Date Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Amount to Collect (₹) *
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="number"
                          required
                          min="1"
                          value={quickPayForm.amount}
                          onChange={(e) => setQuickPayForm({ ...quickPayForm, amount: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Supports custom partial payments (e.g. ₹300 instead of ₹500).
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                        Payment Date (Can Backdate) *
                      </label>
                      <input
                        type="date"
                        required
                        value={quickPayForm.paymentDate}
                        onChange={(e) => setQuickPayForm({ ...quickPayForm, paymentDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span className="text-[11px] text-slate-400">
                        Select a past date to record historical offline payments!
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Payment Mode / Method *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Offline Record'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setQuickPayForm({ ...quickPayForm, paymentMethod: method })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            quickPayForm.paymentMethod === method
                              ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-500/20'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes / Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Remarks / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={quickPayForm.notes}
                      onChange={(e) => setQuickPayForm({ ...quickPayForm, notes: e.target.value })}
                      placeholder="e.g. Paid in cash at reception, received by Admin..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setQuickPayStudent(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingQuickPay}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{submittingQuickPay ? 'Recording...' : 'Collect Fee & Print Receipt'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: STUDENT 360° RECORDS & LEDGER ─── */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          {/* Search bar for single student selection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Select Student for Comprehensive 360° Profile & Ledger
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search360Query}
                  onChange={(e) => setSearch360Query(e.target.value)}
                  placeholder="Type name, roll number, or phone..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              {search360Query && (
                <div className="w-full sm:w-auto flex flex-wrap gap-1.5">
                  {students
                    .filter(s => s.name.toLowerCase().includes(search360Query.toLowerCase()) || s.rollNumber.toLowerCase().includes(search360Query.toLowerCase()))
                    .slice(0, 4)
                    .map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          fetchStudent360(s.id);
                          setSearch360Query('');
                        }}
                        className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        {s.name} ({s.rollNumber})
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* 360 Ledger Content */}
          {!selectedStudent360 ? (
            <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center text-slate-400 space-y-3 shadow-sm">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="font-bold text-base text-slate-700">No Student Loaded in 360° Ledger</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Search a student above or click "360° Ledger" next to any student in the Fee Status Sheet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-extrabold text-xl uppercase shadow-sm">
                      {selectedStudent360.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedStudent360.name}</h2>
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1 font-medium">
                        <span className="font-bold text-slate-700">Roll: {selectedStudent360.rollNumber}</span>
                        <span>•</span>
                        <span>Course: <strong>{selectedStudent360.courseName}</strong></span>
                        <span>•</span>
                        <span>Father: {selectedStudent360.fatherName || 'N/A'}</span>
                        <span>•</span>
                        <span>Phone: {selectedStudent360.phone || selectedStudent360.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(selectedStudent360.totalDue > 0 || selectedStudent360.feeStatus?.totalDue > 0) && (
                      <button
                        onClick={() => handleSendReminder(selectedStudent360)}
                        disabled={sendingReminderId === selectedStudent360.id}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200 transition-all cursor-pointer shadow-sm"
                        title="Send Fee Due Reminder Email & In-App Alert"
                      >
                        {sendingReminderId === selectedStudent360.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5" />
                        )}
                        <span>Send Fee Reminder</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenConfig(selectedStudent360)}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 transition-all cursor-pointer shadow-sm"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit Fee Start Date & Discounts</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSelectQuickPayStudent(selectedStudent360);
                        handleTabChange('pay');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Collect Fee</span>
                    </button>
                  </div>
                </div>

                {/* 4 Financial & Attendance Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Billed Cost</span>
                    <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                      ₹{selectedStudent360.feeStatus?.totalBilledCost?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Total Paid</span>
                    <span className="text-xl font-extrabold text-emerald-600 mt-1 block">
                      ₹{selectedStudent360.feeStatus?.paidAmount?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Outstanding Due</span>
                    <span className="text-xl font-extrabold text-rose-600 mt-1 block">
                      ₹{selectedStudent360.feeStatus?.totalDue?.toLocaleString('en-IN') || 0}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">Daily Attendance</span>
                    <span className="text-xl font-extrabold text-primary-700 mt-1 block">
                      {selectedStudent360.attendanceSummary?.totalPresent || 0} Days Present
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      ({selectedStudent360.attendanceSummary?.totalLeave || 0} Leaves • {selectedStudent360.attendanceSummary?.totalAbsent || 0} Absent)
                    </span>
                  </div>
                </div>
              </div>

              {/* Month-by-Month Interactive Billing Grid */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      Month-by-Month Billing & Attendance Matrix
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Calculated from Fee Start Date ({selectedStudent360.feeStatus?.feeStartDate}) to current month.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Tip: Click "Waive / Leave" to pause bill for student leaves
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {selectedStudent360.feeStatus?.monthlyTimeline?.map((item) => {
                    const isPaid = item.isPaid;
                    const isLeave = item.isLeave;
                    const isSettled = item.status === 'settled';

                    return (
                      <div
                        key={item.month}
                        className={`p-4 rounded-xl border transition-all ${
                          isLeave 
                            ? 'bg-purple-50/50 border-purple-200' 
                            : isPaid 
                            ? 'bg-emerald-50/40 border-emerald-200' 
                            : 'bg-white border-slate-200 shadow-sm hover:border-primary-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{item.monthName}</h4>
                            <span className="text-[11px] text-slate-500">Month: {item.month}</span>
                          </div>

                          {isLeave ? (
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] uppercase tracking-wider">
                              On Leave (₹0)
                            </span>
                          ) : isSettled ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
                              Settled Offline
                            </span>
                          ) : isPaid ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-wider">
                              Paid (₹{item.netFee})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider">
                              Due: ₹{item.netFee}
                            </span>
                          )}
                        </div>

                        {/* Attendance for this month */}
                        <div className="bg-white/80 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1 mb-3">
                          <div className="flex justify-between text-slate-600 font-medium">
                            <span>Attendance this month:</span>
                            <strong className="text-slate-900 font-bold">
                              {item.attendance?.present || 0} Present / {item.attendance?.total || 0} Days
                            </strong>
                          </div>
                          {(item.attendance?.leave > 0 || item.attendance?.absent > 0) && (
                            <div className="text-[11px] text-slate-500 flex gap-2">
                              <span>Absent: {item.attendance?.absent || 0}</span>
                              <span>Leaves: {item.attendance?.leave || 0}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleToggleLeaveMonth(selectedStudent360.id, item.month)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isLeave
                                ? 'bg-purple-100 hover:bg-purple-200 text-purple-800'
                                : 'bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700'
                            }`}
                          >
                            {isLeave ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                            <span>{isLeave ? 'Unpause Bill' : 'Waive / Leave (₹0)'}</span>
                          </button>

                          {!isPaid && !isLeave && (
                            <button
                              onClick={() => {
                                handleSelectQuickPayStudent(selectedStudent360);
                                setQuickPayForm(prev => ({
                                  ...prev,
                                  selectedMonths: [item.month],
                                  amount: item.netFee
                                }));
                                handleTabChange('pay');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Pay Month
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transactions History for this student */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <History className="w-4 h-4 text-primary-600" />
                  Receipts & Payment History for {selectedStudent360.name}
                </h3>

                {student360Txns.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No payment receipts registered yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                          <th className="py-2.5">Receipt No</th>
                          <th className="py-2.5">Payment Date</th>
                          <th className="py-2.5">Amount Paid</th>
                          <th className="py-2.5">Payment Mode</th>
                          <th className="py-2.5">Months Settled</th>
                          <th className="py-2.5 text-right">Receipt Slip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {student360Txns.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-3 font-bold text-slate-800">{t.receiptNo}</td>
                            <td className="py-3 text-slate-600">{t.date}</td>
                            <td className="py-3 font-extrabold text-emerald-600">₹{t.amount.toLocaleString('en-IN')}</td>
                            <td className="py-3">{t.paymentMethod}</td>
                            <td className="py-3 text-xs text-slate-500">
                              {t.monthsPaid?.map(formatMonth).join(', ') || 'N/A'}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedTxn(t)}
                                  className="px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                >
                                  Print Slip
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmTxn(t)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                  title="Delete Fee Record & Revert Balance"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: DAILY ATTENDANCE REGISTER ─── */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Action & Date Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Date Input */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-primary-600 ml-2" />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none pr-2 cursor-pointer font-sans"
                />
              </div>

              {/* Quick Today Button */}
              <button
                onClick={() => setAttendanceDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Today
              </button>

              {/* Course Filter */}
              <select
                value={attendanceCourseFilter}
                onChange={(e) => setAttendanceCourseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="all">All Batches & Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Attendance Fast Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingAttendance ? 'Saving...' : 'Save Attendance'}</span>
              </button>
            </div>
          </div>

          {/* Attendance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Students</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">{attendanceStats.total}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">Present</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{attendanceStats.present}</span>
            </div>
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">Absent</span>
              <span className="text-xl font-extrabold text-rose-700 mt-1 block">{attendanceStats.absent}</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">On Leave</span>
              <span className="text-xl font-extrabold text-purple-700 mt-1 block">{attendanceStats.leave}</span>
            </div>
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Unmarked</span>
              <span className="text-xl font-extrabold text-slate-700 mt-1 block">{attendanceStats.unmarked}</span>
            </div>
          </div>

          {/* Student Daily Attendance Sheet */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-700">
              <span>Attendance Sheet for Date: <strong className="text-primary-700">{attendanceDate}</strong></span>
              <span className="text-slate-400 font-normal">Click P (Present), A (Absent), or L (Leave) for each student.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                    <th className="p-3.5 pl-6 whitespace-nowrap min-w-[130px]">Roll No</th>
                    <th className="p-3.5 min-w-[160px]">Student Name</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5 text-center">Attendance Status</th>
                    <th className="p-3.5 pr-6">Remarks / Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {dailyAttendanceSheet.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {loadingAttendance ? 'Loading attendance sheet...' : 'No students found.'}
                      </td>
                    </tr>
                  ) : (
                    dailyAttendanceSheet.map((student) => (
                      <tr key={student.studentId} className="hover:bg-slate-50/60 transition-all">
                        <td className="p-3.5 pl-6 font-bold text-slate-800 whitespace-nowrap min-w-[130px]">{student.rollNumber}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">Phone: {student.phone}</div>
                        </td>
                        <td className="p-3.5 font-normal text-slate-600">{student.courseName}</td>

                        {/* Status Toggle Buttons */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 gap-1">
                            <button
                              type="button"
                              onClick={() => handleAttendanceStatusChange(student.studentId, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                student.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              P (Present)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAttendanceStatusChange(student.studentId, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                student.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              A (Absent)
                            </button>

                            <button
                              type="button"
                              onClick={() => handleAttendanceStatusChange(student.studentId, 'leave')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                student.status === 'leave'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-purple-700'
                              }`}
                            >
                              L (Leave)
                            </button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="p-3.5 pr-6">
                          <input
                            type="text"
                            value={student.remarks || ''}
                            onChange={(e) => handleAttendanceRemarksChange(student.studentId, e.target.value)}
                            placeholder="Optional note (e.g. sick leave)..."
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:bg-white"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                disabled={savingAttendance}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                Save Attendance Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: RECEIPTS LOG ─── */}
      {activeTab === 'receipts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-primary-600" />
                All Institute Receipt Logs
              </h3>
              <p className="text-xs text-slate-500 font-medium">Every collected fee receipt recorded with date, mode, and student roll number.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{transactions.length} receipts registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                  <th className="py-2.5 pl-4 whitespace-nowrap">Receipt No</th>
                  <th className="py-2.5 whitespace-nowrap">Date</th>
                  <th className="py-2.5 min-w-[150px]">Student Name</th>
                  <th className="py-2.5 whitespace-nowrap min-w-[120px]">Roll No</th>
                  <th className="py-2.5">Course</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">No payment receipts registered yet.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 pl-4 font-bold text-slate-800">{t.receiptNo}</td>
                      <td className="py-3 text-slate-600">{t.date}</td>
                      <td className="py-3 font-bold text-slate-900">{t.studentName}</td>
                      <td className="py-3 text-slate-500 whitespace-nowrap min-w-[120px]">{t.studentRollNumber}</td>
                      <td className="py-3 text-slate-600">{t.courseName}</td>
                      <td className="py-3 font-extrabold text-emerald-600">₹{t.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3">{t.paymentMethod}</td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTxn(t)}
                            className="px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Print Slip
                          </button>
                          <button
                            onClick={() => setDeleteConfirmTxn(t)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="Delete Fee Record & Revert Balance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── MODAL: FEE CONFIGURATION (START DATE & DISCOUNTS) ─── */}
      {isConfigOpen && configStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">Fee Configuration</span>
                <h3 className="text-base font-extrabold text-slate-900">Configure Fees for {configStudent.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Roll: {configStudent.rollNumber} • {configStudent.courseName}</p>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Fee Start Date Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Fee Collection Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={configForm.feeStartDate}
                  onChange={(e) => setConfigForm({ ...configForm, feeStartDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <span className="text-[11px] text-slate-400">
                  Dues will ONLY be calculated starting from this month onward.
                </span>
              </div>

              {/* Fee Type & Base Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Fee Model</label>
                  <select
                    value={configForm.feeType}
                    onChange={(e) => setConfigForm({ ...configForm, feeType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="monthly">Monthly Fee</option>
                    <option value="fixed">Fixed Course Fee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">Base Rate (₹)</label>
                  <input
                    type="number"
                    value={configForm.amount}
                    onChange={(e) => setConfigForm({ ...configForm, amount: e.target.value })}
                    placeholder="Course Default"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Monthly Discount */}
              <div className="grid grid-cols-2 gap-3 bg-primary-50/40 p-3.5 rounded-xl border border-primary-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary-900 block">Monthly Discount</label>
                  <select
                    value={configForm.discountType}
                    onChange={(e) => setConfigForm({ ...configForm, discountType: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-primary-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="none">No Discount</option>
                    <option value="flat">Flat ₹/mo Off</option>
                    <option value="percentage">% Percentage Off</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary-900 block">Discount Value</label>
                  <input
                    type="number"
                    disabled={configForm.discountType === 'none'}
                    value={configForm.discountValue}
                    onChange={(e) => setConfigForm({ ...configForm, discountValue: e.target.value })}
                    placeholder={configForm.discountType === 'flat' ? 'e.g. 100' : 'e.g. 20'}
                    className="w-full px-3 py-1.5 bg-white border border-primary-200 rounded-lg text-xs font-bold disabled:opacity-50"
                  />
                </div>

                {configForm.discountType !== 'none' && configForm.discountValue && (
                  <div className="col-span-2 pt-1 text-xs font-bold text-primary-700">
                    Net Monthly Fee: ₹{Math.max(0, (Number(configForm.amount) || configStudent.baseFee || 0) - (configForm.discountType === 'flat' ? Number(configForm.discountValue) : Math.round(((Number(configForm.amount) || configStudent.baseFee || 0) * Number(configForm.discountValue)) / 100)))} / Month
                  </div>
                )}
              </div>

              {/* Past Settled Through (For Offline Transition) */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Offline Records Cleared Up To Month
                </label>
                <input
                  type="month"
                  value={configForm.pastSettledThrough}
                  onChange={(e) => setConfigForm({ ...configForm, pastSettledThrough: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <span className="text-[11px] text-slate-400">
                  Select month to mark all previous historical months as settled offline without creating individual transactions.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm"
                >
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: OFFICIAL PRINTABLE RECEIPT SLIP ─── */}
      {selectedTxn && (() => {
        const dateTime = getTransactionDateTime(selectedTxn);
        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:pl-[var(--sidebar-width)] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800 print-receipt-overlay">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] relative border-t-[6px] border-primary-700 scrollbar-hide font-sans">
              {/* Header Ribbon */}
              <div className="absolute top-0 right-10 bg-primary-700 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-b-lg no-print select-none">
                FEE RECEIPT
              </div>

              <div id="print-receipt-modal" className="p-6 space-y-4 relative bg-white">
                {/* Background Paid Stamp Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.09] print:opacity-[0.11] z-10">
                  <img src={paidStampImg} alt="Paid Stamp" className="w-72 h-72 object-contain rotate-[-15deg]" />
                </div>

                {/* PAID Stamp Badge */}
                <div className="absolute right-8 top-12 flex items-center gap-1.5 border border-emerald-500 text-emerald-600 bg-emerald-50/50 rounded-lg px-3 py-1 text-[10px] font-bold tracking-wider uppercase rotate-[-12deg] select-none shrink-0 print:opacity-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PAID</span>
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedTxn(null)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all no-print"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Receipt Header (Logo + Institute details) */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3.5 w-full">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-full flex items-center justify-center p-0.5 shadow-sm shrink-0">
                      <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                        Nextgen computer training institute
                      </h3>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                        Empowering Minds, Shaping Futures
                      </p>
                      <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-primary-600 shrink-0" />
                          <span>Near Shri Jaylal Vidya Mandir, Muskara</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Phone className="w-2 h-2 text-primary-600 shrink-0" />
                            <span>+91 9140737374</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center gap-1">
                            <Mail className="w-2 h-2 text-primary-600 shrink-0" />
                            <span>nextgencomputermuskara@gmail.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice Meta details */}
                <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-2.5 text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No.</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{selectedTxn.receiptNo}</span>
                  </div>
                  <div className="border-l border-slate-100 pl-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{dateTime.date}</span>
                  </div>
                  <div className="border-l border-slate-100 pl-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Receipt Time</span>
                    <span className="font-bold text-slate-700 mt-0.5 block">{dateTime.time}</span>
                  </div>
                </div>

                {/* Student Enrollment Details */}
                <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.studentName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment Roll No</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.studentRollNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Course</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.courseName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment Mode</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedTxn.paymentMethod}</span>
                  </div>
                </div>

                {/* Table of Particulars */}
                <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                        <th className="p-2.5 pl-4 w-14">S. No.</th>
                        <th className="p-2.5">DESCRIPTION</th>
                        <th className="p-2.5 pr-4 text-right w-32">AMOUNT (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-xs">
                      {selectedTxn.monthsPaid?.length > 0 ? (
                        selectedTxn.monthsPaid.map((m, idx) => (
                          <tr key={m} className="hover:bg-slate-50/50">
                            <td className="p-2.5 pl-4 text-slate-400">{idx + 1}</td>
                            <td className="p-2.5">Installment Fee — {formatMonth(m)}</td>
                            <td className="p-2.5 pr-4 text-right font-bold">
                              {(selectedTxn.amount / selectedTxn.monthsPaid.length).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-2.5 pl-4 text-slate-400">1</td>
                          <td className="p-2.5">Course Payment — Fee Collection</td>
                          <td className="p-2.5 pr-4 text-right font-bold">
                            {Number(selectedTxn.amount).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-xs">
                        <td colSpan={2} className="p-2.5 pl-4 text-right">TOTAL AMOUNT PAID:</td>
                        <td className="p-2.5 pr-4 text-right font-extrabold text-sm text-emerald-600">
                          ₹{Number(selectedTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Amount in Words */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Amount in Words</span>
                  <span className="font-semibold text-slate-800 italic mt-0.5 block">{convertNumberToWords(selectedTxn.amount)}</span>
                </div>

                {/* Signatures & Footer */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px] text-slate-500">
                  <div>
                    <p className="font-semibold italic">This is an officially recorded digital receipt.</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Nextgen Computer Training Institute</p>
                  </div>
                  <div className="text-right">
                    <div className="w-28 border-b border-slate-400 mb-1"></div>
                    <span className="font-bold text-slate-700">Authorized Signatory</span>
                  </div>
                </div>

                {/* Action Buttons (Hidden during Print) */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 no-print">
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
      {/* ─── MODAL: DELETE FEE TRANSACTION CONFIRMATION ─── */}
      {deleteConfirmTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-rose-100 w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Delete Fee Record?
                </h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete this payment receipt? This action will automatically revert the student's fee balance.
                </p>
              </div>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Receipt No:</span>
                <strong className="font-mono font-bold text-slate-900">#{deleteConfirmTxn.receiptNo || deleteConfirmTxn.id}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Student:</span>
                <strong className="font-bold text-slate-900">{deleteConfirmTxn.studentName || selectedStudent360?.name || 'N/A'}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Amount to Revert:</span>
                <strong className="font-extrabold text-rose-600 text-sm">₹{Number(deleteConfirmTxn.amount || 0).toLocaleString('en-IN')}</strong>
              </div>
              {deleteConfirmTxn.date && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Payment Date:</span>
                  <span className="font-medium text-slate-700">{deleteConfirmTxn.date}</span>
                </div>
              )}
              {deleteConfirmTxn.monthsPaid && deleteConfirmTxn.monthsPaid.length > 0 && (
                <div className="flex justify-between items-center text-slate-600">
                  <span>Settled Months:</span>
                  <span className="font-medium text-slate-700">{deleteConfirmTxn.monthsPaid.map(formatMonth).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-[11px] text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> Reverting this record will deduct <strong>₹{Number(deleteConfirmTxn.amount || 0).toLocaleString('en-IN')}</strong> from student's paid records and restore the dues in their ledger.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTxn(null)}
                disabled={deletingTxn}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTransaction}
                disabled={deletingTxn}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deletingTxn ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Reverting & Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
