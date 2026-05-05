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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Credentials</h2>
          <p className="text-slate-500 mt-1 text-sm">Verify and synchronize your earned course certifications.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-primary-200 hover:shadow-lg hover:shadow-primary-600/5 transition-all duration-300">
            
            <div className="h-40 relative overflow-hidden bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center text-center p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-indigo-50/50 z-0 group-hover:scale-105 transition-transform duration-500"></div>
              <Award className="w-12 h-12 text-primary-500 mb-3 relative z-10 transition-transform group-hover:scale-110" />
              <h3 className="text-lg font-bold text-slate-900 relative z-10 leading-tight px-2">{cert.title}</h3>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Date</span>
                <span className="font-bold text-slate-900">{cert.issueDate}</span>
              </div>
              <div className="flex justify-between items-center mb-6 text-sm">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">ID</span>
                <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-1 rounded-md">{cert.id}</span>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button className="flex items-center justify-center w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-all active:scale-95">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State / Lock Card */}
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 relative">
            <Award className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">More to Come</h3>
          <p className="text-slate-500 text-sm max-w-[200px]">Keep learning to unlock more credentials.</p>
        </div>
      </div>
    </div>
  );
}
