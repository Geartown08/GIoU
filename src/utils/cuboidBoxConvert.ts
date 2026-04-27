import type { CuboidData } from "../types/Cuboid";
import type { Box3D } from "./giou";

export function ConvertCuboid(cuboid: CuboidData){
  const cuboidScale = [cuboid.width * 0.5, cuboid.height * 0.5, cuboid.depth* 0.5];
  const xyz1 = cuboid.position.map((p, i) => p + cuboidScale[i]);
  const xyz2 = cuboid.position.map((p, i) => p - cuboidScale[i]);
  return {x1:xyz2[0], y1:xyz2[1], z1:xyz2[2], x2:xyz1[0], y2:xyz1[1], z2:xyz1[2]} as Box3D;
}
