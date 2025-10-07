import { EventsData } from '../data/eventsData';
import { getSunriseSunset, toDevanagari } from './bikram';
import { toBikramSambat } from './lib';

const YugaRotation = { 'star': 1582237828, 'sun': 4320000, 'moon': 57753336, 'Candrocca': 488203 };
const YugaCivilDays = 1577917828;
const KaliEpoch = 588465.5;
const PlanetApogee = { 'sun': 77 + 17 / 60 };
const PlanetCircumm = { 'sun': 13 + 50 / 60, 'moon': 31 + 50 / 60 };
const rad = 180 / Math.PI;

const tithiNamesList = ["प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी", "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी", "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा", "अमावस्या"];
const nakshatras = ["अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आर्द्रा", "पुनर्वसु", "पुष्य", "अश्लेषा", "मघा", "पूर्व फाल्गुनी", "उत्तर फाल्गुनी", "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा", "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा", "पूर्व भाद्रपद", "उत्तर भाद्रपद", "रेवती"];
const yogas = ["विष्कम्भ", "प्रीति", "आयुष्मान्", "सौभाग्य", "शोभन", "अतिगण्ड", "सुकर्म", "धृति", "शूल", "गण्ड", "वृद्धि", "ध्रुव", "व्याघात", "हर्षण", "वज्र", "सिद्धि", "व्यतिपात", "वरीयान्", "परिघ", "शिव", "सिद्ध", "साध्य", "शुभ", "शुक्ल", "ब्रह्म", "इन्द्र", "वैधृति"];
const karanas = ["किंस्तुघ्न", "बव", "बालव", "कौलव", "तैतिल", "गर", "वणिज", "विष्टि", "शकुनि", "चतुष्पाद", "नाग"];
const rashis = ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"];
const solarMonths = ["वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन", "चैत्र"];
const weekdays = ["आइतबार", "सोमबार", "मङ्गलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];

function zero360(x: number) { return x - Math.floor(x / 360) * 360; }
function sinDeg(deg: number) { return Math.sin(deg / rad); }
function arcsinDeg(x: number) { return Math.asin(x) * rad; }

function meanLongitude(ahar: number, rotation: number) { return zero360(rotation * ahar * 360 / YugaCivilDays); }
function mandaEquation(meanLong: number, apogee: number, circ: number) { return arcsinDeg(circ / 360 * sinDeg(meanLong - apogee)); }

function trueLongitudeSun(ahar: number) {
    const meanLong = meanLongitude(ahar, YugaRotation.sun);
    const manda = mandaEquation(meanLong, PlanetApogee.sun, PlanetCircumm.sun);
    return zero360(meanLong - manda);
}

function trueLongitudeMoon(ahar: number) {
    const meanLong = meanLongitude(ahar, YugaRotation.moon);
    const apogee = meanLongitude(ahar, YugaRotation.Candrocca) + 90;
    const manda = mandaEquation(meanLong, apogee, PlanetCircumm.moon);
    return zero360(meanLong - manda);
}

function getTithi(sunLong: number, moonLong: number) { return zero360(moonLong - sunLong) / 12; }

function toJulianDay(year: number, month: number, day: number) {
    let m = month + 1;
    let y = year;
    if (m <= 2) { y--; m += 12; }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function resolveTithiName(tithiDay: number, paksha: string) {
    if (paksha === "कृष्ण पक्ष" && tithiDay === 15) return tithiNamesList[15];
    if (paksha === "शुक्ल पक्ष" && tithiDay === 15) return tithiNamesList[14];
    return tithiNamesList[tithiDay - 1];
}

function findNewMoon(ahar: number): number {
    const getElongation = (a: number) => zero360(trueLongitudeMoon(a) - trueLongitudeSun(a));
    let guess = ahar;
    for (let i = 0; i < 10; i++) {
        const elong = getElongation(guess);
        if (elong < 5 || elong > 355) break;
        const correction = (elong < 180 ? -elong : 360 - elong) / 12.19;
        guess += correction;
    }
    let lo = guess - 2, hi = guess + 2;
    for (let j = 0; j < 30; j++) {
        const mid = (lo + hi) / 2;
        const em = getElongation(mid);
        if (em < 180) { hi = mid; } else { lo = mid; }
    }
    return (lo + hi) / 2;
}

function findPurnima(ahar: number): number {
    const getElongation = (a: number) => zero360(trueLongitudeMoon(a) - trueLongitudeSun(a));
    let guess = ahar;
    for (let i = 0; i < 10; i++) {
        const elong = getElongation(guess);
        if (Math.abs(elong - 180) < 5) break;
        const correction = (180 - elong) / 12.19;
        guess += correction;
    }
    let lo = guess - 2, hi = guess + 2;
    for (let j = 0; j < 30; j++) {
        const mid = (lo + hi) / 2;
        const em = getElongation(mid);
        if (em < 180) { lo = mid; } else { hi = mid; }
    }
    return (lo + hi) / 2;
}

function calculateAdhikaMasa(ahar: number): string {
    let lunarMonthStart = findNewMoon(ahar);
    if (lunarMonthStart > ahar) {
        lunarMonthStart = findNewMoon(lunarMonthStart - 29.530588853);
    }
    const lunarMonthEnd = findNewMoon(lunarMonthStart + 29.530588853);
    const sunLongStart = trueLongitudeSun(lunarMonthStart);
    const sunLongEnd = trueLongitudeSun(lunarMonthEnd);
    const startSign = Math.floor(sunLongStart / 30);
    let endSign = Math.floor(sunLongEnd / 30);

    if (endSign < startSign) endSign += 12;

    if (endSign === startSign) {
        return "अधिक " + solarMonths[startSign % 12];
    }
    if (endSign > startSign + 1) {
        const skippedSign = (startSign + 1) % 12;
        return "क्षय " + solarMonths[skippedSign];
    }
    return "छैन";
}

function getLunarMonthNameWithAdhik(ahar: number): { monthName: string; isAdhika: boolean } {
    let lunarMonthStart = findNewMoon(ahar);
    if (lunarMonthStart > ahar) {
        lunarMonthStart = findNewMoon(lunarMonthStart - 29.53);
    }
    const sunLongAtAmavasya = trueLongitudeSun(lunarMonthStart);
    const nameSign = Math.floor(sunLongAtAmavasya / 30);
    const monthName = solarMonths[nameSign];
    const adhikaStatus = calculateAdhikaMasa(ahar);
    const isAdhika = adhikaStatus.startsWith("अधिक");

    return {
        monthName: monthName,
        isAdhika: isAdhika
    };
}

export function _getPanchangaBasics(date: Date) {
    const jd = toJulianDay(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const ahar = jd - KaliEpoch + 0.25 + ((85.3240 / 15 - 5.75) / 24);
    const sunLong = trueLongitudeSun(ahar);
    const moonLong = trueLongitudeMoon(ahar);
    const tithiVal = getTithi(sunLong, moonLong);
    const tithiNum = Math.floor(tithiVal) + 1;
    const paksha = tithiNum <= 15 ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
    const tithiDay = tithiNum > 15 ? tithiNum - 15 : tithiNum;
    const tithiName = resolveTithiName(tithiDay, paksha);
    const lunarMonthInfo = getLunarMonthNameWithAdhik(ahar);

    return {
        ahar: ahar,
        lunarMonthName: lunarMonthInfo.monthName,
        isAdhika: lunarMonthInfo.isAdhika,
        paksha: paksha,
        tithiName: tithiName,
        tithiDay: tithiDay
    };
}

export function getEventsForDate(date: Date, bsYear: number, bsMonthIndex: number, bsDay: number) {
    const events: any[] = [];
    const gregorianYear = date.getUTCFullYear();
    const gregorianMonth = date.getUTCMonth() + 1;
    const gregorianDay = date.getUTCDate();
    const formattedGregorianDate = formatMonthDay(gregorianMonth, gregorianDay);
    const formattedBikramRecurringDate = formatMonthDay(bsMonthIndex + 1, bsDay);

    function formatMonthDay(month: number, day: number) {
        return (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day;
    }

    // Handle Gregorian events
    
    if (EventsData.gregorianEvents) {
        for (let i = 0; i < EventsData.gregorianEvents.length; i++) {
            const event = EventsData.gregorianEvents[i] as any;
            // If startYear/endYear are provided, respect them; otherwise don't limit by year
            if ((event.startYear && gregorianYear < event.startYear) || (event.endYear && gregorianYear > event.endYear)) continue;
            if (event.date === formattedGregorianDate) {
                events.push({ 
                    name: event.event, 
                    detail: event.detail, 
                    category: event.category, 
                    holiday: event.holiday || false 
                });
            }
        }
    }

    // Handle Bikram recurring events
    
    if (EventsData.bikramRecurringEvents) {
        for (let j = 0; j < EventsData.bikramRecurringEvents.length; j++) {
            const event = EventsData.bikramRecurringEvents[j] as any;
            // Respect optional startYear/endYear, but allow events without them to apply to any year
            if ((event.startYear && bsYear < event.startYear) || (event.endYear && bsYear > event.endYear)) continue;
            if (event.date === formattedBikramRecurringDate) {
                events.push({ 
                    name: event.event, 
                    detail: event.detail, 
                    category: event.category, 
                    holiday: event.holiday || false 
                });
            }
        }
    }

    // Handle Bikram fixed events
    
    if (EventsData.bikramFixedEvents) {
        const formattedFixedDate = bsYear + "/" + formatMonthDay(bsMonthIndex + 1, bsDay);
        for (let i = 0; i < EventsData.bikramFixedEvents.length; i++) {
            const event = EventsData.bikramFixedEvents[i];
            // Fixed events have explicit full BS date (YYYY/MM/DD) - match exactly
            if (event.date === formattedFixedDate) {
                events.push({ 
                    name: event.event, 
                    detail: event.detail, 
                    category: event.category, 
                    holiday: event.holiday || false 
                });
            }
        }
    }

    // Handle Lunar events
    
    if (EventsData.lunarEvents) {
        const todayInfo = _getPanchangaBasics(date);
        if (todayInfo.isAdhika) {
            return events; // No lunar events in Adhika masa
        }

        const yesterday = new Date(date.getTime() - 86400000);
        const yesterdayInfo = _getPanchangaBasics(yesterday);

        const prevLunarMonthAhar = todayInfo.ahar - 29.53;
        const prevMonthStatus = calculateAdhikaMasa(prevLunarMonthAhar);
        let kshayaMonthName: string | null = null;
        if (prevMonthStatus.startsWith("क्षय")) {
            kshayaMonthName = prevMonthStatus.split(" ")[1];
        }

        for (let k = 0; k < EventsData.lunarEvents.length; k++) {
            const lunarEvent = EventsData.lunarEvents[k] as any;

            // Respect optional start/end year on lunar events
            if ((lunarEvent.startYear && bsYear < lunarEvent.startYear) || (lunarEvent.endYear && bsYear > lunarEvent.endYear)) continue;

            const isEventForToday = (lunarEvent.lunarMonth === todayInfo.lunarMonthName &&
                                   lunarEvent.paksha === todayInfo.paksha &&
                                   lunarEvent.tithi === todayInfo.tithiName);

            const isEventFromKshayaMonth = (kshayaMonthName !== null &&
                                          lunarEvent.lunarMonth === kshayaMonthName &&
                                          lunarEvent.paksha === todayInfo.paksha &&
                                          lunarEvent.tithi === todayInfo.tithiName);

            if (isEventForToday || isEventFromKshayaMonth) {
                const isFirstDayOfTithi = !(yesterdayInfo.lunarMonthName === todayInfo.lunarMonthName &&
                                          yesterdayInfo.paksha === todayInfo.paksha &&
                                          yesterdayInfo.tithiName === todayInfo.tithiName);

                if (isFirstDayOfTithi) {
                    events.push({ 
                        name: lunarEvent.event, 
                        detail: lunarEvent.detail, 
                        category: lunarEvent.category, 
                        holiday: lunarEvent.holiday || false 
                    });
                }
            }
        }
    }

    return events;
}

export function calculate(date: Date, lat?: number, lon?: number, tz?: number) {

    const jd = toJulianDay(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    const ahar = jd - KaliEpoch + 0.25 + (((lon || 85.3240) / 15 - (tz || 5.75)) / 24);
    const sunLong = trueLongitudeSun(ahar);
    const moonLong = trueLongitudeMoon(ahar);

    const tithiVal = getTithi(sunLong, moonLong);
    const tithiNum = Math.floor(tithiVal) + 1;
    const paksha = tithiNum <= 15 ? "शुक्ल पक्ष" : "कृष्ण पक्ष";
    const tithiDay = tithiNum > 15 ? tithiNum - 15 : tithiNum;
    const tithiName = resolveTithiName(tithiDay, paksha);

    let purnima_end_of_month = findPurnima(ahar);
    if (purnima_end_of_month < ahar) {
        purnima_end_of_month = findPurnima(ahar + 29.53);
    }

    const sunLongAtPurnima = trueLongitudeSun(purnima_end_of_month);
    const nameSign = Math.floor(sunLongAtPurnima / 30);
    const purnimantaMonthName = solarMonths[nameSign];

    const adhikaMasaStatus = calculateAdhikaMasa(ahar);
    const isAdhika = adhikaMasaStatus.startsWith("अधिक");

    const karanaIdx = Math.floor(2 * tithiVal);
    const karanaName = karanaIdx > 0 ? (karanaIdx < 57 ? karanas[(karanaIdx-1) % 7 + 1] : karanas[karanaIdx - 57 + 8]) : karanas[0];

    const bsInfo = toBikramSambat(date);
    if (!bsInfo) return { error: "Date out of range" } as any;

    const lunarMonthDisplayName = isAdhika ? "अधिक " + purnimantaMonthName : purnimantaMonthName;
    const events = getEventsForDate(date, bsInfo.year, bsInfo.monthIndex, bsInfo.day);
    const sunriseSunset = getSunriseSunset(date, lat, lon, tz);

    const gregorianOptions: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        timeZone: 'UTC' 
    };
    const gregorianDateFormatted = date.toLocaleDateString('en-US', gregorianOptions);

    return {
        gregorianDate: gregorianDateFormatted,
        bikramSambat: toDevanagari(bsInfo.year) + " " + bsInfo.monthName + " " + toDevanagari(bsInfo.day),
        bsYear: bsInfo.year,
        bsMonthIndex: bsInfo.monthIndex,
        bsDay: bsInfo.day,
        weekday: weekdays[date.getUTCDay()],
        sunrise: sunriseSunset.sunrise,
        sunset: sunriseSunset.sunset,
        tithi: tithiName,
        tithiDay: tithiDay,
        paksha: paksha,
        lunarMonth: lunarMonthDisplayName,
        nakshatra: nakshatras[Math.floor(moonLong / (360 / 27))],
        yoga: yogas[Math.floor(zero360(sunLong + moonLong) / (360 / 27))],
        karana: karanaName,
        sunRashi: rashis[Math.floor(sunLong / 30)],
        moonRashi: rashis[Math.floor(moonLong / 30)],
        events: events,
        isComputed: bsInfo.isComputed,
        adhikaMasa: adhikaMasaStatus
    };
}
