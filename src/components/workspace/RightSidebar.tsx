import React from 'react';
import type { RightPanelTab } from '../../types/Workspace';
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
}

export function RightSidebar({ activeTab, onTabChange }: RightSidebarProps) {
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
        {activeTab === 'object' && <ObjectTab />}
        {activeTab === 'explain' && <ExplainTab />}
      </div>
    </aside>
  );
}
