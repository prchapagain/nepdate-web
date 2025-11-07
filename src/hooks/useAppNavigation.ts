import { useState, useEffect, useRef } from 'react';
import { ActiveView } from '../types';

export const useAppNavigation = (isStandalone: boolean) => {
  const [activeView, setActiveView] = useState<ActiveView>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [showExitToast, setShowExitToast] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Backspace closes menu when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMenuOpen) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Back button and settings handling
  useEffect(() => {
    if (!isStandalone) return;

    const handlePopState = () => {
      if (isModalOpen) {
        setIsModalOpen(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (isAboutOpen) {
        setIsAboutOpen(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (isMenuOpen) {
        setIsMenuOpen(false);
        window.history.pushState(null, '', window.location.href);
        return;
      }
      if (activeView === 'kundali') {
        // Let KundaliPage's own popstate listener handle the event.
        return;
      }

      // Handle 'converter' and 'settings' views)
      if (activeView === 'converter' || activeView === 'settings') {
        setActiveView('calendar');
        window.history.pushState(null, '', window.location.href);
        return;
      }

      if (backPressedOnce) {
        window.history.go(-2);
      } else {
        setBackPressedOnce(true);
        setShowExitToast(true);
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
          setBackPressedOnce(false);
          setShowExitToast(false);
          timeoutRef.current = null;
        }, 2000);
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isStandalone, backPressedOnce, isMenuOpen, isModalOpen, isAboutOpen, activeView]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return {
    activeView,
    setActiveView,
    selectedDate,
    isModalOpen,
    setIsModalOpen,
    isMenuOpen,
    setIsMenuOpen,
    isAboutOpen,
    setIsAboutOpen,
    showExitToast,
    handleDayClick,
  };
};