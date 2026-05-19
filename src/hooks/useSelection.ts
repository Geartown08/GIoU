import { useState, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import type { ToolMode } from '../types/Workspace';

export function useSelection(
  activeToolRef: MutableRefObject<ToolMode>,
  selectedIdsRef: MutableRefObject<string[]>,
  showStatus: (msg: string) => void,
) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const clearSelection = useCallback((message = 'Selection cleared') => {
    selectedIdsRef.current = [];
    setSelectedIds([]);
    showStatus(message);
  }, [showStatus]);

  const handleSelect = useCallback((id: string | null) => {
    if (id === null) { clearSelection(); return; }

    if (activeToolRef.current === 'mselect') {
      const prev = selectedIdsRef.current;
      const wasSelected = prev.includes(id);
      const next = wasSelected ? prev.filter(s => s !== id) : [...prev, id].slice(-2);
      selectedIdsRef.current = next;
      setSelectedIds(next);
      if (next.length === 0)      showStatus('Comparison cleared');
      else if (wasSelected)       showStatus(`Removed #${id} from comparison`);
      else if (next.length === 1) showStatus(`Comparison: #${next[0]} (pick one more)`);
      else                        showStatus(`Comparing #${next[0]} and #${next[1]}`);
      return;
    }

    selectedIdsRef.current = [id];
    setSelectedIds([id]);
    showStatus(`Selected cuboid #${id}`);
  }, [clearSelection, showStatus]);

  return { selectedIds, setSelectedIds, clearSelection, handleSelect };
}