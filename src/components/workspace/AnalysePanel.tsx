import type { CalculationData, ViewMode } from '../../types/Workspace';
import { MathFormula } from './MathFormula';
import { getMetricFormulas } from '../../utils/metricFormula';

interface AnalysePanelProps {
  open: boolean;
  viewMode: ViewMode;
  calc: CalculationData | null;
  onClose: () => void;
}

export function AnalysePanel({ open, viewMode, calc, onClose }: AnalysePanelProps) {
  const pair = calc?.items;
  const formulas = getMetricFormulas(calc?.giou);

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
          {pair && (
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
          tabIndex={open ? 0 : -1}
        >
          ×
        </button>
      </header>
      <div className="analyse-panel-metrics">
        {formulas.map(({ key, label, desc, symbolic, substitution, value, isNegative }) => (
          <div key={key} className="analyse-metric">
            <div className="analyse-metric-key">{label}</div>
            <div className={isNegative ? 'analyse-metric-value calc-negative' : 'analyse-metric-value'}>
              {value}
            </div>
            <MathFormula tex={symbolic} displayMode className="analyse-metric-formula" />
            {substitution && (
              <MathFormula tex={substitution} displayMode className="analyse-metric-substitution" />
            )}
            <div className="analyse-metric-desc">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
