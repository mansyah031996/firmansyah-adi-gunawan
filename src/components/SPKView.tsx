import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Printer,
  Square,
  Sparkles,
  ListFilter,
  Grid,
  Link2,
  Check,
  RefreshCw
} from 'lucide-react';
import { ProjectUnit, SPKRecord } from '../types';

interface SPKViewProps {
  records?: SPKRecord[];
  units?: ProjectUnit[];
  onRefresh?: () => void;
  isSyncing?: boolean;
}

export const SPKView: React.FC<SPKViewProps> = ({ records = [], units = [], onRefresh, isSyncing }) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCopied, setIsCopied] = useState(false);

  // Local state for SPK records to allow live interactive check toggling
  const [spkItems, setSpkItems] = useState<SPKRecord[]>(records);

  useEffect(() => {
    if (records) {
      setSpkItems(records);
    }
  }, [records]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#spk`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const toggleCheck = (id: string, field: keyof SPKRecord) => {
    setSpkItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newVal = !item[field];
          const updated = { ...item, [field]: newVal };
          if (field === 'opik') {
            updated.pratama = newVal;
          } else if (field === 'pratama') {
            updated.opik = newVal;
          }
          // Recalculate total check count
          const count =
            (updated.yudha ? 1 : 0) +
            (updated.aries ? 1 : 0) +
            (updated.opik || updated.pratama ? 1 : 0) +
            (updated.taufik ? 1 : 0) +
            (updated.bodyWork ? 1 : 0) +
            (updated.bodyPaint ? 1 : 0) +
            (updated.interior ? 1 : 0) +
            (updated.chrome ? 1 : 0) +
            (updated.bubut ? 1 : 0);
          updated.total = count;
          return updated;
        }
        return item;
      })
    );
  };

  // Filtered SPK items
  const filteredItems = spkItems.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.unitName.toLowerCase().includes(q) ||
      item.keterangan.toLowerCase().includes(q) ||
      item.no.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === 'ALL' ||
      item.keterangan.toUpperCase().trim() === statusFilter.toUpperCase().trim() ||
      (statusFilter === 'MARGIN' && item.keterangan.toUpperCase().includes('MARGIN')) ||
      (statusFilter === 'HOLD' && item.keterangan.toUpperCase().includes('HOLD'));

    return matchSearch && matchStatus;
  });

  // Calculate total assigned count
  const totalActiveSPK = filteredItems.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TABEL UTAMA MATRIKS SPK
            </span>
            <span className="text-gray-400 text-xs font-mono">{spkItems.length} Unit Matriks SPK (GID 622501492)</span>
          </div>
          <h2 className="text-xl font-modern font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#c5a059]" /> SURAT PERINTAH KERJA (SPK) TEAM LEAD & DIVISI
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Matriks checklist SPK penetapan Team Lead (Yudha, Aries, Opik, Taufik) & Alokasi Divisi Bengkel sinkron dengan Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#0a0a0a] px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block">TOTAL PENUGASAN SPK</span>
            <span className="text-sm font-bold text-[#c5a059] font-mono">{totalActiveSPK} SPK Aktif</span>
          </div>

          <div className="flex items-center bg-[#0a0a0a] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matriks SPK</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#c5a059] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Kartu Rincian</span>
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Sinkronisasi ulang langsung dengan data sumber Google Sheets"
              className="px-3.5 py-2 bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 text-[#c5a059] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyingkronkan...' : 'Sinkron Data Sumber'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            title="Salin Link Direct ke Tab SPK Ini"
            className="px-3.5 py-2 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : <Link2 className="w-4 h-4 stroke-[2.5]" />}
            <span>{isCopied ? 'Link SPK Disalin!' : 'Salin Link Tab SPK'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#c5a059]" />
            <span>Cetak SPK</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-black/30 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Unit / Keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/15 text-gray-200 text-xs rounded-xl focus:outline-none focus:border-[#c5a059]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-gray-300 font-semibold shrink-0">Filter Keterangan:</span>
          {['ALL', 'URGENT DELIVERY', 'MARGIN', 'NON MARGIN', 'HOLD'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                statusFilter === st
                  ? 'bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]'
                  : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* SPK Matrix Table View */}
      {viewMode === 'matrix' ? (
        <div className="bg-black/30 backdrop-blur-sm border border-white/15 rounded-2xl overflow-hidden shadow-2xl w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                {/* Main Header Grouping Row */}
                <tr className="bg-black/60 backdrop-blur-sm text-gray-200 font-bold uppercase border-b border-white/10 text-[11px]">
                  <th className="py-3 px-3 border-r border-white/5 text-center w-12">NO</th>
                  <th className="py-3 px-4 border-r border-white/5 min-w-[240px]">NAMA UNIT & PEMILIK</th>
                  <th colSpan={4} className="py-2 px-2 text-center border-r border-white/10 bg-white/[0.03] text-[#c5a059]">
                    TEAM LEAD (KD)
                  </th>
                  <th colSpan={5} className="py-2 px-2 text-center border-r border-white/10 bg-white/[0.01] text-sky-400">
                    DIVISI WORKSHOP
                  </th>
                  <th className="py-3 px-3 border-r border-white/5 text-center w-20">TOTAL</th>
                  <th className="py-3 px-4 text-center min-w-[150px]">KETERANGAN</th>
                </tr>

                {/* Sub Header Columns Row */}
                <tr className="bg-black/70 backdrop-blur-sm text-gray-300 font-bold uppercase text-[10px] border-b border-white/10">
                  <th className="py-2 px-3 border-r border-white/5 text-center"></th>
                  <th className="py-2 px-4 border-r border-white/5"></th>

                  {/* Team Leads */}
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-[#c5a059]">YUDHA</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-[#c5a059]">ARIES</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[70px] text-[#c5a059]">OPIK</th>
                  <th className="py-2 px-2 text-center border-r border-white/10 min-w-[70px] text-[#c5a059]">TAUFIK</th>

                  {/* Divisions */}
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[80px] text-sky-300">BODY WORK</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[80px] text-sky-300">BODY PAINT</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[80px] text-sky-300">INTERIOR</th>
                  <th className="py-2 px-2 text-center border-r border-white/5 min-w-[75px] text-sky-300">CHROME</th>
                  <th className="py-2 px-2 text-center border-r border-white/10 min-w-[75px] text-sky-300">BUBUT</th>

                  <th className="py-2 px-3 border-r border-white/5 text-center"></th>
                  <th className="py-2 px-4 text-center"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-gray-200 bg-transparent">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-8 text-center text-gray-400 italic">
                      Tidak ada unit yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => {
                    return (
                      <tr key={item.id || idx} className="hover:bg-white/10 bg-black/15 transition-colors">
                        <td className="py-2.5 px-3 border-r border-white/5 text-center font-bold text-gray-300 font-mono">
                          {item.no || idx + 1}
                        </td>
                        <td className="py-2.5 px-4 border-r border-white/5 font-bold text-white text-xs">
                          {item.unitName}
                        </td>

                        {/* Team Lead Checkboxes */}
                        <td
                          onClick={() => toggleCheck(item.id, 'yudha')}
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
                          onClick={() => toggleCheck(item.id, 'aries')}
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
                          onClick={() => toggleCheck(item.id, 'opik')}
                          className="py-2.5 px-2 border-r border-white/5 text-center cursor-pointer hover:bg-white/5 transition-colors"
                        >
                          {item.opik ?? item.pratama ? (
                            <div className="inline-flex items-center justify-center w-5 h-5 bg-[#c5a059] text-black font-extrabold rounded text-[11px] shadow-sm">
                              ✓
                            </div>
                          ) : (
                            <Square className="w-4 h-4 mx-auto text-gray-600 hover:text-gray-400" />
                          )}
                        </td>

                        <td
                          onClick={() => toggleCheck(item.id, 'taufik')}
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
                          onClick={() => toggleCheck(item.id, 'bodyWork')}
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
                          onClick={() => toggleCheck(item.id, 'bodyPaint')}
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
                          onClick={() => toggleCheck(item.id, 'interior')}
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
                          onClick={() => toggleCheck(item.id, 'chrome')}
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
                          onClick={() => toggleCheck(item.id, 'bubut')}
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

                        {/* Total Count */}
                        <td className="py-2.5 px-3 border-r border-white/5 text-center font-mono font-bold text-white text-sm">
                          {item.total}
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
                                : item.keterangan === 'NON MARGIN'
                                ? 'bg-gray-800/80 text-gray-300 border-gray-600/40'
                                : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {item.keterangan || 'MARGIN'}
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
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-[#141414] border border-white/5 p-4 rounded-2xl shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="font-bold text-white text-sm">{item.unitName}</h3>
                  <span className="text-[10px] font-mono text-[#c5a059] bg-[#c5a059]/10 px-2 py-0.5 rounded border border-[#c5a059]/20">
                    NO: {item.no}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Team Lead Assigned:</span>
                    <span className="font-bold text-[#c5a059]">
                      {[
                        item.yudha && 'YUDHA',
                        item.aries && 'ARIES',
                        (item.opik || item.pratama) && 'OPIK',
                        item.taufik && 'TAUFIK',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'Belum Ditentukan'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Divisi Aktif:</span>
                    <span className="font-bold text-sky-400">
                      {[
                        item.bodyWork && 'BODY WORK',
                        item.bodyPaint && 'BODY PAINT',
                        item.interior && 'INTERIOR',
                        item.chrome && 'CHROME',
                        item.bubut && 'BUBUT',
                      ]
                        .filter(Boolean)
                        .join(', ') || 'None'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Total SPK: <strong className="text-white font-mono">{item.total}</strong></span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-bold">
                    {item.keterangan || 'MARGIN'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

