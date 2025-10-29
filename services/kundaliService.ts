import type { KundaliRequest, KundaliResponse, ServiceError, PlanetInfo, DashaInfo } from '../types/types';
import { NEPALI_NAKSHATRA, NEPALI_YOGA, NEPALI_KARANA } from '../src/constants/constants';
import { toJulianDay, fromJulianDay } from '../src/lib/lib';

// ---ASTROLOGICAL CALCULATION ENGINE ---
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// Helper to normalize an angle to the 0-360 range
function normalize(v: number): number {
  v = v % 360;
  return v < 0 ? v + 360 : v;
}

// Calculate Ayanamsa (Lahiri/Chitrapaksha)
function getAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
  const precession = (5029.0966 * T + 1.11161 * T * T) / 3600; // in degrees
  const base = 23.8531; // ≈ 23°51′00″
  return normalize(base + precession);
}


// Solve Kepler's Equation
function _solveKepler(M: number, e: number): number {
  const M_rad = (M % 360) * DEG2RAD;
  let E_rad = e < 0.8 ? M_rad : Math.PI;
  for (let i = 0; i < 15; i++) {
    const f = E_rad - e * Math.sin(E_rad) - M_rad;
    const fprime = 1 - e * Math.cos(E_rad);
    const deltaE = f / fprime;
    E_rad -= deltaE;
    if (Math.abs(deltaE) < 1e-12) break;
  }
  return (E_rad * RAD2DEG + 360) % 360;
}


// Get planet position
function getPlanetPosition(jd: number, planet: string): { longitude: number, latitude: number, speed: number } {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;

  // --- SUN ---
  if (planet === 'SUN') {
    const M = normalize(357.52911 + 35999.05029 * T - 0.0001537 * T2);
    const L = normalize(280.46646 + 36000.76983 * T + 0.0003032 * T2);
    const C = (1.914602 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * DEG2RAD)
      + (0.019993 - 0.000101 * T) * Math.sin(2 * M * DEG2RAD)
      + 0.000289 * Math.sin(3 * M * DEG2RAD);
    const trueLongitude = normalize(L + C);
    return { longitude: trueLongitude, latitude: 0, speed: 0.9856 };
  }

  // --- MOON ---
  if (planet === 'MOON') {
    const T4 = T3 * T;
    const L0 = normalize(218.3164477 + 481267.881268 * T
      - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
    const D = normalize(297.8501921 + 445267.111403 * T
      - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
    const M = normalize(357.5291092 + 35999.050291 * T
      - 0.0001536 * T2 + T3 / 24490000);
    const M1 = normalize(134.9633964 + 477198.867505 * T
      + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
    const F = normalize(93.2720950 + 483202.017441 * T
      - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
    const M1_rad = M1 * DEG2RAD;
    const M_rad = M * DEG2RAD;
    const D_rad = D * DEG2RAD;
    const F_rad = F * DEG2RAD;

    const lon = L0
      + 6.2886 * Math.sin(M1_rad)
      - 1.2740 * Math.sin(M1_rad - 2 * D_rad)
      + 0.6583 * Math.sin(2 * D_rad)
      + 0.2136 * Math.sin(2 * M1_rad)
      - 0.1851 * Math.sin(M_rad)
      - 0.1143 * Math.sin(2 * F_rad)
      + 0.0588 * Math.sin(2 * M1_rad - 2 * D_rad)
      + 0.0572 * Math.sin(M1_rad - 2 * D_rad - M_rad)
      + 0.0533 * Math.sin(M1_rad + 2 * D_rad)
      + 0.0458 * Math.sin(2 * D_rad - M_rad)
      + 0.0410 * Math.sin(M1_rad - M_rad)
      - 0.0347 * Math.sin(D_rad)
      - 0.0305 * Math.sin(M1_rad + M_rad)
      + 0.0153 * Math.sin(2 * M1_rad - 2 * F_rad)
      - 0.0125 * Math.sin(M1_rad - 2 * F_rad);

    return { longitude: normalize(lon), latitude: 0, speed: 13.1764 };
  }

  // --- RAHU (mean node) ---
  if (planet === 'RAHU') {
    const lon = normalize(125.04452 - 1934.136261 * T + 0.0020708 * T2 + T3 / 450000);
    return { longitude: lon, latitude: 0, speed: -0.05295 };
  }

  // --- Earth (for geocentric conversion) ---
  const M_earth = normalize(357.52911 + 35999.05029 * T);
  const L_earth = normalize(280.46646 + 36000.76983 * T);
  const C_earth = (1.914602 - 0.004817 * T) * Math.sin(M_earth * DEG2RAD)
    + 0.019993 * Math.sin(2 * M_earth * DEG2RAD);
  const sunTrueLon = normalize(L_earth + C_earth);
  const e_earth = 0.016708634 - 0.000042037 * T;
  const E_earth = _solveKepler(M_earth, e_earth);
  const R_earth = 1.000001018 * (1 - e_earth * Math.cos(E_earth * DEG2RAD));

  // --- Planet orbital elements (moderate precision, J2000.0) ---
  let a = 0, e = 0, L = 0, P = 0, speed = 0;
  switch (planet) {
    case 'MERCURY':
      a = 0.38709893;
      e = 0.20563069 + 0.00002527 * T;
      L = normalize(252.25084 + 149472.67411175 * T);
      P = 77.45645 + 0.16047689 * T;
      speed = 1.3833;
      break;
    case 'VENUS':
      a = 0.72333199;
      e = 0.00677323 - 0.00004938 * T;
      L = normalize(181.97973 + 58517.81538729 * T);
      P = 131.53298 - 0.0048646 * T;
      speed = 1.2;
      break;
    case 'MARS':
      a = 1.52366231;
      e = 0.09341233 + 0.00011902 * T;
      L = normalize(355.45332 + 19140.30268499 * T);
      P = 336.04084 + 0.4439016 * T;
      speed = 0.5240;
      break;
    case 'JUPITER':
      a = 5.20336301;
      e = 0.04839266 - 0.00012880 * T;
      L = normalize(34.40438 + 3034.74612775 * T);
      P = 14.33121 + 0.2155525 * T;
      speed = 0.0833;
      break;
    case 'SATURN':
      a = 9.53707032;
      e = 0.05415060 - 0.00036762 * T;
      L = normalize(49.94432 + 1222.49362201 * T);
      P = 93.05724 + 0.5665415 * T;
      speed = 0.0333;
      break;
    default:
      return { longitude: 0, latitude: 0, speed: 0 };
  }

  // --- Solve Kepler for planet ---
  const M_planet = normalize(L - P);
  const E_planet = _solveKepler(M_planet, e);
  const xh = a * (Math.cos(E_planet * DEG2RAD) - e);
  const yh = a * Math.sqrt(1 - e * e) * Math.sin(E_planet * DEG2RAD);
  const v = Math.atan2(yh, xh) * RAD2DEG;
  const r = Math.sqrt(xh * xh + yh * yh);
  const lon_h = normalize(v + P);

  // --- Geocentric conversion ---
  const earth_lon = normalize(sunTrueLon - 180);
  const xg = r * Math.cos(lon_h * DEG2RAD) - R_earth * Math.cos(earth_lon * DEG2RAD);
  const yg = r * Math.sin(lon_h * DEG2RAD) - R_earth * Math.sin(earth_lon * DEG2RAD);
  const geo_lon = normalize(Math.atan2(yg, xg) * RAD2DEG);

  return { longitude: geo_lon, latitude: 0, speed };
}



// --- Navamsa Rashi calculation ---
function getNavamsaRashi(siderealLongitude: number): number {
  const lon = ((siderealLongitude % 360) + 360) % 360; // normalize 0–360
  const signIndex = Math.floor(lon / 30);              // 0 = Aries
  const lonInSign = lon % 30;
  const NAVAMSA_SIZE = 30 / 9;                         // 3°20′ = 3.333...
  const navamsaIndexInSign = Math.floor(lonInSign / NAVAMSA_SIZE);

  const rashiSignOneBased = signIndex + 1;
  let startSignIndex: number;

  if ([1, 4, 7, 10].includes(rashiSignOneBased)) {
    // Movable signs
    startSignIndex = signIndex;
  } else if ([2, 5, 8, 11].includes(rashiSignOneBased)) {
    // Fixed signs
    startSignIndex = (signIndex + 8) % 12;
  } else {
    // Dual signs
    startSignIndex = (signIndex + 4) % 12;
  }

  const finalNavamsaSignIndex = (startSignIndex + navamsaIndexInSign) % 12;
  return finalNavamsaSignIndex + 1; // 1 = Aries ... 12 = Pisces
}


// --- Retrograde check (वक्री) ---
function isPlanetRetrograde(jd: number, planet: string): boolean {
  const upper = planet.toUpperCase();

  // Always direct
  if (upper === 'SUN' || upper === 'MOON') return false;

  // Always retrograde (nodes)
  if (upper === 'RAHU' || upper === 'KETU') return true;

  // For Mercury, Venus, Mars, Jupiter, Saturn → compute
  const jd1 = jd - 0.5;
  const jd2 = jd + 0.5;
  const pos1 = getPlanetPosition(jd1, upper);
  const pos2 = getPlanetPosition(jd2, upper);

  // Delta longitude, normalized to -180..+180
  let delta = pos2.longitude - pos1.longitude;
  delta = ((delta + 540) % 360) - 180;

  // Negative = retrograde
  return delta < 0;
}


// ---SAFE DATE FORMATTING HELPER ---
function safeFormatDateISO(date: Date): string {
  if (isNaN(date.getTime())) {
    console.error("Attempted to format an invalid date");
    return "Invalid Date"; // Placeholder for invalid dates
  }

  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = date.getUTCMilliseconds().toString().padStart(3, '0');

  let yearString: string;
  if (year < 0) {
    yearString = '-' + Math.abs(year).toString().padStart(6, '0');
  } else if (year >= 0 && year <= 9999) {
    yearString = year.toString().padStart(4, '0');
  } else {
    yearString = '+' + year.toString().padStart(6, '0');
  }

  return `${yearString}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
}

// --- Parse and calculate Julian Day ---
function parseDateTimeAndCalculateJulianDay(request: KundaliRequest): { jd: number, birthDate: Date } {
  const [datePart, timePart] = request.datetime.split('T');
  const [yearStr, monthStr, dayStr] = datePart.split('-');
  const [hourStr, minuteStr, secondStr] = timePart.split(':');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const second = parseInt(secondStr, 10);
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
    throw new Error('Invalid birth date/time format.');
  }

  const offset = request.offset;
  const jdLocalMidnight = toJulianDay(year, month, day); // Assumes correct 1-based month input
  const localTimeFraction = (hour / 24.0) + (minute / 1440.0) + (second / 86400.0);
  const offsetFraction = offset / 24.0;
  const jd = jdLocalMidnight + localTimeFraction - offsetFraction;

  if (isNaN(jd)) {
    throw new Error(`Julian Day calculation resulted in NaN for input: ${request.datetime}`);
  }
  const birthDate = fromJulianDay(jd);

  if (isNaN(birthDate.getTime())) {
    console.error(`fromJulianDay(${jd}) resulted in an invalid Date object.`);
    throw new Error(`Could not create valid Date object from Julian Day ${jd}. Input: ${request.datetime}`);
  }

  return { jd, birthDate };
}

// --- Calculate Planets ---
function calculatePlanets(jd: number, ayanamsa: number): PlanetInfo[] {
  const NAKSHATRA_SIZE = 360 / 27;   // 13°20′
  const PADA_SIZE = 360 / 108;       // 3°20′

  const planets: PlanetInfo[] = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU'].map(p => {
    const tropicalPos = getPlanetPosition(jd, p);
    if (isNaN(tropicalPos.longitude)) {
      throw new Error(`Astronomical calculation failed (NaN longitude) for ${p} at JD ${jd}. Date might be too extreme.`);
    }

    const eclipticLongitude = normalize(tropicalPos.longitude - ayanamsa);
    const rashi = Math.floor(eclipticLongitude / 30) + 1;
    const degreesInSign = eclipticLongitude % 30;

    const nakshatraIndex = Math.floor(eclipticLongitude / NAKSHATRA_SIZE);
    const nakshatra = NEPALI_NAKSHATRA[Math.max(0, Math.min(nakshatraIndex, NEPALI_NAKSHATRA.length - 1))];
    const nakshatraPada = Math.floor((eclipticLongitude % NAKSHATRA_SIZE) / PADA_SIZE) + 1;

    return {
      planet: p,
      eclipticLongitude,
      rashi,
      degreesInSign,
      eclipticLatitude: tropicalPos.latitude,
      speedLon: tropicalPos.speed,
      retrograde: isPlanetRetrograde(jd, p),
      nakshatra,
      nakshatraPada,
    };
  });

  // Ketu (always opposite Rahu)
  const rahuLon = planets.find(p => p.planet === 'RAHU')!.eclipticLongitude;
  const ketuLon = normalize(rahuLon + 180);
  const ketuNakshatraIndex = Math.floor(ketuLon / NAKSHATRA_SIZE);
  const ketuNakshatra = NEPALI_NAKSHATRA[Math.max(0, Math.min(ketuNakshatraIndex, NEPALI_NAKSHATRA.length - 1))];
  const ketuNakshatraPada = Math.floor((ketuLon % NAKSHATRA_SIZE) / PADA_SIZE) + 1;

  planets.push({
    planet: 'KETU',
    eclipticLongitude: ketuLon,
    rashi: Math.floor(ketuLon / 30) + 1,
    degreesInSign: ketuLon % 30,
    eclipticLatitude: 0,
    speedLon: 0,
    retrograde: true,
    nakshatra: ketuNakshatra,
    nakshatraPada: ketuNakshatraPada,
  });

  return planets;
}


// --- Calculate Ascendant ---
function calculateAscendant(
  jd: number,
  request: { latitude: number; longitude: number },
  ayanamsa: number
): {
  ascendantLon: number;
  ascendantSign: number;
  ascendantDegrees: number;
} {
  const T = (jd - 2451545.0) / 36525;

  // Greenwich Mean Sidereal Time (Meeus, ch. 12)
  const gmst0 =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  const gmst = normalize(gmst0);
  const lon = ((request.longitude % 360) + 540) % 360 - 180;
  const lmst = normalize(gmst + lon);

  // Higher-precision mean obliquity (IAU 2006, arcseconds)
  const U = T / 100;
  const eps0 =
    84381.406 -
    4680.93 * U -
    1.55 * U * U +
    1999.25 * U * U * U -
    51.38 * U * U * U * U -
    249.67 * U * U * U * U * U -
    39.05 * U * U * U * U * U * U +
    7.12 * U * U * U * U * U * U * U +
    27.87 * U * U * U * U * U * U * U * U +
    5.79 * U * U * U * U * U * U * U * U * U +
    2.45 * U * U * U * U * U * U * U * U * U * U;
  const obliquity = eps0 / 3600; // convert arcseconds → degrees
  const latRad = request.latitude * DEG2RAD;
  const asc_num = -Math.cos(lmst * DEG2RAD);
  const asc_den =
    Math.sin(lmst * DEG2RAD) * Math.cos(obliquity * DEG2RAD) +
    Math.sin(obliquity * DEG2RAD) * Math.tan(latRad);

  let ascendantTropicalLon = normalize(
    RAD2DEG * Math.atan2(asc_num, asc_den)
  );

  if (isNaN(ascendantTropicalLon)) {
    throw new Error(`Ascendant calculation resulted in NaN for JD ${jd}.`);
  }

  // Convert to sidereal
  const ascendantLon = normalize(ascendantTropicalLon - ayanamsa);
  const ascendantSign = Math.floor(ascendantLon / 30) + 1;
  const ascendantDegrees = ascendantLon % 30;

  return { ascendantLon, ascendantSign, ascendantDegrees };
}


// --- Calculate Panchanga(we are not using these from main application) ---
function calculatePanchanga(planets: PlanetInfo[], jd: number): {
  tithiNumber: number,
  paksha: string,
  yogaIndex: number,
  karanaIndex: number, // 0–10, traditional karaṇa index
  birthNakshatraIndex: number,
  moonNakshatraPada: number
} {
  const sunLon = normalize(planets.find(p => p.planet === 'SUN')!.eclipticLongitude);
  const moonLon = normalize(planets.find(p => p.planet === 'MOON')!.eclipticLongitude);

  if (isNaN(moonLon) || isNaN(sunLon)) {
    throw new Error(`Sun or Moon longitude is NaN for JD ${jd}. Cannot calculate Panchanga/Dasha.`);
  }

  // --- Tithi ---
  const tithiDiff = normalize(moonLon - sunLon);
  let tithiNumber = Math.floor(tithiDiff / 12) + 1; // 1–30
  const paksha = tithiNumber > 15 ? "कृष्ण" : "शुक्ल";
  if (tithiNumber > 15) tithiNumber -= 15; // reduce to 1–15

  // --- Yoga ---
  const yogaIndex = Math.floor(normalize(sunLon + moonLon) / (360 / 27)); // 0–26

  // --- Karana ---
  const rawKaranaSlot = Math.floor(tithiDiff / 6); // 0–59
  let karanaIndex: number;
  if (rawKaranaSlot === 0) {
    karanaIndex = 0; // Kimstughna
  } else if (rawKaranaSlot >= 1 && rawKaranaSlot <= 56) {
    karanaIndex = 1 + ((rawKaranaSlot - 1) % 7); // 1–7 = cara cycle
  } else if (rawKaranaSlot === 57) {
    karanaIndex = 8; // Sakuni
  } else if (rawKaranaSlot === 58) {
    karanaIndex = 9; // Chatushpada
  } else if (rawKaranaSlot === 59) {
    karanaIndex = 10; // Naga
  } else {
    throw new Error(`Invalid karaṇa slot ${rawKaranaSlot}`);
  }

  // --- Nakshatra ---
  const birthNakshatraIndex = Math.floor(moonLon / (360 / 27)); // 0–26
  if (birthNakshatraIndex < 0 || birthNakshatraIndex >= NEPALI_NAKSHATRA.length) {
    throw new Error(`Birth Nakshatra index ${birthNakshatraIndex} out of bounds (MoonLon: ${moonLon}).`);
  }

  // --- Pada ---
  const moonNakshatraPada = Math.floor((moonLon % (360 / 27)) / (360 / 108)) + 1; // 1–4

  return {
    tithiNumber,
    paksha,
    yogaIndex,
    karanaIndex, // 0–10
    birthNakshatraIndex,
    moonNakshatraPada
  };
}


// --- Calculate Dasha ---
function calculateDasha(birthDate: Date, planets: PlanetInfo[],
  panchanga: { birthNakshatraIndex: number, moonNakshatraPada: number }): DashaInfo[] {
  const dashaLords = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  const dashaYearMap: { [key: string]: number } = {};
  dashaLords.forEach((lord, index) => { dashaYearMap[lord] = dashaYears[index]; });
  const nakshatraLordIndex = panchanga.birthNakshatraIndex % 9;
  const moonLon = normalize(planets.find(p => p.planet === 'MOON')!.eclipticLongitude);
  const moonTravelledInNakshatra = moonLon % (360 / 27);
  const nakshatraTotalSpan = 360 / 27;
  let dashaBalanceYears = (1 - (moonTravelledInNakshatra / nakshatraTotalSpan)) * dashaYears[nakshatraLordIndex];
  if (isNaN(dashaBalanceYears)) {
    throw new Error(`Dasha balance calculation resulted in NaN (MoonLon: ${planets.find(p => p.planet === 'MOON')!.eclipticLongitude}).`);
  }
  const dashaSequence: DashaInfo[] = [];
  const msPerDay = 86400000;
  const daysInYear = 365.24219;
  const msPerYear = daysInYear * msPerDay;

  let currentStartTimeMs = birthDate.getTime();
  const firstDashaBalanceMs = dashaBalanceYears * msPerYear;
  const firstDashaEndTimeMs = currentStartTimeMs + Math.round(firstDashaBalanceMs);
  const firstStartDate = new Date(currentStartTimeMs);
  const firstEndDate = new Date(firstDashaEndTimeMs);
  if (isNaN(firstStartDate.getTime()) || isNaN(firstEndDate.getTime())) {
    console.error(`First Dasha calculation failed. Start: ${currentStartTimeMs}, Balance ms: ${firstDashaBalanceMs}`);
    throw new Error(`Invalid date calculated for first Dasha period: ${dashaLords[nakshatraLordIndex]}`);
  }

  dashaSequence.push({
    planet: dashaLords[nakshatraLordIndex],
    start: safeFormatDateISO(firstStartDate),
    end: safeFormatDateISO(firstEndDate),
  });

  currentStartTimeMs = firstDashaEndTimeMs;
  let currentLordIndex = nakshatraLordIndex;
  for (let i = 0; i < dashaLords.length - 1; i++) {
    currentLordIndex = (currentLordIndex + 1) % 9;
    const nextLord = dashaLords[currentLordIndex];
    const nextDurationYears = dashaYears[currentLordIndex];
    const nextDurationMs = nextDurationYears * msPerYear;
    const nextEndTimeMs = currentStartTimeMs + Math.round(nextDurationMs);
    const nextStartDate = new Date(currentStartTimeMs);
    const nextEndDate = new Date(nextEndTimeMs);

    if (isNaN(nextStartDate.getTime()) || isNaN(nextEndDate.getTime())) {
      console.error(`Skipping invalid Dasha period: ${nextLord}. Start ms: ${currentStartTimeMs}, End ms: ${nextEndTimeMs}`);
      currentStartTimeMs = nextEndTimeMs; // Still advance time
      continue; // Skip this period
    }

    dashaSequence.push({
      planet: nextLord,
      start: safeFormatDateISO(nextStartDate),
      end: safeFormatDateISO(nextEndDate),
    });
    currentStartTimeMs = nextEndTimeMs;
  }

  const populatedDashaSequence = dashaSequence.map(mahaDasha => {
    let mahaDashaStartMs: number, mahaDashaEndMs: number;
    try {
      // Date constructor handles ISO extended format from safeFormatDateISO
      mahaDashaStartMs = new Date(mahaDasha.start).getTime();
      mahaDashaEndMs = new Date(mahaDasha.end).getTime();
    } catch (parseError) {
      console.error("Error parsing Maha Dasha date string:", mahaDasha.start, mahaDasha.end, parseError);
      mahaDashaStartMs = NaN;
      mahaDashaEndMs = NaN;
    }

    if (isNaN(mahaDashaStartMs) || isNaN(mahaDashaEndMs)) {
      console.error("Skipping Antardashas due to invalid Maha Dasha dates:", mahaDasha);
      return { ...mahaDasha, subDashas: [] }; // Return with empty subdashas
    }

    const totalMahadashaMs = mahaDashaEndMs - mahaDashaStartMs;
    const subDashas: DashaInfo[] = [];
    let subDashaStartMs = mahaDashaStartMs;
    const mahaDashaLord = mahaDasha.planet;
    const mahaDashaLordIndex = dashaLords.indexOf(mahaDashaLord);

    for (let i = 0; i < dashaLords.length; i++) {
      const antarDashaLord = dashaLords[(mahaDashaLordIndex + i) % dashaLords.length];
      const antarDashaDurationRatio = dashaYearMap[antarDashaLord] / 120;
      const antarDashaMs = totalMahadashaMs * antarDashaDurationRatio;
      const subDashaEndMs = subDashaStartMs + Math.round(antarDashaMs);
      // Cap end date to Mahadasha end date precisely
      const cappedSubDashaEndMs = Math.min(subDashaEndMs, mahaDashaEndMs);

      // Ensure we don't start past the end date
      if (subDashaStartMs >= mahaDashaEndMs) break;

      const subStartDate = new Date(subDashaStartMs);
      const subEndDate = new Date(cappedSubDashaEndMs);

      if (isNaN(subStartDate.getTime()) || isNaN(subEndDate.getTime())) {
        console.error(`Skipping invalid Antar Dasha: ${antarDashaLord} within ${mahaDashaLord}. Start ms: ${subDashaStartMs}, End ms: ${cappedSubDashaEndMs}`);
        subDashaStartMs = cappedSubDashaEndMs; // Advance time
        continue; // Skip this period
      }

      subDashas.push({
        planet: antarDashaLord,
        start: safeFormatDateISO(subStartDate),
        end: safeFormatDateISO(subEndDate),
      });
      subDashaStartMs = cappedSubDashaEndMs;
    }
    // Ensure the result is valid
    return { ...mahaDasha, subDashas };
  });

  return populatedDashaSequence.filter(d => d && d.start !== "Invalid Date" && d.end !== "Invalid Date") as DashaInfo[];
}

// --- Calculate Navamsa ---
function calculateNavamsa(
  ascendantLon: number,
  planets: PlanetInfo[]
): {
  d9Ascendant: { sign: number; degreesInSign: number },
  navamsaPlanets: {
    planet: string;
    sign: number;
    degreesInSign: number;
    retrograde: boolean;
    nakshatra: string;
    nakshatraPada: number;
  }[]
} {
  function getNavamsaPosition(lon: number) {
    const normLon = ((lon % 360) + 360) % 360;
    const sign = getNavamsaRashi(normLon);
    const lonInSign = normLon % 30;
    const navamsaSize = 30 / 9; // 3°20'
    const degreesInSign = (lonInSign % navamsaSize) * 9;
    return { sign, degreesInSign };
  }

  const d9Ascendant = getNavamsaPosition(ascendantLon);

  const NAKSHATRA_SIZE = 360 / 27; // 13°20'
  const PADA_SIZE = 360 / 108;     // 3°20'

  const navamsaPlanets = planets.map(p => {
    const pos = getNavamsaPosition(p.eclipticLongitude);
    const nakshatraPada = Math.floor((p.eclipticLongitude % NAKSHATRA_SIZE) / PADA_SIZE) + 1;
    return {
      planet: p.planet,
      sign: pos.sign,
      degreesInSign: pos.degreesInSign,
      retrograde: p.retrograde,
      nakshatra: p.nakshatra,
      nakshatraPada,
    };
  });

  return { d9Ascendant, navamsaPlanets };
}

// --- Dashamsa Rashi calculation (D10) ---
function getDashamsaRashi(siderealLongitude: number): number {
  const lon = ((siderealLongitude % 360) + 360) % 360; // normalize 0–360
  const signIndex = Math.floor(lon / 30);              // 0 = Aries
  const lonInSign = lon % 30;
  const DASHAMSA_SIZE = 30 / 10;                       // 3° each
  const dashamsaIndexInSign = Math.floor(lonInSign / DASHAMSA_SIZE);

  const rashiSignOneBased = signIndex + 1;
  let startSignIndex: number;

  if ([1, 4, 7, 10].includes(rashiSignOneBased)) {
    // Movable signs → start from same sign
    startSignIndex = signIndex;
  } else if ([2, 5, 8, 11].includes(rashiSignOneBased)) {
    // Fixed signs → start from 9th sign
    startSignIndex = (signIndex + 8) % 12;
  } else {
    // Dual signs → start from 5th sign
    startSignIndex = (signIndex + 4) % 12;
  }

  const finalDashamsaSignIndex = (startSignIndex + dashamsaIndexInSign) % 12;
  return finalDashamsaSignIndex + 1; // 1 = Aries ... 12 = Pisces
}

export function calculateDashamsa(
  ascendantLon: number,
  planets: PlanetInfo[]
): {
  d10Ascendant: { sign: number; degreesInSign: number },
  dashamsaPlanets: {
    planet: string;
    sign: number;
    degreesInSign: number;
    retrograde: boolean;
    nakshatra: string;
    nakshatraPada: number;
  }[]
} {
  function getDashamsaPosition(lon: number) {
    const normLon = ((lon % 360) + 360) % 360;
    const sign = getDashamsaRashi(normLon);
    const lonInSign = normLon % 30;
    const dashamsaSize = 30 / 10; // 3°
    const degreesInSign = (lonInSign % dashamsaSize) * 10;
    return { sign, degreesInSign };
  }

  const d10Ascendant = getDashamsaPosition(ascendantLon);

  const NAKSHATRA_SIZE = 360 / 27;
  const PADA_SIZE = 360 / 108;

  const dashamsaPlanets = planets.map(p => {
    const pos = getDashamsaPosition(p.eclipticLongitude);
    const nakshatraPada = Math.floor((p.eclipticLongitude % NAKSHATRA_SIZE) / PADA_SIZE) + 1;
    return {
      planet: p.planet,
      sign: pos.sign,
      degreesInSign: pos.degreesInSign,
      retrograde: p.retrograde,
      nakshatra: p.nakshatra,
      nakshatraPada,
    };
  });

  return { d10Ascendant, dashamsaPlanets };
}

// --- Hora Rashi calculation (D2) ---
function getHoraRashi(siderealLongitude: number): number {
  const lon = ((siderealLongitude % 360) + 360) % 360;
  const signIndex = Math.floor(lon / 30); // 0 = Aries
  const lonInSign = lon % 30;
  const rashiSignOneBased = signIndex + 1;

  if (rashiSignOneBased % 2 === 1) {
    // Odd signs → 0–15° = Leo, 15–30° = Cancer
    return lonInSign < 15 ? 5 : 4;
  } else {
    // Even signs → 0–15° = Cancer, 15–30° = Leo
    return lonInSign < 15 ? 4 : 5;
  }
}

export function calculateHora(
  ascendantLon: number,
  planets: PlanetInfo[]
): {
  d2Ascendant: { sign: number; degreesInSign: number },
  horaPlanets: {
    planet: string;
    sign: number;
    degreesInSign: number;
    retrograde: boolean;
    nakshatra: string;
    nakshatraPada: number;
  }[]
} {
  function getHoraPosition(lon: number) {
    const normLon = ((lon % 360) + 360) % 360;
    const sign = getHoraRashi(normLon);
    const lonInSign = normLon % 30;
    return { sign, degreesInSign: lonInSign };
  }

  const d2Ascendant = getHoraPosition(ascendantLon);

  const NAKSHATRA_SIZE = 360 / 27;
  const PADA_SIZE = 360 / 108;

  const horaPlanets = planets.map(p => {
    const pos = getHoraPosition(p.eclipticLongitude);
    const nakshatraPada = Math.floor((p.eclipticLongitude % NAKSHATRA_SIZE) / PADA_SIZE) + 1;
    return {
      planet: p.planet,
      sign: pos.sign,
      degreesInSign: pos.degreesInSign,
      retrograde: p.retrograde,
      nakshatra: p.nakshatra,
      nakshatraPada,
    };
  });

  return { d2Ascendant, horaPlanets };
}


// --- Saptamsa Rashi calculation (D7) ---
function getSaptamsaRashi(siderealLongitude: number): number {
  const lon = ((siderealLongitude % 360) + 360) % 360;
  const signIndex = Math.floor(lon / 30);
  const lonInSign = lon % 30;
  const SAPTAMSA_SIZE = 30 / 7;
  const saptamsaIndexInSign = Math.floor(lonInSign / SAPTAMSA_SIZE);

  const rashiSignOneBased = signIndex + 1;
  let startSignIndex: number;

  if (rashiSignOneBased % 2 === 1) {
    // Odd signs → start from same sign
    startSignIndex = signIndex;
  } else {
    // Even signs → start from 7th sign
    startSignIndex = (signIndex + 6) % 12;
  }

  return ((startSignIndex + saptamsaIndexInSign) % 12) + 1;
}

export function calculateSaptamsa(
  ascendantLon: number,
  planets: PlanetInfo[]
): {
  d7Ascendant: { sign: number; degreesInSign: number },
  saptamsaPlanets: {
    planet: string;
    sign: number;
    degreesInSign: number;
    retrograde: boolean;
    nakshatra: string;
    nakshatraPada: number;
  }[]
} {
  function getSaptamsaPosition(lon: number) {
    const normLon = ((lon % 360) + 360) % 360;
    const sign = getSaptamsaRashi(normLon);
    const lonInSign = normLon % 30;
    const saptamsaSize = 30 / 7;
    const degreesInSign = (lonInSign % saptamsaSize) * (30 / saptamsaSize);
    return { sign, degreesInSign };
  }

  const d7Ascendant = getSaptamsaPosition(ascendantLon);

  const NAKSHATRA_SIZE = 360 / 27;
  const PADA_SIZE = 360 / 108;

  const saptamsaPlanets = planets.map(p => {
    const pos = getSaptamsaPosition(p.eclipticLongitude);
    const nakshatraPada = Math.floor((p.eclipticLongitude % NAKSHATRA_SIZE) / PADA_SIZE) + 1;
    return {
      planet: p.planet,
      sign: pos.sign,
      degreesInSign: pos.degreesInSign,
      retrograde: p.retrograde,
      nakshatra: p.nakshatra,
      nakshatraPada,
    };
  });

  return { d7Ascendant, saptamsaPlanets };
}



// --- generateKundaliData ---
function generateKundaliData(request: KundaliRequest): KundaliResponse {
  const { jd, birthDate } = parseDateTimeAndCalculateJulianDay(request);
  const ayanamsa = getAyanamsa(jd);

  const planets = calculatePlanets(jd, ayanamsa);
  const { ascendantLon, ascendantSign, ascendantDegrees } = calculateAscendant(jd, request, ayanamsa);
  const panchanga = calculatePanchanga(planets, jd);
  const dashaSequence = calculateDasha(birthDate, planets, panchanga);

  const { d9Ascendant, navamsaPlanets } = calculateNavamsa(ascendantLon, planets);
  const { d10Ascendant, dashamsaPlanets } = calculateDashamsa(ascendantLon, planets);
  const { d2Ascendant, horaPlanets } = calculateHora(ascendantLon, planets);
  const { d7Ascendant, saptamsaPlanets } = calculateSaptamsa(ascendantLon, planets);

  // --- Final Return Object ---
  return {
    birthDetails: { ...request },
    calculationMeta: {
      backend: "Nepdate-AstroCalc V3",
      ayanamsa: "लाहिरी",
      zodiac: "नक्षत्रमा आधारित",
      houseSystem: "पूर्ण राशि आधारित गृह विभाजन",
      calculationUtc: new Date().toISOString()
    },
    planets: planets,
    ascendant: { longitude: ascendantLon, sign: ascendantSign, degreesInSign: ascendantDegrees },
    houses: Array.from({ length: 12 }, (_, i) => ({
      houseNumber: i + 1,
      cuspLongitude: normalize(ascendantLon + i * 30),
      sign: (((ascendantSign - 1 + i) % 12) + 1)
    })),
    nakshatra: {
      index: panchanga.birthNakshatraIndex,
      pada: panchanga.moonNakshatraPada,
      nameNepali: NEPALI_NAKSHATRA[panchanga.birthNakshatraIndex]
    },
    tithi: { tithiNumber: panchanga.tithiNumber, paksha: panchanga.paksha },
    yoga: NEPALI_YOGA[panchanga.yogaIndex],
    karana: NEPALI_KARANA[panchanga.karanaIndex % 11],
    divisionalCharts: [
      { name: 'Hora (D2)', ascendant: d2Ascendant, planets: horaPlanets },
      { name: 'Saptamsa (D7)', ascendant: d7Ascendant, planets: saptamsaPlanets },
      { name: 'Navamsa (D9)', ascendant: d9Ascendant, planets: navamsaPlanets },
      { name: 'Dashamsa (D10)', ascendant: d10Ascendant, planets: dashamsaPlanets }
    ],

    dashaSequence: dashaSequence,
  };
}


export const kundaliService = {
  getKundali: (requestData: KundaliRequest): Promise<KundaliResponse | ServiceError> => {
    console.log("Sending Kundali Request w/ Nepdate-AstroCalc:", requestData);

    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          try {
            const response = generateKundaliData(requestData);
            resolve(response);
          } catch (e) {
            console.error("Calculation failed:", e);
            if (e instanceof Error) {
              let message = `Calculation Error: ${e.message}.`;
              if (e.message.includes("longitude calculation resulted in NaN") || e.message.includes("Astronomical calculation failed")) {
                message += " Astronomical models may be inaccurate for this very old/future date.";
              } else if (e.message.includes("Dasha balance calculation resulted in NaN")) {
                message += " Could not determine Dasha start (invalid Moon position?).";
              } else if (e.message.includes("Invalid date calculated for")) {
                message += " Dasha period calculation failed (extreme date range?).";
              } else if (e.message.includes("Invalid time value") || e.message.includes("Could not create valid Date object")) {
                message += " The date entered might be too far in the past/future or invalid."
              } else {
                message += " Please check input date and time.";
              }
              resolve({ error: message });
            } else {
              resolve({ error: "An unknown error occurred during astrological calculations." });
            }
          }
        }, 50);
      });
    });
  },
};