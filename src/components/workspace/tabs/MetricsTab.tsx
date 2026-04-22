import type {CuboidData} from "../../../types/Cuboid";

interface MetricsTabProps {
  cuboids: CuboidData[];
  selectedId: string[] | null;
}
export function MetricsTab({selectedId, cuboids}: MetricsTabProps) {
  const selectedCuboidData = cuboids.filter(c => selectedId?.includes(c.id) ?? false);
  const IoU = selectedCuboidData.length > 1 ? "IoU" : "--";
  const GIoU = selectedCuboidData.length > 1 ? "GIoU" : "--"; 
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        <p>Select two cuboids to compute intersection metrics.</p>
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">{IoU}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">{GIoU}</span>
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
