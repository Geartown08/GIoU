import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CsgIntersectionHighlight, wireframeMaterial } from './CsgIntersectionHighlight';
import type { CuboidData } from '../types/Cuboid';

interface CsgIntersectionLayerProps {
  cuboids: CuboidData[];
}

export function CsgIntersectionLayer({ cuboids }: CsgIntersectionLayerProps) {
  const pairs = useMemo(() => {
    const result: Array<[CuboidData, CuboidData]> = [];
    for (let i = 0; i < cuboids.length; i++) {
      for (let j = i + 1; j < cuboids.length; j++) {
        result.push([cuboids[i], cuboids[j]]);
      }
    }
    return result;
  }, [cuboids]);

  // Drive the shared wireframe pulse once per frame instead of per pair.
  const elapsedRef = useRef(0);
  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const pulse = (Math.sin(elapsedRef.current * 4) + 1) / 2;
    wireframeMaterial.opacity = 0.4 + pulse * 0.6;
  });

  return (
    <>
      {pairs.map(([a, b]) => (
        <CsgIntersectionHighlight
          key={`csg-${a.id}-${b.id}`}
          a={a}
          b={b}
        />
      ))}
    </>
  );
}
