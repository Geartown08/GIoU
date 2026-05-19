import type { IoUResult } from '../utils/giou';

export type ToolMode = 'select' | 'mselect' | 'translate' | 'rotate' | 'scale' | 'random' | 'duplicate' | 'delete';

export type RightPanelTab = 'object' | 'explain';

export type ViewMode = '2d' | '3d';

export interface ToolDefinition {
  key: ToolMode;
  label: string;
  shortcut?: string;
}

export interface CalcItem {
  id: string;
  name: string;
  color: string;
  volume: number;
  surfaceArea: number;
  position: [number, number, number];
}

export interface CalculationData {
  items: [CalcItem, CalcItem];
  giou: IoUResult;
}
