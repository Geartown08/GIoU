import { useCallback, useState } from 'react';
import { AdditiveBlending, Mesh } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import type { CuboidProps } from '../types/Cuboid.ts';

export function Cuboid({ data, isSelected, isOverlapping, mode, onSelect, onUpdate, onDragStart, onDragEnd }: CuboidProps) {
  const [mesh, setMesh] = useState<Mesh | null>(null);
  const setMeshRef = useCallback((node: Mesh | null) => {
    setMesh(node);
  }, []);

  const displayColor = isSelected ? '#ffffff' : isOverlapping ? '#ffffff' : data.color;
  const emissiveColor = isSelected ? data.color : isOverlapping ? '#ffffff' : '#000000';
  const emissiveIntensity = isSelected ? 0.4 : isOverlapping ? 0.8 : 0;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  const handleMouseUp = () => {
    onDragEnd();
    if (mesh) {
      const { position, rotation, scale } = mesh;
      onUpdate(data.id, {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z],
      });
    }
  };

  return (
    <>
      {isSelected && mesh && (
        <TransformControls
          object={mesh}
          mode={mode}
          onMouseDown={onDragStart}
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
          color={displayColor}
          emissive={emissiveColor}
          transparent={true}
          blending={AdditiveBlending}
          opacity={1}
          depthWrite={false}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </>
  );
}