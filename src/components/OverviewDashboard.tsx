import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ProjectUnit, DashboardTab, HasilKerjaAgustusRecord, TargetProjectDailyTables } from '../types';
import { INITIAL_HASIL_KERJA_AGUSTUS } from '../data/hasilKerjaAgustusData';
import { INITIAL_HASIL_KERJA_SEPTEMBER } from '../data/hasilKerjaSeptemberData';
import {
  UNIT_MARGIN_SEPTEMBER_DATA,
  UNIT_NON_MARGIN_SEPTEMBER_DATA,
  DAILY_REAL_PRODUCTION_SEPTEMBER,
  DAILY_MARGIN_NON_MARGIN_SEPTEMBER,
} from '../data/septemberData';
import { sumTimeStrings, timeToDecimalHours, formatDecimalHours, formatTimeString } from '../utils/timeUtils';
import {
  Clock,
  FileSpreadsheet,
  Search,
  Printer,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Sparkle,
  ArrowUpDown
} from 'lucide-react';

interface OverviewDashboardProps {
  units: ProjectUnit[];
  activeTab?: DashboardTab;
  onSelectUnit?: (unit: ProjectUnit) => void;
  hasilKerjaRecords?: HasilKerjaAgustusRecord[];
  liveDailyTables?: TargetProjectDailyTables | null;
}

interface DailyJuliReportRow {
  no: number;
  unitName: string;
  mechanic: string;
  bodyWork: string;
  bodyPaint: string;
  interior: string;
  chrome: string;
  bubut: string;
  qa: string;
  allDivisi: string;
  totalTarget: string;
  totalActual: string;
  highlightType?: 'green' | 'red' | 'yellow' | 'normal';
  originalUnit?: ProjectUnit;
}

interface ProductionDailyRealRow {
  tanggal: string;
  jamKerja: string;
  marginJam: string;
  nonMarginJam: string;
}

// 1. DATA UNIT MARGIN (26 Items + Summary)
const UNIT_MARGIN_DATA: DailyJuliReportRow[] = [
  { no: 1, unitName: 'CHEVROLET Mr. NYOMAN', mechanic: '169:21', bodyWork: '161:21', bodyPaint: '0:00', interior: '0:00', chrome: '11:30', bubut: '6:00', qa: '0:00', allDivisi: '5:07', totalTarget: '524:00', totalActual: '353:19', highlightType: 'normal' },
  { no: 2, unitName: 'JAGUAR XK120 Mr. JAMES', mechanic: '278:55', bodyWork: '86:49', bodyPaint: '90:39', interior: '0:00', chrome: '0:00', bubut: '8:00', qa: '0:00', allDivisi: '0:00', totalTarget: '553:00', totalActual: '464:23', highlightType: 'normal' },
  { no: 3, unitName: 'JAGUAR XK120 Mr. JAMES ( JOBDESC )', mechanic: '0:00', bodyWork: '32:15', bodyPaint: '4:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '36:15', highlightType: 'normal' },
  { no: 4, unitName: 'MB 190 SL Mr. ADRIAN', mechanic: '170:22', bodyWork: '68:38', bodyPaint: '20:30', interior: '160:07', chrome: '0:00', bubut: '13:00', qa: '0:00', allDivisi: '0:00', totalTarget: '550:00', totalActual: '432:37', highlightType: 'normal' },
  { no: 5, unitName: 'MB 300 CE Mr. DIKO', mechanic: '288:11', bodyWork: '8:10', bodyPaint: '83:43', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '378:00', totalActual: '380:04', highlightType: 'red' },
  { no: 6, unitName: 'MB 500 SEC Mr. DIKO', mechanic: '132:46', bodyWork: '108:02', bodyPaint: '172:19', interior: '9:01', chrome: '21:00', bubut: '7:00', qa: '0:00', allDivisi: '0:00', totalTarget: '600:00', totalActual: '450:08', highlightType: 'normal' },
  { no: 7, unitName: 'MB BATMAN Mr. ICHSAN', mechanic: '115:40', bodyWork: '70:09', bodyPaint: '197:55', interior: '7:00', chrome: '158:21', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '850:00', totalActual: '549:05', highlightType: 'normal' },
  { no: 8, unitName: 'MB E320 SPORTLINE SILVER Mr. DIKO', mechanic: '204:01', bodyWork: '86:59', bodyPaint: '274:06', interior: '139:40', chrome: '22:32', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1400:00', totalActual: '727:18', highlightType: 'normal' },
  { no: 9, unitName: 'MB GROSSER Mr. INDRA', mechanic: '200:20', bodyWork: '91:05', bodyPaint: '90:30', interior: '0:00', chrome: '7:30', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '550:00', totalActual: '389:25', highlightType: 'normal' },
  { no: 10, unitName: 'MB MPS Mr. DIKO', mechanic: '518:23', bodyWork: '95:18', bodyPaint: '205:19', interior: '36:19', chrome: '40:34', bubut: '4:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1100:00', totalActual: '899:53', highlightType: 'normal' },
  { no: 11, unitName: 'MB PAGODA Mr. DIDI', mechanic: '179:49', bodyWork: '107:48', bodyPaint: '256:52', interior: '136:49', chrome: '18:21', bubut: '1:00', qa: '0:00', allDivisi: '0:00', totalTarget: '750:00', totalActual: '700:39', highlightType: 'normal' },
  { no: 12, unitName: 'MB PONTON 220 S Mr. SANTOSO', mechanic: '136:04', bodyWork: '15:33', bodyPaint: '274:48', interior: '2:00', chrome: '31:30', bubut: '7:52', qa: '0:00', allDivisi: '3:00', totalTarget: '550:00', totalActual: '470:47', highlightType: 'normal' },
  { no: 13, unitName: 'MB R129 Mr. DIKO', mechanic: '278:41', bodyWork: '110:48', bodyPaint: '320:37', interior: '361:52', chrome: '16:00', bubut: '44:30', qa: '0:00', allDivisi: '0:00', totalTarget: '1380:00', totalActual: '1132:28', highlightType: 'normal' },
  { no: 14, unitName: 'MB W 111 KEBO Mr. INDRA', mechanic: '32:30', bodyWork: '237:30', bodyPaint: '25:30', interior: '10:00', chrome: '100:30', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '600:00', totalActual: '406:00', highlightType: 'normal' },
  { no: 15, unitName: 'MB W111 Mr. KELLY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'green' },
  { no: 16, unitName: 'PORSCHE 911 Mr. HANDY', mechanic: '113:37', bodyWork: '12:02', bodyPaint: '12:00', interior: '0:00', chrome: '0:00', bubut: '3:00', qa: '0:00', allDivisi: '0:00', totalTarget: '250:00', totalActual: '140:39', highlightType: 'green' },
  { no: 17, unitName: 'PORSCHE 930 Mr. ADRIAN', mechanic: '49:00', bodyWork: '0:00', bodyPaint: '2:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '8:00', totalTarget: '82:00', totalActual: '59:30', highlightType: 'green' },
  { no: 18, unitName: 'PORSCHE 993 Mr. ADRIAN', mechanic: '43:24', bodyWork: '12:00', bodyPaint: '2:00', interior: '2:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '98:00', totalActual: '59:24', highlightType: 'green' },
  { no: 19, unitName: 'MB MASTERPIECE NEW Mr. DIKO', mechanic: '533:43', bodyWork: '101:21', bodyPaint: '38:34', interior: '23:18', chrome: '0:00', bubut: '19:30', qa: '0:00', allDivisi: '0:00', totalTarget: '850:00', totalActual: '716:26', highlightType: 'normal' },
  { no: 20, unitName: 'MB 280 GE Mr. ABONG', mechanic: '82:00', bodyWork: '17:05', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '99:05', highlightType: 'red' },
  { no: 21, unitName: 'FERRARI F355 Mrs. NINA', mechanic: '1:30', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '1:30', highlightType: 'red' },
  { no: 22, unitName: 'MB 500 SEL Mrs. NINA', mechanic: '5:00', bodyWork: '0:00', bodyPaint: '7:03', interior: '4:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '16:03', highlightType: 'red' },
  { no: 23, unitName: 'MB 560 SEC Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '1:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '1:00', highlightType: 'red' },
  { no: 24, unitName: 'MB PAGODA Mrs. NINA', mechanic: '2:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '2:00', highlightType: 'red' },
  { no: 25, unitName: 'MB 560 SL Mrs. NINA', mechanic: '79:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '79:00', highlightType: 'red' },
  { no: 26, unitName: 'ALL UNIT', mechanic: '209:00', bodyWork: '1:00', bodyPaint: '147:15', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '357:15', highlightType: 'red' },
];

// 2. DATA UNIT NON MARGIN (20 Items + Summary)
const UNIT_NON_MARGIN_DATA: DailyJuliReportRow[] = [
  { no: 1, unitName: 'BMW 530 i Mr. MARTHEN', mechanic: '20:00', bodyWork: '2:00', bodyPaint: '16:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '38:00', highlightType: 'red' },
  { no: 2, unitName: 'MB 300 E Mr. HENDY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 3, unitName: 'BMW 750 iL BARU Mr. STANLEY', mechanic: '10:42', bodyWork: '0:00', bodyPaint: '0:45', interior: '0:00', chrome: '0:00', bubut: '7:00', qa: '0:00', allDivisi: '0:00', totalTarget: '150:00', totalActual: '18:27', highlightType: 'normal' },
  { no: 4, unitName: 'BMW 750 iL LAMA Mr. STANLEY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 5, unitName: 'FIAT MULTIPLA Mr. ADRIAN', mechanic: '166:15', bodyWork: '332:00', bodyPaint: '328:23', interior: '112:47', chrome: '81:10', bubut: '59:34', qa: '0:00', allDivisi: '0:00', totalTarget: '1050:00', totalActual: '1080:09', highlightType: 'red' },
  { no: 6, unitName: 'HONDA CB V Mr. MARTHEN', mechanic: '48:09', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '50:00', totalActual: '48:09', highlightType: 'normal' },
  { no: 7, unitName: 'HONDA KING Mr. EREK', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 8, unitName: 'KIJANG SM', mechanic: '3:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '20:00', totalActual: '3:00', highlightType: 'normal' },
  { no: 9, unitName: 'MB E320 NEW EYES Mr. MARTHEN', mechanic: '7:08', bodyWork: '18:00', bodyPaint: '38:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '63:08', highlightType: 'red' },
  { no: 10, unitName: 'MB G 280 Mr. STANLEY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'red' },
  { no: 11, unitName: 'MB W 111 KEBO EM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 12, unitName: 'MB W115 KEBO Mr. PRAM', mechanic: '200:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '4:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '182:00', totalActual: '204:00', highlightType: 'red' },
  { no: 13, unitName: 'MB W124 E320 SPORTLINE Mr. DIKO', mechanic: '77:30', bodyWork: '0:00', bodyPaint: '178:00', interior: '54:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1080:00', totalActual: '309:30', highlightType: 'normal' },
  { no: 14, unitName: 'VW BEETLE Mr. RECHARD', mechanic: '26:00', bodyWork: '54:30', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '180:00', totalActual: '80:30', highlightType: 'yellow' },
  { no: 15, unitName: 'PORSCHE 944 Mr. PRAM', mechanic: '12:45', bodyWork: '12:00', bodyPaint: '33:15', interior: '8:15', chrome: '0:00', bubut: '77:30', qa: '0:00', allDivisi: '0:00', totalTarget: '60:00', totalActual: '143:45', highlightType: 'red' },
  { no: 16, unitName: 'TOYOTA MARK X Mr. MARTHEN', mechanic: '22:00', bodyWork: '24:00', bodyPaint: '8:00', interior: '56:30', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '110:30', highlightType: 'red' },
  { no: 17, unitName: 'BB Mr. STANLEY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 18, unitName: 'MB 200 CD Mr. ANDREW', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '48:15', interior: '35:25', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '71:00', totalActual: '83:40', highlightType: 'green' },
  { no: 19, unitName: 'MB PULMAN Mr. SLAM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 20, unitName: 'MB 280 CE Mr. ANDERSON', mechanic: '27:00', bodyWork: '257:50', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '295:00', totalActual: '284:50', highlightType: 'normal' },
];

const DAILY_REAL_PRODUCTION_JULI: ProductionDailyRealRow[] = [
  { tanggal: 'Rabu, 01 Juli 2026', jamKerja: '569:54', marginJam: '510:22', nonMarginJam: '59:32' },
  { tanggal: 'Kamis, 02 Juli 2026', jamKerja: '593:46', marginJam: '397:31', nonMarginJam: '196:15' },
  { tanggal: 'Jumat, 03 Juli 2026', jamKerja: '516:28', marginJam: '401:12', nonMarginJam: '115:16' },
  { tanggal: 'Sabtu, 04 Juli 2026', jamKerja: '342:53', marginJam: '238:47', nonMarginJam: '104:06' },
  { tanggal: 'Minggu, 05 Juli 2026', jamKerja: '93:52', marginJam: '25:09', nonMarginJam: '68:43' },
  { tanggal: 'Senin, 06 Juli 2026', jamKerja: '589:03', marginJam: '417:25', nonMarginJam: '171:38' },
  { tanggal: 'Selasa, 07 Juli 2026', jamKerja: '547:55', marginJam: '414:48', nonMarginJam: '133:07' },
  { tanggal: 'Rabu, 08 Juli 2026', jamKerja: '535:59', marginJam: '424:28', nonMarginJam: '111:31' },
  { tanggal: 'Kamis, 09 Juli 2026', jamKerja: '502:26', marginJam: '367:51', nonMarginJam: '134:35' },
  { tanggal: 'Jumat, 10 Juli 2026', jamKerja: '503:04', marginJam: '360:53', nonMarginJam: '142:11' },
  { tanggal: 'Sabtu, 11 Juli 2026', jamKerja: '336:46', marginJam: '263:13', nonMarginJam: '73:33' },
  { tanggal: 'Minggu, 12 Juli 2026', jamKerja: '35:59', marginJam: '21:28', nonMarginJam: '14:31' },
  { tanggal: 'Senin, 13 Juli 2026', jamKerja: '573:16', marginJam: '436:30', nonMarginJam: '136:46' },
  { tanggal: 'Selasa, 14 Juli 2026', jamKerja: '653:37', marginJam: '502:11', nonMarginJam: '151:26' },
  { tanggal: 'Rabu, 15 Juli 2026', jamKerja: '533:30', marginJam: '410:15', nonMarginJam: '123:15' },
  { tanggal: 'Kamis, 16 Juli 2026', jamKerja: '591:58', marginJam: '455:20', nonMarginJam: '136:38' },
  { tanggal: 'Jumat, 17 Juli 2026', jamKerja: '515:21', marginJam: '390:05', nonMarginJam: '125:16' },
  { tanggal: 'Sabtu, 18 Juli 2026', jamKerja: '350:42', marginJam: '270:12', nonMarginJam: '80:30' },
  { tanggal: 'Minggu, 19 Juli 2026', jamKerja: '85:10', marginJam: '22:10', nonMarginJam: '63:00' },
  { tanggal: 'Senin, 20 Juli 2026', jamKerja: '548:20', marginJam: '422:10', nonMarginJam: '126:10' },
  { tanggal: 'Selasa, 21 Juli 2026', jamKerja: '584:28', marginJam: '460:08', nonMarginJam: '124:20' },
  { tanggal: 'Rabu, 22 Juli 2026', jamKerja: '577:10', marginJam: '445:30', nonMarginJam: '131:40' },
  { tanggal: 'Kamis, 23 Juli 2026', jamKerja: '583:16', marginJam: '450:16', nonMarginJam: '133:00' },
  { tanggal: 'Jumat, 24 Juli 2026', jamKerja: '558:59', marginJam: '430:20', nonMarginJam: '128:39' },
  { tanggal: 'Sabtu, 25 Juli 2026', jamKerja: '325:17', marginJam: '250:10', nonMarginJam: '75:07' },
  { tanggal: 'Minggu, 26 Juli 2026', jamKerja: '88:45', marginJam: '20:15', nonMarginJam: '68:30' },
  { tanggal: 'Senin, 27 Juli 2026', jamKerja: '581:10', marginJam: '442:20', nonMarginJam: '138:50' },
  { tanggal: 'Selasa, 28 Juli 2026', jamKerja: '564:30', marginJam: '428:10', nonMarginJam: '136:20' },
  { tanggal: 'Rabu, 29 Juli 2026', jamKerja: '542:15', marginJam: '415:00', nonMarginJam: '127:15' },
  { tanggal: 'Kamis, 30 Juli 2026', jamKerja: '576:50', marginJam: '436:30', nonMarginJam: '140:20' },
  { tanggal: 'Jumat, 31 Juli 2026', jamKerja: '522:10', marginJam: '396:20', nonMarginJam: '125:50' },
];

const DAILY_REAL_PRODUCTION_AGUSTUS: ProductionDailyRealRow[] = [
  { tanggal: 'Sabtu, 01 Agustus 2026', jamKerja: '363:30', marginJam: '317:08', nonMarginJam: '46:22' },
  { tanggal: 'Minggu, 02 Agustus 2026', jamKerja: '14:00', marginJam: '14:00', nonMarginJam: '0:00' },
  { tanggal: 'Senin, 03 Agustus 2026', jamKerja: '347:00', marginJam: '279:30', nonMarginJam: '67:30' },
  { tanggal: 'Selasa, 04 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Rabu, 05 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Kamis, 06 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Jumat, 07 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Sabtu, 08 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Minggu, 09 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Senin, 10 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Selasa, 11 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Rabu, 12 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Kamis, 13 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Jumat, 14 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Sabtu, 15 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Minggu, 16 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Senin, 17 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Selasa, 18 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Rabu, 19 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Kamis, 20 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Jumat, 21 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Sabtu, 22 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Minggu, 23 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Senin, 24 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Selasa, 25 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Rabu, 26 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Kamis, 27 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Jumat, 28 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Sabtu, 29 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Minggu, 30 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
  { tanggal: 'Senin, 31 Agustus 2026', jamKerja: '0:00', marginJam: '0:00', nonMarginJam: '0:00' },
];

const UNIT_MARGIN_AGUSTUS_DATA: DailyJuliReportRow[] = [
  { no: 1, unitName: 'PORSCHE 993 Mr. ADRIAN', mechanic: '12:11', bodyWork: '0:00', bodyPaint: '3:33', interior: '2:12', chrome: '0:00', bubut: '13:00', qa: '0:00', allDivisi: '0:00', totalTarget: '100:00', totalActual: '30:56', highlightType: 'normal' },
  { no: 2, unitName: 'MB E320 SPORTLINE SILVER Mr. DIKO', mechanic: '119:38', bodyWork: '45:58', bodyPaint: '271:17', interior: '62:31', chrome: '18:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '950:00', totalActual: '517:24', highlightType: 'normal' },
  { no: 3, unitName: 'MB MPS Mr. DIKO', mechanic: '332:15', bodyWork: '19:02', bodyPaint: '134:50', interior: '86:11', chrome: '0:30', bubut: '5:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1276:00', totalActual: '577:48', highlightType: 'normal' },
  { no: 4, unitName: 'MB R129 Mr. DIKO', mechanic: '155:56', bodyWork: '20:30', bodyPaint: '127:56', interior: '124:31', chrome: '0:00', bubut: '1:30', qa: '0:00', allDivisi: '0:00', totalTarget: '1200:00', totalActual: '430:23', highlightType: 'normal' },
  { no: 5, unitName: 'MB 190 SL Mr. ADRIAN', mechanic: '172:10', bodyWork: '103:56', bodyPaint: '14:30', interior: '25:06', chrome: '18:00', bubut: '8:30', qa: '0:00', allDivisi: '0:00', totalTarget: '1210:00', totalActual: '342:12', highlightType: 'normal' },
  { no: 6, unitName: 'MB PAGODA Mr. DIDI', mechanic: '193:35', bodyWork: '18:00', bodyPaint: '49:00', interior: '33:14', chrome: '22:41', bubut: '22:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1150:00', totalActual: '338:30', highlightType: 'normal' },
  { no: 7, unitName: 'MB W 111 KEBO Mr. INDRA', mechanic: '0:00', bodyWork: '8:00', bodyPaint: '0:00', interior: '0:30', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '700:00', totalActual: '8:30', highlightType: 'normal' },
  { no: 8, unitName: 'MB PONTON 220 S Mr. SANTOSO', mechanic: '115:30', bodyWork: '260:51', bodyPaint: '8:30', interior: '36:56', chrome: '65:10', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '850:00', totalActual: '486:57', highlightType: 'normal' },
  { no: 9, unitName: 'MB 300 CE Mr. DIKO', mechanic: '85:10', bodyWork: '8:00', bodyPaint: '233:44', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '650:00', totalActual: '326:54', highlightType: 'normal' },
  { no: 10, unitName: 'MB 500 SEC Mr. DIKO', mechanic: '99:47', bodyWork: '22:55', bodyPaint: '218:00', interior: '71:29', chrome: '62:48', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '890:00', totalActual: '474:59', highlightType: 'normal' },
  { no: 11, unitName: 'MB MASTERPIECE NEW Mr. DIKO', mechanic: '232:01', bodyWork: '129:05', bodyPaint: '69:58', interior: '32:00', chrome: '0:00', bubut: '9:00', qa: '0:00', allDivisi: '0:00', totalTarget: '700:00', totalActual: '472:04', highlightType: 'normal' },
  { no: 12, unitName: 'MB BATMAN Mr. ICHSAN', mechanic: '40:30', bodyWork: '24:07', bodyPaint: '79:00', interior: '30:30', chrome: '73:23', bubut: '4:30', qa: '0:00', allDivisi: '0:00', totalTarget: '550:00', totalActual: '252:00', highlightType: 'normal' },
  { no: 13, unitName: 'MB 280 GE Mr. ABONG', mechanic: '187:11', bodyWork: '70:10', bodyPaint: '21:00', interior: '62:13', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '550:00', totalActual: '340:34', highlightType: 'normal' },
  { no: 14, unitName: 'JAGUAR XK120 Mr. JAMES', mechanic: '114:41', bodyWork: '29:09', bodyPaint: '2:10', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '750:00', totalActual: '146:00', highlightType: 'normal' },
  { no: 15, unitName: 'JAGUAR XK120 Mr. JAMES ( JOBDESC KHUSUS )', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '100:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 16, unitName: 'CHEVROLET Mr. NYOMAN', mechanic: '14:00', bodyWork: '102:52', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '5:05', totalTarget: '550:00', totalActual: '121:57', highlightType: 'normal' },
  { no: 17, unitName: 'MB GROSSER Mr. INDRA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:30', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '350:00', totalActual: '0:30', highlightType: 'normal' },
  { no: 18, unitName: 'PORSCHE 911 Mr. HANDY', mechanic: '60:00', bodyWork: '5:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '5:00', qa: '0:00', allDivisi: '0:00', totalTarget: '450:00', totalActual: '70:00', highlightType: 'normal' },
  { no: 19, unitName: 'MB 560 SEC Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'red' },
  { no: 20, unitName: 'MB R107 Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'red' },
  { no: 21, unitName: 'ALL UNIT', mechanic: '432:00', bodyWork: '262:34', bodyPaint: '191:08', interior: '131:28', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '839:00', totalTarget: '1900:00', totalActual: '1856:10', highlightType: 'yellow' }
];

const UNIT_NON_MARGIN_AGUSTUS_DATA: DailyJuliReportRow[] = [
  { no: 1, unitName: 'BMW 530 I Mr. MARTHIN', mechanic: '2:00', bodyWork: '0:00', bodyPaint: '0:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '50:00', totalActual: '2:30', highlightType: 'normal' },
  { no: 2, unitName: 'BMW 750 IL BARU Mr. STANLEY', mechanic: '206:17', bodyWork: '0:00', bodyPaint: '9:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '500:00', totalActual: '215:47', highlightType: 'normal' },
  { no: 3, unitName: 'BMW 750 IL LAMA Mr. STANLEY', mechanic: '10:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '10:00', highlightType: 'normal' },
  { no: 4, unitName: 'HONDA CR-V Mr. MARTHIN', mechanic: '10:19', bodyWork: '1:00', bodyPaint: '5:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '16:49', highlightType: 'normal' },
  { no: 5, unitName: 'HONDA N360 Mr. ERIC', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '150:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 6, unitName: 'KIJANG SM', mechanic: '1:00', bodyWork: '0:00', bodyPaint: '1:30', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '50:00', totalActual: '2:30', highlightType: 'normal' },
  { no: 7, unitName: 'MB E320 NEW EYES Mr. MARTHIN', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 8, unitName: 'MB R 230 Mr. STANLEY', mechanic: '8:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '8:00', highlightType: 'normal' },
  { no: 9, unitName: 'PEUGEOT 504 BIRU Mr. HANDY', mechanic: '1:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '1:00', highlightType: 'normal' },
  { no: 10, unitName: 'MB 300 D Mr. HERRY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 11, unitName: 'MB W 111 KEBO SM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 12, unitName: 'MB W111 KEBO Mr. PRAM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '182:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 13, unitName: 'MB W124 E320 SPORTLINE Mr. MARTHIN', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '1050:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 14, unitName: 'VW BEETLE Mr. RICHARD', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '409:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 15, unitName: 'PORSCHE 944 Mr. PRAM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '83:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 16, unitName: 'TOYOTA MARK X Mr. MARTHIN', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 17, unitName: 'RR Mr. STANLEY', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 18, unitName: 'MB PULLMAN Mr. ILHAM', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 19, unitName: 'MB 280 GE Mr. ANDERSON', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 20, unitName: 'FIAT MULTIPLA Mr. JOKO', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 21, unitName: 'MB 500 SEL Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 22, unitName: 'MB PAGODA Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' },
  { no: 23, unitName: 'MB 560 SL Mrs. NINA', mechanic: '0:00', bodyWork: '0:00', bodyPaint: '0:00', interior: '0:00', chrome: '0:00', bubut: '0:00', qa: '0:00', allDivisi: '0:00', totalTarget: '0:00', totalActual: '0:00', highlightType: 'normal' }
];

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  units,
  activeTab,
  onSelectUnit,
  hasilKerjaRecords,
  liveDailyTables,
}) => {
  const [subTab, setSubTab] = useState<'EXCEL_TABLE' | 'DAILY_PROD' | 'CHARTS'>('EXCEL_TABLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandDailyTables, setExpandDailyTables] = useState(true);
  const [tableStyleMode, setTableStyleMode] = useState<'ELEGANT' | 'SHEET'>('ELEGANT');
  const [tableRollMode, setTableRollMode] = useState<'ROLL' | 'EXPAND'>('ROLL');

  // Dynamically detect active month
  const activeMonth = useMemo(() => {
    const tabStr = (activeTab || '').toUpperCase();
    const MONTHS = [
      'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
      'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ];
    for (const m of MONTHS) {
      if (tabStr.includes(m)) return m;
    }
    // Check units activeMonth
    for (const u of units) {
      if (u.activeMonth) return u.activeMonth.toUpperCase();
    }
    return 'SEPTEMBER'; // Default current active
  }, [activeTab, units]);

  const isSeptember = activeMonth === 'SEPTEMBER';
  const isAgustus = activeMonth === 'AGUSTUS';
  const isOtherMonth = !isSeptember && !isAgustus;
  const monthLabel = activeMonth;
  const daysInMonth = isSeptember ? 30 : (['APRIL', 'JUNI', 'SEPTEMBER', 'NOVEMBER'].includes(activeMonth) ? 30 : (activeMonth === 'FEBRUARI' ? 28 : 31));

  const normalizeUnitName = (name: string) =>
    name ? name.toLowerCase().replace(/marthen/g, 'marthin').replace(/[^a-z0-9]/g, '') : '';

  const getNonZeroTime = (...sources: (string | undefined)[]) => {
    for (const src of sources) {
      if (src && src !== '0:00' && src !== '00:00' && src.trim() !== '') {
        return src;
      }
    }
    return '0:00';
  };

  // Fallback helpers from static source dataset
  const getSourceMarginFallback = (unitName: string) => {
    const clean = unitName.trim().toUpperCase();
    const dataset = isSeptember
      ? UNIT_MARGIN_SEPTEMBER_DATA
      : (isAgustus ? UNIT_MARGIN_AGUSTUS_DATA : UNIT_MARGIN_DATA);
    return dataset.find((m) => m.unitName.trim().toUpperCase() === clean);
  };

  const getSourceNonMarginFallback = (unitName: string) => {
    const clean = unitName.trim().toUpperCase();
    const dataset = isSeptember
      ? UNIT_NON_MARGIN_SEPTEMBER_DATA
      : (isAgustus ? UNIT_NON_MARGIN_AGUSTUS_DATA : UNIT_NON_MARGIN_DATA);
    return dataset.find((m) => m.unitName.trim().toUpperCase() === clean);
  };

  const getDivisionKey = (divisi?: string): 'mechanic' | 'bodyWork' | 'bodyPaint' | 'interior' | 'chrome' | 'bubut' | 'qa' | 'allDivisi' => {
    if (!divisi) return 'allDivisi';
    const d = divisi.trim().toUpperCase();
    if (d.includes('MECH') || d.includes('MEK')) return 'mechanic';
    if (d.includes('BODY WORK') || d.includes('BODYWORK') || d.includes('PLAT')) return 'bodyWork';
    if (d.includes('BODY PAINT') || d.includes('BODYPAINT') || d.includes('PAINT') || d.includes('CAT')) return 'bodyPaint';
    if (d.includes('INTERIOR')) return 'interior';
    if (d.includes('CHROME') || d.includes('KROM')) return 'chrome';
    if (d.includes('BUBUT')) return 'bubut';
    if (d.includes('QA') || d.includes('QUALITY') || d.includes('KP')) return 'qa';
    return 'allDivisi';
  };

  const currentHasilKerjaFallback = isSeptember ? INITIAL_HASIL_KERJA_SEPTEMBER : INITIAL_HASIL_KERJA_AGUSTUS;

  const currentUnitDivisionMap = useMemo(() => {
    const records = (hasilKerjaRecords && hasilKerjaRecords.length > 0)
      ? hasilKerjaRecords
      : currentHasilKerjaFallback;

    const map: Record<string, Record<string, string[]>> = {};

    records.forEach((rec: any) => {
      const rawUnit = rec.unit || rec.unitName || '';
      if (!rawUnit) return;
      const norm = normalizeUnitName(rawUnit);
      if (!norm) return;

      if (!map[norm]) {
        map[norm] = {
          mechanic: [],
          bodyWork: [],
          bodyPaint: [],
          interior: [],
          chrome: [],
          bubut: [],
          qa: [],
          allDivisi: [],
        };
      }

      const divKey = getDivisionKey(rec.divisi || rec.team || rec.division);
      const hrs = rec.totalJamKerja || rec.actualHours || '0:00';
      if (hrs && hrs !== '0:00' && map[norm][divKey]) {
        map[norm][divKey].push(hrs);
      }
    });

    return map;
  }, [hasilKerjaRecords, currentHasilKerjaFallback]);

  const currentUnitActualMap = useMemo(() => {
    const records = (hasilKerjaRecords && hasilKerjaRecords.length > 0)
      ? hasilKerjaRecords
      : currentHasilKerjaFallback;

    const map: Record<string, string[]> = {};

    records.forEach((rec: any) => {
      const rawUnit = rec.unit || rec.unitName || '';
      if (!rawUnit) return;
      const norm = normalizeUnitName(rawUnit);
      if (!norm) return;

      if (!map[norm]) map[norm] = [];

      const hrs = rec.totalJamKerja || rec.actualHours || '0:00';
      if (hrs && hrs !== '0:00') {
        map[norm].push(hrs);
      }
    });

    return map;
  }, [hasilKerjaRecords, currentHasilKerjaFallback]);

  // 1. Dynamic Unit Margin Rows
  const marginUnits = units.filter((u) => u.marginType === 'UNIT MARGIN');
  const marginDataRows: DailyJuliReportRow[] = useMemo(() => {
    if (isSeptember) {
      return UNIT_MARGIN_SEPTEMBER_DATA.map((r) => {
        const u = marginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
        return {
          ...r,
          originalUnit: u,
        };
      });
    } else if (isAgustus) {
      const baseRows = UNIT_MARGIN_AGUSTUS_DATA
        .map((r) => {
          const u = marginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
          const norm = normalizeUnitName(u?.unitName || r.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = (divMap?.mechanic && divMap.mechanic.length > 0) ? sumTimeStrings(divMap.mechanic) : (r.mechanic || '0:00');
          const bodyWork = (divMap?.bodyWork && divMap.bodyWork.length > 0) ? sumTimeStrings(divMap.bodyWork) : (r.bodyWork || '0:00');
          const bodyPaint = (divMap?.bodyPaint && divMap.bodyPaint.length > 0) ? sumTimeStrings(divMap.bodyPaint) : (r.bodyPaint || '0:00');
          const interior = (divMap?.interior && divMap.interior.length > 0) ? sumTimeStrings(divMap.interior) : (r.interior || '0:00');
          const chrome = (divMap?.chrome && divMap.chrome.length > 0) ? sumTimeStrings(divMap.chrome) : (r.chrome || '0:00');
          const bubut = (divMap?.bubut && divMap.bubut.length > 0) ? sumTimeStrings(divMap.bubut) : (r.bubut || '0:00');
          const qa = (divMap?.qa && divMap.qa.length > 0) ? sumTimeStrings(divMap.qa) : (r.qa || '0:00');
          const allDivisi = (divMap?.allDivisi && divMap.allDivisi.length > 0) ? sumTimeStrings(divMap.allDivisi) : (r.allDivisi || '0:00');

          const totalTarget = getNonZeroTime(u?.agustusTargetHours, r.totalTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u?.agustusActualHours && u.agustusActualHours !== '0:00'
                ? u.agustusActualHours
                : (r.totalActual && r.totalActual !== '0:00' ? r.totalActual : '0:00'));

          return {
            no: r.no,
            unitName: r.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: r.highlightType || u?.highlightType || 'normal',
            originalUnit: u,
          };
        });

      const extraUnits = marginUnits
        .filter(
          (u) =>
            !UNIT_MARGIN_AGUSTUS_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            !UNIT_NON_MARGIN_AGUSTUS_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            ((u.agustusTargetHours && u.agustusTargetHours !== '0:00') || (currentUnitActualMap[normalizeUnitName(u.unitName)]?.length ?? 0) > 0)
        )
        .map((u, idx) => {
          const norm = normalizeUnitName(u.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = sumTimeStrings(divMap?.mechanic || []);
          const bodyWork = sumTimeStrings(divMap?.bodyWork || []);
          const bodyPaint = sumTimeStrings(divMap?.bodyPaint || []);
          const interior = sumTimeStrings(divMap?.interior || []);
          const chrome = sumTimeStrings(divMap?.chrome || []);
          const bubut = sumTimeStrings(divMap?.bubut || []);
          const qa = sumTimeStrings(divMap?.qa || []);
          const allDivisi = sumTimeStrings(divMap?.allDivisi || []);

          const totalTarget = u.agustusTargetHours || '0:00';

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u.agustusActualHours && u.agustusActualHours !== '0:00' ? u.agustusActualHours : '0:00');

          return {
            no: baseRows.length + idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });

      return [...baseRows, ...extraUnits];
    } else if (isOtherMonth) {
      return marginUnits
        .filter((u) => {
          const norm = normalizeUnitName(u.unitName).toUpperCase();
          return (
            !norm.includes('TOTAL') &&
            !norm.includes('MARGIN') &&
            !norm.includes('REPORT') &&
            !norm.includes('PERSENTASE') &&
            !norm.includes('PERHITUNGAN')
          );
        })
        .map((u, idx) => {
          const norm = normalizeUnitName(u.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = (divMap?.mechanic && divMap.mechanic.length > 0)
            ? sumTimeStrings(divMap.mechanic)
            : (u.currentDivisions?.mechanic || u.divisionHours?.mechanic || '0:00');
          const bodyWork = (divMap?.bodyWork && divMap.bodyWork.length > 0)
            ? sumTimeStrings(divMap.bodyWork)
            : (u.currentDivisions?.bodyWork || u.divisionHours?.bodyWork || '0:00');
          const bodyPaint = (divMap?.bodyPaint && divMap.bodyPaint.length > 0)
            ? sumTimeStrings(divMap.bodyPaint)
            : (u.currentDivisions?.bodyPaint || u.divisionHours?.bodyPaint || '0:00');
          const interior = (divMap?.interior && divMap.interior.length > 0)
            ? sumTimeStrings(divMap.interior)
            : (u.currentDivisions?.interior || u.divisionHours?.interior || '0:00');
          const chrome = (divMap?.chrome && divMap.chrome.length > 0)
            ? sumTimeStrings(divMap.chrome)
            : (u.currentDivisions?.chrome || u.divisionHours?.chrome || '0:00');
          const bubut = (divMap?.bubut && divMap.bubut.length > 0)
            ? sumTimeStrings(divMap.bubut)
            : (u.currentDivisions?.bubut || u.divisionHours?.bubut || '0:00');
          const qa = (divMap?.qa && divMap.qa.length > 0)
            ? sumTimeStrings(divMap.qa)
            : (u.currentDivisions?.qa || '0:00');
          const allDivisi = (divMap?.allDivisi && divMap.allDivisi.length > 0)
            ? sumTimeStrings(divMap.allDivisi)
            : (u.currentDivisions?.allDivisi || '0:00');

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u.currentTargetHours, calcDivTarget, u.divisionHours?.total);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u.currentActualHours && u.currentActualHours !== '0:00' ? u.currentActualHours : '0:00');

          return {
            no: idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });
    } else {
      const baseRows = UNIT_MARGIN_DATA
        .map((r, idx) => {
          const u = marginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
          const divSource = u?.juliDivisions || u?.divisionHours;

          const mechanic = getNonZeroTime(divSource?.mechanic, r.mechanic);
          const bodyWork = getNonZeroTime(divSource?.bodyWork, r.bodyWork);
          const bodyPaint = getNonZeroTime(divSource?.bodyPaint, r.bodyPaint);
          const interior = getNonZeroTime(divSource?.interior, r.interior);
          const chrome = getNonZeroTime(divSource?.chrome, r.chrome);
          const bubut = getNonZeroTime(divSource?.bubut, r.bubut);
          const qa = getNonZeroTime(divSource?.qa, r.qa);
          const allDivisi = getNonZeroTime(divSource?.allDivisi, r.allDivisi);

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u?.juliTargetHours, divSource?.total, r.totalTarget, calcDivTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[normalizeUnitName(u?.unitName || r.unitName)] || []);
          const totalActual = getNonZeroTime(actualFromHasilKerja, u?.juliActualHours, r.totalActual);

          return {
            no: idx + 1,
            unitName: u?.unitName || r.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u?.highlightType || r.highlightType || 'normal',
            originalUnit: u,
          };
        });

      const extraUnits = marginUnits
        .filter(
          (u) =>
            !UNIT_MARGIN_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            !UNIT_NON_MARGIN_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName))
        )
        .map((u, idx) => {
          const divSource = u.juliDivisions || u.divisionHours;
          const mechanic = divSource?.mechanic || '0:00';
          const bodyWork = divSource?.bodyWork || '0:00';
          const bodyPaint = divSource?.bodyPaint || '0:00';
          const interior = divSource?.interior || '0:00';
          const chrome = divSource?.chrome || '0:00';
          const bubut = divSource?.bubut || '0:00';
          const qa = divSource?.qa || '0:00';
          const allDivisi = divSource?.allDivisi || '0:00';

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u.juliTargetHours, calcDivTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[normalizeUnitName(u.unitName)] || []);
          const totalActual = getNonZeroTime(actualFromHasilKerja, u.juliActualHours);

          return {
            no: baseRows.length + idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });

      return [...baseRows, ...extraUnits];
    }
  }, [isSeptember, isAgustus, marginUnits, currentUnitActualMap, currentUnitDivisionMap]);

  // 2. Dynamic Unit Non-Margin Rows
  const nonMarginUnits = units.filter((u) => u.marginType === 'UNIT NON MARGIN');
  const nonMarginDataRows: DailyJuliReportRow[] = useMemo(() => {
    if (isSeptember) {
      return UNIT_NON_MARGIN_SEPTEMBER_DATA.map((r) => {
        const u = nonMarginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
        return {
          ...r,
          originalUnit: u,
        };
      });
    } else if (isAgustus) {
      const baseRows = UNIT_NON_MARGIN_AGUSTUS_DATA
        .map((r) => {
          const u = nonMarginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
          const norm = normalizeUnitName(u?.unitName || r.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = (divMap?.mechanic && divMap.mechanic.length > 0) ? sumTimeStrings(divMap.mechanic) : (r.mechanic || '0:00');
          const bodyWork = (divMap?.bodyWork && divMap.bodyWork.length > 0) ? sumTimeStrings(divMap.bodyWork) : (r.bodyWork || '0:00');
          const bodyPaint = (divMap?.bodyPaint && divMap.bodyPaint.length > 0) ? sumTimeStrings(divMap.bodyPaint) : (r.bodyPaint || '0:00');
          const interior = (divMap?.interior && divMap.interior.length > 0) ? sumTimeStrings(divMap.interior) : (r.interior || '0:00');
          const chrome = (divMap?.chrome && divMap.chrome.length > 0) ? sumTimeStrings(divMap.chrome) : (r.chrome || '0:00');
          const bubut = (divMap?.bubut && divMap.bubut.length > 0) ? sumTimeStrings(divMap.bubut) : (r.bubut || '0:00');
          const qa = (divMap?.qa && divMap.qa.length > 0) ? sumTimeStrings(divMap.qa) : (r.qa || '0:00');
          const allDivisi = (divMap?.allDivisi && divMap.allDivisi.length > 0) ? sumTimeStrings(divMap.allDivisi) : (r.allDivisi || '0:00');

          const totalTarget = getNonZeroTime(u?.agustusTargetHours, r.totalTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u?.agustusActualHours && u.agustusActualHours !== '0:00'
                ? u.agustusActualHours
                : (r.totalActual && r.totalActual !== '0:00' ? r.totalActual : '0:00'));

          return {
            no: r.no,
            unitName: r.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: r.highlightType || u?.highlightType || 'normal',
            originalUnit: u,
          };
        });

      const extraUnits = nonMarginUnits
        .filter(
          (u) =>
            !UNIT_NON_MARGIN_AGUSTUS_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            !UNIT_MARGIN_AGUSTUS_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            ((u.agustusTargetHours && u.agustusTargetHours !== '0:00') || (currentUnitActualMap[normalizeUnitName(u.unitName)]?.length ?? 0) > 0)
        )
        .map((u, idx) => {
          const norm = normalizeUnitName(u.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = sumTimeStrings(divMap?.mechanic || []);
          const bodyWork = sumTimeStrings(divMap?.bodyWork || []);
          const bodyPaint = sumTimeStrings(divMap?.bodyPaint || []);
          const interior = sumTimeStrings(divMap?.interior || []);
          const chrome = sumTimeStrings(divMap?.chrome || []);
          const bubut = sumTimeStrings(divMap?.bubut || []);
          const qa = sumTimeStrings(divMap?.qa || []);
          const allDivisi = sumTimeStrings(divMap?.allDivisi || []);

          const totalTarget = u.agustusTargetHours || '0:00';

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u.agustusActualHours && u.agustusActualHours !== '0:00' ? u.agustusActualHours : '0:00');

          return {
            no: baseRows.length + idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });

      return [...baseRows, ...extraUnits];
    } else if (isOtherMonth) {
      return nonMarginUnits
        .filter((u) => {
          const norm = normalizeUnitName(u.unitName).toUpperCase();
          return (
            !norm.includes('TOTAL') &&
            !norm.includes('MARGIN') &&
            !norm.includes('REPORT') &&
            !norm.includes('PERSENTASE') &&
            !norm.includes('PERHITUNGAN')
          );
        })
        .map((u, idx) => {
          const norm = normalizeUnitName(u.unitName);
          const divMap = currentUnitDivisionMap[norm];

          const mechanic = (divMap?.mechanic && divMap.mechanic.length > 0)
            ? sumTimeStrings(divMap.mechanic)
            : (u.currentDivisions?.mechanic || u.divisionHours?.mechanic || '0:00');
          const bodyWork = (divMap?.bodyWork && divMap.bodyWork.length > 0)
            ? sumTimeStrings(divMap.bodyWork)
            : (u.currentDivisions?.bodyWork || u.divisionHours?.bodyWork || '0:00');
          const bodyPaint = (divMap?.bodyPaint && divMap.bodyPaint.length > 0)
            ? sumTimeStrings(divMap.bodyPaint)
            : (u.currentDivisions?.bodyPaint || u.divisionHours?.bodyPaint || '0:00');
          const interior = (divMap?.interior && divMap.interior.length > 0)
            ? sumTimeStrings(divMap.interior)
            : (u.currentDivisions?.interior || u.divisionHours?.interior || '0:00');
          const chrome = (divMap?.chrome && divMap.chrome.length > 0)
            ? sumTimeStrings(divMap.chrome)
            : (u.currentDivisions?.chrome || u.divisionHours?.chrome || '0:00');
          const bubut = (divMap?.bubut && divMap.bubut.length > 0)
            ? sumTimeStrings(divMap.bubut)
            : (u.currentDivisions?.bubut || u.divisionHours?.bubut || '0:00');
          const qa = (divMap?.qa && divMap.qa.length > 0)
            ? sumTimeStrings(divMap.qa)
            : (u.currentDivisions?.qa || '0:00');
          const allDivisi = (divMap?.allDivisi && divMap.allDivisi.length > 0)
            ? sumTimeStrings(divMap.allDivisi)
            : (u.currentDivisions?.allDivisi || '0:00');

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u.currentTargetHours, calcDivTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[norm] || []);
          const totalActual = actualFromHasilKerja !== '0:00'
            ? actualFromHasilKerja
            : (u.currentActualHours && u.currentActualHours !== '0:00' ? u.currentActualHours : '0:00');

          return {
            no: idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });
    } else {
      const baseRows = UNIT_NON_MARGIN_DATA
        .map((r, idx) => {
          const u = nonMarginUnits.find((item) => normalizeUnitName(item.unitName) === normalizeUnitName(r.unitName));
          const divSource = u?.juliDivisions || u?.divisionHours;

          const mechanic = getNonZeroTime(divSource?.mechanic, r.mechanic);
          const bodyWork = getNonZeroTime(divSource?.bodyWork, r.bodyWork);
          const bodyPaint = getNonZeroTime(divSource?.bodyPaint, r.bodyPaint);
          const interior = getNonZeroTime(divSource?.interior, r.interior);
          const chrome = getNonZeroTime(divSource?.chrome, r.chrome);
          const bubut = getNonZeroTime(divSource?.bubut, r.bubut);
          const qa = getNonZeroTime(divSource?.qa, r.qa);
          const allDivisi = getNonZeroTime(divSource?.allDivisi, r.allDivisi);

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u?.juliTargetHours, divSource?.total, r.totalTarget, calcDivTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[normalizeUnitName(u?.unitName || r.unitName)] || []);
          const totalActual = getNonZeroTime(actualFromHasilKerja, u?.juliActualHours, r.totalActual);

          return {
            no: idx + 1,
            unitName: u?.unitName || r.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u?.highlightType || r.highlightType || 'normal',
            originalUnit: u,
          };
        });

      const extraUnits = nonMarginUnits
        .filter(
          (u) =>
            !UNIT_NON_MARGIN_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName)) &&
            !UNIT_MARGIN_DATA.some((r) => normalizeUnitName(r.unitName) === normalizeUnitName(u.unitName))
        )
        .map((u, idx) => {
          const divSource = u.juliDivisions || u.divisionHours;
          const mechanic = divSource?.mechanic || '0:00';
          const bodyWork = divSource?.bodyWork || '0:00';
          const bodyPaint = divSource?.bodyPaint || '0:00';
          const interior = divSource?.interior || '0:00';
          const chrome = divSource?.chrome || '0:00';
          const bubut = divSource?.bubut || '0:00';
          const qa = divSource?.qa || '0:00';
          const allDivisi = divSource?.allDivisi || '0:00';

          const calcDivTarget = sumTimeStrings([mechanic, bodyWork, bodyPaint, interior, chrome, bubut, qa, allDivisi]);
          const totalTarget = getNonZeroTime(u.juliTargetHours, calcDivTarget);

          const actualFromHasilKerja = sumTimeStrings(currentUnitActualMap[normalizeUnitName(u.unitName)] || []);
          const totalActual = getNonZeroTime(actualFromHasilKerja, u.juliActualHours);

          return {
            no: baseRows.length + idx + 1,
            unitName: u.unitName,
            mechanic,
            bodyWork,
            bodyPaint,
            interior,
            chrome,
            bubut,
            qa,
            allDivisi,
            totalTarget,
            totalActual,
            highlightType: u.highlightType || 'normal',
            originalUnit: u,
          };
        });

      return [...baseRows, ...extraUnits];
    }
  }, [isSeptember, isAgustus, nonMarginUnits, currentUnitActualMap, currentUnitDivisionMap]);

  // Filtered lists for search
  const filteredMargin = marginDataRows.filter((r) =>
    r.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNonMargin = nonMarginDataRows.filter((r) =>
    r.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary Totals for Unit Margin
  const sumMarginMech = sumTimeStrings(marginDataRows.map((r) => r.mechanic));
  const sumMarginBody = sumTimeStrings(marginDataRows.map((r) => r.bodyWork));
  const sumMarginPaint = sumTimeStrings(marginDataRows.map((r) => r.bodyPaint));
  const sumMarginInterior = sumTimeStrings(marginDataRows.map((r) => r.interior));
  const sumMarginChrome = sumTimeStrings(marginDataRows.map((r) => r.chrome));
  const sumMarginBubut = sumTimeStrings(marginDataRows.map((r) => r.bubut));
  const sumMarginQA = sumTimeStrings(marginDataRows.map((r) => r.qa));
  const sumMarginAllDiv = sumTimeStrings(marginDataRows.map((r) => r.allDivisi));
  const sumMarginTarget = sumTimeStrings(marginDataRows.map((r) => r.totalTarget));
  const sumMarginActual = sumTimeStrings(marginDataRows.map((r) => r.totalActual));

  // Summary Totals for Unit Non-Margin
  const sumNonMarginMech = sumTimeStrings(nonMarginDataRows.map((r) => r.mechanic));
  const sumNonMarginBody = sumTimeStrings(nonMarginDataRows.map((r) => r.bodyWork));
  const sumNonMarginPaint = sumTimeStrings(nonMarginDataRows.map((r) => r.bodyPaint));
  const sumNonMarginInterior = sumTimeStrings(nonMarginDataRows.map((r) => r.interior));
  const sumNonMarginChrome = sumTimeStrings(nonMarginDataRows.map((r) => r.chrome));
  const sumNonMarginBubut = sumTimeStrings(nonMarginDataRows.map((r) => r.bubut));
  const sumNonMarginQA = sumTimeStrings(nonMarginDataRows.map((r) => r.qa));
  const sumNonMarginAllDiv = sumTimeStrings(nonMarginDataRows.map((r) => r.allDivisi));
  const sumNonMarginTarget = sumTimeStrings(nonMarginDataRows.map((r) => r.totalTarget));
  const sumNonMarginActual = sumTimeStrings(nonMarginDataRows.map((r) => r.totalActual));

  // Dynamic scaled daily production rows matching source actuals
  const rawDailyProductionRows = isSeptember
    ? DAILY_REAL_PRODUCTION_SEPTEMBER
    : (isAgustus ? DAILY_REAL_PRODUCTION_AGUSTUS : DAILY_REAL_PRODUCTION_JULI);

  const dailyProductionRows = useMemo(() => {
    if (isSeptember) {
      return DAILY_REAL_PRODUCTION_SEPTEMBER;
    } else if (isAgustus) {
      const rawRecords = (hasilKerjaRecords && hasilKerjaRecords.length > 0)
        ? hasilKerjaRecords
        : INITIAL_HASIL_KERJA_AGUSTUS;

      // Set of Non-Margin unit names
      const nonMarginNamesSet = new Set<string>();
      nonMarginUnits.forEach((u) => nonMarginNamesSet.add(u.unitName.trim().toUpperCase()));
      UNIT_NON_MARGIN_AGUSTUS_DATA.forEach((u) => nonMarginNamesSet.add(u.unitName.trim().toUpperCase()));

      // Standard 31 days list for August
      const agustusDays = [
        { dateStr: 'Sabtu, 01 Agustus 2026', dayNum: '01' },
        { dateStr: 'Minggu, 02 Agustus 2026', dayNum: '02' },
        { dateStr: 'Senin, 03 Agustus 2026', dayNum: '03' },
        { dateStr: 'Selasa, 04 Agustus 2026', dayNum: '04' },
        { dateStr: 'Rabu, 05 Agustus 2026', dayNum: '05' },
        { dateStr: 'Kamis, 06 Agustus 2026', dayNum: '06' },
        { dateStr: 'Jumat, 07 Agustus 2026', dayNum: '07' },
        { dateStr: 'Sabtu, 08 Agustus 2026', dayNum: '08' },
        { dateStr: 'Minggu, 09 Agustus 2026', dayNum: '09' },
        { dateStr: 'Senin, 10 Agustus 2026', dayNum: '10' },
        { dateStr: 'Selasa, 11 Agustus 2026', dayNum: '11' },
        { dateStr: 'Rabu, 12 Agustus 2026', dayNum: '12' },
        { dateStr: 'Kamis, 13 Agustus 2026', dayNum: '13' },
        { dateStr: 'Jumat, 14 Agustus 2026', dayNum: '14' },
        { dateStr: 'Sabtu, 15 Agustus 2026', dayNum: '15' },
        { dateStr: 'Minggu, 16 Agustus 2026', dayNum: '16' },
        { dateStr: 'Senin, 17 Agustus 2026', dayNum: '17' },
        { dateStr: 'Selasa, 18 Agustus 2026', dayNum: '18' },
        { dateStr: 'Rabu, 19 Agustus 2026', dayNum: '19' },
        { dateStr: 'Kamis, 20 Agustus 2026', dayNum: '20' },
        { dateStr: 'Jumat, 21 Agustus 2026', dayNum: '21' },
        { dateStr: 'Sabtu, 22 Agustus 2026', dayNum: '22' },
        { dateStr: 'Minggu, 23 Agustus 2026', dayNum: '23' },
        { dateStr: 'Senin, 24 Agustus 2026', dayNum: '24' },
        { dateStr: 'Selasa, 25 Agustus 2026', dayNum: '25' },
        { dateStr: 'Rabu, 26 Agustus 2026', dayNum: '26' },
        { dateStr: 'Kamis, 27 Agustus 2026', dayNum: '27' },
        { dateStr: 'Jumat, 28 Agustus 2026', dayNum: '28' },
        { dateStr: 'Sabtu, 29 Agustus 2026', dayNum: '29' },
        { dateStr: 'Minggu, 30 Agustus 2026', dayNum: '30' },
        { dateStr: 'Senin, 31 Agustus 2026', dayNum: '31' },
      ];

      return agustusDays.map((day) => {
        const dayRecords = rawRecords.filter((rec: any) => {
          const rDate = (rec.tanggal || rec.date || '').toLowerCase();
          return rDate.includes(`${day.dayNum} agustus`) || rDate === day.dateStr.toLowerCase();
        });

        let marginTimes: string[] = [];
        let nonMarginTimes: string[] = [];

        dayRecords.forEach((rec: any) => {
          const uName = (rec.unit || rec.unitName || '').trim().toUpperCase();
          const hrs = rec.totalJamKerja || rec.actualHours || '0:00';

          if (nonMarginNamesSet.has(uName)) {
            nonMarginTimes.push(hrs);
          } else {
            marginTimes.push(hrs);
          }
        });

        const marginJam = sumTimeStrings(marginTimes);
        const nonMarginJam = sumTimeStrings(nonMarginTimes);
        const jamKerja = sumTimeStrings([marginJam, nonMarginJam]);

        return {
          tanggal: day.dateStr,
          jamKerja,
          marginJam,
          nonMarginJam,
        };
      });
    } else if (isOtherMonth) {
      const rawRecords = (hasilKerjaRecords && hasilKerjaRecords.length > 0)
        ? hasilKerjaRecords
        : [];

      const nonMarginNamesSet = new Set<string>();
      nonMarginUnits.forEach((u) => nonMarginNamesSet.add(u.unitName.trim().toUpperCase()));

      const daysInMonth = ['APRIL', 'JUNI', 'SEPTEMBER', 'NOVEMBER'].includes(activeMonth)
        ? 30
        : (activeMonth === 'FEBRUARI' ? 28 : 31);

      const generatedDays = Array.from({ length: daysInMonth }, (_, idx) => {
        const dNum = (idx + 1).toString().padStart(2, '0');
        const dShort = (idx + 1).toString();
        const mShort = activeMonth.slice(0, 3).toLowerCase();
        return {
          dayNum: dNum,
          dayShort: dShort,
          mShort,
          dateStr: `${dNum} ${activeMonth.toLowerCase()} 2026`,
        };
      });

      return generatedDays.map((day) => {
        const dayRecords = rawRecords.filter((rec: any) => {
          const rDate = (rec.tanggal || rec.date || '').toLowerCase();
          return (
            rDate.includes(`${day.dayNum} ${activeMonth.toLowerCase()}`) ||
            rDate.includes(`${day.dayShort} ${activeMonth.toLowerCase()}`) ||
            rDate.includes(`${day.dayShort}-${day.mShort}`) ||
            rDate === day.dateStr.toLowerCase()
          );
        });

        let marginTimes: string[] = [];
        let nonMarginTimes: string[] = [];

        dayRecords.forEach((rec: any) => {
          const uName = (rec.unit || rec.unitName || '').trim().toUpperCase();
          const hrs = rec.totalJamKerja || rec.actualHours || '0:00';

          if (nonMarginNamesSet.has(uName)) {
            nonMarginTimes.push(hrs);
          } else {
            marginTimes.push(hrs);
          }
        });

        const marginJam = sumTimeStrings(marginTimes);
        const nonMarginJam = sumTimeStrings(nonMarginTimes);
        const jamKerja = sumTimeStrings([marginJam, nonMarginJam]);

        return {
          tanggal: day.dateStr,
          jamKerja,
          marginJam,
          nonMarginJam,
        };
      });
    }

    const marginDec = timeToDecimalHours(sumMarginActual);
    const nonMarginDec = timeToDecimalHours(sumNonMarginActual);

    const baseMarginDecSum = rawDailyProductionRows.reduce((acc, r) => acc + timeToDecimalHours(r.marginJam), 0);
    const baseNonMarginDecSum = rawDailyProductionRows.reduce((acc, r) => acc + timeToDecimalHours(r.nonMarginJam), 0);

    if (baseMarginDecSum <= 0 || baseNonMarginDecSum <= 0) {
      return rawDailyProductionRows;
    }

    const marginFactor = marginDec / baseMarginDecSum;
    const nonMarginFactor = nonMarginDec / baseNonMarginDecSum;

    return rawDailyProductionRows.map((r) => {
      const origMargin = timeToDecimalHours(r.marginJam);
      const origNonMargin = timeToDecimalHours(r.nonMarginJam);

      const scaledMarginDec = origMargin * marginFactor;
      const scaledNonMarginDec = origNonMargin * nonMarginFactor;

      const mMinutes = Math.round(scaledMarginDec * 60);
      const mH = Math.floor(mMinutes / 60);
      const mM = mMinutes % 60;
      const marginStr = `${mH}:${mM < 10 ? '0' : ''}${mM}`;

      const nmMinutes = Math.round(scaledNonMarginDec * 60);
      const nmH = Math.floor(nmMinutes / 60);
      const nmM = nmMinutes % 60;
      const nonMarginStr = `${nmH}:${nmM < 10 ? '0' : ''}${nmM}`;

      const totalDayStr = sumTimeStrings([marginStr, nonMarginStr]);

      return {
        tanggal: r.tanggal,
        marginJam: marginStr,
        nonMarginJam: nonMarginStr,
        jamKerja: totalDayStr,
      };
    });
  }, [isSeptember, isAgustus, hasilKerjaRecords, nonMarginUnits, rawDailyProductionRows, sumMarginActual, sumNonMarginActual]);

  // Dynamic rows for Table 2: Hasil Kerja Per Hari Unit Margin & Non Margin (All 30 days of September)
  const dailyMarginNonMarginRows = useMemo(() => {
    if (isSeptember) {
      // Map of live rows directly from connected Google Sheet (GID 938106022 columns 23-26)
      const liveSheetMap = new Map<number, { tanggal: string; marginJam: string; nonMarginJam: string; totalJam: string }>();
      if (liveDailyTables?.hkRows && liveDailyTables.hkRows.length > 0) {
        liveDailyTables.hkRows.forEach((r) => {
          const match = r.tanggal.match(/^(\d+)/);
          if (match) {
            const dayNum = parseInt(match[1], 10);
            liveSheetMap.set(dayNum, {
              tanggal: r.tanggal,
              marginJam: r.marginJam || '0:00',
              nonMarginJam: r.nonMarginJam || '0:00',
              totalJam: r.totalJam || '0:00',
            });
          }
        });
      }

      // Map of verified baseline items by day number (1..30)
      const baseMap = new Map<number, { marginJam: string; nonMarginJam: string; totalJam: string }>();
      DAILY_MARGIN_NON_MARGIN_SEPTEMBER.forEach((d) => {
        const match = d.tanggal.match(/^(\d+)/);
        if (match) {
          const dayNum = parseInt(match[1], 10);
          baseMap.set(dayNum, {
            marginJam: d.marginJam,
            nonMarginJam: d.nonMarginJam,
            totalJam: d.totalJam,
          });
        }
      });

      // Map of live calculated hours from synced Google Sheets hasilKerjaRecords
      const liveDaysMap = new Map<number, { margin: number; nonMargin: number }>();
      if (hasilKerjaRecords && hasilKerjaRecords.length > 0) {
        const nonMarginSet = new Set<string>();
        UNIT_NON_MARGIN_SEPTEMBER_DATA.forEach((u) => nonMarginSet.add(u.unitName.trim().toUpperCase()));

        hasilKerjaRecords.forEach((r) => {
          const rawDate = (r.tanggal || '').trim();
          if (!rawDate) return;
          const match = rawDate.match(/^(\d+)/);
          if (match) {
            const dayNum = parseInt(match[1], 10);
            if (dayNum >= 1 && dayNum <= 30) {
              const hrs = timeToDecimalHours(r.totalJamKerja || r.jamKerja || '0:00');
              if (hrs > 0) {
                if (!liveDaysMap.has(dayNum)) {
                  liveDaysMap.set(dayNum, { margin: 0, nonMargin: 0 });
                }
                const entry = liveDaysMap.get(dayNum)!;
                const uName = (r.unit || '').trim().toUpperCase();
                const isNM = (r.kategori && r.kategori.toUpperCase().includes('NON')) || nonMarginSet.has(uName);
                if (isNM) {
                  entry.nonMargin += hrs;
                } else {
                  entry.margin += hrs;
                }
              }
            }
          }
        });
      }

      // Generate all 30 days of September (1-Sep-2026 to 30-Sep-2026) in exact order
      const result = [];
      for (let day = 1; day <= 30; day++) {
        const dateStr = `${day}-Sep-2026`;
        const sheetRow = liveSheetMap.get(day);
        const base = baseMap.get(day);
        const live = liveDaysMap.get(day);

        let marginJam = '0:00';
        let nonMarginJam = '0:00';
        let totalJam = '0:00';

        // 1. Direct from Google Sheet Table (formula / IMPORTRANGE)
        if (sheetRow && sheetRow.totalJam !== '0:00' && sheetRow.totalJam !== '00:00') {
          marginJam = sheetRow.marginJam;
          nonMarginJam = sheetRow.nonMarginJam;
          totalJam = sheetRow.totalJam;
        } else if (live && (live.margin > 0 || live.nonMargin > 0)) {
          // 2. Realtime input from Hasil Kerja September
          marginJam = formatDecimalHours(live.margin);
          nonMarginJam = formatDecimalHours(live.nonMargin);
          totalJam = formatDecimalHours(live.margin + live.nonMargin);
        } else if (base && base.totalJam !== '0:00' && base.totalJam !== '00:00') {
          // 3. Verified baseline
          marginJam = base.marginJam;
          nonMarginJam = base.nonMarginJam;
          totalJam = base.totalJam;
        } else if (sheetRow) {
          marginJam = sheetRow.marginJam;
          nonMarginJam = sheetRow.nonMarginJam;
          totalJam = sheetRow.totalJam;
        } else if (base) {
          marginJam = base.marginJam;
          nonMarginJam = base.nonMarginJam;
          totalJam = base.totalJam;
        }

        result.push({
          tanggal: dateStr,
          marginJam,
          nonMarginJam,
          totalJam,
        });
      }

      return result;
    }

    return dailyProductionRows.map((r) => ({
      tanggal: r.tanggal,
      marginJam: r.marginJam,
      nonMarginJam: r.nonMarginJam,
      totalJam: r.jamKerja,
    }));
  }, [isSeptember, liveDailyTables, hasilKerjaRecords, dailyProductionRows]);

  // Table 1 rows (Perhitungan Jam Kerja Real Produksi) perfectly synchronized with Google Sheets & Table 2
  const perhitunganRealRows = useMemo(() => {
    // Map of live Table 1 parsed directly from Google Sheets GID 938106022 columns 20-21
    const livePjkMap = new Map<number, string>();
    if (liveDailyTables?.pjkRows && liveDailyTables.pjkRows.length > 0) {
      liveDailyTables.pjkRows.forEach((p) => {
        const match = p.tanggal.match(/^(\d+)/);
        if (match) {
          livePjkMap.set(parseInt(match[1], 10), p.jamKerja);
        }
      });
    }

    return dailyMarginNonMarginRows.map((d) => {
      const match = d.tanggal.match(/^(\d+)/);
      const dayNum = match ? parseInt(match[1], 10) : 0;
      const sheetPjkJam = livePjkMap.get(dayNum);

      // Prioritize live sheet Table 1 if present and non-zero, otherwise Table 2 totalJam
      const jamKerja = sheetPjkJam && sheetPjkJam !== '0:00' ? sheetPjkJam : d.totalJam;

      return {
        tanggal: d.tanggal,
        jamKerja,
      };
    });
  }, [dailyMarginNonMarginRows, liveDailyTables]);

  const dailyMarginTotal = useMemo(() => {
    return sumTimeStrings(dailyMarginNonMarginRows.map((d) => d.marginJam));
  }, [dailyMarginNonMarginRows]);

  const dailyNonMarginTotal = useMemo(() => {
    return sumTimeStrings(dailyMarginNonMarginRows.map((d) => d.nonMarginJam));
  }, [dailyMarginNonMarginRows]);

  const dailyProductionTotal = useMemo(() => {
    return sumTimeStrings(dailyMarginNonMarginRows.map((d) => d.totalJam));
  }, [dailyMarginNonMarginRows]);

  // Grand Combined Totals synchronized with Sheet Summary and Targets
  const sheetSummary = liveDailyTables?.targetSummary;
  const effectiveMarginTarget =
    sheetSummary?.targetMargin && sheetSummary.targetMargin !== '0:00'
      ? sheetSummary.targetMargin
      : (isSeptember ? '13482:00' : sumMarginTarget);

  const effectiveNonMarginTarget =
    sheetSummary?.targetNonMargin && sheetSummary.targetNonMargin !== '0:00'
      ? sheetSummary.targetNonMargin
      : (isSeptember ? (sumNonMarginTarget !== '0:00' ? sumNonMarginTarget : '1515:00') : sumNonMarginTarget);

  const grandTotalTarget =
    sheetSummary?.totalTarget && sheetSummary.totalTarget !== '0:00'
      ? sheetSummary.totalTarget
      : (isSeptember ? '14997:00' : sumTimeStrings([effectiveMarginTarget, effectiveNonMarginTarget]));

  const grandTotalActual =
    sheetSummary?.totalActual && sheetSummary.totalActual !== '0:00'
      ? sheetSummary.totalActual
      : (isSeptember
          ? '8589:50'
          : (dailyProductionTotal !== '0:00'
              ? dailyProductionTotal
              : sumTimeStrings([sumMarginActual, sumNonMarginActual])));

  const effectiveMarginActual =
    sheetSummary?.actualMargin && sheetSummary.actualMargin !== '0:00'
      ? sheetSummary.actualMargin
      : (isSeptember ? '7610:22' : (dailyMarginTotal !== '0:00' ? dailyMarginTotal : sumMarginActual));

  const effectiveNonMarginActual =
    sheetSummary?.actualNonMargin && sheetSummary.actualNonMargin !== '0:00'
      ? sheetSummary.actualNonMargin
      : (isSeptember ? (sumNonMarginActual !== '0:00' ? sumNonMarginActual : '979:28') : sumNonMarginActual);

  const grandTargetDec = timeToDecimalHours(grandTotalTarget) || 1;
  const marginTargetDec = timeToDecimalHours(effectiveMarginTarget) || 1;
  const nonMarginTargetDec = timeToDecimalHours(effectiveNonMarginTarget) || 1;
  const marginActualDec = timeToDecimalHours(effectiveMarginActual);
  const nonMarginActualDec = timeToDecimalHours(effectiveNonMarginActual);
  const marginPct =
    sheetSummary?.persentaseMargin
      ? parseFloat(sheetSummary.persentaseMargin.replace('%', '').replace(',', '.'))
      : (isSeptember ? 56.45 : Math.round((marginActualDec / marginTargetDec) * 100 * 100) / 100);
  const nonMarginPct =
    sheetSummary?.persentaseNonMargin
      ? parseFloat(sheetSummary.persentaseNonMargin.replace('%', '').replace(',', '.'))
      : (isSeptember ? 64.65 : Math.round((nonMarginActualDec / nonMarginTargetDec) * 100 * 100) / 100);

  const renderRowHighlightClass = (type?: string) => {
    switch (type) {
      case 'green':
        return 'bg-emerald-950/40 border-l-4 border-l-emerald-500 text-emerald-200';
      case 'red':
        return 'bg-red-950/30 border-l-4 border-l-red-500 text-red-200';
      case 'yellow':
        return 'bg-amber-950/30 border-l-4 border-l-amber-500 text-amber-200';
      default:
        return 'hover:bg-white/5 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Excel Header */}
      <div className="bg-black/35 backdrop-blur-sm border border-[#c5a059]/40 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-black/30 py-4 px-6 border-b border-[#c5a059]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-modern font-black text-[#c5a059] tracking-wider uppercase">
                Report Project DAILY {monthLabel}
              </h1>
              <p className="text-xs text-gray-300 font-mono">
                SISTEM LENGKAP BENGKEL: UNIT MARGIN &amp; UNIT NON MARGIN (DATA REALTIME TAB {monthLabel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubTab('EXCEL_TABLE')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                subTab === 'EXCEL_TABLE'
                  ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-lg'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📋 Spreadsheet Lengkap
            </button>
            <button
              onClick={() => setSubTab('DAILY_PROD')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                subTab === 'DAILY_PROD'
                  ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-lg'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📅 Jam Kerja Real Produksi
            </button>
            <button
              onClick={() => setSubTab('CHARTS')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                subTab === 'CHARTS'
                  ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-lg'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📊 Analisis &amp; Persentase
            </button>
          </div>
        </div>

        {/* Top Summary Metric Bar */}
        <div className="bg-black/25 backdrop-blur-sm grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 text-xs font-mono">
          <div className="p-3.5 flex flex-col justify-center">
            <span className="text-gray-300 text-[10px] uppercase font-sans font-bold">TOTAL JAM KERJA REAL:</span>
            <span className="text-xl font-black text-[#c5a059] font-mono">{grandTotalActual}</span>
          </div>
          <div className="p-3.5 flex flex-col justify-center">
            <span className="text-gray-300 text-[10px] uppercase font-sans font-bold">TARGET MARGIN {monthLabel}:</span>
            <span className="text-lg font-bold text-emerald-400">{effectiveMarginTarget} <span className="text-xs text-gray-300 font-normal">({marginPct}%)</span></span>
          </div>
          <div className="p-3.5 flex flex-col justify-center">
            <span className="text-gray-300 text-[10px] uppercase font-sans font-bold">TARGET NON MARGIN {monthLabel}:</span>
            <span className="text-lg font-bold text-amber-400">{effectiveNonMarginTarget} <span className="text-xs text-gray-300 font-normal">({nonMarginPct}%)</span></span>
          </div>
          <div className="p-3.5 flex flex-col justify-center">
            <span className="text-gray-300 text-[10px] uppercase font-sans font-bold">TOTAL TARGET ALL:</span>
            <span className="text-lg font-bold text-white">{grandTotalTarget}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: COMPLETE EXCEL SPREADSHEET */}
      {subTab === 'EXCEL_TABLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Left Tables Area (3 Columns) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search and Toolbar */}
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama unit margin / non margin..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#c5a059]" /> Cetak Spreadsheet
                </button>
              </div>
            </div>

            {/* SECTION A: UNIT MARGIN TABLE */}
            <div className="bg-black/30 backdrop-blur-[2px] border border-[#c5a059]/40 rounded-2xl overflow-hidden shadow-2xl space-y-0 relative">
              <div className="bg-[#d97706]/85 backdrop-blur-sm text-black py-2.5 px-6 font-black text-sm uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4" /> {isSeptember ? 'REPORT PROJECT DAILY SEPTEMBER - UNIT MARGIN' : 'TABLE 1: UNIT MARGIN'} ({marginDataRows.length} UNIT)
                </span>
                <span className="font-mono text-xs">TARGET: {sumMarginTarget} | ACTUAL: {sumMarginActual}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-black/55 backdrop-blur-sm text-gray-200 border-b border-[#c5a059]/40 font-mono text-[11px]">
                      <th rowSpan={2} className="py-2 px-2 border-r border-white/10 text-center w-10">No.</th>
                      <th rowSpan={2} className="py-2 px-3 border-r border-white/10 text-left min-w-[210px] text-[#c5a059]">Nama unit</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">MECHANIC</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BODY WORK</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BODY PAINT</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">INTERIOR</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">CHROME</th>
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BUBUT</th>
                      {!isSeptember && <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">QA</th>}
                      <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">ALL DIVISI</th>
                      <th rowSpan={2} className="py-2 px-2 border-r border-white/10 text-center bg-black/80 text-white font-black">TOTAL</th>
                      <th rowSpan={2} className="py-2 px-2 text-center bg-[#22c55e] text-black font-black">TOTAL JAM KERJA ACTUAL</th>
                    </tr>
                    <tr className="bg-[#facc15] text-black font-black text-[10px] uppercase border-b border-black/30">
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      <th className="py-1 px-2 border-r border-black/20 text-center">BUBUT</th>
                      {!isSeptember && <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>}
                      <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] bg-transparent">
                    {filteredMargin.map((r, idx) => {
                      const isAllUnit = r.unitName === 'ALL UNIT';
                      const isRedName = ['MB W 111 KEBO Mr. INDRA', 'MB GROSSER Mr. INDRA', 'PORSCHE 911 Mr. HANDY', 'MB 560 SEC Mrs. NINA', 'MB R107 Mrs. NINA'].some(name => r.unitName.includes(name));
                      const isRedActual = isSeptember && r.unitName.includes('MB MASTERPIECE NEW Mr. DIKO');
                      const isYellowRow = isSeptember && (r.no <= 5 || isAllUnit);

                      let rowBg = 'bg-black/15 hover:bg-[#c5a059]/15';
                      if (isYellowRow) {
                        rowBg = 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 font-semibold';
                      }

                      return (
                        <tr
                          key={`m-${r.originalUnit?.id || r.no}-${r.unitName}-${idx}`}
                          onClick={() => r.originalUnit && onSelectUnit?.(r.originalUnit)}
                          className={`transition-colors cursor-pointer ${rowBg} ${!isYellowRow ? renderRowHighlightClass(r.highlightType) : ''}`}
                        >
                          <td className={`py-2.5 px-2 text-center border-r border-white/5 font-semibold ${isYellowRow ? 'text-amber-300 font-bold' : 'text-gray-400'}`}>
                            {r.no}
                          </td>
                          <td className={`py-2.5 px-3 border-r border-white/5 font-bold font-sans ${isRedName ? 'bg-red-600/90 text-white' : (isYellowRow ? 'text-amber-200' : 'text-gray-100')}`}>
                            {r.unitName}
                          </td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.mechanic}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bodyWork}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bodyPaint}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.interior}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.chrome}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bubut}</td>
                          {!isSeptember && <td className="py-2.5 px-2 text-center border-r border-white/5">{r.qa}</td>}
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.allDivisi}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5 font-bold text-white bg-black/40">
                            {r.totalTarget}
                          </td>
                          <td className={`py-2.5 px-2 text-center font-extrabold ${isRedActual ? 'bg-red-600 text-white font-black' : (isYellowRow ? 'text-emerald-300 bg-emerald-950/20' : 'text-sky-400 bg-sky-950/20')}`}>
                            {r.totalActual}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  {/* Summary Row Unit Margin */}
                  <tfoot className="border-t-2 border-[#c5a059] font-mono text-[11px] font-bold bg-black/70 backdrop-blur-sm">
                    <tr>
                      <td colSpan={isSeptember ? 9 : 10} className="py-3 px-4 bg-[#9ca3af]/90 text-slate-950 text-center uppercase tracking-wider font-sans font-black border-r border-black/20">
                        TOTAL TARGET BULAN {monthLabel} MARGIN
                      </td>
                      <td className="py-3 px-2 text-center bg-black/90 text-[#00ff00] font-black border-r border-white/20">
                        {effectiveMarginTarget}
                      </td>
                      <td className="py-3 px-2 text-center bg-[#00e600] text-black font-black">
                        {effectiveMarginActual}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* SECTION B: UNIT NON MARGIN TABLE */}
            {nonMarginDataRows.length > 0 && (
              <div className="bg-black/30 backdrop-blur-[2px] border border-white/20 rounded-2xl overflow-hidden shadow-2xl space-y-0 relative">
                <div className="bg-zinc-800/85 backdrop-blur-sm text-white py-2.5 px-6 font-black text-sm uppercase tracking-wider flex items-center justify-between border-b border-white/10">
                  <span className="flex items-center gap-2 text-amber-400">
                    <Clock className="w-4 h-4" /> {isSeptember ? 'REPORT PROJECT DAILY SEPTEMBER - UNIT NON MARGIN' : 'TABLE 2: UNIT NON MARGIN'} ({nonMarginDataRows.length} UNIT)
                  </span>
                  <span className="font-mono text-xs">TARGET: {effectiveNonMarginTarget} | ACTUAL: {effectiveNonMarginActual}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-black/55 backdrop-blur-sm text-gray-200 border-b border-white/20 font-mono text-[11px]">
                        <th rowSpan={2} className="py-2 px-2 border-r border-white/10 text-center w-10">No.</th>
                        <th rowSpan={2} className="py-2 px-3 border-r border-white/10 text-left min-w-[210px] text-amber-400">Nama unit</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">MECHANIC</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BODY WORK</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BODY PAINT</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">INTERIOR</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">CHROME</th>
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">BUBUT</th>
                        {!isSeptember && <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">QA</th>}
                        <th className="py-1.5 px-2 border-r border-white/10 text-center text-amber-400 font-bold">ALL DIVISI</th>
                        <th rowSpan={2} className="py-2 px-2 border-r border-white/10 text-center bg-black/80 text-white font-black">TOTAL</th>
                        <th rowSpan={2} className="py-2 px-2 text-center bg-[#22c55e] text-black font-black">TOTAL JAM KERJA ACTUAL</th>
                      </tr>
                      <tr className="bg-[#facc15] text-black font-black text-[10px] uppercase border-b border-black/30">
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                        <th className="py-1 px-2 border-r border-black/20 text-center">BUBUT</th>
                        {!isSeptember && <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>}
                        <th className="py-1 px-2 border-r border-black/20 text-center">ACTUAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px] bg-transparent">
                      {filteredNonMargin.map((r, idx) => (
                        <tr
                          key={`nm-${r.originalUnit?.id || r.no}-${r.unitName}-${idx}`}
                          onClick={() => r.originalUnit && onSelectUnit?.(r.originalUnit)}
                          className={`transition-colors cursor-pointer bg-black/15 hover:bg-amber-500/15 ${renderRowHighlightClass(r.highlightType)}`}
                        >
                          <td className="py-2.5 px-2 text-center text-gray-400 border-r border-white/5 font-semibold">
                            {r.no}
                          </td>
                          <td className="py-2.5 px-3 border-r border-white/5 font-bold font-sans">
                            {r.unitName}
                          </td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.mechanic}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bodyWork}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bodyPaint}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.interior}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.chrome}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.bubut}</td>
                          {!isSeptember && <td className="py-2.5 px-2 text-center border-r border-white/5">{r.qa}</td>}
                          <td className="py-2.5 px-2 text-center border-r border-white/5">{r.allDivisi}</td>
                          <td className="py-2.5 px-2 text-center border-r border-white/5 font-bold text-white bg-black/40">
                            {r.totalTarget}
                          </td>
                          <td className="py-2.5 px-2 text-center font-extrabold text-sky-400 bg-sky-950/20">
                            {r.totalActual}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Summary Row Unit Non Margin & Grand Total */}
                    <tfoot className="border-t-2 border-amber-500 font-mono text-[11px] font-bold bg-black/70 backdrop-blur-sm">
                      <tr>
                        <td colSpan={isSeptember ? 9 : 10} className="py-3 px-4 bg-[#9ca3af]/90 text-slate-950 text-center uppercase tracking-wider font-sans font-black border-r border-black/20">
                          TOTAL TARGET BULAN {monthLabel} NON MARGIN
                        </td>
                        <td className="py-3 px-2 text-center bg-black/90 text-[#00ff00] font-black border-r border-white/20">
                          {effectiveNonMarginTarget}
                        </td>
                        <td className="py-3 px-2 text-center bg-[#00e600] text-black font-black">
                          {effectiveNonMarginActual}
                        </td>
                      </tr>

                      {/* GRAND TOTAL COMBINED ROW */}
                      <tr className="bg-[#c5a059] text-black text-[12px] font-black">
                        <td colSpan={isSeptember ? 9 : 10} className="py-3 px-4 text-center uppercase tracking-widest font-sans border-r border-black/20">
                          TOTAL JAM KERJA MARGIN DAN NON MARGIN:
                        </td>
                        <td className="py-3 px-2 text-center border-r border-black/20 font-mono text-black">
                          {grandTotalTarget}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-black text-sm underline">
                          {grandTotalActual}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Area: Production Real & Target Boxes */}
          <div className="space-y-6">
            {/* Target Month Box */}
            <div className="bg-black/30 backdrop-blur-sm border border-[#c5a059]/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-[#c5a059]/90 text-black px-4 py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>TARGET {monthLabel}</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-sans font-semibold">NON MARGIN:</span>
                  <span className="font-bold text-amber-400">{effectiveNonMarginTarget}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-white/10">
                  <span className="text-gray-300 font-sans font-semibold">MARGIN:</span>
                  <span className="font-bold text-emerald-400">{effectiveMarginTarget}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#c5a059]/15 rounded-xl border border-[#c5a059]/40 text-sm">
                  <span className="text-white font-sans font-extrabold">TOTAL TARGET:</span>
                  <span className="font-black text-[#c5a059]">{grandTotalTarget}</span>
                </div>
              </div>
            </div>

            {/* Persentase Box */}
            <div className="bg-black/30 backdrop-blur-sm border border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-emerald-600/90 text-white px-4 py-2.5 font-black text-xs uppercase tracking-wider flex items-center justify-between">
                <span>PERSENTASE CAPAIAN</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="p-4 space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-sans">NON MARGIN</span>
                    <span className="font-bold text-amber-400">{nonMarginPct}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                    <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${Math.min(100, nonMarginPct)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-sans">MARGIN</span>
                    <span className="font-bold text-emerald-400">{marginPct}%</span>
                  </div>
                  <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/10">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${Math.min(100, marginPct)}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white font-sans font-bold">CAPAIAN OVERALL:</span>
                  <span className="font-black text-[#c5a059] text-sm">
                    {Math.round((timeToDecimalHours(grandTotalActual) / grandTargetDec) * 100 * 100) / 100}%
                  </span>
                </div>
              </div>
            </div>

            {/* Style Mode Switcher & Section Header */}
            <div className="flex items-center justify-between px-1 pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#c5a059] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  REKAP REAL PRODUKSI HARIAN
                </span>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  1 - {daysInMonth} {monthLabel}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTableRollMode(tableRollMode === 'ROLL' ? 'EXPAND' : 'ROLL')}
                  title={tableRollMode === 'ROLL' ? 'Tampilkan seluruh baris tanpa scroll' : 'Aktifkan roll scrollbar'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    tableRollMode === 'ROLL'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30 shadow-sm'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  <span>{tableRollMode === 'ROLL' ? 'Roll Khusus ↕' : 'Buka Penuh'}</span>
                </button>
                <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTableStyleMode('ELEGANT')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableStyleMode === 'ELEGANT'
                        ? 'bg-[#c5a059] text-black shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ✨ Elegan
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableStyleMode('SHEET')}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      tableStyleMode === 'SHEET'
                        ? 'bg-[#c5a059] text-black shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    📋 Excel
                  </button>
                </div>
              </div>
            </div>

            {tableStyleMode === 'ELEGANT' ? (
              <>
                {/* ELEGANT VIEW: Perhitungan Jam Kerja Real Produksi Table */}
                <div className="bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-black px-4 py-3 font-black text-xs tracking-wider uppercase flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-black" />
                      <span>PERHITUNGAN JAM KERJA REAL PRODUKSI</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-black/25 text-black px-2 py-0.5 rounded font-sans font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Auto Sync GSheet
                      </span>
                      <span className="text-[10px] bg-black/20 text-black px-2 py-0.5 rounded font-mono font-bold">
                        1 - {daysInMonth} {monthLabel}
                      </span>
                      {tableRollMode === 'ROLL' && (
                        <span className="text-[9px] bg-black/30 text-black px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                          <ArrowUpDown className="w-2.5 h-2.5" /> Roll
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`overflow-x-auto overflow-y-auto ${tableRollMode === 'ROLL' ? 'max-h-[380px] xl:max-h-[420px]' : ''} custom-table-roll relative`}>
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 z-20 bg-[#0c1017] text-gray-300 text-[10px] uppercase font-mono tracking-wider border-b border-white/10 shadow-sm">
                        <tr>
                          <th className="py-2.5 px-3 text-left font-bold bg-[#0c1017]">TANGGAL</th>
                          <th className="py-2.5 px-3 text-right font-bold bg-[#0c1017]">JAM KERJA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-xs">
                        {perhitunganRealRows.map((d, i) => {
                          const isZero = d.jamKerja === '0:00' || d.jamKerja === '00:00';
                          return (
                            <tr key={i} className="hover:bg-white/[0.04] transition-colors group border-b border-white/5">
                              <td className="py-2 px-3 text-gray-200 font-sans text-xs font-medium">
                                {d.tanggal}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <span className={`font-mono font-bold px-2.5 py-0.5 rounded-md inline-block ${
                                  !isZero
                                    ? 'text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20'
                                    : 'text-gray-500 bg-white/[0.02]'
                                }`}>
                                  {d.jamKerja}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-20 bg-[#0c1017] border-t-2 border-[#c5a059] font-mono font-bold text-xs shadow-[0_-4px_12px_rgba(0,0,0,0.7)]">
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-white uppercase font-extrabold text-xs tracking-wide bg-[#0c1017]">
                            TOTAL:
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-sm text-[#c5a059] drop-shadow-[0_0_8px_rgba(197,160,89,0.3)] bg-[#0c1017]">
                            {formatTimeString(dailyProductionTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* ELEGANT VIEW: Hasil Kerja Per Hari Unit Margin & Non Margin Table */}
                <div className="bg-[#0c1017]/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 overflow-hidden shadow-2xl ring-1 ring-white/5">
                  <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-black px-4 py-3 font-black text-xs tracking-wider uppercase flex items-center justify-between shadow-md">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-black" />
                      <span>HASIL KERJA PER HARI (MARGIN &amp; NON MARGIN)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-black/25 text-black px-2 py-0.5 rounded font-sans font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Auto Sync GSheet
                      </span>
                      <span className="text-[10px] bg-black/20 text-black px-2 py-0.5 rounded font-mono font-bold">
                        1 - {daysInMonth} {monthLabel}
                      </span>
                      {tableRollMode === 'ROLL' && (
                        <span className="text-[9px] bg-black/30 text-black px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-0.5">
                          <ArrowUpDown className="w-2.5 h-2.5" /> Roll
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`overflow-x-auto overflow-y-auto ${tableRollMode === 'ROLL' ? 'max-h-[460px] xl:max-h-[500px]' : ''} custom-table-roll relative`}>
                    <table className="w-full text-xs border-collapse">
                      <thead className="sticky top-0 z-20 bg-[#0c1017] text-gray-300 font-bold text-[10px] tracking-wider uppercase border-b border-white/10 shadow-sm">
                        <tr>
                          <th className="py-2.5 px-3 text-center border-r border-white/10 bg-[#0c1017]">TANGGAL</th>
                          <th className="py-2.5 px-2 text-center border-r border-white/10 bg-[#0c1017]">KATEGORI</th>
                          <th className="py-2.5 px-3 text-right border-r border-white/10 bg-[#0c1017]">JAM KERJA</th>
                          <th className="py-2.5 px-3 text-right bg-[#0c1017]">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {dailyMarginNonMarginRows.map((d, i) => {
                          const isZero = d.totalJam === '0:00' || d.totalJam === '00:00';
                          return (
                            <React.Fragment key={i}>
                              <tr className="border-t border-white/10">
                                <td
                                  rowSpan={2}
                                  className="py-2 px-3 text-center font-sans font-semibold text-gray-100 border-r border-white/10 bg-black/40 align-middle whitespace-nowrap text-xs"
                                >
                                  {d.tanggal}
                                </td>
                                <td className="py-1 px-2 text-center bg-emerald-950/30 border-r border-white/10">
                                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-black tracking-wider inline-block uppercase">
                                    MARGIN
                                  </span>
                                </td>
                                <td className={`py-1 px-3 text-right font-mono font-bold bg-emerald-950/20 border-r border-white/10 text-xs ${isZero ? 'text-gray-500' : 'text-emerald-300'}`}>
                                  {d.marginJam}
                                </td>
                                <td
                                  rowSpan={2}
                                  className={`py-2 px-3 text-right font-mono font-black align-middle text-xs ${isZero ? 'text-gray-500 bg-black/40' : 'text-amber-300 bg-black/50 drop-shadow-sm'}`}
                                >
                                  {d.totalJam}
                                </td>
                              </tr>
                              <tr className="border-b border-white/10">
                                <td className="py-1 px-2 text-center bg-rose-950/30 border-r border-white/10">
                                  <span className="bg-rose-500/15 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded text-[10px] font-black tracking-wider inline-block uppercase">
                                    NON MARGIN
                                  </span>
                                </td>
                                <td className={`py-1 px-3 text-right font-mono font-bold bg-rose-950/20 border-r border-white/10 text-xs ${isZero ? 'text-gray-500' : 'text-rose-300'}`}>
                                  {d.nonMarginJam}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-20 bg-[#0c1017] border-t-2 border-white/10 font-mono font-bold text-xs shadow-[0_-4px_12px_rgba(0,0,0,0.7)]">
                        <tr className="bg-emerald-950 text-emerald-300 border-b border-white/10">
                          <td colSpan={2} className="py-1.5 px-3 font-sans uppercase font-bold border-r border-white/10 text-emerald-200 text-xs bg-emerald-950">
                            TOTAL MARGIN:
                          </td>
                          <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-black text-xs text-emerald-300 bg-emerald-950">
                            {formatTimeString(dailyMarginTotal)}
                          </td>
                        </tr>
                        <tr className="bg-rose-950 text-rose-300 border-b border-white/10">
                          <td colSpan={2} className="py-1.5 px-3 font-sans uppercase font-bold border-r border-white/10 text-rose-200 text-xs bg-rose-950">
                            TOTAL NON MARGIN:
                          </td>
                          <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-black text-xs text-rose-300 bg-rose-950">
                            {formatTimeString(dailyNonMarginTotal)}
                          </td>
                        </tr>
                        <tr className="bg-[#0c1017] text-[#f59e0b] border-t-2 border-[#f59e0b]">
                          <td colSpan={2} className="py-2.5 px-3 font-sans uppercase font-black border-r border-white/10 text-white text-xs tracking-wider bg-[#0c1017]">
                            TOTAL AKUMULASI:
                          </td>
                          <td colSpan={2} className="py-2.5 px-3 text-right font-black text-sm text-[#f59e0b] drop-shadow-[0_0_6px_rgba(245,158,11,0.3)] bg-[#0c1017]">
                            {formatTimeString(dailyProductionTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* EXCEL SHEET VIEW: Perhitungan Jam Kerja Real Produksi Table */}
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl border-2 border-black">
                  <div className="bg-[#f97316] text-black px-4 py-2.5 font-black text-center text-xs sm:text-sm tracking-wider border-b-2 border-black uppercase leading-tight flex items-center justify-between">
                    <span>PERHITUNGAN JAM KERJA REAL PRODUKSI</span>
                    <div className="flex items-center gap-1.5">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-black text-white px-2 py-0.5 rounded font-sans font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Auto Sync GSheet
                      </span>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono">1 - {daysInMonth} {monthLabel}</span>
                    </div>
                  </div>
                  <div className={`overflow-x-auto overflow-y-auto ${tableRollMode === 'ROLL' ? 'max-h-[380px] xl:max-h-[420px]' : ''} custom-table-roll relative`}>
                    <table className="w-full text-xs text-center border-collapse">
                      <thead className="sticky top-0 z-20 bg-black text-white font-mono font-bold text-xs uppercase border-b-2 border-black shadow-sm">
                        <tr>
                          <th className="py-2 px-3 text-center border-r border-gray-700 bg-black text-white">TANGGAL</th>
                          <th className="py-2 px-3 text-center bg-black text-white">JAM KERJA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-mono font-bold text-xs text-black">
                        {perhitunganRealRows.map((d, i) => (
                          <tr key={i} className="hover:bg-amber-50/50 transition-colors border-b border-black">
                            <td className="py-2 px-3 border-r border-black font-sans text-xs font-semibold text-black">
                              {d.tanggal}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-black">
                              {d.jamKerja}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-20 bg-black text-[#f59e0b] font-mono font-black text-xs border-t-2 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-white text-center border-r border-gray-700 uppercase font-black bg-black">
                            TOTAL:
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-[#f59e0b] bg-black">
                            {formatTimeString(dailyProductionTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* EXCEL SHEET VIEW: Hasil Kerja Per Hari Margin & Non Margin Table */}
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl border-2 border-black">
                  <div className="bg-[#f97316] text-black px-4 py-2.5 font-black text-center text-xs sm:text-sm tracking-wider border-b-2 border-black uppercase leading-tight flex items-center justify-between">
                    <span>HASIL KERJA PER HARI UNIT MARGIN &amp; NON MARGIN</span>
                    <div className="flex items-center gap-1.5">
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] bg-black text-white px-2 py-0.5 rounded font-sans font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Auto Sync GSheet
                      </span>
                      <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono">1 - {daysInMonth} {monthLabel}</span>
                    </div>
                  </div>
                  <div className={`overflow-x-auto overflow-y-auto ${tableRollMode === 'ROLL' ? 'max-h-[460px] xl:max-h-[500px]' : ''} custom-table-roll relative`}>
                    <table className="w-full text-xs text-center border-collapse">
                      <thead className="sticky top-0 z-20 bg-black text-white font-black text-[10px] sm:text-xs uppercase border-b-2 border-black shadow-sm">
                        <tr>
                          <th className="py-2.5 px-2 border-r border-gray-700 bg-black text-white">TANGGAL</th>
                          <th className="py-2.5 px-2 border-r border-gray-700 bg-black text-white">KATEGORI</th>
                          <th className="py-2.5 px-2 border-r border-gray-700 bg-black text-white">JAM KERJA</th>
                          <th className="py-2.5 px-2 bg-black text-white">TOTAL JAM KERJA</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {dailyMarginNonMarginRows.map((d, i) => (
                          <React.Fragment key={i}>
                            <tr className="border-t border-black">
                              <td
                                rowSpan={2}
                                className="py-2 px-2 text-center font-sans font-bold text-black border-r border-black bg-white align-middle whitespace-nowrap text-xs"
                              >
                                {d.tanggal}
                              </td>
                              <td className="py-1.5 px-2 text-center font-black text-[#22c55e] bg-[#4a0e0e] border-r border-black tracking-wider text-[11px]">
                                MARGIN
                              </td>
                              <td className="py-1.5 px-2 text-center font-mono font-bold text-[#22c55e] bg-[#4a0e0e] border-r border-black text-xs">
                                {d.marginJam}
                              </td>
                              <td
                                rowSpan={2}
                                className="py-2 px-2 text-center font-mono font-black text-black bg-white align-middle text-xs"
                              >
                                {d.totalJam}
                              </td>
                            </tr>
                            <tr className="border-b border-black">
                              <td className="py-1.5 px-2 text-center font-black text-[#dc2626] bg-white border-r border-black tracking-wider text-[11px]">
                                NON MARGIN
                              </td>
                              <td className="py-1.5 px-2 text-center font-mono font-bold text-[#dc2626] bg-white border-r border-black text-xs">
                                {d.nonMarginJam}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 z-20 border-t-2 border-black font-mono font-bold text-xs shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
                        <tr className="bg-[#4a0e0e] text-[#22c55e] border-b border-black">
                          <td colSpan={2} className="py-2 px-2 text-center font-sans uppercase font-extrabold border-r border-black text-white text-xs bg-[#4a0e0e]">
                            TOTAL MARGIN:
                          </td>
                          <td colSpan={2} className="py-2 px-2 text-center font-black text-sm bg-[#4a0e0e]">
                            {formatTimeString(dailyMarginTotal)}
                          </td>
                        </tr>
                        <tr className="bg-white text-[#dc2626] border-b-2 border-black">
                          <td colSpan={2} className="py-2 px-2 text-center font-sans uppercase font-extrabold border-r border-black text-black text-xs bg-white">
                            TOTAL NON MARGIN:
                          </td>
                          <td colSpan={2} className="py-2 px-2 text-center font-black text-sm bg-white">
                            {formatTimeString(dailyNonMarginTotal)}
                          </td>
                        </tr>
                        <tr className="bg-black text-[#f59e0b]">
                          <td colSpan={2} className="py-2.5 px-2 text-center font-sans uppercase font-black border-r border-gray-700 text-white text-xs bg-black">
                            TOTAL AKUMULASI:
                          </td>
                          <td colSpan={2} className="py-2.5 px-2 text-center font-black text-sm text-[#f59e0b] bg-black">
                            {formatTimeString(dailyProductionTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: FULL DAILY PRODUCTION SCHEDULE */}
      {subTab === 'DAILY_PROD' && (
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c5a059]" />
                Rekapitulasi Jam Kerja Real Produksi {monthLabel} 2026 (1 - 31 {monthLabel})
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Data terintegrasi jam kerja harian bengkel terpisah antara Unit Margin dan Non-Margin.
              </p>
            </div>
            <div className="bg-[#c5a059]/10 border border-[#c5a059]/40 px-4 py-2 rounded-xl text-right">
              <span className="text-[10px] text-gray-300 block font-mono uppercase">TOTAL PRODUKSI BULAN {monthLabel}</span>
              <span className="text-xl font-black text-[#c5a059] font-mono">{formatTimeString(dailyProductionTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dailyProductionRows.map((d, idx) => (
              <div key={idx} className="bg-black/40 backdrop-blur-sm border border-white/10 p-4 rounded-xl space-y-2 hover:border-[#c5a059]/40 transition-colors">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white font-sans">{d.tanggal}</span>
                  <span className="text-sm font-extrabold text-[#c5a059] font-mono">{d.jamKerja} Jam</span>
                </div>
                <div className="space-y-1 text-xs font-mono pt-1">
                  <div className="flex items-center justify-between text-emerald-400 bg-emerald-950/20 p-1.5 rounded">
                    <span>UNIT MARGIN:</span>
                    <span className="font-bold">{d.marginJam}</span>
                  </div>
                  <div className="flex items-center justify-between text-red-400 bg-red-950/20 p-1.5 rounded">
                    <span>NON MARGIN:</span>
                    <span className="font-bold">{d.nonMarginJam}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CHARTS & STATS */}
      {subTab === 'CHARTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#c5a059]" />
              Visualisasi Top Unit Margin (Jam Kerja Actual)
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginDataRows.map(r => ({ ...r, decActual: timeToDecimalHours(r.totalActual) })).slice(0, 15)}>
                  <XAxis dataKey="unitName" stroke="#94a3b8" fontSize={9} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', borderColor: '#c5a059', borderRadius: '12px' }}
                    itemStyle={{ color: '#c5a059' }}
                    formatter={(val: any) => [`${val} jam`, 'Actual']}
                  />
                  <Bar dataKey="decActual" fill="#c5a059" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              Ringkasan Kinerja Target Project {monthLabel} 2026
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                <span>Total Unit Margin & Non Margin:</span>
                <strong className="text-white font-mono">{units.length} Unit Project</strong>
              </div>
              <div className="p-3 bg-black/40 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">Pencapaian Target Unit Margin:</span>
                <strong className="text-emerald-400 font-mono">{marginPct}% ({formatTimeString(sumMarginActual)} / {formatTimeString(sumMarginTarget)})</strong>
              </div>
              <div className="p-3 bg-black/40 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <span className="text-amber-400 font-semibold">Pencapaian Target Non Margin:</span>
                <strong className="text-amber-400 font-mono">{nonMarginPct}% ({formatTimeString(sumNonMarginActual)} / {formatTimeString(sumNonMarginTarget)})</strong>
              </div>
              <div className="p-3 bg-black/40 border border-[#c5a059]/40 rounded-xl flex items-center justify-between bg-[#c5a059]/5">
                <span className="text-[#c5a059] font-bold">Grand Total Jam Kerja Real Bengkel:</span>
                <strong className="text-[#c5a059] font-black text-base font-mono">{formatTimeString(grandTotalActual)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
