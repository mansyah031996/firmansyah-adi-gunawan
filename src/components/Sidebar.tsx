import React from 'react';
import {
  CalendarCheck,
  LayoutDashboard,
  Wrench,
  Table as TableIcon,
  FileText,
  Timer,
  Presentation,
  Plus,
  FileSpreadsheet,
  Sparkles,
  Car,
  X,
  ChevronRight,
  Link2,
  ExternalLink,
  Check
} from 'lucide-react';
import { DashboardTab } from '../types';
import { CustomTabItem } from './ManageTabsModal';
import { SMLogo } from './SMLogo';
import { OFFICIAL_DASHBOARD_URL } from '../utils/googleSheetsSync';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  filteredCount: number;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenManageTabs?: () => void;
  customTabs?: CustomTabItem[];
  activeTabIds?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  totalCount,
  filteredCount,
  onOpenAddModal,
  onOpenDataModal,
  onOpenManageTabs,
  customTabs = [],
  activeTabIds = ['timeline', 'target_september', 'actual_september', 'hasil_kerja_september', 'presentation', 'spk', 'spl', 'hasil_kerja_2023_2026', 'daftar_unit'],
}) => {
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  const handleCopyOfficialLink = () => {
    const url = `${OFFICIAL_DASHBOARD_URL}#${activeTab}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }).catch(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      });
    } else {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };
  const baseTabs: { id: DashboardTab; label: string; icon: React.ReactNode; desc: string; sheetName?: string }[] = [
    {
      id: 'timeline',
      label: 'URUTAN UNIT DELIVERY',
      icon: <CalendarCheck className="w-4 h-4" />,
      desc: 'Prioritas & Delivery Target',
      sheetName: 'URUTAN UNIT DELIVERY',
    },
    {
      id: 'target_september',
      label: 'TARGET PROJECT SEPTEMBER',
      icon: <LayoutDashboard className="w-4 h-4 text-[#c5a059]" />,
      desc: 'Target Proyek Bulan September 2026',
      sheetName: 'TARGET PROJECT SEPTEMBER',
    },
    {
      id: 'actual_september',
      label: 'ACTUAL JOBDESC SEPTEMBER',
      icon: <Wrench className="w-4 h-4 text-[#c5a059]" />,
      desc: 'Realisasi Jobdesc September 2026',
      sheetName: 'ACTUAL JOBDESC SEPTEMBER',
    },
    {
      id: 'hasil_kerja_september',
      label: 'HASIL KERJA SEPTEMBER',
      icon: <TableIcon className="w-4 h-4 text-[#c5a059]" />,
      desc: 'Tabel Rekapitulasi Hasil Kerja September',
      sheetName: 'HASIL KERJA SEPTEMBER',
    },
    {
      id: 'target_agustus',
      label: 'TARGET PROJECT AGUSTUS',
      icon: <LayoutDashboard className="w-4 h-4" />,
      desc: 'Target Proyek Bulan Agustus',
      sheetName: 'TARGET PROJECT AGUSTUS',
    },
    {
      id: 'actual_agustus',
      label: 'ACTUAL JOBDESC AGUSTUS',
      icon: <Wrench className="w-4 h-4" />,
      desc: 'Realisasi Jobdesc Agustus',
      sheetName: 'ACTUAL JOBDESC AGUSTUS',
    },
    {
      id: 'table',
      label: 'HASIL KERJA AGUSTUS',
      icon: <TableIcon className="w-4 h-4" />,
      desc: 'Tabel Rekapitulasi Hasil Kerja Agustus',
      sheetName: 'HASIL KERJA AGUSTUS',
    },
    {
      id: 'hasil_kerja_2023_2026',
      label: 'HASIL KERJA 2023-2026',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      desc: 'Data Tumpah Unit & Panel Multi-Year',
      sheetName: 'HASIL KERJA 2023-2026',
    },
    {
      id: 'spk',
      label: 'SPK (Surat Kerja)',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Form Surat Perintah Kerja',
      sheetName: 'SPK',
    },
    {
      id: 'spl',
      label: 'SPL (Surat Lembur)',
      icon: <Timer className="w-4 h-4" />,
      desc: 'Pengajuan Rekap Lembur',
      sheetName: 'SPL',
    },
    {
      id: 'presentation',
      label: 'Mode Presentasi',
      icon: <Presentation className="w-4 h-4" />,
      desc: 'Tampilan Fullscreen Screen',
    },
  ];

  // Custom added tabs
  const userCustomTabs = customTabs.map((ct) => ({
    id: ct.id,
    label: ct.name,
    icon: <FileSpreadsheet className="w-4 h-4" />,
    desc: ct.description || 'Tab Google Sheet Kustom',
  }));

  const allTabs = [...baseTabs, ...userCustomTabs];
  const visibleTabs = allTabs.filter((t) => activeTabIds.includes(t.id) || t.id === 'presentation');

  // Ensure current activeTab is shown
  const currentTabObj = allTabs.find((t) => t.id === activeTab);
  if (currentTabObj && !visibleTabs.some((vt) => vt.id === activeTab)) {
    visibleTabs.push(currentTabObj);
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 xl:w-72 bg-black/30 backdrop-blur-md border-r border-white/15 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header / Branding */}
        <div className="p-3.5 border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <SMLogo size="sm" showText={true} className="w-full justify-between" />

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white lg:hidden rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2.5 px-1 flex items-center justify-between">
            <span className="font-modern font-black text-[11px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] via-amber-200 to-white uppercase">
              DASHBOARD TEAM CI
            </span>
            <span className="text-[9px] font-mono text-[#c5a059] bg-[#c5a059]/15 border border-[#c5a059]/30 px-1.5 py-0.5 rounded font-bold">
              SYSTEM
            </span>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar bg-transparent">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center justify-between">
            <span>NAVIGASI UTAMA</span>
            {onOpenManageTabs && (
              <button
                onClick={onOpenManageTabs}
                className="text-[10px] font-bold text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>KELOLA TAB</span>
              </button>
            )}
          </div>

          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#c5a059]/15 text-[#c5a059] border-l-4 border-[#c5a059] font-semibold backdrop-blur-sm shadow-[0_0_15px_rgba(197,160,89,0.15)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'bg-black/40 text-gray-300 group-hover:text-white group-hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                  </div>
                  <div className="truncate">
                    <div className="font-bold truncate text-xs">{tab.label}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive ? 'text-[#c5a059]/90' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    >
                      {tab.desc}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive ? 'text-[#c5a059] translate-x-0.5' : 'text-gray-500 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </a>
            );
          })}
        </div>

        {/* Sidebar Footer / Quick Actions */}
        <div className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-sm space-y-2">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-gray-300">
            <span>Total Unit:</span>
            <span className="font-mono font-bold text-[#c5a059] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
              {totalCount} Unit
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenAddModal}
              className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Tambah</span>
            </button>
            <button
              onClick={onOpenDataModal}
              className="px-2.5 py-2 bg-black/40 hover:bg-white/10 text-gray-200 text-[11px] font-medium rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
