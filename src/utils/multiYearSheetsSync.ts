import { HasilKerjaMultiYearRecord } from '../data/hasilKerja2023_2026Data';
import { parseCSVRow, extractSpreadsheetId, SHEET_URL_STORAGE_KEY } from './googleSheetsSync';

export interface MultiYearSheetConfig {
  year: string;
  id: string;
  title: string;
  url: string;
  months: string[];
}

/**
 * 4 Google Spreadsheets 2023 - 2026:
 * Tab bulanan aktif pengerjaan unit restorasi
 */
export const MULTI_YEAR_SHEETS: Record<string, MultiYearSheetConfig> = {
  '2023': {
    year: '2023',
    id: '1YDRqJ-xJ3wTECsxh2pkOykvzNy70TPuw3j8qxTFacu4',
    title: 'HASIL KERJA 2023',
    url: 'https://docs.google.com/spreadsheets/d/1YDRqJ-xJ3wTECsxh2pkOykvzNy70TPuw3j8qxTFacu4/edit',
    months: [
      'JANUARI 2023',
      'FEBRUARI 2023',
      'MARET 2023',
      'APRIL 2023',
      'MEI 2023',
      'JUNI 2023',
      'JULI 2023',
      'AGUSTUS 2023',
      'SEPTEMBER 2023',
      'OKTOBER 2023',
      'NOVEMBER 2023',
      'DESEMBER 2023',
    ],
  },
  '2024': {
    year: '2024',
    id: '158MGWDu4vvjOwv_WkqUiXj4cDTHlaD0tPaEG2bAuuTA',
    title: 'HASIL KERJA 2024',
    url: 'https://docs.google.com/spreadsheets/d/158MGWDu4vvjOwv_WkqUiXj4cDTHlaD0tPaEG2bAuuTA/edit',
    months: [
      'JANUARI 2024',
      'FEBRUARI 2024',
      'MARET 2024',
      'APRIL 2024',
      'MEI 2024',
      'JUNI 2024',
      'JULI 2024',
      'AGUSTUS 2024',
      'SEPTEMBER 2024',
      'OKTOBER 2024',
      'NOVEMBER 2024',
      'DESEMBER 2024',
    ],
  },
  '2025': {
    year: '2025',
    id: '1JO8bCdVw2MiDJqeBDG9LNX2IiR_wev3DSzqnVdTHj8g',
    title: 'HASIL KERJA 2025',
    url: 'https://docs.google.com/spreadsheets/d/1JO8bCdVw2MiDJqeBDG9LNX2IiR_wev3DSzqnVdTHj8g/edit',
    months: [
      'JANUARI 2025',
      'FEBRUARI 2025',
      'MARET 2025',
      'APRIL 2025',
      'MEI 2025',
      'JUNI 2025',
      'JULI 2025',
      'AGUSTUS 2025',
      'SEPTEMBER 2025',
      'OKTOBER 2025',
      'NOVEMBER 2025',
      'DESEMBER 2025',
    ],
  },
  '2026': {
    year: '2026',
    id: '1s2OyAqvgvw64yhz0RW0QXGThcpv1vJo9JcKbxIlkfyk',
    title: 'HASIL KERJA 2026',
    url: 'https://docs.google.com/spreadsheets/d/1s2OyAqvgvw64yhz0RW0QXGThcpv1vJo9JcKbxIlkfyk/edit',
    months: [
      'JANUARI 2026',
      'FEBRUARI 2026',
      'MARET 2026',
      'APRIL 2026',
      'MEI 2026',
      'JUNI 2026',
      'JULI 2026',
      'AGUSTUS 2026',
      'SEPTEMBER 2026',
      'OKTOBER 2026',
      'NOVEMBER 2026',
      'DESEMBER 2026',
    ],
  },
};

export interface QueryMultiYearParams {
  unit?: string;
  panel?: string;
  divisi?: string;
  year?: string;
  month?: string;
  onProgress?: (progress: {
    scanned: number;
    total: number;
    currentMonth: string;
    foundCount: number;
  }) => void;
}

/**
 * Executes a JSONP request to Google Visualization API.
 * Bypasses CORS limitations in standard browsers.
 */
export function fetchGvizJsonp(
  sheetId: string,
  sheetName: string,
  tq: string
): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return resolve(null);
    }

    const callbackName = `gviz_cb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const script = document.createElement('script');
    let isResolved = false;

    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(null);
      }
    }, 12000);

    const cleanup = () => {
      clearTimeout(timeout);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as any)[callbackName];
    };

    (window as any)[callbackName] = (data: any) => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(data);
      }
    };

    script.onerror = () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve(null);
      }
    };

    const encodedTq = encodeURIComponent(tq);
    const encodedSheet = encodeURIComponent(sheetName);
    script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:${callbackName}&sheet=${encodedSheet}&tq=${encodedTq}`;

    document.head.appendChild(script);
  });
}

/**
 * Fetches via Vite backend proxy or direct CSV fetch
 */
export async function fetchSheetCsvViaProxy(
  sheetId: string,
  sheetName: string,
  tq: string
): Promise<string | null> {
  try {
    const encodedTq = encodeURIComponent(tq);
    const encodedSheet = encodeURIComponent(sheetName);
    
    // 1. Try local Vite proxy endpoint
    const proxyUrl = `/api/multiyear-sheets?id=${sheetId}&sheet=${encodedSheet}&tq=${encodedTq}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) return text;
    }
  } catch (err) {
    // ignore and continue
  }

  // 2. Direct fetch attempt
  try {
    const encodedTq = encodeURIComponent(tq);
    const encodedSheet = encodeURIComponent(sheetName);
    const directUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}&tq=${encodedTq}`;
    const res = await fetch(directUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) return text;
    }
  } catch (e) {
    // continue
  }

  return null;
}

/**
 * Extracts cell text cleanly from GViz cell object
 */
function getCellString(cell: any): string {
  if (!cell) return '';
  if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
  if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
  return '';
}

/**
 * Helper to clean up date string (e.g., converts 'Date(2023,0,2)' to '02/01/2023')
 */
export function formatRawDateString(rawDate: string, monthNameFallback: string): string {
  if (!rawDate || rawDate.trim() === '') return monthNameFallback;
  const trimmed = rawDate.trim();

  // If GViz Date object format: Date(YYYY, M, D) e.g. Date(2023,0,2)
  const gvizDateMatch = trimmed.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)/i);
  if (gvizDateMatch) {
    const yyyy = gvizDateMatch[1];
    const mZero = parseInt(gvizDateMatch[2], 10) + 1; // 0-indexed month in JS
    const dd = parseInt(gvizDateMatch[3], 10);
    const mStr = mZero < 10 ? `0${mZero}` : `${mZero}`;
    const dStr = dd < 10 ? `0${dd}` : `${dd}`;
    return `${dStr}/${mStr}/${yyyy}`;
  }

  return trimmed || monthNameFallback;
}

/**
 * Parses GViz JSON Table Response into HasilKerjaMultiYearRecord array
 */
export function parseGvizTableToRecords(
  table: any,
  year: string,
  monthName: string
): HasilKerjaMultiYearRecord[] {
  if (!table || !table.rows || !Array.isArray(table.rows)) return [];

  const records: HasilKerjaMultiYearRecord[] = [];

  table.rows.forEach((row: any, index: number) => {
    const c = row.c || [];
    const rawTanggal = getCellString(c[0]);
    const tanggal = formatRawDateString(rawTanggal, monthName);
    const divisi = getCellString(c[1]);
    const unit = getCellString(c[2]);
    const nama = getCellString(c[3]);
    const panelPart = getCellString(c[4]);
    const jobdesc = getCellString(c[5]);
    const keterangan = getCellString(c[6]);
    const start = getCellString(c[7]);
    const estimasi = getCellString(c[8]);
    const breakTime = getCellString(c[9]);
    const finish = getCellString(c[10]);
    const status = getCellString(c[11]) || 'Done';
    const totalJamKerja = getCellString(c[12]) || '0:00';

    if (!unit || unit.toUpperCase() === 'UNIT' || unit.toUpperCase() === 'NAMA UNIT') return;
    if (nama.toUpperCase() === 'NAMA' || nama.toUpperCase() === 'PERSONIL') return;

    records.push({
      id: `my_${year}_${monthName.replace(/\s+/g, '_')}_${index}_${Date.now()}`,
      tanggal: tanggal,
      tahun: year,
      divisi: divisi || 'CHROME',
      unit: unit,
      nama: nama || '-',
      panelPart: panelPart || '-',
      jobdesc: jobdesc || 'Pekerjaan Restorasi Unit',
      keterangan: keterangan || '-',
      start: start,
      estimasi: estimasi,
      breakTime: breakTime,
      finish: finish,
      status: status,
      totalJamKerja: totalJamKerja || '0:00',
    });
  });

  return records;
}

/**
 * Parses CSV text into HasilKerjaMultiYearRecord array
 */
export function parseCsvTextToRecords(
  csvText: string,
  year: string,
  monthName: string
): HasilKerjaMultiYearRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: HasilKerjaMultiYearRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length === 0) continue;

    const rawTanggal = row[0]?.trim() || '';
    const tanggal = formatRawDateString(rawTanggal, monthName);
    const divisi = row[1]?.trim() || 'CHROME';
    const unit = row[2]?.trim() || '';
    const nama = row[3]?.trim() || '';
    const panelPart = row[4]?.trim() || '-';
    const jobdesc = row[5]?.trim() || '';
    const keterangan = row[6]?.trim() || '-';
    const start = row[7]?.trim() || '';
    const estimasi = row[8]?.trim() || '';
    const breakTime = row[9]?.trim() || '';
    const finish = row[10]?.trim() || '';
    const status = row[11]?.trim() || 'Done';
    const totalJamKerja = row[12]?.trim() || '0:00';

    if (!unit || unit.toUpperCase() === 'UNIT' || unit.toUpperCase() === 'NAMA UNIT') continue;
    if (nama.toUpperCase() === 'NAMA' || nama.toUpperCase() === 'PERSONIL') continue;

    records.push({
      id: `my_csv_${year}_${monthName.replace(/\s+/g, '_')}_${i}_${Date.now()}`,
      tanggal: tanggal,
      tahun: year,
      divisi,
      unit,
      nama,
      panelPart,
      jobdesc: jobdesc || 'Pekerjaan Restorasi Unit',
      keterangan,
      start,
      estimasi,
      breakTime,
      finish,
      status,
      totalJamKerja,
    });
  }

  return records;
}

/**
 * Memory query cache to avoid re-querying identical filters
 */
const queryCache = new Map<string, HasilKerjaMultiYearRecord[]>();

/**
 * Main query function that queries the 4 Google Spreadsheets (2023-2026)
 * across their monthly tabs based on selected Unit, Panel, Divisi, and Year.
 */
export async function queryMultiYearSheets(
  params: QueryMultiYearParams
): Promise<HasilKerjaMultiYearRecord[]> {
  const { unit = '', panel = '', divisi = 'ALL', year = 'ALL', month = 'ALL', onProgress } = params;

  const cacheKey = `${unit.toLowerCase().trim()}_${panel.toLowerCase().trim()}_${divisi}_${year}_${month}`;
  if (queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey)!;
    if (onProgress) {
      onProgress({
        scanned: 1,
        total: 1,
        currentMonth: 'Memuat dari Cache Cepat',
        foundCount: cached.length,
      });
    }
    return cached;
  }

  // Construct Google Visualization Query
  const whereClauses: string[] = [];

  if (unit.trim()) {
    const raw = unit.trim().toLowerCase().replace(/"/g, '');
    if (raw !== 'all unit' && raw !== 'semua unit' && raw !== 'all') {
      const ownerMatch = raw.match(/\b(anderson|james|ichsan|handy|diko|indra|didi|santoso|nyoman|adrian|musa|maliq|joko|nina|andrew|marthin|stanley|eric|pram|richard|ilham|abong|chandra|henry)\b/i);
      const ownerName = ownerMatch ? ownerMatch[1].toLowerCase() : null;

      const conditions: string[] = [];
      conditions.push(`lower(C) contains "${raw}"`);

      // Extract cleaned string without titles like mr, mrs, sm
      const clean = raw.replace(/\b(mr|mrs|sm)\.?\b/gi, '').trim();
      if (clean && clean !== raw && clean.length > 2) {
        conditions.push(`lower(C) contains "${clean}"`);
      }

      if (ownerName) {
        // If owner name exists, require owner name + model number/keyword
        const numbers = clean.match(/\b\d{2,4}\b/g) || [];
        numbers.forEach((num) => {
          conditions.push(`(lower(C) contains "${num}" and lower(C) contains "${ownerName}")`);
        });
      } else {
        // No owner name specified, match model number directly
        const numbers = clean.match(/\b\d{2,4}\b/g) || [];
        numbers.forEach((num) => {
          conditions.push(`lower(C) contains "${num}"`);
        });
      }

      if (conditions.length > 0) {
        whereClauses.push(`(${conditions.join(' or ')})`);
      }
    }
  }

  if (panel.trim()) {
    const cleanPanel = panel.trim().toLowerCase().replace(/"/g, '');
    whereClauses.push(`lower(E) contains "${cleanPanel}"`);
  }

  if (divisi && divisi !== 'ALL') {
    const cleanDivisi = divisi.trim().toLowerCase().replace(/"/g, '');
    whereClauses.push(`lower(B) contains "${cleanDivisi}"`);
  }

  const tq = whereClauses.length > 0 ? `SELECT * WHERE ${whereClauses.join(' and ')}` : 'SELECT *';

  // Determine target years
  const targetYears = year === 'ALL' ? ['2026', '2025', '2024', '2023'] : [year];

  // Check if user has a custom saved Google Sheet ID
  let userSavedId: string | null = null;
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || localStorage.getItem('sm_google_sheet_url');
    if (savedUrl) {
      userSavedId = extractSpreadsheetId(savedUrl);
    }
  }

  // Collect list of { year, sheetId, monthName } to query
  interface TabQueryTask {
    year: string;
    sheetId: string;
    monthName: string;
  }

  const tasks: TabQueryTask[] = [];

  // 1. If user saved a custom spreadsheet ID, add task for HASIL KERJA 2023 - 2026 tab on that sheet
  if (userSavedId) {
    tasks.push({
      year: '2026',
      sheetId: userSavedId,
      monthName: 'HASIL KERJA 2023 - 2026',
    });
    tasks.push({
      year: '2026',
      sheetId: userSavedId,
      monthName: 'HASIL KERJA SEPTEMBER',
    });
  }

  // 2. Query default 4 multi-year spreadsheets (2023-2026)
  for (const yr of targetYears) {
    const config = MULTI_YEAR_SHEETS[yr];
    if (!config) continue;

    const monthsToScan =
      month && month !== 'ALL'
        ? config.months.filter((m) => m.toUpperCase().includes(month.toUpperCase()))
        : config.months;

    for (const m of monthsToScan) {
      // Avoid duplicate task if userSavedId is identical to config.id
      if (userSavedId && config.id === userSavedId && (m === 'HASIL KERJA 2023 - 2026' || m === 'HASIL KERJA SEPTEMBER')) {
        continue;
      }
      tasks.push({
        year: yr,
        sheetId: config.id,
        monthName: m,
      });
    }
  }

  const totalTasks = tasks.length;
  let scannedCount = 0;
  const allRecords: HasilKerjaMultiYearRecord[] = [];

  // Run tasks in concurrency batches of 4
  const CONCURRENCY = 4;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);

    const batchPromises = batch.map(async (task) => {
      try {
        // Step A: Try Proxy first (Node server-side proxy)
        const csv = await fetchSheetCsvViaProxy(task.sheetId, task.monthName, tq);
        if (csv) {
          const recs = parseCsvTextToRecords(csv, task.year, task.monthName);
          return recs;
        }

        // Step B: Try JSONP fallback
        const gvizData = await fetchGvizJsonp(task.sheetId, task.monthName, tq);
        if (gvizData && gvizData.table) {
          const recs = parseGvizTableToRecords(gvizData.table, task.year, task.monthName);
          return recs;
        }
      } catch (err) {
        console.warn(`Query error for ${task.year} - ${task.monthName}:`, err);
      }
      return [];
    });

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach((recs, batchIdx) => {
      scannedCount++;
      if (recs && recs.length > 0) {
        allRecords.push(...recs);
      }
      if (onProgress) {
        onProgress({
          scanned: scannedCount,
          total: totalTasks,
          currentMonth: batch[batchIdx]?.monthName || '',
          foundCount: allRecords.length,
        });
      }
    });
  }

  // Cache results
  queryCache.set(cacheKey, allRecords);

  return allRecords;
}
