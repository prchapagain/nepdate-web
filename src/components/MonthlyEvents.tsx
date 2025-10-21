import React from 'react';
import { toBikramSambat, fromBikramSambat, getBikramMonthInfo, getEventsForDate, toDevanagari } from '../lib/lib';

interface MonthlyEventsProps {
    activeSystem: 'bs' | 'ad';
    currentYear: number | null;
    currentMonth: number;
}

const MonthlyEvents: React.FC<MonthlyEventsProps> = ({
    activeSystem,
    currentYear,
    currentMonth
}) => {
    const getMonthlyEvents = () => {
        const eventsMap = new Map<number, Array<{name: string, holiday: boolean}>>();

        if (activeSystem === 'bs') {
            if (currentYear === null) return eventsMap;
            const monthInfo = getBikramMonthInfo(currentYear, currentMonth);
            if (!monthInfo) return eventsMap;

            for (let day = 1; day <= monthInfo.totalDays; day++) {
                const date = fromBikramSambat(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(date, currentYear, currentMonth, day);
                if (dayEvents.length > 0) {
                    eventsMap.set(day, dayEvents.map(e => ({ name: e.name, holiday: e.holiday || false })));
                }
            }
        } else {
            if (currentYear === null) return eventsMap;
            const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

            for (let day = 1; day <= lastDay.getUTCDate(); day++) {
                // Create date in UTC to avoid timezone issues
                const date = new Date(Date.UTC(currentYear, currentMonth, day));
                const bsDate = toBikramSambat(date);
                const dayEvents = getEventsForDate(date, bsDate.year, bsDate.monthIndex, bsDate.day);
                if (dayEvents.length > 0) {
                    eventsMap.set(day, dayEvents.map(e => ({ name: e.name, holiday: e.holiday || false })));
                }
            }
        }

        return eventsMap;
    };

    const eventsMap = getMonthlyEvents();

    if (eventsMap.size === 0) {
        return null;
    }

    const eventItems: JSX.Element[] = [];
    eventsMap.forEach((events, day) => {
        events.forEach((event, index) => {
            const dayNumber = activeSystem === 'bs' ? toDevanagari(day) : day.toString();
            eventItems.push(
                <span key={`${day}-${index}`} className="inline-flex items-center">
                    <span
                        className="font-medium"
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                        {dayNumber}
                    </span>
                    <span className="mx-1">:</span>
                    <span
                        style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
                    >
                        {event.name}
                    </span>
                </span>
            );
        });
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-gray-700 px-3 py-2 flex-shrink-0">
            <div
                className="text-xs text-blue-800 dark:text-gray-300 flex flex-wrap gap-x-3 gap-y-1"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            >
                {eventItems.map((item, index) => (
                    <React.Fragment key={index}>
                        {item}
                        {index < eventItems.length - 1 && <span className="text-gray-400">•</span>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default MonthlyEvents;
