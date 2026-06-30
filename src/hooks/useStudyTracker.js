import { useEffect, useRef } from 'react';
import api from '../lib/axios';

/**
 * useStudyTracker — tracks real time spent on a page.
 * 
 * HOW IT WORKS:
 * - Sends a heartbeat to the backend every 60 seconds while the tab is visible.
 * - Each heartbeat = 1 minute of study time stored in `student_activity`.
 * - Automatically pauses when the tab is hidden (alt-tabbed, minimized).
 * - Cleans up on unmount (page navigation).
 * 
 * @param {string} type - 'classroom' | 'test'
 * @param {string} referenceId - courseId or testId
 * @param {string} label - human-readable label like course name or test title
 * @param {boolean} active - set false to pause tracking (e.g., test finished)
 * @param {string} lessonId - optional ID of active lesson being studied
 */
export default function useStudyTracker(type, referenceId, label = '', active = true, lessonId = null) {
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!type || !referenceId || !active) return;

    const sendHeartbeat = async () => {
      // Only send if tab is visible
      if (!isVisibleRef.current) return;
      
      try {
        await api.post('/student/track-study', {
          type,
          referenceId,
          label,
          duration: 1, // 1 minute per heartbeat
          lessonId
        });
      } catch (err) {
        // Silently fail — don't disrupt the user's workflow
        console.warn('[StudyTracker] Heartbeat failed:', err.message);
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Send first heartbeat immediately (student just opened the page)
    sendHeartbeat();

    // Then send every 60 seconds
    intervalRef.current = setInterval(sendHeartbeat, 60 * 1000);

    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [type, referenceId, active, lessonId]);
}
