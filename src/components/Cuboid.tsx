import { useCallback, useState } from 'react';
import { Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { Edges, TransformControls } from '@react-three/drei';
import { useTheme } from '../hooks/useTheme';
import type { CuboidProps } from '../types/Cuboid.ts';

const SELECTION_STYLE = {
  night: {
    edge: '#fff4a8',
    shell: '#facc15',
    shellOpacity: 0.18,
  },
  day: {
    edge: '#f59e0b',
    shell: '#fbbf24',
    shellOpacity: 0.2,
  },
} as const;

const ANALYSE_STYLE = {
  night: {
    edge: '#67e8f9',
    shell: '#22d3ee',
    shellOpacity: 0.1,
  },
  day: {
    edge: '#0891b2',
    shell: '#06b6d4',
    shellOpacity: 0.08,
  },
} as const;

export function Cuboid({
  data,
  isSelected,
  isAnalysed,
  mode,
  onSelect,
  onUpdate,
  onDragStart,
  onDragEnd,
}: CuboidProps) {
  const { theme } = useTheme();
  const selectionStyle = SELECTION_STYLE[theme];
  const analyseStyle = ANALYSE_STYLE[theme];
  const [mesh, setMesh] = useState<Mesh | null>(null);
  const setMeshRef = useCallback((node: Mesh | null) => {
    setMesh(node);
  }, []);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  const syncTransform = useCallback(() => {
    if (mesh) {
      const { position, rotation, scale } = mesh;
      onUpdate(data.id, {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z],
      });
    }
  }, [data.id, mesh, onUpdate]);

  const handleMouseUp = () => {
    onDragEnd();
    syncTransform();
  };

  return (
    <>
      {isSelected && mesh && mode && (
        <TransformControls
          object={mesh}
          mode={mode}
          onMouseDown={onDragStart}
          onObjectChange={syncTransform}
          onMouseUp={handleMouseUp}
        />
      )}
      <mesh
        ref={setMeshRef}
        position={data.position}
        rotation={data.rotation}
        scale={data.scale}
        onClick={handleClick}
      >
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <meshStandardMaterial
          color={data.color}
          emissive={isSelected ? data.color : '#000000'}
          transparent={true}
          opacity={isSelected ? 0.78 : isAnalysed ? 0.72 : 0.62}
          depthWrite={true}
          emissiveIntensity={isSelected ? 0.18 : 0}
          roughness={0.56}
          metalness={0.04}
        />
        {isAnalysed && (
          <>
            {!isSelected && (
              <mesh
                scale={1.014}
                renderOrder={16}
                raycast={() => null}
              >
                <boxGeometry args={[data.width, data.height, data.depth]} />
                <meshBasicMaterial
                  color={analyseStyle.shell}
                  transparent
                  opacity={analyseStyle.shellOpacity}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
            )}
            <Edges
              scale={1.055}
              threshold={1}
              color={analyseStyle.edge}
              lineWidth={2.1}
              renderOrder={17}
              depthTest={false}
              toneMapped={false}
              raycast={() => null}
            />
          </>
        )}
        {isSelected && (
          <>
            <mesh
              scale={1.018}
              renderOrder={18}
              raycast={() => null}
            >
              <boxGeometry args={[data.width, data.height, data.depth]} />
              <meshBasicMaterial
                color={selectionStyle.shell}
                transparent
                opacity={selectionStyle.shellOpacity}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
            <Edges
              scale={1.035}
              threshold={1}
              color={selectionStyle.edge}
              lineWidth={3.2}
              renderOrder={19}
              depthTest={false}
              toneMapped={false}
              raycast={() => null}
            />
          </>
        )}
      </mesh>
    </>
  );
}
