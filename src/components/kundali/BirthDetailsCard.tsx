import React from 'react';
import type { KundaliResponse } from '../../../types/types';
import {
  NEPALI_LABELS,
  NEPALI_RASHI,
  NAKSHATRA_SYLLABLES,
  NEPALI_WEEKDAYS,
  NEPALI_BS_MONTHS,
} from '../../constants/constants';
import { toBikramSambat, toDevanagari, formatDegrees } from '../../lib/lib';

interface BirthDetailsCardProps {
  data: KundaliResponse;
  layout?: 'single-column' | 'two-column';
}

export const BirthDetailsCard: React.FC<BirthDetailsCardProps> = ({ data }) => {
  const moon = data.planets.find(p => p.planet === 'MOON');
  const sun = data.planets.find(p => p.planet === 'SUN');

  const birthDate = new Date(data.birthDetails.datetime);
  const bsObj = toBikramSambat(birthDate);
  const bsDate = `${toDevanagari(bsObj.year)} ${NEPALI_BS_MONTHS[bsObj.monthIndex]} ${toDevanagari(bsObj.day)}`;
  const dayOfWeek = NEPALI_WEEKDAYS[birthDate.getDay()];

  const adDateFormatted = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(birthDate);

  const timeFormatted = new Intl.DateTimeFormat('ne-NP', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(birthDate);

  const nameSyllableData = NAKSHATRA_SYLLABLES[data.nakshatra.index];
  const suggestedSyllable = nameSyllableData
    ? nameSyllableData.syllables[data.nakshatra.pada - 1]
    : '?';

  const ascendantRashi = NEPALI_RASHI[data.ascendant.sign - 1];
  const ascendantDegrees = formatDegrees(data.ascendant.degreesInSign);

  return (
    <div className="kundali-card p-4 sm:p-6 rounded-lg h-full bg-slate-200 dark:bg-gray-800">
      <h3 className="text-xl font-bold text-blue-400 dark:text-blue-400 mb-4">{NEPALI_LABELS.generalInfo}</h3>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div className="flex gap-1 items-start ">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.birthDateBS}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{bsDate}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.birthDateAD}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{adDateFormatted}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.birthTime}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{timeFormatted}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.dayOfWeek}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{dayOfWeek}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.lagna}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">
            {ascendantRashi} ({ascendantDegrees})
          </span>
        </div>
        {moon && (
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.moonSign}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">
              {NEPALI_RASHI[moon.rashi - 1]}
            </span>
          </div>
        )}
        {sun && (
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.sunSign}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">
              {NEPALI_RASHI[sun.rashi - 1]}
            </span>
          </div>
        )}
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.birthNakshatra}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">
            {data.nakshatra.nameNepali} ({toDevanagari(data.nakshatra.pada)})
          </span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.suggestedSyllable}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-600 text-lg">{suggestedSyllable}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.tithi}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">
            {data.tithi.paksha} - {toDevanagari(data.tithi.tithiNumber)}
          </span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.yoga}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{data.yoga}</span>
        </div>
        <div className="flex gap-1 items-start">
          <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.karana}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100">{data.karana}</span>
        </div>
      </div>

      {/* Calculation details */}
      <div className="mt-6 pt-4 border-t-2 border-amber-200 dark:border-amber-700">
        <h3 className="text-lg font-bold text-blue-400 dark:text-blue-400 mb-2">{NEPALI_LABELS.calculationDetails}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.backend}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.calculationMeta.backend}</span>
          </div>
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.ayanamsa}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.calculationMeta.ayanamsa}</span>
          </div>
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.houseSystem}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.calculationMeta.houseSystem}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BirthDetailsCard;
