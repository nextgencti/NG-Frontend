import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BookOpen, Clock, Check, Inbox, Sparkles, CheckSquare } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/student/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up polling interval to fetch notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Mark a single notification as read
  const handleMarkAsRead = async (notification) => {
    // If already read, just navigate
    if (notification.isRead) {
      setIsOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
      return;
    }

    try {
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );

      await api.put(`/student/notifications/${notification.id}/read`);
      
      setIsOpen(false);
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimism if error
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      // Optimistically mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      // Call mark-as-read API for all unread items
      const promises = unreadNotifications.map(n => 
        api.put(`/student/notifications/${n.id}/read`)
      );
      await Promise.all(promises);
      
      toast.success('All notifications marked as read', {
        style: {
          borderRadius: '16px',
          background: '#0F172A',
          color: '#FFF',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      fetchNotifications();
    }
  };

  // Simple relative time helper
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get matching icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return (
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
        );
      case 'lesson':
      case 'topic':
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            // Fetch fresh notifications when opening
            fetchNotifications();
          }
        }}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer ${
          isOpen
            ? 'bg-slate-100 border-slate-200 text-slate-800'
            : 'bg-white hover:bg-slate-50 border-[#E5E7EB] hover:border-slate-300 text-slate-500 hover:text-slate-800 shadow-sm'
        }`}
      >
        <Bell className={`w-4.5 h-4.5 transition-transform duration-500 ${isOpen ? 'rotate-12' : 'hover:animate-[bounce_0.8s_infinite]'}`} />
        
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-[#4F46E5] to-[#818CF8] text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-indigo-500/30 border border-white animate-in scale-in duration-300">
              {unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4F46E5] rounded-full -z-10 animate-ping opacity-60"></span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-none sm:w-96 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-[#4F46E5]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:text-indigo-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto max-h-[360px] scrollbar-hide">
            {notifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`p-4 flex gap-3.5 transition-all hover:bg-slate-50/80 cursor-pointer relative group ${
                      !notif.isRead ? 'bg-indigo-50/[0.15]' : ''
                    }`}
                  >
                    {/* Visual Indicator for Unread */}
                    {!notif.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#4F46E5] ring-4 ring-indigo-50/50"></span>
                    )}

                    {/* Icon */}
                    {getNotificationIcon(notif.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className={`text-xs uppercase tracking-tight text-slate-800 line-clamp-1 group-hover:text-[#4F46E5] transition-colors ${
                        !notif.isRead ? 'font-black' : 'font-semibold'
                      }`}>
                        {notif.title}
                      </h4>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed mt-1 mb-2 break-words">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{getRelativeTime(notif.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 animate-in zoom-in duration-300">
                  <Inbox className="w-7 h-7" />
                </div>
                <h5 className="text-[13px] font-black text-slate-800 uppercase tracking-wider mb-1">
                  You're all caught up
                </h5>
                <p className="text-slate-400 text-xs font-medium max-w-[200px]">
                  When new courses or lessons are added, they'll show up here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
