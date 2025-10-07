import React from 'react';
import { X } from 'lucide-react';
import { calculate } from '../lib/lib';

interface DayDetailsModalProps {
    date: Date | null;
    isOpen: boolean;
    onClose: () => void;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ date, isOpen, onClose }) => {
    if (!isOpen || !date) return null;

    const data = calculate(date);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (data.error) {
        return (
            <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={handleBackdropClick}
            >
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 max-w-md w-full">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-red-500">Error</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-red-500 text-sm">{data.error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto ring-1 ring-transparent dark:ring-gray-700/80 dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-sm">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 rounded-t-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2
                                className="text-xl font-bold text-gray-900 dark:text-white"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                                {data.weekday}, {data.bikramSambat}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{data.gregorianDate}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Sunrise/Sunset */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg">
                            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">सूर्योदय</div>
                            <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{data.sunrise}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg">
                            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">सूर्यास्त</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{data.sunset}</div>
                        </div>
                    </div>

                    {/* Panchanga Information */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-base font-semibold mb-3" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
                            पञ्चाङ्ग विवरण
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {[
                                { label: 'तिथी', value: data.tithi },
                                { label: 'पक्ष', value: data.paksha },
                                { label: 'चन्द्रमास', value: data.lunarMonth },
                                { label: 'नक्षत्र', value: data.nakshatra },
                                { label: 'योग', value: data.yoga },
                                { label: 'करण', value: data.karana },
                                { label: 'सूर्य राशि', value: data.sunRashi },
                                { label: 'चन्द्र राशि', value: data.moonRashi }
                            ].map((item, index) => (
                                <div key={index} className="flex justify-between text-sm py-1">
                                    <span
                                        className="text-gray-600 dark:text-gray-400 font-medium"
                                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                                    >
                                        {item.label}:
                                    </span>
                                    <strong
                                        className="text-gray-900 dark:text-white"
                                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                                    >
                                        {item.value || '-'}
                                    </strong>
                                </div>
                            ))}
                        </div>
                    </div>

                        {/* Events */}
                    {data.events && data.events.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
                            <h3
                                className="text-base font-semibold mb-3 text-green-800 dark:text-green-200"
                                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                            >
                                आजका घटनाहरू
                            </h3>
                            <div className="space-y-2">
                    {data.events.map((event: { name: string; detail?: string; holiday?: boolean; category?: string }, index: number) => (
                        <div key={index} className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <strong
                                                        className="text-sm text-green-800 dark:text-green-200"
                                                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                                                    >
                                                        {event.name}
                                                    </strong>
                                                    {event.holiday && (
                                                        <span className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                                            Holiday
                                                        </span>
                                                    )}
                                                </div>
                                                {event.detail && (
                                                    <p
                                                        className="text-xs text-gray-600 dark:text-gray-300"
                                                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                                                    >
                                                        {event.detail}
                                                    </p>
                                                )}
                                            </div>
                                            {event.category && (
                                                <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 px-2 py-0.5 rounded-full text-xs font-medium ml-2">
                                                    {event.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Computation note when data-driven BS mapping is not available */}
                    {data.isComputed && (
                        <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                            Note: Date converted via astronomical fallback (precomputed data unavailable). Events from pre-calculated lists may not be available for this year.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayDetailsModal;
