import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Info, Calendar, Zap } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function AgeCalculator() {
  const navigate = useNavigate();
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [ageResult, setAgeResult] = useState(null);

  const calculateAge = (birthDate, checkDate) => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const target = new Date(checkDate || new Date());
    if (birth > target) { setAgeResult({ error: 'Date of birth cannot be in the future!' }); return; }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(target.getFullYear(), target.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const diffDays = Math.ceil(Math.abs(target - birth) / (1000 * 60 * 60 * 24));
    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (target > nextBday) nextBday.setFullYear(target.getFullYear() + 1);
    const daysToNextBday = Math.ceil((nextBday - target) / (1000 * 60 * 60 * 24));

    const totalWeeks = Math.floor(diffDays / 7);
    const totalHours = diffDays * 24;

    let eligibility = "Eligible for standard computer diploma courses";
    if (years >= 18 && years <= 30) eligibility = "Eligible for SSC CGL, Bank PO, and Railway Exams";
    else if (years >= 18 && years <= 40) eligibility = "Eligible for State PSC and UPSSSC Clerk Exams";
    else if (years < 18) eligibility = "Eligible for CCC, O-Level & Junior Computer Diplomas";
    else eligibility = "Eligible for Computer Instructor & Professional Skill Certifications";

    // Age limit checks for common exams
    const examChecks = [
      { name: "SSC CGL", minAge: 18, maxAge: 32 },
      { name: "SSC CHSL", minAge: 18, maxAge: 27 },
      { name: "Bank PO (IBPS)", minAge: 20, maxAge: 30 },
      { name: "Railway (RRB NTPC)", minAge: 18, maxAge: 33 },
      { name: "UPSSSC PET", minAge: 18, maxAge: 40 },
      { name: "UP Police Constable", minAge: 18, maxAge: 28 },
      { name: "UPSC CSE (IAS)", minAge: 21, maxAge: 32 },
      { name: "CCC Certification", minAge: 0, maxAge: 99 },
    ];
    const examResults = examChecks.map(exam => ({
      ...exam,
      eligible: years >= exam.minAge && years <= exam.maxAge
    }));

    setAgeResult({ years, months, days, totalDays: diffDays, totalWeeks, totalHours, daysToNextBday, eligibility, examResults });
  };

  useEffect(() => { if (dob) calculateAge(dob, targetDate); }, [dob, targetDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C20] via-[#13102B] to-[#0F0C20] overflow-hidden relative selection:bg-indigo-500/20">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 to-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0"><Logo className="w-7.5 h-7.5" showText={false} /></div>
            <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center"><span className="text-white">Next</span><span className="text-indigo-400 ml-0.5">Gen</span></h2>
          </div>
          <button onClick={() => navigate('/tools')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> All Tools
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-36 pb-24 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Calculator className="w-4 h-4" />
            <span>Sarkari Job Age Calculator</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Job Age <span className="text-indigo-400">Calculator</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Calculate your exact age and verify eligibility for competitive government exams like SSC, UPSC, Railway, and more.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-10 relative shadow-2xl overflow-hidden group text-left mb-8">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Enter Your Details</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Select your date of birth and target date</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Date of Birth (DOB)</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors" />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Age Calculation Date</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full bg-slate-950/50 border border-indigo-950 focus:border-indigo-500/50 text-white rounded-xl px-4 py-4 text-sm font-semibold outline-none transition-colors" />
            </div>
          </div>

          {ageResult ? (
            ageResult.error ? (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-sm font-bold text-center">{ageResult.error}</div>
            ) : (
              <div className="space-y-6">
                {/* Primary Age */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: ageResult.years, label: 'Years' },
                    { val: ageResult.months, label: 'Months' },
                    { val: ageResult.days, label: 'Days' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-950/40 border border-indigo-950 rounded-xl p-5 text-center">
                      <p className="text-4xl font-black text-indigo-400">{item.val}</p>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { val: ageResult.totalDays.toLocaleString(), label: 'Total Days' },
                    { val: ageResult.totalWeeks.toLocaleString(), label: 'Total Weeks' },
                    { val: ageResult.totalHours.toLocaleString(), label: 'Total Hours' },
                    { val: ageResult.daysToNextBday, label: 'Next Birthday' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-950/30 border border-indigo-950/40 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-200">{item.val}</p>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Eligibility */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">General Eligibility</p>
                    <p className="text-sm text-indigo-300 font-bold leading-normal">{ageResult.eligibility}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-slate-950/30 border border-indigo-950/50 text-slate-500 rounded-xl p-12 text-sm font-bold text-center flex flex-col items-center justify-center gap-3">
              <Calendar className="w-10 h-10 text-slate-600" />
              <span>Select your date of birth above to calculate your exact age and exam eligibility.</span>
            </div>
          )}
        </div>

        {/* Exam Eligibility Table */}
        {ageResult && !ageResult.error && ageResult.examResults && (
          <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-5">📋 Exam Age Eligibility Check</h4>
            <div className="space-y-2">
              {ageResult.examResults.map((exam, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-950/30 border border-indigo-950/40 rounded-xl px-5 py-3 text-xs font-bold">
                  <div className="col-span-5 text-slate-300">{exam.name}</div>
                  <div className="col-span-3 text-slate-500 text-center">{exam.minAge}-{exam.maxAge} yrs</div>
                  <div className="col-span-4 text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${exam.eligible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {exam.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-slate-600 font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />
              Age limits shown are for General category. SC/ST/OBC candidates may have additional relaxation.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
