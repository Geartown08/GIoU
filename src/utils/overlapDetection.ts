import type { CuboidData } from '../types/Cuboid';

function getAABB(c: CuboidData) {
  const [px, py, pz] = c.position;
  const [sx, sy, sz] = c.scale;
  const hw = (c.width  * sx) / 2;
  const hh = (c.height * sy) / 2;
  const hd = (c.depth  * sz) / 2;
  return {
    minX: px - hw, maxX: px + hw,
    minY: py - hh, maxY: py + hh,
    minZ: pz - hd, maxZ: pz + hd,
  };
}

function overlaps(a: CuboidData, b: CuboidData): boolean {
  const A = getAABB(a), B = getAABB(b);
  return (
    A.minX < B.maxX && A.maxX > B.minX &&
    A.minY < B.maxY && A.maxY > B.minY &&
    A.minZ < B.maxZ && A.maxZ > B.minZ
  );
}

export function getOverlappingIds(cuboids: CuboidData[]): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i < cuboids.length; i++) {
    for (let j = i + 1; j < cuboids.length; j++) {
      if (overlaps(cuboids[i], cuboids[j])) {
        result.add(cuboids[i].id);
        result.add(cuboids[j].id);
      }
    }
  }
  return result;
}