import { useState, useCallback, useEffect, useRef } from 'react';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { SceneCanvas } from './components/scene/SceneCanvas';
import { useCuboids, createRandomCuboid } from './hooks/useCuboids';
import { useSelection } from './hooks/useSelection';
import { useCalculations } from './hooks/useCalcutlations';
import type { CuboidData, TransformMode } from './types/Cuboid';
import type { ToolMode, ViewMode } from './types/Workspace';
import './App.css';

const MODE_STATUS: Record<'select' | 'mselect' | 'translate' | 'rotate' | 'scale', string> = {
  select: 'Mode: Select', mselect: 'Mode: Analyse',
  translate: 'Mode: Move', rotate: 'Mode: Rotate', scale: 'Mode: Scale',
};

function App() {
  const [activeTool, setActiveTool]   = useState<ToolMode>('select');
  const [showAxes, setShowAxes]       = useState(true);
  const [showOrigin, setShowOrigin]   = useState(true);
  const [viewMode, setViewMode]       = useState<ViewMode>('3d');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [analyseDismissedKey, setAnalyseDismissedKey] = useState<string | null>(null);
  const activeToolRef = useRef<ToolMode>('select');
  const objectAddShortcutRef = useRef<(() => void) | null>(null);

  const showStatus = useCallback((msg: string) => setStatusMessage(msg), []);

  const {
    cuboids, setCuboids, selectedIdsRef,
    handleAdd, handleDelete: handleDeleteCuboid, handleUpdate, handleRename,
    handleLoadScene: handleLoadSceneCuboids,
    nextId,
  } = useCuboids(viewMode, showStatus);

  const { selectedIds, setSelectedIds, clearSelection, handleSelect } =
    useSelection(activeToolRef, selectedIdsRef, showStatus);

  // useCuboids only touches selectedIdsRef; wrap so the useSelection state
  // stays in sync when cuboids are removed or replaced.
  const handleDelete = useCallback((id: string) => {
    const previousSelectedIds = selectedIdsRef.current;
    const nextSelectedIds = previousSelectedIds.filter(s => s !== id);
    handleDeleteCuboid(id);
    setSelectedIds(nextSelectedIds);
    if (
      activeToolRef.current === 'mselect' &&
      previousSelectedIds.length === 2 &&
      nextSelectedIds.length === 1
    ) {
      showStatus(`Comparison: #${nextSelectedIds[0]} (pick one more)`);
    }
  }, [handleDeleteCuboid, selectedIdsRef, setSelectedIds, showStatus]);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    handleLoadSceneCuboids(loaded);
    setSelectedIds([]);
  }, [handleLoadSceneCuboids, setSelectedIds]);

  const calculations = useCalculations(cuboids, selectedIds, viewMode);

  // Stable, order-independent key for the current comparison pair.
  const comparisonKey = selectedIds.length === 2
    ? [...selectedIds].sort().join('|')
    : null;

  // Drop a stale dismissal as soon as the active pair changes. Set during render —
  // React's recommended pattern for "adjust state on prop change."
  if (analyseDismissedKey !== null && analyseDismissedKey !== comparisonKey) {
    setAnalyseDismissedKey(null);
  }

  const analysePanelOpen = comparisonKey !== null && comparisonKey !== analyseDismissedKey;

  const handleAnalysePanelClose = useCallback(() => {
    setAnalyseDismissedKey(comparisonKey);
  }, [comparisonKey]);

  const mode: TransformMode | null =
    activeTool === 'translate' || activeTool === 'rotate' || activeTool === 'scale'
      ? activeTool
      : null;

  const handleDeleteSelected = useCallback(() => {
    const ids = [...selectedIdsRef.current];
    if (ids.length === 0) { showStatus('Select a cuboid before deleting'); return; }
    setCuboids(prev => prev.filter(c => !ids.includes(c.id)));
    selectedIdsRef.current = [];
    setSelectedIds([]);
    showStatus(ids.length === 1 ? `Deleted cuboid #${ids[0]}` : `Deleted ${ids.length} cuboids`);
  }, [showStatus, setCuboids, selectedIdsRef, setSelectedIds]);

  const handleToolChange = useCallback((tool: ToolMode) => {
    const currentSelectedIds = selectedIdsRef.current;
    activeToolRef.current = tool;
    setActiveTool(tool);

    if (['select','mselect','translate','rotate','scale'].includes(tool)) {
      showStatus(MODE_STATUS[tool as keyof typeof MODE_STATUS]);
    } else if (tool === 'random') {
      const id = nextId();
      setCuboids(prev => [...prev, createRandomCuboid(id)]);
      showStatus(`Added random cuboid #${id}`);
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'duplicate' && currentSelectedIds.length > 0) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === currentSelectedIds[0]);
        if (!source) return prev;
        const newId = nextId();
        const copy: CuboidData = {
          ...source,
          id: newId,
          position: viewMode === '2d'
            ? [source.position[0] + 0.5, source.position[1] + 0.5, 0]
            : [source.position[0] + 0.5, source.position[1], source.position[2] + 0.5],
        };
        selectedIdsRef.current = [newId];
        setSelectedIds([newId]);
        showStatus(`Duplicated cuboid #${source.id} as #${newId}`);
        return [...prev, copy];
      });
      activeToolRef.current = 'translate'; setActiveTool('translate');
    } else if (tool === 'duplicate') {
      showStatus('Select a cuboid before duplicating');
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'delete' && currentSelectedIds.length > 0) {
      handleDeleteSelected();
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'delete') {
      showStatus('Select a cuboid before deleting');
      activeToolRef.current = 'select'; setActiveTool('select');
    }
  }, [viewMode, handleDeleteSelected, showStatus, nextId, setCuboids, selectedIdsRef, setSelectedIds]);

  const handleCanvasClick = useCallback(() => {
    if (activeToolRef.current === 'mselect' && selectedIdsRef.current.length > 0) {
      showStatus('Press Esc to clear comparison'); return;
    }
    clearSelection();
  }, [clearSelection, showStatus, selectedIdsRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'a') {
        if (objectAddShortcutRef.current) objectAddShortcutRef.current();
        else showStatus('Open Object tab to add a cuboid with A');
        return;
      }
      if (key === 'escape') {
        clearSelection(activeToolRef.current === 'mselect' ? 'Comparison cleared' : 'Selection cleared');
        return;
      }
      const map: Record<string, ToolMode> = { v:'select', m:'mselect', w:'translate', e:'rotate', r:'scale', q:'random', d:'duplicate', x:'delete' };
      if (map[key]) handleToolChange(map[key]);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [clearSelection, handleToolChange, showStatus]);

  const sceneContent = (
    <SceneCanvas
      cuboids={cuboids} selectedIds={selectedIds} mode={mode} viewMode={viewMode}
      showAxes={showAxes} showOrigin={showOrigin}
      onSelect={handleSelect} onUpdate={handleUpdate} onCanvasClick={handleCanvasClick}
    />
  );

  return (
    <WorkspaceLayout
      viewportContent={sceneContent}
      cuboids={cuboids} selectedId={selectedIds}
      onAdd={handleAdd} onDelete={handleDelete} onRename={handleRename}
      onSelect={handleSelect} onLoadScene={handleLoadScene}
      activeTool={activeTool} onToolChange={handleToolChange}
      showAxes={showAxes} showOrigin={showOrigin}
      onToggleAxes={() => setShowAxes(p => !p)}
      onToggleOrigin={() => setShowOrigin(p => !p)}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode(p => p === '3d' ? '2d' : '3d')}
      statusMessage={statusMessage}
      onObjectAddShortcutChange={h => { objectAddShortcutRef.current = h; }}
      onStatus={showStatus}
      analysePanelOpen={analysePanelOpen}
      onAnalysePanelClose={handleAnalysePanelClose}
      analyseCalc={calculations}
    />
  );
}

export default App;
