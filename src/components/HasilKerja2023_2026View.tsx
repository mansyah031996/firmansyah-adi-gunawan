import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  Layers,
  Car,
  Wrench,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ArrowDownCircle,
  ExternalLink,
  Flame,
  Eye,
  SlidersHorizontal,
  Compass,
  Grid,
  Database,
  Check,
} from 'lucide-react';
import { ProjectUnit } from '../types';
import { sumTimeStrings, formatTimeString, calculateDurationFromTimes } from '../utils/timeUtils';
import { safeLocalStorageSet } from '../utils/storageUtils';
import {
  MULTI_YEAR_SHEETS,
  queryMultiYearSheets,
  MultiYearSheetConfig,
} from '../utils/multiYearSheetsSync';
import { INITIAL_HASIL_KERJA_2023_2026, HasilKerjaMultiYearRecord } from '../data/hasilKerja2023_2026Data';
import { DAFTAR_UNIT_RESMI, DAFTAR_UNIT_TERKELOMPOK } from '../data/daftarUnitResmi';
import { UnitDropdownSelector } from './UnitDropdownSelector';

interface HasilKerja2023_2026ViewProps {
  units?: ProjectUnit[];
  onSelectUnit?: (unit: ProjectUnit) => void;
  spreadsheetUrl?: string;
}

const STORAGE_KEY_2023_2026 = 'sm_hasil_kerja_2023_2026_records_v200_synced_master';

export const HasilKerja2023_2026View: React.FC<HasilKerja2023_2026ViewProps> = ({
  units = [],
  onSelectUnit,
}) => {
  // Clear stale old version keys from localStorage once on load
  useEffect(() => {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('sm_hasil_kerja_2023_2026_records_') && k !== STORAGE_KEY_2023_2026) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      // ignore storage access errors
    }
  }, []);

  // State Data Records
  const [records, setRecords] = useState<HasilKerjaMultiYearRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_2023_2026);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_HASIL_KERJA_2023_2026.length) return parsed;
      }
    } catch (e) {
      console.error('Failed to load 2023-2026 records from localStorage:', e);
    }
    return INITIAL_HASIL_KERJA_2023_2026;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{
    scanned: number;
    total: number;
    currentMonth: string;
    foundCount: number;
  } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Primary Query & Filter States
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [unitInputMethod, setUnitInputMethod] = useState<'dropdown' | 'search' | 'manual'>('dropdown');
  const [panelFilter, setPanelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [divisiFilter, setDivisiFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination States for High Performance
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [unitFilter, panelFilter, searchQuery, divisiFilter, yearFilter, monthFilter, statusFilter, pageSize]);

  // Background Shadow & Blueprint Mode State
  const [shadowTheme, setShadowTheme] = useState<'blueprint' | 'stacked' | 'golden' | 'grid'>('blueprint');
  const [showBackgroundShadow, setShowBackgroundShadow] = useState<boolean>(true);

  // Distinct known units compiled from official list + props + preloaded records
  const distinctUnits = useMemo(() => {
    const set = new Set<string>();
    DAFTAR_UNIT_RESMI.forEach((u) => set.add(u));
    units.forEach((u) => {
      if (u.unitName) set.add(u.unitName.trim());
    });
    records.forEach((r) => {
      if (r.unit && r.unit.trim()) set.add(r.unit.trim());
    });
    return Array.from(set).sort();
  }, [units, records]);

  // Distinct panels from existing records
  const distinctPanels = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.panelPart && r.panelPart.trim() && r.panelPart !== '-') {
        set.add(r.panelPart.trim().toUpperCase());
      }
    });
    ['KISI - KISI', 'DASHBOARD', 'KAP MESIN', 'FENDER', 'PINTU', 'CHASSIS', 'ENGINE'].forEach((p) => set.add(p));
    return Array.from(set).sort();
  }, [records]);

  /**
   * Main Multi-Year Pulling function: queries the 4 external spreadsheets
   * across their monthly tabs based on selected Unit, Panel, Divisi, and Year.
   */
  const handleFetchMultiYearData = useCallback(
    async (
      overrideUnit?: string,
      overridePanel?: string,
      overrideDivisi?: string,
      overrideYear?: string
    ) => {
      const u = overrideUnit !== undefined ? overrideUnit : unitFilter;
      const p = overridePanel !== undefined ? overridePanel : panelFilter;
      const d = overrideDivisi !== undefined ? overrideDivisi : divisiFilter;
      const y = overrideYear !== undefined ? overrideYear : yearFilter;

      setIsLoading(true);
      setSyncProgress({ scanned: 0, total: 45, currentMonth: 'Mempersiapkan penarikan data...', foundCount: 0 });

      try {
        const fetchedRecords = await queryMultiYearSheets({
          unit: u,
          panel: p,
          divisi: d,
          year: y,
          onProgress: (prog) => {
            setSyncProgress(prog);
          },
        });

        if (fetchedRecords && fetchedRecords.length > 0) {
          setRecords((prev) => {
            const baseRecords = prev.length >= INITIAL_HASIL_KERJA_2023_2026.length ? prev : INITIAL_HASIL_KERJA_2023_2026;
            const map = new Map<string, HasilKerjaMultiYearRecord>();

            baseRecords.forEach((r) => {
              const key = `${r.tahun}_${r.tanggal}_${r.unit}_${r.nama}_${r.jobdesc}`;
              map.set(key, r);
            });

            fetchedRecords.forEach((r) => {
              const key = `${r.tahun}_${r.tanggal}_${r.unit}_${r.nama}_${r.jobdesc}`;
              map.set(key, r);
            });

            const merged = Array.from(map.values());
            safeLocalStorageSet(STORAGE_KEY_2023_2026, JSON.stringify(merged));
            return merged;
          });
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
      } catch (err) {
        console.error('Error fetching multi-year sheet data:', err);
      } finally {
        setIsLoading(false);
        setTimeout(() => setSyncProgress(null), 3000);
      }
    },
    [unitFilter, panelFilter, divisiFilter, yearFilter]
  );

  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);

  // Auto-sync live data from Google Sheets on initial load/mount, check URL param, and periodic background sync
  useEffect(() => {
    let initialUnit = unitFilter;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const uParam = params.get('unit') || params.get('u');
      if (uParam) {
        initialUnit = uParam;
        setUnitFilter(uParam);
      }
    }
    handleFetchMultiYearData(initialUnit || undefined);

    // Window focus listener for auto-refreshing data when user returns to the tab
    const handleWindowFocus = () => {
      if (autoSyncEnabled) {
        handleFetchMultiYearData();
      }
    };
    window.addEventListener('focus', handleWindowFocus);

    // Periodic auto-sync interval (every 2 minutes)
    const interval = setInterval(() => {
      if (autoSyncEnabled) {
        handleFetchMultiYearData();
      }
    }, 120000);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(interval);
    };
  }, [autoSyncEnabled, handleFetchMultiYearData]);

  // Check if filter is active
  const isSpillActive = Boolean(
    unitFilter.trim() ||
    panelFilter.trim() ||
    searchQuery.trim() ||
    divisiFilter !== 'ALL' ||
    yearFilter !== 'ALL' ||
    monthFilter !== 'ALL' ||
    statusFilter !== 'ALL'
  );

  // Filtered "Spilled" Records
  const spilledRecords = useMemo(() => {
    return records.filter((r) => {
      // 1. Unit Filter (Flexible case-insensitive & model matching)
      const u = unitFilter.trim().toLowerCase();
      if (u && u !== 'all unit' && u !== 'semua unit' && u !== 'all') {
        const normU = u.replace(/[^a-z0-9]/g, '');
        const normR = r.unit.toLowerCase().replace(/[^a-z0-9]/g, '');

        let matchUnit = r.unit.toLowerCase().includes(u) || normR.includes(normU) || normU.includes(normR);

        if (!matchUnit) {
          // Model number match check e.g. "190", "280", "300", "500", "120", "911"
          const numInU = u.match(/\b\d{2,4}\b/);
          const numInR = r.unit.match(/\b\d{2,4}\b/);

          const ownerMatchInU = u.match(/\b(anderson|james|ichsan|handy|diko|indra|didi|santoso|nyoman|adrian|musa|maliq|joko|nina|andrew|marthin|stanley|eric|pram|richard|ilham|abong)\b/i);
          const ownerName = ownerMatchInU ? ownerMatchInU[1].toLowerCase() : null;

          if (numInU && numInR && numInU[0] === numInR[0]) {
            if (!ownerName || r.unit.toLowerCase().includes(ownerName)) {
              matchUnit = true;
            }
          }

          if (!matchUnit) {
            const distinctKwInU = u.match(/\b(batman|pullman|pagoda|ponton|grosser|kebo|xk120|jaguar|porsche|ferrari|chevrolet|beetle|peugeot|harley|n360)\b/i);
            if (distinctKwInU && r.unit.toLowerCase().includes(distinctKwInU[1].toLowerCase())) {
              matchUnit = true;
            }
          }
        }

        if (!matchUnit) {
          return false;
        }
      }

      // 2. Panel Filter (Flexible match on panelPart, jobdesc, or keterangan)
      if (panelFilter.trim()) {
        const p = panelFilter.trim().toLowerCase();
        const matchPanel = r.panelPart.toLowerCase().includes(p);
        const matchJob = r.jobdesc.toLowerCase().includes(p);
        const matchKet = (r.keterangan || '').toLowerCase().includes(p);
        if (!matchPanel && !matchJob && !matchKet) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchUnit = r.unit.toLowerCase().includes(q);
        const matchPanel = r.panelPart.toLowerCase().includes(q);
        const matchJob = r.jobdesc.toLowerCase().includes(q);
        const matchNama = r.nama.toLowerCase().includes(q);
        const matchDivisi = r.divisi.toLowerCase().includes(q);
        const matchTgl = r.tanggal.toLowerCase().includes(q);
        const matchKet = r.keterangan.toLowerCase().includes(q);

        if (!matchUnit && !matchPanel && !matchJob && !matchNama && !matchDivisi && !matchTgl && !matchKet) {
          return false;
        }
      }

      // 4. Divisi Filter
      if (divisiFilter !== 'ALL') {
        const df = divisiFilter.toUpperCase();
        if (!r.divisi.toUpperCase().includes(df)) {
          return false;
        }
      }

      // 5. Year Filter
      if (yearFilter !== 'ALL') {
        if (!r.tanggal.includes(yearFilter) && r.tahun !== yearFilter) {
          return false;
        }
      }

      // 6. Month Filter
      if (monthFilter !== 'ALL') {
        if (!r.tanggal.toLowerCase().includes(monthFilter.toLowerCase())) {
          return false;
        }
      }

      // 7. Status Filter
      if (statusFilter !== 'ALL') {
        const sf = statusFilter.toUpperCase();
        if (sf === 'DONE' && !r.status.toUpperCase().includes('DONE')) return false;
        if (sf === 'PROGRESS' && !r.status.toUpperCase().includes('PROG')) return false;
        if (sf === 'HOLD' && !r.status.toUpperCase().includes('HOLD') && !r.status.toUpperCase().includes('PENDING')) return false;
      }

      return true;
    });
  }, [records, isSpillActive, unitFilter, panelFilter, searchQuery, divisiFilter, yearFilter, monthFilter, statusFilter]);

  // High-performance single-pass metrics calculation for ultra-fast rendering
  const { totalSpilledHours, yearBreakdown, uniqueTechnicians, spilledStatusCounts } = useMemo(() => {
    let totalMins = 0;
    const yearMins: Record<string, { count: number; minutes: number }> = {
      '2026': { count: 0, minutes: 0 },
      '2025': { count: 0, minutes: 0 },
      '2024': { count: 0, minutes: 0 },
      '2023': { count: 0, minutes: 0 },
    };
    const techSet = new Set<string>();
    let done = 0;
    let progress = 0;
    let hold = 0;

    for (let i = 0; i < spilledRecords.length; i++) {
      const r = spilledRecords[i];
      // Fast duration parse
      const durStr = calculateDurationFromTimes(r.start, r.finish, r.breakTime, r.totalJamKerja);
      const parts = durStr.split(':');
      const mins = (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);

      totalMins += mins;

      let yr = r.tahun;
      if (!yr || !['2023', '2024', '2025', '2026'].includes(yr)) {
        const m = r.tanggal ? r.tanggal.match(/\b(202[3-6])\b/) : null;
        if (m) {
          yr = m[1];
        } else if (r.tanggal && (r.tanggal.includes('/23') || r.tanggal.includes('-23') || r.tanggal.toUpperCase().includes('2023'))) {
          yr = '2023';
        } else if (r.tanggal && (r.tanggal.includes('/24') || r.tanggal.includes('-24') || r.tanggal.toUpperCase().includes('2024'))) {
          yr = '2024';
        } else if (r.tanggal && (r.tanggal.includes('/25') || r.tanggal.includes('-25') || r.tanggal.toUpperCase().includes('2025'))) {
          yr = '2025';
        } else if (r.tanggal && (r.tanggal.includes('/26') || r.tanggal.includes('-26') || r.tanggal.toUpperCase().includes('2026'))) {
          yr = '2026';
        } else {
          yr = '2026';
        }
      }

      if (!yearMins[yr]) {
        yearMins[yr] = { count: 0, minutes: 0 };
      }
      yearMins[yr].count++;
      yearMins[yr].minutes += mins;

      if (r.nama && r.nama.trim() && r.nama !== '-') {
        techSet.add(r.nama.trim());
      }

      const s = (r.status || '').toUpperCase();
      if (s.includes('DONE')) done++;
      else if (s.includes('PROG')) progress++;
      else hold++;
    }

    const fmtMins = (m: number) => {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `${h.toLocaleString('id-ID')} jam ${rem}m` : `${h.toLocaleString('id-ID')} jam`;
    };

    return {
      totalSpilledHours: fmtMins(totalMins),
      yearBreakdown: {
        '2026': { count: yearMins['2026']?.count || 0, totalHours: fmtMins(yearMins['2026']?.minutes || 0) },
        '2025': { count: yearMins['2025']?.count || 0, totalHours: fmtMins(yearMins['2025']?.minutes || 0) },
        '2024': { count: yearMins['2024']?.count || 0, totalHours: fmtMins(yearMins['2024']?.minutes || 0) },
        '2023': { count: yearMins['2023']?.count || 0, totalHours: fmtMins(yearMins['2023']?.minutes || 0) },
      },
      uniqueTechnicians: Array.from(techSet),
      spilledStatusCounts: { done, progress, hold },
    };
  }, [spilledRecords]);

  // Paginated records for table rendering (Prevents DOM overload)
  const paginatedRecords = useMemo(() => {
    if (pageSize === 0) return spilledRecords;
    const start = (currentPage - 1) * pageSize;
    return spilledRecords.slice(start, start + pageSize);
  }, [spilledRecords, currentPage, pageSize]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(spilledRecords.length / pageSize) || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setUnitFilter('');
    setPanelFilter('');
    setSearchQuery('');
    setDivisiFilter('ALL');
    setYearFilter('ALL');
    setStatusFilter('ALL');
  };

  // Export Spilled Data as CSV
  const handleExportCSV = () => {
    if (spilledRecords.length === 0) return;

    const headers = ['No', 'Tanggal', 'Tahun', 'Divisi', 'Unit', 'Panel/Part', 'Teknisi', 'Jobdesc', 'Keterangan', 'Mulai', 'Selesai', 'Status', 'Total Jam'];
    const rows = spilledRecords.map((r, idx) => [
      idx + 1,
      `"${r.tanggal}"`,
      r.tahun || '2026',
      `"${r.divisi}"`,
      `"${r.unit}"`,
      `"${r.panelPart}"`,
      `"${r.nama}"`,
      `"${r.jobdesc.replace(/"/g, '""')}"`,
      `"${r.keterangan.replace(/"/g, '""')}"`,
      r.start || '',
      r.finish || '',
      r.status || '',
      r.totalJamKerja || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_Kerja_2023_2026_${unitFilter || 'All'}_${panelFilter || 'All'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Summary Report
  const handleCopySummary = () => {
    const summaryText = `LAPORAN DATA HASIL KERJA 2023-2026:
Unit: ${unitFilter || 'Semua Unit'}
Panel / Part: ${panelFilter || 'Semua Panel'}
Divisi: ${divisiFilter === 'ALL' ? 'Semua Divisi' : divisiFilter}
Tahun: ${yearFilter === 'ALL' ? '2023 - 2026' : yearFilter}
Total Jam Kerja: ${formatTimeString(totalSpilledHours)} Jam
Total Pekerjaan: ${spilledRecords.length} Log
Rincian per Tahun:
- 2026: ${yearBreakdown['2026'].count} log (${formatTimeString(yearBreakdown['2026'].totalHours)} jam)
- 2025: ${yearBreakdown['2025'].count} log (${formatTimeString(yearBreakdown['2025'].totalHours)} jam)
- 2024: ${yearBreakdown['2024'].count} log (${formatTimeString(yearBreakdown['2024'].totalHours)} jam)
- 2023: ${yearBreakdown['2023'].count} log (${formatTimeString(yearBreakdown['2023'].totalHours)} jam)
Teknisi Terlibat: ${uniqueTechnicians.join(', ') || '-'}
Status: Done: ${spilledStatusCounts.done} | In Progress: ${spilledStatusCounts.progress} | Hold: ${spilledStatusCounts.hold}`;

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Top Header Card: STRICT TITLE "HASIL KERJA 2023-2026" */}
      <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-[#c5a059]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/5 rounded-xl border border-[#c5a059]/30 text-[#c5a059] shadow-inner">
            <Layers className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-modern font-black text-white tracking-wide">
              HASIL KERJA 2023-2026
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Penarikan data agregat otomatis dari 4 Spreadsheet bulanan restorasi (2023, 2024, 2025, 2026)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172017] border border-emerald-500/40 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-300">
              Auto-Sync Aktif (Realtime)
            </span>
            <button
              onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
              className={`ml-1 px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer transition-colors ${
                autoSyncEnabled ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {autoSyncEnabled ? 'ON' : 'PAUSED'}
            </button>
          </div>

          {lastSyncTime && (
            <span className="text-[11px] text-gray-300 font-mono hidden lg:inline">
              Sinkron: {lastSyncTime}
            </span>
          )}
          <button
            onClick={() => handleFetchMultiYearData()}
            disabled={isLoading}
            className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Menarik Data 2023-2026...' : 'Tarik Data Live'}</span>
          </button>
        </div>
      </div>

      {/* 4 CONNECTED GOOGLE SPREADSHEETS SOURCE BAR */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-3.5 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#c5a059]" />
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              4 Sumber Google Spreadsheet Terhubung:
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              45 Tab Bulanan Aktif
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            Klik tautan file untuk membuka Google Sheets langsung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {Object.entries(MULTI_YEAR_SHEETS).map(([yr, cfg]) => (
            <a
              key={yr}
              href={cfg.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-black/40 hover:bg-black/70 border border-white/5 hover:border-[#c5a059]/40 rounded-xl transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] font-mono font-bold text-[11px]">
                  {yr}
                </span>
                <div className="truncate">
                  <p className="text-[11px] font-bold text-gray-200 group-hover:text-[#c5a059] truncate transition-colors">
                    {cfg.title}
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    {cfg.months.length} Tab Bulanan
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0 ml-1.5 transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* LIVE SYNC PROGRESS BAR NOTIFICATION */}
      {syncProgress && (
        <div className="p-3.5 bg-[#172017] border border-emerald-500/40 rounded-2xl shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="font-bold text-emerald-300">
                Menarik data dari 4 Spreadsheet: {syncProgress.currentMonth}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 font-bold">
              {syncProgress.scanned} / {syncProgress.total} Tab ({syncProgress.foundCount} data ditemukan)
            </span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-emerald-500/20">
            <div
              className="bg-gradient-to-r from-emerald-500 to-[#c5a059] h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((syncProgress.scanned / (syncProgress.total || 1)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* FILTER & LIVE DATA QUERY BAR */}
      <div className="bg-black/30 backdrop-blur-sm p-5 rounded-2xl border border-white/10 shadow-2xl space-y-4 relative z-20">
        {/* Subtle background glow when spill active */}
        {isSpillActive && showBackgroundShadow && (
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#c5a059]/20 via-emerald-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" />
        )}

        <div className="flex items-center justify-between border-b border-white/5 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#c5a059]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Filter Data Pengerjaan (Unit, Panel & Divisi)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle Shadow Backdrop */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="text-gray-400 font-medium">Bayangan Belakang:</span>
              <button
                onClick={() => setShowBackgroundShadow(!showBackgroundShadow)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  showBackgroundShadow
                    ? 'bg-[#c5a059] text-black font-black'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {showBackgroundShadow ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>

            {isSpillActive && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Primary Input: UNIT & PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-40">
          {/* 1. UNIT SELECTION: NATIVE DROPDOWN, SEARCH POPOVER, OR MANUAL */}
          <div className="space-y-1.5 relative z-50">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-[#c5a059]" />
                <span>NAMA UNIT KENDARAAN:</span>
              </label>
              <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUnitInputMethod('dropdown')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                    unitInputMethod === 'dropdown'
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Dropdown List Langsung (51 Unit)"
                >
                  List Dropdown
                </button>
                <button
                  type="button"
                  onClick={() => setUnitInputMethod('search')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                    unitInputMethod === 'search'
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Pencarian & Filter Merk"
                >
                  Cari Rich
                </button>
                <button
                  type="button"
                  onClick={() => setUnitInputMethod('manual')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer font-medium ${
                    unitInputMethod === 'manual'
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Ketik Nama Unit Manual"
                >
                  Ketik Manual
                </button>
              </div>
            </div>

            {unitInputMethod === 'dropdown' ? (
              /* NATIVE HTML SELECT DROPDOWN: 100% UNBEATABLE CLICK RESPONSE ON ALL DEVICES */
              <div className="relative">
                <select
                  value={unitFilter}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setUnitFilter(newUnit);
                    handleFetchMultiYearData(newUnit);
                  }}
                  className="w-full bg-[#0a0a0a] border border-[#c5a059]/60 hover:border-[#c5a059] focus:border-[#c5a059] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#c5a059] cursor-pointer font-bold tracking-wide transition-all shadow-md appearance-none pr-9"
                >
                  <option value="" className="bg-[#121212] text-amber-400 font-bold">
                    👇 SILAKAN PILIH UNIT KENDARAAN (Atau Pilih ALL UNIT)
                  </option>
                  <option value="ALL UNIT" className="bg-[#121212] text-[#c5a059] font-bold">
                    ⭐ ALL UNIT (Tampilkan Semua Unit)
                  </option>
                  {DAFTAR_UNIT_TERKELOMPOK.map((grp) => (
                    <optgroup key={grp.category} label={`─── ${grp.category} ───`} className="bg-[#0a0a0a] text-[#c5a059] font-bold">
                      {grp.units.map((u) => (
                        <option key={u} value={u} className="bg-[#171717] text-gray-200 font-normal">
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                  {unitFilter && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnitFilter('');
                        handleFetchMultiYearData('');
                      }}
                      className="pointer-events-auto p-0.5 rounded hover:text-rose-400 text-gray-400 mr-1"
                      title="Clear Unit"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronDown className="w-4 h-4 text-[#c5a059]" />
                </div>
              </div>
            ) : unitInputMethod === 'search' ? (
              /* CUSTOM SEARCHABLE POPOVER DROPDOWN WITH FIXED Z-INDEX */
              <UnitDropdownSelector
                selectedUnit={unitFilter}
                onSelectUnit={(newUnit) => {
                  setUnitFilter(newUnit);
                  handleFetchMultiYearData(newUnit);
                }}
                label=""
                placeholder="Pilih Unit Kendaraan (51 Unit Resmi)..."
              />
            ) : (
              /* MANUAL INPUT FIELD */
              <div className="space-y-1.5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama unit manual (contoh: JAGUAR, MB 280 GE, PULLMAN)..."
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFetchMultiYearData(e.currentTarget.value);
                    }}
                    className="w-full bg-[#0a0a0a] border border-[#c5a059]/50 focus:border-[#c5a059] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-all font-medium pr-8"
                  />
                  {unitFilter && (
                    <button
                      onClick={() => setUnitFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. INPUT PANEL / PART (MANUAL) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>PANEL / PART (ISI MANUAL):</span>
              </label>
              <span className="text-[10px] text-cyan-400/80 font-mono">Ketik Bebas & Filter</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Tulis panel / bagian secara manual (contoh: KISI - KISI, ENGINE, DASHBOARD...)"
                value={panelFilter}
                onChange={(e) => setPanelFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetchMultiYearData(unitFilter, e.currentTarget.value);
                }}
                className="w-full bg-[#0a0a0a] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-medium pr-8"
              />
              {panelFilter && (
                <button
                  onClick={() => setPanelFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Filters (Tahun, Bulan, Divisi, Status, Text Search) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-white/5 relative z-10">
          {/* Tahun Dropdown */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              TAHUN PENGERJAAN
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                const yr = e.target.value;
                setYearFilter(yr);
                handleFetchMultiYearData(undefined, undefined, undefined, yr);
              }}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="ALL">Semua Tahun (2023 - 2026)</option>
              <option value="2026">Tahun 2026</option>
              <option value="2025">Tahun 2025</option>
              <option value="2024">Tahun 2024</option>
              <option value="2023">Tahun 2023</option>
            </select>
          </div>

          {/* Bulan Dropdown */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              BULAN PENGERJAAN
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#c5a059] cursor-pointer font-medium"
            >
              <option value="ALL">Semua Bulan (Jan - Des)</option>
              <option value="Januari">Januari</option>
              <option value="Februari">Februari</option>
              <option value="Maret">Maret</option>
              <option value="April">April</option>
              <option value="Mei">Mei</option>
              <option value="Juni">Juni</option>
              <option value="Juli">Juli</option>
              <option value="Agustus">Agustus</option>
              <option value="September">September</option>
              <option value="Oktober">Oktober</option>
              <option value="November">November</option>
              <option value="Desember">Desember</option>
            </select>
          </div>

          {/* Divisi Dropdown */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              DIVISI KERJA
            </label>
            <select
              value={divisiFilter}
              onChange={(e) => {
                const d = e.target.value;
                setDivisiFilter(d);
                handleFetchMultiYearData(undefined, undefined, d);
              }}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="BODY WORK">BODY WORK</option>
              <option value="BODY PAINT">BODY PAINT</option>
              <option value="INTERIOR">INTERIOR</option>
              <option value="CHROME">CHROME</option>
              <option value="MECHANIC">MECHANIC</option>
              <option value="BUBUT">BUBUT</option>
              <option value="WAREHOUSE">WAREHOUSE</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              STATUS PEKERJAAN
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-[#c5a059] cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="DONE">Done (Selesai)</option>
              <option value="PROGRESS">In Progress</option>
              <option value="HOLD">Hold / Pending</option>
            </select>
          </div>

          {/* General Search Box */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
              PENCARIAN TEKNISI / KETERANGAN
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari teknisi, tanggal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>
        </div>

        {/* Pilihan Gaya Bayangan Belakang (Shadow Themes) */}
        {showBackgroundShadow && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Gaya Bayangan Belakang (Ghost Layer):</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'blueprint', label: '🚗 Blueprint Sasis', desc: 'Sketsa sasis teknis di latar belakang' },
                { id: 'stacked', label: '🗂️ Kartu Bertingkat', desc: 'Efek tumpukan kertas 3D' },
                { id: 'golden', label: '✨ Aura Emas & Neon', desc: 'Pendaran bayangan glow' },
                { id: 'grid', label: '🏁 Matriks Grid', desc: 'Pola blueprint garis milimeter' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setShadowTheme(theme.id as any)}
                  title={theme.desc}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                    shadowTheme === theme.id
                      ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059] font-bold shadow-md shadow-[#c5a059]/10'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer / Status Sinkronisasi Rapi */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLoading ? 'bg-[#c5a059] animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-[11px] text-gray-400">
              {isLoading ? (
                <span className="text-[#c5a059] font-medium">Sedang menyinkronkan data Google Sheets (2023-2026)...</span>
              ) : (
                <span>
                  {lastSyncTime ? `Disinkronkan: ${lastSyncTime} • ` : ''}
                  Menampilkan data untuk <strong className="text-white">{unitFilter || 'Semua Unit'}</strong>
                  {panelFilter ? <> • Panel: <strong className="text-cyan-400">{panelFilter}</strong></> : ''}
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleFetchMultiYearData(unitFilter, panelFilter)}
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/10'
                  : 'bg-white/5 hover:bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 hover:border-[#c5a059]'
              }`}
              title="Perbarui / sinkronkan data terbaru dari Google Sheets 2023-2026"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* INDIKATOR STATUS DATA TERPILIH */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          isSpillActive
            ? 'bg-gradient-to-r from-[#172017] via-[#141414] to-[#1e1910] border-[#c5a059]/40 shadow-xl'
            : 'bg-[#141414] border-white/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center justify-center ${
                isSpillActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20 shadow-lg'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              <ArrowDownCircle className={`w-5 h-5 ${isSpillActive ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  {isSpillActive ? 'STATUS DATA TERFILTER DARI 4 FILE' : 'STATUS INDIKATOR FILTER'}
                </span>
                {unitFilter && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
                    Unit: {unitFilter}
                  </span>
                )}
                {panelFilter && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Panel: {panelFilter}
                  </span>
                )}
                {divisiFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Divisi: {divisiFilter}
                  </span>
                )}
                {yearFilter !== 'ALL' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Tahun: {yearFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {unitFilter.trim() ? (
                  <>
                    Menampilkan <strong className="text-[#c5a059] font-bold">{spilledRecords.length} baris</strong> data riwayat pekerjaan dengan total{' '}
                    <strong className="text-emerald-400 font-bold font-mono">{formatTimeString(totalSpilledHours)}</strong>.
                  </>
                ) : (
                  <span className="text-gray-400">
                    Data saat ini kosong. Silakan pilih <strong className="text-white">Unit Kendaraan</strong> pada dropdown di atas untuk memunculkan rincian hasil kerja.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Export & Copy Actions */}
          {spilledRecords.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>{copySuccess ? 'Tersalin!' : 'Salin Laporan'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-1.5 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] rounded-xl border border-[#c5a059]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor CSV</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 YEAR BREAKDOWN CARDS (2023 - 2026) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Year 2026 */}
        <div className="bg-[#141414] border border-[#c5a059]/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#c5a059] font-black uppercase tracking-widest">
              TAHUN 2026
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c5a059]/15 text-[#c5a059] font-mono">
              Aktif
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {formatTimeString(yearBreakdown['2026'].totalHours)}
            </span>
            <span className="text-xs text-gray-400">jam</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {yearBreakdown['2026'].count} log pekerjaan
          </p>
        </div>

        {/* Year 2025 */}
        <div className="bg-[#141414] border border-cyan-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">
              TAHUN 2025
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 font-mono">
              12 Bulan
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {formatTimeString(yearBreakdown['2025'].totalHours)}
            </span>
            <span className="text-xs text-gray-400">jam</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {yearBreakdown['2025'].count} log pekerjaan
          </p>
        </div>

        {/* Year 2024 */}
        <div className="bg-[#141414] border border-purple-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">
              TAHUN 2024
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 font-mono">
              12 Bulan
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {formatTimeString(yearBreakdown['2024'].totalHours)}
            </span>
            <span className="text-xs text-gray-400">jam</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {yearBreakdown['2024'].count} log pekerjaan
          </p>
        </div>

        {/* Year 2023 */}
        <div className="bg-[#141414] border border-emerald-500/30 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
              TAHUN 2023
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono">
              12 Bulan
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">
              {formatTimeString(yearBreakdown['2023'].totalHours)}
            </span>
            <span className="text-xs text-gray-400">jam</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 font-mono">
            {yearBreakdown['2023'].count} log pekerjaan
          </p>
        </div>
      </div>

      {/* 4 SUMMARY METRIC CARDS ON SPILLED DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-[#141414] border border-white/5 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
            TOTAL JAM KERJA (2023-2026)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-[#c5a059]">
              {formatTimeString(totalSpilledHours)}
            </span>
            <span className="text-xs text-gray-400">jam</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Akumulasi Jam Terfilter</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#141414] border border-white/5 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
            TOTAL LOG PEKERJAAN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {spilledRecords.length}
            </span>
            <span className="text-xs text-gray-400">log</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            Dari 4 Spreadsheet
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#141414] border border-white/5 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
            TEKNISI TERLIBAT
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {uniqueTechnicians.length}
            </span>
            <span className="text-xs text-gray-400">personil</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 truncate" title={uniqueTechnicians.join(', ')}>
            {uniqueTechnicians.slice(0, 3).join(', ') || '-'}
            {uniqueTechnicians.length > 3 ? ` +${uniqueTechnicians.length - 3}` : ''}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#141414] border border-white/5 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">
            STATUS PENYELESAIAN
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Done: {spilledStatusCounts.done}
            </span>
            {spilledStatusCounts.progress > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Prog: {spilledStatusCounts.progress}
              </span>
            )}
            {spilledStatusCounts.hold > 0 && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Hold: {spilledStatusCounts.hold}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-1.5">
            Done:{' '}
            <strong className="text-emerald-400">
              {Math.round((spilledStatusCounts.done / (spilledRecords.length || 1)) * 100)}%
            </strong>
          </p>
        </div>
      </div>

      {/* THE SPILLED DATA TABLE WITH LAYERED 3D BACKGROUND SHADOW & GHOST LAYER */}
      <div className="relative group/table mt-6">
        {/* === LAYER 1: AMBIENT GLOW BACKDROP AURA === */}
        {showBackgroundShadow && (
          <div
            className={`absolute -inset-2 rounded-3xl transition-all duration-700 pointer-events-none -z-30 ${
              isSpillActive
                ? 'bg-gradient-to-br from-[#c5a059]/25 via-emerald-500/15 to-cyan-500/20 blur-2xl opacity-80 animate-pulse'
                : 'bg-gradient-to-b from-white/5 to-transparent blur-xl opacity-30'
            }`}
          />
        )}

        {/* === LAYER 2: DEEP STACKED SHEET SHADOW (BOTTOM CARD) === */}
        {showBackgroundShadow && (
          <div
            className={`absolute -inset-x-3 -bottom-3 top-5 rounded-2xl border transition-all duration-500 pointer-events-none -z-20 transform scale-[0.985] ${
              isSpillActive
                ? 'bg-[#0a0a0a]/90 border-[#c5a059]/30 shadow-2xl shadow-black'
                : 'bg-[#0c0c0c]/80 border-white/5 shadow-xl'
            }`}
          >
            <div className="h-full w-full flex items-end justify-between p-3 opacity-40">
              <span className="text-[10px] font-mono text-[#c5a059]">LAYAR BAYANGAN // MULTI-YEAR ENGINE (2023-2026)</span>
              <span className="text-[10px] font-mono text-gray-500">4 SPREADSHEETS CONNECTED</span>
            </div>
          </div>
        )}

        {/* === LAYER 3: MID STACKED SHEET SHADOW (UNDERLAY CARD) === */}
        {showBackgroundShadow && (
          <div
            className={`absolute -inset-x-1.5 -bottom-1.5 top-2.5 rounded-2xl border transition-all duration-500 pointer-events-none -z-10 transform scale-[0.995] ${
              isSpillActive
                ? 'bg-[#111111]/95 border-cyan-500/20 shadow-xl shadow-black/80'
                : 'bg-[#121212]/90 border-white/5'
            }`}
          />
        )}

        {/* === LAYER 4: MAIN FOREGROUND TABLE CONTAINER === */}
        <div
          className={`rounded-2xl border backdrop-blur-xl transition-all duration-500 overflow-hidden shadow-2xl relative ${
            isSpillActive
              ? 'bg-[#121212]/75 border-[#c5a059]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-[#c5a059]/20'
              : 'bg-[#141414]/75 border-white/10'
          }`}
        >
          {/* BACKGROUND WATERMARK / BLUEPRINT SCHEMATIC OVERLAY */}
          {showBackgroundShadow && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
              {/* Theme: Blueprint Sasis */}
              {shadowTheme === 'blueprint' && (
                <div className="absolute inset-0 opacity-[0.06] flex items-center justify-center">
                  <svg className="w-[85%] h-[85%] text-[#c5a059]" viewBox="0 0 800 400" fill="none" stroke="currentColor">
                    <circle cx="200" cy="300" r="45" strokeWidth="3" strokeDasharray="6 4" />
                    <circle cx="200" cy="300" r="25" strokeWidth="2" />
                    <circle cx="600" cy="300" r="45" strokeWidth="3" strokeDasharray="6 4" />
                    <circle cx="600" cy="300" r="25" strokeWidth="2" />
                    <path d="M120 300 H 155 M 245 H 555 M 645 H 700 V 260 L 640 220 L 520 120 H 320 L 220 220 L 120 250 Z" strokeWidth="3" />
                    <path d="M 320 130 H 480 L 580 220 H 320 Z" strokeWidth="2" />
                    <path d="M 300 130 L 220 220 H 160" strokeWidth="2" />
                    <line x1="50" y1="345" x2="750" y2="345" strokeWidth="1.5" strokeDasharray="8 6" />
                    <text x="400" y="380" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="monospace" letterSpacing="4">
                      SCHEMATIC CHASSIS & BODY RESTORATION BLUEPRINT 2023-2026
                    </text>
                  </svg>
                </div>
              )}

              {/* Theme: Grid Matrix */}
              {shadowTheme === 'grid' && (
                <div
                  className="absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage: `linear-gradient(to right, #c5a059 1px, transparent 1px), linear-gradient(to bottom, #c5a059 1px, transparent 1px)`,
                    backgroundSize: '24px 24px',
                  }}
                />
              )}

              {/* Theme: Golden Glow */}
              {shadowTheme === 'golden' && (
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_50%_40%,rgba(197,160,89,0.25)_0%,transparent_70%)]" />
              )}

              {/* Dynamic Watermark Text of Active Filter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.04] uppercase font-black font-mono tracking-widest leading-none pointer-events-none">
                <span className="text-6xl md:text-8xl truncate px-4">
                  {unitFilter || panelFilter || 'SIGNAL KUSTOM'}
                </span>
                <span className="text-3xl md:text-4xl mt-2 tracking-widest text-[#c5a059]">
                  2023 — 2026 VINTAGE RESTORATION
                </span>
              </div>
            </div>
          )}

          {/* Table Header Bar with Pagination & Row Controls */}
          <div className="p-4 bg-[#0d0d0d]/90 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-4 h-4 text-[#c5a059]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Tabel Rincian Hasil Kerja (2023-2026)
              </span>
              {isSpillActive && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  TERTIMPAH DARI SPREADSHEET
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-400 font-mono">
                Menampilkan{' '}
                <strong className="text-[#c5a059]">
                  {spilledRecords.length === 0
                    ? '0'
                    : pageSize === 0
                    ? `1 - ${spilledRecords.length}`
                    : `${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, spilledRecords.length)}`}
                </strong>{' '}
                dari <strong className="text-white">{spilledRecords.length.toLocaleString('id-ID')}</strong> Baris
              </span>

              {/* Page Size Selector Dropdown */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-[11px] text-gray-500">Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-[#1a1a1a] border border-white/15 rounded-lg px-2 py-1 text-xs text-[#c5a059] font-bold focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value={50}>50 per hal</option>
                  <option value={100}>100 per hal</option>
                  <option value={250}>250 per hal</option>
                  <option value={500}>500 per hal</option>
                  <option value={0}>Semua Data ({spilledRecords.length.toLocaleString('id-ID')})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto max-h-[65vh] no-scrollbar relative z-10">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0a0a]/95 backdrop-blur-md text-[#c5a059] font-bold uppercase tracking-wider sticky top-0 z-20 border-b border-white/10 shadow-md">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center border-r border-white/5">No</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Tahun</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Tanggal</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Divisi</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Unit Kendaraan</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Panel / Part</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5">Teknisi</th>
                  <th className="py-3 px-3.5 min-w-[220px] border-r border-white/5">Jobdesc Pengerjaan</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5 text-center">Mulai - Selesai</th>
                  <th className="py-3 px-3.5 whitespace-nowrap border-r border-white/5 text-center">Status</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right pr-4">Total Jam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200">
                {spilledRecords.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center space-y-3 bg-[#0d0d0d]/70 backdrop-blur-sm">
                      {!unitFilter.trim() ? (
                        <>
                          <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center mx-auto text-[#c5a059]">
                            <Car className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-white">
                            Data Masih Kosong
                          </p>
                          <p className="text-xs text-gray-400 max-w-md mx-auto">
                            Silakan pilih <strong>Unit Kendaraan</strong> pada dropdown di atas untuk memunculkan semua rincian hasil kerja unit tersebut.
                          </p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto" />
                          <p className="text-sm font-bold text-gray-300">
                            Tidak ada data pengerjaan yang cocok dengan unit "{unitFilter}" {panelFilter ? `dan panel "${panelFilter}"` : ''}.
                          </p>
                          <p className="text-xs text-gray-500">
                            Periksa penulisan panel atau klik sinkronkan data di atas.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              onClick={() => handleFetchMultiYearData(unitFilter, panelFilter)}
                              className="px-4 py-2 bg-[#c5a059] text-black text-xs font-bold rounded-xl cursor-pointer shadow-md hover:bg-[#d4af66] flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Sinkronkan Ulang Data</span>
                            </button>
                            <button
                              onClick={handleResetFilters}
                              className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-white/20"
                            >
                              Reset Filter
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((item, idx) => {
                    const realIdx = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                    const isUnitMatch = Boolean(unitFilter && (item.unit.toLowerCase().includes(unitFilter.toLowerCase()) || unitFilter.toLowerCase().includes(item.unit.toLowerCase())));
                    const isPanelMatch = Boolean(panelFilter && (item.panelPart.toLowerCase().includes(panelFilter.toLowerCase()) || item.jobdesc.toLowerCase().includes(panelFilter.toLowerCase())));

                    let yr = item.tahun || '2026';
                    const yrMatch = item.tanggal.match(/\b(202[3-6])\b/);
                    if (yrMatch) yr = yrMatch[1];

                    const yrBadgeColor =
                      yr === '2026'
                        ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40'
                        : yr === '2025'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : yr === '2024'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                    return (
                      <tr
                        key={item.id || idx}
                        className={`transition-colors backdrop-blur-[2px] ${
                          isUnitMatch || isPanelMatch
                            ? 'bg-[#c5a059]/10 hover:bg-[#c5a059]/20'
                            : 'bg-black/30 hover:bg-white/5'
                        }`}
                      >
                        {/* No */}
                        <td className="py-2.5 px-3.5 text-center font-mono text-gray-500 border-r border-white/5 text-[11px]">
                          {realIdx}
                        </td>

                        {/* Tahun */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${yrBadgeColor}`}>
                            {yr}
                          </span>
                        </td>

                        {/* Tanggal */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-medium text-gray-200">{item.tanggal}</span>
                          </div>
                        </td>

                        {/* Divisi */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-300 border border-white/10 uppercase">
                            {item.divisi}
                          </span>
                        </td>

                        {/* Unit Kendaraan */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <span className={`font-bold ${isUnitMatch ? 'text-[#c5a059] drop-shadow-[0_0_8px_rgba(197,160,89,0.4)]' : 'text-white'}`}>
                            {item.unit}
                          </span>
                        </td>

                        {/* Panel / Part */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              isPanelMatch
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                                : 'bg-white/5 text-gray-300 border border-white/10'
                            }`}
                          >
                            {item.panelPart || '-'}
                          </span>
                        </td>

                        {/* Teknisi */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-[11px]">
                          <span className="font-semibold text-gray-200">{item.nama}</span>
                        </td>

                        {/* Jobdesc */}
                        <td className="py-2.5 px-3.5 border-r border-white/5 text-[11px]">
                          <p className="text-gray-300 leading-relaxed font-normal">{item.jobdesc}</p>
                          {item.keterangan && item.keterangan !== '-' && (
                            <p className="text-[10px] text-gray-500 italic mt-0.5">Ket: {item.keterangan}</p>
                          )}
                        </td>

                        {/* Mulai - Selesai */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-center font-mono text-[11px] text-gray-400">
                          {item.start && item.finish ? `${item.start} - ${item.finish}` : item.start || '-'}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap border-r border-white/5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              item.status?.toUpperCase().includes('DONE')
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : item.status?.toUpperCase().includes('PROG')
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {item.status || 'Done'}
                          </span>
                        </td>

                        {/* Total Jam */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap text-right pr-4 font-mono font-bold text-[#c5a059] text-[11px]">
                          {formatTimeString(calculateDurationFromTimes(item.start, item.finish, item.breakTime, item.totalJamKerja))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Navigation */}
          {spilledRecords.length > 0 && pageSize > 0 && totalPages > 1 && (
            <div className="p-3 bg-[#0a0a0a]/95 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 text-xs">
              <div className="text-gray-400 font-mono text-[11px]">
                Halaman <strong className="text-white">{currentPage}</strong> dari{' '}
                <strong className="text-white">{totalPages}</strong> ({spilledRecords.length.toLocaleString('id-ID')} data)
              </div>

              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="Halaman Pertama"
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Halaman Sebelumnya"
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 px-2.5 font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Quick Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                    let pageNum = currentPage;
                    if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#c5a059] text-black font-extrabold shadow-sm'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/15'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Halaman Selanjutnya"
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1 px-2.5 font-medium"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Halaman Terakhir"
                  className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
