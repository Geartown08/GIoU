import React from 'react';

export function ObjectTab() {
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">Object Properties</h4>
      <div className="tab-placeholder">
        <p>No object selected.</p>
        <p className="tab-hint">Select a cuboid to view and edit its properties.</p>
      </div>
    </div>
  );
}
