import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import offlineImg from '../../assets/offline_illustration.png';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const OfflineScreen = ({ onRetry }) => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetry = async () => {
    setIsChecking(true);
    // Mimic check duration for nice UX feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (navigator.onLine) {
      try {
        // Attempt to request public health-check endpoint
        const response = await api.get('/public/health-check');
        if (response.data && response.data.success) {
          toast.success("बधाई हो! आप वापस ऑनलाइन आ चुके हैं।");
          if (onRetry) onRetry();
        } else {
          toast.error("अभी भी ऑफ़लाइन हैं। कृपया कनेक्शन की जांच करें।");
        }
      } catch (err) {
        console.warn("Health check request failed:", err);
        toast.error("सर्वर से कनेक्ट नहीं हो पा रहा। कृपया इंटरनेट कनेक्शन की जांच करें।");
      }
    } else {
      toast.error("ऑफ़लाइन हैं! कृपया अपने वाई-फाई या मोबाइल डेटा को चालू करें।");
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070514] p-4 relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-dashboard-grid bg-repeat opacity-15 pointer-events-none"></div>

      <div className="relative z-10 max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-indigo-950/20 border border-indigo-900/30 backdrop-blur-xl shadow-2xl">
        {/* Connection status badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black text-rose-400 uppercase tracking-widest animate-bounce">
          <WifiOff className="w-3.5 h-3.5 animate-pulse" /> No Connection
        </div>

        {/* Offline Illustration */}
        <div className="relative group flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full blur-2xl opacity-15 scale-75 group-hover:scale-95 transition-all duration-700"></div>
          <img 
            src={offlineImg} 
            alt="Offline Illustration" 
            className="w-64 h-64 object-contain relative z-10 filter drop-shadow-[0_8px_24px_rgba(99,102,241,0.2)] animate-in zoom-in-75 duration-500" 
          />
        </div>

        {/* Info Text */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            इंटरनेट कनेक्शन गायब है!
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            ऐसा लगता है कि आपका डिवाइस इंटरनेट से डिस्कनेक्ट हो गया है। कृपया अपने वाई-फाई, मोबाइल डेटा या केबल की जांच करें।
          </p>
        </div>

        {/* Retry Button */}
        <div className="pt-2">
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 border border-indigo-500/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'कनेक्शन की जांच हो रही है...' : 'दोबारा प्रयास करें (Retry)'}
          </button>
        </div>

        <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-widest leading-normal">
          कनेक्शन बहाल होते ही हम आपको वापस मुख्य स्क्रीन पर रीडायरेक्ट कर देंगे।
        </p>
      </div>
    </div>
  );
};

export default OfflineScreen;
