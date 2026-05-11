import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { OrthographicCamera } from 'three';
import { WorkspaceLayout } from './components/workspace/WorkspaceLayout';
import { Cuboid } from './components/Cuboid';
import { SceneGuides } from './components/SceneGuides';
import { ViewCubeDirectionArrows } from './components/ViewCubeGizmo';
import type { CuboidData, TransformMode } from './types/Cuboid';
import { CsgIntersectionLayer } from './components/CsgIntersectionLayer';
import type { ToolMode, ViewMode } from './types/Workspace';
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

function getNextPosition2D(count: number): [number, number, number] {
  const angle = (count * 137.5 * Math.PI) / 180;
  const radius = 1.5 + count * 0.4;
  return [
    parseFloat((Math.cos(angle) * radius).toFixed(2)),
    parseFloat((Math.sin(angle) * radius).toFixed(2)),
    0,
  ];
}

function createRandomCuboid(id: string): CuboidData {
  const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];

  return {
    id,
    name: `Object ${id}`,
    width: randomInRange(0.5, 2),
    height: randomInRange(0.5, 2),
    depth: randomInRange(0.5, 2),
    color,
    position: [randomInRange(-3, 3), randomInRange(0, 3), randomInRange(-3, 3)],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  };
}

/**
 * Manages perspective ↔ orthographic camera switching.
 * In 2D mode: front-facing orthographic camera looking down the Z-axis (XY plane).
 * In 3D mode: restores the original perspective camera.
 */
function CameraRig({ viewMode }: { viewMode: ViewMode }) {
  const { camera, set, size } = useThree();
  const savedPerspCam = useRef(camera);
  const orthoCam = useRef<OrthographicCamera | null>(null);

  useEffect(() => {
    if (viewMode === '2d') {
      savedPerspCam.current = camera;
      const aspect = size.width / size.height;
      const d = 10;
      const ortho = new OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 1000);
      ortho.position.set(0, 0, 20); // in front of scene, looking down -Z toward XY plane
      ortho.lookAt(0, 0, 0);
      orthoCam.current = ortho;
      set({ camera: ortho });
    } else {
      if (orthoCam.current) {
        set({ camera: savedPerspCam.current });
        orthoCam.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Keep ortho frustum correct on canvas resize
  useEffect(() => {
    if (viewMode === '2d' && orthoCam.current) {
      const aspect = size.width / size.height;
      const d = 10;
      orthoCam.current.left = -d * aspect;
      orthoCam.current.right = d * aspect;
      orthoCam.current.updateProjectionMatrix();
    }
  }, [size, viewMode]);

  return null;
}

function App() {
  const [cuboids, setCuboids] = useState<CuboidData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showOrigin, setShowOrigin] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');

  const mode: TransformMode = activeTool === 'rotate' || activeTool === 'scale' ? activeTool : 'translate';

  const handleAdd = useCallback((data: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => {
    const num = nextId;
    const id = String(nextId++);
    const name = data.name.trim() || `Object ${num}`;
    setCuboids(prev => [
      ...prev,
      {
        ...data,
        name,
        id,
        position: viewMode === '2d' ? getNextPosition2D(prev.length) : getNextPosition(prev.length),
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
    ]);
  }, [viewMode]);

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
    setCuboids(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (viewMode === '2d') {
        // Preserve the 3rd-axis values so they survive round-tripping back to 3D
        if (updates.position) updates = { ...updates, position: [updates.position[0], updates.position[1], c.position[2]] };
        if (updates.rotation) updates = { ...updates, rotation: [c.rotation[0], c.rotation[1], updates.rotation[2]] };
        if (updates.scale)    updates = { ...updates, scale:    [updates.scale[0],  updates.scale[1],  c.scale[2]] };
      }
      return { ...c, ...updates };
    }));
  }, [viewMode]);

  const handleCanvasClick = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    // Back-fill name for scenes saved before the name field existed
    const withNames = loaded.map((c, i) => ({ ...c, name: c.name || `Object ${i + 1}` }));
    setCuboids(withNames);
    setSelectedIds([]);
    nextId = Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1;
  }, []);

  const handleToolChange = useCallback((tool: ToolMode) => {
    setActiveTool(tool);

    if (tool === 'add') {
      handleAdd({ width: 1, height: 1, depth: 1, color: '#4ecdc4', name: '' });
      setActiveTool('select');
    } else if (tool === 'random') {
      const id = String(nextId++);
      if (viewMode === '2d') {
        const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
        setCuboids(prev => [...prev, {
          id,
          name: `Object ${id}`,
          width:  randomInRange(0.5, 2),
          height: randomInRange(0.5, 2),
          depth:  1,
          color,
          position: [randomInRange(-3, 3), randomInRange(-3, 3), 0],
          rotation: [0, 0, randomInRange(0, Math.PI * 2)],
          scale: [1, 1, 1],
        }]);
      } else {
        setCuboids(prev => [...prev, createRandomCuboid(id)]);
      }
      setActiveTool('select');
    } else if (tool === 'duplicate' && selectedIds.length > 0) {
      setCuboids(prev => {
        const source = prev.find(c => c.id === selectedIds[0]);
        if (!source) return prev;
        const newId = String(nextId++);
        const copy = {
          ...source,
          id: newId,
          position: viewMode === '2d'
            ? [source.position[0] + 0.5, source.position[1] + 0.5, 0] as [number, number, number]
            : [source.position[0] + 0.5, source.position[1], source.position[2] + 0.5] as [number, number, number],
        };
        setSelectedIds([newId]); // select the copy so you can move it immediately
        return [...prev, copy];
      });
      setActiveTool('translate'); // switch to translate so it's ready to drag
    } else if (tool === 'delete' && selectedIds.length > 0) {
      handleDelete(selectedIds[0]);
      setActiveTool('select');
    }
  }, [selectedIds, viewMode, handleAdd, handleDelete]);

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
      <CameraRig viewMode={viewMode} />

      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#4488ff" />

      <Grid
        args={[20, 20]}
        cellColor="#333"
        sectionColor="#555"
        fadeDistance={30}
        position={viewMode === '2d' ? [0, 0, -0.01] : [0, -0.01, 0]}
        rotation={viewMode === '2d' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
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

      {/* makeDefault registers the controls so GizmoHelper can update them mid-tween */}
      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enableDamping
        dampingFactor={0.05}
        enableRotate={viewMode === '3d'}
      />

      {/* Unity-style orientation gizmo — only shown in 3D mode */}
      {viewMode === '3d' && (
        <GizmoHelper alignment="top-right" margin={[80, 80]}>
          <GizmoViewcube
            color="#1e1e3a"
            strokeColor="#646cff"
            textColor="#c0c0ff"
            opacity={0.9}
            hoverColor="#2a2a5a"
          />
          <ViewCubeDirectionArrows />
        </GizmoHelper>
      )}
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
      onRename={handleRename}
      onLoadScene={handleLoadScene}
      activeTool={activeTool}
      onToolChange={handleToolChange}
      showAxes={showAxes}
      showOrigin={showOrigin}
      onToggleAxes={() => setShowAxes(prev => !prev)}
      onToggleOrigin={() => setShowOrigin(prev => !prev)}
      viewMode={viewMode}
      onToggleViewMode={() => setViewMode(prev => prev === '3d' ? '2d' : '3d')}
    />
  );
}

export default App;
