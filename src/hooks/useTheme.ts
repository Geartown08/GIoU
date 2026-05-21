import { useEffect, useState } from 'react';

export type Theme = 'night' | 'day';

const STORAGE_KEY = 'workspace-theme';
const CHANGE_EVENT = 'workspace-theme-change';
const VALID_THEMES: Theme[] = ['night', 'day'];

function getStoredTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (VALID_THEMES.includes(stored as Theme)) return stored as Theme;
  // First run: honour the OS preference, default to night otherwise.
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'day';
  return 'night';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Sync every hook instance: when any caller flips the theme, the others hear
  // it via a window-level CustomEvent and update their local state.
  useEffect(() => {
    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Theme>).detail;
      if (VALID_THEMES.includes(next)) setThemeState(next);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  const setTheme = (value: Theme) => {
    setThemeState(value);
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent<Theme>(CHANGE_EVENT, { detail: value }));
  };

  const toggleTheme = () => {
    setTheme(theme === 'night' ? 'day' : 'night');
  };

  return { theme, setTheme, toggleTheme };
}
