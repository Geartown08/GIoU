import { useMemo } from 'react';
import type { CuboidData } from '../../types/Cuboid';
import type { ViewMode } from '../../types/Workspace';
import type { IoUResult } from '../../utils/giou';

interface AnalysePanelProps {
  open: boolean;
  cuboids: CuboidData[];
  selectedIds: string[];
  viewMode: ViewMode;
  metrics: IoUResult | null;
  onClose: () => void;
}

const METRICS: { key: 'iou' | 'giou' | 'lossIoU' | 'lossGIoU'; label: string; desc: string }[] = [
  { key: 'iou',      label: 'IoU',    desc: 'Intersection over Union — overlap ratio.' },
  { key: 'giou',     label: 'GIoU',   desc: 'Generalised IoU — adds enclosing-region penalty.' },
  { key: 'lossIoU',  label: 'L_IoU',  desc: 'IoU loss (1 − IoU).' },
  { key: 'lossGIoU', label: 'L_GIoU', desc: 'GIoU loss (1 − GIoU).' },
];

function formatMetric(value: number | undefined): string {
  return Number.isFinite(value) ? value!.toFixed(4) : '--';
}

export function AnalysePanel({ open, cuboids, selectedIds, viewMode, metrics, onClose }: AnalysePanelProps) {
  const pair = useMemo(
    () =>
      selectedIds
        .map(id => cuboids.find(c => c.id === id))
        .filter((c): c is CuboidData => Boolean(c)),
    [cuboids, selectedIds],
  );

  return (
    <section
      className={`analyse-panel ${open ? 'analyse-panel--open' : ''}`}
      role="dialog"
      aria-label="Analyse selected cuboids"
      aria-hidden={!open}
    >
      <header className="analyse-panel-header">
        <div className="analyse-panel-title">
          <span className="analyse-panel-eyebrow">Analyse</span>
          <span className="analyse-panel-mode">{viewMode === '2d' ? 'XY projection (2D)' : 'Oriented bounding boxes (3D)'}</span>
        </div>
        <div className="analyse-panel-pair">
          {pair.length === 2 && (
            <>
              <span className="analyse-chip" title={`Object #${pair[0].id}`}>
                <span className="analyse-chip-dot" style={{ background: pair[0].color }} />
                <span className="analyse-chip-name">{pair[0].name}</span>
              </span>
              <span className="analyse-panel-vs" aria-hidden="true">vs</span>
              <span className="analyse-chip" title={`Object #${pair[1].id}`}>
                <span className="analyse-chip-dot" style={{ background: pair[1].color }} />
                <span className="analyse-chip-name">{pair[1].name}</span>
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          className="analyse-panel-close"
          aria-label="Close analyse panel"
          onClick={onClose}
        >
          ×
        </button>
      </header>
      <div className="analyse-panel-metrics">
        {METRICS.map(({ key, label, desc }) => (
          <div key={key} className="analyse-metric">
            <div className="analyse-metric-key">{label}</div>
            <div className="analyse-metric-value">{formatMetric(metrics?.[key])}</div>
            <div className="analyse-metric-desc">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
