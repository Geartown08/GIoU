import { useState, useCallback, useEffect, useRef } from 'react';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { SceneCanvas } from './components/scene/SceneCanvas';
import { useCuboids, createRandomCuboid } from './hooks/useCuboids';
import { useSelection } from './hooks/useSelection';
import { useCalculations } from './hooks/useCalcutlations';
import { useHelpDialog } from './hooks/useHelpDialog';
import type { CuboidData, TransformMode } from './types/Cuboid';
import type { ToolMode, ViewMode } from './types/Workspace';
import './App.css';

const MODE_STATUS: Record<'select' | 'mselect' | 'translate' | 'rotate' | 'scale', string> = {
  select: 'Mode: Select', mselect: 'Mode: Analyse',
  translate: 'Mode: Move', rotate: 'Mode: Rotate', scale: 'Mode: Scale',
};

function App() {
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [showAxes, setShowAxes] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [analysePanelOpen, setAnalysePanelOpen] = useState(false);
  const activeToolRef = useRef<ToolMode>('select');
  const objectAddShortcutRef = useRef<(() => void) | null>(null);

  const showStatus = useCallback((msg: string) => setStatusMessage(msg), []);

  const { helpOpen, openHelp, closeHelp } = useHelpDialog();
  const helpOpenRef = useRef<boolean>(helpOpen);
  useEffect(() => { helpOpenRef.current = helpOpen; }, [helpOpen]);

  const {
    cuboids, setCuboids,
    handleAdd, handleDelete: handleDeleteCuboid, handleUpdate, handleRename,
    handleLoadScene: handleLoadSceneCuboids,
    nextId,
  } = useCuboids(viewMode, showStatus);

  const {
    activeSelectedIds,
    analyseSelectedIds,
    activeSelectedIdsRef,
    analyseSelectedIdsRef,
    setActiveSelectedIds,
    setAnalyseSelectedIds,
    clearSelection,
    handleSelect,
  } = useSelection(activeToolRef, showStatus);

  // Keep both selection tracks consistent when cuboids are removed.
  const handleDelete = useCallback((id: string) => {
    const previousAnalyseIds = analyseSelectedIdsRef.current;
    const nextAnalyseIds = previousAnalyseIds.filter(s => s !== id);
    const nextActiveIds = activeSelectedIdsRef.current.filter(s => s !== id);
    handleDeleteCuboid(id);
    setActiveSelectedIds(nextActiveIds);
    setAnalyseSelectedIds(nextAnalyseIds);
    if (
      activeToolRef.current === 'mselect' &&
      previousAnalyseIds.length === 2 &&
      nextAnalyseIds.length === 1
    ) {
      showStatus(`Comparison: #${nextAnalyseIds[0]} (pick one more)`);
    }
  }, [
    activeSelectedIdsRef,
    analyseSelectedIdsRef,
    handleDeleteCuboid,
    setActiveSelectedIds,
    setAnalyseSelectedIds,
    showStatus,
  ]);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    handleLoadSceneCuboids(loaded);
    setActiveSelectedIds([]);
    setAnalyseSelectedIds([]);
  }, [handleLoadSceneCuboids, setActiveSelectedIds, setAnalyseSelectedIds]);

  const calculations = useCalculations(cuboids, analyseSelectedIds, viewMode);

  const handleAnalysePanelClose = useCallback(() => {
    setAnalysePanelOpen(false);
  }, []);

  const mode: TransformMode | null =
    activeTool === 'translate' || activeTool === 'rotate' || activeTool === 'scale'
      ? activeTool
      : null;

  const handleDeleteSelected = useCallback(() => {
    const ids = [...activeSelectedIdsRef.current];
    if (ids.length === 0) { showStatus('Select a cuboid before deleting'); return; }
    setCuboids(prev => prev.filter(c => !ids.includes(c.id)));
    setActiveSelectedIds([]);
    setAnalyseSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    showStatus(ids.length === 1 ? `Deleted cuboid #${ids[0]}` : `Deleted ${ids.length} cuboids`);
  }, [activeSelectedIdsRef, showStatus, setCuboids, setActiveSelectedIds, setAnalyseSelectedIds]);

  const handleToolChange = useCallback((tool: ToolMode) => {
    const currentActiveSelectedIds = activeSelectedIdsRef.current;
    const currentAnalyseSelectedIds = analyseSelectedIdsRef.current;

    if (tool === 'mselect') {
      const wasAnalyseTool = activeToolRef.current === 'mselect';
      activeToolRef.current = 'mselect';
      setActiveTool('mselect');
      const nextPanelOpen = wasAnalyseTool ? !analysePanelOpen : true;
      setAnalysePanelOpen(nextPanelOpen);

      if (!nextPanelOpen) {
        showStatus('Analyse panel hidden');
      } else if (currentAnalyseSelectedIds.length === 2) {
        showStatus(`Comparing #${currentAnalyseSelectedIds[0]} and #${currentAnalyseSelectedIds[1]}`);
      } else if (currentAnalyseSelectedIds.length === 1) {
        showStatus(`Comparison: #${currentAnalyseSelectedIds[0]} (pick one more)`);
      } else {
        showStatus(MODE_STATUS.mselect);
      }
      return;
    }

    activeToolRef.current = tool;
    setActiveTool(tool);

    if (['select', 'mselect', 'translate', 'rotate', 'scale'].includes(tool)) {
      showStatus(MODE_STATUS[tool as keyof typeof MODE_STATUS]);
    } else if (tool === 'random') {
      const id = nextId();
      setCuboids(prev => [...prev, createRandomCuboid(id)]);
      showStatus(`Added random cuboid #${id}`);
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'duplicate' && currentActiveSelectedIds.length > 0) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === currentActiveSelectedIds[0]);
        if (!source) return prev;
        const newId = nextId();
        const copy: CuboidData = {
          ...source,
          id: newId,
          position: viewMode === '2d'
            ? [source.position[0] + 0.5, source.position[1] + 0.5, 0]
            : [source.position[0] + 0.5, source.position[1], source.position[2] + 0.5],
        };
        setActiveSelectedIds([newId]);
        showStatus(`Duplicated cuboid #${source.id} as #${newId}`);
        return [...prev, copy];
      });
      activeToolRef.current = 'translate'; setActiveTool('translate');
    } else if (tool === 'duplicate') {
      showStatus('Select a cuboid before duplicating');
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'delete' && currentActiveSelectedIds.length > 0) {
      handleDeleteSelected();
      activeToolRef.current = 'select'; setActiveTool('select');
    } else if (tool === 'delete') {
      showStatus('Select a cuboid before deleting');
      activeToolRef.current = 'select'; setActiveTool('select');
    }
  }, [
    activeSelectedIdsRef,
    analysePanelOpen,
    analyseSelectedIdsRef,
    viewMode,
    handleDeleteSelected,
    showStatus,
    nextId,
    setCuboids,
    setActiveSelectedIds,
  ]);

  const handleCanvasClick = useCallback(() => {
    if (activeToolRef.current === 'mselect' && analyseSelectedIdsRef.current.length > 0) {
      showStatus('Press Esc to clear comparison'); return;
    }
    clearSelection();
  }, [analyseSelectedIdsRef, clearSelection, showStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // While the Help dialog is open, leave keyboard shortcuts (including Esc)
      // to the native <dialog>, so users don't accidentally edit the scene.
      if (helpOpenRef.current) return;
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
      const map: Record<string, ToolMode> = { v: 'select', m: 'mselect', w: 'translate', e: 'rotate', r: 'scale', q: 'random', d: 'duplicate', x: 'delete' };
      if (map[key]) handleToolChange(map[key]);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [clearSelection, handleToolChange, showStatus]);

  const sceneContent = (
    <SceneCanvas
      cuboids={cuboids}
      activeSelectedIds={activeSelectedIds}
      analyseSelectedIds={analyseSelectedIds}
      mode={mode}
      viewMode={viewMode}
      showAxes={showAxes} showOrigin={showOrigin}
      onSelect={handleSelect} onUpdate={handleUpdate} onCanvasClick={handleCanvasClick}
    />
  );

  return (
    <WorkspaceLayout
      viewportContent={sceneContent}
      cuboids={cuboids}
      activeSelectedIds={activeSelectedIds}
      analyseSelectedIds={analyseSelectedIds}
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
      onUpdate={handleUpdate}
      helpOpen={helpOpen}
      onHelpOpen={openHelp}
      onHelpClose={closeHelp}
    />
  );
}

export default App;
