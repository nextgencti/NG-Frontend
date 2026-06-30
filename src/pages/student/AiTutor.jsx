import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Mic, MicOff, Volume2, VolumeX, Trash2, HelpCircle, ArrowRight, User, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import sanjuAvatar from '../../assets/AI_Tutor_sunju.png';

// Lightweight Markdown & Table Parser for Rich AI Responses
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
      <div className="overflow-x-auto my-3 border border-slate-200 rounded-xl shadow-sm bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-[12px]">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="px-4 py-2.5 text-left font-black text-slate-700 uppercase tracking-wider">
                  {parseInlineStyles(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2.5 text-slate-600 font-medium">
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

    // Table parsing check
    if (line.startsWith('|')) {
      if (isInsideList) {
        elements.push(
          <ul key={`ul-${i}`} className={`list-disc pl-5 my-2 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
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

    // List parsing check
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('***') || (line.startsWith('*') && !line.startsWith('**'))) {
      isInsideList = true;
      let content = line;
      if (line.startsWith('* ')) content = line.slice(2);
      else if (line.startsWith('- ')) content = line.slice(2);
      else if (line.startsWith('***')) content = '**' + line.slice(3);
      else if (line.startsWith('*')) content = line.slice(1);

      currentList.push(
        <li key={`li-${i}`} className="text-[13px] ml-1">
          {parseInlineStyles(content)}
        </li>
      );
      continue;
    } else if (isInsideList) {
      elements.push(
        <ul key={`ul-${i}`} className={`list-disc pl-5 my-2 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
          {currentList}
        </ul>
      );
      currentList = [];
      isInsideList = false;
    }

    // Header parsing check
    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={i} className={`text-[13px] font-extrabold mt-3 mb-1 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(4))}
        </h5>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h4 key={i} className={`text-[14px] font-black mt-4 mb-2 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h3 key={i} className={`text-[15px] font-black mt-4 mb-2 ${isUser ? 'text-white' : 'text-slate-950'}`}>
          {parseInlineStyles(line.slice(2))}
        </h3>
      );
    } 
    // Empty lines check
    else if (line === '') {
      elements.push(<div key={`br-${i}`} className="h-2" />);
    } 
    // Normal paragraphs
    else {
      elements.push(
        <p key={i} className={`text-[13px] leading-relaxed ${isUser ? 'text-white/95' : 'text-slate-700'}`}>
          {parseInlineStyles(line)}
        </p>
      );
    }
  }

  // Flush any remaining active parses at end of loop
  if (isInsideTable) {
    elements.push(renderTable(currentTable));
  }
  if (isInsideList) {
    elements.push(
      <ul key="ul-end" className={`list-disc pl-5 my-2 space-y-1 ${isUser ? 'text-white/90' : 'text-slate-700'}`}>
        {currentList}
      </ul>
    );
  }

  return <div className="space-y-1.5">{elements}</div>;
};

export default function AiTutor() {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('sanju_chat_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        role: 'model',
        text: 'नमस्ते! मैं हूँ आपका AI ट्यूटर Sanju। 🎓\nमैं कंप्यूटर साइंस, कोडिंग, ऑफिस और आपके कोर्सेज के डाउट्स क्लियर करने में आपकी मदद कर सकता हूँ।\n\nआप मुझसे कुछ भी पूछ सकते हैं या नीचे दिए गए सुझावों में से किसी एक पर क्लिक कर सकते हैं!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const activeAudioRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Cache chat history
    localStorage.setItem('sanju_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Clean up speech synthesis and audio playback on unmount
  useEffect(() => {
    if (window.speechSynthesis) {
      // Force loading of voices in Chrome/Edge
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
      recognition.lang = 'hi-IN'; // Set to Hindi/Hinglish
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast.error('Voice input error: ' + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech function with Natural Voice Selection
  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis) return;

    // Stop any ongoing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    // Clean text from Markdown tags for cleaner reading
    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Retrieve all available voices on the browser
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize natural/online voices for Hindi and Indian English:
    // 1. Edge Natural Hindi (e.g., Madhur Online, Hemant Online)
    // 2. Google Hindi (Google हिन्दी)
    // 3. Chrome/Default Hindi (hi-IN)
    // 4. Microsoft/Google Natural Indian English (en-IN)
    // 5. Default browser voice
    let selectedVoice = null;

    // Group voices
    const hiVoices = voices.filter(v => v.lang.startsWith('hi'));
    const enINVoices = voices.filter(v => v.lang.startsWith('en-IN') || v.lang.includes('India'));
    const genericEnVoices = voices.filter(v => v.lang.startsWith('en'));

    // Try Hindi Natural (Online) voices first (extremely natural, sounds like a human/Gemini)
    selectedVoice = hiVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'));
    
    // Try Google Hindi
    if (!selectedVoice) {
      selectedVoice = hiVoices.find(v => v.name.includes('Google') || v.name.includes('Local'));
    }
    
    // Try any Hindi voice
    if (!selectedVoice && hiVoices.length > 0) {
      selectedVoice = hiVoices[0];
    }
    
    // Try Indian English Natural
    if (!selectedVoice) {
      selectedVoice = enINVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'));
    }

    // Try Google Indian English
    if (!selectedVoice) {
      selectedVoice = enINVoices.find(v => v.name.includes('Google'));
    }

    // Try any Indian English
    if (!selectedVoice && enINVoices.length > 0) {
      selectedVoice = enINVoices[0];
    }

    // Try general English Natural
    if (!selectedVoice) {
      selectedVoice = genericEnVoices.find(v => v.name.includes('Natural') || v.name.includes('Online'));
    }

    // Apply selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Fix Chrome bug where speech randomly stops mid-utterance by holding a global reference
    speechUtteranceRef.current = utterance;
    
    window.speechSynthesis.speak(utterance);
  };

  // Native Gemini Voice Player
  const playGeminiAudio = (base64Audio) => {
    if (isMuted) return;

    // Stop any currently playing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    // Cancel browser TTS
    window.speechSynthesis?.cancel();

    try {
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      audio.play().catch(err => {
        console.warn('Audio playback failed (usually requires user interaction first):', err);
      });
    } catch (e) {
      console.error('Failed to play native Gemini audio:', e);
    }
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');
    
    // Mute any active voice playback while sending
    window.speechSynthesis?.cancel(); 
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    const userMessage = {
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Package recent messages as history for conversational memory
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
        const modelAudio = response.data.audio;
        const modelMessage = {
          role: 'model',
          text: modelReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prev => [...prev, modelMessage]);
        
        // Speak out response (prefer native Gemini audio, fallback to browser synthesis)
        setTimeout(() => {
          if (modelAudio) {
            playGeminiAudio(modelAudio);
          } else {
            speakText(modelReply);
          }
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
      toast.error('Speech recognition is not supported in your browser. Try Google Chrome.');
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

  const suggestionChips = [
    'HTML और CSS में क्या अंतर है?',
    'CSS Flexbox क्या होता है? उदाहरण दो',
    'Excel में VLOOKUP फॉर्मूला कैसे काम करता है?',
    'JavaScript में Arrays को परिभाषित कैसे करते हैं?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-240px)] lg:h-[calc(100vh-140px)] bg-slate-50/50 border border-slate-200/50 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
      {/* AI Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={sanjuAvatar} 
              alt="Sanju Avatar" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1">
              Sanju <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Tutor</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Online Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mute toggle */}
          <button 
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted) {
                window.speechSynthesis?.cancel();
                if (activeAudioRef.current) {
                  activeAudioRef.current.pause();
                }
              }
            }} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100/50' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {/* Clear history */}
          <button 
            onClick={clearChat} 
            className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Space Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Suggestion Sidebar (Left) */}
        <div className="hidden md:flex md:w-64 border-r border-slate-200/80 bg-white p-5 flex-col shrink-0">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            Suggested Questions
          </h4>
          <div className="space-y-2 flex-1 overflow-y-auto">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="w-full text-left p-3 text-[11px] font-semibold text-slate-600 bg-slate-50/50 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer flex justify-between items-start group"
              >
                <span className="leading-relaxed">{chip}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all mt-0.5 flex-shrink-0" />
              </button>
            ))}
          </div>
          <div className="mt-4 p-3.5 bg-slate-50/60 rounded-xl border border-slate-200/50 flex gap-2">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
              नोट: Sanju आपके कंप्यूटर कोर्स, कोडिंग, एक्सेल, इंटरनेट इत्यादि के सवालों का जवाब देगा।
            </p>
          </div>
        </div>

        {/* Chat Area (Right) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF9FF]/40">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] animate-in fade-in duration-200 ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 bg-slate-100 text-slate-600 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                ) : (
                  <img 
                    src={sanjuAvatar} 
                    alt="Sanju Mascot" 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                  />
                )}

                {/* Bubble */}
                <div>
                  <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10 font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm font-normal'
                  }`}>
                    {renderMarkdown(msg.text, msg.role === 'user')}
                  </div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-1 block px-1 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
                <img 
                  src={sanjuAvatar} 
                  alt="Sanju Mascot" 
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-white"
                />
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggestion Chips (Mobile only) */}
          <div className="md:hidden px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex gap-2 scrollbar-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100 rounded-full hover:bg-indigo-50 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Inputs */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 max-w-4xl mx-auto"
            >
              {/* Mic / voice dictation toggle */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/20 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice typing'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'बोलिए, मैं सुन रहा हूँ...' : 'Sanju से कंप्यूटर का कोई भी डाउट पूछें...'}
                className="flex-1 px-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-400"
                disabled={loading}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
