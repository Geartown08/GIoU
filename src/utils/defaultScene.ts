import type { CuboidData } from '../types/Cuboid';

export const DEFAULT_SCENE_CUBOID_COUNT = 2;

/**
 * Returns a fresh copy of the default demo scene every call.
 *
 * Uses non-numeric ids (`demo-*`) so the regular `nextId` counter — which only
 * tracks numeric ids — keeps starting at `1` after the scene loads.
 */
export function createDefaultScene(): CuboidData[] {
  return [
    {
      id: 'demo-reference',
      name: 'Reference Box',
      width: 3.2,
      height: 2.5,
      depth: 2.8,
      color: '#4ecdc4',
      position: [-0.55, 1.25, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    {
      id: 'demo-prediction',
      name: 'Prediction Box',
      width: 2.8,
      height: 2.2,
      depth: 2.6,
      color: '#ff6b6b',
      position: [0.65, 1.35, 0.45],
      rotation: [0, 0.28, 0.12],
      scale: [1, 1, 1],
    },
  ];
}
