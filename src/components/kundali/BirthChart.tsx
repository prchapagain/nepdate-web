import React, { useMemo, useState } from 'react';
import type { PlanetInfo } from '../../types/types.ts';
import {
  NEPALI_NAKSHATRA_ABBREVIATIONS,
  NEPALI_PLANET_ABBREVIATIONS,
  NEPALI_PLANETS,
  NEPALI_RASHI,
  RASHI_LORDS,
} from '../../constants/constants';
import { toDevanagari } from '../../lib/utils/lib.ts';
import ClickableOverlay from './clickableOverlay';

type ChartPlanet = Pick<
  PlanetInfo,
  'planet' | 'rashi' | 'retrograde' | 'nakshatraPada' | 'nakshatra'
> & {
  degreesInSign?: number;
};

interface BirthChartProps {
  planets: ChartPlanet[];
  ascendantSign: number;
  ascendantDegrees?: number;
  ascendantNakshatra?: string;
  ascendantNakshatraPada?: number;
  chartType?: 'lagna' | 'chandra' | 'navamsha' | 'dashamsa' | 'hora' | 'saptamsa' | 'drekkana' | 'dwadamsha' | 'chaturthamsha' | 'shashtiamsha';
}

const RASHI_TO_CSS_ROTATION: Record<number, number> = {
  10: 0,
  11: -30,
  12: -60,
  1: -90,
  2: -120,
  3: -150,
  4: -180,
  5: -210,
  6: -240,
  7: -270,
  8: -300,
  9: -330,
};

function formatDegreesNepali(deg: number): string {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  return `${toDevanagari(d)}°${toDevanagari(m)}′`;
}

function formatPercent(deg: number): string {
  const percent = Math.round((deg / 30) * 100);
  return `${toDevanagari(percent)}%`;
}

export const BirthChart: React.FC<BirthChartProps> = ({
  planets,
  ascendantSign,
  ascendantDegrees,
  ascendantNakshatra,
  ascendantNakshatraPada,
  chartType = 'lagna',
}) => {
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);

  const moon = planets.find((p) => p.planet === 'MOON');
  const moonRashi = moon?.rashi ?? 1;

  const planetsByHouse = useMemo(() => {
    const map = new Map<number, ChartPlanet[]>();
    planets.forEach((p) => {
      const baseRashi = p.rashi;
      const houseNumber =
        chartType === 'chandra'
          ? ((baseRashi - moonRashi + 12) % 12) + 1
          : baseRashi;
      if (!map.has(houseNumber)) map.set(houseNumber, []);
      map.get(houseNumber)!.push(p);
    });
    return map;
  }, [planets, chartType, moonRashi]);

  return (
    <div className="birth-chart-wrapper text-stone-800 dark:text-stone-100">
      <div className="birth-chart">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
          const housePlanets = planetsByHouse.get(house) || [];
          const rotation = RASHI_TO_CSS_ROTATION[house];
          if (rotation === undefined) return null;

          const contentItems: React.ReactNode[] = [];

          // Ascendant marker
          if (
            chartType !== 'chandra' &&
            house === ascendantSign
          ) {
            contentItems.push(
              <div key="asc" className="planet-item ascendant">
                <span>{NEPALI_PLANET_ABBREVIATIONS['ASCENDANT']}</span>
                {ascendantDegrees !== undefined && (
                  <span className="planet-deg">{formatDegreesNepali(ascendantDegrees)}</span>
                )}
              </div>
            );
          }
          if (chartType === 'chandra' && house === 1) {
            contentItems.push(
              <div key="asc-chandra" className="planet-item ascendant">
                <span>{NEPALI_PLANET_ABBREVIATIONS['ASCENDANT']} (चन्द्र)</span>
              </div>
            );
          }

          // Planets
          housePlanets.forEach((p) => {
            contentItems.push(
              <div key={p.planet} className="planet-item">
                <span className={p.retrograde ? 'retrograde' : ''}>
                  {NEPALI_PLANET_ABBREVIATIONS[p.planet]}
                </span>
                {p.degreesInSign !== undefined && (
                  <span className="planet-deg">{formatDegreesNepali(p.degreesInSign)}</span>
                )}
              </div>
            );
          });

          return (
            <div
              key={house}
              className="petal"
              style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
            >
              <div className="rashi-number font-semibold">{toDevanagari(house)}</div>
              <div className="planets-container">{contentItems}</div>
            </div>
          );
        })}
        <div className="chart-center-dot text-2xl font-bold dark:text-red-400">ॐ</div>

        {/* Overlay */}
        <ClickableOverlay cx={200} cy={200} onSelect={(house) => setSelectedHouse(house)} />
      </div>

      {/* Popup modal */}
      {selectedHouse && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setSelectedHouse(null)}
        >
          <div
            className="bg-slate-200 dark:bg-gray-800 dark:text-stone-100 rounded-lg shadow-lg p-6 max-w-md w-full transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-2 text-blue-600 dark:text-blue-400">
              घर {toDevanagari(selectedHouse)} – {NEPALI_RASHI[selectedHouse - 1]} (स्वामी:{' '}
              {NEPALI_PLANETS[RASHI_LORDS[selectedHouse]]})
            </h3>

            {/* Ascendant marker */}
            {chartType !== 'chandra' &&
              selectedHouse === ascendantSign &&
              ascendantDegrees !== undefined && (
                <div className="mb-2">
                  <div className="flex justify-between text-stone-800 dark:text-stone-100">
                    <span>
                      {NEPALI_PLANET_ABBREVIATIONS['ASCENDANT']} (
                      {NEPALI_RASHI[ascendantSign - 1]})
                    </span>
                    <span>
                      {formatDegreesNepali(ascendantDegrees)} ({formatPercent(ascendantDegrees)})
                    </span>
                  </div>
                  {ascendantNakshatra && ascendantNakshatraPada && (
                    <div className="text-sm ml-2 text-gray-600 dark:text-gray-400">
                      {NEPALI_NAKSHATRA_ABBREVIATIONS[ascendantNakshatra]}
                      {toDevanagari(ascendantNakshatraPada)}
                    </div>
                  )}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${Math.round((ascendantDegrees / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

            {/* Chandra Lagna marker */}
            {chartType === 'chandra' && selectedHouse === 1 && moon && (
              <div className="mb-2">
                <div className="flex justify-between text-stone-800 dark:text-stone-100">
                  <span>{NEPALI_PLANET_ABBREVIATIONS['ASCENDANT']} (चन्द्र)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
                  <div
                    className="bg-green-500 h-2 rounded"
                    style={{
                      width: `${Math.round(((moon.degreesInSign || 0) / 30) * 100)}%`,
                    }}
                  />
                </div>
                {moon.nakshatra && moon.nakshatraPada && (
                  <div className="text-sm text-red-600 dark:text-red-400 font-semibold mt-1">
                    जनम नक्षत्र:{' '}
                    {NEPALI_NAKSHATRA_ABBREVIATIONS[moon.nakshatra]}
                    {toDevanagari(moon.nakshatraPada)}
                  </div>
                )}
              </div>
            )}

            {/* Planets */}
            {(planetsByHouse.get(selectedHouse) || []).map((p) => {
              if (chartType === 'chandra' && selectedHouse === 1 && p.planet === 'MOON') {
                return null;
              }

              const percent =
                p.degreesInSign !== undefined
                  ? Math.round((p.degreesInSign / 30) * 100)
                  : null;

              return (
                <div key={p.planet} className="mb-2">
                  <div className="flex justify-between text-stone-800 dark:text-stone-100">
                    <span className={p.retrograde ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
                      {NEPALI_PLANETS[p.planet]}
                    </span>
                    {p.degreesInSign !== undefined && (
                      <span>
                        {formatDegreesNepali(p.degreesInSign)} (
                        {formatPercent(p.degreesInSign)})
                      </span>
                    )}
                  </div>

                  {p.nakshatra && p.nakshatraPada && (
                    <div className="text-sm ml-2 text-gray-600 dark:text-gray-400">
                      {NEPALI_NAKSHATRA_ABBREVIATIONS[p.nakshatra]}
                      {toDevanagari(p.nakshatraPada)}
                    </div>
                  )}

                  {percent !== null && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded">
                      <div
                        className="bg-blue-500 h-2 rounded"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default BirthChart;