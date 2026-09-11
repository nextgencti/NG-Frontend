import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomeModal({ isOpen, onClose, data }) {
  const navigate = useNavigate();

  if (!isOpen || !data || !data.imageUrl) return null;

  const handleLinkClick = () => {
    if (!data.link) return;
    onClose();
    if (data.link.startsWith('http://') || data.link.startsWith('https://')) {
      window.open(data.link, '_blank', 'noopener,noreferrer');
    } else {
      navigate(data.link);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-lg sm:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100/20 z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 z-30 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Optional Title Bar (if title provided) */}
          {data.title && (
            <div className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h3 className="text-sm sm:text-base font-bold tracking-wide truncate">
                {data.title}
              </h3>
            </div>
          )}

          {/* Image Content */}
          <div 
            className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${
              data.link ? 'cursor-pointer group' : ''
            }`}
            onClick={data.link ? handleLinkClick : undefined}
          >
            <img
              src={data.imageUrl}
              alt={data.title || "Welcome"}
              className="w-full h-auto max-h-[72vh] object-contain transition-transform duration-300 group-hover:scale-[1.015]"
              loading="eager"
            />

            {/* Hover overlay hint if clickable */}
            {data.link && (
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="px-4 py-2 bg-white/95 text-slate-900 rounded-full font-bold text-xs shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  Click to explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5"
            >
              Skip / Close
            </button>

            {data.link ? (
              <button
                type="button"
                onClick={handleLinkClick}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all"
              >
                Continue to Site
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
