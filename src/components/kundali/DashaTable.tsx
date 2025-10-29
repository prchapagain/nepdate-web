import React, { useState } from 'react';
import type { DashaInfo } from '../../../types/types';
import { NEPALI_LABELS, NEPALI_PLANETS } from '../../constants/constants';
import { NEPALI_BS_MONTHS } from '../../constants/constants';
import { toBikramSambat } from '../../lib/lib';
import { ChevronDownIcon } from '../../data/icons';
import { toDevanagari } from '../../lib/lib';

const formatDate = (dateString: string): string => {
    try {
        const bikram = toBikramSambat(new Date(dateString));
        const year = toDevanagari(bikram.year.toString());
        const month = NEPALI_BS_MONTHS[bikram.monthIndex];
        const day = toDevanagari(bikram.day.toString());
        return `${year} ${month} ${day}`;
    } catch (e) {
        console.error("Date formatting error:", e);
        return toDevanagari(dateString.split('T')[0]) + " AD";
    }
};

export const DashaTable: React.FC<{ dashaSequence: DashaInfo[] }> = ({ dashaSequence }) => {
    const [expandedDasha, setExpandedDasha] = useState<string | null>(null);

    const toggleDasha = (planet: string) => {
        setExpandedDasha(prev => (prev === planet ? null : planet));
    };

    return (
        <div className="kundali-card p-4 sm:p-6 mb-11 rounded-lg bg-slate-200 dark:bg-gray-800">
            <h3 className="text-xl font-bold text-blue-400 dark:text-blue-400 mb-4">{NEPALI_LABELS.dashaPeriods}</h3>
            <table className="w-full text-left text-sm sm:text-base border-collapse">
                <thead className="border-b-2 border-amber-200 dark:border-amber-700 text-stone-600 dark:text-stone-300">
                    <tr>
                        <th className="py-2 px-2">{NEPALI_LABELS.mahaDasha}</th>
                        <th className="py-2 px-2">{NEPALI_LABELS.startsOn}</th>
                        <th className="py-2 px-2">{NEPALI_LABELS.endsOn}</th>
                    </tr>
                </thead>
                <tbody>
                    {dashaSequence.map((dasha) => (
                        <React.Fragment key={dasha.planet}>
                            <tr
                                className="border-b border-amber-100 dark:border-amber-800 cursor-pointer hover:bg-amber-50/70 dark:hover:bg-amber-900/40"
                                onClick={() => toggleDasha(dasha.planet)}
                                aria-expanded={expandedDasha === dasha.planet}
                                aria-controls={`antardasha-${dasha.planet}`}
                            >
                                <td className="py-2 px-2 font-medium text-stone-800 dark:text-stone-100 flex items-center relative">
                                    <div className="relative group">
                                        <ChevronDownIcon
                                            className={`w-4 h-4 mr-2 text-amber-700 dark:text-blue-400 transition-transform duration-300 ${
                                                expandedDasha === dasha.planet ? 'rotate-180' : ''
                                            }`}
                                        />
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-zinc-800 text-white text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[999] dark:bg-gray-800 dark:text-stone-200">
                                            {NEPALI_LABELS.antarDasha_clickToExpand}
                                        </div>
                                    </div>
                                    <span className="z-0">{NEPALI_PLANETS[dasha.planet]}</span>
                                </td>
                                <td className="py-2 px-2 text-stone-700 dark:text-stone-200">{formatDate(dasha.start)}</td>
                                <td className="py-2 px-2 text-stone-700 dark:text-stone-200">{formatDate(dasha.end)}</td>
                            </tr>
                            {dasha.subDashas && dasha.subDashas.length > 0 && (
                                <tr className="bg-slate-200 dark:bg-gray-800">
                                    <td colSpan={3} className="p-0 border-none">
                                        <div
                                            id={`antardasha-${dasha.planet}`}
                                            className={`overflow-hidden transition-all duration-500 ease-in-out ${
                                                expandedDasha === dasha.planet ? 'max-h-[1000px]' : 'max-h-0'
                                            }`}
                                        >
                                            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20">
                                                <h4 className="font-semibold text-blue-400 dark:text-blue-400 mb-2 pl-2">{NEPALI_LABELS.antarDasha}</h4>
                                                <table className="w-full text-sm">
                                                    <thead className="text-stone-500 dark:text-stone-400">
                                                        <tr>
                                                            <th className="font-medium py-1 px-2 text-left">{NEPALI_LABELS.planet}</th>
                                                            <th className="font-medium py-1 px-2 text-left">{NEPALI_LABELS.startsOn}</th>
                                                            <th className="font-medium py-1 px-2 text-left">{NEPALI_LABELS.endsOn}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {dasha.subDashas.map(subDasha => (
                                                            <tr key={subDasha.planet} className="border-b border-amber-100 dark:border-amber-800 last:border-b-0">
                                                                <td className="py-1.5 px-2 text-stone-800 dark:text-stone-100">{NEPALI_PLANETS[subDasha.planet]}</td>
                                                                <td className="py-1.5 px-2 text-stone-700 dark:text-stone-200">{formatDate(subDasha.start)}</td>
                                                                <td className="py-1.5 px-2 text-stone-700 dark:text-stone-200">{formatDate(subDasha.end)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default DashaTable;
