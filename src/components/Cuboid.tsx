import { useRef } from 'react';
import {AdditiveBlending, Mesh} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import type { CuboidProps } from '../types/Cuboid.ts';

export function Cuboid({ data, isSelected, mode, onSelect, onUpdate, onDragStart, onDragEnd }: CuboidProps) {
  const meshRef = useRef<Mesh>(null);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
  };

  const handleMouseUp = () => {
    onDragEnd();
    if (meshRef.current) {
      const { position, rotation, scale } = meshRef.current;
      onUpdate(data.id, {
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: [scale.x, scale.y, scale.z],
      });
    }
  };

  return (
    <>
      {isSelected && meshRef.current && (
        <TransformControls
          object={meshRef.current}
          mode={mode}
          onMouseDown={onDragStart}
          onMouseUp={handleMouseUp}
        />
      )}
      <mesh
        ref={meshRef}
        position={data.position}
        rotation={data.rotation}
        scale={data.scale}
        onClick={handleClick}
      >
        <boxGeometry args={[data.width, data.height, data.depth]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : data.color}
          emissive={isSelected ? data.color : '#000000'}
          transparent={true}
          blending={AdditiveBlending}
          opacity={1}
          depthWrite={false}
          emissiveIntensity={isSelected ? 0.4 : 0}
        />
      </mesh>
    </>
  );
}
