import { useState, useCallback, useRef } from 'react';
import type { CuboidData } from '../types/Cuboid';
import type { ViewMode } from '../types/Workspace';

let nextId = 1;

const RANDOM_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];

function randomInRange(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function getNextPosition(count: number): [number, number, number] {
  const angle = (count * 137.5 * Math.PI) / 180;
  const radius = 1.5 + count * 0.4;
  return [parseFloat((Math.cos(angle) * radius).toFixed(2)), 0, parseFloat((Math.sin(angle) * radius).toFixed(2))];
}

function getNextPosition2D(count: number): [number, number, number] {
  const angle = (count * 137.5 * Math.PI) / 180;
  const radius = 1.5 + count * 0.4;
  return [parseFloat((Math.cos(angle) * radius).toFixed(2)), parseFloat((Math.sin(angle) * radius).toFixed(2)), 0];
}

export function createRandomCuboid(id: string): CuboidData {
  const color = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
  return {
    id, name: `Object ${id}`,
    width: randomInRange(0.5, 2), height: randomInRange(0.5, 2), depth: randomInRange(0.5, 2),
    color,
    position: [randomInRange(-3, 3), randomInRange(0, 3), randomInRange(-3, 3)],
    rotation: [0, 0, 0], scale: [1, 1, 1],
  };
}

export function useCuboids(viewMode: ViewMode, showStatus: (msg: string) => void) {
  const [cuboids, setCuboids] = useState<CuboidData[]>([]);
  const selectedIdsRef = useRef<string[]>([]);

  const handleAdd = useCallback((data: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => {
    const num = nextId;
    const id = String(nextId++);
    const name = data.name.trim() || `Object ${num}`;
    setCuboids(prev => [...prev, {
      ...data, name, id,
      position: viewMode === '2d' ? getNextPosition2D(prev.length) : getNextPosition(prev.length),
      rotation: [0, 0, 0], scale: [1, 1, 1],
    }]);
    showStatus(`Added cuboid #${id}`);
  }, [showStatus, viewMode]);

  const handleDelete = useCallback((id: string) => {
    setCuboids(prev => prev.filter(c => c.id !== id));
    selectedIdsRef.current = selectedIdsRef.current.filter(sid => sid !== id);
    showStatus(`Deleted cuboid #${id}`);
  }, [showStatus]);

  const handleUpdate = useCallback((id: string, updates: Partial<Pick<CuboidData, 'position' | 'rotation' | 'scale'>>) => {
    setCuboids(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (viewMode === '2d') {
        if (updates.position) updates = { ...updates, position: [updates.position[0], updates.position[1], c.position[2]] };
        if (updates.rotation) updates = { ...updates, rotation: [c.rotation[0], c.rotation[1], updates.rotation[2]] };
        if (updates.scale)    updates = { ...updates, scale:    [updates.scale[0],  updates.scale[1],  c.scale[2]] };
      }
      return { ...c, ...updates };
    }));
  }, [viewMode]);

  const handleRename = useCallback((id: string, name: string) => {
    setCuboids(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  }, []);

  const handleLoadScene = useCallback((loaded: CuboidData[]) => {
    const withNames = loaded.map((c, i) => ({ ...c, name: c.name || `Object ${i + 1}` }));
    setCuboids(withNames);
    selectedIdsRef.current = [];
    nextId = Math.max(0, ...loaded.map(c => parseInt(c.id))) + 1;
    showStatus(loaded.length > 0 ? `Loaded ${loaded.length} cuboids` : 'Scene cleared');
  }, [showStatus]);

  return {
    cuboids, setCuboids, selectedIdsRef,
    handleAdd, handleDelete, handleUpdate, handleRename, handleLoadScene,
    nextId: () => String(nextId++),
    randomColors: RANDOM_COLORS,
    randomInRange,
  };
}