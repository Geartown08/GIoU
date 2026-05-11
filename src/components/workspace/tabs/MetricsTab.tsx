import type { CuboidData } from "../../../types/Cuboid";
import type { ViewMode } from "../../../types/Workspace";
import { giou2DOriented, giou3DOriented } from "../../../utils/giouOriented";

interface MetricsTabProps {
  cuboids: CuboidData[];
  selectedId: string[] | null;
  viewMode: ViewMode;
}

export function MetricsTab({ selectedId, cuboids, viewMode }: MetricsTabProps) {
  const selectedCuboidData = cuboids.filter(c => selectedId?.includes(c.id) ?? false);

  const calculations = selectedId && selectedId.length > 1
    ? viewMode === '2d'
      ? giou2DOriented(selectedCuboidData[0], selectedCuboidData[1])
      : giou3DOriented(selectedCuboidData[0], selectedCuboidData[1])
    : null;

  const fmt = (v: number) => v.toFixed(4);

  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        <p>Select two cuboids to compute intersection metrics.</p>
        <p className="tab-hint">
          {viewMode === '2d' ? 'Projecting onto XY plane (Z removed).' : 'Full 3-D bounding box calculation.'}
        </p>
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">{calculations ? fmt(calculations.iou) : "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">{calculations ? fmt(calculations.giou) : "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_IoU</span>
          <span className="metric-value">{calculations ? fmt(calculations.lossIoU) : "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_GIoU</span>
          <span className="metric-value">{calculations ? fmt(calculations.lossGIoU) : "--"}</span>
        </div>
      </div>
    </div>
  );
}
