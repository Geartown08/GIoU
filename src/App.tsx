import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Cuboid } from './components/Cuboid';
import type { CuboidData, TransformMode } from './types/Cuboid';
import type { ToolMode } from './types/Workspace';
import './App.css';

let nextId = 1;

function getNextPosition(count: number): [number, number, number] {
  const angle = (count * 137.5 * Math.PI) / 180;
  const radius = 1.5 + count * 0.4;
  return [
    parseFloat((Math.cos(angle) * radius).toFixed(2)),
    0,
    parseFloat((Math.sin(angle) * radius).toFixed(2)),
  ];
}

function App() {
  const [cuboids, setCuboids] = useState<CuboidData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [orbitEnabled, setOrbitEnabled] = useState(true);

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
    setSelectedId(prev => (prev === id ? null : prev));
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    setCuboids(loaded);
    setSelectedId(null);
    nextId = Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1;
  }, []);

  const handleToolChange = useCallback((tool: ToolMode) => {
    setActiveTool(tool);

    if (tool === 'add') {
      handleAdd({ width: 1, height: 1, depth: 1, color: '#4ecdc4' });
      setActiveTool('select');
    } else if (tool === 'duplicate' && selectedId) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === selectedId);
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
        setSelectedId(newId); // select the copy so you can move it immediately
        return [...prev, copy];
      });
      setActiveTool('translate'); // switch to translate so it's ready to drag
    } else if (tool === 'delete' && selectedId) {
      handleDelete(selectedId);
      setActiveTool('select');
    }
  }, [selectedId, handleAdd, handleDelete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, ToolMode> = {
        v: 'select',
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

      {cuboids.map(c => (
        <Cuboid
          key={c.id}
          data={c}
          isSelected={selectedId === c.id}
          mode={mode}
          onSelect={(id) => handleSelect(selectedId === id ? null : id)}
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
      selectedId={selectedId}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onSelect={handleSelect}
      onLoadScene={handleLoadScene}
      activeTool={activeTool}
      onToolChange={handleToolChange}
    />
  );
}

export default App;