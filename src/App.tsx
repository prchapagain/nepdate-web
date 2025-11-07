import React, { lazy, Suspense, useEffect } from 'react';
import { BottomTabBar } from './components/calendar/BottomTabBar';
import { DesktopTopNav } from './components/calendar/DesktopTopNav';
import CalendarHeader from './components/calendar/CalendarHeader';
import CalendarControls from './components/calendar/CalendarControls';
import CalendarGrid from './components/calendar/CalendarGrid';
import DayDetailsModal from './components/calendar/DayDetailsModal';
import MonthlyEvents from './components/calendar/MonthlyEvents';
import Footer from './components/calendar/Footer';
import AboutPopup from './pages/AboutPopup';
import { Menu, X, Download, Info, Home, SwitchCamera, Moon, Sun, RefreshCcw, Settings } from 'lucide-react';
import { NEPALI_LABELS } from './constants/constants';
import { toast, ToastContainer } from './components/shared/toast';
import { TodayWidget } from './components/calendar/TodayWidget';

// --- Import Custom Hooks ---
import { useTheme } from './hooks/useTheme';
import { useLayout } from './hooks/useLayout';
import { usePWA } from './hooks/usePWA';
import { useCalendarLogic } from './hooks/useCalendarLogic';
import { useAppNavigation } from './hooks/useAppNavigation';
import { usePlatform } from './hooks/usePlatform';

// --- Import Utils ---
import { handleReloadApp } from './lib/utils/appUtils';

// Lazy load Pages
const KundaliPage = lazy(() => import('./pages/KundaliPage'));
const ConverterPage = lazy(() => import('./pages/ConverterPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

const App: React.FC = () => {
  const { theme, toggleTheme, resetTheme } = useTheme();
  const {
    menuStyle,
    desktopLayoutStyle,
    handleSetMenuStyle,
    handleSetDesktopLayoutStyle,
    resetLayoutSettings,
  } = useLayout();

  const { isStandalone, canInstall, isInstalled, handleInstallClick } = usePWA();

  const {
    activeView,
    setActiveView,
    selectedDate,
    isModalOpen,
    setIsModalOpen,
    isMenuOpen,
    setIsMenuOpen,
    isAboutOpen,
    setIsAboutOpen,
    handleDayClick,
  } = useAppNavigation(isStandalone);

  const {
    activeSystem,
    currentYear,
    currentMonth,
    currentBsYear,
    currentBsMonth,
    currentAdYear,
    currentAdMonth,
    switchSystem,
    goToToday,
    changeMonth,
    changeYear,
    setCurrentBsYear,
    setCurrentAdYear,
    setCurrentBsMonth,
    setCurrentAdMonth,
    initialToday,
    initialTodayBs,
    todayDetails,
  } = useCalendarLogic();

  const { isAndroidApp,showExitToast, handleTouchStart, handleTouchMove, handleTouchEnd } = usePlatform(
    isMenuOpen,
    setIsMenuOpen
  );

  const handleResetSettings = () => {
    resetTheme();
    resetLayoutSettings();
  };

  useEffect(() => {
  if (showExitToast) {
    toast.info(
      activeSystem === 'bs'
        ? 'बन्द गर्नको लागि फेरि थिच्नुहोस्'
        : 'Press back again to exit',
      2500
    );
  }
}, [showExitToast, activeSystem]);


  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors relative ${
        desktopLayoutStyle === 'sidebar' ? 'md:flex-row' : ''
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {desktopLayoutStyle === 'topbar' && (
        <>
          <DesktopTopNav
            activeView={activeView}
            onNavigate={(view) => setActiveView(view as 'calendar' | 'converter' | 'kundali' | 'settings')} 
          />
          
        </>
      )}

      <header className="px-4 print:hidden py-2 border-b dark:border-gray-700 bg-slate-200 dark:bg-gray-800 z-30 md:hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {menuStyle === 'slide' && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              {NEPALI_LABELS.Nepdate_calendar}
            </h1>
          </div>
        </div>

      </header>

      {isMenuOpen && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setIsMenuOpen(false)}></div>}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-slate-200 dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${menuStyle === 'tabs' ? 'hidden md:block' : 'block'} 
        ${desktopLayoutStyle === 'sidebar' ? 'md:sticky md:h-screen md:translate-x-0 md:shadow-md' : 'md:hidden'}
        ${desktopLayoutStyle === 'sidebar' ? 'md:w-56' : 'w-64'}
        `}
        inert-hidden={!isMenuOpen}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              <span className="hidden md:inline">{NEPALI_LABELS.Nepdate_calendar}</span>
              <span className="md:hidden">Menu</span>
            </h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 md:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex flex-col space-y-3 text-gray-800 dark:text-gray-200">
            <button
              onClick={() => {
                setActiveView('calendar');
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> {NEPALI_LABELS.home}
            </button>
            <button
              onClick={() => {
                setActiveView('converter');
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <SwitchCamera className="w-4 h-4" /> {NEPALI_LABELS.converter}
            </button>
            <button
              onClick={() => {
                setActiveView('kundali');
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M2 12h20" />
              </svg>{' '}
              {NEPALI_LABELS.kundali}
            </button>

            <button
              onClick={() => {
                setActiveView('settings');
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> {NEPALI_LABELS.settings || 'Settings'}
            </button>

            <a
              href="https://github.com/khumnath/nepdate/tree/page"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <Menu className="w-4 h-4" /> {NEPALI_LABELS.sourceCode}
            </a>
            <button
              onClick={() => {
                setIsAboutOpen(true);
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <Info className="w-4 h-4" /> {NEPALI_LABELS.about}
            </button>

            {!isStandalone && canInstall && (
              <button
                onClick={() => {
                  handleInstallClick();
                  setIsMenuOpen(false);
                }}
                className="px-3 py-2 text-left rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> {NEPALI_LABELS.installApp}
              </button>
            )}

            {!isStandalone && isInstalled && !canInstall && (
              <a
                href="web+nepdate://open"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 text-left rounded bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Info className="w-4 h-4" /> {NEPALI_LABELS.openApp}
              </a>
            )}

            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="px-3 py-2 text-left rounded hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'light' ? NEPALI_LABELS.darkMode : NEPALI_LABELS.lightMode}</span>
            </button>

            <>
              <hr className="border-gray-300 dark:border-gray-600 my-2" />
              <button
                onClick={() => {
                  handleReloadApp();
                  setIsMenuOpen(false);
                }}
                className="px-3 py-2 text-left rounded text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" /> Clear Cache & Reload
              </button>
            </>
          </nav>

          <div className="mt-auto text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            © {new Date().getFullYear()} {NEPALI_LABELS.project}
          </div>
        </div>
      </aside>

      {isAboutOpen && <AboutPopup setIsAboutOpen={setIsAboutOpen} />}

      <div className="flex-1 overflow-hidden">
        <div
          className={`h-full overflow-auto px-4 md:px-6 max-w-7xl xl:max-w-6xl mx-auto w-full ${
            menuStyle === 'tabs' ? 'pb-24 md:pb-6' : 'pb-20 md:pb-6'
          }`}
        >
          {activeView === 'kundali' ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <KundaliPage onBack={() => setActiveView('calendar')} />
            </Suspense>
          ) : activeView === 'calendar' ? (
            <>
              {/* CalendarHeader  */}
              <div className="flex justify-center sm:justify-end mb-2">
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
              </div>
              
              <main className="min-h-[60vh] md:grid md:grid-cols-12 md:gap-x-6">
                <div className="hidden md:block md:col-span-4"></div>
                
                {/* CALENDAR CONTROLS */}
                <section className="md:col-span-8 py-2 sm:py-3">
                  <CalendarControls
                    activeSystem={activeSystem}
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    onYearChange={(y) => (activeSystem === 'bs' ? setCurrentBsYear(y) : setCurrentAdYear(y))}
                    onMonthChange={(m) => (activeSystem === 'bs' ? setCurrentBsMonth(m) : setCurrentAdMonth(m))}
                    onPrevMonth={() => changeMonth('prev')}
                    onNextMonth={() => changeMonth('next')}
                    onPrevYear={() => changeYear('prev')}
                    onNextYear={() => changeYear('next')}
                  />
                </section>

                {/* TODAY WIDGET */}
                <aside className="hidden md:block md:col-span-4">
                  <TodayWidget 
                    todayAd={initialToday} 
                    todayBs={initialTodayBs}
                    todayDetails={todayDetails}
                  />
                </aside>

                {/* CALENDAR GRID & EVENTS */}
                <section className="md:col-span-8 flex flex-col flex-1">
                  <div className="p-2 sm:p-3 md:p-4">
                    <CalendarGrid
                      activeSystem={activeSystem}
                      currentYear={currentYear}
                      currentMonth={currentMonth}
                      onDayClick={handleDayClick}
                    />

                    <section className="events mt-3 sm:mt-4">
                      <MonthlyEvents
                        activeSystem={activeSystem}
                        currentYear={currentYear}
                        currentMonth={currentMonth}
                      />
                    </section>
                  </div>
                </section>
              </main>
            </>
          ) : activeView === 'converter' ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <ConverterPage onBack={() => setActiveView('calendar')} />
            </Suspense>
          ) : activeView === 'settings' ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              }
            >
              <SettingsPage
                onBack={() => setActiveView('calendar')}
                currentTheme={theme}
                onThemeChange={toggleTheme}
                currentMenuStyle={menuStyle}
                onMenuStyleChange={handleSetMenuStyle}
                currentDesktopLayoutStyle={desktopLayoutStyle}
                onDesktopLayoutStyleChange={handleSetDesktopLayoutStyle}
                onResetSettings={handleResetSettings}
                isAndroidApp={isAndroidApp}
                onReloadApp={handleReloadApp}
              />
            </Suspense>
          ) : null}
        </div>
      </div>

      {menuStyle === 'slide' && (
        <div className="fixed bottom-0 left-0 right-0 w-full bg-slate-200 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 print:hidden md:hidden">
          <Footer />
        </div>
      )}

      {menuStyle === 'tabs' && (
        <div className="md:hidden print:hidden">
          <BottomTabBar
            activeView={activeView}
            onNavigate={(view) => {
              if (view === 'about') {
                setIsAboutOpen(true);
              } else {
                setActiveView(view as 'calendar' | 'converter' | 'kundali' | 'settings');
              }
            }}
          />
        </div>
      )}

      <DayDetailsModal date={selectedDate} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ToastContainer />
    </div>
    
  );
};

export default App;