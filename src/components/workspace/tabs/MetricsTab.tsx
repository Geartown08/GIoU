import type {CuboidData} from "../../../types/Cuboid";
import {ConvertCuboid} from "../../../utils/cuboidBoxConvert";
import {giou3D} from "../../../utils/giou";

interface MetricsTabProps {
  cuboids: CuboidData[];
  selectedId: string[] | null;
}

export function MetricsTab({selectedId, cuboids}: MetricsTabProps) {
  
    const selectedCuboidData = cuboids.filter(c => selectedId?.includes(c.id) ?? false);
  
    const calculations = selectedId && selectedId.length > 1 ? giou3D(ConvertCuboid(selectedCuboidData[0]), ConvertCuboid(selectedCuboidData[1])) : null;
  
  
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">IoU / GIoU Metrics</h4>
      <div className="tab-placeholder">
        <p>Select two cuboids to compute intersection metrics.</p>
        <div className="metric-row">
          <span className="metric-label">IoU</span>
          <span className="metric-value">{calculations?.iou ?? "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">GIoU</span>
          <span className="metric-value">{calculations?.giou ?? "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_IoU</span>
          <span className="metric-value">{calculations?.lossIoU ?? "--"}</span>
        </div>
        <div className="metric-row">
          <span className="metric-label">L_GIoU</span>
          <span className="metric-value">{calculations?.lossGIoU ?? "--"}</span>
        </div>
      </div>
    </div>
  );
}
