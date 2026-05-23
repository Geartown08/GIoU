import type { CalculationData, ViewMode } from '../../../types/Workspace';
import { MathFormula } from '../MathFormula';
import { formatLatexNumber, getMetricFormulas } from '../../../utils/metricFormula';

interface ExplainTabProps {
  calc: CalculationData | null;
  viewMode: ViewMode;
}

function CalcRow({ label, expr, result, resultClass = 'calc-value' }: {
  label: string;
  expr: string;
  result: string;
  resultClass?: string;
}) {
  return (
    <div className="calc-row">
      <span className="calc-label">{label}</span>
      <span className="calc-expr">{expr}</span>
      <span className={resultClass}>{result}</span>
    </div>
  );
}

function CalcFormulaStep({ label, symbolic, substitution, result, resultClass = 'calc-formula-result' }: {
  label: string;
  symbolic: string;
  substitution?: string | null;
  result?: string;
  resultClass?: string;
}) {
  return (
    <div className="calc-formula-step">
      <span className="calc-label">{label}</span>
      <div className="calc-formula-body">
        <MathFormula tex={symbolic} displayMode className="calc-formula-symbolic" />
        {substitution && (
          <MathFormula tex={substitution} displayMode className="calc-formula-substitution" />
        )}
      </div>
      {result && <span className={resultClass}>{result}</span>}
    </div>
  );
}

const fmt = (n: number) => n.toFixed(4);
const fmtPos = (p: [number, number, number]) => `(${p.map(v => v.toFixed(2)).join(', ')})`;

function Derivation({ calc, viewMode }: { calc: CalculationData; viewMode: ViewMode }) {
  const [a, b] = calc.items;
  const g = calc.giou;
  const measureName = viewMode === '2d' ? 'Area' : 'Volume';
  const metricFormulas = getMetricFormulas(g);

  return (
    <div className="calc-derivation">
      <h5 className="calc-section-title">Derivation</h5>

      <div className="calc-group">
        <div className="calc-group-title">Object Properties</div>
        {[a, b].map(item => (
          <div key={item.id} className="calc-object-block">
            <div className="calc-object-name">
              <span className="calc-color-dot" style={{ background: item.color }} />
              {item.name}
            </div>
            <CalcRow label={measureName} expr="" result={fmt(item.volume)} />
            <CalcRow label="Surface" expr="" result={fmt(item.surfaceArea)} />
            <CalcRow label="Position" expr="" result={fmtPos(item.position)} />
          </div>
        ))}
      </div>

      <div className="calc-group">
        <div className="calc-group-title">{measureName}s</div>
        <CalcFormulaStep
          label="Intersection"
          symbolic={'|A\\cap B|'}
          substitution={`|A\\cap B|=${formatLatexNumber(g.intersection)}`}
          result={fmt(g.intersection)}
        />
        <CalcFormulaStep
          label="Union"
          symbolic={'|A\\cup B|=|A|+|B|-|A\\cap B|'}
          substitution={`|A\\cup B|=${formatLatexNumber(a.volume)}+${formatLatexNumber(b.volume)}-${formatLatexNumber(g.intersection)}`}
          result={fmt(g.union)}
        />
        <CalcFormulaStep
          label="Enclosing"
          symbolic="|C|"
          substitution={`|C|=${formatLatexNumber(g.enclosing)}`}
          result={fmt(g.enclosing)}
        />
      </div>

      <div className="calc-group">
        <div className="calc-group-title">Scores</div>
        {metricFormulas.map(formula => (
          <CalcFormulaStep
            key={formula.key}
            label={formula.label}
            symbolic={formula.symbolic}
            substitution={formula.substitution}
            result={formula.value}
            resultClass={formula.isNegative ? 'calc-formula-result calc-negative' : 'calc-formula-result'}
          />
        ))}
      </div>
    </div>
  );
}

export function ExplainTab({ calc, viewMode }: ExplainTabProps) {
  return (
    <div className="tab-content">
      <h4 className="tab-section-title">Explanation</h4>
      <div className="tab-placeholder">
        <h5>What is GIoU?</h5>
        <p>
          Generalized Intersection over Union (GIoU) extends the standard IoU
          metric by also penalising the empty space within the smallest
          enclosing box of two bounding boxes.
        </p>
        <h5>Formula</h5>
        <MathFormula
          tex={'\\operatorname{GIoU}=\\operatorname{IoU}-\\frac{|C|-|A\\cup B|}{|C|}'}
          displayMode
          className="formula"
        />
        <p className="tab-hint">
          Where C is the smallest enclosing box, A and B are the two bounding boxes.
        </p>
        <p className="tab-hint">
          {viewMode === '2d'
            ? 'Showing areas (XY projection).'
            : 'Showing volumes (oriented bounding boxes).'}
        </p>
      </div>
      {calc
        ? <Derivation calc={calc} viewMode={viewMode} />
        : <p className="calc-empty">Pick two cuboids in Analyse mode to see the live derivation.</p>}
    </div>
  );
}
