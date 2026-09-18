import React from 'react';
import { Lock, Plus, Menu, ChevronDown, Layers } from 'lucide-react';
import { DashboardTab } from '../types';
import { CustomTabItem, PREDEFINED_SHEET_TABS } from './ManageTabsModal';

interface GoogleSheetTabBarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  onOpenManageTabs?: () => void;
  activeTabIds?: string[];
  customTabs?: CustomTabItem[];
}

export const GoogleSheetTabBar: React.FC<GoogleSheetTabBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenManageTabs,
  activeTabIds = ['timeline', 'target_september', 'actual_september', 'hasil_kerja_september', 'presentation', 'spk', 'spl', 'hasil_kerja_2023_2026', 'daftar_unit'],
  customTabs = [],
}) => {
  // Combine predefined + user added custom tabs
  const allTabs = [
    ...PREDEFINED_SHEET_TABS,
    ...customTabs.filter((ct) => !PREDEFINED_SHEET_TABS.some((pt) => pt.id === ct.id)),
  ];

  // Filter tabs that are enabled in activeTabIds
  const visibleTabs = allTabs.filter((t) => activeTabIds.includes(t.id));

  // If currently active tab is not in visibleTabs (e.g. newly added custom tab), include it
  const currentTabObj = allTabs.find((t) => t.id === activeTab);
  if (currentTabObj && !visibleTabs.some((vt) => vt.id === activeTab)) {
    visibleTabs.push(currentTabObj);
  }

  return (
    <div className="w-full bg-black/40 backdrop-blur-sm border-t border-b border-white/10 px-2 py-1 flex items-center gap-1 overflow-x-auto text-xs font-sans select-none shadow-md no-scrollbar">
      {/* Left Sheet Controls */}
      <div className="flex items-center gap-1 pr-2 border-r border-white/10 shrink-0">
        <button
          onClick={onOpenManageTabs}
          title="Kelola & Tambah Tab Google Sheets Baru"
          className="p-1.5 hover:bg-white/10 rounded-lg text-[#c5a059] transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Tambah Tab</span>
        </button>
        <button
          onClick={onOpenManageTabs}
          title="Lihat Semua Tab Spreadsheet"
          className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-t-2 border-[#c5a059] shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab.isBuiltIn && tab.id === 'timeline' && (
                <Lock className={`w-3 h-3 ${isActive ? 'text-[#c5a059]' : 'text-gray-500'}`} />
              )}
              <span>{tab.name}</span>
              <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

