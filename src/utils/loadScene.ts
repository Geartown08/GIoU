import type { CuboidData } from '../types/Cuboid.ts';
import type { SceneFile } from '../types/Scenefile.ts';

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isVector3(value: unknown): value is [number, number, number] {
    return Array.isArray(value) && value.length === 3 && value.every(isFiniteNumber);
}

function isCuboidData(value: unknown): value is CuboidData {
    if (!value || typeof value !== 'object') return false;

    const cuboid = value as Record<string, unknown>;
    const hasValidName = cuboid.name === undefined || typeof cuboid.name === 'string';

    return (
        typeof cuboid.id === 'string' &&
        hasValidName &&
        isFiniteNumber(cuboid.width) &&
        isFiniteNumber(cuboid.height) &&
        isFiniteNumber(cuboid.depth) &&
        typeof cuboid.color === 'string' &&
        isVector3(cuboid.position) &&
        isVector3(cuboid.rotation) &&
        isVector3(cuboid.scale)
    );
}

function validateCuboids(cuboids: unknown[]): CuboidData[] | null {
    return cuboids.every(isCuboidData) ? cuboids : null;
}

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

            const cuboids = validateCuboids(parsed.cuboids);
            if (!cuboids) {
                onError?.('Invalid scene file: malformed cuboid data');
                return;
            }

            onLoad(cuboids);
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
