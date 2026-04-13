import React from 'react';

const TOP_ACTIONS = ['New', 'Open', 'Save', 'Import', 'Help'] as const;

interface TopBarProps {
  onAction: (action: string) => void;
}

export function TopBar({ onAction }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-title">GIoU Visualiser</div>
      <nav className="topbar-actions">
        {TOP_ACTIONS.map(action => (
          <button
            key={action}
            className="topbar-button"
            onClick={() => onAction(action.toLowerCase())}
          >
            {action}
          </button>
        ))}
      </nav>
    </header>
  );
}
