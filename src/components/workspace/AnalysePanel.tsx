import { Fragment } from 'react';
import type { CalculationData, ViewMode } from '../../types/Workspace';
import type { CuboidData } from '../../types/Cuboid';
import { MathFormula } from './MathFormula';
import { getMetricFormulas } from '../../utils/metricFormula';

interface AnalysePanelProps {
  open: boolean;
  viewMode: ViewMode;
  calc: CalculationData | null;
  selectedCuboids: CuboidData[];
  cuboidCount: number;
  onClose: () => void;
}

function getEmptyState(selectedCuboids: CuboidData[], cuboidCount: number) {
  if (cuboidCount === 0) {
    return {
      title: 'No cuboids in the scene',
      body: 'Add two cuboids, then select them in Analyse mode to compare IoU and GIoU.',
    };
  }

  if (selectedCuboids.length === 0) {
    return {
      title: 'No cuboids selected',
      body: 'Select two cuboids to compare their overlap metrics.',
    };
  }

  if (selectedCuboids.length === 1) {
    return {
      title: 'One cuboid selected',
      body: `Select one more cuboid to compare with ${selectedCuboids[0].name}.`,
    };
  }

  return {
    title: 'Waiting for a valid pair',
    body: 'Select two valid cuboids to calculate the comparison metrics.',
  };
}

export function AnalysePanel({
  open,
  viewMode,
  calc,
  selectedCuboids,
  cuboidCount,
  onClose,
}: AnalysePanelProps) {
  const pair = calc?.items;
  const formulas = calc ? getMetricFormulas(calc.giou) : [];
  const chipItems = pair ?? selectedCuboids.slice(0, 2);
  const emptyState = calc ? null : getEmptyState(selectedCuboids, cuboidCount);

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
          {chipItems.length > 0 && (
            <>
              {chipItems.map((item, index) => (
                <Fragment key={item.id}>
                  {index > 0 && (
                    <span className="analyse-panel-vs" aria-hidden="true">vs</span>
                  )}
                  <span className="analyse-chip" title={`Object #${item.id}`}>
                    <span className="analyse-chip-dot" style={{ background: item.color }} />
                    <span className="analyse-chip-name">{item.name}</span>
                  </span>
                </Fragment>
              ))}
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
      {emptyState ? (
        <div className="analyse-panel-empty" role="status" aria-live="polite">
          <div className="analyse-panel-empty-title">{emptyState.title}</div>
          <p>{emptyState.body}</p>
        </div>
      ) : (
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
      )}
    </section>
  );
}
