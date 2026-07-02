import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const OfflineIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-56 h-56 mx-auto drop-shadow-[0_8px_24px_rgba(99,102,241,0.25)] animate-in zoom-in-75 duration-500 relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer pulse rings */}
    <circle cx="100" cy="100" r="80" stroke="url(#pulse-grad)" strokeWidth="1.5" strokeDasharray="4 8" opacity="0.3" />
    <circle cx="100" cy="100" r="65" stroke="url(#pulse-grad)" strokeWidth="1" strokeDasharray="3 6" opacity="0.5" />
    
    {/* Center Glow */}
    <circle cx="100" cy="100" r="30" fill="url(#glow-grad)" opacity="0.45" />

    {/* Cloud body */}
    <path d="M70 120H130C138.284 120 145 113.284 145 105C145 96.7157 138.284 90 130 90C129.584 90 129.176 90.017 128.775 90.0503C126.793 78.4907 116.745 70 104.667 70C94.5029 70 85.7481 75.9221 82.0298 84.7077C79.8824 81.7699 76.381 80 72.5 80C65.5964 80 60 85.5964 60 92.5C60 93.3052 60.0763 94.0926 60.222 94.8569C54.3413 97.433 50.3333 103.248 50.3333 110C50.3333 115.523 54.8105 120 60.3333 120H70Z" 
          fill="url(#cloud-grad)" 
          stroke="url(#cloud-stroke)" 
          strokeWidth="2.5" 
          strokeLinejoin="round" 
    />

    {/* Danger Exclamation / Warning Inside Cloud */}
    <circle cx="100" cy="103" r="8" fill="url(#error-glow)" />
    
    {/* Wi-Fi Waves with Slash */}
    <circle cx="100" cy="140" r="4.5" fill="#EF4444" />
    
    {/* Wave 1 */}
    <path d="M89 129C95.0751 122.925 104.925 122.925 111 129" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    {/* Wave 2 */}
    <path d="M80 120C91.0457 108.954 108.954 108.954 120 120" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
    {/* Wave 3 */}
    <path d="M71 111C87.0163 94.9837 112.984 94.9837 129 111" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" opacity="0.2" />

    {/* Disconnect Slash */}
    <line x1="65" y1="65" x2="135" y2="135" stroke="url(#slash-grad)" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="65" y1="65" x2="135" y2="135" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

    <defs>
      <linearGradient id="pulse-grad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="50%" stopColor="#EC4899" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="glow-grad" x1="70" y1="70" x2="130" y2="130" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="cloud-grad" x1="50" y1="70" x2="145" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
      <linearGradient id="cloud-stroke" x1="50" y1="70" x2="145" y2="120" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="slash-grad" x1="65" y1="65" x2="135" y2="135" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
      <linearGradient id="error-glow" x1="92" y1="95" x2="108" y2="111" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#991B1B" />
      </linearGradient>
    </defs>
  </svg>
);

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
          <OfflineIllustration />
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
