import React, { useState } from 'react';
import { X, Plus, Trash2, Check, FileSpreadsheet, Sparkles, ExternalLink, RefreshCw, Layers, Search, CheckCircle } from 'lucide-react';
import { SHEET_TAB_GIDS, extractGid, DEFAULT_SHEET_URL, SHEET_URL_STORAGE_KEY, autoDiscoverAllSheetTabs } from '../utils/googleSheetsSync';

export interface CustomTabItem {
  id: string;
  name: string;
  gid: string;
  description?: string;
  isBuiltIn?: boolean;
}

export const PREDEFINED_SHEET_TABS: CustomTabItem[] = [
  { id: 'timeline', name: 'URUTAN UNIT DELIVERY', gid: '1940937859', description: 'Prioritas & Delivery Target Unit (Bulan Berjalan)', isBuiltIn: true },
  { id: 'target_september', name: 'TARGET PROJECT SEPTEMBER', gid: '938106022', description: 'Target Proyek Bulan September 2026 (Aktif Berjalan)', isBuiltIn: true },
  { id: 'actual_september', name: 'ACTUAL JOBDESC SEPTEMBER', gid: '292168166', description: 'Realisasi Pengerjaan & Jam Kerja September 2026 (Aktif Berjalan)', isBuiltIn: true },
  { id: 'hasil_kerja_september', name: 'HASIL KERJA SEPTEMBER', gid: '65933745', description: 'Tabel Rekapitulasi Hasil Kerja September 2026 (Aktif Berjalan)', isBuiltIn: true },
  { id: 'daftar_unit', name: 'DAFTAR UNIT', gid: '111152824', description: 'Daftar Semua Unit Restorasi', isBuiltIn: true },
  { id: 'hasil_kerja_2023_2026', name: 'HASIL KERJA 2023-2026', gid: '1768672018', description: 'Tabel Rekapitulasi Hasil Kerja Unit 2023 - 2026', isBuiltIn: true },
  { id: 'spk', name: 'SPK (Surat Kerja)', gid: '622501492', description: 'Form Surat Perintah Kerja Teknisi', isBuiltIn: true },
  { id: 'spl', name: 'SPL (Surat Lembur)', gid: '131205278', description: 'Surat Perintah Lembur Teknisi', isBuiltIn: true },
  
  // Historical Archives (Bulan yang sudah lewat)
  { id: 'target_agustus', name: 'TARGET PROJECT AGUSTUS (ARSIP)', gid: '1109052022', description: 'Arsip Target Proyek Bulan Agustus 2026' },
  { id: 'actual_agustus', name: 'ACTUAL JOBDESC AGUSTUS (ARSIP)', gid: '1662570265', description: 'Arsip Realisasi Pengerjaan & Jam Kerja Agustus' },
  { id: 'table', name: 'HASIL KERJA AGUSTUS (ARSIP)', gid: '1679857860', description: 'Arsip Tabel Rekapitulasi Hasil Kerja Agustus' },
  
  // Additional Available Tabs from Google Sheets Source
  { id: 'target_juli', name: 'TARGET PROJECT JULI', gid: '2077481871', description: 'Target Proyek Bulan Juli' },
  { id: 'target_juni', name: 'TARGET PROJECT JUNI', gid: '1704737199', description: 'Target Proyek Bulan Juni' },
  { id: 'hasil_kerja_juli', name: 'HASIL KERJA JULI', gid: '1780918669', description: 'Tabel Hasil Kerja Bulan Juli' },
  { id: 'hasil_kerja_juni', name: 'HASIL KERJA JUNI', gid: '2129035036', description: 'Tabel Hasil Kerja Bulan Juni' },
  { id: 'hasil_kerja_mei', name: 'HASIL KERJA MEI', gid: '1902599640', description: 'Tabel Hasil Kerja Bulan Mei' },
  { id: 'hasil_kerja_april', name: 'HASIL KERJA APRIL', gid: '15419753', description: 'Tabel Hasil Kerja Bulan April' },
  { id: 'database_unit', name: 'DATABASE UNIT SM', gid: '949361229', description: 'Database Lengkap Unit Restorasi SM' },
  { id: 'rekap_lembur', name: 'REKAP LEMBUR', gid: '1292075028', description: 'Rekapitulasi Jam Lembur All Divisi' },
  { id: 'audit_progres', name: 'AUDIT PROGRES JAM KERJA', gid: '519690305', description: 'Audit Jam Kerja All Divisi' },
  { id: 'cari_sparepart', name: 'CARI SPAREPART', gid: '1601396897', description: 'Katalog & Pencarian Sparepart Unit' },
  { id: 'spf_all_unit', name: 'SPF ALL UNIT', gid: '1944328788', description: 'Surat Perintah Kerja (SPF) All Unit' },
  { id: 'countdown', name: 'COUNTDOWN ALL UNIT', gid: '1795321936', description: 'Countdown & SLA Delivery Unit' },
];

interface ManageTabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTabIds: string[];
  onToggleTab: (tabId: string) => void;
  customTabs: CustomTabItem[];
  onAddCustomTab: (tab: CustomTabItem) => void;
  onDeleteCustomTab: (tabId: string) => void;
  onSelectTab: (tabId: string) => void;
}

export const ManageTabsModal: React.FC<ManageTabsModalProps> = ({
  isOpen,
  onClose,
  activeTabIds,
  onToggleTab,
  customTabs,
  onAddCustomTab,
  onDeleteCustomTab,
  onSelectTab,
}) => {
  const [newTabName, setNewTabName] = useState('');
  const [newTabGidOrUrl, setNewTabGidOrUrl] = useState('');
  const [newTabDesc, setNewTabDesc] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine predefined + user added custom tabs
  const allAvailableTabs = [
    ...PREDEFINED_SHEET_TABS,
    ...customTabs.filter((ct) => !PREDEFINED_SHEET_TABS.some((pt) => pt.id === ct.id)),
  ];

  const handleAutoScanTabs = async () => {
    setIsScanning(true);
    setErrorNotice(null);
    setScanNotice(null);

    const sheetUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || DEFAULT_SHEET_URL;

    try {
      const discovered = await autoDiscoverAllSheetTabs(sheetUrl);
      if (!discovered || discovered.length === 0) {
        setScanNotice('Tidak dapat membaca daftar tab secara otomatis. Silakan masukkan GID tab secara manual di bawah.');
        return;
      }

      let addedCount = 0;
      const addedNames: string[] = [];

      discovered.forEach((disc) => {
        const inPredefined = PREDEFINED_SHEET_TABS.find(
          (p) => p.gid === disc.gid || p.name.toUpperCase() === disc.name.toUpperCase()
        );
        const inCustom = customTabs.find(
          (c) => c.gid === disc.gid || c.name.toUpperCase() === disc.name.toUpperCase()
        );

        if (!inPredefined && !inCustom) {
          const newId = `custom_auto_${disc.gid}`;
          const newTab: CustomTabItem = {
            id: newId,
            name: disc.name.toUpperCase(),
            gid: disc.gid,
            description: `Tab otomatis dari Google Sheet (GID ${disc.gid})`,
            isBuiltIn: false,
          };
          onAddCustomTab(newTab);
          onToggleTab(newId);
          addedCount++;
          addedNames.push(disc.name.toUpperCase());
        } else if (inPredefined && inPredefined.gid === '0') {
          // Predefined with zero GID updated
          const newId = `custom_auto_${disc.gid}`;
          const newTab: CustomTabItem = {
            id: newId,
            name: disc.name.toUpperCase(),
            gid: disc.gid,
            description: `Tab ${disc.name} dari Google Sheet (GID ${disc.gid})`,
            isBuiltIn: false,
          };
          onAddCustomTab(newTab);
          onToggleTab(newId);
          addedCount++;
          addedNames.push(disc.name.toUpperCase());
        }
      });

      if (addedCount > 0) {
        setScanNotice(`✨ Berhasil menambahkan & mengaktifkan ${addedCount} tab baru: ${addedNames.join(', ')}`);
      } else {
        setScanNotice(`✅ Semua tab (${discovered.length} tab terdeteksi) di Google Sheet Anda sudah ada di daftar dashboard!`);
      }
    } catch (err: any) {
      setScanNotice('Gagal memindai otomatis. Anda tetap dapat memasukkan GID tab secara manual.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddNewTab = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!newTabName.trim()) {
      setErrorNotice('Nama Tab tidak boleh kosong.');
      return;
    }

    if (!newTabGidOrUrl.trim()) {
      setErrorNotice('Masukkan GID atau Link Google Sheet untuk Tab ini.');
      return;
    }

    // Extract GID
    let extractedGid = newTabGidOrUrl.trim();
    if (extractedGid.includes('http') || extractedGid.includes('gid=')) {
      extractedGid = extractGid(extractedGid);
    }

    if (!extractedGid || extractedGid === '0' && !newTabGidOrUrl.includes('gid=0')) {
      setErrorNotice('GID tidak valid. Contoh GID: 1109052022 atau tempelkan URL tab Google Sheets.');
      return;
    }

    const newId = `custom_${Date.now()}`;
    const newTab: CustomTabItem = {
      id: newId,
      name: newTabName.trim().toUpperCase(),
      gid: extractedGid,
      description: newTabDesc.trim() || `Tab Kustom Google Sheet (GID ${extractedGid})`,
      isBuiltIn: false,
    };

    onAddCustomTab(newTab);
    onToggleTab(newId);
    onSelectTab(newId);

    // Reset form
    setNewTabName('');
    setNewTabGidOrUrl('');
    setNewTabDesc('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#121212] border border-[#c5a059]/30 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c5a059]/10 rounded-xl border border-[#c5a059]/30">
              <Layers className="w-5 h-5 text-[#c5a059]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Kelola & Tambah Tab Google Sheets
              </h3>
              <p className="text-xs text-gray-400">
                Pilih tab yang ingin ditampilkan di dashboard atau tambahkan tab baru dari Google Spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Quick Auto-Scan Button */}
          <div className="p-4 bg-gradient-to-r from-[#c5a059]/20 via-[#c5a059]/10 to-transparent border border-[#c5a059]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#c5a059] text-black rounded-xl font-bold shrink-0">
                <RefreshCw className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  Deteksi Otomatis Tab Baru dari Google Sheet
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    REALTIME
                  </span>
                </h4>
                <p className="text-xs text-gray-300">
                  Pindai sheet sumber secara otomatis untuk mendeteksi tab baru (seperti September, Oktober, dll) tanpa perlu salin GID.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoScanTabs}
              disabled={isScanning}
              className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#d4af66] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Memindai Sheet...' : 'Pindai Tab Sekarang'}</span>
            </button>
          </div>

          {scanNotice && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{scanNotice}</span>
            </div>
          )}

          {/* Live Sync Notice */}
          <div className="p-3.5 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl text-xs text-[#c5a059] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-amber-200">Menambahkan Tab Secara Manual (Opsional):</strong>
              <p className="text-gray-300">
                Jika ingin memasukkan tab tertentu secara manual: Buka Google Sheet &gt; Klik tab yang diinginkan &gt; Copy link atau angka <code className="text-[#c5a059] font-mono">#gid=...</code> &gt; Masukkan pada formulir di bawah.
              </p>
            </div>
          </div>

          {/* Form Add Custom Tab */}
          <form onSubmit={handleAddNewTab} className="p-4 bg-[#0a0a0a] border border-white/10 rounded-xl space-y-3">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#c5a059]" /> Tambah Tab Baru dari Google Spreadsheet
            </h4>

            {errorNotice && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                {errorNotice}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Nama Tab Dashboard</label>
                <input
                  type="text"
                  placeholder="misal: TARGET SEPTEMBER"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">GID Tab / URL Spreadsheet</label>
                <input
                  type="text"
                  placeholder="misal: 1109052022 atau link tab URL"
                  value={newTabGidOrUrl}
                  onChange={(e) => setNewTabGidOrUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <input
                type="text"
                placeholder="Keterangan singkat (opsional)..."
                value={newTabDesc}
                onChange={(e) => setNewTabDesc(e.target.value)}
                className="w-full px-3 py-2 bg-[#141414] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#c5a059]"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black text-xs font-bold rounded-lg shrink-0 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Simpan Tab</span>
              </button>
            </div>
          </form>

          {/* Available Tabs List */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Daftar Tab Google Spreadsheet yang Tersedia ({allAvailableTabs.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allAvailableTabs.map((tab) => {
                const isActive = activeTabIds.includes(tab.id);
                const isCustom = !tab.isBuiltIn;

                return (
                  <div
                    key={tab.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-[#1a1810] border-[#c5a059]/50 shadow-md'
                        : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => onToggleTab(tab.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#c5a059] border-[#c5a059] text-black font-bold'
                            : 'border-gray-600 bg-transparent text-transparent hover:border-gray-400'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (!isActive) onToggleTab(tab.id);
                              onSelectTab(tab.id);
                              onClose();
                            }}
                            className="font-bold text-xs text-white hover:text-[#c5a059] truncate text-left transition-colors cursor-pointer"
                          >
                            {tab.name}
                          </button>
                          {isCustom && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">
                              Kustom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-500 block truncate font-mono">
                          GID: {tab.gid} {tab.description ? `• ${tab.description}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          if (!isActive) onToggleTab(tab.id);
                          onSelectTab(tab.id);
                          onClose();
                        }}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                        title="Buka Tab Ini"
                      >
                        Buka
                      </button>

                      {isCustom && (
                        <button
                          onClick={() => onDeleteCustomTab(tab.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Hapus Tab Kustom Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-mono text-[11px]">
            {activeTabIds.length} Tab Aktif di Dashboard
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
