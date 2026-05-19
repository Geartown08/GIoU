import type { RightPanelTab, ViewMode, CalculationData } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { ObjectTab } from './tabs/ObjectTab';
import { ExplainTab } from './tabs/ExplainTab';

const TABS: { key: RightPanelTab; label: string }[] = [
  { key: 'object',  label: 'Object' },
  { key: 'explain', label: 'Explain' },
];

interface RightSidebarProps {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  cuboids: CuboidData[];
  selectedId: string[] | null;
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
  onRename: (id: string, name: string) => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onObjectAddShortcutChange: (handler: (() => void) | null) => void;
  onStatus: (message: string) => void;
  analyseCalc: CalculationData | null;
}

export function RightSidebar({
  activeTab,
  onTabChange,
  cuboids,
  selectedId,
  onAdd,
  onDelete,
  onSelect,
  onRename,
  viewMode,
  onToggleViewMode,
  onObjectAddShortcutChange,
  onStatus,
  analyseCalc,
}: RightSidebarProps) {
  return (
    <aside className="right-sidebar">
      <button
        type="button"
        className={`sidebar-view-mode-toggle ${viewMode === '2d' ? 'sidebar-view-mode-toggle--active' : ''}`}
        aria-pressed={viewMode === '2d'}
        onClick={onToggleViewMode}
        title="Toggle between 2D (top-down orthographic) and 3D perspective view"
      >
        {viewMode === '2d' ? '2D MODE' : '3D MODE'}
        <br />
        <span className="viewmode-subtitle">(Click to switch mode)</span>
      </button>
      <div className="sidebar-tabs" role="tablist" aria-label="Workspace panels">
        {TABS.map(tab => (
          <button
            key={tab.key}
            id={`workspace-tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`workspace-tabpanel-${tab.key}`}
            className={`sidebar-tab ${activeTab === tab.key ? 'sidebar-tab--active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`workspace-tabpanel-${activeTab}`}
        className="sidebar-tab-body"
        role="tabpanel"
        aria-labelledby={`workspace-tab-${activeTab}`}
      >
        {activeTab === 'object' && (
          <ObjectTab
            cuboids={cuboids}
            selectedId={selectedId}
            onAdd={onAdd}
            onDelete={onDelete}
            onSelect={onSelect}
            onRename={onRename}
            viewMode={viewMode}
            onAddShortcutChange={onObjectAddShortcutChange}
            onStatus={onStatus}
          />
        )}
        {activeTab === 'explain' && (
          <ExplainTab calc={analyseCalc} viewMode={viewMode} />
        )}
      </div>
    </aside>
  );
}
