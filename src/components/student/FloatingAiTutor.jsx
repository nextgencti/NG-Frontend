import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Mic, MicOff, Volume2, VolumeX, Trash2, X, MessageSquare, Minimize2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import sanjuAvatar from '../../assets/AI_Tutor_sunju.png';

// Lightweight Markdown & Table Parser
const renderMarkdown = (text, isUser = false) => {
  if (!text) return null;

  const parseInlineStyles = (txt) => {
    const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
    const splitParts = txt.split(regex);
    
    return splitParts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className={`font-extrabold ${isUser ? 'text-white' : 'text-slate-950'}`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className={`italic ${isUser ? 'text-white/90' : 'text-slate-800'}`}>
            {part.slice(1, -1)}
          </em>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderTable = (rows) => {
    if (rows.length === 0) return null;
    const headers = rows[0];
    const bodyRows = rows.slice(1);

    return (
      <div className="overflow-x-auto my-2 border border-slate-200 rounded-lg shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-[10px]">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-2 py-1 text-left font-black text-slate-700 uppercase tracking-wider">
                  {parseInlineStyles(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-2 py-1 text-slate-600 font-medium">
                    {parseInlineStyles(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let isInsideList = false;
  let currentTable = [];
  let isInsideTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|')) {
      if (isInsideList) {
        elements.push(
          <ul key={`ul-${i}`} className={`list-disc pl-4 my-1.5 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
            {currentList}
          </ul>
        );
        currentList = [];
        isInsideList = false;
      }
      isInsideTable = true;
      if (!line.includes('---')) {
        const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        currentTable.push(cells);
      }
      continue;
    } else if (isInsideTable) {
      elements.push(renderTable(currentTable));
      currentTable = [];
      isInsideTable = false;
    }

    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('***') || (line.startsWith('*') && !line.startsWith('**'))) {
      isInsideList = true;
      let content = line;
      if (line.startsWith('* ')) content = line.slice(2);
      else if (line.startsWith('- ')) content = line.slice(2);
      else if (line.startsWith('***')) content = '**' + line.slice(3);
      else if (line.startsWith('*')) content = line.slice(1);

      currentList.push(
        <li key={`li-${i}`} className="text-[12px] ml-1">
          {parseInlineStyles(content)}
        </li>
      );
      continue;
    } else if (isInsideList) {
      elements.push(
        <ul key={`ul-${i}`} className={`list-disc pl-4 my-1.5 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
          {currentList}
        </ul>
      );
      currentList = [];
      isInsideList = false;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={i} className={`text-[12px] font-extrabold mt-2.5 mb-1 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(4))}
        </h5>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className={`text-[13px] font-black mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className={`text-[14px] font-black mt-3 mb-1.5 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(2))}
        </h3>
      );
    } 
    else if (line === '') {
      elements.push(<div key={`br-${i}`} className="h-1.5" />);
    } 
    else {
      elements.push(
        <p key={i} className={`text-[12px] leading-relaxed ${isUser ? 'text-white/95' : 'text-slate-700'}`}>
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  if (isInsideTable) {
    elements.push(renderTable(currentTable));
  }
  if (isInsideList) {
    elements.push(
      <ul key="ul-end" className={`list-disc pl-4 my-1.5 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1">{elements}</div>;
};

export default function FloatingAiTutor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const activeAudioRef = useRef(null);

  // Sync messages from localStorage on mount and when isOpen changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanju_chat_history');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const defaultMsg = [
          {
            role: 'model',
            text: 'नमस्ते! मैं हूँ आपका AI ट्यूटर Sanju। 🎓\nमैं आपके कोर्सेज और कंप्यूटर साइंस से जुड़े डाउट्स को क्लियर कर सकता हूँ। मुझसे कोई भी सवाल पूछें!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
        setMessages(defaultMsg);
        localStorage.setItem('sanju_chat_history', JSON.stringify(defaultMsg));
      }
    } catch (e) {}
  }, [isOpen]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      localStorage.setItem('sanju_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Force pre-initialize voices on mount
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
    return () => {
      window.speechSynthesis?.cancel();
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech
  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    
    let selectedVoice = null;
    const hiVoices = voices.filter(v => v.lang.startsWith('hi'));
    const enINVoices = voices.filter(v => v.lang.startsWith('en-IN') || v.lang.includes('India'));

    selectedVoice = hiVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'));
    if (!selectedVoice) {
      selectedVoice = hiVoices.find(v => v.name.includes('Google') || v.name.includes('Local'));
    }
    if (!selectedVoice && hiVoices.length > 0) {
      selectedVoice = hiVoices[0];
    }
    if (!selectedVoice) {
      selectedVoice = enINVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'));
    }
    if (!selectedVoice && enINVoices.length > 0) {
      selectedVoice = enINVoices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    setInput('');
    const userMessage = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await api.post('/student/ask-sanju', {
        message: messageText,
        history
      });

      if (response.data.success) {
        const modelReply = response.data.reply;
        const modelMessage = {
          role: 'model',
          text: modelReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, modelMessage]);
        
        setTimeout(() => {
          speakText(modelReply);
        }, 100);
      } else {
        toast.error('Failed to get answer. Please try again.');
      }
    } catch (error) {
      console.error('Error asking AI Tutor:', error);
      toast.error('AI Tutor connection error.');
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (window.confirm('क्या आप बातचीत का इतिहास साफ़ करना चाहते हैं?')) {
      const defaultMsg = [
        {
          role: 'model',
          text: 'नमस्ते! बातचीत रीसेट कर दी गई है। मैं हूँ आपका AI ट्यूटर Sanju। 🎓\nआप मुझसे अपना अगला सवाल पूछ सकते हैं!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(defaultMsg);
      localStorage.setItem('sanju_chat_history', JSON.stringify(defaultMsg));
    }
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-[9999] flex flex-col items-end print:hidden">
      {/* Popover Chat Box */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[500px] md:w-[550px] lg:w-[600px] h-[75vh] md:h-[680px] max-h-[calc(100vh-180px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={sanjuAvatar} 
                  alt="Sanju Avatar" 
                  className="w-9 h-9 rounded-full object-cover border border-white/20 bg-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h4 className="text-[13px] font-extrabold tracking-wide">Sanju</h4>
                <p className="text-[9px] text-indigo-100 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  AI Tutor Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (nextMuted) {
                    window.speechSynthesis?.cancel();
                  }
                }}
                className={`p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer ${isMuted ? 'text-red-350' : 'text-white'}`}
                title={isMuted ? 'Unmute voice' : 'Mute voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={clearChat}
                className="p-1.5 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/90 hover:text-white rounded-lg hover:bg-white/10 transition-all cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {msg.role !== 'user' && (
                  <img 
                    src={sanjuAvatar} 
                    alt="Sanju Mascot" 
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-white"
                  />
                )}
                <div>
                  <div className={`p-3 rounded-2xl text-[12px] leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/60 rounded-tl-none font-normal'
                  }`}>
                    {renderMarkdown(msg.text, msg.role === 'user')}
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-400/90 mt-1 block px-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-2 max-w-[85%] mr-auto animate-pulse">
                <img 
                  src={sanjuAvatar} 
                  alt="Sanju Mascot" 
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 bg-white"
                />
                <div className="bg-white border border-slate-200/65 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-350 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                isListening 
                  ? 'bg-rose-50 border-rose-100 text-rose-500 animate-pulse' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
              title={isListening ? 'Stop listening' : 'Start speech typing'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sanju से कोई भी डाउट पूछें..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 text-[12px] px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white text-slate-800 disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button (Avatar Circle) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 p-0.5 shadow-2xl hover:scale-105 active:scale-95 hover:shadow-indigo-500/25 transition-all duration-300 relative group cursor-pointer"
      >
        <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center relative">
          <img 
            src={sanjuAvatar} 
            alt="Sanju AI Avatar Button" 
            className="w-full h-full object-cover rounded-full"
          />
          {/* Subtle Hover Glow Effect */}
          <div className="absolute inset-0 bg-indigo-600/5 group-hover:bg-transparent transition-all"></div>
        </div>
        
        {/* Glow pulsing ring around the button */}
        <span className="absolute -inset-1 rounded-full bg-indigo-500/30 -z-10 animate-ping opacity-75"></span>
        
        {/* Small tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900/90 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-lg shadow-lg border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none duration-300">
          Ask Sanju
        </div>
      </button>
    </div>
  );
}
