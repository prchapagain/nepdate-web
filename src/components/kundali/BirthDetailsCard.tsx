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
  title?: string;
  titleClassName?: string;
}

export const BirthDetailsCard: React.FC<BirthDetailsCardProps> = ({ data, title, titleClassName }) => {
  const formatShortTime = (isoString: string | undefined): string => {
    if (!isoString) return '?';
    try {
      const date = new Date(isoString);
      const localDate = new Date(date.getTime() + (data.birthDetails.offset * 60 * 60 * 1000));
      return localDate.toLocaleTimeString('ne-NP', { hour: 'numeric', minute: '2-digit', hour12: true }).replace('AM', 'बिहान').replace('PM', 'बेलुका');
    } catch {
      return '?';
    }
  };

  const getLocalDate = (isoString: string) => {
    const d = new Date(isoString);
    // Apply offset to get local time from UTC
    return new Date(d.getTime() + data.birthDetails.offset * 3600 * 1000);
  };

  const birthDateLocal = getLocalDate(data.birthDetails.datetime);
  const birthDateMidnight = new Date(birthDateLocal.getFullYear(), birthDateLocal.getMonth(), birthDateLocal.getDate());

  const isPreviousDay = (elementIsoString: string | undefined): boolean => {
    if (!elementIsoString) return false;

    const elementDateLocal = getLocalDate(elementIsoString);
    const elementDateMidnight = new Date(elementDateLocal.getFullYear(), elementDateLocal.getMonth(), elementDateLocal.getDate());

    return elementDateMidnight.getTime() < birthDateMidnight.getTime();
  };

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isBirthDateToday = birthDateMidnight.getTime() === todayMidnight.getTime();

  const previousDayLabel = isBirthDateToday ? NEPALI_LABELS.yesterdayFrom : NEPALI_LABELS.previousDayFrom;


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
      <h3 className={`text-xl font-bold mb-4 text-center ${titleClassName || 'text-blue-400 dark:text-blue-400'}`}>{title || NEPALI_LABELS.birthDetails}</h3>

      {/* Birth Details Section */}
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
      </div>

      {/* Daily Timings */}
      <div className="mt-6 pt-4 border-t-2 border-amber-200 dark:border-amber-700">
        <h3 className="text-lg font-bold text-blue-400 dark:text-blue-400 mb-2">{NEPALI_LABELS.dailyTimings}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.sunrise}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{toDevanagari(data.sunRise)}</span>
          </div>
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.sunset}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{toDevanagari(data.sunSet)}</span>
          </div>
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.moonrise}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{toDevanagari(data.moonRise)}</span>
          </div>
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.moonset}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{toDevanagari(data.moonSet)}</span>
          </div>
        </div>
      </div>

      {/* Astrological Details Section */}
      <div className="mt-6 pt-4 border-t-2 border-amber-200 dark:border-amber-700">
        <h3 className="text-lg font-bold text-blue-400 dark:text-blue-400 mb-3">{NEPALI_LABELS.astrologicalDetails}</h3>
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 text-sm">

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.lagna}:</span>
          <span className="font-semibold text-stone-800 dark:text-stone-100 text-left">{ascendantRashi} ({ascendantDegrees})</span>

          {data.ashtaKoota.lagnesh && (
            <>
              <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.lagnesh}:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 text-left">{data.ashtaKoota.lagnesh}</span>
            </>
          )}
          {moon && (
            <>
              <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.moonSign}:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 text-left">{NEPALI_RASHI[moon.rashi - 1]}</span>
            </>
          )}
          {data.ashtaKoota.rashiLord && (
            <>
              <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.rashiLord}:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 text-left">{data.ashtaKoota.rashiLord}</span>
            </>
          )}
          {sun && (
            <>
              <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.sunSign}:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 text-left">{NEPALI_RASHI[sun.rashi - 1]}</span>
            </>
          )}

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.birthNakshatra}:</span>
          <div className="text-left">
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.nakshatra.nameNepali} ({toDevanagari(data.nakshatra.pada)})</span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isPreviousDay(data.nakshatra.start) && <span className="text-red-500 font-sans">{previousDayLabel} </span>}
              {formatShortTime(data.nakshatra.start)} देखि {formatShortTime(data.nakshatra.end)} सम्म
            </div>
          </div>

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.tithi}:</span>
          <div className="text-left">
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.tithi.paksha} - {toDevanagari(data.tithi.tithiNumber)}</span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isPreviousDay(data.tithi.start) && <span className="text-red-500 font-sans">{previousDayLabel} </span>}
              {formatShortTime(data.tithi.start)} देखि {formatShortTime(data.tithi.end)} सम्म
            </div>
          </div>

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.yoga}:</span>
          <div className="text-left">
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.yoga.name}</span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isPreviousDay(data.yoga.start) && <span className="text-red-500 font-sans">{previousDayLabel} </span>}
              {formatShortTime(data.yoga.start)} देखि {formatShortTime(data.yoga.end)} सम्म
            </div>
          </div>

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.karana}:</span>
          <div className="text-left">
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.karana.name}</span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isPreviousDay(data.karana.start) && <span className="text-red-500 font-sans">{previousDayLabel} </span>}
              {formatShortTime(data.karana.start)} देखि {formatShortTime(data.karana.end)} सम्म
            </div>
          </div>

          <span className="text-stone-500 dark:text-stone-400 text-right">{NEPALI_LABELS.suggestedSyllable}:</span>
          <span className="font-bold text-amber-600 dark:text-amber-600 text-lg text-left">{suggestedSyllable}</span>
        </div>
      </div>

      {/* Guna Milan Details Section */}
      {data.ashtaKoota && (
        <div className="mt-6 pt-4 border-t-2 border-amber-200 dark:border-amber-700">
          <h3 className="text-lg font-bold text-blue-400 dark:text-blue-400 mb-3">{NEPALI_LABELS.gunaMilanDetails}</h3>
          <div className="grid grid-cols-[auto_1fr_auto_1fr] sm:grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-x-4 gap-y-2 text-sm items-baseline">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.varna}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.varna}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.vasya}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.vasya}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.gana}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.gana}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.yoni}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.yoni}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.nadi}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.nadi}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.tatva}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.tatva}</span>
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.paya}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.ashtaKoota.paya}</span>
          </div>
        </div>
      )}


      {/* Calculation details */}
      <div className="mt-6 pt-4 border-t-2 border-amber-200 dark:border-amber-700">
        <h3 className="text-lg font-bold text-blue-400 dark:text-blue-400 mb-2">{NEPALI_LABELS.calculationDetails}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex gap-1 items-start">
            <span className="text-stone-500 dark:text-stone-400">{NEPALI_LABELS.backend}:</span>
            <span className="font-semibold text-stone-800 dark:text-stone-100">{data.calculationMeta.backend}: {data.calculationMeta.version}</span>
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