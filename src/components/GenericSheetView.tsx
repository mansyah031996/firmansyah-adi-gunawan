import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, FileSpreadsheet, Sparkles, Download, ArrowUpDown, Filter, Table, Car, Wrench, X, Flame, ArrowDownCircle } from 'lucide-react';
import { parseCSVRow, getGoogleSheetsCsvUrl, extractSpreadsheetId, DEFAULT_SHEET_URL } from '../utils/googleSheetsSync';

interface GenericSheetViewProps {
  tabName: string;
  gid: string;
  spreadsheetUrl?: string;
  initialSearchQuery?: string;
  onRefresh?: () => void;
}

export const GenericSheetView: React.FC<GenericSheetViewProps> = ({
  tabName,
  gid,
  spreadsheetUrl = DEFAULT_SHEET_URL,
  initialSearchQuery = '',
}) => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [panelFilter, setPanelFilter] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const loadTabData = async () => {
    setLoading(true);
    setError(null);
    try {
      const spreadsheetId = extractSpreadsheetId(spreadsheetUrl) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
      const csvUrl = getGoogleSheetsCsvUrl(spreadsheetId, gid);

      let res = await fetch(csvUrl);
      if (!res.ok) {
        const fallbackUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
        res = await fetch(fallbackUrl);
      }

      if (!res.ok) {
        throw new Error(`Gagal mengambil data dari Google Sheets (Status HTTP ${res.status}).`);
      }

      const text = await res.text();
      const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (rawLines.length === 0) {
        setHeaders([]);
        setRows([]);
      } else {
        const parsedHeaders = parseCSVRow(rawLines[0]);
        const parsedRows = rawLines.slice(1).map((line) => parseCSVRow(line));

        setHeaders(parsedHeaders);
        setRows(parsedRows);
      }

      const now = new Date();
      setLastSyncTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} WIB`
      );
    } catch (err: any) {
      console.error('Error loading custom tab:', err);
      setError(err.message || 'Gagal memuat data dari Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [gid, spreadsheetUrl]);

  // Identify column indices for Unit and Panel
  const unitColIdx = useMemo(() => {
    return headers.findIndex((h) => {
      const u = h.toUpperCase();
      return u.includes('UNIT') || u.includes('KENDARAAN') || u.includes('CAR');
    });
  }, [headers]);

  const panelColIdx = useMemo(() => {
    return headers.findIndex((h) => {
      const p = h.toUpperCase();
      return p.includes('PANEL') || p.includes('PART') || p.includes('BAGIAN');
    });
  }, [headers]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Unit filter
      if (unitFilter.trim()) {
        const u = unitFilter.trim().toLowerCase();
        if (unitColIdx !== -1) {
          if (!row[unitColIdx] || !row[unitColIdx].toLowerCase().includes(u)) return false;
        } else {
          // fallback check all cells
          if (!row.some((c) => c.toLowerCase().includes(u))) return false;
        }
      }

      // 2. Panel filter
      if (panelFilter.trim()) {
        const p = panelFilter.trim().toLowerCase();
        if (panelColIdx !== -1) {
          if (!row[panelColIdx] || !row[panelColIdx].toLowerCase().includes(p)) return false;
        } else {
          // fallback check all cells
          if (!row.some((c) => c.toLowerCase().includes(p))) return false;
        }
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!row.some((cell) => cell.toLowerCase().includes(q))) {
          return false;
        }
      }

      return true;
    });
  }, [rows, unitFilter, panelFilter, searchQuery, unitColIdx, panelColIdx]);

  const isSpillActive = Boolean(unitFilter.trim() || panelFilter.trim() || searchQuery.trim());

  const handleResetFilters = () => {
    setUnitFilter('');
    setPanelFilter('');
    setSearchQuery('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...filteredRows.map((e) => e.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tabName}_Data_Tumpah_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Top Banner Header */}
      <div className="bg-black/30 backdrop-blur-sm p-5 rounded-2xl border border-[#c5a059]/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#c5a059]/15 rounded-xl border border-[#c5a059]/30 text-[#c5a059]">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 uppercase">
                REALTIME TAB SPREADSHEET
              </span>
              <span className="text-gray-400 font-mono text-xs">GID: {gid}</span>
              {isSpillActive && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  DATA TUMPAH AKTIF
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-modern font-black text-white mt-1">{tabName}</h2>
            <p className="text-xs text-gray-300">
              Data ditarik secara langsung dari tab Google Sheets sumber
            </p>
          </div>
        </div>

        {/* Sync & Refresh Button */}
        <div className="flex items-center gap-2">
          {lastSyncTime && (
            <span className="text-[11px] text-gray-300 font-mono hidden md:inline">
              Sync: {lastSyncTime}
            </span>
          )}
          <button
            onClick={loadTabData}
            disabled={loading}
            className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${loading ? 'animate-spin' : ''}`} />
            <span>Refres Tab</span>
          </button>
        </div>
      </div>

      {/* Dual Filter Unit & Panel */}
      <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              Filter Pencarian & Indikator Data Tumpah
            </span>
          </div>
          {isSpillActive && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Unit Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-300 uppercase flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Filter Unit Kendaraan:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tulis Unit (contoh: BMW, JAGUAR...)"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="w-full bg-black/50 border border-[#c5a059]/40 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
              />
              {unitFilter && (
                <button
                  onClick={() => setUnitFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Panel Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-300 uppercase flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filter Panel / Bagian:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Tulis Panel (contoh: ENGINE, KAP...)"
                value={panelFilter}
                onChange={(e) => setPanelFilter(e.target.value)}
                className="w-full bg-black/50 border border-cyan-500/40 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
              />
              {panelFilter && (
                <button
                  onClick={() => setPanelFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* General Search Query */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-300 uppercase flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span>Pencarian Kata Kunci:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari teks umum di sheet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-white/15 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indikator Data Tumpah Status */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
          isSpillActive
            ? 'bg-gradient-to-r from-emerald-950/40 to-black/30 border-emerald-500/30 backdrop-blur-sm'
            : 'bg-black/30 border-white/10 backdrop-blur-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <ArrowDownCircle
            className={`w-4 h-4 ${isSpillActive ? 'text-emerald-400 animate-bounce' : 'text-gray-400'}`}
          />
          <div className="text-xs text-gray-300">
            {isSpillActive ? (
              <span>
                <strong className="text-emerald-400 font-bold">STATUS DATA TUMPAH:</strong> Menampilkan{' '}
                <strong className="text-white font-bold">{filteredRows.length}</strong> baris data terfilter (dari {rows.length} baris total).
              </span>
            ) : (
              <span>
                Total Data: <strong className="text-[#c5a059]">{rows.length}</strong> baris. Tulis unit / panel di atas untuk filter.
              </span>
            )}
          </div>
        </div>

        {filteredRows.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white rounded-lg text-xs border border-white/15 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3 h-3" />
            <span>Ekspor CSV</span>
          </button>
        )}
      </div>

      {/* Loading / Error / Table View */}
      {loading ? (
        <div className="py-20 text-center bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-400">
            Menyinkronkan data Google Sheets tab "{tabName}"...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-950/30 backdrop-blur-sm rounded-2xl border border-rose-500/30 space-y-3">
          <p className="text-sm font-bold text-rose-400">{error}</p>
          <button
            onClick={loadTabData}
            className="px-4 py-2 bg-[#c5a059] text-black text-xs font-bold rounded-xl"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/15 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto max-h-[65vh] no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 backdrop-blur-sm text-[#c5a059] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-white/10">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center border-r border-white/5">#</th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-3.5 whitespace-nowrap border-r border-white/5 last:border-r-0"
                    >
                      {header || `Kolom ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200 bg-transparent">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length + 1} className="py-12 text-center text-gray-400">
                      Tidak ada data yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-white/10 bg-black/15 transition-colors">
                      <td className="py-2.5 px-3.5 text-center font-mono text-gray-400 border-r border-white/5 text-[11px]">
                        {rowIdx + 1}
                      </td>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="py-2.5 px-3.5 border-r border-white/5 last:border-r-0 text-[11px] whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
