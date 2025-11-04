import type { KundaliRequest, KundaliResponse, ServiceError, PlanetInfo, DashaInfo, AshtaKootaValues, ComparisonResult, GunaMilanScore, DivisionalChart, HouseInfo } from '../types/types';
import {
    NEPALI_NAKSHATRA, NEPALI_YOGA, NEPALI_KARANA, RASHI_LORDS, NEPALI_PLANETS,
    VARNA_MAP, NEPALI_VARNA, VASYA_MAP, NEPALI_VASYA, YONI_MAP, NEPALI_YONI,
    GANA_MAP, NEPALI_GANA, NADI_MAP, NEPALI_NADI, TATVA_MAP, NEPALI_TATVA, NEPALI_PAYA,
    GRAHA_MAITRI, YONI_COMPATIBILITY, NEPALI_RASHI
} from '../src/constants/constants';
import { toJulianDay, fromJulianDay, toDevanagari } from '../src/lib/lib';


// --- PANCHANG CALCULATION ENGINE & HELPERS ---

const d2r = Math.PI / 180;
const r2d = 180 / Math.PI;

// Data structures for lunar corrections
function corr(mlcor: number, mscor: number, fcor: number, dcor: number, lcor: number) {
    return { mlcor, mscor, fcor, dcor, lcor };
}
function corr2(l: number, ml: number, ms: number, f: number, d: number) {
    return { l, ml, ms, f, d };
}

const corrMoon = [
    corr(0, 0, 0, 4, 13.902), corr(0, 0, 0, 2, 2369.912), corr(1, 0, 0, 4, 1.979), corr(1, 0, 0, 2, 191.953),
    corr(1, 0, 0, 0, 22639.5), corr(1, 0, 0, -2, -4586.465), corr(1, 0, 0, -4, -38.428), corr(1, 0, 0, -6, -0.393),
    corr(0, 1, 0, 4, -0.289), corr(0, 1, 0, 2, -24.42), corr(0, 1, 0, 0, -668.146), corr(0, 1, 0, -2, -165.145),
    corr(0, 1, 0, -4, -1.877), corr(0, 0, 0, 3, 0.403), corr(0, 0, 0, 1, -125.154), corr(2, 0, 0, 4, 0.213),
    corr(2, 0, 0, 2, 14.387), corr(2, 0, 0, 0, 769.016), corr(2, 0, 0, -2, -211.656), corr(2, 0, 0, -4, -30.773),
    corr(2, 0, 0, -6, -0.57), corr(1, 1, 0, 2, -2.921), corr(1, 1, 0, 0, -109.673), corr(1, 1, 0, -2, -205.962),
    corr(1, 1, 0, -4, -4.391), corr(1, -1, 0, 4, 0.283), corr(1, -1, 0, 2, 14.577), corr(1, -1, 0, 0, 147.687),
    corr(1, -1, 0, -2, 28.475), corr(1, -1, 0, -4, 0.636), corr(0, 2, 0, 2, -0.189), corr(0, 2, 0, 0, -7.486),
    corr(0, 2, 0, -2, -8.096), corr(0, 0, 2, 2, -5.741), corr(0, 0, 2, 0, -411.608), corr(0, 0, 2, -2, -55.173),
    corr(0, 0, 2, -4, 0.025), corr(1, 0, 0, 1, -8.466), corr(1, 0, 0, -1, 18.609), corr(1, 0, 0, -3, 3.215),
    corr(0, 1, 0, 1, 18.023), corr(0, 1, 0, -1, 0.56), corr(3, 0, 0, 2, 1.06), corr(3, 0, 0, 0, 36.124),
    corr(3, 0, 0, -2, -13.193), corr(3, 0, 0, -4, -1.187), corr(3, 0, 0, -6, -0.293), corr(2, 1, 0, 2, -0.29),
    corr(2, 1, 0, 0, -7.649), corr(2, 1, 0, -2, -8.627), corr(2, 1, 0, -4, -2.74), corr(2, -1, 0, 2, 1.181),
    corr(2, -1, 0, 0, 9.703), corr(2, -1, 0, -2, -2.494), corr(2, -1, 0, -4, 0.36), corr(1, 2, 0, 0, -1.167),
    corr(1, 2, 0, -2, -7.412), corr(1, 2, 0, -4, -0.311), corr(1, -2, 0, 2, 0.757), corr(1, -2, 0, 0, 2.58),
    corr(1, -2, 0, -2, 2.533), corr(0, 3, 0, -2, -0.344), corr(1, 0, 2, 2, -0.992), corr(1, 0, 2, 0, -45.099),
    corr(1, 0, 2, -2, -0.179), corr(1, 0, -2, 2, -6.382), corr(1, 0, -2, 0, 39.528), corr(1, 0, -2, -2, 9.366),
    corr(0, 1, 2, 0, 0.415), corr(0, 1, 2, -2, -2.152), corr(0, 1, -2, 2, -1.44), corr(0, 1, -2, -2, 0.384),
    corr(2, 0, 0, 1, -0.586), corr(2, 0, 0, -1, 1.75), corr(2, 0, 0, -3, 1.225), corr(1, 1, 0, 1, 1.267),
    corr(1, -1, 0, -1, -1.089), corr(0, 0, 2, -1, 0.584), corr(4, 0, 0, 0, 1.938), corr(4, 0, 0, -2, -0.952),
    corr(3, 1, 0, 0, -0.551), corr(3, 1, 0, -2, -0.482), corr(3, -1, 0, 0, 0.681), corr(2, 0, 2, 0, -3.996),
    corr(2, 0, 2, -2, 0.557), corr(2, 0, -2, 2, -0.459), corr(2, 0, -2, 0, -1.298), corr(2, 0, -2, -2, 0.538),
    corr(1, 1, -2, -2, 0.426), corr(1, -1, 2, 0, -0.304), corr(1, -1, -2, 2, -0.372), corr(0, 0, 4, 0, 0.418),
    corr(2, -1, 0, -1, -0.352)
];

const corrMoon2 = [
    corr2(0.127, 0, 0, 0, 6), corr2(-0.151, 0, 2, 0, -4), corr2(-0.085, 0, 0, 2, 4), corr2(0.15, 0, 1, 0, 3),
    corr2(-0.091, 2, 1, 0, -6), corr2(-0.103, 0, 3, 0, 0), corr2(-0.301, 1, 0, 2, -4), corr2(0.202, 1, 0, -2, -4),
    corr2(0.137, 1, 1, 0, -1), corr2(0.233, 1, 1, 0, -3), corr2(-0.122, 1, -1, 0, 1), corr2(-0.276, 1, -1, 0, -3),
    corr2(0.255, 0, 0, 2, 1), corr2(0.254, 0, 0, 2, -3), corr2(-0.1, 3, 1, 0, -4), corr2(-0.183, 3, -1, 0, -2),
    corr2(-0.297, 2, 2, 0, -2), corr2(-0.161, 2, 2, 0, -4), corr2(0.197, 2, -2, 0, 0), corr2(0.254, 2, -2, 0, -2),
    corr2(-0.25, 1, 3, 0, -2), corr2(-0.123, 2, 0, 2, 2), corr2(0.173, 2, 0, -2, -4), corr2(0.263, 1, 1, 2, 0),
    corr2(0.13, 3, 0, 0, -1), corr2(0.113, 5, 0, 0, 0), corr2(0.092, 3, 0, 2, -2)
];

function fix360(v: number): number {
    v = v - Math.floor(v / 360.0) * 360.0;
    return v < 0 ? v + 360.0 : v;
}

// Iterative solver for Kepler's Equation. M must be in radians.
function kepler(m_rad: number, ex: number): number {
    let u0 = m_rad;
    for (let i = 0; i < 7; i++) {
        u0 = m_rad + ex * Math.sin(u0);
    }
    return u0;
}

function nutation(jd: number): number {
    const t = (jd - 2415020) / 36525;
    const t2 = t * t;
    const ls = (279.6967 + 36000.7689 * t + 0.000303 * t2) * d2r;
    const l = (270.4341639 + 481267.8831417 * t - 0.0011333333 * t2) * d2r;
    const ms = (358.4758333 + 35999.04975 * t - 0.00015 * t2) * d2r;
    const ml = (296.1046083 + 477198.8491083 * t + 0.0091916667 * t2) * d2r;
    const om = (259.183275 - 1934.1420083 * t + 0.0020777778 * t2) * d2r;

    let nut = (-17.2327 - 0.01737 * t) * Math.sin(om) + 0.2088 * Math.sin(2 * om) - 1.2729 * Math.sin(2 * ls) + 0.1261 * Math.sin(ms) - 0.2037 * Math.sin(2 * l) + 0.0675 * Math.sin(ml) - 0.0497 * Math.sin(2 * ls + ms) + 0.0214 * Math.sin(2 * ls - ms) + 0.0261 * Math.sin(2 * l + ml);
    return nut / 3600.0;
}

function calcayan(jd: number): number {
    const T = (jd - 2451545.0) / 36525.0;
    return 24.144206 - 0.013972 * T - 0.000009 * T * T;
}

function calData(jd: number) {
    let z1 = jd + 0.5;
    let z2 = Math.floor(z1);
    let f = z1 - z2;

    let a = z2;
    if (z2 >= 2299161) {
        const alf = Math.floor((z2 - 1867216.25) / 36524.25);
        a = z2 + 1 + alf - Math.floor(alf / 4);
    }

    const b = a + 1524;
    const c = Math.floor((b - 122.1) / 365.25);
    const d = Math.floor(365.25 * c);
    const e = Math.floor((b - d) / 30.6001);

    const days = b - d - Math.floor(30.6001 * e) + f;
    const kday = Math.floor(days);
    const kmon = e < 13.5 ? e - 1 : e - 13;
    const kyear = kmon > 2.5 ? c - 4716 : c - 4715;

    const hh1 = (days - kday) * 24;
    const khr = Math.floor(hh1);
    const ksek = (hh1 - khr) * 3600;
    const kmin = Math.floor(ksek / 60);
    const ksek_final = Math.floor(ksek % 60);

    return new Date(Date.UTC(kyear, kmon - 1, kday, khr, kmin, ksek_final));
}

function dTime(jd: number): number {
    const efdt = [
        124, 85, 62, 48, 37, 26, 16, 10, 9, 10, 11, 11, 12, 13, 15, 16, 17, 17, 13.7, 12.5,
        12, 7.5, 5.7, 7.1, 7.9, 1.6, -5.4, -5.9, -2.7, 10.5, 21.2, 24, 24.3, 29.2, 33.2, 40.2, 50.5, 56.9,
        63.8, 67.0, 69.4, 71.0,
    ];
    const s = calData(jd);
    const dgod = s.getUTCFullYear() + (s.getUTCMonth()) / 12 + (s.getUTCDate() - 1) / 365.25;
    const t = (jd - 2378497) / 36525;
    let dt_val: number;

    if (dgod >= 1620 && dgod < 2030) {
        const i1 = Math.floor((dgod - 1620) / 10);
        const di = dgod - (1620 + i1 * 10);
        dt_val = (efdt[i1] + ((efdt[i1 + 1] - efdt[i1]) * di) / 10);
    }
    else {
        if (dgod >= 2030) dt_val = 71.0 + 0.5 * (dgod - 2030);
        else if (dgod >= 948) dt_val = 25.5 * t * t;
        else dt_val = 1361.7 + 320 * t + 44.3 * t * t;
    }
    return dt_val / 3600;
}

function moon(jd: number): number {
    const tdays = jd - 2415020;
    const t = tdays / 36525;

    let l = 270.4337361 + 13.176396544528099 * tdays - 5.86 * t * t / 3600 + 0.0068 * t * t * t / 3600;
    let d_mean = 350.7374861110581 + 445267.1142166667 * t - t * t * 1.436111132303874e-3 + 0.0000018888889 * t * t * t;
    const pe = 334.329556 + 14648522.52 * t / 3600 - 37.17 * t * t / 3600 - 0.045 * t * t * t / 3600;
    let ms_mean = 358.4758333333334 + 35999.04974999958 * t - t * t * 1.500000059604645e-4 - t * t * t * 3.3333333623078e-6;
    let ml = fix360(l - pe);
    const om = 259.183275 - 6962911.23 * t / 3600 + 7.48 * t * t / 3600 + 0.008 * t * t * t / 3600;
    let f_mean = fix360(l - om);

    let ml_rad = d2r * ml;
    let ms_rad = d2r * ms_mean;
    let f_rad = d2r * f_mean;
    let d_rad = d2r * d_mean;

    let lk = 0, lk1 = 0;
    const i1corr = 1.0 - 6.8320e-8 * tdays;
    const dgc = 1;
    const i2corr = dgc * dgc;

    for (let i = 0; i < corrMoon.length; i++) {
        const arg = corrMoon[i].mlcor * ml_rad + corrMoon[i].mscor * ms_rad + corrMoon[i].fcor * f_rad + corrMoon[i].dcor * d_rad;
        let sinarg = Math.sin(arg);
        if (corrMoon[i].mscor != 0) {
            sinarg *= i1corr;
            if (corrMoon[i].mscor == 2 || corrMoon[i].mscor == -2) sinarg *= i1corr;
        }
        if (corrMoon[i].fcor != 0) sinarg *= i2corr;
        lk += corrMoon[i].lcor * sinarg;
    }
    for (let i = 0; i < corrMoon2.length; i++) {
        const arg = corrMoon2[i].ml * ml_rad + corrMoon2[i].ms * ms_rad + corrMoon2[i].f * f_rad + corrMoon2[i].d * d_rad;
        lk1 += corrMoon2[i].l * Math.sin(arg);
    }

    const r2rad_dlid = 360 * d2r;
    let dlid = 0.822 * Math.sin(r2rad_dlid * (0.32480 - 0.0017125594 * tdays)) + 0.307 * Math.sin(r2rad_dlid * (0.14905 - 0.0034251187 * tdays)) + 0.348 * Math.sin(r2rad_dlid * (0.68266 - 0.0006873156 * tdays)) + 0.662 * Math.sin(r2rad_dlid * (0.65162 + 0.0365724168 * tdays)) + 0.643 * Math.sin(r2rad_dlid * (0.88098 - 0.0025069941 * tdays)) + 1.137 * Math.sin(r2rad_dlid * (0.85823 + 0.0364487270 * tdays)) + 0.436 * Math.sin(r2rad_dlid * (0.71892 + 0.0362179180 * tdays)) + 0.327 * Math.sin(r2rad_dlid * (0.97639 + 0.0001734910 * tdays));

    l = l + nutation(jd) + (lk + lk1 + dlid) / 3600.0;

    return fix360(l);
}


function sun(jd: number): number {
    const tdays = jd - 2415020;
    const t = tdays / 36525;

    const ls = 279.696678 + 0.9856473354 * tdays + 1.089 * t * t / 3600;
    const pes = 281.220833 + 1.7192 * t + 0.00045 * t * t;
    const ms = fix360(ls - pes);
    const ex = 0.01675104 - 0.0000418 * t - 0.000000126 * t * t;

    const u_rad = kepler(ms * d2r, ex);
    const truanom = 2 * r2d * Math.atan(Math.sqrt((1 + ex) / (1 - ex)) * Math.tan(u_rad / 2));

    let il = ls + truanom - ms;

    const u1 = (153.23 + 22518.7541 * t) * d2r;
    const u2 = (216.57 + 45037.5082 * t) * d2r;
    const u3 = (312.69 + 32964.3577 * t) * d2r;
    const u4 = (350.74 + 445267.1142 * t - 0.00144 * t * t) * d2r;

    let dl = 0.00134 * Math.cos(u1) + 0.00154 * Math.cos(u2) + 0.002 * Math.cos(u3) + 0.00179 * Math.sin(u4) + 0.00178 * Math.sin((5.4 - 1.5 * t) * d2r);

    const rs = 1.0000002 * (1 - ex * ex) / (1 + ex * Math.cos(truanom * d2r));
    const ab = 20.4898 / 3600 / rs;

    let finalSun = il + dl + nutation(jd) - ab;

    return fix360(finalSun);
}

function findAspectTime(jd: number, tzone: number, isKarana: boolean): { start: string, end: string } {
    let s_t: { start?: Date, end?: Date } = {};
    const len = isKarana ? 6 : 12;
    const totalAspects = isKarana ? 60 : 30;

    const currentAyanamsa = calcayan(jd);
    const siderealSun = fix360(sun(jd) - currentAyanamsa);
    const siderealMoon = fix360(moon(jd) - currentAyanamsa);
    const diff = fix360(siderealMoon - siderealSun);
    const currentAspectNum = Math.floor(diff / len);

    for (let i = 0; i < 2; i++) {
        const targetAspectNum = (currentAspectNum + i + totalAspects) % totalAspects;
        const targetAspect = targetAspectNum * len;

        let jdt = jd;
        let lsun0, lmoon0, asp1;

        for (let j = 0; j < 5; j++) {
            const tempAyanamsa = calcayan(jdt);
            const sunJdt = sun(jdt);
            const moonJdt = moon(jdt);
            const cachedSun = sunJdt;
            const cachedMoon = moonJdt;

            lsun0 = fix360(cachedSun - tempAyanamsa);
            lmoon0 = fix360(cachedMoon - tempAyanamsa);

            let targetMoonLon = fix360(lsun0 + targetAspect);
            asp1 = targetMoonLon - lmoon0;
            if (asp1 > 180) asp1 -= 360;
            if (asp1 < -180) asp1 += 360;

            if (Math.abs(asp1) < 0.0001) break;

            const sunSpeed_trop = (sun(jdt + 0.001) - cachedSun) * 1000;
            const moonSpeed_trop = (moon(jdt + 0.001) - cachedMoon) * 1000;
            const sidereal_speed_diff = moonSpeed_trop - sunSpeed_trop;

            jdt += asp1 / sidereal_speed_diff;
        }

        const eventDate = calData(jdt + (tzone - dTime(jdt)) / 24);
        if (i === 0) s_t.start = eventDate;
        else s_t.end = eventDate;
    }

    return { start: s_t.start!.toISOString(), end: s_t.end!.toISOString() };
}

function findNakshatraTime(jd: number, tzone: number): { start: string, end: string } {
    let s_t: { start?: Date, end?: Date } = {};
    const n_len = 360 / 27;
    const currentAyanamsa = calcayan(jd);
    const currentNakshNum = Math.floor(fix360(moon(jd) - currentAyanamsa) / n_len);

    for (let i = 0; i < 2; i++) {
        const targetNakshNum = (currentNakshNum + i + 27) % 27;
        const targetNakshLon = targetNakshNum * n_len;

        let jdt = jd;
        let lmoon0, asp1;

        for (let j = 0; j < 5; j++) {
            const tempAyanamsa = calcayan(jdt);
            const moonJdt = moon(jdt);
            const cachedMoon = moonJdt;

            lmoon0 = fix360(cachedMoon - tempAyanamsa);
            asp1 = targetNakshLon - lmoon0;
            if (asp1 > 180) asp1 -= 360;
            if (asp1 < -180) asp1 += 360;

            if (Math.abs(asp1) < 0.0001) break;
            const moonSpeed_trop = (moon(jdt + 0.001) - cachedMoon) * 1000;
            jdt += asp1 / moonSpeed_trop;
        }

        const eventDate = calData(jdt + (tzone - dTime(jdt)) / 24);
        if (i === 0) s_t.start = eventDate;
        else s_t.end = eventDate;
    }

    return { start: s_t.start!.toISOString(), end: s_t.end!.toISOString() };
}

function findYogaTime(jd: number, tzone: number): { start: string, end: string } {
    let s_t: { start?: Date, end?: Date } = {};
    const y_len = 360 / 27;

    const currentAyanamsa = calcayan(jd);
    const siderealSun = fix360(sun(jd) - currentAyanamsa);
    const siderealMoon = fix360(moon(jd) - currentAyanamsa);
    const currentYogaNum = Math.floor(fix360(siderealSun + siderealMoon) / y_len);

    for (let i = 0; i < 2; i++) {
        const targetYogaNum = (currentYogaNum + i + 27) % 27;
        const targetYogaLon = targetYogaNum * y_len;

        let jdt = jd;
        let lsun0, lmoon0, totalLon, asp1;

        for (let j = 0; j < 5; j++) {
            const tempAyanamsa = calcayan(jdt);
            const sunJdt = sun(jdt);
            const moonJdt = moon(jdt);
            const cachedSun = sunJdt;
            const cachedMoon = moonJdt;

            lsun0 = fix360(cachedSun - tempAyanamsa);
            lmoon0 = fix360(cachedMoon - tempAyanamsa);
            totalLon = fix360(lsun0 + lmoon0);
            asp1 = targetYogaLon - totalLon;
            if (asp1 > 180) asp1 -= 360;
            if (asp1 < -180) asp1 += 360;

            if (Math.abs(asp1) < 0.0001) break;
            const sunSpeed_trop = (sun(jdt + 0.001) - cachedSun) * 1000;
            const moonSpeed_trop = (moon(jdt + 0.001) - cachedMoon) * 1000;
            jdt += asp1 / (moonSpeed_trop + sunSpeed_trop);
        }

        const eventDate = calData(jdt + (tzone - dTime(jdt)) / 24);
        if (i === 0) s_t.start = eventDate;
        else s_t.end = eventDate;
    }
    return { start: s_t.start!.toISOString(), end: s_t.end!.toISOString() };
}

function getSunRiseSet(jd_tt_midnight: number, lat: number, lon: number, tzOffset: number): { sunrise: string, sunset: string } {
    const n = jd_tt_midnight - 2451545.0 + 0.0008;
    const j_star = n - lon / 360.0;
    const M = fix360(357.5291 + 0.98560028 * j_star);
    const C = 1.9148 * Math.sin(M * d2r) + 0.0200 * Math.sin(2 * M * d2r) + 0.0003 * Math.sin(3 * M * d2r);
    const lambda = fix360(M + 102.9372 + C + 180.0);
    const j_transit = 2451545.0 + j_star + 0.0053 * Math.sin(M * d2r) - 0.0069 * Math.sin(2 * lambda * d2r);
    const delta = Math.asin(Math.sin(lambda * d2r) * Math.sin(23.44 * d2r)) * r2d;
    const cos_H = (Math.sin(-0.833 * d2r) - Math.sin(lat * d2r) * Math.sin(delta * d2r)) / (Math.cos(lat * d2r) * Math.cos(delta * d2r));

    if (cos_H > 1 || cos_H < -1) return { sunrise: "N/A", sunset: "N/A" };

    const H = Math.acos(cos_H) * r2d;
    const j_rise = j_transit - H / 360.0;
    const j_set = j_transit + H / 360.0;

    const formatTime = (julian_tt: number) => {
        if (isNaN(julian_tt)) return "N/A";
        const julian_ut = julian_tt - dTime(julian_tt) / 24.0;
        const eventDateUTC = fromJulianDay(julian_ut);

        const localEventDate = new Date(eventDateUTC.getTime() + tzOffset * 3600 * 1000);

        const hh = localEventDate.getUTCHours();
        const mm = localEventDate.getUTCMinutes();

        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    };

    return { sunrise: formatTime(j_rise), sunset: formatTime(j_set) };
}

function getMoonRiseSet(jd_tt_day: number, lat: number, lon: number, tzOffset: number): { moonrise: string, moonset: string } {

    const h_moon = 0.7275 * 0.5 - 34 / 60;

    const getTimesForDay = (currentJD_TT: number) => {
        const jd_ut = currentJD_TT - dTime(currentJD_TT) / 24.0;
        const t = (currentJD_TT - 2451545.0) / 36525.0;
        const epsilon = (23.439291 - 0.0130042 * t) * d2r;

        const getRaDec = (lon_deg: number) => {
            const lon_rad = fix360(lon_deg) * d2r;
            const sin_lon = Math.sin(lon_rad);
            const ra = Math.atan2(sin_lon * Math.cos(epsilon), Math.cos(lon_rad));
            const dec = Math.asin(sin_lon * Math.sin(epsilon));
            return { ra, dec };
        };

        const { ra: ra_prev, dec: dec_prev } = getRaDec(moon(currentJD_TT - 1));
        const { ra: ra_curr, dec: dec_curr } = getRaDec(moon(currentJD_TT));
        const { ra: ra_next, dec: dec_next } = getRaDec(moon(currentJD_TT + 1));

        const L0 = fix360(280.46061837 + 360.98564736629 * (jd_ut - 2451545.0));
        const GMST0 = (L0 / 15.0);

        let m0_rise: number | null = null, m0_set: number | null = null;

        const cos_h0 = (Math.sin(h_moon * d2r) - Math.sin(lat * d2r) * Math.sin(dec_curr)) / (Math.cos(lat * d2r) * Math.cos(dec_curr));
        if (Math.abs(cos_h0) <= 1) {
            const h0 = Math.acos(cos_h0);
            const m_rise = (ra_curr - h0 - (GMST0 * 15 * d2r) - (lon * d2r)) / (2 * Math.PI);
            const m_set = (ra_curr + h0 - (GMST0 * 15 * d2r) - (lon * d2r)) / (2 * Math.PI);
            m0_rise = m_rise - Math.floor(m_rise);
            m0_set = m_set - Math.floor(m_set);
        }

        const refine = (m: number | null) => {
            if (m === null) return null;
            let current_m = m;
            for (let i = 0; i < 3; i++) {
                const ra_interp = ra_curr + current_m * (ra_next - ra_prev) / 2;
                const dec_interp = dec_curr + current_m * (dec_next - dec_prev) / 2;
                const lst = ((GMST0 + current_m * 360.985647 / 15.0) * 15 + lon) * d2r;
                const h_angle = lst - ra_interp;
                const h_calc = Math.asin(Math.sin(lat * d2r) * Math.sin(dec_interp) + Math.cos(lat * d2r) * Math.cos(dec_interp) * Math.cos(h_angle));
                const delta_m = (h_calc - h_moon * d2r) / (2 * Math.PI * Math.cos(dec_interp) * Math.cos(lat * d2r) * Math.sin(h_angle));
                current_m -= delta_m;
            }
            return current_m;
        }

        const final_rise = refine(m0_rise);
        const final_set = refine(m0_set);

        const format = (m: number | null) => {
            if (m === null || m < 0 || m >= 1) return "N/A";
            const jd_ut_midnight = currentJD_TT - dTime(currentJD_TT) / 24.0;
            const event_jd_ut = jd_ut_midnight + m;
            const eventDateUTC = fromJulianDay(event_jd_ut);
            const localEventDate = new Date(eventDateUTC.getTime() + tzOffset * 3600 * 1000);
            const hh = localEventDate.getUTCHours();
            const mm = localEventDate.getUTCMinutes();
            return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        }

        return { rise: format(final_rise), set: format(final_set) };
    }

    const todayTimes = getTimesForDay(jd_tt_day);
    const prevDayTimes = getTimesForDay(jd_tt_day - 1);
    const nextDayTimes = getTimesForDay(jd_tt_day + 1);

    const timeToMinutes = (timeStr: string): number | null => {
        if (!timeStr || timeStr === "N/A") return null;
        const parts = timeStr.split(":");
        if (parts.length < 2) return null;
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };

    const todayRiseMins = timeToMinutes(todayTimes.rise);
    const todaySetMins = timeToMinutes(todayTimes.set);
    const prevRiseMins = timeToMinutes(prevDayTimes.rise);
    const prevSetMins = timeToMinutes(prevDayTimes.set);

    let riseTime: string, setTime: string;

    if (todayTimes.rise !== "N/A") {
        riseTime = todayTimes.rise;
    } else if (prevRiseMins !== null && (todaySetMins === null || prevRiseMins > todaySetMins)) {
        riseTime = prevDayTimes.rise + " (हिजो)";
    } else {
        riseTime = nextDayTimes.rise + " (भोलि)";
    }

    if (todayTimes.set !== "N/A") {
        setTime = todayTimes.set;
    } else if (todayRiseMins !== null && prevSetMins !== null && prevSetMins > todayRiseMins) {
        setTime = prevDayTimes.set + " (हिजो)";
    } else {
        setTime = nextDayTimes.set + " (भोलि)";
    }

    return { moonrise: riseTime, moonset: setTime };
}


const J2000 = 2451545.0;
const planet_elements: Record<string, { [key: string]: number[] }> = {
    'MERCURY': { N: [48.3313, 3.24587E-5], i: [7.0047, 5.00E-8], w: [29.1241, 4.20258E-5], a: [0.387098, 0], e: [0.205635, 5.59E-10], M: [168.6562, 4.0923344368] },
    'VENUS': { N: [76.6799, 2.46590E-5], i: [3.3946, 2.75E-8], w: [54.8910, 1.38374E-5], a: [0.723330, 0], e: [0.006773, -1.32E-9], M: [48.0052, 1.6021302244] },
    'EARTH': { N: [0.0, 0], i: [0.0, 0], w: [102.9376, 0.0000713], a: [1.000000, 0], e: [0.016709, -1.151E-9], M: [356.0470, 0.985609102] },
    'MARS': { N: [49.5574, 2.11081E-5], i: [1.8497, -1.78E-8], w: [286.5016, 2.92961E-5], a: [1.523688, 0], e: [0.093405, 2.516E-9], M: [18.6021, 0.5240207766] },
    'JUPITER': { N: [100.4542, 2.76854E-5], i: [1.3030, -1.557E-7], w: [273.8777, 1.64505E-5], a: [5.20256, 0], e: [0.048498, 1.611E-9], M: [19.8950, 0.0830853001] },
    'SATURN': { N: [113.6634, 2.38980E-5], i: [2.4886, -1.081E-7], w: [339.3939, 2.97661E-5], a: [9.55475, 0], e: [0.055546, -9.499E-9], M: [316.9670, 0.0334442282] },
};

function getPlanetPosition(jd: number, planet: string): Omit<PlanetInfo, 'nakshatra' | 'nakshatraPada'> {
    if (planet === 'SUN') {
        const longitude = sun(jd);
        const longitude_prev = sun(jd - 0.1);
        const speed = fix360(longitude - longitude_prev) / 0.1;
        const degreesInSign = longitude % 30;
        const rashi = Math.floor(longitude / 30) + 1;
        return { planet, eclipticLongitude: longitude, rashi, degreesInSign, retrograde: speed < 0, eclipticLatitude: 0, speedLon: speed };
    }
    if (planet === 'MOON') {
        const longitude = moon(jd);
        const longitude_prev = moon(jd - 0.1);
        const speed = fix360(longitude - longitude_prev) / 0.1;
        const degreesInSign = longitude % 30;
        const rashi = Math.floor(longitude / 30) + 1;
        return { planet, eclipticLongitude: longitude, rashi, degreesInSign, retrograde: false, eclipticLatitude: 0, speedLon: speed };
    }
    if (planet === 'RAHU' || planet === 'KETU') {
        const t = (jd - 2451545.0) / 36525.0;
        const meanNode = fix360(125.04452 - 1934.136261 * t);

        const L_moon = fix360(218.3164477 + 481267.88123421 * t);
        const L_sun = fix360(280.46646 + 36000.76983 * t);
        const d = fix360(L_moon - L_sun);
        const F = fix360(L_moon - meanNode);

        let dL = -1.274 * Math.sin((meanNode - 2 * d) * d2r)
            - 0.227 * Math.sin(2 * F * d2r);

        const trueNode = fix360(meanNode + dL);
        const longitude = planet === 'RAHU' ? trueNode : fix360(trueNode + 180);
        return { planet, eclipticLongitude: longitude, rashi: Math.floor(longitude / 30) + 1, degreesInSign: longitude % 30, retrograde: true, eclipticLatitude: 0, speedLon: -0.0529 };
    }

    const d = jd - J2000;

    const getHelioCoords = (p_d: number, planet_name: string) => {
        const elements = planet_elements[planet_name];
        const N = fix360(elements.N[0] + elements.N[1] * p_d);
        const i = elements.i[0] + elements.i[1] * p_d;
        const w = fix360(elements.w[0] + elements.w[1] * p_d);
        const a = elements.a[0];
        const e = elements.e[0] + elements.e[1] * p_d;
        let M = fix360(elements.M[0] + elements.M[1] * p_d);

        const E_rad = kepler(M * d2r, e);

        const x_orb = a * (Math.cos(E_rad) - e);
        const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E_rad);

        const x_ecl = (Math.cos(w * d2r) * Math.cos(N * d2r) - Math.sin(w * d2r) * Math.sin(N * d2r) * Math.cos(i * d2r)) * x_orb +
            (-Math.sin(w * d2r) * Math.cos(N * d2r) - Math.cos(w * d2r) * Math.sin(N * d2r) * Math.cos(i * d2r)) * y_orb;
        const y_ecl = (Math.cos(w * d2r) * Math.sin(N * d2r) + Math.sin(w * d2r) * Math.cos(N * d2r) * Math.cos(i * d2r)) * x_orb +
            (-Math.sin(w * d2r) * Math.sin(N * d2r) + Math.cos(w * d2r) * Math.cos(N * d2r) * Math.cos(i * d2r)) * y_orb;
        const z_ecl = (Math.sin(w * d2r) * Math.sin(i * d2r)) * x_orb +
            (Math.cos(w * d2r) * Math.sin(i * d2r)) * y_orb;

        return { x: x_ecl, y: y_ecl, z: z_ecl };
    };

    const getGeoCoords = (p_d: number, planet_name: string): { longitude: number, latitude: number } => {
        const planetCoords = getHelioCoords(p_d, planet_name);
        const earthCoords = getHelioCoords(p_d, 'EARTH');

        const geo_x = planetCoords.x - earthCoords.x;
        const geo_y = planetCoords.y - earthCoords.y;
        const geo_z = planetCoords.z - earthCoords.z;

        const longitude = fix360(Math.atan2(geo_y, geo_x) * r2d);

        const dist_xy = Math.sqrt(geo_x * geo_x + geo_y * geo_y);
        const latitude = Math.atan2(geo_z, dist_xy) * r2d;

        return { longitude, latitude };
    };

    const { longitude, latitude } = getGeoCoords(d, planet);
    const { longitude: longitude_prev } = getGeoCoords(d - 0.1, planet);

    let diff = longitude - longitude_prev;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    const speed = diff / 0.1;

    return {
        planet,
        eclipticLongitude: longitude,
        rashi: Math.floor(longitude / 30) + 1,
        degreesInSign: longitude % 30,
        retrograde: speed < 0,
        eclipticLatitude: latitude,
        speedLon: speed
    };
}


// --- HOUSE & ASCENDANT CALCULATIONS ---
function getAscendant(jd_utc: number, lat: number, lon: number): number {
    const t = (jd_utc - 2451545.0) / 36525.0;
    const theta0 = 280.46061837 + 360.98564736629 * (jd_utc - 2451545.0) + 0.000387933 * t * t - t * t * t / 38710000;
    const lst = fix360(theta0 + lon);
    const epsilon = 23.439291 - 0.0130042 * t;
    const ascendant = r2d * Math.atan2(Math.cos(lst * d2r), - (Math.sin(lst * d2r) * Math.cos(epsilon * d2r) + Math.tan(lat * d2r) * Math.sin(epsilon * d2r)));
    return fix360(ascendant);
}

function getHouses(ascendant: number): HouseInfo[] {
    return Array.from({ length: 12 }, (_, i) => ({
        houseNumber: i + 1,
        cuspLongitude: fix360(ascendant + i * 30),
        sign: Math.floor(fix360(ascendant + i * 30) / 30) + 1,
    }));
}


// --- DASHA CALCULATIONS ---
function getDashaBalance(moonLongitude: number): { lord: string, balance: number } {
    const nakshatraLength = 360 / 27;
    const nakshatraIndex = Math.floor(moonLongitude / nakshatraLength);
    const progressInNakshatra = (moonLongitude % nakshatraLength) / nakshatraLength;

    const dashaLords = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
    const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17];

    const lordIndex = nakshatraIndex % 9;
    const lord = dashaLords[lordIndex];
    const balance = (1 - progressInNakshatra) * dashaPeriods[lordIndex];

    return { lord, balance };
}

function getAntardashas(mahaDashaLord: string, startDate: Date): DashaInfo[] {
    const dashaLords = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
    const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    const totalPeriod = dashaPeriods.reduce((a, b) => a + b);

    const startIndex = dashaLords.indexOf(mahaDashaLord);
    const mahaDashaPeriod = dashaPeriods[startIndex];
    let currentStartDate = new Date(startDate);
    const antardashas: DashaInfo[] = [];

    for (let i = 0; i < 9; i++) {
        const lordIndex = (startIndex + i) % 9;
        const lord = dashaLords[lordIndex];
        const antardashaPeriod = (dashaPeriods[lordIndex] * mahaDashaPeriod) / totalPeriod;

        const endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + antardashaPeriod * 365.25);

        antardashas.push({
            planet: lord,
            start: currentStartDate.toISOString(),
            end: endDate.toISOString(),
        });
        currentStartDate = endDate;
    }
    return antardashas;
}

function getVimshottariDasha(moonLongitude: number, birthDate: Date): DashaInfo[] {
    const { lord: firstLord, balance } = getDashaBalance(moonLongitude);
    const dashaLords = ['KETU', 'VENUS', 'SUN', 'MOON', 'MARS', 'RAHU', 'JUPITER', 'SATURN', 'MERCURY'];
    const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17];

    const dashaSequence: DashaInfo[] = [];
    let currentDate = new Date(birthDate);

    const firstEndDate = new Date(currentDate);
    firstEndDate.setDate(firstEndDate.getDate() + balance * 365.25);
    dashaSequence.push({
        planet: firstLord,
        start: currentDate.toISOString(),
        end: firstEndDate.toISOString(),
        subDashas: getAntardashas(firstLord, currentDate)
    });
    currentDate = firstEndDate;

    let lordIndex = (dashaLords.indexOf(firstLord) + 1) % 9;
    for (let i = 0; i < 15; i++) {
        const lord = dashaLords[lordIndex];
        const period = dashaPeriods[lordIndex];
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + period * 365.25);

        dashaSequence.push({
            planet: lord,
            start: currentDate.toISOString(),
            end: endDate.toISOString(),
            subDashas: getAntardashas(lord, currentDate)
        });

        currentDate = endDate;
        lordIndex = (lordIndex + 1) % 9;
    }
    return dashaSequence;
}

function getTribhagiDasha(moonLongitude: number, birthDate: Date): DashaInfo[] {
    const vimshottari = getVimshottariDasha(moonLongitude, birthDate);
    return vimshottari.map(dasha => ({
        ...dasha,
        start: dasha.start,
        end: new Date(new Date(dasha.start).getTime() + (new Date(dasha.end).getTime() - new Date(dasha.start).getTime()) / 3).toISOString()
    }));
}


function getAshtottariAntardashas(mahaDashaLord: string, startDate: Date, mahaDashaPeriodInYears: number): DashaInfo[] {
    const dashaLords = ['SUN', 'MOON', 'MARS', 'MERCURY', 'SATURN', 'JUPITER', 'RAHU', 'VENUS'];
    const dashaPeriods = [6, 15, 8, 17, 10, 19, 12, 21];
    const totalPeriod = 108;

    const startIndex = dashaLords.indexOf(mahaDashaLord);
    if (startIndex === -1) return [];

    let currentStartDate = new Date(startDate);
    const antardashas: DashaInfo[] = [];

    for (let i = 0; i < 8; i++) {
        const lordIndex = (startIndex + i) % 8;
        const lord = dashaLords[lordIndex];
        const antardashaPeriodInYears = (dashaPeriods[lordIndex] * mahaDashaPeriodInYears) / totalPeriod;

        const endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + antardashaPeriodInYears * 365.25);

        antardashas.push({
            planet: lord,
            start: currentStartDate.toISOString(),
            end: endDate.toISOString(),
        });
        currentStartDate = endDate;
    }
    return antardashas;
}

function getAshtottariDasha(moonLongitude: number, birthDate: Date, paksha: string): DashaInfo[] {
    const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
    const dashaLords = ['SUN', 'MOON', 'MARS', 'MERCURY', 'SATURN', 'JUPITER', 'RAHU', 'VENUS'];
    const dashaPeriods = [6, 15, 8, 17, 10, 19, 12, 21];
    const isKrishnaPaksha = paksha === 'कृष्ण पक्ष';

    const getStartingLord = (): string => {
        if (isKrishnaPaksha) {
            if (nakshatraIndex === 5) return 'SATURN';
            if (nakshatraIndex === 6) return 'JUPITER';
            if (nakshatraIndex === 11) return 'RAHU';
            if (nakshatraIndex === 15) return 'VENUS';
        }

        if (nakshatraIndex >= 2 && nakshatraIndex <= 5) return 'SUN';
        if (nakshatraIndex >= 6 && nakshatraIndex <= 8) return 'MOON';
        if (nakshatraIndex >= 9 && nakshatraIndex <= 11) return 'MARS';
        if (nakshatraIndex >= 12 && nakshatraIndex <= 14) return 'MERCURY';
        if (nakshatraIndex >= 15 && nakshatraIndex <= 17) return 'SATURN';
        if (nakshatraIndex >= 18 && nakshatraIndex <= 20) return 'JUPITER';
        if (nakshatraIndex >= 21 && nakshatraIndex <= 23) return 'RAHU';

        return 'VENUS';
    };

    const firstLordName = getStartingLord();
    const lordIndex = dashaLords.indexOf(firstLordName);

    if (lordIndex === -1) return [];

    const nakshatraLength = 360 / 27;
    const progressInNakshatra = (moonLongitude % nakshatraLength) / nakshatraLength;
    const balance = (1 - progressInNakshatra) * dashaPeriods[lordIndex];

    const dashaSequence: DashaInfo[] = [];
    let currentDate = new Date(birthDate);

    const firstEndDate = new Date(currentDate);
    firstEndDate.setDate(firstEndDate.getDate() + balance * 365.25);
    dashaSequence.push({
        planet: firstLordName,
        start: currentDate.toISOString(),
        end: firstEndDate.toISOString(),
        subDashas: getAshtottariAntardashas(firstLordName, currentDate, dashaPeriods[lordIndex])
    });
    currentDate = firstEndDate;

    let currentLordIndex = (lordIndex + 1) % 8;
    for (let i = 0; i < 10; i++) {
        const lord = dashaLords[currentLordIndex];
        const period = dashaPeriods[currentLordIndex];
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + period * 365.25);
        dashaSequence.push({
            planet: lord,
            start: currentDate.toISOString(),
            end: endDate.toISOString(),
            subDashas: getAshtottariAntardashas(lord, currentDate, period)
        });
        currentDate = endDate;
        currentLordIndex = (currentLordIndex + 1) % 8;
    }
    return dashaSequence;
}


function getYoginiAntardashas(mahaDashaLord: string, startDate: Date, mahaDashaPeriodInYears: number): DashaInfo[] {
    const yoginiLords = ['Mangala', 'Pingala', 'Dhanya', 'Bhramari', 'Bhadrika', 'Ulka', 'Siddha', 'Sankata'];
    const yoginiPeriods = [1, 2, 3, 4, 5, 6, 7, 8];
    const totalPeriod = 36;

    const startIndex = yoginiLords.indexOf(mahaDashaLord);
    if (startIndex === -1) return [];

    let currentStartDate = new Date(startDate);
    const antardashas: DashaInfo[] = [];

    for (let i = 0; i < 8; i++) {
        const lordIndex = (startIndex + i) % 8;
        const lord = yoginiLords[lordIndex];
        const antardashaPeriodInYears = (yoginiPeriods[lordIndex] * mahaDashaPeriodInYears) / totalPeriod;

        const endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + antardashaPeriodInYears * 365.25);

        antardashas.push({
            planet: lord,
            start: currentStartDate.toISOString(),
            end: endDate.toISOString(),
        });
        currentStartDate = endDate;
    }
    return antardashas;
}

function getYoginiDasha(moonLongitude: number, birthDate: Date): DashaInfo[] {
    const nakshatraLength = 360 / 27;
    const nakshatraIndex = Math.floor(moonLongitude / nakshatraLength);
    const yoginiLords = ['Mangala', 'Pingala', 'Dhanya', 'Bhramari', 'Bhadrika', 'Ulka', 'Siddha', 'Sankata'];
    const yoginiPeriods = [1, 2, 3, 4, 5, 6, 7, 8];

    const startIndex = (nakshatraIndex + 3) % 8;
    const firstLord = yoginiLords[startIndex];
    const balance = (1 - (moonLongitude % nakshatraLength) / nakshatraLength) * yoginiPeriods[startIndex];

    const dashaSequence: DashaInfo[] = [];
    let currentDate = new Date(birthDate);

    const firstEndDate = new Date(currentDate);
    firstEndDate.setDate(firstEndDate.getDate() + balance * 365.25);
    dashaSequence.push({
        planet: firstLord,
        start: currentDate.toISOString(),
        end: firstEndDate.toISOString(),
        subDashas: getYoginiAntardashas(firstLord, currentDate, yoginiPeriods[startIndex])
    });
    currentDate = firstEndDate;

    let lordIndex = (startIndex + 1) % 8;
    for (let i = 0; i < 10; i++) {
        const lord = yoginiLords[lordIndex];
        const period = yoginiPeriods[lordIndex];
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + period * 365.25);
        dashaSequence.push({
            planet: lord,
            start: currentDate.toISOString(),
            end: endDate.toISOString(),
            subDashas: getYoginiAntardashas(lord, currentDate, period)
        });
        currentDate = endDate;
        lordIndex = (lordIndex + 1) % 8;
    }
    return dashaSequence;
}

const EXALTATION_RASHI: Record<string, number> = { SUN: 1, MOON: 2, MARS: 10, MERCURY: 6, JUPITER: 4, VENUS: 12, SATURN: 7 };
const DEBILITATION_RASHI: Record<string, number> = { SUN: 7, MOON: 8, MARS: 4, MERCURY: 12, JUPITER: 10, VENUS: 6, SATURN: 1 };


function getJaiminiAntardashas(mahaDashaRashiIndex: number, startDate: Date, mahaDashaPeriodInYears: number): DashaInfo[] {
    const antardashaDurationYears = mahaDashaPeriodInYears / 12;

    const movableSigns = [0, 3, 6, 9];
    const fixedSigns = [1, 4, 7, 10];
    let startRashiIndex: number;

    if (movableSigns.includes(mahaDashaRashiIndex)) {
        startRashiIndex = mahaDashaRashiIndex;
    } else if (fixedSigns.includes(mahaDashaRashiIndex)) {
        startRashiIndex = (mahaDashaRashiIndex + 6) % 12;
    } else {
        startRashiIndex = (mahaDashaRashiIndex + 4) % 12;
    }

    let currentStartDate = new Date(startDate);
    const antardashas: DashaInfo[] = [];

    for (let i = 0; i < 12; i++) {
        const antardashaRashiIndex = (startRashiIndex + i) % 12;

        const endDate = new Date(currentStartDate);
        endDate.setDate(endDate.getDate() + antardashaDurationYears * 365.25);

        antardashas.push({
            planet: NEPALI_RASHI[antardashaRashiIndex],
            start: currentStartDate.toISOString(),
            end: endDate.toISOString(),
        });
        currentStartDate = endDate;
    }
    return antardashas;
}


function getJaiminiDasha(planets: PlanetInfo[], ascendant: number, birthDate: Date): DashaInfo[] {
    const ascSign = Math.floor(ascendant / 30);

    const isLagnaOdd = (ascSign + 1) % 2 !== 0;
    let sequence: number[] = [];
    if (isLagnaOdd) {
        for (let i = 0; i < 12; i++) sequence.push((ascSign + i) % 12);
    } else {
        for (let i = 0; i < 12; i++) sequence.push((ascSign - i + 12) % 12);
    }

    let currentDate = new Date(birthDate);
    const dashaSequence: DashaInfo[] = [];

    const planetPositions = new Map<string, number>();
    planets.forEach(p => {
        planetPositions.set(p.planet, p.rashi - 1);
    });

    const vishamaPadaSigns = [0, 1, 2, 6, 7, 8];

    for (const dashaRashiIndex of sequence) {
        const dashaRashi = dashaRashiIndex + 1;
        const lordPlanet = RASHI_LORDS[dashaRashi];
        const lordRashiIndex = planetPositions.get(lordPlanet);

        if (lordRashiIndex === undefined) {
            dashaSequence.push({ planet: NEPALI_RASHI[dashaRashiIndex], start: 'N/A', end: 'N/A' });
            continue;
        }

        let count: number;
        if (vishamaPadaSigns.includes(dashaRashiIndex)) {
            count = (lordRashiIndex - dashaRashiIndex + 12) % 12;
        } else {
            count = (dashaRashiIndex - lordRashiIndex + 12) % 12;
        }

        let years = count;
        if (count === 0) years = 12;

        const lordRashi = lordRashiIndex + 1;
        if (EXALTATION_RASHI[lordPlanet] === lordRashi) years += 1;
        if (DEBILITATION_RASHI[lordPlanet] === lordRashi) years -= 1;

        if (years > 12) years = 12;
        if (years < 1) years = 1;

        const startDate = new Date(currentDate);
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + years);

        if (isNaN(endDate.getTime())) {
            dashaSequence.push({ planet: NEPALI_RASHI[dashaRashiIndex], start: startDate.toISOString(), end: 'N/A' });
            continue;
        }

        dashaSequence.push({
            planet: NEPALI_RASHI[dashaRashiIndex],
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            subDashas: getJaiminiAntardashas(dashaRashiIndex, startDate, years)
        });

        currentDate = endDate;
    }

    return dashaSequence;
}

function getDivisionalChart(chartId: number, planets: PlanetInfo[], ascendantLongitude: number): DivisionalChart {
    const getDivisionalSign = (longitude: number) => {
        const signIndex = Math.floor(longitude / 30);
        const degreesInSign = longitude % 30;
        const divisionSize = 30 / chartId;
        const positionInDivision = Math.floor(degreesInSign / divisionSize);

        let newSignIndex: number;
        let newDegreesInSign = (longitude * chartId) % 30;

        switch (chartId) {
            case 3:
                const groupD3 = [0, 4, 8];
                newSignIndex = (signIndex + groupD3[positionInDivision]) % 12;
                break;
            case 4:
                newSignIndex = (signIndex + positionInDivision * 3) % 12;
                break;
            case 9:
                const groupD9 = Math.floor(signIndex / 4);
                const startSignD9 = [0, 4, 8][groupD9];
                newSignIndex = (startSignD9 + positionInDivision) % 12;
                break;
            case 10:
                const isOddSign = (signIndex % 2 === 0);
                const startSignD10 = isOddSign ? signIndex : (signIndex + 8) % 12;
                newSignIndex = (startSignD10 + positionInDivision) % 12;
                break;
            case 12:
                newSignIndex = (signIndex + positionInDivision) % 12;
                break;
            case 60:
                const newLongitude60 = longitude * chartId;
                newSignIndex = Math.floor(newLongitude60 / 30) % 12;
                break;
            default:
                const genericNewLongitude = longitude * chartId;
                newSignIndex = Math.floor(genericNewLongitude / 30) % 12;
                newDegreesInSign = genericNewLongitude % 30;
                break;
        }

        return { sign: newSignIndex + 1, degreesInSign: newDegreesInSign };
    };

    const divisionalPlanets = planets.map(p => {
        const { sign, degreesInSign } = getDivisionalSign(p.eclipticLongitude);
        return {
            planet: p.planet,
            sign,
            degreesInSign,
            retrograde: p.retrograde,
            nakshatra: p.nakshatra,
            nakshatraPada: p.nakshatraPada
        };
    });

    const ascendantDivisional = getDivisionalSign(ascendantLongitude);

    return {
        name: `D${chartId}`,
        planets: divisionalPlanets,
        ascendant: { ...ascendantDivisional, nakshatra: '', nakshatraPada: 0 }
    };
}


function getAshtaKoota(moonRashi: number, moonNakshatraIndex: number, ascendantSign: number): AshtaKootaValues {
    return {
        varna: NEPALI_VARNA[VARNA_MAP[moonRashi]],
        vasya: NEPALI_VASYA[VASYA_MAP[moonRashi]],
        yoni: NEPALI_YONI[YONI_MAP[moonNakshatraIndex]],
        gana: NEPALI_GANA[GANA_MAP[moonNakshatraIndex]],
        nadi: NEPALI_NADI[NADI_MAP[moonNakshatraIndex]],
        tatva: NEPALI_TATVA[TATVA_MAP[moonRashi]],
        paya: (moonRashi - 1) % 4 === 0 ? NEPALI_PAYA['Suvarna'] : (moonRashi - 2) % 4 === 0 ? NEPALI_PAYA['Rajat'] : (moonRashi - 3) % 4 === 0 ? NEPALI_PAYA['Tamra'] : NEPALI_PAYA['Loha'],
        rashiLord: NEPALI_PLANETS[RASHI_LORDS[moonRashi]],
        lagnesh: NEPALI_PLANETS[RASHI_LORDS[ascendantSign]]
    };
}

function calculateGunaMilan(groom: KundaliResponse, bride: KundaliResponse): { score: GunaMilanScore, conclusion: string } {
    const score: GunaMilanScore = { varna: 0, vasya: 0, tara: 0, yoni: 0, grahaMaitri: 0, gana: 0, bhakoot: 0, nadi: 0, total: 0 };

    const varnaOrder = { 'ब्राह्मण': 4, 'क्षत्रिय': 3, 'वैश्य': 2, 'शूद्र': 1 };
    score.varna = varnaOrder[groom.ashtaKoota.varna as keyof typeof varnaOrder] >= varnaOrder[bride.ashtaKoota.varna as keyof typeof varnaOrder] ? 1 : 0;

    const groomVasya = VASYA_MAP[groom.planets.find(p => p.planet === 'MOON')!.rashi];
    const brideVasya = VASYA_MAP[bride.planets.find(p => p.planet === 'MOON')!.rashi];
    if (groomVasya === brideVasya) {
        score.vasya = 1;
    } else if ((groomVasya === 'Vanachara' && brideVasya === 'Chatushpada') || (groomVasya === 'Dwipada' && brideVasya !== 'Jalachara')) {
        score.vasya = 2;
    } else if (groomVasya === 'Jalachara' && brideVasya === 'Dwipada') {
        score.vasya = 0;
    } else {
        score.vasya = 0.5;
    }

    const tara = (bride.nakshatra.index - groom.nakshatra.index + 27) % 9;
    score.tara = [0, 2, 4, 6, 8].includes(tara) ? 3 : 1.5;

    const groomYoniKey = Object.keys(NEPALI_YONI).find(key => NEPALI_YONI[key] === groom.ashtaKoota.yoni) as keyof typeof YONI_COMPATIBILITY;
    const brideYoniKey = Object.keys(NEPALI_YONI).find(key => NEPALI_YONI[key] === bride.ashtaKoota.yoni) as keyof typeof YONI_COMPATIBILITY;
    if (groomYoniKey && brideYoniKey) score.yoni = YONI_COMPATIBILITY[groomYoniKey][brideYoniKey] ?? 0;

    const groomLordKey = Object.keys(NEPALI_PLANETS).find(key => NEPALI_PLANETS[key] === groom.ashtaKoota.rashiLord)!;
    const brideLordKey = Object.keys(NEPALI_PLANETS).find(key => NEPALI_PLANETS[key] === bride.ashtaKoota.rashiLord)!;
    const relation = GRAHA_MAITRI[groomLordKey][brideLordKey];
    if (relation === 'Friend') score.grahaMaitri = 5;
    else if (relation === 'Neutral') score.grahaMaitri = 4;
    else if (GRAHA_MAITRI[brideLordKey][groomLordKey] === 'Neutral') score.grahaMaitri = 3;
    else score.grahaMaitri = 0.5;

    const groomGana = groom.ashtaKoota.gana;
    const brideGana = bride.ashtaKoota.gana;
    if (groomGana === brideGana) score.gana = 6;
    else if ((groomGana === 'देव' && brideGana === 'मनुष्य') || (groomGana === 'मनुष्य' && brideGana === 'देव')) score.gana = 6;
    else if ((groomGana === 'देव' && brideGana === 'राक्षस') || (groomGana === 'राक्षस' && brideGana === 'देव')) score.gana = 1;
    else score.gana = 0;

    const groomMoonRashi = groom.planets.find(p => p.planet === 'MOON')!.rashi;
    const brideMoonRashi = bride.planets.find(p => p.planet === 'MOON')!.rashi;
    const diff = Math.abs(groomMoonRashi - brideMoonRashi);
    if (diff === 0 || diff === 6) score.bhakoot = 0;
    else if (diff === 1 || diff === 7) score.bhakoot = 7;
    else if (diff === 2 || diff === 12) score.bhakoot = 0;
    else if (diff === 3 || diff === 11) score.bhakoot = 7;
    else if (diff === 4 || diff === 10) score.bhakoot = 7;
    else if (diff === 5 || diff === 9) score.bhakoot = 0;
    else score.bhakoot = 7;

    score.nadi = groom.ashtaKoota.nadi === bride.ashtaKoota.nadi ? 0 : 8;

    score.total = Object.values(score).reduce((a, b) => a + b);
    score.total = Math.round(score.total * 2) / 2;

    let conclusion = `कुल ${toDevanagari(score.total)}/३६ गुण मिलान भएको छ। `;
    if (score.total >= 28) conclusion += "यो अति उत्तम मिलान हो।";
    else if (score.total >= 24) conclusion += "यो उत्तम मिलान हो।";
    else if (score.total >= 18) conclusion += "यो मध्यम मिलान हो, विवाह गर्न सकिन्छ।";
    else conclusion += "यो मिलान विवाहको लागि उपयुक्त मानिदैन।";

    return { score, conclusion };
}


async function getKundali(req: KundaliRequest): Promise<KundaliResponse | ServiceError> {
    try {
        const [datePart, timePart] = req.datetime.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);

        const birthDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, second) - req.offset * 3600 * 1000);
        const jd_utc = toJulianDay(birthDateUTC.getUTCFullYear(), birthDateUTC.getUTCMonth(), birthDateUTC.getUTCDate()) + (birthDateUTC.getUTCHours() + birthDateUTC.getUTCMinutes() / 60 + birthDateUTC.getUTCSeconds() / 3600) / 24;
        const dt = dTime(jd_utc);
        const jd = jd_utc + dt / 24;

        const ayanamsa = calcayan(jd);

        const planets: PlanetInfo[] = ['SUN', 'MOON', 'MARS', 'MERCURY', 'JUPITER', 'VENUS', 'SATURN', 'RAHU', 'KETU'].map(p => {
            const pos = getPlanetPosition(jd, p);
            const siderealLon = fix360(pos.eclipticLongitude - ayanamsa);
            const nakshatraLength = 360 / 27;
            const nakshatraIndex = Math.floor(siderealLon / nakshatraLength);

            return {
                ...pos,
                eclipticLongitude: siderealLon,
                rashi: Math.floor(siderealLon / 30) + 1,
                degreesInSign: siderealLon % 30,
                nakshatra: NEPALI_NAKSHATRA[nakshatraIndex],
                nakshatraPada: Math.floor((siderealLon % nakshatraLength) / (nakshatraLength / 4)) + 1,
            };
        });

        const ascendantLon_tropical = getAscendant(jd_utc, req.latitude, req.longitude);
        const ascendantLon = fix360(ascendantLon_tropical - ayanamsa);
        const houses = getHouses(ascendantLon);

        const moonPlanetInfo = planets.find(p => p.planet === 'MOON')!;
        const sunPlanetInfo = planets.find(p => p.planet === 'SUN')!;

        const nakshatraIndex = Math.floor(moonPlanetInfo.eclipticLongitude / (360 / 27));

        const tithiInfo = findAspectTime(jd, req.offset, false);
        const nakshatraInfo = findNakshatraTime(jd, req.offset);
        const yogaInfo = findYogaTime(jd, req.offset);
        const karanaInfo = findAspectTime(jd, req.offset, true);

        const jd_0h_utc = toJulianDay(year, month - 1, day);
        const dt_for_day = dTime(jd_0h_utc);
        const jd_tt_for_day = jd_0h_utc + dt_for_day / 24.0;

        const { sunrise, sunset } = getSunRiseSet(jd_tt_for_day, req.latitude, req.longitude, req.offset);
        const { moonrise, moonset } = getMoonRiseSet(jd_tt_for_day, req.latitude, req.longitude, req.offset);

        const sidereal_diff = fix360(moonPlanetInfo.eclipticLongitude - sunPlanetInfo.eclipticLongitude);
        const tithiNumber = Math.floor(sidereal_diff / 12) + 1;
        const paksha = sidereal_diff < 180 ? 'शुक्ल पक्ष' : 'कृष्ण पक्ष';

        const sidereal_sum = fix360(moonPlanetInfo.eclipticLongitude + sunPlanetInfo.eclipticLongitude);
        const yogaName = NEPALI_YOGA[Math.floor(sidereal_sum / (360 / 27))];

        const karanaNumber = Math.floor(sidereal_diff / 6);
        let karanaIndex: number;
        if (karanaNumber === 0 || karanaNumber === 59) karanaIndex = 0;
        else if (karanaNumber === 56) karanaIndex = 7;
        else if (karanaNumber === 57) karanaIndex = 8;
        else if (karanaNumber === 58) karanaIndex = 9;
        else karanaIndex = (karanaNumber - 1) % 7 + 1;
        const karanaName = NEPALI_KARANA[karanaIndex];

        const birthDate = new Date(req.datetime);

        return {
            birthDetails: { ...req },
            calculationMeta: { backend: 'Nepdate-astroCalc', version: __APP_VERSION__, ayanamsa: 'Lahiri', zodiac: 'Sidereal', houseSystem: 'Whole Sign', calculationUtc: new Date().toISOString() },
            planets,
            ascendant: { longitude: ascendantLon, sign: Math.floor(ascendantLon / 30) + 1, degreesInSign: ascendantLon % 30, nakshatra: NEPALI_NAKSHATRA[Math.floor(ascendantLon / (360 / 27))], nakshatraPada: Math.floor((ascendantLon % (360 / 27)) / ((360 / 27) / 4)) + 1 },
            houses,
            nakshatra: { index: nakshatraIndex, pada: moonPlanetInfo.nakshatraPada, nameNepali: moonPlanetInfo.nakshatra, start: nakshatraInfo.start, end: nakshatraInfo.end },
            tithi: { tithiNumber: tithiNumber, paksha: paksha, start: tithiInfo.start, end: tithiInfo.end },
            yoga: { name: yogaName, start: yogaInfo.start, end: yogaInfo.end },
            karana: { name: karanaName, start: karanaInfo.start, end: karanaInfo.end },
            dashaSequence: getVimshottariDasha(moonPlanetInfo.eclipticLongitude, birthDate),
            tribhagiDasha: getTribhagiDasha(moonPlanetInfo.eclipticLongitude, birthDate),
            yoginiDasha: getYoginiDasha(moonPlanetInfo.eclipticLongitude, birthDate),
            ashtottariDasha: getAshtottariDasha(moonPlanetInfo.eclipticLongitude, birthDate, paksha),
            jaiminiDasha: getJaiminiDasha(planets, ascendantLon, birthDate),
            divisionalCharts: [9, 10, 3, 12, 4, 60].map(d => getDivisionalChart(d, planets, ascendantLon)),
            ashtaKoota: getAshtaKoota(moonPlanetInfo.rashi, nakshatraIndex, Math.floor(ascendantLon / 30) + 1),
            sunRise: sunrise, sunSet: sunset, moonRise: moonrise, moonSet: moonset,
        };
    } catch (e) {
        return { error: e instanceof Error ? e.message : 'Unknown error during calculation.' };
    }
}

async function getComparison(groomReq: KundaliRequest, brideReq: KundaliRequest): Promise<ComparisonResult | ServiceError> {
    const groomData = await getKundali(groomReq);
    const brideData = await getKundali(brideReq);

    if ('error' in groomData || 'error' in brideData) {
        return { error: 'Could not calculate kundali for one or both individuals.' };
    }

    const { score, conclusion } = calculateGunaMilan(groomData, brideData);

    return { groom: groomData, bride: brideData, score, conclusion };
}

export const kundaliService = {
    getKundali,
    getComparison,
};