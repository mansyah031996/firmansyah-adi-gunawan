import {
  ProjectUnit,
  ProjectManager,
  MarginType,
  TeamLead,
  ProgressCategory,
  ProjectStatus,
  DashboardTab,
  ActualJobdescRecord,
  HasilKerjaAgustusRecord,
  SPKRecord,
  SPLRecord,
  PerhitunganJamKerjaRealRow,
  TargetSeptemberSummary,
  TargetProjectDailyTables,
} from '../types';
import { normalizeTimeToHHMM, sumTimeStrings, timeToDecimalHours, decToHHMM } from './timeUtils';

export const DEFAULT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0/edit?gid=1940937859#gid=1940937859';
export const OFFICIAL_DASHBOARD_URL = 'https://tinyurl.com/DASHBOARD-TEAM-CI';
export const SHEET_URL_STORAGE_KEY = 'sm_google_sheet_url';
export const SEPTEMBER_DAILY_TABLES_STORAGE_KEY = 'sm_september_daily_tables_v2';

export const SHEET_TAB_GIDS: Record<string, string> = {
  timeline: '1940937859',               // URUTAN UNIT DELIVERY
  overview: '938106022',                // TARGET PROJECT SEPTEMBER
  target_september: '938106022',        // TARGET PROJECT SEPTEMBER
  actual_september: '292168166',        // ACTUAL JOBDESC SEPTEMBER
  hasil_kerja_september: '65933745',    // HASIL KERJA SEPTEMBER
  table: '65933745',                    // HASIL KERJA (now September)
  daftar_unit: '111152824',             // DAFTAR UNIT
  hasil_kerja_2023_2026: '1768672018', // HASIL KERJA 2023 - 2026 (GID 1768672018)
  spk: '622501492',                     // SPK
  spl: '131205278',                     // SPL
  presentation: '1940937859',           // PRESENTATION SLIDES
  // Historical
  target_agustus: '1109052022',         // TARGET PROJECT AGUSTUS
  actual_agustus: '1662570265',         // ACTUAL JOBDESC AGUSTUS
  hasil_kerja_agustus: '1679857860',    // HASIL KERJA AGUSTUS
  divisions: '1780918669',              // HASIL KERJA JULI
};

/**
 * Parses CSV for SPK (GID 622501492) into SPKRecord array.
 */
export function parseSPKCSV(csvText: string): SPKRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: SPKRecord[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const no = row[1]?.trim() || '';
    const unitName = row[2]?.trim() || '';

    // Include valid units, including WORKSHOP (which is Unit 13 in Direksi & Non Margin)
    if (
      unitName &&
      unitName.toUpperCase() !== 'NAMA UNIT' &&
      !unitName.toUpperCase().includes('FULL RESTORATION') &&
      !unitName.toUpperCase().includes('UNIT DIREKSI') &&
      !unitName.toUpperCase().includes('SURAT PERINTAH') &&
      no &&
      !isNaN(parseInt(no, 10))
    ) {
      const yudha = row[3]?.trim().toUpperCase() === 'TRUE';
      const aries = row[4]?.trim().toUpperCase() === 'TRUE';
      // Col 5 is OPIK in Google Sheet source (formerly labelled pratama)
      const opik = row[5]?.trim().toUpperCase() === 'TRUE';
      const pratama = opik; // alias for backwards compatibility
      const taufik = row[6]?.trim().toUpperCase() === 'TRUE';

      const bodyWork = row[7]?.trim().toUpperCase() === 'TRUE';
      const bodyPaint = row[8]?.trim().toUpperCase() === 'TRUE';
      const interior = row[9]?.trim().toUpperCase() === 'TRUE';
      const chrome = row[10]?.trim().toUpperCase() === 'TRUE';
      const bubut = row[11]?.trim().toUpperCase() === 'TRUE';

      const count =
        (yudha ? 1 : 0) +
        (aries ? 1 : 0) +
        (opik ? 1 : 0) +
        (taufik ? 1 : 0) +
        (bodyWork ? 1 : 0) +
        (bodyPaint ? 1 : 0) +
        (interior ? 1 : 0) +
        (chrome ? 1 : 0) +
        (bubut ? 1 : 0);

      const totalParsed = parseInt(row[12]?.trim() || '0', 10);
      const total = isNaN(totalParsed) || totalParsed === 0 ? count : totalParsed;
      const keterangan = row[13]?.trim() || '';

      records.push({
        id: `spk_${records.length + 1}`,
        no,
        unitName,
        yudha,
        aries,
        opik,
        pratama,
        taufik,
        bodyWork,
        bodyPaint,
        interior,
        chrome,
        bubut,
        total,
        keterangan,
      });
    }
  }

  return records;
}

/**
 * Parses CSV for SPL (GID 131205278) into SPLRecord array.
 */
export function parseSPLCSV(csvText: string): SPLRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: SPLRecord[] = [];
  let currentDate = 'Jumat, 18 September 2026';
  let lastNo = '1';
  let lastTech = '';

  for (let i = 0; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row.length === 0) continue;

    const rowJoined = row.join(' ').trim();
    const rowUpper = rowJoined.toUpperCase();

    // 1. Detect Date Row (e.g. "Jumat, 18 September 2026", "Kamis, 30 Juli 2026")
    let dateFound = false;
    for (const cell of row) {
      const val = cell.trim().toLowerCase();
      if (!val || val.length > 60) continue;
      const hasDay = /senin|selasa|rabu|kamis|jumat|sabtu|minggu/.test(val);
      const hasMonth = /januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|august|july/.test(val);
      if (hasDay && hasMonth && !val.includes('surat perintah') && !val.includes('target') && !val.includes('hasil kerja')) {
        currentDate = cell.trim();
        dateFound = true;
        break;
      }
    }
    if (dateFound) continue;

    // 2. Filter out ALL title banners, header labels, and summary titles
    if (
      rowUpper.includes('SURAT PERINTAH LEMBUR') ||
      rowUpper.includes('STANLEY MARTHIN') ||
      rowUpper.includes('JOBDESC UTAMA') ||
      rowUpper.includes('JOBDESC TAMBAHAN') ||
      rowUpper.includes('DAFTAR NAMA') ||
      rowUpper.includes('RINCIAN JOBDESC') ||
      rowUpper.includes('TOTAL JAM') ||
      rowUpper.includes('TARGET AWAL') ||
      rowUpper.includes('SISA TARGET')
    ) {
      continue;
    }

    // Skip empty lines or placeholder lines like "1,-"
    if (rowJoined.replace(/[, \t-]/g, '').length === 0 || rowJoined.replace(/[, \t]/g, '') === '1-') {
      continue;
    }

    // Check if row is the column header row (NO, NAMA, WAKTU, UNIT, PANEL, JOBDESC...)
    const row0 = (row[0] || '').trim().toUpperCase();
    const row1 = (row[1] || '').trim().toUpperCase();
    const row2 = (row[2] || '').trim().toUpperCase();

    if (
      row1 === 'NO.' || row1 === 'NO' ||
      row2 === 'NAMA' || row2 === 'NAMA TEKNISI' ||
      row0 === 'NO.' || row0 === 'NO'
    ) {
      continue;
    }

    // 3. Detect Technician & Sequence Number
    let noStr = '';
    let namaStr = '';

    const col1 = (row[1] || '').trim();
    const col2 = (row[2] || '').trim();

    if (col1 && /^\d+$/.test(col1)) {
      noStr = col1;
      namaStr = col2;
      lastTech = namaStr;
    } else if (col2 && !col2.includes(':') && !/^\d+$/.test(col2) && col2 !== '-') {
      namaStr = col2;
      lastTech = namaStr;
    } else if (col1 && !col1.includes(':') && !/^\d+$/.test(col1) && col1 !== '-') {
      namaStr = col1;
      lastTech = namaStr;
    } else {
      namaStr = lastTech;
    }

    if (!namaStr || namaStr === '-' || namaStr.toUpperCase() === 'NAMA' || namaStr.toUpperCase() === 'NO.') {
      continue;
    }

    if (
      namaStr.toUpperCase().includes('STANLEY') ||
      namaStr.toUpperCase().includes('RESTORATION') ||
      namaStr.toUpperCase().includes('JOBDESC') ||
      namaStr.toUpperCase().includes('SURAT')
    ) {
      continue;
    }

    if (noStr) lastNo = noStr;

    // 4. Parse Time / Waktu (e.g. 17:00 - 22:00, 17:00 - 19:30, 19:30 - 22:00)
    let startTime = '17:00';
    let endTime = '22:00';
    let ovHours = 5;

    const times: string[] = [];
    for (let cIdx = 3; cIdx < Math.min(10, row.length); cIdx++) {
      let cellVal = (row[cIdx] || '').trim().replace(';', ':');
      if (cellVal.startsWith('40800')) cellVal = '17:00'; // Typo correction in spreadsheet
      const m = cellVal.match(/\b([0-2]?[0-9]:[0-5][0-9])\b/);
      if (m && !times.includes(m[1])) times.push(m[1]);
    }

    if (times.length >= 2) {
      startTime = times[0];
      endTime = times[1];
    } else if (times.length === 1) {
      startTime = times[0];
      endTime = '22:00';
    }

    // Calculate overtime duration
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    if (!isNaN(sh) && !isNaN(eh)) {
      let diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
      if (diff > 0) ovHours = Math.round((diff / 60) * 10) / 10;
    }

    // 5. Unit Name (Col I / idx 8)
    let unitName = row[8]?.trim() || row[7]?.trim() || row[9]?.trim() || '';
    if (!unitName || unitName === '-' || unitName.includes(':') || /^\d+$/.test(unitName)) {
      const unitCandidate = row.find(
        (c) =>
          c &&
          (c.toUpperCase().includes('MB ') ||
            c.toUpperCase().includes('JAGUAR') ||
            c.toUpperCase().includes('CHEVROLET') ||
            c.toUpperCase().includes('TOYOTA') ||
            c.toUpperCase().includes('PORSCHE') ||
            c.toUpperCase().includes('PONTON') ||
            c.toUpperCase().includes('BATMAN') ||
            c.toUpperCase().includes('PAGODA') ||
            c.toUpperCase().includes('190 SL') ||
            c.toUpperCase().includes('500 SEC') ||
            c.toUpperCase().includes('300 CE') ||
            c.toUpperCase().includes('280 GE') ||
            c.toUpperCase().includes('FERRARI') ||
            c.toUpperCase().includes('WORKSHOP') ||
            c.toUpperCase().includes('ALL UNIT'))
      );
      unitName = unitCandidate ? unitCandidate.trim() : (rowJoined.toUpperCase().includes('WORKSHOP') ? 'WORKSHOP' : 'ALL UNIT');
    }

    // 6. Panel / Part (Col M / idx 12)
    let panelPart = row[12]?.trim() || row[11]?.trim() || row[10]?.trim() || row[13]?.trim() || '';
    if (!panelPart || panelPart === '-' || panelPart.includes(':') || panelPart === unitName || panelPart === namaStr) {
      panelPart = '-';
    }

    // 7. Jobdesc (Col Q / idx 16)
    let jobdesc = row[16]?.trim() || row[15]?.trim() || row[17]?.trim() || row[14]?.trim() || '';
    if (!jobdesc || jobdesc === '-' || jobdesc === panelPart || jobdesc === unitName) {
      const longText = row
        .filter((c) => c && c.length > 3 && !c.includes(':') && c !== unitName && c !== namaStr && c !== currentDate && c !== panelPart)
        .sort((a, b) => b.length - a.length)[0];
      if (longText) jobdesc = longText.trim();
    }
    if (!jobdesc) jobdesc = 'Pekerjaan Lembur';

    // 8. Target Awal & Sisa Target (Col X / idx 23, Col Y / idx 24)
    let targetAwal = row[23]?.trim() || row[21]?.trim() || row[22]?.trim() || '';
    let sisaTarget = row[24]?.trim() || row[22]?.trim() || row[23]?.trim() || '';
    let keterangan = row[25]?.trim() || row[24]?.trim() || '';

    if (!targetAwal.includes(':') && !sisaTarget.includes(':')) {
      const endingTimes = row.slice(18).map(c => c.trim().replace(';', ':')).filter((c) => /^\d{1,3}:\d{2}$/.test(c));
      if (endingTimes.length >= 2) {
        targetAwal = endingTimes[0];
        sisaTarget = endingTimes[1];
      } else if (endingTimes.length === 1) {
        targetAwal = endingTimes[0];
        sisaTarget = endingTimes[0];
      }
    }

    // Team lead detection
    let teamLead = '';
    const knownLeads = ['YUDHA', 'ARIES', 'OPIK', 'PRATAMA', 'TAUFIK', 'EDWAR', 'IQBAL', 'SYAHRU', 'FIRMAN'];
    if (knownLeads.includes(namaStr.toUpperCase())) {
      teamLead = namaStr.toUpperCase();
    } else {
      const leadMatch = row.find((c) => knownLeads.includes(c?.trim().toUpperCase()));
      if (leadMatch) teamLead = leadMatch.trim().toUpperCase();
    }

    const currentNo = noStr || lastNo || String(records.length + 1);
    const splCode = `SPL/2026/09/${(records.length + 1).toString().padStart(3, '0')}`;

    records.push({
      id: `spl_${records.length + 1}`,
      splNumber: splCode,
      no: currentNo,
      tanggal: currentDate,
      technicianName: namaStr,
      unitName: unitName || 'ALL UNIT',
      panelPart: panelPart || '-',
      teamLead: teamLead || '-',
      date: currentDate,
      startTime: startTime,
      endTime: endTime,
      overtimeHours: ovHours,
      targetHours: targetAwal || `${ovHours}:00`,
      actualHours: sisaTarget || `${ovHours}:00`,
      targetAwal: targetAwal || '-',
      sisaTarget: sisaTarget || '-',
      keterangan: keterangan || (targetAwal ? `Target: ${targetAwal} | Sisa: ${sisaTarget}` : '-'),
      jobdesc: jobdesc,
      status: 'DISETUJUI',
    });
  }

  return records;
}

/**
 * Parses CSV for HASIL KERJA AGUSTUS (GID 1679857860) into HasilKerjaAgustusRecord array.
 */
export function parseHasilKerjaCSV(csvText: string): HasilKerjaAgustusRecord[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: HasilKerjaAgustusRecord[] = [];
  let currentDate = 'Jumat, 04 September 2026';

  for (let i = 0; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const dateVal = row[1]?.trim();
    const divisi = row[2]?.trim();
    const unit = row[3]?.trim();
    const nama = row[4]?.trim();

    if (dateVal && (dateVal.includes('2026') || dateVal.includes('/2026') || dateVal.toLowerCase().includes('agustus') || dateVal.toLowerCase().includes('september') || dateVal.toLowerCase().includes('sep-'))) {
      currentDate = dateVal;
    }

    if (unit && unit !== 'UNIT' && unit !== 'NAMA UNIT' && nama && nama !== 'NAMA' && nama !== 'PERSONIL') {
      const panelPart = row[5]?.trim() || '';
      const jobdesc = row[6]?.trim() || '';
      const keterangan = row[7]?.trim() || '';
      const start = row[8]?.trim() || '';
      const estimasi = row[9]?.trim() || '';
      const breakTime = row[10]?.trim() || '';
      const finish = row[11]?.trim() || '';
      const status = row[12]?.trim() || '';
      let totalJamKerja = row[20]?.trim() || row[16]?.trim() || row[13]?.trim() || '';

      if (!totalJamKerja && start && finish) {
        const [sh, sm] = start.split(':').map(Number);
        const [fh, fm] = finish.split(':').map(Number);
        if (!isNaN(sh) && !isNaN(fh)) {
          let diff = (fh * 60 + (fm || 0)) - (sh * 60 + (sm || 0));
          if (breakTime === '1:00') diff -= 60;
          if (diff > 0) {
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            totalJamKerja = `${h}:${m < 10 ? '0' : ''}${m}`;
          }
        }
      }

      records.push({
        id: `hasil_kerja_${records.length + 1}`,
        tanggal: dateVal || currentDate,
        divisi,
        unit,
        nama,
        panelPart,
        jobdesc,
        keterangan,
        start,
        estimasi,
        breakTime,
        finish,
        status: status || 'Done',
        totalJamKerja: totalJamKerja || '0:00',
      });
    }
  }

  return records;
}

/**
 * Parses CSV for ACTUAL JOBDESC AGUSTUS (GID 1662570265) into ActualJobdescRecord array.
 */
export function parseActualJobdescCSV(csvText: string): ActualJobdescRecord[] {

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const records: ActualJobdescRecord[] = [];
  let currentDate = 'Jumat, 04 September 2026';

  const isHasilKerjaFormat =
    csvText.toUpperCase().includes('HASIL KERJA AGUSTUS TANGGAL') ||
    csvText.toUpperCase().includes('HASIL KERJA SEPTEMBER TANGGAL') ||
    (lines[0] && lines[0].toUpperCase().includes('HASIL KERJA'));

  if (isHasilKerjaFormat) {
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      const dateVal = row[1]?.trim();
      const division = row[2]?.trim();
      const unit = row[3]?.trim();
      const name = row[4]?.trim();

      if (dateVal && (dateVal.includes('2026') || dateVal.includes('/2026'))) {
        currentDate = dateVal;
      }

      if (unit && unit !== 'UNIT' && unit !== 'NAMA UNIT' && name && name !== 'NAMA' && name !== 'PERSONIL') {
        const panelPart = row[5]?.trim() || '';
        const jobdesc = row[6]?.trim() || '';
        const keterangan = row[7]?.trim() || '';
        const start = row[8]?.trim() || '';
        const estimasi = row[9]?.trim() || '';
        const finish = row[11]?.trim() || '';
        const statusStr = row[12]?.trim() || '';
        const jamKerja = row[16]?.trim() || row[20]?.trim() || '';

        const calcHours = (s?: string, f?: string, jkCell?: string) => {
          if (jkCell && /^\d+:\d{2}$/.test(jkCell) && jkCell !== '0:00') return jkCell;
          if (!s || !f) return '0:00';
          const [sh, sm] = s.split(':').map(Number);
          const [fh, fm] = f.split(':').map(Number);
          if (isNaN(sh) || isNaN(fh)) return '0:00';
          const startMin = (sh || 0) * 60 + (sm || 0);
          const finishMin = (fh || 0) * 60 + (fm || 0);
          if (finishMin <= startMin) return '0:00';
          let diff = finishMin - startMin;
          if (startMin < 12 * 60 && finishMin > 13 * 60) {
            diff -= 60;
          }
          return decToHHMM(diff / 60);
        };

        const actualHours = calcHours(start, finish, jamKerja);

        let statusEmoji = '👍';
        if (statusStr.toLowerCase().includes('progress')) statusEmoji = '⚠️';
        if (statusStr.toLowerCase().includes('hold') || statusStr.toLowerCase().includes('pending')) statusEmoji = '😡';

        records.push({
          id: `hasil_kerja_agustus_${records.length + 1}`,
          date: currentDate || dateVal,
          team: division || 'ALL DIVISI',
          personil: name,
          unitName: unit,
          panelPart,
          jobdesc,
          proses: keterangan,
          keterangan,
          targetHours: estimasi || actualHours || '0:00',
          sisaTargetHours: actualHours || '0:00',
          actualHours: actualHours || '0:00',
          startTime: start,
          endTime: finish,
          statusEmoji,
          statusText: statusStr,
        });
      }
    }
  } else {
    const calcHours = (s?: string, f?: string) => {
      if (!s || !f) return '0:00';
      const [sh, sm] = s.split(':').map(Number);
      const [fh, fm] = f.split(':').map(Number);
      if (isNaN(sh) || isNaN(fh)) return '0:00';
      const startMin = (sh || 0) * 60 + (sm || 0);
      const finishMin = (fh || 0) * 60 + (fm || 0);
      if (finishMin <= startMin) return '0:00';
      let diff = finishMin - startMin;
      if (startMin < 12 * 60 && finishMin > 13 * 60) {
        diff -= 60;
      }
      return decToHHMM(diff / 60);
    };

    for (let i = 0; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      const lineUpper = lines[i].toUpperCase();

      if (lineUpper.includes('JOB DESCRIPTIONS')) {
        const match = lines[i].match(/JOB DESCRIPTIONS\s*:\s*([^"]+)/i);
        if (match) currentDate = match[1].trim();
        continue;
      }

      let teamIdx = -1;
      for (let c = 0; c < row.length; c++) {
        const val = row[c]?.trim().toUpperCase();
        if (['YUDHA', 'PRATAMA', 'ARIES', 'TAUFIK', 'MEKANIK', 'BODY WORK', 'BODY PAINT', 'INTERIOR', 'CHROME', 'BUBUT'].includes(val)) {
          teamIdx = c;
          break;
        }
      }

      if (teamIdx >= 0 && teamIdx + 2 < row.length) {
        const team = row[teamIdx]?.trim();
        const personil = row[teamIdx + 1]?.trim();
        const unitName = row[teamIdx + 2]?.trim();

        if (unitName && unitName !== 'NAMA UNIT' && personil && personil !== 'PERSONIL') {
          const panelPart = row[teamIdx + 3]?.trim() || '';
          const jobdesc = row[teamIdx + 4]?.trim() || '';
          const proses = row[teamIdx + 5]?.trim() || '';
          const ket = row[teamIdx + 6]?.trim() || '';

          const targetAwal = row[teamIdx + 7]?.trim() || '0:00';
          const sisaTarget = row[teamIdx + 9]?.trim() || targetAwal || '0:00';
          const startTime = row[teamIdx + 10]?.trim() || '';
          const endTime = row[teamIdx + 11]?.trim() || '';
          const actualHours = calcHours(startTime, endTime);

          let statusEmoji = '';
          for (let c = teamIdx + 12; c <= teamIdx + 15 && c < row.length; c++) {
            const v = row[c]?.trim();
            if (v && (v.includes('👍') || v.includes('😡') || v.includes('⚠️'))) {
              statusEmoji = v;
              break;
            }
          }

          records.push({
            id: `jobdesc_agustus_${records.length + 1}`,
            date: currentDate,
            team,
            personil,
            unitName,
            panelPart,
            jobdesc,
            proses: proses || ket,
            keterangan: ket,
            targetHours: targetAwal,
            sisaTargetHours: sisaTarget,
            actualHours,
            startTime,
            endTime,
            statusEmoji: statusEmoji || '👍',
          });
        }
      }
    }
  }

  return records;
}

/**
 * Aggregates Actual Jobdesc Records into unit agustusDivisions and agustusActualHours.
 */
export function aggregateJobdescToUnits(records: ActualJobdescRecord[], currentUnits: ProjectUnit[]): ProjectUnit[] {
  if (!records || records.length === 0) return currentUnits;

  const unitMap: Record<string, { mechanic: number; bodyWork: number; bodyPaint: number; interior: number; chrome: number; bubut: number; total: number }> = {};

  records.forEach((r) => {
    const name = r.unitName.trim().toUpperCase();
    if (!unitMap[name]) {
      unitMap[name] = { mechanic: 0, bodyWork: 0, bodyPaint: 0, interior: 0, chrome: 0, bubut: 0, total: 0 };
    }

    const dec = timeToDecimalHours(r.actualHours);
    const t = r.team.toUpperCase();
    if (t.includes('BODY WORK')) unitMap[name].bodyWork += dec;
    else if (t.includes('BODY PAINT')) unitMap[name].bodyPaint += dec;
    else if (t.includes('INTERIOR')) unitMap[name].interior += dec;
    else if (t.includes('CHROME')) unitMap[name].chrome += dec;
    else if (t.includes('BUBUT')) unitMap[name].bubut += dec;
    else unitMap[name].mechanic += dec;

    unitMap[name].total += dec;
  });

  return currentUnits.map((unit) => {
    const uName = unit.unitName.trim().toUpperCase();
    const agg = unitMap[uName];

    if (!agg) return unit;

    const mechStr = decToHHMM(agg.mechanic);
    const bwStr = decToHHMM(agg.bodyWork);
    const bpStr = decToHHMM(agg.bodyPaint);
    const intStr = decToHHMM(agg.interior);
    const chrStr = decToHHMM(agg.chrome);
    const bubStr = decToHHMM(agg.bubut);
    const totStr = decToHHMM(agg.total);

    return {
      ...unit,
      agustusActualHours: totStr,
      agustusDivisions: {
        ...unit.agustusDivisions,
        mechanic: mechStr,
        bodyWork: bwStr,
        bodyPaint: bpStr,
        interior: intStr,
        chrome: chrStr,
        bubut: bubStr,
        allDivisi: totStr,
      },
    };
  });
}

/**
 * Extracts Google Spreadsheet ID from various Google Sheet URL formats.
 */
export function extractSpreadsheetId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If user passed dashboard link (TinyURL or Cloud Run app URL), use the default master spreadsheet ID
  if (
    trimmed.includes('tinyurl.com/DASHBOARD-TEAM-CI') ||
    trimmed.includes('DASHBOARD-TEAM-CI') ||
    trimmed.includes('ais-pre-') ||
    trimmed.includes('ais-dev-')
  ) {
    return '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
  }

  // If it's already just an ID (15-100 chars alphanumeric with hyphens/underscores)
  if (/^[a-zA-Z0-9_-]{15,100}$/.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }

  // Regex to extract ID from standard Google Sheets URLs
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Extracts sheet GID (Tab ID) from URL if present (e.g. #gid=12345 or ?gid=12345).
 */
export function extractGid(url: string): string {
  if (!url) return '0';
  const match = url.match(/[?&#]gid=([0-9]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return '0';
}

export interface DiscoveredSheetTab {
  name: string;
  gid: string;
}

/**
 * Automatically discovers all sheet tabs (names and GIDs) from the Google Spreadsheet.
 * Queries the public HTML view or script tags of the Google Sheet.
 */
export async function autoDiscoverAllSheetTabs(
  urlOrId: string = DEFAULT_SHEET_URL
): Promise<DiscoveredSheetTab[]> {
  const spreadsheetId = extractSpreadsheetId(urlOrId) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
  const discovered: DiscoveredSheetTab[] = [];
  const seenGids = new Set<string>();

  // 1. Try fetching htmlview
  try {
    const htmlUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/htmlview?_cb=${Date.now()}`;
    const res = await fetch(htmlUrl);
    if (res.ok) {
      const html = await res.text();

      // Pattern A: <li id="sheet-button-123456789" ...><a ...>Sheet Name</a></li>
      const tabButtonRegex = /<li[^>]*id=["']sheet-button-([0-9]+)["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi;
      let match: RegExpExecArray | null;
      while ((match = tabButtonRegex.exec(html)) !== null) {
        const gid = match[1];
        const rawName = match[2].replace(/<[^>]+>/g, '').trim();
        if (gid && rawName && !seenGids.has(gid)) {
          seenGids.add(gid);
          discovered.push({ name: rawName, gid });
        }
      }

      // Pattern B: item.sheetId / gid in script tags
      const jsonRegex = /["'](?:name|sheetName)["']\s*:\s*["']([^"']+)["']\s*,\s*["'](?:sheetId|gid)["']\s*:\s*([0-9]+)/gi;
      while ((match = jsonRegex.exec(html)) !== null) {
        const rawName = match[1].trim();
        const gid = match[2];
        if (gid && rawName && !seenGids.has(gid)) {
          seenGids.add(gid);
          discovered.push({ name: rawName, gid });
        }
      }

      // Pattern C: reverse order
      const jsonRegex2 = /["'](?:sheetId|gid)["']\s*:\s*([0-9]+)\s*,\s*["'](?:name|sheetName)["']\s*:\s*["']([^"']+)["']/gi;
      while ((match = jsonRegex2.exec(html)) !== null) {
        const gid = match[1];
        const rawName = match[2].trim();
        if (gid && rawName && !seenGids.has(gid)) {
          seenGids.add(gid);
          discovered.push({ name: rawName, gid });
        }
      }
    }
  } catch (err) {
    console.warn('htmlview auto-discovery error:', err);
  }

  // 2. Try fetching pubhtml if htmlview yielded nothing
  if (discovered.length === 0) {
    try {
      const pubUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/pubhtml?_cb=${Date.now()}`;
      const res = await fetch(pubUrl);
      if (res.ok) {
        const html = await res.text();
        const tabButtonRegex = /<li[^>]*id=["']sheet-button-([0-9]+)["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/gi;
        let match: RegExpExecArray | null;
        while ((match = tabButtonRegex.exec(html)) !== null) {
          const gid = match[1];
          const rawName = match[2].replace(/<[^>]+>/g, '').trim();
          if (gid && rawName && !seenGids.has(gid)) {
            seenGids.add(gid);
            discovered.push({ name: rawName, gid });
          }
        }
      }
    } catch (err) {
      console.warn('pubhtml auto-discovery error:', err);
    }
  }

  return discovered;
}

/**
 * Constructs the public CSV export URL for a Google Spreadsheet ID and GID.
 * Uses Google Sheets gviz endpoint which natively supports open CORS without 307 sign-in redirects.
 */
export function getGoogleSheetsCsvUrl(spreadsheetId: string, gid: string = '0'): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

/**
 * Universally reliable fetch helper for Google Sheets CSV with multi-stage fallback.
 */
export async function fetchSheetCsvText(spreadsheetId: string, gid: string = '0'): Promise<string> {
  const cacheBust = `&_cb=${Date.now()}`;
  // 1. Primary: gviz with CORS *
  try {
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}${cacheBust}`;
    const res = await fetch(gvizUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) return text;
    }
  } catch (e) {
    console.warn(`gviz fetch failed for gid ${gid}:`, e);
  }

  // 2. Fallback: export endpoint
  try {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}${cacheBust}`;
    const res = await fetch(exportUrl);
    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 10) return text;
    }
  } catch (e) {
    console.warn(`export fetch failed for gid ${gid}:`, e);
  }

  return '';
}

/**
 * Robust CSV Line Parser that handles quotes and commas inside cells.
 */
export function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

export const INDONESIAN_MONTH_NAMES = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

export function detectMonthFromCSVOrTab(csvText?: string, activeTab?: string): string {
  const upperTab = (activeTab || '').toUpperCase();
  const upperCsv = (csvText || '').slice(0, 3000).toUpperCase();
  for (const m of INDONESIAN_MONTH_NAMES) {
    if (upperTab.includes(m) || upperCsv.includes(m)) {
      return m;
    }
  }
  return 'SEPTEMBER';
}

/**
 * Robust Multi-Line CSV Parser that handles multiline cells with quotes.
 */
export function parseCSVLinesWithQuotes(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim().replace(/^"|"$/g, ''));
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && csvText[i + 1] === '\n') i++;
      currentRow.push(currentField.trim().replace(/^"|"$/g, ''));
      currentField = '';
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim().replace(/^"|"$/g, ''));
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}

/**
 * Dedicated Parser for URUTAN UNIT DELIVERY (GID 1940937859)
 * Accurately parses 37 units with all division hours, status, priority, and target dates.
 */
export function parseUrutanUnitDeliveryCSV(csvText: string): ProjectUnit[] {
  const rows = parseCSVLinesWithQuotes(csvText);
  if (rows.length < 2) return [];

  let currentMarginType: MarginType = 'UNIT MARGIN';
  let currentPM: ProjectManager = 'IQBAL N';
  let headerSeen = false;
  const units: ProjectUnit[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowStr = row.join(' ').toUpperCase();

    // Check margin section indicator
    if (rowStr.includes('UNIT NON MARGIN') || rowStr.includes('NON MARGIN')) {
      currentMarginType = 'UNIT NON MARGIN';
    } else if (rowStr.includes('UNIT MARGIN') && !rowStr.includes('NON')) {
      currentMarginType = 'UNIT MARGIN';
    }

    // Check table header row
    if (
      row[0]?.toUpperCase().includes('KEPALA PROYEK') ||
      (row[1]?.toUpperCase() === 'UNIT' && rowStr.includes('PROGRESS'))
    ) {
      headerSeen = true;
      continue;
    }

    if (!headerSeen) continue;

    const pmCol = row[0]?.trim();
    if (pmCol === 'IQBAL N' || pmCol?.toUpperCase().includes('IQBAL')) {
      currentPM = 'IQBAL N';
    } else if (pmCol === 'FIKI' || pmCol?.toUpperCase().includes('FIKI')) {
      currentPM = 'FIKI';
    }

    const unitName = row[1]?.trim();
    if (
      !unitName ||
      unitName.toUpperCase() === 'UNIT' ||
      unitName.toUpperCase().includes('DATA REKAP') ||
      unitName.toUpperCase().includes('TOTAL')
    ) {
      continue;
    }

    const pm: ProjectManager = pmCol ? (pmCol.toUpperCase().includes('FIKI') ? 'FIKI' : 'IQBAL N') : currentPM;
    const cat = (row[3]?.trim().toUpperCase().includes('PARSIAL') ? 'PARSIAL' : 'FULL RESTORE') as ProgressCategory;
    const kd = row[4]?.trim().toUpperCase() || 'PRATAMA';
    let teamLead: TeamLead = 'PRATAMA';
    if (kd.includes('ARIES')) teamLead = 'ARIES';
    else if (kd.includes('YUDHA')) teamLead = 'YUDHA';
    else if (kd.includes('TAUFIK')) teamLead = 'TAUFIK';

    const cleanTime = (val: string | undefined) =>
      !val || val === '#N/A' ? '0:00' : normalizeTimeToHHMM(val.trim());

    const mechanic = cleanTime(row[5]);
    const bodyWork = cleanTime(row[6]);
    const bodyPaint = cleanTime(row[7]);
    const interior = cleanTime(row[8]);
    const chrome = cleanTime(row[9]);
    const bubut = cleanTime(row[10]);
    let total = cleanTime(row[11]);
    if (total === '0:00') {
      total = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut]);
    }

    const progressPercent = row[12]?.trim() || '';
    const priorityOrder = row[13]?.trim() || '';

    const statusRaw = (row[14]?.trim() || 'OP MEDIUM PROGRES').toUpperCase();
    let status: ProjectStatus = 'OP MEDIUM PROGRES';
    if (statusRaw.includes('DONE') || statusRaw.includes('DELIVERED')) status = 'DONE & DELIVERED';
    else if (statusRaw.includes('URGENT')) status = 'URGENT DELIVERY';
    else if (statusRaw.includes('REGULAR')) status = 'REGULAR PROGRES';
    else if (statusRaw.includes('SLOW')) status = 'SLOW PROGRESS';
    else if (statusRaw.includes('HOLD')) status = 'PROGRESS HOLD';
    else if (statusRaw.includes('WAITING')) status = 'WAITING LIST';

    const targetDeliveryDate = row[15]?.trim() || '';

    units.push({
      id: `unit_deliv_${units.length + 1}_${unitName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      sheetNo: units.length + 1,
      projectManager: pm,
      marginType: currentMarginType,
      unitName,
      unitInDate: row[2]?.trim() || '',
      progressCategory: cat,
      teamLead,
      divisionHours: {
        mechanic,
        bodyWork,
        bodyPaint,
        interior,
        chrome,
        bubut,
        total,
      },
      progressPercent,
      priorityOrder,
      status,
      targetDeliveryDate,
      juliTargetHours: total,
      juliActualHours: total,
      juliDivisions: {
        mechanic,
        bodyWork,
        bodyPaint,
        interior,
        chrome,
        bubut,
        qa: '0:00',
        allDivisi: '0:00',
      },
    });
  }

  return units;
}

/**
 * Parses raw CSV content from Google Sheets into ProjectUnit array.
 * Dynamically tracks multiple section headers (e.g. UNIT MARGIN vs UNIT NON MARGIN).
 */
export function parseGoogleSheetsCSV(csvText: string, activeTab?: string): ProjectUnit[] {
  // If timeline tab or content matches URUTAN UNIT DELIVERY format, use dedicated high-accuracy parser
  if (
    activeTab === 'timeline' ||
    csvText.toUpperCase().includes('URUTAN TARGET DELIVERY') ||
    csvText.toUpperCase().includes('DATA REKAP JAM KERJA UNIT SM 2023-2026')
  ) {
    const deliveryUnits = parseUrutanUnitDeliveryCSV(csvText);
    if (deliveryUnits.length > 0) return deliveryUnits;
  }

  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const detectedMonth = detectMonthFromCSVOrTab(csvText, activeTab);
  const isSeptemberSheet = detectedMonth === 'SEPTEMBER';
  const isAgustusSheet = detectedMonth === 'AGUSTUS';

  let currentHeader: string[] | null = null;
  let currentMarginType: MarginType = 'UNIT MARGIN';
  const units: ProjectUnit[] = [];

  // Check if CSV is in TARGET / ACTUAL Daily Project format (e.g. TARGET PROJECT JULI / AGUSTUS / SEPTEMBER)
  const isTargetActualFormat =
    isSeptemberSheet ||
    isAgustusSheet ||
    activeTab === 'target_september' ||
    activeTab === 'overview' ||
    activeTab === 'target_agustus' ||
    lines.some((l) => {
      const u = l.toUpperCase();
      return (
        (u.includes('TARGET') && u.includes('ACTUAL')) ||
        u.includes('DAILY SEPTEMBER') ||
        u.includes('SEPTEMBER UNIT MARGIN') ||
        u.includes('SEPTEMBER UNIT NON MARGIN') ||
        u.includes('DAILY AGUSTUS') ||
        u.includes('REPORT PROJECT DAILY') ||
        u.includes('PERHITUNGAN JAM KERJA') ||
        u.includes('HASIL KERJA PER HARI')
      );
    });

  for (let i = 0; i < lines.length; i++) {
    const rawRow = parseCSVRow(lines[i]);
    const rowUpperStr = lines[i].toUpperCase();

    // Section header check in main table columns (columns 0..5)
    const mainColsStr = rawRow.slice(0, 5).join(' ').toUpperCase();
    if (mainColsStr.includes('UNIT NON MARGIN') || mainColsStr.includes('NON MARGIN')) {
      currentMarginType = 'UNIT NON MARGIN';
    } else if (mainColsStr.includes('UNIT MARGIN') && !mainColsStr.includes('NON')) {
      currentMarginType = 'UNIT MARGIN';
    }

    if (isTargetActualFormat) {
      const rowNo = parseInt(rawRow[1]?.trim()) || (units.length + 1);
      const unitName = rawRow[2]?.trim() || rawRow[1]?.trim();
      const uUpper = unitName ? unitName.toUpperCase() : '';
      if (
        !unitName ||
        uUpper === 'NAMA UNIT' ||
        uUpper === '#N/A' ||
        uUpper === 'UNIT MARGIN' ||
        uUpper === 'UNIT NON MARGIN' ||
        uUpper.includes('TOTAL') ||
        uUpper.includes('REPORT') ||
        uUpper.includes('PERHITUNGAN') ||
        uUpper.includes('HASIL KERJA') ||
        uUpper.includes('PERSENTASE')
      ) {
        continue;
      }

      // Main table unit uses section header margin type
      const targetRowMargin: MarginType = currentMarginType;

      const cleanVal = (v: string | undefined) =>
        !v || v === '#N/A' ? '0:00' : normalizeTimeToHHMM(v.trim());

      const mechTarget = cleanVal(rawRow[3]);
      const mechActual = cleanVal(rawRow[4]);
      const bodyWTarget = cleanVal(rawRow[5]);
      const bodyWActual = cleanVal(rawRow[6]);
      const bodyPTarget = cleanVal(rawRow[7]);
      const bodyPActual = cleanVal(rawRow[8]);
      const interiorTarget = cleanVal(rawRow[9]);
      const interiorActual = cleanVal(rawRow[10]);
      const chromeTarget = cleanVal(rawRow[11]);
      const chromeActual = cleanVal(rawRow[12]);
      const bubutTarget = cleanVal(rawRow[13]);
      const bubutActual = cleanVal(rawRow[14]);
      let qaTarget = cleanVal(rawRow[15]);
      let qaActual = cleanVal(rawRow[16]);
      let allDivisiTarget = '0:00';
      let allDivisiActual = '0:00';
      let targetTotal = '0:00';
      let actualTotal = '0:00';

      if (!isSeptemberSheet && (isAgustusSheet || (rawRow.length > 20 && cleanVal(rawRow[19]) !== '0:00'))) {
        // 20-column layout (Agustus): QA in 15-16, All Divisi in 17-18, Total in 19-20
        allDivisiTarget = cleanVal(rawRow[17]);
        allDivisiActual = cleanVal(rawRow[18]);
        targetTotal = cleanVal(rawRow[19]);
        actualTotal = cleanVal(rawRow[20]);
      } else {
        // Standard 18-column layout (September): ALL DIVISI in 15-16, Total Target in 17, Total Actual in 18
        qaTarget = '0:00';
        qaActual = '0:00';
        allDivisiTarget = cleanVal(rawRow[15]);
        allDivisiActual = cleanVal(rawRow[16]);
        targetTotal = cleanVal(rawRow[17]);
        actualTotal = cleanVal(rawRow[18]);
      }

      const mech = mechTarget !== '0:00' ? mechTarget : mechActual;
      const bodyW = bodyWTarget !== '0:00' ? bodyWTarget : bodyWActual;
      const bodyP = bodyPTarget !== '0:00' ? bodyPTarget : bodyPActual;
      const interior = interiorTarget !== '0:00' ? interiorTarget : interiorActual;
      const chrome = chromeTarget !== '0:00' ? chromeTarget : chromeActual;
      const bubut = bubutTarget !== '0:00' ? bubutTarget : bubutActual;

      if (targetTotal === '0:00') {
        const divSum = sumTimeStrings([mechTarget, bodyWTarget, bodyPTarget, interiorTarget, chromeTarget, bubutTarget, qaTarget, allDivisiTarget]);
        if (divSum !== '0:00') {
          targetTotal = divSum;
        }
      }

      // If actualTotal is 0:00, check if individual division actuals exist, otherwise keep strictly 0:00
      if (actualTotal === '0:00') {
        const divActSum = sumTimeStrings([mechActual, bodyWActual, bodyPActual, interiorActual, chromeActual, bubutActual, qaActual, allDivisiActual]);
        if (divActSum !== '0:00') {
          actualTotal = divActSum;
        } else {
          actualTotal = '0:00';
        }
      }

      if (uUpper.includes('MB R 230') || uUpper.includes('R 230')) {
        targetTotal = '0:00';
      }

      let total = targetTotal !== '0:00' ? targetTotal : (actualTotal !== '0:00' ? actualTotal : sumTimeStrings([mech, bodyW, bodyP, interior, chrome, bubut]));

      units.push({
        id: `sheet_target_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        projectManager: 'IQBAL N',
        marginType: targetRowMargin,
        unitName,
        unitInDate: '1 Jul 2026',
        progressCategory: 'FULL RESTORE',
        teamLead: 'PRATAMA',
        divisionHours: {
          mechanic: mechActual,
          bodyWork: bodyWActual,
          bodyPaint: bodyPActual,
          interior: interiorActual,
          chrome: chromeActual,
          bubut: bubutActual,
          total: actualTotal, // Use strictly actualTotal, if 0:00 then 0:00
        },
        priorityOrder: `PRIORITAS ${rowNo}`,
        status: 'OP MEDIUM PROGRES',
        targetDeliveryDate: '',
        sheetNo: rowNo,
        juliTargetHours: isAgustusSheet || isSeptemberSheet ? '0:00' : targetTotal,
        juliActualHours: isAgustusSheet || isSeptemberSheet ? '0:00' : actualTotal,
        juliDivisions: {
          mechanic: isAgustusSheet || isSeptemberSheet ? '0:00' : mechActual,
          bodyWork: isAgustusSheet || isSeptemberSheet ? '0:00' : bodyWActual,
          bodyPaint: isAgustusSheet || isSeptemberSheet ? '0:00' : bodyPActual,
          interior: isAgustusSheet || isSeptemberSheet ? '0:00' : interiorActual,
          chrome: isAgustusSheet || isSeptemberSheet ? '0:00' : chromeActual,
          bubut: isAgustusSheet || isSeptemberSheet ? '0:00' : bubutActual,
          qa: isAgustusSheet || isSeptemberSheet ? '0:00' : qaActual,
          allDivisi: isAgustusSheet || isSeptemberSheet ? '0:00' : actualTotal,
        },
        agustusTargetHours: isAgustusSheet ? targetTotal : '0:00',
        agustusActualHours: isAgustusSheet ? actualTotal : '0:00',
        agustusDivisions: {
          mechanic: isAgustusSheet ? (mechTarget !== '0:00' ? mechTarget : mechActual) : '0:00',
          bodyWork: isAgustusSheet ? (bodyWTarget !== '0:00' ? bodyWTarget : bodyWActual) : '0:00',
          bodyPaint: isAgustusSheet ? (bodyPTarget !== '0:00' ? bodyPTarget : bodyPActual) : '0:00',
          interior: isAgustusSheet ? (interiorTarget !== '0:00' ? interiorTarget : interiorActual) : '0:00',
          chrome: isAgustusSheet ? (chromeTarget !== '0:00' ? chromeTarget : chromeActual) : '0:00',
          bubut: isAgustusSheet ? (bubutTarget !== '0:00' ? bubutTarget : bubutActual) : '0:00',
          qa: isAgustusSheet ? (qaTarget !== '0:00' ? qaTarget : qaActual) : '0:00',
          allDivisi: isAgustusSheet ? (allDivisiTarget !== '0:00' ? allDivisiTarget : allDivisiActual) : '0:00',
        },
        septemberTargetHours: isSeptemberSheet ? targetTotal : '0:00',
        septemberActualHours: isSeptemberSheet ? actualTotal : '0:00',
        septemberDivisions: {
          mechanic: isSeptemberSheet ? mechActual : '0:00',
          bodyWork: isSeptemberSheet ? bodyWActual : '0:00',
          bodyPaint: isSeptemberSheet ? bodyPActual : '0:00',
          interior: isSeptemberSheet ? interiorActual : '0:00',
          chrome: isSeptemberSheet ? chromeActual : '0:00',
          bubut: isSeptemberSheet ? bubutActual : '0:00',
          qa: '0:00',
          allDivisi: isSeptemberSheet ? allDivisiActual : '0:00',
        },
        septemberTargetDivisions: {
          mechanic: isSeptemberSheet ? mechTarget : '0:00',
          bodyWork: isSeptemberSheet ? bodyWTarget : '0:00',
          bodyPaint: isSeptemberSheet ? bodyPTarget : '0:00',
          interior: isSeptemberSheet ? interiorTarget : '0:00',
          chrome: isSeptemberSheet ? chromeTarget : '0:00',
          bubut: isSeptemberSheet ? bubutTarget : '0:00',
          qa: isSeptemberSheet ? qaTarget : '0:00',
          allDivisi: isSeptemberSheet ? allDivisiTarget : '0:00',
        },
        activeMonth: detectedMonth,
        currentTargetHours: targetTotal,
        currentActualHours: actualTotal,
        currentDivisions: {
          mechanic: mechTarget !== '0:00' ? mechTarget : mechActual,
          bodyWork: bodyWTarget !== '0:00' ? bodyWTarget : bodyWActual,
          bodyPaint: bodyPTarget !== '0:00' ? bodyPTarget : bodyPActual,
          interior: interiorTarget !== '0:00' ? interiorTarget : interiorActual,
          chrome: chromeTarget !== '0:00' ? chromeTarget : chromeActual,
          bubut: bubutTarget !== '0:00' ? bubutTarget : bubutActual,
          qa: qaTarget !== '0:00' ? qaTarget : qaActual,
          allDivisi: allDivisiTarget !== '0:00' ? allDivisiTarget : allDivisiActual,
        },
        monthlyTargetHours: {
          [detectedMonth]: targetTotal,
        },
        monthlyActualHours: {
          [detectedMonth]: actualTotal,
        },
      });
      continue;
    }

    // Main table header detector for URUTAN UNIT DELIVERY
    if (
      rowUpperStr.includes('KEPALA PROYEK') ||
      (rowUpperStr.includes('UNIT IN') && rowUpperStr.includes('PROGRESS'))
    ) {
      currentHeader = rawRow.map((h) => h.toUpperCase().trim());
      continue;
    }

    if (!currentHeader) continue;

    // Helper index finder for active header
    const pmIdx = currentHeader!.findIndex((h) => h === 'KEPALA PROYEK' || h === 'PM' || h === 'KP');
    const unitNameIdx = currentHeader!.findIndex((h) => h === 'UNIT' || h === 'NAMA UNIT' || h === 'UNIT NAME');
    const marginIdx = currentHeader!.findIndex((h) => h === 'MARGIN TYPE' || h === 'TIPE MARGIN' || h === 'MARGIN');
    const unitInIdx = currentHeader!.findIndex((h) => h.includes('UNIT IN') || h.includes('MASUK'));
    const categoryIdx = currentHeader!.findIndex((h) => h.includes('KATEGORI'));
    const kdUnitIdx = currentHeader!.findIndex((h) => h === 'KD UNIT' || h === 'LEAD' || h === 'KEPALA DIVISI');
    const mechIdx = currentHeader!.findIndex((h) => h.includes('MECHANIC') || h.includes('MEKANIK'));
    const bodyWorkIdx = currentHeader!.findIndex((h) => h.includes('BODY WORK') || h.includes('BODYWORK'));
    const bodyPaintIdx = currentHeader!.findIndex((h) => h.includes('BODY PAINT') || h.includes('BODYPAINT'));
    const interiorIdx = currentHeader!.findIndex((h) => h.includes('INTERIOR'));
    const chromeIdx = currentHeader!.findIndex((h) => h.includes('CHROME') || h.includes('KROM'));
    const bubutIdx = currentHeader!.findIndex((h) => h.includes('BUBUT'));
    const totalIdx = currentHeader!.findIndex((h) => h === 'TOTAL' || h.includes('TOTAL JAM'));
    const priorityIdx = currentHeader!.findIndex((h) => h.includes('URUTAN') || h.includes('PRIORITAS'));
    const statusIdx = currentHeader!.findIndex((h) => h.includes('STATUS'));
    const targetDateIdx = currentHeader!.findIndex((h) => h.includes('TARGET UNIT DELIVERY') || h.includes('TARGET DELIVERY'));

    const getVal = (idx: number, fallback: string = '') => {
      if (idx !== -1 && rawRow[idx] !== undefined && rawRow[idx] !== null) {
        return rawRow[idx].trim();
      }
      return fallback;
    };

    let rawUnitName = getVal(unitNameIdx);
    if (!rawUnitName) continue;

    // Filter out summary/header/formula widget rows
    const upperName = rawUnitName.toUpperCase();
    if (
      upperName === 'UNIT' ||
      upperName === 'TOTAL' ||
      upperName === 'JUMLAH' ||
      upperName === 'RATA-RATA' ||
      upperName === 'AVERAGE' ||
      upperName === '#N/A' ||
      upperName.includes('KEPALA PROYEK') ||
      upperName.includes('UNIT NAME') ||
      upperName.includes('NAMA UNIT') ||
      upperName.includes('DATA REKAP')
    ) {
      continue;
    }

    const unitName = rawUnitName.replace(/^COUNTDOWN\s*:\s*/i, '').trim() || rawUnitName;

    const pmRaw = getVal(pmIdx, 'IQBAL N').toUpperCase();
    const pm: ProjectManager = pmRaw.includes('FIKI') ? 'FIKI' : 'IQBAL N';

    const marginRaw = getVal(marginIdx, currentMarginType).toUpperCase();
    const marginType: MarginType = marginRaw.includes('NON') ? 'UNIT NON MARGIN' : 'UNIT MARGIN';

    const categoryRaw = getVal(categoryIdx, 'FULL RESTORE').toUpperCase();
    const progressCategory: ProgressCategory = categoryRaw.includes('PARSIAL') ? 'PARSIAL' : 'FULL RESTORE';

    const teamLeadRaw = getVal(kdUnitIdx, 'PRATAMA').toUpperCase();
    let teamLead: TeamLead = 'PRATAMA';
    if (teamLeadRaw.includes('ARIES')) teamLead = 'ARIES';
    else if (teamLeadRaw.includes('YUDHA')) teamLead = 'YUDHA';
    else if (teamLeadRaw.includes('TAUFIK')) teamLead = 'TAUFIK';

    const mech = normalizeTimeToHHMM(getVal(mechIdx));
    const bodyW = normalizeTimeToHHMM(getVal(bodyWorkIdx));
    const bodyP = normalizeTimeToHHMM(getVal(bodyPaintIdx));
    const interior = normalizeTimeToHHMM(getVal(interiorIdx));
    const chrome = normalizeTimeToHHMM(getVal(chromeIdx));
    const bubut = normalizeTimeToHHMM(getVal(bubutIdx));

    let total = normalizeTimeToHHMM(getVal(totalIdx));
    if (total === '0:00') {
      total = sumTimeStrings([mech, bodyW, bodyP, interior, chrome, bubut]);
    }

    const statusRaw = getVal(statusIdx, 'OP MEDIUM PROGRES').toUpperCase();
    let status: ProjectStatus = 'OP MEDIUM PROGRES';
    if (statusRaw.includes('DONE') || statusRaw.includes('DELIVERED')) status = 'DONE & DELIVERED';
    else if (statusRaw.includes('URGENT')) status = 'URGENT DELIVERY';
    else if (statusRaw.includes('REGULAR')) status = 'REGULAR PROGRES';
    else if (statusRaw.includes('SLOW')) status = 'SLOW PROGRESS';
    else if (statusRaw.includes('HOLD')) status = 'PROGRESS HOLD';
    else if (statusRaw.includes('WAITING')) status = 'WAITING LIST';

    const priority = getVal(priorityIdx, `PRIORITAS ${units.length + 1}`);
    const targetDeliveryDate = getVal(targetDateIdx, '');
    const unitInDate = getVal(unitInIdx, '1 Jan 2025');

    units.push({
      id: `sheet_unit_${i}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectManager: pm,
      marginType,
      unitName,
      unitInDate,
      progressCategory,
      teamLead,
      divisionHours: {
        mechanic: mech,
        bodyWork: bodyW,
        bodyPaint: bodyP,
        interior,
        chrome,
        bubut,
        total,
      },
      priorityOrder: priority,
      status,
      targetDeliveryDate,
      sheetNo: units.length + 1,
      juliTargetHours: total,
      juliActualHours: total,
      juliDivisions: {
        mechanic: mech,
        bodyWork: bodyW,
        bodyPaint: bodyP,
        interior,
        chrome,
        bubut,
        qa: '0:00',
        allDivisi: '0:00',
      },
    });
  }

  return units;
}

/**
 * Parses the daily production tables from TARGET PROJECT sheets:
 * 1. PERHITUNGAN JAM KERJA REAL PRODUKSI (Table 1)
 * 2. HASIL KERJA PER HARI UNIT MARGIN & NON MARGIN (Table 2)
 * 3. Target Summary (Target Margin, Target Non Margin, Total, Persentase)
 */
export function parseTargetProjectDailyTables(csvText: string): TargetProjectDailyTables {
  if (!csvText) {
    return { pjkRows: [], hkRows: [] };
  }

  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = lines.map((l) => parseCSVRow(l));

  let pjkCol = -1;
  let hkCol = -1;

  // Scan first 15 rows to find column positions of both tables
  for (let rIdx = 0; rIdx < Math.min(15, rows.length); rIdx++) {
    const row = rows[rIdx];
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const val = (row[cIdx] || '').trim().toUpperCase();
      if (val.includes('PERHITUNGAN JAM KERJA') && pjkCol === -1) {
        pjkCol = cIdx;
      }
      if ((val.includes('HASIL KERJA PER HARI') || val.includes('MARGIN & NON MARGIN')) && hkCol === -1) {
        hkCol = cIdx;
      }
    }
  }

  const hkRows: { tanggal: string; marginJam: string; nonMarginJam: string; totalJam: string }[] = [];
  const pjkRows: PerhitunganJamKerjaRealRow[] = [];
  const targetSummary: TargetSeptemberSummary = {};

  // Parse Table 2: HASIL KERJA PER HARI UNIT MARGIN & NON MARGIN
  if (hkCol !== -1) {
    let curDate = '';
    let curMargin = '0:00';
    let curNonMargin = '0:00';
    let curTotal = '0:00';

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      if (row.length <= hkCol) continue;

      const cDate = (row[hkCol] || '').trim();
      const cCat = (row[hkCol + 1] || '').trim().toUpperCase();
      const cJam = normalizeTimeToHHMM((row[hkCol + 2] || '').trim());
      const cTot = normalizeTimeToHHMM((row[hkCol + 3] || '').trim());

      if (cDate) {
        if (cDate.includes('-') || cDate.includes('/')) {
          curDate = cDate;
          if (cCat.includes('MARGIN') && !cCat.includes('NON')) {
            curMargin = cJam || '0:00';
            if (cTot && cTot !== '0:00') {
              curTotal = cTot;
            }
          } else if (cCat.includes('NON')) {
            curNonMargin = cJam || '0:00';
          }
        }
      } else if (cCat) {
        if (cCat.includes('NON')) {
          curNonMargin = cJam || '0:00';
          if (curDate) {
            const tot =
              curTotal && curTotal !== '0:00'
                ? curTotal
                : cTot && cTot !== '0:00'
                ? cTot
                : sumTimeStrings([curMargin, curNonMargin]);

            hkRows.push({
              tanggal: curDate,
              marginJam: curMargin,
              nonMarginJam: curNonMargin,
              totalJam: tot,
            });
            curDate = '';
            curMargin = '0:00';
            curNonMargin = '0:00';
            curTotal = '0:00';
          }
        }
      }
    }
  }

  // Parse Table 1: PERHITUNGAN JAM KERJA REAL PRODUKSI & Summaries
  if (pjkCol !== -1) {
    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      if (row.length <= pjkCol) continue;

      const cVal = (row[pjkCol] || '').trim();
      const rawJam = (row[pjkCol + 1] || '').trim();
      if (!cVal) continue;

      const upperVal = cVal.toUpperCase();

      if ((cVal.includes('-') || cVal.includes('/')) && cVal.length <= 15) {
        pjkRows.push({
          tanggal: cVal,
          jamKerja: normalizeTimeToHHMM(rawJam),
        });
      } else if (upperVal === 'TOTAL') {
        targetSummary.totalActual = normalizeTimeToHHMM(rawJam);
      } else if (upperVal === 'MARGIN' && (rawJam.includes('%') || rawJam.includes(','))) {
        targetSummary.persentaseMargin = rawJam;
      } else if (upperVal === 'NON MARGIN' && (rawJam.includes('%') || rawJam.includes(','))) {
        targetSummary.persentaseNonMargin = rawJam;
      } else if (upperVal === 'MARGIN') {
        targetSummary.targetMargin = normalizeTimeToHHMM(rawJam);
      } else if (upperVal === 'NON MARGIN') {
        targetSummary.targetNonMargin = normalizeTimeToHHMM(rawJam);
      }
    }
  }

  // Also scan all rows directly for explicit summary totals in Google Sheets (e.g. rows 34, 40, 44, 45, 49, 50, 52, 53)
  for (const row of rows) {
    const rowUpper = row.map((c) => (c || '').trim().toUpperCase());
    const rowStr = rowUpper.join(' ');

    if (rowStr.includes('TOTAL TARGET') && rowStr.includes('MARGIN') && !rowStr.includes('NON') && !rowStr.includes('DAN')) {
      const timeCells = row.map((c) => (c || '').trim()).filter((c) => /^(\d+):(\d{2})$/.test(c));
      if (timeCells.length > 0) {
        targetSummary.targetMargin = normalizeTimeToHHMM(timeCells[0]);
      }
      if (timeCells.length > 1) {
        targetSummary.actualMargin = normalizeTimeToHHMM(timeCells[1]);
      }
    }

    if (rowStr.includes('TOTAL') && rowStr.includes('NON MARGIN') && !rowStr.includes('MARGIN DAN')) {
      const timeCells = row.map((c) => (c || '').trim()).filter((c) => /^(\d+):(\d{2})$/.test(c));
      if (timeCells.length > 0) {
        targetSummary.targetNonMargin = normalizeTimeToHHMM(timeCells[0]);
      }
      if (timeCells.length > 1) {
        targetSummary.actualNonMargin = normalizeTimeToHHMM(timeCells[1]);
      }
    }

    if (rowStr.includes('TOTAL') && rowStr.includes('MARGIN DAN NON MARGIN')) {
      const timeCells = row.map((c) => (c || '').trim()).filter((c) => /^(\d+):(\d{2})$/.test(c));
      if (timeCells.length > 0) {
        targetSummary.totalActual = normalizeTimeToHHMM(timeCells[0]);
      }
    }

    // Check for target and percentage labels
    if (rowStr.includes('TARGET JAM KERJA SEPTEMBER')) {
      // scanned in next rows
    }
    if (rowStr.includes('MARGIN') && !rowStr.includes('NON') && !rowStr.includes('TOTAL')) {
      for (const c of row) {
        const val = (c || '').trim();
        if (val.includes('%')) {
          targetSummary.persentaseMargin = val;
        }
      }
    }
    if (rowStr.includes('NON MARGIN') && !rowStr.includes('TOTAL')) {
      for (const c of row) {
        const val = (c || '').trim();
        if (val.includes('%')) {
          targetSummary.persentaseNonMargin = val;
        }
      }
    }
  }

  if (targetSummary.targetMargin && targetSummary.targetNonMargin && (!targetSummary.totalTarget || targetSummary.totalTarget === '0:00')) {
    targetSummary.totalTarget = sumTimeStrings([targetSummary.targetMargin, targetSummary.targetNonMargin]);
  }

  return {
    pjkRows,
    hkRows,
    targetSummary,
  };
}

/**
 * Directly fetches and extracts TargetProjectDailyTables for a given sheet tab.
 */
export async function fetchTargetProjectDailyTables(
  spreadsheetId: string = '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0',
  gid: string = SHEET_TAB_GIDS.target_september
): Promise<TargetProjectDailyTables> {
  const text = await fetchSheetCsvText(spreadsheetId, gid);
  if (!text) return { pjkRows: [], hkRows: [] };
  const tables = parseTargetProjectDailyTables(text);
  if (tables && (tables.hkRows.length > 0 || tables.pjkRows.length > 0)) {
    try {
      localStorage.setItem(SEPTEMBER_DAILY_TABLES_STORAGE_KEY, JSON.stringify(tables));
    } catch (e) {}
  }
  return tables;
}

/**
 * Helper to fetch and parse CSV text for a given GID.
 */
async function fetchAndParseGid(spreadsheetId: string, gid: string, activeTab?: string): Promise<ProjectUnit[]> {
  const text = await fetchSheetCsvText(spreadsheetId, gid);
  if (!text) return [];

  // If this sheet is September Target (or overview), extract and cache daily tables
  if (
    gid === SHEET_TAB_GIDS.target_september ||
    gid === SHEET_TAB_GIDS.overview ||
    activeTab === 'target_september' ||
    activeTab === 'overview'
  ) {
    try {
      const dailyTables = parseTargetProjectDailyTables(text);
      if (dailyTables && (dailyTables.hkRows.length > 0 || dailyTables.pjkRows.length > 0)) {
        localStorage.setItem(SEPTEMBER_DAILY_TABLES_STORAGE_KEY, JSON.stringify(dailyTables));
      }
    } catch (e) {
      console.warn('Error extracting daily tables from Target Project sheet:', e);
    }
  }

  return parseGoogleSheetsCSV(text, activeTab);
}

/**
 * Fetches Google Sheet directly by URL or ID and returns parsed ProjectUnit array.
 * Merges master unit division hours if tab specific target hours are zeroed out.
 */
export async function fetchGoogleSheetsData(
  urlOrId: string = DEFAULT_SHEET_URL,
  activeTab?: DashboardTab
): Promise<ProjectUnit[]> {
  const targetUrl = urlOrId.trim() || DEFAULT_SHEET_URL;
  const spreadsheetId = extractSpreadsheetId(targetUrl);
  if (!spreadsheetId) {
    throw new Error('URL Google Sheet tidak valid. Pastikan link berisi ID Google Spreadsheet.');
  }

  const masterGid = SHEET_TAB_GIDS.timeline; // URUTAN UNIT DELIVERY (1940937859)
  const urlGid = extractGid(targetUrl);

  let targetGid = urlGid !== '0' ? urlGid : masterGid;
  if (activeTab && SHEET_TAB_GIDS[activeTab]) {
    targetGid = SHEET_TAB_GIDS[activeTab];
  } else if (activeTab && typeof activeTab === 'string' && activeTab.startsWith('sheet_tab_')) {
    targetGid = activeTab.replace('sheet_tab_', '');
  } else if (activeTab && typeof activeTab === 'string') {
    try {
      const stored = localStorage.getItem('sm_custom_google_tabs_v1');
      if (stored) {
        const tabs = JSON.parse(stored);
        const match = tabs.find((t: any) => t.id === activeTab);
        if (match?.gid) {
          targetGid = match.gid;
        }
      }
    } catch (e) {}
  }

  // Fetch tab-specific units directly from the selected tab's GID
  const tabUnits = await fetchAndParseGid(spreadsheetId, targetGid, activeTab);

  if (tabUnits && tabUnits.length > 0) {
    return tabUnits;
  }

  // Fallback if selected tab returned no units
  return await fetchAndParseGid(spreadsheetId, masterGid, activeTab);
}

