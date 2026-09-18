import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  Search,
  Layers,
  Filter,
  FileSpreadsheet,
  Check,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { ProjectUnit } from '../types';
import { formatTimeString, parsePriorityRank, sumTimeStrings } from '../utils/timeUtils';
import { UnitLookupChart } from './UnitLookupChart';

interface DeliveryTimelineProps {
  units: ProjectUnit[];
  onSelectUnit: (unit: ProjectUnit) => void;
  onRefresh?: () => void;
  isSyncing?: boolean;
  lastSyncedAt?: string;
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  units,
  onSelectUnit,
  onRefresh,
  isSyncing,
  lastSyncedAt,
}) => {
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isRollMode, setIsRollMode] = useState<boolean>(true);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      setCurrentDateString(new Intl.DateTimeFormat('id-ID', options).format(now));
    };
    updateDate();
    const timer = setInterval(updateDate, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered units based on search query, section, and status filter
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        u.unitName.toLowerCase().includes(q) ||
        u.projectManager.toLowerCase().includes(q) ||
        u.teamLead.toLowerCase().includes(q) ||
        (u.priorityOrder || '').toLowerCase().includes(q) ||
        (u.status || '').toLowerCase().includes(q) ||
        (u.targetDeliveryDate || '').toLowerCase().includes(q);

      const sectionKey = `${u.projectManager}__${u.marginType}`;
      const matchSection =
        selectedSection === 'ALL' ||
        (selectedSection === 'IQBAL_MARGIN' && sectionKey === 'IQBAL N__UNIT MARGIN') ||
        (selectedSection === 'IQBAL_NON_MARGIN' && sectionKey === 'IQBAL N__UNIT NON MARGIN') ||
        (selectedSection === 'FIKI_MARGIN' && sectionKey === 'FIKI__UNIT MARGIN') ||
        (selectedSection === 'FIKI_NON_MARGIN' && sectionKey === 'FIKI__UNIT NON MARGIN');

      const matchStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'URGENT' && u.status === 'URGENT DELIVERY') ||
        (selectedStatusFilter === 'DONE' && u.status === 'DONE & DELIVERED') ||
        (selectedStatusFilter === 'MEDIUM' && u.status === 'OP MEDIUM PROGRES') ||
        (selectedStatusFilter === 'HOLD' && u.status === 'PROGRESS HOLD') ||
        (selectedStatusFilter === 'SLOW' && u.status === 'SLOW PROGRESS') ||
        (selectedStatusFilter === 'WAITING' && u.status === 'WAITING LIST');

      return matchQuery && matchSection && matchStatus;
    });
  }, [units, searchQuery, selectedSection, selectedStatusFilter]);

  // Specific groups according to Google Sheet GID 1940937859 sections
  const sections = useMemo(() => {
    return [
      {
        id: 'IQBAL_MARGIN',
        title: 'IQBAL N — UNIT MARGIN',
        subtitle: '16 Unit Restorasi Komersial / Margin',
        pm: 'IQBAL N',
        marginType: 'UNIT MARGIN',
        badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
        units: filteredUnits.filter(
          (u) => u.projectManager === 'IQBAL N' && u.marginType === 'UNIT MARGIN'
        ),
      },
      {
        id: 'IQBAL_NON_MARGIN',
        title: 'IQBAL N — UNIT NON MARGIN',
        subtitle: '2 Unit Internal / Non-Margin',
        pm: 'IQBAL N',
        marginType: 'UNIT NON MARGIN',
        badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
        units: filteredUnits.filter(
          (u) => u.projectManager === 'IQBAL N' && u.marginType === 'UNIT NON MARGIN'
        ),
      },
      {
        id: 'FIKI_MARGIN',
        title: 'FIKI — UNIT MARGIN',
        subtitle: '12 Unit Restorasi Komersial / Margin',
        pm: 'FIKI',
        marginType: 'UNIT MARGIN',
        badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
        units: filteredUnits.filter(
          (u) => u.projectManager === 'FIKI' && u.marginType === 'UNIT MARGIN'
        ),
      },
      {
        id: 'FIKI_NON_MARGIN',
        title: 'FIKI — UNIT NON MARGIN',
        subtitle: '7 Unit Internal / Non-Margin',
        pm: 'FIKI',
        marginType: 'UNIT NON MARGIN',
        badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
        units: filteredUnits.filter(
          (u) => u.projectManager === 'FIKI' && u.marginType === 'UNIT NON MARGIN'
        ),
      },
    ];
  }, [filteredUnits]);

  // Urgent Units
  const urgentUnits = useMemo(
    () =>
      units
        .filter((u) => u.status === 'URGENT DELIVERY')
        .sort((a, b) => parsePriorityRank(a.priorityOrder) - parsePriorityRank(b.priorityOrder)),
    [units]
  );

  // Units with explicitly set Target Delivery Dates
  const targetDateUnits = useMemo(
    () => units.filter((u) => u.targetDeliveryDate && u.targetDeliveryDate.trim() !== ''),
    [units]
  );

  // Delivered Units
  const deliveredUnits = useMemo(
    () => units.filter((u) => u.status === 'DONE & DELIVERED'),
    [units]
  );

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DONE & DELIVERED':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'URGENT DELIVERY':
        return 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/40 font-bold';
      case 'OP MEDIUM PROGRES':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'REGULAR PROGRES':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'SLOW PROGRESS':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'PROGRESS HOLD':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'WAITING LIST':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  // Helper for Priority Badge
  const getPriorityBadge = (priority: string) => {
    if (!priority || priority === '-') return <span className="text-gray-500 text-xs">-</span>;
    if (priority.toUpperCase().includes('PRIORITAS 1')) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
          {priority}
        </span>
      );
    }
    if (priority.toUpperCase().includes('PRIORITAS 2')) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30">
          {priority}
        </span>
      );
    }
    if (priority.toUpperCase().includes('PRIORITAS 3')) {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
          {priority}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide bg-white/10 text-gray-300 border border-white/15">
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Interactive Dropdown Header Table & Pie Chart Diagram */}
      <UnitLookupChart units={units} onSelectUnit={onSelectUnit} />

      {/* Delivery Summary Banner & Live Automation Status */}
      <div className="bg-[#141414] p-6 rounded-2xl border border-[#c5a059]/20 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> URUTAN UNIT DELIVERY
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SINKRON OTOMATIS: GOOGLE SHEET (GID: 1940937859)
            </span>
            {currentDateString && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#c5a059]" /> REALTIME: {currentDateString}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Urutan Unit Delivery — Data Sumber Bengkel SM
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-3xl">
            Tabel rekapitulasi 37 unit restorasi (Unit Margin & Non Margin) lengkap dengan pembagian kepala proyek (Iqbal N & Fiki), jam kerja per divisi, progress %, urutan prioritas target delivery, dan jadwal serah terima kendaraan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-[#0a0a0a] px-3.5 py-2 rounded-xl border border-white/10 text-center min-w-[80px]">
            <span className="text-xl font-bold text-white">{units.length}</span>
            <span className="block text-[10px] text-gray-400">Total Unit</span>
          </div>
          <div className="bg-[#0a0a0a] px-3.5 py-2 rounded-xl border border-[#c5a059]/30 text-center min-w-[80px]">
            <span className="text-xl font-bold text-[#c5a059]">{urgentUnits.length}</span>
            <span className="block text-[10px] text-gray-400">Urgent Delivery</span>
          </div>
          <div className="bg-[#0a0a0a] px-3.5 py-2 rounded-xl border border-emerald-500/30 text-center min-w-[80px]">
            <span className="text-xl font-bold text-emerald-400">{deliveredUnits.length}</span>
            <span className="block text-[10px] text-gray-400">Selesai/Deliver</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/40 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
              title="Perbarui data langsung dari Google Sheet GID 1940937859"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sumber'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Control Bar */}
      <div className="bg-[#141414] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama unit, PM, KD, status..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-white/15 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        {/* Section and Status Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <span className="text-[11px] text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#c5a059]" /> Filter Bagian:
          </span>
          <button
            onClick={() => setSelectedSection('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedSection === 'ALL'
                ? 'bg-[#c5a059] text-black border-[#c5a059]'
                : 'bg-[#0a0a0a] text-gray-300 border-white/10 hover:border-white/20'
            }`}
          >
            Semua ({units.length})
          </button>
          <button
            onClick={() => setSelectedSection('IQBAL_MARGIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedSection === 'IQBAL_MARGIN'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-[#0a0a0a] text-gray-300 border-white/10 hover:border-blue-500/40'
            }`}
          >
            Iqbal Margin (16)
          </button>
          <button
            onClick={() => setSelectedSection('IQBAL_NON_MARGIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedSection === 'IQBAL_NON_MARGIN'
                ? 'bg-amber-500 text-black border-amber-500'
                : 'bg-[#0a0a0a] text-gray-300 border-white/10 hover:border-amber-500/40'
            }`}
          >
            Iqbal Non-Margin (2)
          </button>
          <button
            onClick={() => setSelectedSection('FIKI_MARGIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedSection === 'FIKI_MARGIN'
                ? 'bg-cyan-500 text-black border-cyan-500'
                : 'bg-[#0a0a0a] text-gray-300 border-white/10 hover:border-cyan-500/40'
            }`}
          >
            Fiki Margin (12)
          </button>
          <button
            onClick={() => setSelectedSection('FIKI_NON_MARGIN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedSection === 'FIKI_NON_MARGIN'
                ? 'bg-emerald-500 text-black border-emerald-500'
                : 'bg-[#0a0a0a] text-gray-300 border-white/10 hover:border-emerald-500/40'
            }`}
          >
            Fiki Non-Margin (7)
          </button>

          {/* Roll Mode Toggle */}
          <button
            onClick={() => setIsRollMode((prev) => !prev)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1 ml-1 ${
              isRollMode
                ? 'bg-white/15 text-white border-white/30'
                : 'bg-[#0a0a0a] text-gray-400 border-white/10'
            }`}
            title="Aktifkan tampilan roll khusus dengan header tetap (sticky header)"
          >
            <Layers className="w-3 h-3" />
            <span>{isRollMode ? 'Roll Khusus: Aktif' : 'Roll: Nonaktif'}</span>
          </button>
        </div>
      </div>

      {/* MASTER DATA TABLE - MATCHING GOOGLE SHEETS GID 1940937859 */}
      <div className="space-y-6">
        {sections
          .filter((section) => section.units.length > 0)
          .map((section) => (
            <div
              key={section.id}
              className="bg-[#141414] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Section Header */}
              <div className="p-4 bg-black/50 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${section.badgeColor}`}>
                    {section.title}
                  </span>
                  <span className="text-xs text-gray-400">{section.subtitle}</span>
                </div>
                <div className="text-xs text-gray-300 bg-black/60 px-3 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
                  Tampil: <strong className="text-[#c5a059]">{section.units.length}</strong> Unit
                </div>
              </div>

              {/* Table with Roll Khusus */}
              <div className={isRollMode ? 'max-h-[500px] overflow-y-auto overflow-x-auto relative' : 'overflow-x-auto'}>
                <table className="w-full text-left text-xs border-collapse min-w-[1200px]">
                  <thead className="bg-[#0f0f0f] text-gray-300 uppercase tracking-wider font-semibold border-b border-white/10 sticky top-0 z-20 shadow-md">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">NO</th>
                      <th className="py-2.5 px-3 min-w-[100px]">KEPALA PROYEK</th>
                      <th className="py-2.5 px-3 min-w-[200px]">UNIT</th>
                      <th className="py-2.5 px-3 min-w-[100px]">UNIT IN</th>
                      <th className="py-2.5 px-3 min-w-[110px]">KATEGORI</th>
                      <th className="py-2.5 px-3 min-w-[80px]">KD UNIT</th>
                      <th className="py-2.5 px-2.5 text-right">MECHANIC</th>
                      <th className="py-2.5 px-2.5 text-right">BODY WORK</th>
                      <th className="py-2.5 px-2.5 text-right">BODY PAINT</th>
                      <th className="py-2.5 px-2.5 text-right">INTERIOR</th>
                      <th className="py-2.5 px-2.5 text-right">CHROME</th>
                      <th className="py-2.5 px-2.5 text-right">BUBUT</th>
                      <th className="py-2.5 px-3 text-right bg-[#c5a059]/10 text-[#c5a059] font-bold">TOTAL</th>
                      <th className="py-2.5 px-2.5 text-center">% PROG</th>
                      <th className="py-2.5 px-3 text-center min-w-[130px]">URUTAN TARGET</th>
                      <th className="py-2.5 px-3 text-center min-w-[140px]">STATUS</th>
                      <th className="py-2.5 px-3 text-center min-w-[170px] bg-amber-500/10 text-amber-300 font-bold">
                        TARGET UNIT DELIVERY
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {section.units.map((unit, index) => {
                      const isUrgent = unit.status === 'URGENT DELIVERY';
                      const isDelivered = unit.status === 'DONE & DELIVERED';
                      const hasTargetDate = !!unit.targetDeliveryDate;

                      return (
                        <tr
                          key={unit.id}
                          onClick={() => onSelectUnit(unit)}
                          className={`hover:bg-white/5 transition-colors cursor-pointer group ${
                            isUrgent ? 'bg-[#c5a059]/5' : isDelivered ? 'bg-emerald-500/5' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-gray-500 font-mono text-[11px]">
                            {unit.sheetNo || index + 1}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-gray-200">
                            {unit.projectManager}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <Car className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                              <span className="font-bold text-white group-hover:text-[#c5a059] transition-colors">
                                {unit.unitName}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">
                            {unit.unitInDate || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                unit.progressCategory === 'FULL RESTORE'
                                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {unit.progressCategory}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-200 border border-white/10">
                              {unit.teamLead}
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.mechanic)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.bodyWork)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.bodyPaint)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.interior)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.chrome)}
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-mono text-gray-300">
                            {formatTimeString(unit.divisionHours.bubut)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#c5a059] bg-[#c5a059]/10">
                            {formatTimeString(unit.divisionHours.total)}
                          </td>
                          <td className="py-2.5 px-2.5 text-center font-mono text-gray-400 text-[11px]">
                            {unit.progressPercent ? (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 font-bold text-gray-300">
                                {unit.progressPercent}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {getPriorityBadge(unit.priorityOrder)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getStatusBadge(
                                unit.status
                              )}`}
                            >
                              {unit.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {hasTargetDate ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                                <Calendar className="w-3 h-3 text-[#c5a059]" />
                                {unit.targetDeliveryDate}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      {/* Grid Section: Urgent Deliveries & Scheduled Dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Urgent Delivery Queue */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#c5a059]" />
              Daftar Prioritas Urgent Delivery
            </h3>
            <span className="text-xs font-bold text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
              {urgentUnits.length} Unit
            </span>
          </div>

          <div className="space-y-3">
            {urgentUnits.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className="bg-[#0a0a0a] hover:bg-white/5 p-4 rounded-xl border border-[#c5a059]/30 cursor-pointer transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 mb-1">
                      {u.priorityOrder || 'URGENT'}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors">
                      {u.unitName}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono font-bold text-[#c5a059]">
                      {formatTimeString(u.divisionHours.total)}
                    </span>
                    <span className="block text-[10px] text-gray-500">Total Jam</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 pt-2 border-t border-white/5 mt-2">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">KEPALA PROYEK</span>
                    <p className="font-semibold">{u.projectManager} ({u.teamLead})</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">TARGET DELIVERY</span>
                    <p className="font-semibold text-[#c5a059]">
                      {u.targetDeliveryDate || 'Belum Dijadwalkan'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Target Dates Cards */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c5a059]" />
              Jadwal Target Delivery Unit Specific
            </h3>
            <span className="text-xs font-bold text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20">
              {targetDateUnits.length} Unit
            </span>
          </div>

          <div className="space-y-3">
            {targetDateUnits.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className="bg-[#0a0a0a] hover:bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/10 cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors">
                      {u.unitName}
                    </h4>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span>PM: {u.projectManager}</span>
                      <span>·</span>
                      <span className="text-gray-300">{u.status}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-[#c5a059]/15 text-[#c5a059] font-bold text-xs rounded-full border border-[#c5a059]/30">
                    {u.targetDeliveryDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Done & Delivered Milestones */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Rekap Unit Selesai & Terkirim (Done & Delivered)
          </h3>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {deliveredUnits.length} Unit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deliveredUnits.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUnit(u)}
              className="bg-[#0a0a0a] hover:bg-white/5 p-3.5 rounded-xl border border-emerald-500/20 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {u.unitName}
                </h4>
                <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Total Jam:</span>
                  <strong className="text-[#c5a059] font-mono">{formatTimeString(u.divisionHours.total)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Kepala Proyek:</span>
                  <strong className="text-gray-200">{u.projectManager} ({u.teamLead})</strong>
                </div>
                {u.targetDeliveryDate && (
                  <div className="flex justify-between text-emerald-400 font-medium pt-1 border-t border-white/5">
                    <span>Tanggal Delivered:</span>
                    <span>{u.targetDeliveryDate}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
