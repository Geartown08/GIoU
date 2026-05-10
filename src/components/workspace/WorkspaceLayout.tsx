import React, { useCallback, useState } from 'react';
import type { ToolMode, RightPanelTab } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { TopBar } from './TopBar';
import { LeftToolbar } from './LeftToolbar';
import { ViewportPanel } from './ViewportPanel';
import { RightSidebar } from './RightSidebar';
import { BottomStatusBar } from './BottomStatusBar';
import { saveScene } from '../../utils/saveScene';
import { openAndLoadScene } from '../../utils/loadScene';
import { useUiScale } from '../../hooks/useUiScale';
import '../../styles/workspace.css';

interface WorkspaceLayoutProps {
  viewportContent?: React.ReactNode;
  cuboids: CuboidData[];
  selectedId: string[];
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onLoadScene: (cuboids: CuboidData[]) => void;
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  showAxes: boolean;
  showOrigin: boolean;
  onToggleAxes: () => void;
  onToggleOrigin: () => void;
  statusMessage: string;
}

export function WorkspaceLayout({
  viewportContent,
  cuboids,
  selectedId,
  onAdd,
  onDelete,
  onSelect,
  onLoadScene,
  activeTool,        // ← now destructured from props
  onToolChange,      // ← now destructured from props
  showAxes,
  showOrigin,
  onToggleAxes,
  onToggleOrigin,
  statusMessage,
}: WorkspaceLayoutProps) {
  // ← useState for activeTool removed, it lives in App.tsx now
  const [activeTab, setActiveTab] = useState<RightPanelTab>('metrics');
  const { scaleOverride, resolvedScale, setScaleOverride } = useUiScale();

  // ← useEffect for keyboard shortcuts removed, it lives in App.tsx now

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
    onToolChange(tool);  // ← was setActiveTool, now calls up to App.tsx
  }, [onToolChange]);

  return (
    <div className="workspace">
      <TopBar
        onAction={handleTopBarAction}
        uiScale={scaleOverride}
        resolvedScale={resolvedScale}
        onUiScaleChange={setScaleOverride}
      />
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
      <BottomStatusBar
        objectCount={cuboids.length}
        activeTool={activeTool}
        showAxes={showAxes}
        showOrigin={showOrigin}
        onToggleAxes={onToggleAxes}
        onToggleOrigin={onToggleOrigin}
        statusMessage={statusMessage}
      />
    </div>
  );
}
