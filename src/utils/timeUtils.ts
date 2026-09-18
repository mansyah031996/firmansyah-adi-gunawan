import { DivisionHours, ProjectUnit } from '../types';

/**
 * Normalizes any time value (e.g. "Date(1899,11,30,8,0,0)", "120:30", 120.5, 0.3333333, "120 jam 30m") into a clean "H:MM" string.
 */
export function normalizeTimeToHHMM(timeVal: string | number | null | undefined): string {
  if (timeVal === null || timeVal === undefined) return '0:00';
  let str = String(timeVal).trim();
  if (!str || str === '-' || str === '0' || str === '0:00' || str === '0.0') return '0:00';

  // 1. Handle GViz Date format: Date(1899,11,30,8,0,0) or Date(YYYY,M,D,H,M,S)
  const gvizTimeMatch = str.match(/Date\(\d+,\s*\d+,\s*\d+,\s*(\d{1,2}),\s*(\d{1,2})(?:,\s*(\d{1,2}))?\)/i);
  if (gvizTimeMatch) {
    const h = parseInt(gvizTimeMatch[1], 10);
    const m = parseInt(gvizTimeMatch[2], 10);
    const mPad = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mPad}`;
  }

  // 2. Handle Indonesian formatted text e.g. "16.270 jam 23m" or "2.818 jam"
  const jamMatch = str.match(/([\d.]+)\s*jam/i);
  const minMatch = str.match(/(\d+)\s*m/i);
  if (jamMatch || minMatch) {
    const rawH = jamMatch ? jamMatch[1].replace(/\./g, '') : '0';
    const h = parseInt(rawH, 10) || 0;
    const m = minMatch ? parseInt(minMatch[1], 10) || 0 : 0;
    const mPad = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mPad}`;
  }

  // 3. Handle HH:MM or HH:MM:SS with possible thousand separator dots e.g. "16.270:23" or "16270:23"
  if (str.includes(':')) {
    const parts = str.split(':');
    const hStr = parts[0].replace(/\./g, '');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const mPad = m < 10 ? `0${m}` : `${m}`;
    return `${h}:${mPad}`;
  }

  // 4. Handle integer thousands with dots e.g. "16.270" or "2.818"
  if (str.includes('.')) {
    const dotParts = str.split('.');
    if (dotParts[0] !== '0' && dotParts[1] && dotParts[1].length === 3 && dotParts.length === 2) {
      const h = parseInt(str.replace(/\./g, ''), 10) || 0;
      return `${h}:00`;
    }
  }

  // 5. Handle decimal numbers e.g. "0.3333333" (day fraction) or "8.5" (hours)
  str = str.replace(',', '.');
  const num = parseFloat(str);
  if (!isNaN(num) && num > 0) {
    if (num < 1) {
      // Fraction of a 24-hour day in Google Sheets (e.g. 0.33333333 = 8 hours)
      const totalMinutes = Math.round(num * 24 * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const mPad = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${mPad}`;
    } else {
      // Decimal hours e.g. 8.5 hours -> 8:30
      const totalMinutes = Math.round(num * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      const mPad = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${mPad}`;
    }
  }

  return '0:00';
}

/**
 * Accurately calculates duration between start and finish time strings (e.g. "10:40" and "14:20" => "3:40")
 * Subtracts breakTime if provided. Falls back to rawTotal if start/finish unavailable.
 */
export function calculateDurationFromTimes(
  startStr?: string,
  finishStr?: string,
  breakStr?: string,
  rawTotal?: string
): string {
  const normStart = normalizeTimeToHHMM(startStr);
  const normFinish = normalizeTimeToHHMM(finishStr);
  const normBreak = normalizeTimeToHHMM(breakStr);
  const normTotal = normalizeTimeToHHMM(rawTotal);

  if (normStart !== '0:00' && normFinish !== '0:00') {
    const sParts = normStart.split(':');
    const fParts = normFinish.split(':');
    const sMins = parseInt(sParts[0], 10) * 60 + parseInt(sParts[1], 10);
    const fMins = parseInt(fParts[0], 10) * 60 + parseInt(fParts[1], 10);
    let diff = fMins - sMins;
    if (diff < 0) diff += 24 * 60; // Overnight shift

    if (normBreak !== '0:00') {
      const bParts = normBreak.split(':');
      const bMins = parseInt(bParts[0], 10) * 60 + parseInt(bParts[1], 10);
      if (bMins > 0 && bMins < diff) diff -= bMins;
    }

    // Safety guard: single daily task cannot exceed 24 hours (prevents spreadsheet formula typos)
    if (diff > 24 * 60) {
      diff = 8 * 60;
    }

    if (diff > 0) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      const mPad = m < 10 ? `0${m}` : `${m}`;
      return `${h}:${mPad}`;
    }
  }

  if (normTotal !== '0:00') return normTotal;

  return '0:00';
}

/**
 * Parses time string like "8257:40", "120.5", or 120 into total decimal hours (e.g. 120.5)
 */
export function timeToDecimalHours(timeStr: string | number): number {
  const hhmm = normalizeTimeToHHMM(timeStr);
  const parts = hhmm.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours + minutes / 60;
}

/**
 * Formats decimal hours back to formatted string "8,257 jam 40m"
 */
export function formatDecimalHours(decimalHours: number): string {
  if (isNaN(decimalHours) || decimalHours <= 0) return '0 jam';
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const formattedHours = hours.toLocaleString('id-ID');
  if (minutes === 0) return `${formattedHours} jam`;
  return `${formattedHours} jam ${minutes}m`;
}

/**
 * Formats time string "8257:40" into readable Indonesian text "8.257 jam 40m"
 */
export function formatTimeString(timeStr: string | number): string {
  const hhmm = normalizeTimeToHHMM(timeStr);
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const formattedH = h.toLocaleString('id-ID');
  if (m === 0) return `${formattedH} jam`;
  return `${formattedH} jam ${m}m`;
}

/**
 * Calculates sum of time strings e.g. ["10:30", "20:45"] => "31:15"
 */
export function sumTimeStrings(timeStrs: (string | number)[]): string {
  let totalMinutes = 0;
  for (const timeVal of timeStrs) {
    const hhmm = normalizeTimeToHHMM(timeVal);
    const [h, m] = hhmm.split(':');
    totalMinutes += (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const mPad = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mPad}`;
}

/**
 * Calculate totals across multiple division hours
 */
export function calculateTotalDivisionHours(units: ProjectUnit[]) {
  const mechanicSum = sumTimeStrings(units.map(u => u.divisionHours.mechanic));
  const bodyWorkSum = sumTimeStrings(units.map(u => u.divisionHours.bodyWork));
  const bodyPaintSum = sumTimeStrings(units.map(u => u.divisionHours.bodyPaint));
  const interiorSum = sumTimeStrings(units.map(u => u.divisionHours.interior));
  const chromeSum = sumTimeStrings(units.map(u => u.divisionHours.chrome));
  const bubutSum = sumTimeStrings(units.map(u => u.divisionHours.bubut));
  const grandTotalSum = sumTimeStrings(units.map(u => u.divisionHours.total));

  return {
    mechanic: mechanicSum,
    bodyWork: bodyWorkSum,
    bodyPaint: bodyPaintSum,
    interior: interiorSum,
    chrome: chromeSum,
    bubut: bubutSum,
    total: grandTotalSum,
    decimalTotals: {
      mechanic: timeToDecimalHours(mechanicSum),
      bodyWork: timeToDecimalHours(bodyWorkSum),
      bodyPaint: timeToDecimalHours(bodyPaintSum),
      interior: timeToDecimalHours(interiorSum),
      chrome: timeToDecimalHours(chromeSum),
      bubut: timeToDecimalHours(bubutSum),
      total: timeToDecimalHours(grandTotalSum),
    }
  };
}

/**
 * Extracts priority number for sorting ("PRIORITAS 1" => 1, "WAITING LIST" => 999)
 */
export function parsePriorityRank(priorityStr: string): number {
  if (!priorityStr) return 999;
  const match = priorityStr.match(/PRIORITAS\s+(\d+)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (priorityStr.toUpperCase().includes('WAITING')) return 900;
  return 999;
}

/**
 * Converts decimal hours back to HH:MM format (e.g. 120.5 => "120:30")
 */
export function decToHHMM(dec: number): string {
  if (isNaN(dec) || dec <= 0) return '0:00';
  const totalMinutes = Math.round(dec * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const mPad = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mPad}`;
}

/**
 * Calculates remaining target hours (Sisa Target Awal = Target Awal - Jam Real).
 * Returns { diffDec, formattedStr, isOver: boolean, isZero: boolean }
 */
export function calculateSisaTarget(targetVal: string | number, actualVal: string | number) {
  const targetDec = timeToDecimalHours(targetVal);
  const actualDec = timeToDecimalHours(actualVal);
  const diffDec = targetDec - actualDec;

  if (Math.abs(diffDec) < 0.001) {
    return { diffDec: 0, formattedStr: '0:00', isOver: false, isZero: true };
  }

  if (diffDec > 0) {
    return { diffDec, formattedStr: `+${decToHHMM(diffDec)}`, isOver: false, isZero: false };
  } else {
    return { diffDec, formattedStr: `-${decToHHMM(Math.abs(diffDec))}`, isOver: true, isZero: false };
  }
}

