import type { IoUResult } from './giou';

export type MetricFormulaKey = 'iou' | 'giou' | 'lossIoU' | 'lossGIoU';

export interface MetricFormula {
  key: MetricFormulaKey;
  label: string;
  desc: string;
  symbolic: string;
  substitution: string | null;
  value: string;
  isNegative?: boolean;
}

export const formatMetric = (value: number | undefined): string => (
  Number.isFinite(value) ? value!.toFixed(4) : '--'
);

export const formatLatexNumber = (value: number | undefined): string => (
  Number.isFinite(value) ? value!.toFixed(4) : '\\text{--}'
);

export function getMetricFormulas(metrics: IoUResult | undefined): MetricFormula[] {
  const i = formatLatexNumber(metrics?.intersection);
  const u = formatLatexNumber(metrics?.union);
  const c = formatLatexNumber(metrics?.enclosing);
  const iou = formatLatexNumber(metrics?.iou);
  const giou = formatLatexNumber(metrics?.giou);

  return [
    {
      key: 'iou',
      label: 'IoU',
      desc: 'Overlap divided by total covered area or volume.',
      symbolic: '\\operatorname{IoU}=\\frac{|A\\cap B|}{|A\\cup B|}',
      substitution: metrics ? `\\operatorname{IoU}=\\frac{${i}}{${u}}` : null,
      value: formatMetric(metrics?.iou),
    },
    {
      key: 'giou',
      label: 'GIoU',
      desc: 'IoU minus the empty-space penalty inside the enclosing box.',
      symbolic: '\\operatorname{GIoU}=\\operatorname{IoU}-\\frac{|C|-|A\\cup B|}{|C|}',
      substitution: metrics ? `\\operatorname{GIoU}=${iou}-\\frac{${c}-${u}}{${c}}` : null,
      value: formatMetric(metrics?.giou),
      isNegative: Number.isFinite(metrics?.giou) && metrics!.giou < 0,
    },
    {
      key: 'lossIoU',
      label: 'L_IoU',
      desc: 'Loss form of IoU; lower is better.',
      symbolic: 'L_{\\operatorname{IoU}}=1-\\operatorname{IoU}',
      substitution: metrics ? `L_{\\operatorname{IoU}}=1-${iou}` : null,
      value: formatMetric(metrics?.lossIoU),
    },
    {
      key: 'lossGIoU',
      label: 'L_GIoU',
      desc: 'Loss form of GIoU; lower is better.',
      symbolic: 'L_{\\operatorname{GIoU}}=1-\\operatorname{GIoU}',
      substitution: metrics ? `L_{\\operatorname{GIoU}}=1-${giou}` : null,
      value: formatMetric(metrics?.lossGIoU),
    },
  ];
}
