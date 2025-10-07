import { useState, useEffect } from 'react';
import CalendarHeader from './components/CalendarHeader';
import CalendarControls from './components/CalendarControls';
import CalendarGrid from './components/CalendarGrid';
import DayDetailsModal from './components/DayDetailsModal';
import MonthlyEvents from './components/MonthlyEvents';
import { toBikramSambat, fromBikramSambat } from './lib/lib';
import { isBsYearPrecomputed, isAdMonthPrecomputed } from './lib/bikram';

function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [activeSystem, setActiveSystem] = useState<'bs' | 'ad'>('bs');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const today = new Date();
    const todayBs = toBikramSambat(today);

    const [currentBsYear, setCurrentBsYear] = useState<number | null>(todayBs.year);
    const [currentBsMonth, setCurrentBsMonth] = useState(todayBs.monthIndex);
    const [currentAdYear, setCurrentAdYear] = useState<number | null>(today.getFullYear());
    const [currentAdMonth, setCurrentAdMonth] = useState(today.getMonth());

    // Theme management
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        // Default to light when no saved preference
        const initialTheme = savedTheme || 'light';
        setTheme(initialTheme);

        // Ensure document class matches the loaded theme
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleSystemChange = (system: 'bs' | 'ad') => {
        if (system === activeSystem) return;

        // Convert visible month/date from the current system to the target system
        if (system === 'bs') {
            // AD -> BS: take the first day of the currently displayed AD month and convert
            if (currentAdYear === null) {
                setActiveSystem(system);
                return;
            }
            // If the currently displayed AD month is the same as today's AD month,
            // convert the actual today date so the exact day remains visible after switch.
            if (currentAdYear === today.getFullYear() && currentAdMonth === today.getMonth()) {
                setCurrentBsYear(todayBs.year);
                setCurrentBsMonth(todayBs.monthIndex);
            } else {
                const adDate = new Date(Date.UTC(currentAdYear, currentAdMonth, 1));
                const bs = toBikramSambat(adDate);
                if (bs) {
                    setCurrentBsYear(bs.year);
                    setCurrentBsMonth(bs.monthIndex);
                }
            }
        } else {
            // BS -> AD: take the first day of the currently displayed BS month and convert
            if (currentBsYear === null) {
                setActiveSystem(system);
                return;
            }
            // If the currently displayed BS month is the same as today's BS month,
            // convert today's actual AD date so the exact day remains visible after switch.
            if (currentBsYear === todayBs.year && currentBsMonth === todayBs.monthIndex) {
                setCurrentAdYear(today.getFullYear());
                setCurrentAdMonth(today.getMonth());
            } else {
                const adDate = fromBikramSambat(currentBsYear, currentBsMonth, 1);
                if (adDate) {
                    setCurrentAdYear(adDate.getUTCFullYear());
                    setCurrentAdMonth(adDate.getUTCMonth());
                }
            }
        }

        setActiveSystem(system);
    };

    const handleTodayClick = () => {
        setCurrentBsYear(todayBs.year);
        setCurrentBsMonth(todayBs.monthIndex);
        setCurrentAdYear(today.getFullYear());
        setCurrentAdMonth(today.getMonth());
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handlePrevMonth = () => {
        if (activeSystem === 'bs') {
            if (currentBsMonth === 0) {
                setCurrentBsMonth(11);
                setCurrentBsYear(prev => (prev === null ? todayBs.year - 1 : prev - 1));
            } else {
                setCurrentBsMonth(currentBsMonth - 1);
            }
        } else {
            if (currentAdMonth === 0) {
                setCurrentAdMonth(11);
                setCurrentAdYear(prev => (prev === null ? today.getFullYear() - 1 : prev - 1));
            } else {
                setCurrentAdMonth(currentAdMonth - 1);
            }
        }
    };

    const handleNextMonth = () => {
        if (activeSystem === 'bs') {
            if (currentBsMonth === 11) {
                setCurrentBsMonth(0);
                setCurrentBsYear(prev => (prev === null ? todayBs.year + 1 : prev + 1));
            } else {
                setCurrentBsMonth(currentBsMonth + 1);
            }
        } else {
            if (currentAdMonth === 11) {
                setCurrentAdMonth(0);
                setCurrentAdYear(prev => (prev === null ? today.getFullYear() + 1 : prev + 1));
            } else {
                setCurrentAdMonth(currentAdMonth + 1);
            }
        }
    };

    const handlePrevYear = () => {
        if (activeSystem === 'bs') {
            setCurrentBsYear((prev) => (prev === null ? todayBs.year - 1 : prev - 1));
        } else {
            setCurrentAdYear((prev) => (prev === null ? today.getFullYear() - 1 : prev - 1));
        }
    };

    const handleNextYear = () => {
        if (activeSystem === 'bs') {
            setCurrentBsYear((prev) => (prev === null ? todayBs.year + 1 : prev + 1));
        } else {
            setCurrentAdYear((prev) => (prev === null ? today.getFullYear() + 1 : prev + 1));
        }
    };

    const currentYear = activeSystem === 'bs' ? currentBsYear : currentAdYear;
    const currentMonth = activeSystem === 'bs' ? currentBsMonth : currentAdMonth;

    return (
        <div className="h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col overflow-hidden">
            <CalendarHeader
                activeSystem={activeSystem}
                bsYear={currentBsYear}
                bsMonth={currentBsMonth}
                adYear={currentAdYear}
                adMonth={currentAdMonth}
                onSystemChange={handleSystemChange}
                onTodayClick={handleTodayClick}
                theme={theme}
                onThemeToggle={handleThemeToggle}
            />

            <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0 px-2 sm:px-4 lg:px-6 xl:px-8 overflow-hidden">
                <div className="py-2 space-y-2 flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <CalendarControls
                            activeSystem={activeSystem}
                            currentYear={currentYear}
                            currentMonth={currentMonth}
                            onYearChange={(year: number | null) => {
                                if (activeSystem === 'bs') {
                                    setCurrentBsYear(year);
                                } else {
                                    setCurrentAdYear(year);
                                }
                            }}
                            onMonthChange={(month) => {
                                if (activeSystem === 'bs') {
                                    setCurrentBsMonth(month);
                                } else {
                                    setCurrentAdMonth(month);
                                }
                            }}
                            onPrevMonth={handlePrevMonth}
                            onNextMonth={handleNextMonth}
                            onPrevYear={handlePrevYear}
                            onNextYear={handleNextYear}
                        />
                        {activeSystem === 'bs' ? (
                            (currentBsYear !== null && !isBsYearPrecomputed(currentBsYear)) && (
                                <div className="w-full text-center">
                                    <div className="inline-block relative group text-xs text-yellow-700 dark:text-yellow-300 mt-2 px-3 py-1 rounded-md bg-yellow-50 dark:bg-yellow-900/10" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                                        सूचना: यो महिना पूर्वनिर्धारित डेटा नभएकोले खगोलीय गणना प्रयोग गरी देखाइएको छ।
                                        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-72 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                                            <div className="bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                                यो महिनाको मिति पूर्वनिर्धारित तालिकामा उपलब्ध छैन, यो प्रणालीले खगोलीय (सूर्य/चन्द्र) गणनाको प्रयोग गरी मिति अनुमान गर्दछ। गणना प्राथमिक रूपमा तिथिहरू र मासहरूको औसत स्थितिमा आधारित हुन्छ र १ दिनको भिन्नता हुन सक्छ।
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ) : (
                            (!isAdMonthPrecomputed(currentAdYear, currentAdMonth)) && (
                                <div className="w-full text-center">
                                    <div className="inline-block relative group text-xs text-yellow-700 dark:text-yellow-300 mt-2 px-3 py-1 rounded-md bg-yellow-50 dark:bg-yellow-900/10">
                                        Note: This month is calculated using astronomical fallback (not precomputed data).
                                        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-80 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150">
                                            <div className="bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                                                When precomputed Bikram Sambat data is not available for the displayed month, the calendar falls back to astronomical calculations (solar and lunar longitudes) to determine month boundaries and lunar tithis. These values are approximate and may differ slightly from local published panchangas.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        <div className="p-3 flex-1 min-h-0 overflow-hidden">
                            <CalendarGrid
                                activeSystem={activeSystem}
                                currentYear={currentYear}
                                currentMonth={currentMonth}
                                onDayClick={handleDayClick}
                            />
                        </div>
                    </div>

                    <MonthlyEvents
                        activeSystem={activeSystem}
                        currentYear={currentYear}
                        currentMonth={currentMonth}
                    />
                    <footer className="w-full text-center py-4 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900">
                        © {new Date().getFullYear()} <a href="https://github.com/khumnath/nepdate/tree/page" className="underline hover:text-blue-600 dark:hover:text-blue-400">Nepdate Bikram Calendar Project</a>. Licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.html" className="underline hover:text-blue-600 dark:hover:text-blue-400">GPL v3 or later</a>.
                    </footer>

                </div>
            </div>

            <DayDetailsModal
                date={selectedDate}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default App;