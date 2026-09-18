import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Wrench,
  Hammer,
  Paintbrush,
  Armchair,
  Sparkles,
  Cog,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  Car,
  UserCheck,
  Filter,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
} from 'lucide-react';
import { ActualJobdescRecord, ProjectUnit } from '../types';
import { sumTimeStrings, timeToDecimalHours, formatTimeString, decToHHMM, calculateSisaTarget } from '../utils/timeUtils';

interface ActualJobdescAgustusViewProps {
  records: ActualJobdescRecord[];
  units: ProjectUnit[];
  onSelectUnit?: (unit: ProjectUnit) => void;
  monthLabel?: string;
}

export const ActualJobdescAgustusView: React.FC<ActualJobdescAgustusViewProps> = ({
  records,
  units,
  onSelectUnit,
  monthLabel = 'SEPTEMBER',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'log' | 'summary'>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');

  // Filtered Jobdesc Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUnit = r.unitName.toLowerCase().includes(q);
        const matchPersonil = r.personil.toLowerCase().includes(q);
        const matchJobdesc = r.jobdesc.toLowerCase().includes(q);
        const matchPanel = r.panelPart.toLowerCase().includes(q);
        const matchProses = r.proses.toLowerCase().includes(q);
        if (!matchUnit && !matchPersonil && !matchJobdesc && !matchPanel && !matchProses) {
          return false;
        }
      }

      // Team / Division filter
      if (teamFilter !== 'ALL') {
        const tf = teamFilter.toUpperCase();
        if (tf === 'MEKANIK') {
          if (!r.team.includes('MEKANIK') && !['YUDHA', 'PRATAMA', 'ARIES', 'TAUFIK'].includes(r.team.toUpperCase())) return false;
        } else if (!r.team.toUpperCase().includes(tf)) {
          return false;
        }
      }

      // Status Police Light filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'OK' && !r.statusEmoji.includes('👍')) return false;
        if (statusFilter === 'WARNING' && !r.statusEmoji.includes('⚠️')) return false;
        if (statusFilter === 'DELAY' && !r.statusEmoji.includes('😡')) return false;
      }

      // Unit filter
      if (unitFilter !== 'ALL' && r.unitName.trim().toUpperCase() !== unitFilter.trim().toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [records, searchQuery, teamFilter, statusFilter, unitFilter]);

  // Overall Totals & Stats
  const totalActualHoursStr = useMemo(() => {
    return sumTimeStrings(records.map((r) => r.actualHours || '0:00'));
  }, [records]);

  const totalTargetHoursStr = useMemo(() => {
    return sumTimeStrings(records.map((r) => r.targetHours || '0:00'));
  }, [records]);

  const totalSisaTargetHoursStr = useMemo(() => {
    return sumTimeStrings(records.map((r) => r.sisaTargetHours || r.targetHours || '0:00'));
  }, [records]);

  const statusCounts = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let delay = 0;
    records.forEach((r) => {
      if (r.statusEmoji.includes('👍')) ok++;
      else if (r.statusEmoji.includes('⚠️')) warning++;
      else if (r.statusEmoji.includes('😡')) delay++;
      else ok++;
    });
    return { ok, warning, delay };
  }, [records]);

  // Division Totals breakdown
  const divisionTotals = useMemo(() => {
    const summary = {
      mechanic: 0,
      bodyWork: 0,
      bodyPaint: 0,
      interior: 0,
      chrome: 0,
      bubut: 0,
    };

    records.forEach((r) => {
      const dec = timeToDecimalHours(r.actualHours || '0:00');
      const t = r.team.toUpperCase();
      if (t.includes('BODY WORK')) summary.bodyWork += dec;
      else if (t.includes('BODY PAINT')) summary.bodyPaint += dec;
      else if (t.includes('INTERIOR')) summary.interior += dec;
      else if (t.includes('CHROME')) summary.chrome += dec;
      else if (t.includes('BUBUT')) summary.bubut += dec;
      else summary.mechanic += dec;
    });

    return {
      mechanic: decToHHMM(summary.mechanic),
      bodyWork: decToHHMM(summary.bodyWork),
      bodyPaint: decToHHMM(summary.bodyPaint),
      interior: decToHHMM(summary.interior),
      chrome: decToHHMM(summary.chrome),
      bubut: decToHHMM(summary.bubut),
    };
  }, [records]);

  // Unique Unit Names list for dropdown
  const uniqueUnitNames = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.unitName.trim()));
    return Array.from(set).sort();
  }, [records]);

  // Aggregated Unit Breakdown for Summary tab
  const unitBreakdown = useMemo(() => {
    const map: Record<string, { mechanic: number; bodyWork: number; bodyPaint: number; interior: number; chrome: number; bubut: number; totalActual: number; targetSum: number; sisaTargetSum: number; count: number }> = {};

    records.forEach((r) => {
      const name = r.unitName.trim();
      if (!map[name]) {
        map[name] = { mechanic: 0, bodyWork: 0, bodyPaint: 0, interior: 0, chrome: 0, bubut: 0, totalActual: 0, targetSum: 0, sisaTargetSum: 0, count: 0 };
      }

      const decActual = timeToDecimalHours(r.actualHours || '0:00');
      const decTarget = timeToDecimalHours(r.targetHours || '0:00');
      const decSisaTarget = timeToDecimalHours(r.sisaTargetHours || r.targetHours || '0:00');
      const t = r.team.toUpperCase();

      if (t.includes('BODY WORK')) map[name].bodyWork += decActual;
      else if (t.includes('BODY PAINT')) map[name].bodyPaint += decActual;
      else if (t.includes('INTERIOR')) map[name].interior += decActual;
      else if (t.includes('CHROME')) map[name].chrome += decActual;
      else if (t.includes('BUBUT')) map[name].bubut += decActual;
      else map[name].mechanic += decActual;

      map[name].totalActual += decActual;
      map[name].targetSum += decTarget;
      map[name].sisaTargetSum += decSisaTarget;
      map[name].count += 1;
    });

    return Object.entries(map).map(([unitName, data]) => {
      const matchedUnit = units.find(
        (m) => m.unitName.trim().toUpperCase() === unitName.trim().toUpperCase()
      );

      const targetAwalStr = matchedUnit?.agustusTargetHours && matchedUnit.agustusTargetHours !== '0:00'
        ? matchedUnit.agustusTargetHours
        : (matchedUnit?.juliTargetHours && matchedUnit.juliTargetHours !== '0:00'
            ? matchedUnit.juliTargetHours
            : decToHHMM(data.targetSum));

      const sisaTargetStr = decToHHMM(data.sisaTargetSum);
      const totalRealStr = decToHHMM(data.totalActual);

      return {
        unitName,
        mechanic: decToHHMM(data.mechanic),
        bodyWork: decToHHMM(data.bodyWork),
        bodyPaint: decToHHMM(data.bodyPaint),
        interior: decToHHMM(data.interior),
        chrome: decToHHMM(data.chrome),
        bubut: decToHHMM(data.bubut),
        totalReal: totalRealStr,
        targetAwal: targetAwalStr,
        sisaTargetAwal: sisaTargetStr,
        count: data.count,
        matchedUnit,
      };
    }).sort((a, b) => timeToDecimalHours(b.targetAwal) - timeToDecimalHours(a.targetAwal));
  }, [records, units]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/30 backdrop-blur-sm border border-white/10 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 rounded-full">
              Data Resmi {monthLabel} 2026
            </span>
            <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> Terkoneksi Google Sheets
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-modern font-black text-white mt-1 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#c5a059]" />
            Actual Jobdesc {monthLabel} 2026
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Log pengerjaan harian teknisi, Target Awal, Sisa Target Awal, dan evaluasi Police Light bulan {monthLabel}.
          </p>
        </div>

        {/* View Sub-Tab Selector */}
        <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('log')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'log'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Log Jobdesc Harian ({records.length})
          </button>
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'summary'
                ? 'bg-[#c5a059] text-black shadow-md'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Rekap Target Unit ({unitBreakdown.length})
          </button>
        </div>
      </div>

      {/* Main Tab 1: Detailed Job Description Log Table */}
      {activeSubTab === 'log' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-4 rounded-xl space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama unit, personil, panel, atau job description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#c5a059] transition-colors"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Team / Division Filter */}
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value="ALL">Semua Divisi / Team</option>
                  <option value="MEKANIK">MEKANIK (Yudha / Pratama / Aries / Taufik)</option>
                  <option value="BODY WORK">BODY WORK</option>
                  <option value="BODY PAINT">BODY PAINT</option>
                  <option value="INTERIOR">INTERIOR</option>
                  <option value="CHROME">CHROME</option>
                  <option value="BUBUT">BUBUT</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#c5a059] cursor-pointer"
                >
                  <option value="ALL">Semua Status Police Light</option>
                  <option value="OK">👍 Sesuai Target</option>
                  <option value="WARNING">⚠️ Perhatian / Warning</option>
                  <option value="DELAY">😡 Delay / Over Target</option>
                </select>

                {/* Unit Filter */}
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-gray-300 focus:outline-none focus:border-[#c5a059] cursor-pointer max-w-[200px] truncate"
                >
                  <option value="ALL">Semua Unit Proyek</option>
                  {uniqueUnitNames.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
              <span>Menampilkan <strong className="text-white font-mono">{filteredRecords.length}</strong> dari {records.length} log harian</span>
              {(searchQuery || teamFilter !== 'ALL' || statusFilter !== 'ALL' || unitFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTeamFilter('ALL');
                    setStatusFilter('ALL');
                    setUnitFilter('ALL');
                  }}
                  className="text-[#c5a059] hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Jobdesc Table */}
          <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/60 backdrop-blur-sm border-b border-white/10 text-gray-300 uppercase tracking-wider text-[10px] select-none">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Tanggal & Team</th>
                    <th className="py-3 px-3">Personil</th>
                    <th className="py-3 px-3">Nama Unit Proyek</th>
                    <th className="py-3 px-3">Panel / Part</th>
                    <th className="py-3 px-3 min-w-[200px]">Job Description & Detail</th>
                    <th className="py-3 px-3 text-center text-[#c5a059] font-bold">Target Awal</th>
                    <th className="py-3 px-3 text-center text-emerald-400 font-bold">Jam Real</th>
                    <th className="py-3 px-3 text-center text-cyan-400 font-bold">Sisa Target Awal</th>
                    <th className="py-3 px-3 text-center">Jam Kerja</th>
                    <th className="py-3 px-3 text-center">Police Light</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {filteredRecords.map((r, idx) => {
                    const matchedUnit = units.find(
                      (u) => u.unitName.trim().toUpperCase() === r.unitName.trim().toUpperCase()
                    );

                    const sisaTargetStr = r.sisaTargetHours || r.targetHours;

                    return (
                      <tr
                        key={r.id || idx}
                        className="hover:bg-white/10 bg-black/15 transition-colors group text-gray-200"
                      >
                        <td className="py-3 px-3 font-mono text-[11px] text-gray-400">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-white block">{r.team}</span>
                          <span className="text-[10px] text-gray-400">{r.date}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-200">{r.personil}</span>
                        </td>
                        <td className="py-3 px-3">
                          {matchedUnit && onSelectUnit ? (
                            <button
                              onClick={() => onSelectUnit(matchedUnit)}
                              className="font-bold text-[#c5a059] hover:underline text-left cursor-pointer flex items-center gap-1"
                            >
                              <Car className="w-3 h-3 shrink-0" />
                              <span>{r.unitName}</span>
                            </button>
                          ) : (
                            <span className="font-semibold text-gray-200">{r.unitName}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-300 font-medium">{r.panelPart || '-'}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{r.jobdesc}</p>
                          {r.proses && r.proses !== r.jobdesc && (
                            <p className="text-[11px] text-gray-300 leading-tight mt-0.5">{r.proses}</p>
                          )}
                        </td>
                        {/* Target Awal */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-[#c5a059]">
                          {formatTimeString(r.targetHours)}
                        </td>
                        {/* Jam Real */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-emerald-400">
                          {formatTimeString(r.actualHours || '0:00')}
                        </td>
                        {/* Sisa Target Awal */}
                        <td className="py-3 px-3 font-mono font-bold text-center text-cyan-400">
                          {formatTimeString(sisaTargetStr)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-center text-gray-300">
                          {r.startTime && r.endTime ? `${r.startTime} - ${r.endTime}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {r.statusEmoji.includes('👍') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              👍 OK
                            </span>
                          )}
                          {r.statusEmoji.includes('⚠️') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              ⚠️ Warning
                            </span>
                          )}
                          {r.statusEmoji.includes('😡') && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              😡 Delay
                            </span>
                          )}
                          {!r.statusEmoji.includes('👍') && !r.statusEmoji.includes('⚠️') && !r.statusEmoji.includes('😡') && (
                            <span className="text-gray-400">{r.statusEmoji || '👍'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-gray-400">
                        Tidak ada data log jobdesc yang cocok dengan filter pencarian Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Rekap Jam Kerja Unit Bulan Agustus */}
      {activeSubTab === 'summary' && (
        <div className="space-y-4">
          <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#c5a059]" />
                  Rekapitulasi Target Awal & Sisa Target Awal Per Unit Proyek (Agustus 2026)
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Ringkasan alokasi Target Awal, Jam Real, dan Sisa Target Awal per unit proyek.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#c5a059]">
                {unitBreakdown.length} Unit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-black/60 backdrop-blur-sm border-b border-white/10 text-gray-300 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Nama Unit Proyek</th>
                    <th className="py-3 px-3 text-center">Log Job</th>
                    <th className="py-3 px-3 text-right text-blue-400">Mekanik</th>
                    <th className="py-3 px-3 text-right text-amber-400">Body Work</th>
                    <th className="py-3 px-3 text-right text-purple-400">Body Paint</th>
                    <th className="py-3 px-3 text-right text-emerald-400">Interior</th>
                    <th className="py-3 px-3 text-right text-pink-400">Chrome</th>
                    <th className="py-3 px-3 text-right text-cyan-400">Bubut</th>
                    <th className="py-3 px-3 text-right text-emerald-400 font-bold">Total Jam Real</th>
                    <th className="py-3 px-3 text-right text-[#c5a059] font-bold">Target Awal</th>
                    <th className="py-3 px-4 text-right text-cyan-400 font-bold">Sisa Target Awal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-transparent">
                  {unitBreakdown.map((u, idx) => {
                    return (
                      <tr key={u.unitName} className="hover:bg-white/10 bg-black/15 transition-colors text-gray-200">
                        <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3">
                          {u.matchedUnit && onSelectUnit ? (
                            <button
                              onClick={() => onSelectUnit(u.matchedUnit!)}
                              className="font-bold text-white hover:text-[#c5a059] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{u.unitName}</span>
                            </button>
                          ) : (
                            <span className="font-bold text-white">{u.unitName}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-gray-400">{u.count} item</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.mechanic}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.bodyWork}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.bodyPaint}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.interior}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.chrome}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-300">{u.bubut}</td>
                        {/* Total Jam Real */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          {u.totalReal}
                        </td>
                        {/* Target Awal */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#c5a059]">
                          {u.targetAwal}
                        </td>
                        {/* Sisa Target Awal */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400">
                          {u.sisaTargetAwal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
