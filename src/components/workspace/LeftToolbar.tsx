import type { ToolMode, ToolDefinition } from '../../types/Workspace';

const TOOLS: ToolDefinition[] = [
  { key: 'select',    label: 'Select',    shortcut: 'V' },
  { key: 'translate', label: 'Move',      shortcut: 'W' },
  { key: 'rotate',    label: 'Rotate',    shortcut: 'E' },
  { key: 'scale',     label: 'Scale',     shortcut: 'R' },
  { key: 'random',    label: 'Random' },
  { key: 'duplicate', label: 'Duplicate', shortcut: 'D' },
  { key: 'delete',    label: 'Delete',    shortcut: 'X' },
];

interface LeftToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
}

export function LeftToolbar({ activeTool, onToolChange }: LeftToolbarProps) {
  return (
    <aside className="left-toolbar">
      {TOOLS.map(tool => (
        <button
          key={tool.key}
          className={`toolbar-button ${activeTool === tool.key ? 'toolbar-button--active' : ''}`}
          onClick={() => onToolChange(tool.key)}
          title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label}
        >
          <span className="toolbar-button-label">{tool.label}</span>
          {tool.shortcut && (
            <kbd className="toolbar-button-shortcut">{tool.shortcut}</kbd>
          )}
        </button>
      ))}
    </aside>
  );
}
