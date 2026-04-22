import React from 'react';

interface ViewportPanelProps {
  children?: React.ReactNode;
}

export function ViewportPanel({ children }: ViewportPanelProps) {
  return (
    <main className="viewport-panel">
      {children ?? (
        <div className="viewport-placeholder">
          <span>3D Viewport</span>
          <span className="viewport-placeholder-sub">Three.js canvas will render here</span>
        </div>
      )}
    </main>
  );
}
