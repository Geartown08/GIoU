export function MetricsTab() {
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        <p>Select two cuboids to compute intersection metrics.</p>
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_IoU</span>
          <span className="metric-value">--</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_GIoU</span>
          <span className="metric-value">--</span>
        </div>
      </div>
    </div>
  );
}
