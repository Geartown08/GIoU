import type { ToolMode, ViewMode } from '../../types/Workspace';

interface BottomStatusBarProps {
  objectCount: number;
  activeTool: ToolMode;
  showAxes: boolean;
  showOrigin: boolean;
  onToggleAxes: () => void;
  onToggleOrigin: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
}

export function BottomStatusBar({
  objectCount,
  activeTool,
  showAxes,
  showOrigin,
  onToggleAxes,
  onToggleOrigin,
  viewMode,
  onToggleViewMode,
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
        <button
          type="button"
          className={`status-toggle view-mode-toggle ${viewMode === '2d' ? 'status-toggle--active' : ''}`}
          aria-pressed={viewMode === '2d'}
          onClick={onToggleViewMode}
          title="Toggle between 2D (top-down orthographic) and 3D perspective view"
        >
          {viewMode === '2d' ? '2D' : '3D'}
        </button>
        <span>Camera: {viewMode === '2d' ? 'Orthographic' : 'Perspective'}</span>
      </div>
    </footer>
  );
}
