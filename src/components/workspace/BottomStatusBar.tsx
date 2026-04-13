import React from 'react';
import type { ToolMode } from '../../types/Workspace';

interface BottomStatusBarProps {
  objectCount: number;
  activeTool: ToolMode;
}

export function BottomStatusBar({ objectCount, activeTool }: BottomStatusBarProps) {
  return (
    <footer className="bottom-bar">
      <div className="bottom-section">
        Objects: {objectCount}
      </div>
      <div className="bottom-section">
        Tool: {activeTool}
      </div>
      <div className="bottom-section">
        Grid: On &middot; Axes: On &middot; Snap: Off
      </div>
      <div className="bottom-section">
        Camera: Perspective
      </div>
    </footer>
  );
}
