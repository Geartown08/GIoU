import React, { useCallback, useState } from 'react';
import type { ToolMode, RightPanelTab, ViewMode, CalculationData } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { TopBar } from './TopBar';
import { LeftToolbar } from './LeftToolbar';
import { ViewportPanel } from './ViewportPanel';
import { RightSidebar } from './RightSidebar';
import { BottomStatusBar } from './BottomStatusBar';
import { AnalysePanel } from './AnalysePanel';
import { HelpDialog } from './HelpDialog';
import { saveScene } from '../../utils/saveScene';
import { openAndLoadScene } from '../../utils/loadScene';
import { useUiScale } from '../../hooks/useUiScale';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/workspace.css';

interface WorkspaceLayoutProps {
  viewportContent?: React.ReactNode;
  cuboids: CuboidData[];
  activeSelectedIds: string[];
  analyseSelectedIds: string[];
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  onLoadScene: (cuboids: CuboidData[]) => void;
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  showAxes: boolean;
  showOrigin: boolean;
  onToggleAxes: () => void;
  onToggleOrigin: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  statusMessage: string;
  onObjectAddShortcutChange: (handler: (() => void) | null) => void;
  onStatus: (message: string) => void;
  analysePanelOpen: boolean;
  onAnalysePanelClose: () => void;
  analyseCalc: CalculationData | null;
  onUpdate: (id: string, updates: Partial<CuboidData>) => void;
  helpOpen: boolean;
  onHelpOpen: () => void;
  onHelpClose: () => void;
}

export function WorkspaceLayout({
  viewportContent,
  cuboids,
  activeSelectedIds,
  analyseSelectedIds,
  onAdd,
  onDelete,
  onSelect,
  onRename,
  onLoadScene,
  activeTool,
  onToolChange,
  showAxes,
  showOrigin,
  onToggleAxes,
  onToggleOrigin,
  viewMode,
  onToggleViewMode,
  statusMessage,
  onObjectAddShortcutChange,
  onStatus,
  analysePanelOpen,
  onAnalysePanelClose,
  analyseCalc,
  onUpdate,
  helpOpen,
  onHelpOpen,
  onHelpClose,
}: WorkspaceLayoutProps) {
  // ← useState for activeTool removed, it lives in App.tsx now
  const [activeTab, setActiveTab] = useState<RightPanelTab>('object');
  const { scaleOverride, resolvedScale, setScaleOverride } = useUiScale();
  const { theme, toggleTheme } = useTheme();
  const analyseSelectedCuboids = analyseSelectedIds
    .map(id => cuboids.find(c => c.id === id))
    .filter((cuboid): cuboid is CuboidData => Boolean(cuboid));

  // ← useEffect for keyboard shortcuts removed, it lives in App.tsx now

  const confirmDiscardScene = useCallback(() => (
    cuboids.length === 0 || window.confirm('Discard current scene?')
  ), [cuboids.length]);


  const handleTopBarAction = useCallback((action: string) => {
    switch (action) {
      case 'save':
        saveScene(cuboids);
        break;
      case 'open':
        if (!confirmDiscardScene()) break;
        openAndLoadScene((cuboids) => {
          onLoadScene(cuboids);
        }, (err) => {
          console.error('[loadScene]', err);
        });
        break;
      case 'new':
        if (!confirmDiscardScene()) break;
        onLoadScene([]);
        break;
      default:
        console.log(`[TopBar] unhandled action: ${action}`);
    }
  }, [confirmDiscardScene, cuboids, onLoadScene]);

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
        theme={theme}
        onToggleTheme={toggleTheme}
        onHelp={onHelpOpen}
      />
      <div className="workspace-body">
        <LeftToolbar activeTool={activeTool} onToolChange={handleToolChange} />
        <div className="workspace-viewport-stack">
          <ViewportPanel>{viewportContent as React.ReactNode}</ViewportPanel>
          <AnalysePanel
            open={analysePanelOpen}
            viewMode={viewMode}
            calc={analyseCalc}
            selectedCuboids={analyseSelectedCuboids}
            cuboidCount={cuboids.length}
            onClose={onAnalysePanelClose}
          />
        </div>
        <RightSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          cuboids={cuboids}
          selectedId={activeSelectedIds}
          onAdd={onAdd}
          onDelete={onDelete}
          onSelect={onSelect}
          onRename={onRename}
          viewMode={viewMode}
          onToggleViewMode={onToggleViewMode}
          onObjectAddShortcutChange={onObjectAddShortcutChange}
          onStatus={onStatus}
          analyseCalc={analyseCalc}
          onUpdate={onUpdate}
        />
      </div>
      <BottomStatusBar
        objectCount={cuboids.length}
        activeTool={activeTool}
        showAxes={showAxes}
        showOrigin={showOrigin}
        onToggleAxes={onToggleAxes}
        onToggleOrigin={onToggleOrigin}
        viewMode={viewMode}
        onToggleViewMode={onToggleViewMode}
        statusMessage={statusMessage}
      />
      <HelpDialog open={helpOpen} onClose={onHelpClose} />
    </div>
  );
}
