import type { ViewMode } from "../../../types/Workspace";
import type { IoUResult } from "../../../utils/giou";

interface MetricsTabProps {
  metrics: IoUResult | null;
  viewMode: ViewMode;
}

export function MetricsTab({ metrics, viewMode }: MetricsTabProps) {
  const formatMetric = (value: number | undefined) => Number.isFinite(value) ? value!.toFixed(4) : '--';

  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        {!metrics && <p>Select two cuboids with Analyse to compute intersection metrics.</p>}
        <p className="tab-hint">
          {viewMode === '2d' ? 'Projecting onto XY plane (Z removed).' : 'Full 3-D oriented bounding box calculation.'}
        </p>
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">{formatMetric(metrics?.iou)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">{formatMetric(metrics?.giou)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_IoU</span>
          <span className="metric-value">{formatMetric(metrics?.lossIoU)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_GIoU</span>
          <span className="metric-value">{formatMetric(metrics?.lossGIoU)}</span>
        </div>
      </div>
    </div>
  );
}
