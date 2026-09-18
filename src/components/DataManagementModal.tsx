import React, { useState, useEffect } from 'react';
import { X, Download, Upload, FileSpreadsheet, RotateCcw, Check, AlertCircle, RefreshCw, Link, Info, ExternalLink } from 'lucide-react';
import { ProjectUnit, DashboardTab } from '../types';
import { fetchGoogleSheetsData, SHEET_URL_STORAGE_KEY, extractSpreadsheetId, DEFAULT_SHEET_URL } from '../utils/googleSheetsSync';

interface DataManagementModalProps {
  isOpen: boolean;
  units: ProjectUnit[];
  activeTab?: DashboardTab;
  onClose: () => void;
  onUpdateUnits: (units: ProjectUnit[]) => void;
  onResetToDefault: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  units,
  activeTab,
  onClose,
  onUpdateUnits,
  onResetToDefault,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const savedUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || DEFAULT_SHEET_URL;
      setSheetUrl(savedUrl);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google Sheets Sync
  const handleSaveAndSyncGoogleSheet = async () => {
    if (!sheetUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Mohon masukkan URL Spreadsheet Google Sheets Anda.' });
      return;
    }

    const spreadsheetId = extractSpreadsheetId(sheetUrl);
    if (!spreadsheetId) {
      setStatusMessage({
        type: 'error',
        text: 'URL tidak valid. Pastikan link adalah Google Sheets (contoh: https://docs.google.com/spreadsheets/d/.../edit)',
      });
      return;
    }

    setIsSyncingSheet(true);
    setStatusMessage(null);

    try {
      const fetchedUnits = await fetchGoogleSheetsData(sheetUrl, activeTab);
      if (fetchedUnits && fetchedUnits.length > 0) {
        localStorage.setItem(SHEET_URL_STORAGE_KEY, sheetUrl.trim());
        onUpdateUnits(fetchedUnits);
        setStatusMessage({
          type: 'success',
          text: `Berhasil tersinkronisasi! Memuat ${fetchedUnits.length} unit proyek langsung dari Google Sheets.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Google Sheet berhasil dibaca, namun tidak ditemukan baris data unit yang valid.',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Gagal tersambung ke Google Sheets. Pastikan akses Google Sheet di-set "Anyone with the link can view".',
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  // Export as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(units, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Rekap_Jam_Kerja_Unit_SM_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export as CSV
  const handleExportCSV = () => {
    const headers = [
      'KEPALA PROYEK',
      'MARGIN TYPE',
      'UNIT',
      'UNIT IN',
      'KATEGORI PROGRESS',
      'KD UNIT',
      'MECHANIC',
      'BODY WORK',
      'BODY PAINT',
      'INTERIOR',
      'CHROME',
      'BUBUT',
      'TOTAL',
      'URUTAN TARGET DELIVERY',
      'STATUS',
      'TARGET UNIT DELIVERY',
    ];

    const rows = units.map((u) => [
      `"${u.projectManager}"`,
      `"${u.marginType}"`,
      `"${u.unitName}"`,
      `"${u.unitInDate}"`,
      `"${u.progressCategory}"`,
      `"${u.teamLead}"`,
      `"${u.divisionHours.mechanic}"`,
      `"${u.divisionHours.bodyWork}"`,
      `"${u.divisionHours.bodyPaint}"`,
      `"${u.divisionHours.interior}"`,
      `"${u.divisionHours.chrome}"`,
      `"${u.divisionHours.bubut}"`,
      `"${u.divisionHours.total}"`,
      `"${u.priorityOrder}"`,
      `"${u.status}"`,
      `"${u.targetDeliveryDate || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Jam_Kerja_Unit_SM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Import JSON
  const handleImportJSON = () => {
    try {
      if (!jsonText.trim()) {
        setStatusMessage({ type: 'error', text: 'Mohon tempel teks JSON terlebih dahulu.' });
        return;
      }
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdateUnits(parsed);
        setStatusMessage({ type: 'success', text: `Berhasil mengimpor ${parsed.length} unit proyek!` });
        setJsonText('');
      } else {
        setStatusMessage({ type: 'error', text: 'Format JSON tidak valid (harus berupa array unit proyek).' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Gagal membaca JSON: Sintaks tidak valid.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Kelola Script & Data Rekapitulasi</h3>
              <p className="text-xs text-gray-400">
                Export atau import data unit dalam format CSV / JSON untuk cadangan dan pembaruan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 text-xs">
          {/* Section: Official Synced Dashboard Link */}
          <div className="p-3.5 bg-gradient-to-r from-[#181818] to-[#0f0f0f] border border-[#c5a059]/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-inner">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Link Akses Dashboard Resmi:</span>
              </div>
              <a
                href="https://tinyurl.com/DASHBOARD-TEAM-CI"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#c5a059] hover:underline text-xs font-bold mt-0.5 inline-block"
              >
                https://tinyurl.com/DASHBOARD-TEAM-CI
              </a>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://tinyurl.com/DASHBOARD-TEAM-CI');
                  setStatusMessage({ type: 'success', text: 'Tautan resmi https://tinyurl.com/DASHBOARD-TEAM-CI berhasil disalin!' });
                }}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-[#c5a059]/15 hover:bg-[#c5a059]/25 text-[#c5a059] border border-[#c5a059]/30 rounded-lg font-bold transition-all cursor-pointer text-center text-[11px]"
              >
                Salin Link
              </button>
              <a
                href="https://tinyurl.com/DASHBOARD-TEAM-CI"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 rounded-lg font-medium transition-all text-center text-[11px] flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3 text-[#c5a059]" />
                <span>Buka</span>
              </a>
            </div>
          </div>

          {/* Section 1: Google Sheets Direct Integration */}
          <div className="space-y-3 bg-[#0a0a0a] p-4 rounded-xl border border-[#c5a059]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#c5a059]" />
                <h4 className="font-bold text-[#c5a059] uppercase tracking-wider text-[11px]">
                  1. Hubungkan Langsung Google Sheets (Auto Sync)
                </h4>
              </div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-[10px] text-gray-400 hover:text-[#c5a059] flex items-center gap-1 underline transition-colors cursor-pointer"
              >
                <Info className="w-3 h-3" />
                <span>{showInstructions ? 'Sembunyikan Cara' : 'Cara Setting Sheet'}</span>
              </button>
            </div>

            {showInstructions && (
              <div className="p-3 bg-black/50 border border-white/10 rounded-lg text-[11px] text-gray-300 space-y-2">
                <p className="font-semibold text-[#c5a059]">Langkah-langkah Menghubungkan Google Sheet Anda:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>
                    Buka file Google Sheet Anda di browser, klik tombol <strong className="text-white">Bagikan (Share)</strong> di kanan atas.
                  </li>
                  <li>
                    Ubah Akses Umum menjadi <strong className="text-white">"Siapa saja yang memiliki link" (Anyone with the link can view)</strong>.
                  </li>
                  <li>
                    Salin URL dari address bar browser Anda (atau klik <strong className="text-white">Salin Link</strong>).
                  </li>
                  <li>
                    Tempelkan URL tersebut pada kolom di bawah lalu klik <strong className="text-white">"Hubungkan & Sinkronkan"</strong>.
                  </li>
                </ol>
                <p className="text-[10px] text-gray-500 italic mt-1">
                  *Setelah terhubung, setiap kali Anda menekan tombol <span className="text-[#c5a059] font-bold">SINKRON</span> di header, dashboard akan otomatis mengambil data terbaru dari Google Sheet Anda!
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1xRRCdQG.../edit"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-gray-200 text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <button
                  onClick={handleSaveAndSyncGoogleSheet}
                  disabled={isSyncingSheet}
                  className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#d4af66] disabled:opacity-50 text-black font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                  <span>{isSyncingSheet ? 'Memuat...' : 'Hubungkan & Sinkron'}</span>
                </button>
              </div>
              {sheetUrl && extractSpreadsheetId(sheetUrl) && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <Check className="w-3 h-3" />
                  <span>ID Google Sheet terdeteksi: <code className="bg-black/40 px-1 py-0.5 rounded text-gray-300 font-mono">{extractSpreadsheetId(sheetUrl)}</code></span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Export Options */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
              2. Unduh / Export Data Saat Ini
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportCSV}
                className="p-3.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/5 hover:border-emerald-500/50 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left"
              >
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Download Format CSV</span>
                  <span className="text-[10px] text-gray-400">Untuk Microsoft Excel & Google Sheets</span>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="p-3.5 bg-[#0a0a0a] hover:bg-white/5 border border-white/5 hover:border-[#c5a059]/50 rounded-xl flex items-center gap-3 transition-all cursor-pointer group text-left"
              >
                <div className="p-2 bg-[#c5a059]/10 text-[#c5a059] rounded-lg group-hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">Download Format JSON</span>
                  <span className="text-[10px] text-gray-400">Data terstruktur untuk script/sistem</span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Import Textarea */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <h4 className="font-bold text-gray-200 uppercase tracking-wider text-[11px]">
              2. Import Data Baru (Teks Script JSON)
            </h4>
            <textarea
              rows={4}
              placeholder='Tempelkan array JSON unit proyek di sini... e.g. [{"unitName": "MB 300 D", ...}]'
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-3 bg-[#0a0a0a] border border-white/10 text-gray-200 font-mono text-[11px] rounded-xl focus:outline-none focus:border-[#c5a059] placeholder-gray-600"
            />
            <button
              onClick={handleImportJSON}
              className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#d4af66] text-[#0a0a0a] font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Data Ke Dashboard</span>
            </button>
          </div>

          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Section 3: Reset Data */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-300 block">Kembalikan Data Default</span>
              <span className="text-[10px] text-gray-500">Reset ke 35 unit data rekap awal SM 2023-2026.</span>
            </div>
            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengembalikan data ke set awal SM 2023-2026?')) {
                  onResetToDefault();
                  setStatusMessage({ type: 'success', text: 'Data telah di-reset ke set awal.' });
                }
              }}
              className="px-3 py-2 bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 border border-white/10 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
