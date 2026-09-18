import React, { useState, useEffect } from 'react';
import {
  Menu,
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Link2,
  ExternalLink,
  Check,
  Search,
  X,
  Radio
} from 'lucide-react';
import { DashboardTab, FilterState, ProjectUnit } from '../types';
import { SMLogo } from './SMLogo';
import { fetchGoogleSheetsData, SHEET_URL_STORAGE_KEY, DEFAULT_SHEET_URL, OFFICIAL_DASHBOARD_URL } from '../utils/googleSheetsSync';

interface HeaderProps {
  activeTab: DashboardTab;
  onToggleSidebar: () => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  filteredCount: number;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenManageTabs?: () => void;
  onUpdateUnits?: (units: ProjectUnit[]) => void;
  onSyncData?: () => Promise<void> | void;
  lastSyncedAt?: string;
  isAutoSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleSidebar,
  filters,
  setFilters,
  totalCount,
  filteredCount,
  onOpenAddModal,
  onOpenDataModal,
  onOpenManageTabs,
  onUpdateUnits,
  onSyncData,
  lastSyncedAt,
  isAutoSyncing,
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showQuickSearch, setShowQuickSearch] = useState<boolean>(false);

  // Live WIB clock & Indonesian full date update
  useEffect(() => {
    const updateClockAndDate = () => {
      const now = new Date();
      
      // Time string HH:mm:ss WIB
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeString(`${hours}:${minutes}:${seconds} WIB`);

      // Date string Hari, DD MMMM YYYY
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      const formattedDate = new Intl.DateTimeFormat('id-ID', options).format(now);
      setDateString(formattedDate);
    };

    updateClockAndDate();
    const interval = setInterval(updateClockAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSinkron = async () => {
    const savedUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || DEFAULT_SHEET_URL;
    setIsSyncing(true);
    setSyncNotice(null);

    try {
      if (onSyncData) {
        await onSyncData();
        setSyncNotice(`✨ Berhasil! Data tab ${getTabTitle(activeTab)} disinkronkan langsung dari Google Sheets.`);
      } else if (onUpdateUnits) {
        const fetchedUnits = await fetchGoogleSheetsData(savedUrl, activeTab);
        if (fetchedUnits && fetchedUnits.length > 0) {
          onUpdateUnits(fetchedUnits);
          localStorage.setItem(SHEET_URL_STORAGE_KEY, savedUrl);
          setSyncNotice(`✨ Berhasil! ${fetchedUnits.length} unit disinkronkan langsung dari Google Sheets.`);
        } else {
          setSyncNotice('⚠️ Google Sheets terhubung, namun tidak ada data unit yang dibaca.');
        }
      }
    } catch (err: any) {
      setSyncNotice(`⚠️ Gagal sinkron: ${err.message || 'Periksa koneksi / link Google Sheets Anda.'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncNotice(null), 5000);
    }
  };

  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'timeline':
        return 'Urutan Unit Delivery & Prioritas';
      case 'overview':
        return 'Target Project Juli';
      case 'target_agustus':
        return 'Target Project Agustus';
      case 'actual_agustus':
        return 'Actual Jobdesc Agustus';
      case 'divisions':
        return 'Hasil Kerja Juli & Divisi';
      case 'table':
        return 'Hasil Kerja Agustus & Detail Unit';
      case 'spk':
        return 'Surat Perintah Kerja (SPK)';
      case 'spl':
        return 'Surat Perintah Lembur (SPL)';
      case 'presentation':
        return 'Mode Presentasi TV';
      default:
        return 'DASHBOARD PROJECT TEAM CI';
    }
  };

  const handleCopyDirectLink = () => {
    const url = `${OFFICIAL_DASHBOARD_URL}#${activeTab}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setSyncNotice(`✨ Link resmi disalin: ${url}`);
        setTimeout(() => {
          setIsCopied(false);
          setSyncNotice(null);
        }, 4000);
      }).catch(() => {
        setIsCopied(true);
        setSyncNotice(`✨ Link resmi: ${url}`);
      });
    } else {
      setIsCopied(true);
      setSyncNotice(`✨ Link resmi: ${url}`);
    }
  };

  const handleOpenNewTabWindow = () => {
    const url = `${OFFICIAL_DASHBOARD_URL}#${activeTab}`;
    window.open(url, '_blank');
  };

  return (
    <header className="bg-black/60 border-b border-white/10 sticky top-0 z-30 shadow-xl backdrop-blur-md">
      <div className="px-3 sm:px-6 lg:px-8 py-2.5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Sidebar Toggle + Logo Card + Active Tab Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-300 hover:text-white bg-[#141414] hover:bg-[#1a1a1a] border border-[#c5a059]/30 rounded-xl transition-all cursor-pointer shadow-md shrink-0"
              title="Buka Navigasi Samping"
            >
              <Menu className="w-5 h-5 text-[#c5a059]" />
            </button>

            {/* Stanley Marthin Logo Box (Dashboard Model Card) */}
            <div className="hidden sm:block shrink-0">
              <SMLogo size="sm" showText={true} />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-modern font-black text-white tracking-wide uppercase">
                  {getTabTitle(activeTab)}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 font-bold tracking-wider">
                  #{activeTab}
                </span>
              </div>

              {/* Automatic Live Date & Time Indicator */}
              <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                <span className="font-modern font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-amber-200 to-white tracking-wider text-[11px] uppercase">
                  DASHBOARD TEAM CI
                </span>

                {/* Realtime Date Display */}
                {dateString && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-amber-200/90">
                    <Calendar className="w-3 h-3 text-[#c5a059]" />
                    <span>{dateString}</span>
                  </div>
                )}

                {/* Realtime Time Display */}
                {timeString && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0a0a0a] border border-[#c5a059]/20 rounded-md text-[11px] font-mono text-gray-300">
                    <Clock className="w-3 h-3 text-[#c5a059]" />
                    <span>{timeString}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions & Sync Indicators */}
          <div className="flex items-center gap-2">
            {/* Quick Search Toggle */}
            {showQuickSearch ? (
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Cari unit..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-8 pr-7 py-1.5 bg-[#0a0a0a] border border-[#c5a059]/50 text-xs text-white rounded-xl focus:outline-none w-36 sm:w-48 transition-all"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-gray-400" />
                <button
                  onClick={() => {
                    setShowQuickSearch(false);
                    setFilters((prev) => ({ ...prev, searchQuery: '' }));
                  }}
                  className="absolute right-2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowQuickSearch(true)}
                title="Pencarian Cepat"
                className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Search className="w-4 h-4 text-[#c5a059]" />
                <span className="hidden sm:inline text-xs">Cari</span>
              </button>
            )}

            {/* Live Google Sheets Auto-Sync Indicator Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0a0a0a] border border-[#c5a059]/30 rounded-xl text-[11px] font-mono text-gray-300 shadow-inner">
              <Radio className={`w-3.5 h-3.5 ${isAutoSyncing || isSyncing ? 'text-amber-400 animate-spin' : 'text-emerald-400 animate-pulse'}`} />
              <span className="text-[#c5a059] font-bold hidden sm:inline">LIVE SYNC</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping sm:hidden"></span>
              {lastSyncedAt && <span className="text-gray-400 text-[10px] whitespace-nowrap">({lastSyncedAt})</span>}
            </div>

            {/* Synced Shortlink Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[#c5a059]/40 rounded-xl shadow-sm text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-gray-400 text-[10px] font-bold tracking-wider uppercase">LINK RESMI:</span>
              <a
                href={`${OFFICIAL_DASHBOARD_URL}#${activeTab}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[#c5a059] hover:text-amber-300 font-bold text-[11px] transition-colors"
                title="Buka Link Resmi Dashboard di Tab Baru"
              >
                tinyurl.com/DASHBOARD-TEAM-CI
              </a>
              <button
                onClick={handleCopyDirectLink}
                className="p-1 hover:bg-[#c5a059]/20 text-[#c5a059] rounded-lg transition-colors cursor-pointer ml-0.5"
                title="Salin Link Resmi Dashboard"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Copy Direct URL */}
            <button
              onClick={handleCopyDirectLink}
              title={`Salin Link Resmi: ${OFFICIAL_DASHBOARD_URL}#${activeTab}`}
              className="p-2 sm:px-3 sm:py-1.5 bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] text-xs font-bold rounded-xl border border-[#c5a059]/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isCopied ? 'Link Disalin!' : 'Salin Link Resmi'}</span>
            </button>

            {/* Open New Tab */}
            <button
              onClick={handleOpenNewTabWindow}
              title="Buka Tab Ini di Window Baru"
              className="p-2 sm:px-3 sm:py-1.5 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-medium rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden lg:inline">Tab Baru</span>
            </button>

            {/* Kelola & Tambah Tab Google Sheets Button */}
            {onOpenManageTabs && (
              <button
                onClick={onOpenManageTabs}
                title="Kelola & Tambah Tab Google Sheets Baru"
                className="p-2 sm:px-3 sm:py-1.5 bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] text-xs font-bold rounded-xl border border-[#c5a059]/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden xl:inline">Kelola Tab</span>
              </button>
            )}

            {/* Sinkron Button */}
            <button
              onClick={handleSinkron}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-[#c5a059] hover:bg-[#d4af66] text-black text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>SINKRON</span>
            </button>

            {/* Add Unit Button */}
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#c5a059]" />
              <span className="hidden sm:inline">Tambah Unit</span>
            </button>
          </div>
        </div>

        {/* Sync Banner Notification */}
        {syncNotice && (
          <div className="mt-2.5 p-2 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-xl text-xs font-medium text-[#c5a059] flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{syncNotice}</span>
          </div>
        )}
      </div>
    </header>
  );
};

