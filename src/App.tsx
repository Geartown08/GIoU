import { useState, useCallback } from 'react';
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
  const [activeTool, onToolChange] = useState<ToolMode>('select');
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
      onToolChange={onToolChange}
    />
  );
}

export default App;
