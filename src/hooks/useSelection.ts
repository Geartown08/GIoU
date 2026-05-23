import { useState, useCallback, useRef } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { ToolMode } from '../types/Workspace';

function useSyncedSelection(): [
  string[],
  Dispatch<SetStateAction<string[]>>,
  MutableRefObject<string[]>,
] {
  const [selectedIds, setSelectedIdsState] = useState<string[]>([]);
  const selectedIdsRef = useRef<string[]>([]);
  const setSelectedIds = useCallback<Dispatch<SetStateAction<string[]>>>((value) => {
    if (typeof value !== 'function') {
      selectedIdsRef.current = value;
      setSelectedIdsState(value);
      return;
    }

    setSelectedIdsState(prev => {
      const next = (value as (previous: string[]) => string[])(prev);
      selectedIdsRef.current = next;
      return next;
    });
  }, []);

  return [selectedIds, setSelectedIds, selectedIdsRef];
}

export function useSelection(
  activeToolRef: MutableRefObject<ToolMode>,
  showStatus: (msg: string) => void,
) {
  const [activeSelectedIds, setActiveSelectedIds, activeSelectedIdsRef] = useSyncedSelection();
  const [analyseSelectedIds, setAnalyseSelectedIds, analyseSelectedIdsRef] = useSyncedSelection();

  const clearActiveSelection = useCallback((message = 'Selection cleared') => {
    setActiveSelectedIds([]);
    showStatus(message);
  }, [setActiveSelectedIds, showStatus]);

  const clearAnalyseSelection = useCallback((message = 'Comparison cleared') => {
    setAnalyseSelectedIds([]);
    showStatus(message);
  }, [setAnalyseSelectedIds, showStatus]);

  const clearSelection = useCallback((message?: string) => {
    if (activeToolRef.current === 'mselect') {
      clearAnalyseSelection(message ?? 'Comparison cleared');
      return;
    }
    clearActiveSelection(message ?? 'Selection cleared');
  }, [activeToolRef, clearActiveSelection, clearAnalyseSelection]);

  const handleSelect = useCallback((id: string | null) => {
    if (id === null) { clearSelection(); return; }

    if (activeToolRef.current === 'mselect') {
      const prev = analyseSelectedIdsRef.current;
      const wasSelected = prev.includes(id);
      const next = wasSelected ? prev.filter(s => s !== id) : [...prev, id].slice(-2);
      setAnalyseSelectedIds(next);
      if (next.length === 0)      showStatus('Comparison cleared');
      else if (wasSelected)       showStatus(`Removed #${id} from comparison`);
      else if (next.length === 1) showStatus(`Comparison: #${next[0]} (pick one more)`);
      else                        showStatus(`Comparing #${next[0]} and #${next[1]}`);
      return;
    }

    setActiveSelectedIds([id]);
    showStatus(`Selected cuboid #${id}`);
  }, [
    activeToolRef,
    analyseSelectedIdsRef,
    clearSelection,
    setActiveSelectedIds,
    setAnalyseSelectedIds,
    showStatus,
  ]);

  return {
    activeSelectedIds,
    analyseSelectedIds,
    activeSelectedIdsRef,
    analyseSelectedIdsRef,
    setActiveSelectedIds,
    setAnalyseSelectedIds,
    clearActiveSelection,
    clearAnalyseSelection,
    clearSelection,
    handleSelect,
  };
}
