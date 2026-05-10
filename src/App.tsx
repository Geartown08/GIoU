import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Cuboid } from './components/Cuboid';
import { SceneGuides } from './components/SceneGuides';
import type { CuboidData, TransformMode } from './types/Cuboid';
import type { ToolMode } from './types/Workspace';
import './App.css';

let nextId = 1;

const RANDOM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
const MODE_STATUS: Record<'select' | 'mselect' | 'translate' | 'rotate' | 'scale', string> = {
  select: 'Mode: Select',
  mselect: 'Mode: Analyse',
  translate: 'Mode: Move',
  rotate: 'Mode: Rotate',
  scale: 'Mode: Scale',
};

function randomInRange(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getNextPosition(count: number): [number, number, number] {
  const angle = (count * 137.5 * Math.PI) / 180;
  const radius = 1.5 + count * 0.4;
  return [
    parseFloat((Math.cos(angle) * radius).toFixed(2)),
    0,
    parseFloat((Math.sin(angle) * radius).toFixed(2)),
  ];
}

function createRandomCuboid(id: string): CuboidData {
  const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

  return {
    id,
    width: randomInRange(0.5, 2),
    height: randomInRange(0.5, 2),
    depth: randomInRange(0.5, 2),
    color,
    position: [randomInRange(-3, 3), randomInRange(0, 3), randomInRange(-3, 3)],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

function App() {
  const [cuboids, setCuboids] = useState<CuboidData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Ready');
  const objectAddShortcutRef = useRef<(() => void) | null>(null);
  const selectedIdsRef = useRef<string[]>([]);
  const activeToolRef = useRef<ToolMode>('select');

  const mode: TransformMode = activeTool === 'rotate' || activeTool === 'scale' ? activeTool : 'translate';

  const showStatus = useCallback((message: string) => {
    setStatusMessage(message);
  }, []);

  const clearSelection = useCallback((message = 'Selection cleared') => {
    selectedIdsRef.current = [];
    setSelectedIds([]);
    showStatus(message);
  }, [showStatus]);

  const handleAdd = useCallback((data: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => {
    const id = String(nextId++);
    setCuboids(prev => [
      ...prev,
      { ...data, id, position: getNextPosition(prev.length), rotation: [0, 0, 0], scale: [1, 1, 1] },
    ]);
    showStatus(`Added cuboid #${id}`);
  }, [showStatus]);

  const handleDelete = useCallback((id: string) => {
    setCuboids(prev => prev.filter(c => c.id !== id));
    selectedIdsRef.current = selectedIdsRef.current.filter(selectedId => selectedId !== id);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    showStatus(`Deleted cuboid #${id}`);
  }, [showStatus]);

  const handleDeleteSelected = useCallback(() => {
    const idsToDelete = selectedIdsRef.current;
    if (idsToDelete.length === 0) {
      showStatus('Select a cuboid before deleting');
      return;
    }

    const ids = [...idsToDelete];
    setCuboids(prev => prev.filter(c => !ids.includes(c.id)));
    selectedIdsRef.current = [];
    setSelectedIds([]);
    showStatus(ids.length === 1 ? `Deleted cuboid #${ids[0]}` : `Deleted ${ids.length} cuboids`);
  }, [showStatus]);

  const handleSelect = useCallback((id: string | null) => {
    if (id === null) {
      clearSelection();
      return;
    }

    if (activeToolRef.current === 'mselect') {
      const prev = selectedIdsRef.current;
      const wasSelected = prev.includes(id);
      const next = prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id].slice(-2);
      selectedIdsRef.current = next;
      setSelectedIds(next);
      if (next.length === 0) {
        showStatus('Comparison cleared');
      } else if (wasSelected) {
        showStatus(`Removed #${id} from comparison`);
      } else if (next.length === 1) {
        showStatus(`Comparison: #${next[0]} (pick one more)`);
      } else {
        showStatus(`Comparing #${next[0]} and #${next[1]}`);
      }
      return;
    }

    selectedIdsRef.current = [id];
    setSelectedIds([id]);
    showStatus(`Selected cuboid #${id}`);
  }, [clearSelection, showStatus]);

  const handleUpdate = useCallback((id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (activeToolRef.current === 'mselect' && selectedIdsRef.current.length > 0) {
      showStatus('Press Esc to clear comparison');
      return;
    }
    clearSelection();
  }, [clearSelection, showStatus]);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    setCuboids(loaded);
    selectedIdsRef.current = [];
    setSelectedIds([]);
    nextId = Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1;
    showStatus(loaded.length > 0 ? `Loaded ${loaded.length} cuboids` : 'Scene cleared');
  }, [showStatus]);

  const handleObjectAddShortcutChange = useCallback((handler: (() => void) | null) => {
    objectAddShortcutRef.current = handler;
  }, []);

  const handleToolChange = useCallback((tool: ToolMode) => {
    const currentSelectedIds = selectedIdsRef.current;
    activeToolRef.current = tool;
    setActiveTool(tool);

    if (tool === 'select' || tool === 'mselect' || tool === 'translate' || tool === 'rotate' || tool === 'scale') {
      showStatus(MODE_STATUS[tool]);
    } else if (tool === 'random') {
      const id = String(nextId++);
      setCuboids(prev => [...prev, createRandomCuboid(id)]);
      showStatus(`Added random cuboid #${id}`);
      activeToolRef.current = 'select';
      setActiveTool('select');
    } else if (tool === 'duplicate' && currentSelectedIds.length > 0) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === currentSelectedIds[0]);
        if (!source) return prev;
        const newId = String(nextId++);
        const copy = {
          ...source,
          id: newId,
          position: [
            source.position[0] + 0.5,
            source.position[1],
            source.position[2] + 0.5,
          ] as [number, number, number],
        };
        selectedIdsRef.current = [newId];
        setSelectedIds([newId]); // select the copy so you can move it immediately
        showStatus(`Duplicated cuboid #${source.id} as #${newId}`);
        return [...prev, copy];
      });
      activeToolRef.current = 'translate';
      setActiveTool('translate'); // switch to translate so it's ready to drag
    } else if (tool === 'duplicate') {
      showStatus('Select a cuboid before duplicating');
      activeToolRef.current = 'select';
      setActiveTool('select');
    } else if (tool === 'delete' && currentSelectedIds.length > 0) {
      handleDeleteSelected();
      activeToolRef.current = 'select';
      setActiveTool('select');
    } else if (tool === 'delete') {
      showStatus('Select a cuboid before deleting');
      activeToolRef.current = 'select';
      setActiveTool('select');
    }
  }, [handleDeleteSelected, showStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === 'a') {
        if (objectAddShortcutRef.current) {
          objectAddShortcutRef.current();
        } else {
          showStatus('Open Object tab to add a cuboid with A');
        }
        return;
      }
      if (key === 'escape') {
        clearSelection();
        return;
      }
      const map: Record<string, ToolMode> = {
        v: 'select',
        m: 'mselect',
        w: 'translate',
        e: 'rotate',
        r: 'scale',
        q: 'random',
        d: 'duplicate',
        x: 'delete',
      };
      if (map[key]) handleToolChange(map[key]);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [clearSelection, handleToolChange, showStatus]);

  const sceneContent = (
    <Canvas camera={{ position: [4, 4, 8], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#4488ff" />

      <Grid
        args={[20, 20]}
        cellColor="#333"
        sectionColor="#555"
        fadeDistance={30}
        position={[0, -0.01, 0]}
      />

      <SceneGuides showAxes={showAxes} showOrigin={showOrigin} />

      {cuboids.map(c => (
        <Cuboid
          key={c.id}
          data={c}
          isSelected={selectedIds.includes(c.id)}
          mode={mode}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
          onDragStart={() => setOrbitEnabled(false)}
          onDragEnd={() => setOrbitEnabled(true)}
        />
      ))}

      <mesh onClick={handleCanvasClick} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>

      <OrbitControls enabled={orbitEnabled} enableDamping dampingFactor={0.05} />
    </Canvas>
  );

  return (
    <WorkspaceLayout
      viewportContent={sceneContent}
      cuboids={cuboids}
      selectedId={selectedIds}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onSelect={handleSelect}
      onLoadScene={handleLoadScene}
      activeTool={activeTool}
      onToolChange={handleToolChange}
      showAxes={showAxes}
      showOrigin={showOrigin}
      onToggleAxes={() => setShowAxes(prev => !prev)}
      onToggleOrigin={() => setShowOrigin(prev => !prev)}
      statusMessage={statusMessage}
      onObjectAddShortcutChange={handleObjectAddShortcutChange}
      onStatus={showStatus}
    />
  );
}

export default App;
