import React, { useState, useRef, useEffect } from 'react';
import { User, Phone, Mail, Globe, Youtube, MapPin, ShieldCheck, Printer, Sun, Moon, Instagram, Facebook } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Logo from '../Logo';
import api from '../../lib/axios';

export default function IDCard({ student, onClose }) {
  const [theme, setTheme] = useState('light');
  const [courseName, setCourseName] = useState(student?.course || 'Loading...');
  const cardRef = useRef();

  useEffect(() => {
    const fetchCourseName = async () => {
      if (student?.courseId && student.courseId !== 'Unassigned') {
        try {
          const res = await api.get('/admin/courses');
          const course = res.data.courses.find(c => c.id === student.courseId);
          if (course) setCourseName(course.name);
          else setCourseName(student.courseId);
        } catch (error) {
          console.error('Failed to fetch coarse name:', error);
          setCourseName(student.courseId);
        }
      } else {
        setCourseName(student?.course || 'No Course');
      }
    };
    fetchCourseName();
  }, [student]);

  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0 print:block overflow-y-auto">
      <div className="flex flex-col items-center gap-6 print:hidden py-10">
         {/* Theme Toggle & Controls */}
         <div className="flex gap-4 w-full max-w-[400px]">
            <button 
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="flex-1 py-3 px-4 glass-dark border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white font-bold text-xs uppercase tracking-widest transition-all hover:bg-white/10"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              {isDark ? 'Light' : 'Dark'} Mode
            </button>
         </div>

         {/* ID Card Display */}
         <div 
          ref={cardRef}
          className={`w-[350px] h-[650px] rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col items-center transition-colors duration-500 ${isDark ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900 shadow-slate-200'} border-2 ${isDark ? 'border-white/10' : 'border-slate-300'}`}
          id="identity-card"
         >
            {/* Wavy Header Background */}
            <div className="absolute top-0 left-0 w-full h-40 bg-[#1e3a8a] overflow-hidden">
               <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path d="M0.00,49.98 C149.99,150.00 349.89,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: isDark ? '#0f172a' : '#ffffff' }}></path>
               </svg>
               <div className="absolute top-4 left-0 w-full px-6 flex items-center gap-4">
                    <Logo className="w-12 h-12" variant="white" />
                  <div>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase leading-none">NEXTGEN</h2>
                    <p className="text-[8px] font-bold text-blue-200 uppercase tracking-tighter">Computer Training Institute Muskara</p>
                  </div>
               </div>
            </div>

            {/* Photo Section */}
            <div className="mt-24 relative z-10">
              <div className={`w-32 h-32 rounded-full border-4 ${isDark ? 'border-white/10' : 'border-white'} p-1 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden`}>
                {student.photoURL ? (
                  <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center rounded-full ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                    <User className="w-14 h-14" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Main Info */}
            <div className="w-full px-8 py-4 space-y-4 flex-1 flex flex-col relative z-10">
              <div className="space-y-4">
                 <div className="flex gap-3">
                    <span className="text-[9px] font-black text-blue-500 w-20 uppercase shrink-0">Student Name:</span>
                    <span className="text-[14px] font-black uppercase flex-1">{student.name}</span>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-[9px] font-black text-blue-500 w-20 uppercase shrink-0">Course:</span>
                    <span className="text-[14px] font-bold flex-1 leading-tight">{courseName}</span>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-[9px] font-black text-blue-500 w-20 uppercase shrink-0">Address:</span>
                    <span className="text-[12px] font-medium flex-1 line-clamp-2 leading-tight">{student.address || 'Muskara, Hamirpur'}</span>
                 </div>
                 <div className="flex gap-3">
                    <span className="text-[9px] font-black text-blue-500 w-20 uppercase shrink-0">Contact:</span>
                    <span className="text-[14px] font-bold flex-1">{student.phone || '941407373374'}</span>
                 </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1 mt-6">
                 <div className={`p-2 rounded-2xl ${isDark ? 'bg-white' : 'bg-slate-50 border border-slate-200'} shadow-lg`}>
                    <QRCodeSVG 
                      value={`Name: ${student.name}\nRoll: ${student.rollNumber}\nCourse: ${courseName}\nContact: ${student.phone}`}
                      size={80}
                      level="H"
                      includeMargin={false}
                    />
                 </div>
                 <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scan to Verify</p>
              </div>
            </div>

            {/* Footer with Wavy Bottom */}
            <div className="w-full mt-auto relative pt-8 pb-5 px-6 bg-[#111827] text-white">
               <svg className="absolute top-0 left-0 w-full h-8 rotate-180" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path d="M0.00,49.98 C149.99,150.00 349.89,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ stroke: 'none', fill: isDark ? '#0f172a' : '#ffffff' }}></path>
               </svg>
               
               <div className="grid grid-cols-1 gap-y-2 relative z-10 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Phone className="w-2.5 h-2.5 text-blue-400" />
                     </div>
                     <span className="text-[7.5px] font-bold tracking-wider">91407373374</span>
                     <span className="mx-1 opacity-20">|</span>
                     <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center ml-auto">
                        <Mail className="w-2.5 h-2.5 text-blue-400" />
                     </div>
                     <span className="text-[7.5px] font-bold uppercase truncate">nextgencomputermsk12@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-md bg-blue-500/20 flex items-center justify-center">
                        <Globe className="w-2.5 h-2.5 text-blue-400" />
                     </div>
                     <span className="text-[7.5px] font-bold uppercase tracking-wider">www.nextgeninstitute.co.in</span>
                     <span className="mx-1 opacity-20">|</span>
                     <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center ml-auto">
                        <Youtube className="w-2.5 h-2.5 text-red-500" />
                     </div>
                     <span className="text-[7.5px] font-bold uppercase">NextGen Institute</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Actions */}
         <div className="flex gap-4 w-full max-w-[350px]">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all shadow-xl active:scale-95"
            >
              Close
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 py-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
         </div>
      </div>

      {/* Actual Print Version */}
      <div className="hidden print:block font-sans">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            * { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { background: white !important; margin: 0; padding: 0; }
            .p-card-container, .p-card-container * { visibility: visible; }
            .p-card-container {
               position: absolute;
               left: 0;
               top: 0;
               width: 210mm;
               height: 297mm;
               display: flex;
               justify-content: center;
               align-items: flex-start;
               padding-top: 20mm;
               background: white !important;
            }
            @page { margin: 0; size: portrait; }
            .p-card {
               width: 350px;
               height: 650px;
               background-color: ${isDark ? '#0f172a' : '#ffffff'} !important;
               color: ${isDark ? 'white' : '#0f172a'} !important;
               display: flex;
               flex-direction: column;
               align-items: center;
               position: relative;
               overflow: hidden;
               border: 2px solid ${isDark ? '#1e293b' : '#cbd5e1'} !important;
               border-radius: 40px;
               -webkit-print-color-adjust: exact;
            }
            .p-header-bg { background-color: #1e3a8a !important; height: 160px; width: 100%; position: absolute; top: 0; left: 0; }
            .p-footer-bg { background-color: #111827 !important; color: white !important; margin-top: auto; width: 100%; padding: 15px 20px; position: relative; }
            .p-wavy-top { position: absolute; bottom: 0; left: 0; width: 100%; height: 60px; fill: ${isDark ? '#0f172a' : '#ffffff'} !important; }
            .p-wavy-bottom { position: absolute; top: 0; left: 0; width: 100%; height: 30px; transform: rotate(180deg); fill: ${isDark ? '#0f172a' : '#ffffff'} !important; }
          }
        `}} />
        <div className="p-card-container">
          <div className="p-card">
            {/* Header */}
            <div className="p-header-bg">
               <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ paddingRight: '10px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                    <Logo style={{ width: '40px', height: '40px' }} variant="white" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontWeight: '900', fontSize: '18px', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>NEXTGEN</h2>
                    <p style={{ color: '#bfdbfe', fontSize: '7px', margin: 0, fontWeight: '700', textTransform: 'uppercase' }}>COMPUTER TRAINING INSTITUTE MUSKARA</p>
                  </div>
               </div>
               <svg className="p-wavy-top" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path d="M0.00,49.98 C149.99,150.00 349.89,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
               </svg>
            </div>
            
            {/* Content */}
            <div style={{ marginTop: '120px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `4px solid ${isDark ? '#3b82f6' : '#1e3a8a'}`, overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  {student.photoURL ? (
                    <img src={student.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                      <User size={60} />
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '0 35px', width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <p style={{ color: '#3b82f6', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Student Name</p>
                      <p style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', color: isDark ? 'white' : '#1e3a8a', margin: 0 }}>{student.name}</p>
                    </div>
                    <div>
                      <p style={{ color: '#3b82f6', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Course</p>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: isDark ? 'white' : '#334155', margin: 0 }}>{courseName}</p>
                    </div>
                    <div>
                      <p style={{ color: '#3b82f6', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Contact</p>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: isDark ? 'white' : '#334155', margin: 0 }}>{student.phone}</p>
                    </div>
                </div>

                <div style={{ marginTop: '25px', padding: '12px', backgroundColor: 'white', borderRadius: '15px', border: '1px solid #e2e8f0', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                   <QRCodeSVG value={`Name: ${student.name}\nRoll: ${student.rollNumber}\nCourse: ${courseName}\nContact: ${student.phone}`} size={80} />
                </div>
                <p style={{ fontSize: '7px', fontWeight: '900', marginTop: '8px', color: '#94a3b8', letterSpacing: '1.5px' }}>SCAN TO VERIFY</p>
            </div>

            {/* Footer */}
            <div className="p-footer-bg">
               <svg className="p-wavy-bottom" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path d="M0.00,49.98 C149.99,150.00 349.89,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
               </svg>
               <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: '800', color: 'white' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📞 91407373374</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>✉️ NEXTGENCOMPUTERMSK12@GMAIL.COM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontWeight: '800', color: 'white' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🌐 WWW.NEXTGENINSTITUTE.CO.IN</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📺 NEXTGEN INSTITUTE</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
