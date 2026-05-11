export type ToolMode = 'select' | 'mselect' | 'translate' | 'rotate' | 'scale' | 'add' | 'random' | 'duplicate' | 'delete';

export type RightPanelTab = 'metrics' | 'object' | 'explain';

export type ViewMode = '2d' | '3d';

export interface ToolDefinition {
  key: ToolMode;
  label: string;
  shortcut?: string;
}
