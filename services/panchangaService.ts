import { sun, moon, calcayan, calData, dTime, fix360 } from './astroCalc';

export function findAspectTime(jd: number, tzone: number, isKarana: boolean): { start: string, end: string } {
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

export function findNakshatraTime(jd: number, tzone: number): { start: string, end: string } {
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

export function findNakshatraPadaTime(jd: number, tzone: number): { start: string, end: string } {
    const n_len = 360 / 27;
    const p_len = n_len / 4;
    const currentAyanamsa = calcayan(jd);
    const siderealMoon = fix360(moon(jd) - currentAyanamsa);

    const currentNakshNum = Math.floor(siderealMoon / n_len);
    const progressInNaksh = siderealMoon % n_len;
    const currentPadaNum = Math.floor(progressInNaksh / p_len);

    let s_t: { start?: Date, end?: Date } = {};
    
    for (let i = 0; i < 2; i++) {
        const targetPadaAbsoluteNum = currentNakshNum * 4 + currentPadaNum + i;
        const targetLon = (targetPadaAbsoluteNum * p_len);

        let jdt = jd;
        let lmoon0, asp1;

        for (let j = 0; j < 5; j++) {
            const tempAyanamsa = calcayan(jdt);
            const moonJdt = moon(jdt);
            const cachedMoon = moonJdt;
            
            lmoon0 = fix360(cachedMoon - tempAyanamsa);
            asp1 = targetLon - lmoon0;
            // Handle wrap-around
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


export function findYogaTime(jd: number, tzone: number): { start: string, end: string } {
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
            const sunSpeed_trop = (sun(jdt+0.001)-cachedSun)*1000;
            const moonSpeed_trop = (moon(jdt+0.001)-cachedMoon)*1000;
            jdt += asp1 / (moonSpeed_trop + sunSpeed_trop);
        }

        const eventDate = calData(jdt + (tzone - dTime(jdt)) / 24);
        if (i === 0) s_t.start = eventDate;
        else s_t.end = eventDate;
    }
    return { start: s_t.start!.toISOString(), end: s_t.end!.toISOString() };
}