import { useMemo } from 'react';
import { renderToString } from 'katex';
import 'katex/dist/katex.min.css';

interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function MathFormula({
  tex,
  displayMode = false,
  className = '',
  ariaLabel,
}: MathFormulaProps) {
  const html = useMemo(() => renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
  }), [displayMode, tex]);

  return (
    <span
      className={`math-formula ${displayMode ? 'math-formula--block' : 'math-formula--inline'} ${className}`}
      aria-label={ariaLabel ?? tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
