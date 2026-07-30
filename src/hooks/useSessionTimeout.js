import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * A React custom hook for session inactivity timeout.
 * 
 * @param {Object} options Configuration options
 * @param {number} options.timeoutDuration Time in ms before timeout (default: 15 mins)
 * @param {number} options.warningDuration Time in ms before timeout to show warning (default: 2 mins)
 * @param {Function} options.onTimeout Callback when timeout occurs
 * @returns {Object} { isWarningVisible, remainingSeconds, resetTimer }
 */
export const useSessionTimeout = ({
  timeoutDuration = 900000, // 15 minutes
  warningDuration = 120000, // 2 minutes
  onTimeout = () => {}
} = {}) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timeoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const clearAllTimers = () => {
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const startTimers = useCallback(() => {
    clearAllTimers();
    setIsWarningVisible(false);
    setRemainingSeconds(Math.floor(warningDuration / 1000));

    // Start warning timer
    const timeUntilWarning = timeoutDuration - warningDuration;
    
    warningTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      
      // Start countdown interval
      countdownIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    }, timeUntilWarning > 0 ? timeUntilWarning : 0);

    // Start actual timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      clearAllTimers();
      onTimeout();
    }, timeoutDuration);
  }, [timeoutDuration, warningDuration, onTimeout]);

  const resetTimer = useCallback(() => {
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      // Only reset on activity if we are not in the warning phase.
      // If in warning phase, user must explicitly interact with warning modal (using resetTimer)
      if (!isWarningVisible) {
        startTimers();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    startTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [isWarningVisible, startTimers]);

  return { isWarningVisible, remainingSeconds, resetTimer };
};

export default useSessionTimeout;
