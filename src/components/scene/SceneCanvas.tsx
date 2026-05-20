import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewcube } from '@react-three/drei';
import { Cuboid } from '../Cuboid';
import { SceneGuides } from '../SceneGuides';
import { ViewCubeDirectionArrows } from '../ViewCubeGizmo';
import { CsgIntersectionLayer } from '../CsgIntersectionLayer';
import { CameraRig } from '../CamerRig';
import type { CuboidData, TransformMode } from '../../types/Cuboid';
import type { ViewMode } from '../../types/Workspace';

interface SceneCanvasProps {
  cuboids: CuboidData[];
  selectedIds: string[];
  mode: TransformMode;
  viewMode: ViewMode;
  showAxes: boolean;
  showOrigin: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => void;
  onCanvasClick: () => void;
}

export function SceneCanvas({
  cuboids, selectedIds, mode, viewMode,
  showAxes, showOrigin, onSelect, onUpdate, onCanvasClick,
}: SceneCanvasProps) {
  const orbitEnabledRef = useRef(true);

  return (
    <Canvas camera={{ position: [4, 4, 8], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <CameraRig viewMode={viewMode} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#4488ff" />
      <Grid
        args={[20, 20]}
        cellColor="#333" sectionColor="#555" fadeDistance={30}
        position={viewMode === '2d' ? [0, 0, -0.01] : [0, -0.01, 0]}
        rotation={viewMode === '2d' ? [Math.PI / 2, 0, 0] : [0, 0, 0]}
      />
      <SceneGuides showAxes={showAxes} showOrigin={showOrigin} />
      {cuboids.map(c => (
        <Cuboid
          key={c.id} data={c}
          isSelected={selectedIds.includes(c.id)}
          mode={mode} onSelect={onSelect} onUpdate={onUpdate}
          onDragStart={() => { orbitEnabledRef.current = false; }}
          onDragEnd={() => { orbitEnabledRef.current = true; }}
        />
      ))}
      <CsgIntersectionLayer cuboids={cuboids} />
      <mesh onClick={onCanvasClick} visible={false}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial />
      </mesh>
      <OrbitControls makeDefault enabled={true} enableDamping dampingFactor={0.05} enableRotate={viewMode === '3d'} />
      {viewMode === '3d' && (
        <GizmoHelper alignment="top-right" margin={[80, 80]}>
          <GizmoViewcube color="#1e1e3a" strokeColor="#646cff" textColor="#c0c0ff" opacity={0.9} hoverColor="#2a2a5a" />
          <ViewCubeDirectionArrows />
        </GizmoHelper>
      )}
    </Canvas>
  );
}