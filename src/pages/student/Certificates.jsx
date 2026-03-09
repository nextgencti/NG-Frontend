import React from 'react';
import { Award, Download, ExternalLink } from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Digital Credentials</h2>
          <p className="text-slate-400 mt-2 font-medium">Verify and synchronize your earned course certifications.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((cert) => (
          <div key={cert.id} className="glass-dark border border-white/5 overflow-hidden group hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500">
            
            <div className="h-52 relative overflow-hidden bg-white/5 p-8 flex flex-col items-center justify-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-600/10 z-0 group-hover:scale-110 transition-transform duration-700"></div>
              <Award className="w-16 h-16 text-primary-400 mb-4 relative z-10 transition-transform group-hover:rotate-12" />
              <h3 className="text-xl font-black text-white relative z-10 leading-tight px-4 uppercase tracking-tight">{cert.title}</h3>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">VALIDATION DATE</span>
                <span className="font-bold text-white uppercase tracking-tight">{cert.issueDate}</span>
              </div>
              <div className="flex justify-between items-center mb-8 text-sm">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">CREDENTIAL ADDR</span>
                <span className="font-mono text-[10px] font-bold text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-lg">{cert.id}</span>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button className="flex items-center justify-center w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-2xl transition-all active:scale-95">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Lock Card */}
        <div className="glass-dark border border-white/5 flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-2xl animate-pulse"></div>
            <Award className="w-10 h-10 text-slate-700 relative" />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Ascension Awaits</h3>
          <p className="text-slate-500 text-sm font-medium mt-4 max-w-[220px] leading-relaxed">Persist in your learning sequences to unlock high-level credentials.</p>
        </div>
      </div>
    </div>
  );
}
