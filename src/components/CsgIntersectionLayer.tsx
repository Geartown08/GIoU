import { useMemo } from 'react';
import { CsgIntersectionHighlight } from './CsgIntersectionHighlight';
import type { CuboidData } from '../types/Cuboid';

interface CsgIntersectionLayerProps {
  cuboids: CuboidData[];
}

export function CsgIntersectionLayer({ cuboids }: CsgIntersectionLayerProps) {
  const pairs = useMemo(() => {
    const result: Array<[string, string]> = [];
    for (let i = 0; i < cuboids.length; i++) {
      for (let j = i + 1; j < cuboids.length; j++) {
        result.push([cuboids[i].id, cuboids[j].id]);
      }
    }
    return result;
  }, [cuboids]);

  return (
    <>
      {pairs.map(([idA, idB]) => {
        const a = cuboids.find(c => c.id === idA);
        const b = cuboids.find(c => c.id === idB);
        if (!a || !b) return null;
        return (
          <CsgIntersectionHighlight
            key={`csg-${idA}-${idB}`}
            a={a}
            b={b}
          />
        );
      })}
    </>
  );
}
