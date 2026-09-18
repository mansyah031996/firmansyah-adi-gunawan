import React, { useState, useEffect } from 'react';
import {
  Timer,
  Plus,
  Search,
  Printer,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Grid,
  ListFilter,
  Square,
  FileText,
  Link2,
  Check,
  RefreshCw,
  Calendar,
  Car
} from 'lucide-react';
import { ProjectUnit, SPLRecord } from '../types';
import { timeToDecimalHours } from '../utils/timeUtils';

interface SPLViewProps {
  records?: SPLRecord[];
  units?: ProjectUnit[];
  onRefresh?: () => void;
  isSyncing?: boolean;
}

interface SPLMatrixItem {
  unitId: string;
  unitName: string;
  yudha: boolean;
  aries: boolean;
  opik: boolean;
  pratama: boolean;
  taufik: boolean;
  bodyWork: boolean;
  bodyPaint: boolean;
  interior: boolean;
  chrome: boolean;
  bubut: boolean;
  overtimeHours: number;
  keterangan: string;
}

export const SPLView: React.FC<SPLViewProps> = ({ records = [], units = [], onRefresh, isSyncing }) => {
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#spl`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpl, setEditingSpl] = useState<SPLRecord | null>(null);

  // Initialize SPL Matrix state for all units based directly on spreadsheet data
  const [matrixData, setMatrixData] = useState<Record<string, SPLMatrixItem>>(() => {
    const initialMap: Record<string, SPLMatrixItem> = {};
    units.forEach((u) => {
      const isUrgent = u.status === 'URGENT DELIVERY';
      const isDelivered = u.status === 'DONE & DELIVERED';
      const isHold = u.status === 'PROGRESS HOLD';
      const isMargin = u.marginType === 'UNIT MARGIN';

      initialMap[u.id] = {
        unitId: u.id,
        unitName: u.unitName,
        yudha: u.teamLead === 'YUDHA',
        aries: u.teamLead === 'ARIES',
        opik: u.teamLead === 'OPIK' || u.teamLead === 'PRATAMA',
        pratama: u.teamLead === 'OPIK' || u.teamLead === 'PRATAMA',
        taufik: u.teamLead === 'TAUFIK',
        bodyWork: timeToDecimalHours(u.divisionHours.bodyWork) > 0,
        bodyPaint: timeToDecimalHours(u.divisionHours.bodyPaint) > 0,
        interior: timeToDecimalHours(u.divisionHours.interior) > 0,
        chrome: timeToDecimalHours(u.divisionHours.chrome) > 0,
        bubut: timeToDecimalHours(u.divisionHours.bubut) > 0,
        overtimeHours: isUrgent ? 8 : isDelivered ? 0 : 4,
        keterangan: isUrgent
          ? 'URGENT DELIVERY'
          : isDelivered
          ? 'DONE & DELIVERED'
          : isHold
          ? 'HOLD'
          : isMargin
          ? 'MARGIN'
          : 'NON MARGIN',
      };
    });
    return initialMap;
  });

  // SPL List initialized from records prop or passed records
  const [splList, setSplList] = useState<SPLRecord[]>(records);

  useEffect(() => {
    if (records && records.length > 0) {
      setSplList(records);
    }
  }, [records]);

  // Auto-sync from source on initial mount and periodic interval
  useEffect(() => {
    if (onRefresh) {
      onRefresh();
    }
    const interval = setInterval(() => {
      if (onRefresh) onRefresh();
    }, 120000);
    return () => clearInterval(interval);
  }, [onRefresh]);

  const [form, setForm] = useState<Partial<SPLRecord>>({
    splNumber: `SPL/2026/07/0${splList.length + 1}`,
    technicianName: '',
    unitName: units[0]?.unitName || '',
    teamLead: 'YUDHA',
    date: '30 Juli 2026',
    startTime: '17:00',
    endTime: '21:00',
    overtimeHours: 4,
    jobdesc: '',
    status: 'DISETUJUI',
  });

  const toggleCheck = (unitId: string, field: keyof SPLMatrixItem) => {
    setMatrixData((prev) => {
      const current = prev[unitId];
      if (!current) return prev;
      const newVal = typeof current[field] === 'boolean' ? !current[field] : current[field];
      const updated = {
        ...current,
        [field]: newVal,
      };
      if (field === 'opik') updated.pratama = newVal as boolean;
      if (field === 'pratama') updated.opik = newVal as boolean;
      return {
        ...prev,
        [unitId]: updated,
      };
    });
  };

  const filteredUnits = units.filter((u) => {
    const matchSearch =
      u.unitName.toLowerCase().includes(search.toLowerCase()) ||
      u.projectManager.toLowerCase().includes(search.toLowerCase()) ||
      u.teamLead.toLowerCase().includes(search.toLowerCase());
    const matchLead = selectedLead === 'ALL' || u.teamLead === selectedLead;
    return matchSearch && matchLead;
  });

  const isHeaderArtifact = (name: string) => {
    if (!name) return true;
    const upper = name.toUpperCase().trim();
    return (
      upper === '-' ||
      upper === 'NO.' ||
      upper === 'NO' ||
      upper === 'NAMA' ||
      upper === 'TEKNISI' ||
      upper.includes('STANLEY') ||
      upper.includes('RESTORATION') ||
      upper.includes('JOBDESC UTAMA') ||
      upper.includes('SURAT PERINTAH') ||
      upper.includes('TARGET AWAL') ||
      upper.includes('SISA TARGET')
    );
  };

  const validSplList = splList.filter((item) => !isHeaderArtifact(item.technicianName));

  const uniqueDates = Array.from(
    new Set(validSplList.map((s) => s.date || s.tanggal).filter(Boolean))
  );

  const filteredSpl = validSplList.filter((item) => {
    const itemDate = item.date || item.tanggal || '';
    const matchDate = selectedDate === 'ALL' || itemDate === selectedDate;

    const matchSearch =
      item.splNumber?.toLowerCase().includes(search.toLowerCase()) ||
      item.technicianName?.toLowerCase().includes(search.toLowerCase()) ||
      item.unitName?.toLowerCase().includes(search.toLowerCase()) ||
      item.panelPart?.toLowerCase().includes(search.toLowerCase()) ||
      item.jobdesc?.toLowerCase().includes(search.toLowerCase()) ||
      item.no?.toLowerCase().includes(search.toLowerCase()) ||
      itemDate.toLowerCase().includes(search.toLowerCase());
    const matchLead = selectedLead === 'ALL' || item.teamLead === selectedLead;
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchDate && matchSearch && matchLead && matchStatus;
  });

  const totalOvertimeHours = filteredSpl.reduce((sum, item) => sum + item.overtimeHours, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.technicianName || !form.unitName) return;

    if (editingSpl) {
      setSplList((prev) =>
        prev.map((s) => (s.id === editingSpl.id ? ({ ...s, ...form } as SPLRecord) : s))
      );
    } else {
      const newSpl: SPLRecord = {
        id: `spl-${Date.now()}`,
        splNumber: form.splNumber || `SPL/2026/07/0${splList.length + 1}`,
        technicianName: form.technicianName || 'Teknisi',
        unitName: form.unitName || '',
        teamLead: (form.teamLead as any) || 'YUDHA',
        date: form.date || '30 Juli 2026',
        startTime: form.startTime || '17:00',
        endTime: form.endTime || '21:00',
        overtimeHours: Number(form.overtimeHours) || 4,
        jobdesc: form.jobdesc || '',
        status: (form.status as any) || 'DISETUJUI',
      };
      setSplList([newSpl, ...splList]);
    }
    setIsModalOpen(false);
    setEditingSpl(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TABEL SPL SPREADSHEET (35 UNIT)
            </span>
            <span className="text-gray-300 text-xs font-mono">Surat Perintah Lembur Bengkel SM</span>
          </div>
          <h2 className="text-xl font-modern font-black text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-[#c5a059]" /> SURAT PERINTAH LEMBUR (SPL)
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Matriks & rekapitulasi lengkap persetujuan lembur kerja teknisi, alokasi jam lembur & SPV per unit.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block">TOTAL JAM LEMBUR</span>
            <span className="text-sm font-bold text-[#c5a059] font-mono">{totalOvertimeHours} Jam Kerja</span>
          </div>

          <div className="flex items-center bg-black/50 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matriks SPL</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Rincian Teknisi</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#172017] border border-emerald-500/40 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-300">
              Live Google Sheets (GID: 131205278)
            </span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Sinkronisasi ulang langsung dengan data sumber Google Sheets"
              className="px-3.5 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyingkronkan...' : 'Sinkron Data Sumber'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            title="Salin Link Direct ke Tab SPL Ini"
            className="px-3.5 py-2 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : <Link2 className="w-4 h-4 stroke-[2.5]" />}
            <span>{isCopied ? 'Link SPL Disalin!' : 'Salin Link Tab SPL'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#c5a059]" />
            <span>Cetak SPL</span>
          </button>

          <button
            onClick={() => {
              setEditingSpl(null);
              setForm({
                splNumber: `SPL/2026/07/0${splList.length + 1}`,
                technicianName: '',
                unitName: units[0]?.unitName || '',
                teamLead: 'YUDHA',
                date: '30 Juli 2026',
                startTime: '17:00',
                endTime: '21:00',
                overtimeHours: 4,
                jobdesc: '',
                status: 'DISETUJUI',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat SPL Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-black/30 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Unit / Teknisi / Jobdesc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/15 text-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 bg-black/50 border border-white/15 text-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
          >
            <option value="ALL">Semua Tanggal Lembur ({uniqueDates.length} Hari)</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
            className="w-full px-3 py-1.5 bg-black/50 border border-white/15 text-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
          >
            <option value="ALL">Semua Team Lead (KD)</option>
            <option value="YUDHA">YUDHA</option>
            <option value="ARIES">ARIES</option>
            <option value="OPIK">OPIK</option>
            <option value="TAUFIK">TAUFIK</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-black/50 border border-white/15 text-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#c5a059] cursor-pointer"
          >
            <option value="ALL">Semua Status SPL</option>
            <option value="DISETUJUI">DISETUJUI</option>
            <option value="SELESAI">SELESAI</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
      </div>

      {/* MATRIX VIEW FOR SPL */}
      {viewMode === 'matrix' ? (
        <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/60 backdrop-blur-sm text-gray-200 font-bold uppercase border-b border-white/10 text-[11px]">
                  <th className="py-3 px-3 border-r border-white/5 text-center w-12">NO.</th>
                  <th className="py-3 px-3 border-r border-white/5 text-center w-12">NO</th>
                  <th className="py-3 px-4 border-r border-white/5 min-w-[220px]">NAMA UNIT & PEMILIK</th>
                  <th colSpan={4} className="py-2 px-2 text-center border-r border-white/10 bg-white/[0.03] text-[#c5a059]">
                    TEAM LEAD SPV LEMBUR
                  </th>
                  <th colSpan={5} className="py-2 px-2 text-center border-r border-white/10 bg-white/[0.01] text-sky-400">
                    DIVISI PEKERJAAN LEMBUR
                  </th>
                  <th className="py-3 px-3 border-r border-white/5 text-center w-16">JAM</th>
                  <th className="py-3 px-4 text-center min-w-[140px]">KETERANGAN</th>
                </tr>

                <tr className="bg-black/70 backdrop-blur-sm text-gray-300 font-bold uppercase text-[10px] border-b border-white/10">
                  <th className="py-2 px-3 border-r border-white/5 text-center"></th>
                  <th className="py-2 px-3 border-r border-white/5 text-center"></th>
                  <th className="py-2 px-4 border-r border-white/5"></th>

                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[65px] text-[#c5a059]">YUDHA</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[65px] text-[#c5a059]">ARIES</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[65px] text-[#c5a059]">OPIK</th>
                  <th className="py-2 px-2 text-center border-r border-white/10 min-w-[65px] text-[#c5a059]">TAUFIK</th>

                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-sky-300">BODY WORK</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-sky-300">BODY PAINT</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-sky-300">INTERIOR</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[65px] text-sky-300">CHROME</th>
                  <th className="py-2 px-2 text-center border-r border-white/10 min-w-[65px] text-sky-300">BUBUT</th>

                  <th className="py-2 px-3 border-r border-white/5 text-center"></th>
                  <th className="py-2 px-4 text-center"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-gray-200 bg-transparent">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-8 text-center text-gray-400 italic">
                      Tidak ada unit yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u, idx) => {
                    const item = matrixData[u.id] || {
                      unitId: u.id,
                      unitName: u.unitName,
                      yudha: false,
                      aries: false,
                      opik: false,
                      pratama: false,
                      taufik: false,
                      bodyWork: false,
                      bodyPaint: false,
                      interior: false,
                      chrome: false,
                      bubut: false,
                      overtimeHours: 4,
                      keterangan: u.status,
                    };

                    const count =
                      (item.yudha ? 1 : 0) +
                      (item.aries ? 1 : 0) +
                      (item.opik || item.pratama ? 1 : 0) +
                      (item.taufik ? 1 : 0) +
                      (item.bodyWork ? 1 : 0) +
                      (item.bodyPaint ? 1 : 0) +
                      (item.interior ? 1 : 0) +
                      (item.chrome ? 1 : 0) +
                      (item.bubut ? 1 : 0);

                    return (
                      <tr key={u.id} className="hover:bg-white/10 bg-black/15 transition-colors">
                        <td className="py-2.5 px-3 border-r border-white/5 text-center text-gray-400 font-mono text-[11px]">
                          -
                        </td>
                        <td className="py-2.5 px-3 border-r border-white/5 text-center font-bold text-gray-300 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 border-r border-white/5 font-bold text-white text-xs">
                          {u.unitName}
                        </td>

                        {/* Team Lead Checkboxes */}
                        <td
                          onClick={() => toggleCheck(u.id, 'yudha')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.yudha ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-[#c5a059] text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'aries')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.aries ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-[#c5a059] text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'opik')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.opik || item.pratama ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-[#c5a059] text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'taufik')}
                          className="py-2.5 px-2 border-r border-white/10 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.taufik ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-[#c5a059] text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        {/* Division Checkboxes */}
                        <td
                          onClick={() => toggleCheck(u.id, 'bodyWork')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.bodyWork ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-sky-500 text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'bodyPaint')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.bodyPaint ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-sky-500 text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'interior')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.interior ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-purple-500 text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'chrome')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.chrome ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-pink-500 text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(u.id, 'bubut')}
                          className="py-2.5 px-2 border-r border-white/10 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.bubut ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-emerald-500 text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        {/* Overtime Hours */}
                        <td className="py-2.5 px-3 border-r border-white/5 text-center font-mono font-bold text-[#c5a059]">
                          {count === 0 ? '0:00' : `${count * 2} Jam`}
                        </td>

                        {/* Keterangan Badge */}
                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase border tracking-wider ${
                              item.keterangan === 'URGENT DELIVERY'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40'
                                : item.keterangan === 'DONE & DELIVERED'
                                ? 'bg-sky-950/60 text-sky-400 border-sky-500/40'
                                : item.keterangan === 'HOLD'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-500/40'
                                : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {item.keterangan}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TABLE VIEW FOR SPL TECHNICIANS */
        <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 backdrop-blur-sm text-gray-300 font-semibold uppercase border-b border-white/10">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No.</th>
                  <th className="py-3 px-4 min-w-[170px] text-[#c5a059]">Tanggal & Waktu Lembur</th>
                  <th className="py-3 px-3">No. SPL</th>
                  <th className="py-3 px-4">Nama Teknisi</th>
                  <th className="py-3 px-4">Unit Kendaraan Restorasi</th>
                  <th className="py-3 px-3">Panel / Part</th>
                  <th className="py-3 px-4 min-w-[220px]">Rincian Jobdesc Lembur</th>
                  <th className="py-3 px-3 text-center">Target Awal</th>
                  <th className="py-3 px-3 text-center">Sisa Target</th>
                  <th className="py-3 px-3 text-center">Durasi</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-200 bg-transparent">
                {filteredSpl.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-8 text-center text-gray-400 italic">
                      Tidak ditemukan Surat Perintah Lembur (SPL) yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredSpl.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-white/10 bg-black/15 transition-colors">
                      {/* No urut */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-400">
                        {s.no || idx + 1}
                      </td>

                      {/* Tanggal & Jam Lembur */}
                      <td className="py-3 px-4 text-gray-200 whitespace-nowrap bg-white/[0.01]">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>{s.date || s.tanggal}</span>
                        </div>
                        <div className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1 mt-0.5 pl-5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{s.startTime} - {s.endTime} WIB</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-[#c5a059] whitespace-nowrap">
                        {s.splNumber}
                      </td>

                      <td className="py-3 px-4 font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>{s.technicianName}</span>
                      </td>

                      <td className="py-3 px-4 text-gray-200 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-gray-400" />
                          <span>{s.unitName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-amber-300/90 font-medium text-[11px] whitespace-nowrap">
                        {s.panelPart || '-'}
                      </td>

                      <td className="py-3 px-4 text-gray-300 text-[11px] leading-snug">{s.jobdesc}</td>

                      <td className="py-3 px-3 text-center font-mono text-[11px] text-gray-300 whitespace-nowrap">
                        {s.targetAwal || s.targetHours || '-'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-[11px] text-amber-300/90 whitespace-nowrap">
                        {s.sisaTarget || s.actualHours || '-'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-[#c5a059] whitespace-nowrap">
                        {s.overtimeHours} Jam
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === 'DISETUJUI'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : s.status === 'SELESAI'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setEditingSpl(s);
                            setForm(s);
                            setIsModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[11px] font-medium border border-white/10 cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form SPL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-modern font-black text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <Timer className="w-5 h-5 text-[#c5a059]" />
              {editingSpl ? 'Edit Surat Perintah Lembur' : 'Form Pengajuan SPL Baru'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Nomor SPL</label>
                  <input
                    type="text"
                    required
                    value={form.splNumber || ''}
                    onChange={(e) => setForm({ ...form, splNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Nama Teknisi *</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: IQSAN / ASEP / KANDI"
                    value={form.technicianName || ''}
                    onChange={(e) => setForm({ ...form, technicianName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Unit Kendaraan *</label>
                  <select
                    value={form.unitName || ''}
                    onChange={(e) => setForm({ ...form, unitName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.unitName}>
                        {u.unitName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Panel / Part</label>
                  <input
                    type="text"
                    placeholder="misal: CATALOG PART / KABEL BODY / ENGINE"
                    value={form.panelPart || ''}
                    onChange={(e) => setForm({ ...form, panelPart: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Supervisor / KD</label>
                <select
                  value={form.teamLead || 'YUDHA'}
                  onChange={(e) => setForm({ ...form, teamLead: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                >
                  <option value="YUDHA">YUDHA</option>
                  <option value="ARIES">ARIES</option>
                  <option value="OPIK">OPIK</option>
                  <option value="TAUFIK">TAUFIK</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={form.date || ''}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Jam Mulai</label>
                  <input
                    type="text"
                    value={form.startTime || '17:00'}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Jam Selesai</label>
                  <input
                    type="text"
                    value={form.endTime || '21:00'}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Rincian Pekerjaan Lembur *</label>
                <textarea
                  required
                  rows={2}
                  value={form.jobdesc || ''}
                  onChange={(e) => setForm({ ...form, jobdesc: e.target.value })}
                  className="w-full p-2.5 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  placeholder="Detail pengerjaan lembur..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Durasi (Jam)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.overtimeHours || 4}
                    onChange={(e) => setForm({ ...form, overtimeHours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Status Persetujuan</label>
                  <select
                    value={form.status || 'DISETUJUI'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/10 text-white rounded-xl focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="DISETUJUI">DISETUJUI</option>
                    <option value="SELESAI">SELESAI</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl border border-white/10 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black font-extrabold rounded-xl shadow-lg cursor-pointer"
                >
                  Simpan SPL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
