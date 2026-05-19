import type { CuboidData } from "../types/Cuboid";
import type { Box2D, Box3D } from "./giou";

export function ConvertCuboid(cuboid: CuboidData): Box3D {
  const cuboidScale = [cuboid.width * 0.5, cuboid.height * 0.5, cuboid.depth* 0.5];
  const xyz1 = cuboid.position.map((p, i) => p + cuboidScale[i]);
  const xyz2 = cuboid.position.map((p, i) => p - cuboidScale[i]);
  return {x1:xyz2[0], y1:xyz2[1], z1:xyz2[2], x2:xyz1[0], y2:xyz1[1], z2:xyz1[2]};
}

/** Projects a cuboid onto the XY plane (front view, Z removed) for 2-D GIoU. */
export function ConvertCuboid2D(cuboid: CuboidData): Box2D {
  const halfW = cuboid.width  * 0.5;
  const halfH = cuboid.height * 0.5;
  const cx = cuboid.position[0];
  const cy = cuboid.position[1];
  return { x1: cx - halfW, y1: cy - halfH, x2: cx + halfW, y2: cy + halfH };
}

export function cuboidVolume(c: CuboidData): number {
  return c.width * c.height * c.depth * c.scale[0] * c.scale[1] * c.scale[2];
}

export function cuboidSurfaceArea(c: CuboidData): number {
  const w = c.width  * c.scale[0];
  const h = c.height * c.scale[1];
  const d = c.depth  * c.scale[2];
  return 2 * (w * h + w * d + h * d);
}
