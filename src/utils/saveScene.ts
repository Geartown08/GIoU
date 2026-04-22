import type { CuboidData } from '../types/Cuboid.ts';
import type { SceneFile } from '../types/Scenefile.ts';

export function saveScene(cuboids: CuboidData[], filename = 'scene.json'): void {
    const scene: SceneFile = {
        version: 1,
        savedAt: new Date().toISOString(),
        cuboids,
    };

    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}