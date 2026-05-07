export type TransformMode = 'translate' | 'rotate' | 'scale';

export interface CuboidData {
    id: string;
    width: number;
    height: number;
    depth: number;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

export interface CuboidProps {
    data: CuboidData;
    isSelected: boolean;
    isOverlapping: boolean;
    mode: TransformMode;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
}

export interface CuboidPanelProps {
    cuboids: CuboidData[];
    selectedId: string | null;
    mode: TransformMode;
    onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
    onDelete: (id: string) => void;
    onSelect: (id: string[] | null) => void;
    onModeChange: (mode: TransformMode) => void;
}
