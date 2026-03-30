import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { CuboidPanel } from './components/CuboidPanel';
import './App.css';
import type { CuboidData, TransformMode } from './types/Cuboid.ts';
import { Cuboid } from './components/Cuboid.tsx';

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
  const [mode, setMode] = useState<TransformMode>('translate');
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  // W/E/R keyboard shortcuts for transform mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'w' || e.key === 'W') setMode('translate');
      if (e.key === 'e' || e.key === 'E') setMode('rotate');
      if (e.key === 'r' || e.key === 'R') setMode('scale');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleSelect = useCallback((id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  const handleUpdate = useCallback((id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', background: '#111' }}>
      <CuboidPanel
        cuboids={cuboids}
        selectedId={selectedId}
        mode={mode}
        onAdd={handleAdd}
        onDelete={handleDelete}
        onSelect={id => setSelectedId(id)}
        onModeChange={setMode}
      />

      <Canvas camera={{ position: [4, 4, 8], fov: 50 }}>
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
    </div>
  );
}

export default App;
