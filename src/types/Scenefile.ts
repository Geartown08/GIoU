import type { CuboidData } from "./Cuboid.ts";

export interface SceneFile {
    version: 1;
    savedAt: string;
    cuboids: CuboidData[];
}