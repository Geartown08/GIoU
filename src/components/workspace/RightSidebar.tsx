import React from 'react';
import type { RightPanelTab } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { MetricsTab } from './tabs/MetricsTab';
import { ObjectTab } from './tabs/ObjectTab';
import { ExplainTab } from './tabs/ExplainTab';

const TABS: { key: RightPanelTab; label: string }[] = [
  { key: 'metrics', label: 'Metrics' },
  { key: 'object',  label: 'Object' },
  { key: 'explain', label: 'Explain' },
];

interface RightSidebarProps {
  activeTab: RightPanelTab;
  onTabChange: (tab: RightPanelTab) => void;
  cuboids: CuboidData[];
  selectedId: string | null;
  onAdd: (cuboid: Omit<CuboidData, 'id' | 'position' | 'rotation' | 'scale'>) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string | null) => void;
}

export function RightSidebar({ activeTab, onTabChange, cuboids, selectedId, onAdd, onDelete, onSelect }: RightSidebarProps) {
  return (
    <aside className="right-sidebar">
      <div className="sidebar-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`sidebar-tab ${activeTab === tab.key ? 'sidebar-tab--active' : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="sidebar-tab-body">
        {activeTab === 'metrics' && <MetricsTab />}
        {activeTab === 'object' && (
          <ObjectTab
            cuboids={cuboids}
            selectedId={selectedId}
            onAdd={onAdd}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        )}
        {activeTab === 'explain' && <ExplainTab />}
      </div>
    </aside>
  );
}
