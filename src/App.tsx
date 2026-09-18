import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MetricCards } from './components/MetricCards';
import { OverviewDashboard } from './components/OverviewDashboard';
import { ProjectTable } from './components/ProjectTable';
import { DeliveryTimeline } from './components/DeliveryTimeline';
import { DivisionAnalytics } from './components/DivisionAnalytics';
import { ActualJobdescAgustusView } from './components/ActualJobdescAgustusView';
import { HasilKerjaAgustusView } from './components/HasilKerjaAgustusView';
import { HasilKerja2023_2026View } from './components/HasilKerja2023_2026View';
import { PresentationMode } from './components/PresentationMode';
import { SPKView } from './components/SPKView';
import { SPLView } from './components/SPLView';
import { UnitModal } from './components/UnitModal';
import { DataManagementModal } from './components/DataManagementModal';
import { GoogleSheetTabBar } from './components/GoogleSheetTabBar';
import { ManageTabsModal, PREDEFINED_SHEET_TABS, CustomTabItem } from './components/ManageTabsModal';
import { GenericSheetView } from './components/GenericSheetView';

import { ProjectUnit, DashboardTab, FilterState, ActualJobdescRecord, HasilKerjaAgustusRecord, SPKRecord, SPLRecord, TargetProjectDailyTables } from './types';
import { INITIAL_PROJECT_UNITS, INITIAL_DELIVERY_UNITS } from './data/initialData';
import { INITIAL_ACTUAL_JOBDESC_AGUSTUS } from './data/actualAgustusData';
import { INITIAL_HASIL_KERJA_AGUSTUS } from './data/hasilKerjaAgustusData';
import { INITIAL_ACTUAL_JOBDESC_SEPTEMBER } from './data/actualSeptemberData';
import { INITIAL_HASIL_KERJA_SEPTEMBER } from './data/hasilKerjaSeptemberData';
import { INITIAL_SPK_RECORDS } from './data/spkData';
import { INITIAL_SPL_RECORDS } from './data/splData';
import { parsePriorityRank, timeToDecimalHours, formatTimeString, formatDecimalHours } from './utils/timeUtils';
import { safeLocalStorageSet } from './utils/storageUtils';
import {
  fetchGoogleSheetsData,
  parseActualJobdescCSV,
  parseHasilKerjaCSV,
  parseUrutanUnitDeliveryCSV,
  parseSPKCSV,
  parseSPLCSV,
  fetchSheetCsvText,
  aggregateJobdescToUnits,
  extractSpreadsheetId,
  getGoogleSheetsCsvUrl,
  autoDiscoverAllSheetTabs,
  fetchTargetProjectDailyTables,
  SEPTEMBER_DAILY_TABLES_STORAGE_KEY,
  SHEET_TAB_GIDS,
  SHEET_URL_STORAGE_KEY,
  DEFAULT_SHEET_URL,
} from './utils/googleSheetsSync';
import { Car, Clock, ShieldCheck, X, Wrench, Calendar, Sparkles, Eye, Sliders, Image, Check } from 'lucide-react';

const STORAGE_KEY = 'sm_restoration_units_v7';
const DELIVERY_UNITS_STORAGE_KEY = 'sm_delivery_units_gid_1940937859_v2';
const JOBDESC_AGUSTUS_STORAGE_KEY = 'sm_actual_jobdesc_agustus_v2';
const HASIL_KERJA_AGUSTUS_STORAGE_KEY = 'sm_hasil_kerja_agustus_v2';
const JOBDESC_SEPTEMBER_STORAGE_KEY = 'sm_actual_jobdesc_september_v2';
const HASIL_KERJA_SEPTEMBER_STORAGE_KEY = 'sm_hasil_kerja_september_v2';
const SPK_STORAGE_KEY = 'sm_spk_records_v2';
const SPL_STORAGE_KEY = 'sm_spl_records_v10_synced_source';

function sanitizeUnitsList(list: ProjectUnit[]): ProjectUnit[] {
  return list
    .filter((u) => {
      const name = (u.unitName || '').toUpperCase();
      return (
        !name.includes('TOTAL') &&
        !name.includes('PERSENTASE') &&
        !name.includes('REPORT') &&
        !name.includes('#N/A')
      );
    })
    .map((u) => {
      const name = (u.unitName || '').toUpperCase();
      if (name.includes('MB R 230') || name.includes('R 230')) {
        return {
          ...u,
          septemberTargetHours: '0:00',
        };
      }
      return u;
    });
}

export default function App() {
  // 1. Units State with localStorage persistence
  const [units, setUnits] = useState<ProjectUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('sm_restoration_units_v6');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeUnitsList(parsed);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return sanitizeUnitsList(INITIAL_PROJECT_UNITS);
  });

  // Delivery Units State (GID 1940937859) - Urutan Unit Delivery (37 Units)
  const [deliveryUnits, setDeliveryUnits] = useState<ProjectUnit[]>(() => {
    try {
      const saved = localStorage.getItem(DELIVERY_UNITS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return sanitizeUnitsList(parsed);
      }
    } catch (e) {
      console.error('Failed to load deliveryUnits from localStorage:', e);
    }
    return sanitizeUnitsList(INITIAL_DELIVERY_UNITS);
  });

  // 2. Actual Jobdesc Agustus State (GID 1662570265)
  const [actualAgustusJobdescs, setActualAgustusJobdescs] = useState<ActualJobdescRecord[]>(() => {
    try {
      const saved = localStorage.getItem(JOBDESC_AGUSTUS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load actualAgustusJobdescs from localStorage:', e);
    }
    return INITIAL_ACTUAL_JOBDESC_AGUSTUS;
  });

  // 3. Hasil Kerja Agustus State (GID 1679857860)
  const [hasilKerjaAgustusRecords, setHasilKerjaAgustusRecords] = useState<HasilKerjaAgustusRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HASIL_KERJA_AGUSTUS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load hasilKerjaAgustusRecords from localStorage:', e);
    }
    return INITIAL_HASIL_KERJA_AGUSTUS;
  });

  // 4. Actual Jobdesc September State (GID 292168166)
  const [actualSeptemberJobdescs, setActualSeptemberJobdescs] = useState<ActualJobdescRecord[]>(() => {
    try {
      const saved = localStorage.getItem(JOBDESC_SEPTEMBER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load actualSeptemberJobdescs from localStorage:', e);
    }
    return INITIAL_ACTUAL_JOBDESC_SEPTEMBER;
  });

  // 5. Hasil Kerja September State (GID 65933745)
  const [hasilKerjaSeptemberRecords, setHasilKerjaSeptemberRecords] = useState<HasilKerjaAgustusRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HASIL_KERJA_SEPTEMBER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load hasilKerjaSeptemberRecords from localStorage:', e);
    }
    return INITIAL_HASIL_KERJA_SEPTEMBER;
  });

  // 6. SPK State (GID 622501492)
  const [spkRecords, setSpkRecords] = useState<SPKRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SPK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load spkRecords from localStorage:', e);
    }
    return INITIAL_SPK_RECORDS;
  });

  // 7. SPL State (GID 131205278)
  const [splRecords, setSplRecords] = useState<SPLRecord[]>(() => {
    try {
      const saved = localStorage.getItem(SPL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = parsed.filter(
            (r: SPLRecord) =>
              r.technicianName &&
              r.technicianName !== '-' &&
              !r.technicianName.toUpperCase().includes('STANLEY') &&
              !r.technicianName.toUpperCase().includes('JOBDESC UTAMA') &&
              !r.technicianName.toUpperCase().includes('SURAT PERINTAH') &&
              r.technicianName.toUpperCase() !== 'NO.' &&
              r.technicianName.toUpperCase() !== 'NAMA'
          );
          if (cleaned.length > 0) return cleaned;
        }
      }
    } catch (e) {
      console.error('Failed to load splRecords from localStorage:', e);
    }
    return INITIAL_SPL_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(JOBDESC_SEPTEMBER_STORAGE_KEY, JSON.stringify(actualSeptemberJobdescs));
    } catch (e) {
      console.error('Failed to save actualSeptemberJobdescs to localStorage:', e);
    }
  }, [actualSeptemberJobdescs]);

  useEffect(() => {
    try {
      localStorage.setItem(HASIL_KERJA_SEPTEMBER_STORAGE_KEY, JSON.stringify(hasilKerjaSeptemberRecords));
    } catch (e) {
      console.error('Failed to save hasilKerjaSeptemberRecords to localStorage:', e);
    }
  }, [hasilKerjaSeptemberRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(DELIVERY_UNITS_STORAGE_KEY, JSON.stringify(deliveryUnits));
    } catch (e) {
      console.error('Failed to save deliveryUnits to localStorage:', e);
    }
  }, [deliveryUnits]);

  // 8b. Target Project September Daily Tables (Table 1: PJK & Table 2: HK)
  const [septemberDailyTables, setSeptemberDailyTables] = useState<TargetProjectDailyTables | null>(() => {
    try {
      const saved = localStorage.getItem(SEPTEMBER_DAILY_TABLES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load septemberDailyTables from localStorage:', e);
    }
    return null;
  });

  useEffect(() => {
    if (septemberDailyTables) {
      try {
        localStorage.setItem(SEPTEMBER_DAILY_TABLES_STORAGE_KEY, JSON.stringify(septemberDailyTables));
      } catch (e) {
        console.error('Failed to save septemberDailyTables to localStorage:', e);
      }
    }
  }, [septemberDailyTables]);

  // 8. Manage Tabs State & Custom Tabs Persistence
  const [isManageTabsOpen, setIsManageTabsOpen] = useState<boolean>(false);
  const [customTabs, setCustomTabs] = useState<CustomTabItem[]>(() => {
    try {
      const saved = localStorage.getItem('sm_custom_google_tabs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load customTabs from localStorage:', e);
    }
    return [];
  });

  const [activeTabIds, setActiveTabIds] = useState<string[]>(() => {
    const DEFAULT_TABS = [
      'timeline',
      'target_september',
      'actual_september',
      'hasil_kerja_september',
      'presentation',
      'spk',
      'spl',
      'hasil_kerja_2023_2026',
      'daftar_unit',
    ];
    try {
      const saved = localStorage.getItem('sm_active_tab_ids_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out obsolete August tabs
          const filtered = parsed.filter(
            (id) => id !== 'target_agustus' && id !== 'actual_agustus' && id !== 'table'
          );
          const set = new Set(filtered);
          ['timeline', 'target_september', 'actual_september', 'hasil_kerja_september'].forEach((t) => set.add(t));
          return Array.from(set);
        }
      }
    } catch (e) {
      console.error('Failed to load activeTabIds from localStorage:', e);
    }
    return DEFAULT_TABS;
  });

  const handleToggleTab = (tabId: string) => {
    setActiveTabIds((prev) => {
      const next = prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId];
      try {
        localStorage.setItem('sm_active_tab_ids_v3', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleAddCustomTab = (newTab: CustomTabItem) => {
    setCustomTabs((prev) => {
      const next = [...prev, newTab];
      try {
        localStorage.setItem('sm_custom_google_tabs_v1', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleDeleteCustomTab = (tabId: string) => {
    setCustomTabs((prev) => {
      const next = prev.filter((t) => t.id !== tabId);
      try {
        localStorage.setItem('sm_custom_google_tabs_v1', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Background Car Watermark Customization State
  const [bgCarOpacity, setBgCarOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sm_bg_car_opacity');
      if (saved) return parseFloat(saved);
    } catch (e) {}
    return 0.85; // High vivid opacity by default
  });

  const [bgCarPosition, setBgCarPosition] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sm_bg_car_position');
      if (saved) return saved;
    } catch (e) {}
    return 'center';
  });

  const [isBgSettingsOpen, setIsBgSettingsOpen] = useState<boolean>(false);

  const handleUpdateBgOpacity = (val: number) => {
    setBgCarOpacity(val);
    try {
      localStorage.setItem('sm_bg_car_opacity', val.toString());
    } catch (e) {}
  };

  const handleUpdateBgPosition = (pos: string) => {
    setBgCarPosition(pos);
    try {
      localStorage.setItem('sm_bg_car_position', pos);
    } catch (e) {}
  };

  // Helper to map hash string to DashboardTab
  const getTabFromHash = (hash: string): DashboardTab => {
    const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();
    switch (cleanHash) {
      case 'timeline':
      case 'urutan-unit':
      case 'urutan_delivery':
        return 'timeline';
      case 'overview':
      case 'target_september':
      case 'target-september':
      case 'september':
        return 'target_september';
      case 'actual_september':
      case 'actual-september':
        return 'actual_september';
      case 'hasil_kerja_september':
      case 'hasil-kerja-september':
        return 'hasil_kerja_september';
      case 'target-project':
      case 'target':
      case 'target_agustus':
      case 'target-agustus':
      case 'agustus':
        return 'target_agustus';
      case 'actual_agustus':
      case 'actual-agustus':
      case 'divisions':
      case 'actual-jobdesc':
      case 'jobdesc':
        return 'actual_agustus';
      case 'table':
      case 'hasil-kerja':
        return 'table';
      case 'hasil_kerja_2023_2026':
      case 'hasil-kerja-2023-2026':
      case 'hasil_kerja_2023_sampai_2026':
      case '2023-2026':
      case 'hasil-kerja-multi':
        return 'hasil_kerja_2023_2026';
      case 'spk':
        return 'spk';
      case 'spl':
        return 'spl';
      case 'presentation':
        return 'presentation';
      default:
        return cleanHash || 'target_september';
    }
  };

  // Active Tab State with URL Hash initialization - default to September!
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      return getTabFromHash(window.location.hash);
    }
    return 'target_september';
  });

  // Auto-discover newly added tabs from Google Sheets (e.g. September, Oktober, etc.)
  const autoDiscoverTabs = useCallback(async () => {
    const sheetUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || DEFAULT_SHEET_URL;
    try {
      const discovered = await autoDiscoverAllSheetTabs(sheetUrl);
      if (!discovered || discovered.length === 0) return;

      setCustomTabs((prevCustom) => {
        let updatedCustom = [...prevCustom];
        let hasChange = false;

        discovered.forEach((disc) => {
          // Check if already in predefined or custom
          const inPredefined = PREDEFINED_SHEET_TABS.find(
            (p) => p.gid === disc.gid || p.name.toUpperCase() === disc.name.toUpperCase()
          );
          const inCustomIdx = updatedCustom.findIndex(
            (c) => c.gid === disc.gid || c.name.toUpperCase() === disc.name.toUpperCase()
          );

          if (inCustomIdx >= 0) {
            // Update GID or name if needed
            if (updatedCustom[inCustomIdx].gid !== disc.gid || updatedCustom[inCustomIdx].name !== disc.name.toUpperCase()) {
              updatedCustom[inCustomIdx] = {
                ...updatedCustom[inCustomIdx],
                name: disc.name.toUpperCase(),
                gid: disc.gid,
              };
              hasChange = true;
            }
          } else if (!inPredefined || (inPredefined && inPredefined.gid === '0')) {
            // New Tab found in user's sheet!
            const newId = `sheet_tab_${disc.gid}`;
            updatedCustom.push({
              id: newId,
              name: disc.name.toUpperCase(),
              gid: disc.gid,
              description: `Tab otomatis dari Google Sheet (GID: ${disc.gid})`,
              isBuiltIn: false,
            });
            hasChange = true;

            // Auto-activate in activeTabIds so it appears immediately
            setActiveTabIds((prevIds) => {
              if (!prevIds.includes(newId)) {
                const nextIds = [...prevIds, newId];
                try {
                  localStorage.setItem('sm_active_tab_ids_v1', JSON.stringify(nextIds));
                } catch (e) {}
                return nextIds;
              }
              return prevIds;
            });
          }
        });

        if (hasChange) {
          try {
            localStorage.setItem('sm_custom_google_tabs_v1', JSON.stringify(updatedCustom));
          } catch (e) {}
          return updatedCustom;
        }
        return prevCustom;
      });
    } catch (err) {
      console.warn('Auto-discover tabs error:', err);
    }
  }, []);

  // Auto-sync function from connected Google Sheet
  const syncDataFromSheets = useCallback(
    async (tabToFetch?: DashboardTab) => {
      const currentTab = tabToFetch || activeTab;
      const sheetUrl = localStorage.getItem(SHEET_URL_STORAGE_KEY) || DEFAULT_SHEET_URL;
      setIsSyncing(true);
      try {
        // Auto-discover any new tabs in Google Sheets in the background
        autoDiscoverTabs();

        const spreadsheetId = extractSpreadsheetId(sheetUrl) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';

        if (currentTab === 'actual_september') {
          const targetGid = SHEET_TAB_GIDS.actual_september || '292168166';
          const csvText = await fetchSheetCsvText(spreadsheetId, targetGid);
          if (csvText) {
            const parsedRecords = parseActualJobdescCSV(csvText);
            if (parsedRecords && parsedRecords.length > 0) {
              setActualSeptemberJobdescs(parsedRecords);
              localStorage.setItem(JOBDESC_SEPTEMBER_STORAGE_KEY, JSON.stringify(parsedRecords));
            }
          }

          // Background sync September targets
          try {
            const septUnits = await fetchGoogleSheetsData(sheetUrl, 'target_september');
            if (septUnits && septUnits.length > 0) {
              const sanitizedSept = sanitizeUnitsList(septUnits);
              setUnits(sanitizedSept);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedSept));
            }
          } catch (e) {}
        } else if (currentTab === 'hasil_kerja_september' || currentTab === 'table') {
          const targetGid = SHEET_TAB_GIDS.hasil_kerja_september || '65933745';
          const csvText = await fetchSheetCsvText(spreadsheetId, targetGid);
          if (csvText) {
            const parsedRecords = parseHasilKerjaCSV(csvText);
            if (parsedRecords && parsedRecords.length > 0) {
              setHasilKerjaSeptemberRecords(parsedRecords);
              localStorage.setItem(HASIL_KERJA_SEPTEMBER_STORAGE_KEY, JSON.stringify(parsedRecords));
            }
          }

          // Background sync September targets
          try {
            const septUnits = await fetchGoogleSheetsData(sheetUrl, 'target_september');
            if (septUnits && septUnits.length > 0) {
              const sanitizedSept = sanitizeUnitsList(septUnits);
              setUnits(sanitizedSept);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedSept));
            }
          } catch (e) {}
        } else if (currentTab === 'spk') {
          const targetGid = SHEET_TAB_GIDS.spk || '622501492';
          let fetchedSuccess = false;
          try {
            const csvText = await fetchSheetCsvText(spreadsheetId, targetGid);
            if (csvText) {
              const parsedRecords = parseSPKCSV(csvText);
              if (parsedRecords && parsedRecords.length > 0) {
                setSpkRecords(parsedRecords);
                localStorage.setItem(SPK_STORAGE_KEY, JSON.stringify(parsedRecords));
                fetchedSuccess = true;
              }
            }
          } catch (e) {
            console.warn('SPK fetch error, using source dataset:', e);
          }

          if (!fetchedSuccess && spkRecords.length === 0) {
            setSpkRecords(INITIAL_SPK_RECORDS);
            localStorage.setItem(SPK_STORAGE_KEY, JSON.stringify(INITIAL_SPK_RECORDS));
          }
        } else if (currentTab === 'spl') {
          const targetGid = SHEET_TAB_GIDS.spl || '131205278';
          let fetchedSuccess = false;
          try {
            const csvText = await fetchSheetCsvText(spreadsheetId, targetGid);
            if (csvText) {
              const parsedRecords = parseSPLCSV(csvText);
              if (parsedRecords && parsedRecords.length > 0) {
                setSplRecords(parsedRecords);
                localStorage.setItem(SPL_STORAGE_KEY, JSON.stringify(parsedRecords));
                fetchedSuccess = true;
              }
            }
          } catch (e) {
            console.warn('SPL fetch error, using source dataset:', e);
          }

          if (!fetchedSuccess && splRecords.length === 0) {
            setSplRecords(INITIAL_SPL_RECORDS);
            localStorage.setItem(SPL_STORAGE_KEY, JSON.stringify(INITIAL_SPL_RECORDS));
          }
        } else if (currentTab === 'timeline') {
          const targetGid = SHEET_TAB_GIDS.timeline || '1940937859';
          const csvText = await fetchSheetCsvText(spreadsheetId, targetGid);
          if (csvText) {
            const parsed = parseUrutanUnitDeliveryCSV(csvText);
            if (parsed && parsed.length > 0) {
              const sanitized = sanitizeUnitsList(parsed);
              setDeliveryUnits(sanitized);
              localStorage.setItem(DELIVERY_UNITS_STORAGE_KEY, JSON.stringify(sanitized));
            }
          }

          // Background sync September targets so Overview and targets are always updated
          try {
            const septUnits = await fetchGoogleSheetsData(sheetUrl, 'target_september');
            if (septUnits && septUnits.length > 0) {
              const sanitizedSept = sanitizeUnitsList(septUnits);
              setUnits(sanitizedSept);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedSept));
            }
          } catch (e) {
            console.warn('Sync September targets from timeline error:', e);
          }
        } else {
          let fetched = await fetchGoogleSheetsData(sheetUrl, currentTab);
          if (fetched && fetched.length > 0) {
            const sanitized = sanitizeUnitsList(fetched);
            setUnits(sanitized);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
            localStorage.setItem(SHEET_URL_STORAGE_KEY, sheetUrl);
          }

          // Background sync Urutan Unit Delivery (GID 1940937859)
          try {
            const delivGid = SHEET_TAB_GIDS.timeline || '1940937859';
            const csvText = await fetchSheetCsvText(spreadsheetId, delivGid);
            if (csvText) {
              const parsedDeliv = parseUrutanUnitDeliveryCSV(csvText);
              if (parsedDeliv && parsedDeliv.length > 0) {
                const sanitized = sanitizeUnitsList(parsedDeliv);
                setDeliveryUnits(sanitized);
                localStorage.setItem(DELIVERY_UNITS_STORAGE_KEY, JSON.stringify(sanitized));
              }
            }
          } catch (e) {
            console.warn('Sync delivery units background error:', e);
          }

          // If current tab is not September targets or overview, sync September targets in background
          if (currentTab !== 'overview' && currentTab !== 'target_september') {
            try {
              const septUnits = await fetchGoogleSheetsData(sheetUrl, 'target_september');
              if (septUnits && septUnits.length > 0) {
                const sanitizedSept = sanitizeUnitsList(septUnits);
                setUnits(sanitizedSept);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedSept));
              }
            } catch (e) {
              console.warn('Sync September targets in background error:', e);
            }
          }
        }

        // Background sync September Hasil Kerja (GID 65933745) & Actual (GID 292168166) if not currently active
        if (currentTab !== 'hasil_kerja_september' && currentTab !== 'table') {
          try {
            const hkSeptGid = SHEET_TAB_GIDS.hasil_kerja_september || '65933745';
            const csvText = await fetchSheetCsvText(spreadsheetId, hkSeptGid);
            if (csvText) {
              const parsedHk = parseHasilKerjaCSV(csvText);
              if (parsedHk && parsedHk.length > 0) {
                setHasilKerjaSeptemberRecords(parsedHk);
                localStorage.setItem(HASIL_KERJA_SEPTEMBER_STORAGE_KEY, JSON.stringify(parsedHk));
              }
            }
          } catch (e) {
            console.warn('Sync Hasil Kerja September error:', e);
          }
        }

        if (currentTab !== 'actual_september') {
          try {
            const actSeptGid = SHEET_TAB_GIDS.actual_september || '292168166';
            const csvText = await fetchSheetCsvText(spreadsheetId, actSeptGid);
            if (csvText) {
              const parsedAct = parseActualJobdescCSV(csvText);
              if (parsedAct && parsedAct.length > 0) {
                setActualSeptemberJobdescs(parsedAct);
                localStorage.setItem(JOBDESC_SEPTEMBER_STORAGE_KEY, JSON.stringify(parsedAct));
              }
            }
          } catch (e) {
            console.warn('Sync Actual September error:', e);
          }
        }

        // Live Auto-Sync Table 1 (Perhitungan Jam Kerja Real) & Table 2 (Hasil Kerja Per Hari) directly from Google Sheet GID 938106022
        try {
          const spreadsheetId = extractSpreadsheetId(sheetUrl) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
          const targetGid = SHEET_TAB_GIDS.target_september || '938106022';
          const dailyTables = await fetchTargetProjectDailyTables(spreadsheetId, targetGid);
          if (dailyTables) {
            setSeptemberDailyTables(dailyTables);
            localStorage.setItem(SEPTEMBER_DAILY_TABLES_STORAGE_KEY, JSON.stringify(dailyTables));
          }
        } catch (e) {
          console.warn('Sync September daily tables background error:', e);
        }

        // Live Auto-Sync SPK in background (GID 622501492)
        try {
          const spreadsheetId = extractSpreadsheetId(sheetUrl) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
          const spkGid = SHEET_TAB_GIDS.spk || '622501492';
          const spkCsv = await fetchSheetCsvText(spreadsheetId, spkGid);
          if (spkCsv) {
            const parsedSpk = parseSPKCSV(spkCsv);
            if (parsedSpk && parsedSpk.length > 0) {
              setSpkRecords(parsedSpk);
              localStorage.setItem(SPK_STORAGE_KEY, JSON.stringify(parsedSpk));
            }
          }
        } catch (e) {
          console.warn('Background SPK sync error:', e);
        }

        // Live Auto-Sync SPL in background (GID 131205278)
        try {
          const spreadsheetId = extractSpreadsheetId(sheetUrl) || '1HfwktSkX2QNtKPGOVNdPK-3PTN1lSj3Rl3KlItbizp0';
          const splGid = SHEET_TAB_GIDS.spl || '131205278';
          const splCsv = await fetchSheetCsvText(spreadsheetId, splGid);
          if (splCsv) {
            const parsedSpl = parseSPLCSV(splCsv);
            if (parsedSpl && parsedSpl.length > 0) {
              setSplRecords(parsedSpl);
              localStorage.setItem(SPL_STORAGE_KEY, JSON.stringify(parsedSpl));
            }
          }
        } catch (e) {
          console.warn('Background SPL sync error:', e);
        }

        const now = new Date();
        setLastSyncedAt(
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err) {
        console.warn('Google Sheets auto-sync error:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [activeTab]
  );

  // Initial sync & periodic auto-polling every 20 seconds
  useEffect(() => {
    syncDataFromSheets(activeTab);

    const interval = setInterval(() => {
      syncDataFromSheets(activeTab);
    }, 20000); // 20 seconds live auto-refresh loop

    const handleFocus = () => {
      syncDataFromSheets(activeTab);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeTab, syncDataFromSheets]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEY, JSON.stringify(units));
  }, [units]);

  // Sync activeTab to URL Hash & listen to Hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        const tab = getTabFromHash(window.location.hash);
        setActiveTab(tab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${tab}`;
    }
    syncDataFromSheets(tab);
  };

  // 3. Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    projectManager: 'ALL',
    marginType: 'ALL',
    status: 'ALL',
    category: 'ALL',
    teamLead: 'ALL',
    sortBy: 'priority',
    sortOrder: 'asc',
  });

  // 4. Sidebar & Modals State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<ProjectUnit | null>(null);
  const [unitModalState, setUnitModalState] = useState<{ isOpen: boolean; unit: Partial<ProjectUnit> | null }>({
    isOpen: false,
    unit: null,
  });
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      projectManager: 'ALL',
      marginType: 'ALL',
      status: 'ALL',
      category: 'ALL',
      teamLead: 'ALL',
      sortBy: 'priority',
      sortOrder: 'asc',
    });
  };

  // Filter & Sort Units
  const filteredUnits = useMemo(() => {
    return units
      .filter((u) => {
        // Search
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchName = u.unitName.toLowerCase().includes(q);
          const matchTarget = u.targetDeliveryDate?.toLowerCase().includes(q) || false;
          if (!matchName && !matchTarget) return false;
        }

        // PM
        if (filters.projectManager !== 'ALL' && u.projectManager !== filters.projectManager) {
          return false;
        }

        // Margin
        if (filters.marginType !== 'ALL' && u.marginType !== filters.marginType) {
          return false;
        }

        // Status
        if (filters.status !== 'ALL' && u.status !== filters.status) {
          return false;
        }

        // Category
        if (filters.category !== 'ALL' && u.progressCategory !== filters.category) {
          return false;
        }

        // Team Lead
        if (filters.teamLead !== 'ALL' && u.teamLead !== filters.teamLead) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filters.sortBy === 'hours') {
          comp = timeToDecimalHours(b.divisionHours.total) - timeToDecimalHours(a.divisionHours.total);
        } else if (filters.sortBy === 'priority') {
          comp = parsePriorityRank(a.priorityOrder) - parsePriorityRank(b.priorityOrder);
        } else if (filters.sortBy === 'name') {
          comp = a.unitName.localeCompare(b.unitName);
        }

        return filters.sortOrder === 'asc' ? comp : -comp;
      });
  }, [units, filters]);

  // Handlers for Add/Edit/Delete Unit
  const handleSaveUnit = (savedUnit: ProjectUnit) => {
    setUnits((prev) => {
      const existsIndex = prev.findIndex((u) => u.id === savedUnit.id);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = savedUnit;
        return next;
      } else {
        return [savedUnit, ...prev];
      }
    });
  };

  const handleDeleteUnit = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data unit proyek ini?')) {
      setUnits((prev) => prev.filter((u) => u.id !== id));
      if (selectedUnitForDetail?.id === id) {
        setSelectedUnitForDetail(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-200 font-sans selection:bg-[#c5a059] selection:text-black flex relative overflow-x-hidden">
      {/* Background Classic Mercedes Car Watermark Layer across all tabs */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-no-repeat transition-all duration-500"
        style={{ 
          backgroundImage: "url('/images/classic_mercedes_bg.jpg')",
          backgroundPosition: bgCarPosition === 'center' ? 'center center' : bgCarPosition === 'top' ? 'center 15%' : bgCarPosition === 'left' ? 'left center' : 'right center',
          opacity: bgCarOpacity,
          filter: 'saturate(1.10) contrast(1.18) brightness(1.15)'
        }}
      />
      {/* Minimal translucent tint layer ensuring high contrast without blocking car silhouette */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/20" />
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        totalCount={units.length}
        filteredCount={filteredUnits.length}
        onOpenAddModal={() => setUnitModalState({ isOpen: true, unit: null })}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenManageTabs={() => setIsManageTabsOpen(true)}
        customTabs={customTabs}
        activeTabIds={activeTabIds}
      />

      {/* Main Workspace Area (offset by left sidebar width on desktop) */}
      <div className="lg:pl-64 xl:pl-72 flex-1 flex flex-col min-w-0 transition-all relative z-10">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          filters={filters}
          setFilters={setFilters}
          totalCount={units.length}
          filteredCount={filteredUnits.length}
          onOpenAddModal={() => setUnitModalState({ isOpen: true, unit: null })}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          onOpenManageTabs={() => setIsManageTabsOpen(true)}
          onUpdateUnits={(newUnits) => setUnits(newUnits)}
          onSyncData={() => syncDataFromSheets(activeTab)}
          lastSyncedAt={lastSyncedAt}
          isAutoSyncing={isSyncing}
        />

        {/* Google Sheets Bottom/Top Sheet Tab Bar */}
        <GoogleSheetTabBar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenManageTabs={() => setIsManageTabsOpen(true)}
          activeTabIds={activeTabIds}
          customTabs={customTabs}
        />

        {/* Main Workspace Body */}
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 py-5 space-y-5">
          {/* Tab Views */}
          {(
            activeTab === 'overview' ||
            activeTab === 'target_september' ||
            activeTab === 'target_agustus' ||
            activeTab.includes('target') ||
            customTabs.some((ct) => ct.id === activeTab && ct.name.toUpperCase().includes('TARGET'))
          ) && (
            <OverviewDashboard
              units={filteredUnits}
              activeTab={activeTab}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              hasilKerjaRecords={activeTab === 'target_agustus' ? hasilKerjaAgustusRecords : hasilKerjaSeptemberRecords}
              liveDailyTables={septemberDailyTables}
            />
          )}

          {activeTab === 'actual_september' && (
            <ActualJobdescAgustusView
              records={actualSeptemberJobdescs}
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              monthLabel="SEPTEMBER"
            />
          )}

          {activeTab === 'hasil_kerja_september' && (
            <HasilKerjaAgustusView
              records={hasilKerjaSeptemberRecords}
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              monthLabel="SEPTEMBER"
            />
          )}

          {activeTab === 'actual_agustus' && (
            <ActualJobdescAgustusView
              records={actualAgustusJobdescs}
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              monthLabel="AGUSTUS"
            />
          )}

          {activeTab === 'table' && (
            <HasilKerjaAgustusView
              records={hasilKerjaAgustusRecords}
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              monthLabel="AGUSTUS"
            />
          )}

          {activeTab === 'hasil_kerja_2023_2026' && (
            <HasilKerja2023_2026View
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
            />
          )}

          {activeTab === 'timeline' && (
            <DeliveryTimeline
              units={deliveryUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
              onRefresh={() => syncDataFromSheets('timeline')}
              isSyncing={isSyncing}
              lastSyncedAt={lastSyncedAt}
            />
          )}

          {activeTab === 'divisions' && (
            <DivisionAnalytics
              units={filteredUnits}
              onSelectUnit={(unit) => setSelectedUnitForDetail(unit)}
            />
          )}

          {activeTab === 'spk' && (
            <SPKView
              records={spkRecords}
              units={filteredUnits}
              onRefresh={() => syncDataFromSheets('spk')}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'spl' && (
            <SPLView
              records={splRecords}
              units={filteredUnits}
              onRefresh={() => syncDataFromSheets('spl')}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'presentation' && (
            <PresentationMode
              units={deliveryUnits.length > 0 ? deliveryUnits : filteredUnits}
              allUnits={units}
            />
          )}

          {/* Generic Sheet View for Custom or Source Google Sheets Tabs */}
          {!['overview', 'target_september', 'actual_september', 'hasil_kerja_september', 'target_agustus', 'actual_agustus', 'table', 'hasil_kerja_2023_2026', 'timeline', 'divisions', 'spk', 'spl', 'presentation'].includes(activeTab) && (
            (() => {
              const allTabOptions = [...PREDEFINED_SHEET_TABS, ...customTabs];
              const match = allTabOptions.find((t) => t.id === activeTab);
              const tabName = match ? match.name : activeTab.toUpperCase();
              const gid = match ? match.gid : SHEET_TAB_GIDS[activeTab] || '0';

              return <GenericSheetView tabName={tabName} gid={gid} initialSearchQuery={filters.search} />;
            })()
          )}
        </main>

      {/* Detail Slide-over Modal when row is selected */}
      {selectedUnitForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0d0d0d] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 sm:p-5 bg-[#141414] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-modern font-black text-white">{selectedUnitForDetail.unitName}</h3>
                  <p className="text-xs text-gray-400">
                    Kepala Proyek: <strong className="text-gray-200">{selectedUnitForDetail.projectManager}</strong> · KD: <strong className="text-[#c5a059]">{selectedUnitForDetail.teamLead}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUnitForDetail(null)}
                className="p-1.5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">MARGIN TYPE</span>
                  <span className="font-bold text-[#c5a059]">{selectedUnitForDetail.marginType}</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">KATEGORI</span>
                  <span className="font-bold text-gray-200">{selectedUnitForDetail.progressCategory}</span>
                </div>
                <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block">STATUS</span>
                  <span className="font-bold text-emerald-400">{selectedUnitForDetail.status}</span>
                </div>
              </div>

              <div className="bg-[#141414] p-4 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-bold text-gray-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#c5a059]" /> Break Down Jam Kerja Divisi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <div>MECHANIC: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.mechanic)}</strong></div>
                  <div>BODY WORK: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.bodyWork)}</strong></div>
                  <div>BODY PAINT: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.bodyPaint)}</strong></div>
                  <div>INTERIOR: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.interior)}</strong></div>
                  <div>CHROME: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.chrome)}</strong></div>
                  <div>BUBUT: <strong className="text-white">{formatTimeString(selectedUnitForDetail.divisionHours.bubut)}</strong></div>
                </div>
                <div className="pt-2 border-t border-white/5 text-right">
                  <span className="text-gray-400">TOTAL AKUMULASI: </span>
                  <strong className="text-[#c5a059] text-sm font-mono ml-1">{formatTimeString(selectedUnitForDetail.divisionHours.total)}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-gray-400">
                <span>Check-In: <strong>{selectedUnitForDetail.unitInDate || '-'}</strong></span>
                <span>Prioritas: <strong>{selectedUnitForDetail.priorityOrder}</strong></span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const u = selectedUnitForDetail;
                    setSelectedUnitForDetail(null);
                    setUnitModalState({ isOpen: true, unit: u });
                  }}
                  className="px-4 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black font-semibold rounded-full transition-colors cursor-pointer shadow-md shadow-[#c5a059]/10"
                >
                  Edit Data Unit Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Unit Modal */}
      <UnitModal
        isOpen={unitModalState.isOpen}
        unit={unitModalState.unit}
        onClose={() => setUnitModalState({ isOpen: false, unit: null })}
        onSave={handleSaveUnit}
      />

      {/* Export / Import Modal */}
      <DataManagementModal
        isOpen={isDataModalOpen}
        units={units}
        activeTab={activeTab}
        onClose={() => setIsDataModalOpen(false)}
        onUpdateUnits={(updated) => setUnits(updated)}
        onResetToDefault={() => setUnits(INITIAL_PROJECT_UNITS)}
      />

      {/* Kelola & Tambah Tab Google Sheets Modal */}
      <ManageTabsModal
        isOpen={isManageTabsOpen}
        onClose={() => setIsManageTabsOpen(false)}
        activeTabIds={activeTabIds}
        onToggleTab={handleToggleTab}
        customTabs={customTabs}
        onAddCustomTab={handleAddCustomTab}
        onDeleteCustomTab={handleDeleteCustomTab}
        onSelectTab={(tabId) => handleTabChange(tabId as DashboardTab)}
      />

      {/* Floating Background Car Control Widget */}
      <div className="fixed bottom-5 right-5 z-40 print:hidden flex items-center gap-2">
        <button
          onClick={() => setIsBgSettingsOpen(!isBgSettingsOpen)}
          title="Sesuaikan Kecerahan & Visibilitas Mobil Background"
          className="px-3.5 py-2 bg-[#0a0a0a]/90 hover:bg-[#141414] text-[#c5a059] border border-[#c5a059]/40 rounded-full shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer group"
        >
          <Car className="w-4 h-4 text-[#c5a059] group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Background Mobil</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#c5a059]/20 text-[#c5a059] font-mono">
            {Math.round(bgCarOpacity * 100)}%
          </span>
        </button>
      </div>

      {/* Background Car Settings Modal Popover */}
      {isBgSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0e0e0e]/95 border border-[#c5a059]/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-black/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#c5a059] font-bold text-sm">
                <Car className="w-5 h-5" />
                <span>Pengaturan Visibilitas Mobil Background</span>
              </div>
              <button
                onClick={() => setIsBgSettingsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5 text-xs text-gray-300">
              <p className="text-gray-400">
                Sesuaikan intensitas gambar mobil klasik di belakang agar data tetap terlihat jelas dan mobil terlihat memukau.
              </p>

              {/* Opacity Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                  Tingkat Kecerahan Gambar Mobil:
                </label>
                <div className="grid grid-cols-5 gap-1.5 font-mono">
                  {[
                    { label: '35%', val: 0.35 },
                    { label: '50%', val: 0.50 },
                    { label: '70%', val: 0.70 },
                    { label: '85%', val: 0.85 },
                    { label: '100%', val: 1.00 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => handleUpdateBgOpacity(p.val)}
                      className={`py-2 text-center rounded-xl border font-bold transition-all cursor-pointer ${
                        Math.abs(bgCarOpacity - p.val) < 0.05
                          ? 'bg-[#c5a059] text-black border-[#c5a059] shadow-lg font-black'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block">
                  Fokus Posisi Mobil:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'center', label: 'Tengah' },
                    { id: 'top', label: 'Atas/Grill' },
                    { id: 'left', label: 'Kiri' },
                    { id: 'right', label: 'Kanan' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => handleUpdateBgPosition(pos.id)}
                      className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        bgCarPosition === pos.id
                          ? 'bg-[#c5a059] text-black border-[#c5a059] font-bold shadow'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-[#c5a059] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fitur Glassmorphism Aktif</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Semua tabel dan kartu kini menggunakan lapisan kaca transparan (*frosted glass*) sehingga siluet mobil klasik Mercedes di belakang terlihat menembus tabel data dengan elegan.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsBgSettingsOpen(false)}
                  className="px-5 py-2 bg-[#c5a059] hover:bg-[#d4af66] text-black font-bold rounded-xl cursor-pointer shadow-lg transition-all"
                >
                  Terapkan & Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md py-4 text-center text-xs text-gray-500 print:hidden">
        <p>Dashboard Rekap Jam Kerja Unit SM © 2023 - 2026. Restorasi Kendaraan Klasik & Premium.</p>
      </footer>
      </div>
    </div>
  );
}
