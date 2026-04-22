import React, { useState, useCallback, useEffect } from 'react';
import type { ToolMode, RightPanelTab } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { TopBar } from './TopBar';
import { LeftToolbar } from './LeftToolbar';
import { ViewportPanel } from './ViewportPanel';
import { RightSidebar } from './RightSidebar';
import { BottomStatusBar } from './BottomStatusBar';
import { saveScene } from '../../utils/saveScene';
import { openAndLoadScene } from '../../utils/loadScene';
import '../../styles/workspace.css';

interface WorkspaceLayoutProps {
  viewportContent?: React.ReactNode;
  cuboids: CuboidData[];
  selectedId: string[] | null;
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onLoadScene: (cuboids: CuboidData[]) => void;
}

export function WorkspaceLayout({
  viewportContent,
  cuboids,
  selectedId,
  onAdd,
  onDelete,
  onSelect,
  onLoadScene,
}: WorkspaceLayoutProps) {
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
    switch (action) {
      case 'save':
        saveScene(cuboids);
        break;
      case 'open':
        openAndLoadScene((cuboids) => {
            onLoadScene(cuboids);
        }, (err) => {
            console.error('[loadScene]', err);
        });
        break;
      case 'new':
        onLoadScene([]);
        break;
      default:
        console.log(`[TopBar] unhandled action: ${action}`);
    }
  }, [cuboids, onLoadScene]);

  const handleToolChange = useCallback((tool: ToolMode) => {
    setActiveTool(tool);

    // Action-type tools trigger immediately
    if (tool === 'add') {
      onAdd({ width: 1, height: 1, depth: 1, color: '#4ecdc4' });
      setActiveTool('select');
    } else if (tool === 'delete' && selectedId) {
      onDelete(selectedId[0]);
      setActiveTool('select');
    }
  }, [selectedId, onAdd, onDelete]);

  return (
    <div className="workspace">
      <TopBar onAction={handleTopBarAction} />
      <div className="workspace-body">
        <LeftToolbar activeTool={activeTool} onToolChange={handleToolChange} />
        <ViewportPanel>{viewportContent}</ViewportPanel>
        <RightSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cuboids={cuboids}
          selectedId={selectedId}
          onAdd={onAdd}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      </div>
      <BottomStatusBar objectCount={cuboids.length} activeTool={activeTool} />
    </div>
  );
}
