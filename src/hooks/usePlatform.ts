import React, { useState, useEffect } from 'react';

export const usePlatform = (
  isMenuOpen: boolean,
  setIsMenuOpen: (isOpen: boolean) => void
) => {
  const [isAndroidApp, setIsAndroidApp] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Exit toast state
  const [showExitToast, setShowExitToast] = useState(false);
  const [exitTimer, setExitTimer] = useState<number | null>(null);

  useEffect(() => {
    if (
      typeof (window as any).Android !== 'undefined' &&
      typeof (window as any).Android.openWidgetSettings === 'function'
    ) {
      setIsAndroidApp(true);
    }
  }, []);

  //  back-button handling (Android + browser)
  useEffect(() => {
    const handleBack = (e?: Event) => {
      e?.preventDefault?.();

      // If menu open, just close it instead of exiting
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return;
      }

      // If user already saw toast once — exit now
      if (showExitToast) {
        if ((window as any).Android?.exitApp) {
          (window as any).Android.exitApp();
        } else {
          // Browser or other — just go back in history or close tab
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.close();
          }
        }
      } else {
        setShowExitToast(true);
        const t = window.setTimeout(() => setShowExitToast(false), 2000);
        setExitTimer(t);
      }
    };

    // Listen to multiple back events
    window.addEventListener('popstate', handleBack);
    document.addEventListener('backbutton', handleBack);

    return () => {
      window.removeEventListener('popstate', handleBack);
      document.removeEventListener('backbutton', handleBack);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [isMenuOpen, showExitToast, exitTimer, setIsMenuOpen]);

  // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) =>
    setTouchEndX(e.touches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchEndX - touchStartX;
    if (diff > 60 && touchStartX < 50) setIsMenuOpen(true);
    else if (diff < -60 && isMenuOpen) setIsMenuOpen(false);
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return {
    isAndroidApp,
    showExitToast,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
