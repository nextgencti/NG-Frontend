import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, RefreshCw, Copy, CheckCircle, BarChart3 } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';

export default function WordCounter() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleClear = () => {
    setText('');
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Failed to copy
    }
  };

  // Analytics helper functions
  const getCharacterCount = () => text.length;
  const getCharacterCountNoSpaces = () => text.replace(/\s/g, '').length;
  
  const getWordCount = () => {
    const trimmed = text.trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  };

  const getSentenceCount = () => {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    // Split by sentence terminators (. ! ?)
    const sentences = trimmed.split(/[.!?]+\s*/).filter(Boolean);
    return sentences.length;
  };

  const getParagraphCount = () => {
    const trimmed = text.trim();
    if (trimmed === '') return 0;
    // Split by double line breaks / newline sequences
    const paragraphs = trimmed.split(/\n+/).filter(Boolean);
    return paragraphs.length;
  };

  const getReadingTime = () => {
    const words = getWordCount();
    // Average reading speed is 200 WPM
    const time = Math.ceil(words / 200);
    return time === 1 ? '1 min' : `${time} mins`;
  };

  const getSpeakingTime = () => {
    const words = getWordCount();
    // Average speaking speed is 130 WPM
    const time = Math.ceil(words / 130);
    return time === 1 ? '1 min' : `${time} mins`;
  };

  const getKeywordDensity = () => {
    if (!text.trim()) return [];
    
    // Convert to lowercase, split by words, filter out common stop words
    const words = text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2); // only words with length > 2

    const stopWords = new Set([
      'the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'for', 'it', 'on', 'with', 
      'as', 'this', 'are', 'was', 'by', 'an', 'be', 'at', 'or', 'from', 'but', 'not',
      'your', 'you', 'our', 'we', 'they', 'them', 'their'
    ]);

    const filteredWords = words.filter(w => !stopWords.has(w));
    
    const wordCounts = {};
    filteredWords.forEach(w => {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // top 5 keywords
  };

  const keywords = getKeywordDensity();

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
          <button onClick={() => navigate('/tools')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> All Tools
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-36 pb-24 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-5">
            <FileText className="w-4 h-4" />
            <span>Text Analyzer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Word & Character <span className="text-indigo-400">Counter</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Analyze your essays, articles, and text in real-time. Count words, characters, sentences, paragraphs, reading speed, and keyword density.
          </p>
        </div>

        {/* Counter Stats Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#151230]/50 border border-indigo-500/15 rounded-2xl p-5 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Words</h4>
            <p className="text-3xl font-black text-white">{getWordCount()}</p>
          </div>
          <div className="bg-[#151230]/50 border border-indigo-500/15 rounded-2xl p-5 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500/20 group-hover:bg-purple-500 transition-colors" />
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Characters</h4>
            <p className="text-3xl font-black text-white">{getCharacterCount()}</p>
          </div>
          <div className="bg-[#151230]/50 border border-indigo-500/15 rounded-2xl p-5 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-pink-500/20 group-hover:bg-pink-500 transition-colors" />
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Sentences</h4>
            <p className="text-3xl font-black text-white">{getSentenceCount()}</p>
          </div>
          <div className="bg-[#151230]/50 border border-indigo-500/15 rounded-2xl p-5 text-left relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Paragraphs</h4>
            <p className="text-3xl font-black text-white">{getParagraphCount()}</p>
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Input Area */}
          <div className="lg:col-span-2 bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 relative shadow-2xl overflow-hidden group text-left">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />

            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Live Editor
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-xl text-slate-300 hover:text-white transition-colors border border-white/5 cursor-pointer flex items-center gap-2 text-xs font-bold"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={handleClear}
                  disabled={!text}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-xl text-indigo-300 hover:text-indigo-200 transition-colors border border-white/5 cursor-pointer flex items-center gap-2 text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text or start writing here..."
              className="w-full h-80 bg-slate-950/40 hover:bg-slate-950/60 focus:bg-slate-950/80 border border-indigo-950/80 focus:border-indigo-500/50 text-white rounded-2xl p-5 text-sm sm:text-base font-medium transition-all duration-300 outline-none resize-none placeholder-slate-600 leading-relaxed font-sans"
              autoFocus
            />
          </div>

          {/* Right Sidebar: Analytical Panels */}
          <div className="space-y-6">
            
            {/* Panel 1: Readability & Estimates */}
            <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 relative shadow-2xl text-left overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-indigo-950" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Readability Estimates
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400">Reading Time</span>
                  <span className="text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{getReadingTime()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold border-t border-indigo-950/30 pt-3">
                  <span className="text-slate-400">Speaking Time</span>
                  <span className="text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">{getSpeakingTime()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold border-t border-indigo-950/30 pt-3">
                  <span className="text-slate-400">Characters (no spaces)</span>
                  <span className="text-slate-200">{getCharacterCountNoSpaces()}</span>
                </div>
              </div>
            </div>

            {/* Panel 2: Keyword Density */}
            <div className="bg-[#151230]/70 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 relative shadow-2xl text-left overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-indigo-950" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-pink-400" />
                Keyword Density
              </h4>

              {keywords.length === 0 ? (
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed py-4 text-center">Type something to see keyword density</p>
              ) : (
                <div className="space-y-3">
                  {keywords.map(([word, count], idx) => {
                    const totalWords = getWordCount();
                    const percentage = totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-200 font-mono text-[11px]">{word}</span>
                          <span className="text-slate-400 text-[10px]">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950/60 rounded-full overflow-hidden border border-indigo-950/50">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: `${Math.min(percentage * 5, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
