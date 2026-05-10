import type { ToolMode } from '../../types/Workspace';

interface BottomStatusBarProps {
  objectCount: number;
  activeTool: ToolMode;
  showAxes: boolean;
  showOrigin: boolean;
  onToggleAxes: () => void;
  onToggleOrigin: () => void;
  statusMessage: string;
}

const TOOL_LABELS: Record<ToolMode, string> = {
  select: 'Select',
  mselect: 'Analyse',
  translate: 'Move',
  rotate: 'Rotate',
  scale: 'Scale',
  random: 'Random',
  duplicate: 'Duplicate',
  delete: 'Delete',
};

export function BottomStatusBar({
  objectCount,
  activeTool,
  showAxes,
  showOrigin,
  onToggleAxes,
  onToggleOrigin,
  statusMessage,
}: BottomStatusBarProps) {
  return (
    <footer className="bottom-bar">
      <div className="bottom-section">
        Objects: {objectCount}
      </div>
      <div className="bottom-section">
        Tool: {TOOL_LABELS[activeTool]}
      </div>
      <div className="bottom-section bottom-section--status" aria-live="polite">
        {statusMessage}
      </div>
      <div className="bottom-section bottom-section--controls">
        <span className="status-readout">Grid: On</span>
        <button
          type="button"
          className={`status-toggle ${showAxes ? 'status-toggle--active' : ''}`}
          aria-pressed={showAxes}
          onClick={onToggleAxes}
        >
          Show Axes
        </button>
        <button
          type="button"
          className={`status-toggle ${showOrigin ? 'status-toggle--active' : ''}`}
          aria-pressed={showOrigin}
          onClick={onToggleOrigin}
        >
          Show Origin
        </button>
        <span className="status-readout">Snap: Off</span>
      </div>
      <div className="bottom-section status-readout">
        Camera: Perspective
      </div>
    </footer>
  );
}
