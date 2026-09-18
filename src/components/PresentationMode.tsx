import React, { useState, useMemo } from 'react';
import {
  Printer,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Car,
  PieChart,
  UserCheck,
  TrendingUp,
  Sliders,
  Calendar,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  Target,
  ArrowUpRight,
  Flame,
  ChevronRight,
  Wrench
} from 'lucide-react';
import { ProjectUnit } from '../types';
import { calculateTotalDivisionHours, formatDecimalHours, formatTimeString, timeToDecimalHours } from '../utils/timeUtils';

interface PresentationModeProps {
  units: ProjectUnit[];
  allUnits?: ProjectUnit[];
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ units, allUnits }) => {
  // Navigation tabs: Default to 'urgent' as requested by user
  const [presentationSlide, setPresentationSlide] = useState<'urgent' | 'delivery2026' | 'divisions' | 'full'>('urgent');
  const [filter2026Status, setFilter2026Status] = useState<'all' | 'urgent' | 'done'>('all');

  // Master source units (prioritize units with status data)
  const masterList = useMemo(() => {
    return units && units.length > 0 ? units : (allUnits || []);
  }, [units, allUnits]);

  // 1. FILTER: Urgent Delivery Only (Ignoring Done & Delivered for the main presentation as requested)
  const urgentUnits = useMemo(() => {
    return masterList.filter((u) => u.status === 'URGENT DELIVERY');
  }, [masterList]);

  // Delivered units (kept only for 2026 archive view)
  const deliveredUnits = useMemo(() => {
    return masterList.filter((u) => u.status === 'DONE & DELIVERED');
  }, [masterList]);

  // 2. NEW VIEW: Units delivering in year 2026
  const delivered2026 = useMemo(() => {
    return masterList.filter((u) => u.targetDeliveryDate && u.targetDeliveryDate.includes('2026'));
  }, [masterList]);

  // All 2026 combined: delivered in 2026 + urgent targets for 2026
  const all2026Units = useMemo(() => {
    const map = new Map<string, ProjectUnit>();
    // Add delivered 2026 units
    delivered2026.forEach((u) => map.set(u.id, u));
    // Add urgent units (as they are the upcoming 2026 delivery targets)
    urgentUnits.forEach((u) => map.set(u.id, u));
    return Array.from(map.values());
  }, [delivered2026, urgentUnits]);

  // Filtered list for 2026 view based on sub-toggle
  const display2026Units = useMemo(() => {
    if (filter2026Status === 'urgent') {
      return all2026Units.filter((u) => u.status === 'URGENT DELIVERY');
    }
    if (filter2026Status === 'done') {
      return all2026Units.filter((u) => u.status === 'DONE & DELIVERED');
    }
    return all2026Units;
  }, [all2026Units, filter2026Status]);

  // Calculations for Urgent Units (ignoring Done & Delivered)
  const urgentTotals = useMemo(() => calculateTotalDivisionHours(urgentUnits), [urgentUnits]);
  const urgentDecHours = urgentTotals.decimalTotals.total || 1;

  // PM breakdown for urgent units
  const iqbalUrgent = urgentUnits.filter((u) => u.projectManager === 'IQBAL N');
  const fikiUrgent = urgentUnits.filter((u) => u.projectManager === 'FIKI');

  // Top urgent units sorted by total hours
  const topUrgentUnits = [...urgentUnits].sort(
    (a, b) => timeToDecimalHours(b.divisionHours.total) - timeToDecimalHours(a.divisionHours.total)
  );

  // Division calculations & percentages for Urgent Units
  const urgentDivisionsList = [
    { name: 'Mechanic', hours: urgentTotals.mechanic, dec: urgentTotals.decimalTotals.mechanic, color: 'from-[#c5a059] to-amber-600', textColor: 'text-[#c5a059]' },
    { name: 'Body Work', hours: urgentTotals.bodyWork, dec: urgentTotals.decimalTotals.bodyWork, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400' },
    { name: 'Body Paint', hours: urgentTotals.bodyPaint, dec: urgentTotals.decimalTotals.bodyPaint, color: 'from-purple-500 to-indigo-600', textColor: 'text-purple-400' },
    { name: 'Interior', hours: urgentTotals.interior, dec: urgentTotals.decimalTotals.interior, color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
    { name: 'Chrome', hours: urgentTotals.chrome, dec: urgentTotals.decimalTotals.chrome, color: 'from-pink-500 to-rose-600', textColor: 'text-pink-400' },
    { name: 'Bubut', hours: urgentTotals.bubut, dec: urgentTotals.decimalTotals.bubut, color: 'from-cyan-500 to-blue-600', textColor: 'text-cyan-400' },
  ];

  // 2026 calculations
  const totals2026 = useMemo(() => calculateTotalDivisionHours(all2026Units), [all2026Units]);

  // Grouped 2026 units by Month
  const juli2026Units = delivered2026.filter((u) => u.targetDeliveryDate?.toLowerCase().includes('juli'));
  const agustus2026Units = delivered2026.filter((u) => u.targetDeliveryDate?.toLowerCase().includes('agustus'));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto print:max-w-none print:p-0">
      {/* Executive Controls & View Switcher (Hidden on Print) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#141414]/90 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-2xl shadow-2xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Target Prioritas
            </span>
            <span className="text-xs text-gray-400 font-mono">Presentasi Eksekutif SM</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-1">
            <Target className="w-5 h-5 text-[#c5a059]" />
            Target Urgent Delivery & Roadmap 2026
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Menampilkan target unit <strong className="text-amber-400">Urgent Delivery</strong> saja (Done delivery diabaikan untuk fokus target kerja).
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Sub-slide Selector */}
          <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setPresentationSlide('urgent')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                presentationSlide === 'urgent'
                  ? 'bg-[#c5a059] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Urgent Delivery ({urgentUnits.length})
            </button>
            <button
              onClick={() => setPresentationSlide('delivery2026')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                presentationSlide === 'delivery2026'
                  ? 'bg-gradient-to-r from-amber-400 to-[#c5a059] text-black font-bold shadow-md'
                  : 'text-amber-300/80 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Delivery 2026 ({all2026Units.length})
            </button>
            <button
              onClick={() => setPresentationSlide('divisions')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                presentationSlide === 'divisions'
                  ? 'bg-[#c5a059] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Jam Divisi
            </button>
            <button
              onClick={() => setPresentationSlide('full')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                presentationSlide === 'full'
                  ? 'bg-[#c5a059] text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Lengkap
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-[#0a0a0a] font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-colors cursor-pointer shrink-0"
            title="Cetak Laporan Presentasi dalam format PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Slide Canvas Container */}
      <div className="bg-[#141414]/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Slide Header (Always visible) */}
        <div className="border-b border-white/10 print:border-slate-300 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 print:bg-slate-100 print:text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              EXECUTIVE PRESENTATION DECK · TARGET SELANJUTNYA BENGKEL SM
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <a
                href="https://tinyurl.com/DASHBOARD-TEAM-CI#presentation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c5a059] font-bold hover:underline print:hidden flex items-center gap-1 bg-black/40 px-2.5 py-0.5 rounded-lg border border-[#c5a059]/30"
              >
                <span>tinyurl.com/DASHBOARD-TEAM-CI</span>
              </a>
              <span className="text-gray-400 print:text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#c5a059]" /> UPDATE REALTIME BENGKEL SM 2026
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-modern font-black text-white print:text-slate-900 tracking-tight">
                {presentationSlide === 'delivery2026' ? 'ROADMAP & TARGET DELIVERY TAHUN 2026' : 'TARGET UTAMA: URGENT DELIVERY UNIT'}
              </h1>
              <p className="text-gray-400 print:text-slate-600 text-xs sm:text-sm mt-1">
                {presentationSlide === 'delivery2026'
                  ? 'Rekapitulasi target pengiriman kendaraan tahun 2026, realisasi bulan berjalan, & unit prioritas berikutnya.'
                  : 'Fokus pengiriman unit selanjutnya (Unit Done & Delivered diabaikan untuk konsentrasi eksekusi tim).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold text-xs font-mono">
                {urgentUnits.length} UNIT TARGET AKTIF
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: TARGET URGENT DELIVERY SLIDE (Visible on 'urgent' or 'full')   */}
        {/* ========================================================================= */}
        {(presentationSlide === 'urgent' || presentationSlide === 'full') && (
          <div className="space-y-6">
            {/* Top KPI Cards for Urgent Targets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-2 print:text-slate-800">
                  <Flame className="w-4 h-4 text-amber-400" /> RINGKASAN TARGET URGENT DELIVERY
                </h2>
                <span className="text-[11px] text-gray-400 italic">
                  *Unit dengan status Done & Delivered telah diabaikan dari rekapitulasi target
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0a0a0a]/80 print:bg-slate-100 p-4 rounded-xl border border-amber-500/30 print:border-slate-300">
                  <span className="text-xs text-gray-400 print:text-slate-600 block">Total Unit Urgent</span>
                  <span className="text-2xl font-bold text-amber-400 print:text-amber-700 mt-1 block">
                    {urgentUnits.length} Unit
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                    Target Penyerahan Segera
                  </span>
                </div>

                <div className="bg-[#0a0a0a]/80 print:bg-slate-100 p-4 rounded-xl border border-white/10 print:border-slate-300">
                  <span className="text-xs text-gray-400 print:text-slate-600 block">Total Akumulasi Jam</span>
                  <span className="text-2xl font-bold text-[#c5a059] print:text-slate-900 mt-1 block">
                    {formatDecimalHours(urgentTotals.decimalTotals.total)}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Rata-rata ~{Math.round(urgentTotals.decimalTotals.total / (urgentUnits.length || 1)).toLocaleString('id-ID')} jam/unit
                  </span>
                </div>

                <div className="bg-[#0a0a0a]/80 print:bg-slate-100 p-4 rounded-xl border border-white/10 print:border-slate-300">
                  <span className="text-xs text-gray-400 print:text-slate-600 block">Penanggung Jawab PM</span>
                  <span className="text-base font-bold text-white print:text-slate-900 mt-1 block">
                    IQBAL N ({iqbalUrgent.length}) · FIKI ({fikiUrgent.length})
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-1">
                    Kepala Proyek Bertanggungjawab
                  </span>
                </div>

                <div className="bg-[#0a0a0a]/80 print:bg-slate-100 p-4 rounded-xl border border-emerald-500/30 print:border-slate-300">
                  <span className="text-xs text-gray-400 print:text-slate-600 block">Status Eksekusi</span>
                  <span className="text-base font-bold text-emerald-400 print:text-emerald-700 mt-1 block">
                    FINAL INSPECTION
                  </span>
                  <span className="text-[10px] text-emerald-400/80 block mt-1">
                    Finishing & Quality Control
                  </span>
                </div>
              </div>
            </div>

            {/* Prominent Urgent Units Showcase Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-[#c5a059]" /> DAFTAR UNIT URGENT DELIVERY (PRIORITAS PENYERAHAN)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {urgentUnits.map((u, idx) => {
                  const uTotalDec = timeToDecimalHours(u.divisionHours.total) || 1;
                  return (
                    <div
                      key={u.id}
                      className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] print:bg-slate-50 p-5 rounded-2xl border border-amber-500/40 print:border-slate-300 shadow-xl space-y-3 relative overflow-hidden"
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-xs flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {u.priorityOrder || 'PRIORITAS 1'}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white font-mono">
                          {u.marginType}
                        </span>
                      </div>

                      {/* Unit Title */}
                      <div>
                        <h4 className="text-lg font-black text-white print:text-slate-900 tracking-tight">
                          {u.unitName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>PM: <strong className="text-white">{u.projectManager}</strong></span>
                          <span>·</span>
                          <span>KD: <strong className="text-[#c5a059]">{u.teamLead}</strong></span>
                          <span>·</span>
                          <span>Kategori: <strong className="text-gray-300">{u.progressCategory}</strong></span>
                        </div>
                      </div>

                      {/* Hours & Date Details */}
                      <div className="grid grid-cols-2 gap-2 bg-black/40 print:bg-slate-100 p-3 rounded-xl border border-white/5 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">TOTAL AKUMULASI JAM</span>
                          <strong className="text-base font-mono font-black text-[#c5a059] print:text-slate-900">
                            {formatTimeString(u.divisionHours.total)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block uppercase">TARGET DELIVERY</span>
                          <strong className="text-xs font-bold text-amber-300 print:text-amber-800">
                            {u.targetDeliveryDate || 'SEGERA (Q3/Q4 2026)'}
                          </strong>
                        </div>
                      </div>

                      {/* Division Workload Pills for this unit */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          DISTRIBUSI JAM DIVISI
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">MECH</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.mechanic)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">BODY WORK</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.bodyWork)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">PAINT</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.bodyPaint)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">INTERIOR</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.interior)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">CHROME</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.chrome)}</strong>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[9px] text-gray-500 block">BUBUT</span>
                            <strong className="text-gray-200">{formatTimeString(u.divisionHours.bubut)}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action plan footer note */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Siap diserahkan kepada klien
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">Urutan Unit Delivery</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: TAMPILAN BARU UNTUK DELIVERY TAHUN 2026 (Slide 'delivery2026') */}
        {/* ========================================================================= */}
        {(presentationSlide === 'delivery2026' || presentationSlide === 'full') && (
          <div className="space-y-6 pt-2">
            {/* 2026 Header Badge & Filter Switcher */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#c5a059]/15 to-emerald-500/10 p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#c5a059] text-black font-mono">
                  TAMPILAN KHUSUS DELIVERY 2026
                </span>
                <h3 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#c5a059]" />
                  Portofolio Pengiriman Kendaraan Tahun 2026
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Rekapitulasi unit yang telah dikirim (Done) dan unit prioritas mendesak (Urgent) di tahun 2026.
                </p>
              </div>

              {/* Status Filter for 2026 view */}
              <div className="flex items-center bg-[#0a0a0a] p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setFilter2026Status('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter2026Status === 'all'
                      ? 'bg-[#c5a059] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Semua 2026 ({all2026Units.length})
                </button>
                <button
                  onClick={() => setFilter2026Status('urgent')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter2026Status === 'urgent'
                      ? 'bg-amber-500 text-black'
                      : 'text-amber-400/80 hover:text-white'
                  }`}
                >
                  Target Urgent ({urgentUnits.length})
                </button>
                <button
                  onClick={() => setFilter2026Status('done')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    filter2026Status === 'done'
                      ? 'bg-emerald-500 text-black'
                      : 'text-emerald-400/80 hover:text-white'
                  }`}
                >
                  Selesai Dikirim ({delivered2026.length})
                </button>
              </div>
            </div>

            {/* 2026 Statistics KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0a0a0a]/80 p-4 rounded-xl border border-white/10">
                <span className="text-xs text-gray-400 block">Total Unit Tahun 2026</span>
                <span className="text-2xl font-bold text-white mt-1 block">{all2026Units.length} Unit</span>
                <span className="text-[10px] text-[#c5a059] block mt-1">Target & Realisasi 2026</span>
              </div>

              <div className="bg-[#0a0a0a]/80 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-gray-400 block">Telah Diserahterimakan (Done)</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{delivered2026.length} Unit</span>
                <span className="text-[10px] text-emerald-400/80 block mt-1">Selesai di Juli & Agustus 2026</span>
              </div>

              <div className="bg-[#0a0a0a]/80 p-4 rounded-xl border border-amber-500/30">
                <span className="text-xs text-gray-400 block">Target Selanjutnya (Urgent)</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">{urgentUnits.length} Unit</span>
                <span className="text-[10px] text-amber-400/80 block mt-1">Prioritas Delivery Mendatang</span>
              </div>

              <div className="bg-[#0a0a0a]/80 p-4 rounded-xl border border-white/10">
                <span className="text-xs text-gray-400 block">Total Jam Restorasi 2026</span>
                <span className="text-2xl font-bold text-[#c5a059] mt-1 block">
                  {formatDecimalHours(totals2026.decimalTotals.total)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">Akumulasi Jam Unit 2026</span>
              </div>
            </div>

            {/* Monthly Timeline Cards for 2026 */}
            <div className="space-y-4">
              {/* TARGET URGEN SELANJUTNYA 2026 */}
              {(filter2026Status === 'all' || filter2026Status === 'urgent') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5" /> TARGET URGENT DELIVERY BERIKUTNYA DI 2026
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({urgentUnits.length} Unit)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {urgentUnits.map((u) => (
                      <div
                        key={u.id}
                        className="bg-[#0a0a0a] p-4 rounded-xl border border-amber-500/30 space-y-2 hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-amber-400 flex items-center gap-1.5">
                            <Car className="w-4 h-4" /> {u.unitName}
                          </strong>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            URGENT
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 pt-1">
                          <div>
                            <span className="text-[10px] text-gray-500 block">PM / KD</span>
                            <span className="font-semibold">{u.projectManager} ({u.teamLead})</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 block">Total Jam Kerja</span>
                            <span className="font-mono font-bold text-[#c5a059]">{formatTimeString(u.divisionHours.total)}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-amber-300/90 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" /> Target Delivery: Segera (Target 2026)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REALISASI AGUSTUS 2026 */}
              {(filter2026Status === 'all' || filter2026Status === 'done') && agustus2026Units.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> REALISASI PENGIRIMAN AGUSTUS 2026
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({agustus2026Units.length} Unit Selesai & Diserahkan)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {agustus2026Units.map((u) => (
                      <div
                        key={u.id}
                        className="bg-[#0a0a0a] p-3.5 rounded-xl border border-white/10 space-y-2 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white truncate max-w-[180px]">
                            {u.unitName}
                          </strong>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            DELIVERED
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          PM: <strong className="text-gray-200">{u.projectManager} ({u.teamLead})</strong>
                        </div>
                        <div className="text-[11px] font-mono text-[#c5a059]">
                          Total Jam: <strong>{formatTimeString(u.divisionHours.total)}</strong>
                        </div>
                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {u.targetDeliveryDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REALISASI JULI 2026 */}
              {(filter2026Status === 'all' || filter2026Status === 'done') && juli2026Units.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> REALISASI PENGIRIMAN JULI 2026
                    </span>
                    <span className="text-xs text-gray-400 font-mono">({juli2026Units.length} Unit Selesai & Diserahkan)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {juli2026Units.map((u) => (
                      <div
                        key={u.id}
                        className="bg-[#0a0a0a] p-3.5 rounded-xl border border-white/10 space-y-2 hover:border-emerald-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-white truncate max-w-[180px]">
                            {u.unitName}
                          </strong>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            DELIVERED
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400">
                          PM: <strong className="text-gray-200">{u.projectManager} ({u.teamLead})</strong>
                        </div>
                        <div className="text-[11px] font-mono text-[#c5a059]">
                          Total Jam: <strong>{formatTimeString(u.divisionHours.total)}</strong>
                        </div>
                        <div className="text-[10px] text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {u.targetDeliveryDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: DIVISION WORKLOAD BREAKDOWN (Slide 'divisions' or 'full')      */}
        {/* ========================================================================= */}
        {(presentationSlide === 'divisions' || presentationSlide === 'full') && (
          <div className="space-y-4 pt-4 border-t border-white/10 print:border-slate-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-2 print:text-slate-800">
                <Clock className="w-4 h-4" /> ALOKASI JAM KERJA DIVISI (TARGET URGENT DELIVERY)
              </h2>
              <span className="text-[11px] text-gray-400">
                Total Alokasi: <strong className="text-white font-mono">{formatDecimalHours(urgentTotals.decimalTotals.total)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {urgentDivisionsList.map((div) => {
                const percent = Math.round((div.dec / urgentDecHours) * 100);
                return (
                  <div key={div.name} className="bg-[#0a0a0a]/80 print:bg-slate-100 p-4 rounded-xl border border-white/10 print:border-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 print:text-slate-600 font-bold">{div.name}</span>
                      <span className={`text-xs font-bold ${div.textColor}`}>{percent}% target</span>
                    </div>
                    <div className="text-xl font-bold text-white print:text-slate-900 font-mono">
                      {formatTimeString(div.hours)}
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${div.color}`}
                        style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: DETAILED SUMMARY TABLE (Slide 'full')                          */}
        {/* ========================================================================= */}
        {presentationSlide === 'full' && (
          <div className="space-y-4 pt-4 border-t border-white/10 print:border-slate-300">
            <h2 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-2 print:text-slate-800">
              <Award className="w-4 h-4 text-[#c5a059]" /> REKAP DETAIL JAM SELURUH TARGET URGENT
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-gray-400 uppercase font-semibold border-b border-white/10 text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Unit Kendaraan</th>
                    <th className="py-2.5 px-3">PM & KD</th>
                    <th className="py-2.5 px-3 text-right">Mechanic</th>
                    <th className="py-2.5 px-3 text-right">Body Work</th>
                    <th className="py-2.5 px-3 text-right">Paint</th>
                    <th className="py-2.5 px-3 text-right">Interior</th>
                    <th className="py-2.5 px-3 text-right">Total Jam</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-200">
                  {topUrgentUnits.map((u, index) => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">
                        <span className="text-amber-400 mr-1.5 font-mono">#{index + 1}</span> {u.unitName}
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-gray-300">{u.projectManager} ({u.teamLead})</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{formatTimeString(u.divisionHours.mechanic)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{formatTimeString(u.divisionHours.bodyWork)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{formatTimeString(u.divisionHours.bodyPaint)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-300">{formatTimeString(u.divisionHours.interior)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#c5a059]">
                        {formatTimeString(u.divisionHours.total)}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Notes */}
        <div className="pt-6 border-t border-white/10 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 print:text-slate-600">
          <span>Laporan Disusun Khusus Target Urgent Delivery & Roadmap 2026 · Bengkel SM</span>
          <span className="font-mono text-[10px]">Executive Deck v2.1 · Auto-Synced Google Sheets</span>
        </div>
      </div>
    </div>
  );
};
