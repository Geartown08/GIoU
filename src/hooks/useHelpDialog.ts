import { useCallback, useState } from 'react';

const STORAGE_KEY = 'giou-help-seen-version';
const CURRENT_VERSION = '1';

function shouldShowOnFirstRun(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== CURRENT_VERSION;
  } catch {
    return true;
  }
}

export function useHelpDialog() {
  const [helpOpen, setHelpOpen] = useState<boolean>(() => shouldShowOnFirstRun());

  const openHelp = useCallback(() => {
    setHelpOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    } catch {
      // localStorage may be unavailable (private mode etc.) — ignore.
    }
  }, []);

  return { helpOpen, openHelp, closeHelp };
}
