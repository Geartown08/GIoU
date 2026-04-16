import type { CuboidData } from '../types/Cuboid.ts';
import type { SceneFile } from '../types/Scenefile.ts';

export function loadScene(
    file: File,
    onLoad: (cuboids: CuboidData[]) => void,
    onError?: (err: string) => void
): void {
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const parsed: SceneFile = JSON.parse(e.target?.result as string);

            if (parsed.version !== 1) {
                onError?.(`Unsupported scene version: ${parsed.version}`);
                return;
            }

            if (!Array.isArray(parsed.cuboids)) {
                onError?.('Invalid scene file: missing cuboids');
                return;
            }

            onLoad(parsed.cuboids);
        } catch {
            onError?.('Failed to parse scene file');
        }
    };

    reader.readAsText(file);
}

export function openAndLoadScene(
    onLoad: (cuboids: CuboidData[]) => void,
    onError?: (err: string) => void
): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        loadScene(file, onLoad, onError);
    };

    input.click();
}