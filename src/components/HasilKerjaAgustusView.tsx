import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Wrench,
  Hammer,
  Paintbrush,
  Armchair,
  Sparkles,
  CheckCircle2,
  Clock,
  Car,
  UserCheck,
  Calendar,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { HasilKerjaAgustusRecord, ProjectUnit } from '../types';
import { sumTimeStrings, formatTimeString } from '../utils/timeUtils';

interface HasilKerjaAgustusViewProps {
  records: HasilKerjaAgustusRecord[];
  units?: ProjectUnit[];
  onSelectUnit?: (unit: ProjectUnit) => void;
  monthLabel?: string;
}

export const HasilKerjaAgustusView: React.FC<HasilKerjaAgustusViewProps> = ({
  records,
  units = [],
  onSelectUnit,
  monthLabel = 'SEPTEMBER',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [divisiFilter, setDivisiFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [panelFilter, setPanelFilter] = useState('');

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUnit = r.unit.toLowerCase().includes(q);
        const matchNama = r.nama.toLowerCase().includes(q);
        const matchJobdesc = r.jobdesc.toLowerCase().includes(q);
        const matchPanel = r.panelPart.toLowerCase().includes(q);
        const matchKet = r.keterangan.toLowerCase().includes(q);
        const matchDivisi = r.divisi.toLowerCase().includes(q);
        const matchTanggal = r.tanggal.toLowerCase().includes(q);

        if (!matchUnit && !matchNama && !matchJobdesc && !matchPanel && !matchKet && !matchDivisi && !matchTanggal) {
          return false;
        }
      }

      // Panel Filter
      if (panelFilter.trim()) {
        const p = panelFilter.trim().toLowerCase();
        if (!r.panelPart.toLowerCase().includes(p)) {
          return false;
        }
      }

      // Divisi Filter
      if (divisiFilter !== 'ALL') {
        const df = divisiFilter.toUpperCase();
        if (df === 'MECHANIC') {
          if (!r.divisi.toUpperCase().includes('MECH')) return false;
        } else if (!r.divisi.toUpperCase().includes(df)) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const sf = statusFilter.toUpperCase();
        if (sf === 'DONE') {
          if (!r.status.toUpperCase().includes('DONE')) return false;
        } else if (sf === 'PROGRESS') {
          if (!r.status.toUpperCase().includes('PROG')) return false;
        } else if (sf === 'HOLD') {
          if (!r.status.toUpperCase().includes('HOLD') && !r.status.toUpperCase().includes('PENDING')) return false;
        }
      }

      // Unit Filter
      if (unitFilter !== 'ALL') {
        if (r.unit.trim().toUpperCase() !== unitFilter.trim().toUpperCase()) {
          return false;
        }
      }

      return true;
    });
  }, [records, searchQuery, divisiFilter, statusFilter, unitFilter, panelFilter]);

  // Overall Metrics
  const totalJamKerjaStr = useMemo(() => {
    return sumTimeStrings(records.map((r) => r.totalJamKerja || '0:00'));
  }, [records]);

  const uniqueWorkersCount = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.nama.trim()));
    return set.size;
  }, [records]);

  const statusCounts = useMemo(() => {
    let done = 0;
    let inProgress = 0;
    let hold = 0;
    records.forEach((r) => {
      const st = (r.status || '').toUpperCase();
      if (st.includes('DONE')) done++;
      else if (st.includes('PROG')) inProgress++;
      else hold++;
    });
    return { done, inProgress, hold };
  }, [records]);

  // Unique Unit Names
  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.unit.trim()));
    return Array.from(set).sort();
  }, [records]);

  // Helper status badge style
  const getStatusBadge = (status: string) => {
    const st = (status || '').toUpperCase();
    if (st.includes('DONE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (st.includes('PROG')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (st.includes('HOLD') || st.includes('PENDING')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header Banner matching Google Sheets Yellow Bar */}
      <div className="bg-[#eab308] dark:bg-[#ca8a04] text-black font-extrabold text-center py-2.5 px-4 rounded-xl shadow-lg border border-yellow-500/40 flex items-center justify-center gap-2">
        <FileText className="w-5 h-5 text-black" />
        <span className="text-base sm:text-lg tracking-wider uppercase font-black">
          HASIL KERJA {monthLabel}
        </span>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest block">
            TOTAL JAM KERJA HASIL KERJA
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {formatTimeString(totalJamKerjaStr)}
            </span>
            <span className="text-xs text-gray-300">jam</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Akumulasi Jam Kerja Log Harian</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest block">
            TOTAL LOG KERJAAN
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">{records.length}</span>
            <span className="text-xs text-gray-300">catatan</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Jumlah Item Pekerjaan Tercatat</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest block">
            STATUS PENYELESAIAN
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Done: {statusCounts.done}
            </span>
            {statusCounts.inProgress > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Progress: {statusCounts.inProgress}
              </span>
            )}
            {statusCounts.hold > 0 && (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Hold: {statusCounts.hold}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Selesai: <strong className="text-emerald-400">{Math.round((statusCounts.done / (records.length || 1)) * 100)}%</strong>
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest block">
            PERSONIL & TEKNISI
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-400">{uniqueWorkersCount}</span>
            <span className="text-xs text-gray-300">personil aktif</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Teknisi Terlibat {monthLabel}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari tanggal, divisi, unit, nama, panel, jobdesc, atau keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#eab308] transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Panel Filter */}
            <input
              type="text"
              placeholder="Filter Panel / Part..."
              value={panelFilter}
              onChange={(e) => setPanelFilter(e.target.value)}
              className="bg-black/50 border border-cyan-500/30 rounded-xl px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 max-w-[150px]"
            />

            {/* Divisi Filter */}
            <select
              value={divisiFilter}
              onChange={(e) => setDivisiFilter(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#eab308] cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="MECHANIC">MECHANIC</option>
              <option value="BODY WORK">BODY WORK</option>
              <option value="BODY PAINT">BODY PAINT</option>
              <option value="INTERIOR">INTERIOR</option>
              <option value="ALL DIVISI">ALL DIVISI</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#eab308] cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="DONE">Done / Selesai</option>
              <option value="PROGRESS">In Progress</option>
              <option value="HOLD">Hold / Pending</option>
            </select>

            {/* Unit Filter */}
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#eab308] cursor-pointer max-w-[200px] truncate"
            >
              <option value="ALL">Semua Unit</option>
              {uniqueUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Indikator Data Tumpah Banner */}
        {(unitFilter !== 'ALL' || panelFilter.trim() || searchQuery.trim()) && (
          <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-black/40 to-amber-950/30 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                INDIKATOR DATA TUMPAH AKTIF
              </span>
              <span className="text-gray-300">
                Menumpahkan <strong className="text-emerald-400 font-bold">{filteredRecords.length}</strong> baris data riwayat pekerjaan.
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setDivisiFilter('ALL');
                setStatusFilter('ALL');
                setUnitFilter('ALL');
                setPanelFilter('');
              }}
              className="text-rose-400 hover:text-rose-300 font-medium hover:underline cursor-pointer shrink-0"
            >
              Reset Filter
            </button>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
          <span>
            Menampilkan <strong className="text-white font-mono">{filteredRecords.length}</strong> dari {records.length} data Hasil Kerja
          </span>
          {(searchQuery || divisiFilter !== 'ALL' || statusFilter !== 'ALL' || unitFilter !== 'ALL' || panelFilter.trim()) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDivisiFilter('ALL');
                setStatusFilter('ALL');
                setUnitFilter('ALL');
                setPanelFilter('');
              }}
              className="text-[#eab308] hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="relative group/table mt-6">
        <div className="bg-black/30 backdrop-blur-[2px] border border-white/15 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/60 backdrop-blur-sm border-b border-white/10 text-gray-200 uppercase tracking-wider text-[11px] font-bold select-none">
                  <th className="py-3.5 px-3">NO</th>
                  <th className="py-3.5 px-3 min-w-[140px]">TANGGAL</th>
                  <th className="py-3.5 px-3 min-w-[100px]">DIVISI</th>
                  <th className="py-3.5 px-3 min-w-[150px]">UNIT</th>
                  <th className="py-3.5 px-3 min-w-[110px]">NAMA</th>
                  <th className="py-3.5 px-3 min-w-[120px]">PANEL / PART</th>
                  <th className="py-3.5 px-3 min-w-[180px]">JOBDESC</th>
                  <th className="py-3.5 px-3 min-w-[220px]">KETERANGAN</th>
                  <th className="py-3.5 px-3 text-center">START</th>
                  <th className="py-3.5 px-3 text-center">ESTIMASI</th>
                  <th className="py-3.5 px-3 text-center">BREAK</th>
                  <th className="py-3.5 px-3 text-center">FINISH</th>
                  <th className="py-3.5 px-3 text-center">STATUS</th>
                  <th className="py-3.5 px-3 text-center text-[#eab308] font-black">TOTAL JAM KERJA</th>
                </tr>
              </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredRecords.map((r, idx) => {
                const matchedUnit = units.find(
                  (u) => u.unitName.trim().toUpperCase() === r.unit.trim().toUpperCase()
                );

                return (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-white/10 bg-black/15 transition-colors group text-gray-200"
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{r.tanggal}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] uppercase border border-amber-500/20">
                        {r.divisi}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {matchedUnit && onSelectUnit ? (
                        <button
                          onClick={() => onSelectUnit(matchedUnit)}
                          className="font-bold text-[#eab308] hover:underline text-left cursor-pointer flex items-center gap-1"
                        >
                          <Car className="w-3 h-3 shrink-0" />
                          <span>{r.unit}</span>
                        </button>
                      ) : (
                        <span className="font-bold text-gray-100">{r.unit}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-200">{r.nama}</td>
                    <td className="py-3 px-3 text-gray-300 font-medium">{r.panelPart || '-'}</td>
                    <td className="py-3 px-3 font-semibold text-white">{r.jobdesc}</td>
                    <td className="py-3 px-3 text-gray-300 leading-tight text-[11px]">{r.keterangan || '-'}</td>
                    <td className="py-3 px-3 font-mono text-center text-gray-300">{r.start || '-'}</td>
                    <td className="py-3 px-3 font-mono text-center text-gray-300">{r.estimasi || '-'}</td>
                    <td className="py-3 px-3 font-mono text-center text-gray-400">{r.breakTime || '-'}</td>
                    <td className="py-3 px-3 font-mono text-center text-gray-300">{r.finish || '-'}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(r.status)}`}>
                        {r.status || 'Done'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-black text-center text-[#eab308] text-sm">
                      {r.totalJamKerja || '0:00'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
