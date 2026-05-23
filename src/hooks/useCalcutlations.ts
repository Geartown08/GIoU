import { useMemo } from 'react';
import type { CuboidData } from '../types/Cuboid';
import type { CalculationData, ViewMode } from '../types/Workspace';
import { cuboidVolume, cuboidSurfaceArea } from '../utils/cuboidBoxConvert';
import { giou2DOriented, giou3DOriented } from '../utils/giouOriented';

export function useCalculations(
  cuboids: CuboidData[],
  selectedIds: string[],
  viewMode: ViewMode,
): CalculationData | null {
  return useMemo(() => {
    if (selectedIds.length !== 2) return null;
    const a = cuboids.find(c => c.id === selectedIds[0]);
    const b = cuboids.find(c => c.id === selectedIds[1]);
    if (!a || !b) return null;

    const giou = viewMode === '2d' ? giou2DOriented(a, b) : giou3DOriented(a, b);
    const toItem = (c: CuboidData) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      volume: cuboidVolume(c),
      surfaceArea: cuboidSurfaceArea(c),
      position: c.position,
    });
    return { items: [toItem(a), toItem(b)], giou };
  }, [cuboids, selectedIds, viewMode]);
}
