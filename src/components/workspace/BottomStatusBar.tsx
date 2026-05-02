import type { ToolMode } from '../../types/Workspace';

interface BottomStatusBarProps {
  objectCount: number;
  activeTool: ToolMode;
  showAxes: boolean;
  showOrigin: boolean;
  onToggleAxes: () => void;
  onToggleOrigin: () => void;
}

export function BottomStatusBar({
  objectCount,
  activeTool,
  showAxes,
  showOrigin,
  onToggleAxes,
  onToggleOrigin,
}: BottomStatusBarProps) {
  return (
    <footer className="bottom-bar">
      <div className="bottom-section">
        Objects: {objectCount}
      </div>
      <div className="bottom-section">
        Tool: {activeTool}
      </div>
      <div className="bottom-section bottom-section--controls">
        <span>Grid: On</span>
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
        <span>Snap: Off</span>
      </div>
      <div className="bottom-section">
        Camera: Perspective
      </div>
    </footer>
  );
}
