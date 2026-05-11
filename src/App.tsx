import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Cuboid } from './components/Cuboid';
import { SceneGuides } from './components/SceneGuides';
import type { CuboidData, TransformMode } from './types/Cuboid';
import type { ToolMode } from './types/Workspace';
import { CsgIntersectionLayer } from './components/CsgIntersectionLayer';
import './App.css';

let nextId = 1;

const RANDOM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];

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

  const mode: TransformMode = activeTool === 'rotate' || activeTool === 'scale' ? activeTool : 'translate';

  const handleAdd = useCallback((data: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => {
    const id = String(nextId++);
    setCuboids(prev => [
      ...prev,
      { ...data, id, position: getNextPosition(prev.length), rotation: [0, 0, 0], scale: [1, 1, 1] },
    ]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCuboids(prev => prev.filter(c => c.id !== id));
    setSelectedIds([]);
  }, []);

  const handleSelect = useCallback((selId: string[] | null, id: string | null) => {
    if (id === null || selId === null || selId.length === 0) {
      setSelectedIds(id === null ? [] : [id]);
    } else if (selId.includes(id)) {
      setSelectedIds([id]);
    } else if (selId.length > 1) {
      setSelectedIds([selId[1], id]);
    } else {
      setSelectedIds([...selId, id]);
    }
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    setCuboids(loaded);
    setSelectedIds([]);
    nextId = Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1;
  }, []);

  const handleToolChange = useCallback((tool: ToolMode) => {
    setActiveTool(tool);

    if (tool === 'add') {
      handleAdd({ width: 1, height: 1, depth: 1, color: '#4ecdc4' });
      setActiveTool('select');
    } else if (tool === 'random') {
      const id = String(nextId++);
      setCuboids(prev => [...prev, createRandomCuboid(id)]);
      setActiveTool('select');
    } else if (tool === 'duplicate' && selectedIds.length > 0) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === selectedIds[0]);
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
        setSelectedIds([newId]); // select the copy so you can move it immediately
        return [...prev, copy];
      });
      setActiveTool('translate'); // switch to translate so it's ready to drag
    } else if (tool === 'delete' && selectedIds.length > 0) {
      handleDelete(selectedIds[0]);
      setActiveTool('select');
    }
  }, [selectedIds, handleAdd, handleDelete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, ToolMode> = {
        v: 'select',
        m: 'mselect',
        w: 'translate',
        e: 'rotate',
        r: 'scale',
        d: 'duplicate',
        x: 'delete',
      };
      if (map[key]) handleToolChange(map[key]);
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleToolChange]);

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
          onSelect={(id) => handleSelect(selectedIds, id)}
          onUpdate={handleUpdate}
          onDragStart={() => setOrbitEnabled(false)}
          onDragEnd={() => setOrbitEnabled(true)}
        />
      ))}

      <CsgIntersectionLayer cuboids={cuboids} />

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
      onSelect={(id) => handleSelect(selectedIds, id)}
      onLoadScene={handleLoadScene}
      activeTool={activeTool}
      onToolChange={handleToolChange}
      showAxes={showAxes}
      showOrigin={showOrigin}
      onToggleAxes={() => setShowAxes(prev => !prev)}
      onToggleOrigin={() => setShowOrigin(prev => !prev)}
    />
  );
}

export default App;
