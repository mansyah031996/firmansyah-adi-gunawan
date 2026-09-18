/**
 * Safe LocalStorage wrapper to prevent QuotaExceededError from crashing the app
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`[LocalStorage] Quota exceeded while saving "${key}". Attempting cleanup...`, e);
    try {
      // Clear heavy cached multi-year records to free space
      localStorage.removeItem('sm_hasil_kerja_2023_2026_records_v4');
      localStorage.setItem(key, value);
      return true;
    } catch (e2) {
      console.error(`[LocalStorage] Unable to persist "${key}":`, e2);
      return false;
    }
  }
}

export function safeLocalStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`[LocalStorage] Failed to read "${key}":`, e);
    return null;
  }
}
