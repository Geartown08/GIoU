import type {CuboidData} from "../../../types/Cuboid";
import {ConvertCuboid} from "../../../utils/cuboidBoxConvert";
import {giou3D} from "../../../utils/giou";

interface MetricsTabProps {
  cuboids: CuboidData[];
  selectedId: string[] | null;
}

export function MetricsTab({selectedId, cuboids}: MetricsTabProps) {
  const selectedCuboidData = (selectedId ?? [])
    .map(id => cuboids.find(c => c.id === id))
    .filter((cuboid): cuboid is CuboidData => Boolean(cuboid));

  const calculations = selectedCuboidData.length === 2
    ? giou3D(ConvertCuboid(selectedCuboidData[0]), ConvertCuboid(selectedCuboidData[1]))
    : null;

  const formatMetric = (value: number | undefined) => value === undefined ? '--' : value.toFixed(4);
  
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        {!calculations && <p>Select two cuboids with Analyse to compute intersection metrics.</p>}
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">{formatMetric(calculations?.iou)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">{formatMetric(calculations?.giou)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_IoU</span>
          <span className="metric-value">{formatMetric(calculations?.lossIoU)}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_GIoU</span>
          <span className="metric-value">{formatMetric(calculations?.lossGIoU)}</span>
        </div>
      </div>
    </div>
  );
}
