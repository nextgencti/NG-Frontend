import React from 'react';
import { Award, Download, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
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

export default function Certificates() {
  const certificates = [
    {
      id: "CERT-2026-001",
      title: "UI/UX Design Fundamentals",
      issueDate: "January 15, 2026",
      image: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=800",
    }
  ];

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
              <Award className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.18em]">Earned Honors</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Credentials</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-lg">
            Verify and download your accredited institute certificates.
          </p>
        </div>
      </motion.div>

      {/* Grid List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <motion.div 
            key={cert.id} 
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.01 }}
            className="bg-white border border-slate-100 rounded-[28px] overflow-hidden group hover:shadow-[0_24px_48px_-12px_rgba(79,70,229,0.05)] transition-all duration-300 flex flex-col justify-between"
          >
            {/* Header Display Seal */}
            <div className="h-44 relative overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-center p-6 border-b border-slate-100">
              {/* Organic glowing background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-primary-500/10 to-transparent z-0 group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-dot-pattern opacity-[0.1] pointer-events-none"></div>

              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 relative z-10 shadow-lg backdrop-blur-md group-hover:rotate-6 transition-transform duration-300">
                <Award className="w-6.5 h-6.5 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]" />
              </div>
              
              <h3 className="text-base font-black text-white relative z-10 leading-snug px-3 uppercase tracking-wide">
                {cert.title}
              </h3>
            </div>

            {/* Meta details body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs pb-3.5 border-b border-slate-50">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Issued Date</span>
                <span className="font-black text-slate-800 uppercase">{cert.issueDate}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Credential ID</span>
                <span className="font-mono text-[9px] font-black text-primary-650 bg-primary-50 border border-primary-100/50 px-2.5 py-1 rounded-lg">
                  {cert.id}
                </span>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer">
                  <Download className="w-4 h-4 text-white/80" /> Download PDF
                </button>
                <button className="flex items-center justify-center w-11 h-11 bg-slate-50 hover:bg-slate-100 border border-slate-150/40 text-slate-500 hover:text-slate-700 rounded-xl transition-all active:scale-95 cursor-pointer">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Tactile Empty State Lock Card */}
        <motion.div 
          variants={cardVariants}
          className="bg-white border-2 border-slate-100 border-dashed rounded-[28px] flex flex-col items-center justify-center p-8 text-center min-h-[320px] hover:border-primary-200 transition-colors group"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 relative shadow-inner group-hover:scale-105 transition-transform duration-300">
            <Award className="w-6.5 h-6.5 text-slate-350" />
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">More credentials</h3>
          <p className="text-slate-450 text-[11px] max-w-[200px] leading-relaxed font-medium">Keep completing syllabus tests to unlock official diplomas.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
