import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { toBikramSambat, fromBikramSambat } from '../lib/lib';

interface CalendarHeaderProps {
    activeSystem: 'bs' | 'ad';
    bsYear: number | null;
    bsMonth: number;
    adYear: number | null;
    adMonth: number;
    onSystemChange: (system: 'bs' | 'ad') => void;
    onTodayClick: () => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    activeSystem,
    bsYear,
    bsMonth,
    adYear,
    adMonth,
    onSystemChange,
    onTodayClick,
    theme,
    onThemeToggle
}) => {
    const BIKRAM_SAMBAT_MONTHS = ["वैशाख","जेठ","असार","साउन","भदौ","असोज","कार्तिक","मंसिर","पुष","माघ","फाल्गुन","चैत"];
    const GREGORIAN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    // Compute display strings independently so they don't mirror each other's raw values
    let bsDisplay = '—';
    let adDisplay = '—';

    if (bsYear !== null) {
        bsDisplay = `${bsYear} ${BIKRAM_SAMBAT_MONTHS[bsMonth % 12]}`;
        // if ad not provided, compute AD month/year for the BS first-day
        if (adYear === null) {
            try {
                const adDate = fromBikramSambat(bsYear, bsMonth, 1);
                adDisplay = `${adDate.getUTCFullYear()} ${GREGORIAN_MONTHS[adDate.getUTCMonth() % 12]}`;
            } catch (e) { adDisplay = '—'; }
        }
    }

    if (adYear !== null) {
        adDisplay = `${adYear} ${GREGORIAN_MONTHS[adMonth % 12]}`;
        // if bs not provided, compute BS month/year for the AD first-day
        if (bsYear === null) {
            try {
                const bs = toBikramSambat(new Date(Date.UTC(adYear, adMonth, 1)));
                bsDisplay = `${bs.year} ${BIKRAM_SAMBAT_MONTHS[bs.monthIndex % 12]}`;
            } catch (e) { bsDisplay = '—'; }
        }
    }
    return (
        <header className="w-full bg-blue-600 dark:bg-gray-800 backdrop-blur-sm border-b border-blue-700 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1">
                    <button
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${
                            activeSystem === 'bs'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                        } text-sm sm:text-base font-medium`}
                        onClick={() => onSystemChange('bs')}
                    >
                        <span className="hidden md:inline">Bikram Sambat</span>
                        <span className="md:hidden">BS</span>
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md transition-all duration-200 ${
                            activeSystem === 'ad'
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-orange-500'
                        } text-sm sm:text-base font-medium`}
                        onClick={() => onSystemChange('ad')}
                    >
                        <span className="hidden md:inline">Gregorian</span>
                        <span className="md:hidden">AD</span>
                    </button>
                </div>
                    
                    <button
                        onClick={onTodayClick}
                        className="px-4 sm:px-5 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-sm sm:text-base"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                        आज
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-white/90 dark:text-gray-300 text-center">
                        <div className="font-medium">AD: {adDisplay}</div>
                        <div className="text-xs">BS: {bsDisplay}</div>
                    </div>
                    <button
                        onClick={onThemeToggle}
                        className="p-2.5 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-400 transition-colors duration-200"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default CalendarHeader;