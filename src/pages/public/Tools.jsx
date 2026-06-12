import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Keyboard, Calculator, Zap, FileText, ArrowRight } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function Tools() {
  const navigate = useNavigate();

  const toolList = [
    {
      name: "Typing Speed Tester",
      description: "Test your typing speed in words per minute (WPM) and accuracy. Practice over multiple quotes to build typing speed for computer exams.",
      icon: Keyboard,
      link: "/tools/typing-test",
      badge: "Skill Builder",
      color: "from-indigo-600 to-indigo-800",
      iconColor: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
      btnStyle: "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25",
      features: ["Live WPM counter", "Accuracy check", "History tracking", "Speed guidelines"]
    },
    {
      name: "Job Age Calculator",
      description: "Calculate your exact age in years, months, and days for competitive government exams. Instantly check your eligibility for SSC, UPSC, and Police jobs.",
      icon: Calculator,
      link: "/tools/age-calculator",
      badge: "Exam Utility",
      color: "from-blue-600 to-cyan-600",
      iconColor: "text-blue-400 border-blue-500/20 bg-blue-500/10",
      btnStyle: "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25",
      features: ["Exact age breakdown", "Exam eligibility checker", "Standard cutoffs", "Category relaxations"]
    },
    {
      name: "Percentage Calculator",
      description: "Instantly calculate school test scores, total marks percentages, and grades. Perfect for students and teachers checking exam performance.",
      icon: Zap,
      link: "/tools/percentage-calculator",
      badge: "Fast Math",
      color: "from-pink-600 to-rose-600",
      iconColor: "text-pink-400 border-pink-500/20 bg-pink-500/10",
      btnStyle: "bg-pink-600 hover:bg-pink-500 hover:shadow-pink-500/25",
      features: ["Marks percentage converter", "Auto grade generator", "Flexible inputs", "Clean UI output"]
    },
    {
      name: "Word & Character Counter",
      description: "Analyze your essays, articles, and paragraphs in real-time. Live stats for word count, characters, sentences, reading time, and keyword density.",
      icon: FileText,
      link: "/tools/word-counter",
      badge: "Text Analytics",
      color: "from-emerald-600 to-teal-600",
      iconColor: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      btnStyle: "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/25",
      features: ["Live word & char counters", "Reading/speaking time", "Paragraph detector", "Keyword density check"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0C20] via-[#13102B] to-[#0F0C20] overflow-hidden relative selection:bg-indigo-500/20">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 to-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-pink-500/5 to-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl border border-white/10 flex items-center justify-center shrink-0">
              <Logo className="w-8 h-8" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Zap className="w-4 h-4 animate-bounce" />
            <span>Interactive Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Interactive Smart <span className="text-indigo-400">Tools</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Free smart tools and skill builders designed to help students, job seekers, and developers work smarter. Try them right in your browser.
          </p>
        </div>

        {/* Tools Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {toolList.map((tool, idx) => {
            const ToolIcon = tool.icon;
            return (
              <div 
                key={idx}
                className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-5 flex flex-col justify-between relative shadow-2xl overflow-hidden group hover:border-indigo-400/40 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Always visible base top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-950 z-20" />
                {/* Hover state gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

                <div>
                  {/* Top line with Icon and Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-9.5 h-9.5 rounded-lg flex items-center justify-center border shrink-0 ${tool.iconColor}`}>
                      <ToolIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[8px] font-bold uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors mb-2 truncate">
                    {tool.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] sm:text-xs font-medium leading-relaxed mb-4 line-clamp-4 min-h-[64px]">
                    {tool.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-1.5 mb-6">
                    {tool.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                        <div className="w-1 h-1 bg-indigo-500/50 rounded-full shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={() => navigate(tool.link)}
                  className={`w-full py-2.5 text-white rounded-xl font-bold text-[10px] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg active:scale-95 ${tool.btnStyle}`}
                >
                  Launch Tool <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
