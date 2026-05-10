import { useEffect, useMemo, useState } from 'react';

export type UiScaleOverride = 'auto' | '1' | '1.1' | '1.15' | '1.25' | '1.5' | '1.75';

const STORAGE_KEY = 'workspace-ui-scale';
const VALID_OVERRIDES: UiScaleOverride[] = ['auto', '1', '1.1', '1.15', '1.25', '1.5', '1.75'];

function getStoredOverride(): UiScaleOverride {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return VALID_OVERRIDES.includes(stored as UiScaleOverride) ? (stored as UiScaleOverride) : 'auto';
}

function getAutoScale(width: number): number {
  if (width >= 3440) return 1.5;
  if (width >= 2560) return 1.25;
  if (width >= 1920) return 1.125;
  return 1;
}

export function useUiScale() {
  const [override, setOverride] = useState<UiScaleOverride>(() => getStoredOverride());
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resolvedScale = useMemo(() => {
    return override === 'auto' ? getAutoScale(viewportWidth) : Number(override);
  }, [override, viewportWidth]);

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(resolvedScale));
    document.documentElement.dataset.uiScale = override;
  }, [override, resolvedScale]);

  const setScaleOverride = (value: UiScaleOverride) => {
    setOverride(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return {
    scaleOverride: override,
    resolvedScale,
    setScaleOverride,
  };
}
