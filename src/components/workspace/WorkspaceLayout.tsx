import React, { useState, useCallback, useEffect } from 'react';
import type { ToolMode, RightPanelTab } from '../../types/Workspace';
import { TopBar } from './TopBar';
import { LeftToolbar } from './LeftToolbar';
import { ViewportPanel } from './ViewportPanel';
import { RightSidebar } from './RightSidebar';
import { BottomStatusBar } from './BottomStatusBar';
import '../../styles/workspace.css';

interface WorkspaceLayoutProps {
  /** Content to render inside the viewport (e.g. Three.js Canvas) */
  viewportContent?: React.ReactNode;
  objectCount: number;
}

export function WorkspaceLayout({ viewportContent, objectCount }: WorkspaceLayoutProps) {
  const [activeTool, setActiveTool] = useState<ToolMode>('select');
  const [activeTab, setActiveTab] = useState<RightPanelTab>('metrics');

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, ToolMode> = {
        v: 'select',
        w: 'translate',
        e: 'rotate',
        r: 'scale',
        a: 'add',
        d: 'duplicate',
        x: 'delete',
      };
      if (map[key]) setActiveTool(map[key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTopBarAction = useCallback((action: string) => {
    // Placeholder — will be wired to real logic later
    console.log(`[TopBar] action: ${action}`);
  }, []);

  return (
    <div className="workspace">
      <TopBar onAction={handleTopBarAction} />
      <div className="workspace-body">
        <LeftToolbar activeTool={activeTool} onToolChange={setActiveTool} />
        <ViewportPanel>{viewportContent}</ViewportPanel>
        <RightSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <BottomStatusBar objectCount={objectCount} activeTool={activeTool} />
    </div>
  );
}
