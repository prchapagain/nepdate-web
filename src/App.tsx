import React, { useEffect, useState } from 'react';
import CalendarHeader from './components/CalendarHeader';
import CalendarControls from './components/CalendarControls';
import CalendarGrid from './components/CalendarGrid';
import DayDetailsModal from './components/DayDetailsModal';
import MonthlyEvents from './components/MonthlyEvents';
import { toBikramSambat, fromBikramSambat } from './lib/lib';
import { isBsYearPrecomputed, isAdMonthPrecomputed } from './lib/bikram';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeSystem, setActiveSystem] = useState<'bs' | 'ad'>('bs');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const today = new Date();
  const todayBs = toBikramSambat(today);

  const [currentBsYear, setCurrentBsYear] = useState<number | null>(todayBs.year);
  const [currentBsMonth, setCurrentBsMonth] = useState<number>(todayBs.monthIndex);
  const [currentAdYear, setCurrentAdYear] = useState<number | null>(today.getFullYear());
  const [currentAdMonth, setCurrentAdMonth] = useState<number>(today.getMonth());

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const switchSystem = (system: 'bs' | 'ad') => {
    if (system === activeSystem) return;

    if (system === 'bs') {
      const adDate = new Date(Date.UTC(currentAdYear ?? today.getFullYear(), currentAdMonth));
      const bs = toBikramSambat(adDate);
      setCurrentBsYear(bs.year);
      setCurrentBsMonth(bs.monthIndex);
    } else {
      const adDate = fromBikramSambat(currentBsYear ?? todayBs.year, currentBsMonth, 1);
      setCurrentAdYear(adDate.getUTCFullYear());
      setCurrentAdMonth(adDate.getUTCMonth());
    }

    setActiveSystem(system);
  };

  const goToToday = () => {
    setCurrentBsYear(todayBs.year);
    setCurrentBsMonth(todayBs.monthIndex);
    setCurrentAdYear(today.getFullYear());
    setCurrentAdMonth(today.getMonth());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    if (activeSystem === 'bs') {
      const newMonth = direction === 'prev' ? currentBsMonth - 1 : currentBsMonth + 1;
      if (newMonth < 0) {
        setCurrentBsMonth(11);
        setCurrentBsYear((prev) => (prev ?? todayBs.year) - 1);
      } else if (newMonth > 11) {
        setCurrentBsMonth(0);
        setCurrentBsYear((prev) => (prev ?? todayBs.year) + 1);
      } else {
        setCurrentBsMonth(newMonth);
      }
    } else {
      const newMonth = direction === 'prev' ? currentAdMonth - 1 : currentAdMonth + 1;
      if (newMonth < 0) {
        setCurrentAdMonth(11);
        setCurrentAdYear((prev) => (prev ?? today.getFullYear()) - 1);
      } else if (newMonth > 11) {
        setCurrentAdMonth(0);
        setCurrentAdYear((prev) => (prev ?? today.getFullYear()) + 1);
      } else {
        setCurrentAdMonth(newMonth);
      }
    }
  };

  const changeYear = (direction: 'prev' | 'next') => {
    if (activeSystem === 'bs') {
      setCurrentBsYear((prev) => (prev ?? todayBs.year) + (direction === 'next' ? 1 : -1));
    } else {
      setCurrentAdYear((prev) => (prev ?? today.getFullYear()) + (direction === 'next' ? 1 : -1));
    }
  };

  const currentYear = activeSystem === 'bs' ? currentBsYear : currentAdYear;
  const currentMonth = activeSystem === 'bs' ? currentBsMonth : currentAdMonth;

  const showFallbackNotice =
    activeSystem === 'bs'
      ? currentBsYear !== null && !isBsYearPrecomputed(currentBsYear)
      : !isAdMonthPrecomputed(currentAdYear, currentAdMonth);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors overflow-hidden">
      {/* Header */}
      <CalendarHeader
        activeSystem={activeSystem}
        bsYear={currentBsYear}
        bsMonth={currentBsMonth}
        adYear={currentAdYear}
        adMonth={currentAdMonth}
        onSystemChange={switchSystem}
        onTodayClick={goToToday}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Main layout */}
      <main className="flex-1 flex flex-col overflow-hidden px-2 sm:px-4 md:px-6 lg:px-40 max-w-7xl mx-auto w-full">
        <section className="py-2 sm:py-3">
          <CalendarControls
            activeSystem={activeSystem}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onYearChange={(year) => {
              activeSystem === 'bs' ? setCurrentBsYear(year) : setCurrentAdYear(year);
            }}
            onMonthChange={(month) => {
              activeSystem === 'bs' ? setCurrentBsMonth(month) : setCurrentAdMonth(month);
            }}
            onPrevMonth={() => changeMonth('prev')}
            onNextMonth={() => changeMonth('next')}
            onPrevYear={() => changeYear('prev')}
            onNextYear={() => changeYear('next')}
          />
        </section>

        {showFallbackNotice && (
          <div className="text-center text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-2 px-3 py-1 rounded-md bg-yellow-50 dark:bg-yellow-900/10 font-sans">
            {activeSystem === 'bs'
              ? 'सूचना: यो महिना पूर्वनिर्धारित डेटा नभएकोले खगोलीय गणना प्रयोग गरी देखाइएको छ।'
              : 'Note: This month is calculated using astronomical fallback (not precomputed data).'}
          </div>
        )}

        {/* Calendar grid */}
        <section className="flex-1 overflow-auto p-2 sm:p-3 md:p-4">
          <CalendarGrid
            activeSystem={activeSystem}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onDayClick={handleDayClick}
          />
        </section>

        {/* Monthly events */}
        <section className="mt-3 sm:mt-4">
          <MonthlyEvents
            activeSystem={activeSystem}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />
        

        {/* Footer */}
        <footer className="mt-auto text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Calendar Project. All rights reserved.
        </footer>
        </section>
      </main>

      {/* Modal */}
      <DayDetailsModal
        date={selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;
