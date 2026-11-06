import {
  PHOTOGRAPHY_LIMITS,
  validatePositiveNumber,
  type CalculationResult,
} from './validation.ts';
import type { SensorDimensions } from './crop-factor.ts';

/** Physical image areas, not body, film-sheet or nominal-format dimensions. */
export const FORMAT_PRESETS = [
  { id: 'micro-four-thirds', widthMm: 17.3, heightMm: 13 },
  { id: 'aps-c', widthMm: 23.5, heightMm: 15.7 },
  { id: 'full-frame', widthMm: 36, heightMm: 24 },
  { id: 'digital-medium', widthMm: 43.8, heightMm: 32.9 },
  { id: 'film-6x6', widthMm: 56, heightMm: 56 },
  { id: 'film-4x5', widthMm: 120, heightMm: 96 },
  { id: 'film-half-frame', widthMm: 17, heightMm: 24 },
] as const;
export type FormatId = (typeof FORMAT_PRESETS)[number]['id'];
export const HALF_FRAME_COMPARISON_PATH =
  '/tools/format-comparison/half-frame-vs-aps-c/';

export interface FormatMetrics extends SensorDimensions {
  areaMm2: number;
  aspectRatio: number;
  diagonalMm: number;
  diagonalCropFactor: number;
}

export interface FormatComparison {
  a: FormatMetrics;
  b: FormatMetrics;
  /** Area B divided by area A; never rounded before other calculations. */
  areaRatioBtoA: number;
  overlay: {
    viewBox: '0 0 400 260';
    unitsPerMm: number;
    a: { x: number; y: number; width: number; height: number };
    b: { x: number; y: number; width: number; height: number };
  };
}

export function findFormat(
  id: string
): (typeof FORMAT_PRESETS)[number] | undefined {
  return FORMAT_PRESETS.find(format => format.id === id);
}

export function compareFormats(
  a: SensorDimensions,
  b: SensorDimensions
): CalculationResult<FormatComparison> {
  for (const [side, dimensions] of [
    ['a', a],
    ['b', b],
  ] as const) {
    for (const field of ['widthMm', 'heightMm'] as const) {
      const checked = validatePositiveNumber(
        dimensions[field],
        `${side}.${field}`,
        PHOTOGRAPHY_LIMITS.sensorDimensionMm
      );
      if (!checked.ok) return checked;
    }
  }
  const metrics = (dimensions: SensorDimensions): FormatMetrics => ({
    ...dimensions,
    areaMm2: dimensions.widthMm * dimensions.heightMm,
    aspectRatio: dimensions.widthMm / dimensions.heightMm,
    diagonalMm: Math.hypot(dimensions.widthMm, dimensions.heightMm),
    diagonalCropFactor:
      Math.hypot(36, 24) / Math.hypot(dimensions.widthMm, dimensions.heightMm),
  });
  // Both rectangles use this ONE scale, preserving physical area ratios.
  const unitsPerMm = Math.min(
    360 / Math.max(a.widthMm, b.widthMm),
    220 / Math.max(a.heightMm, b.heightMm)
  );
  const rectangle = (dimensions: SensorDimensions) => {
    const width = dimensions.widthMm * unitsPerMm;
    const height = dimensions.heightMm * unitsPerMm;
    return { x: (400 - width) / 2, y: (260 - height) / 2, width, height };
  };
  const first = metrics(a);
  const second = metrics(b);
  return {
    ok: true,
    value: {
      a: first,
      b: second,
      areaRatioBtoA: second.areaMm2 / first.areaMm2,
      overlay: {
        viewBox: '0 0 400 260',
        unitsPerMm,
        a: rectangle(a),
        b: rectangle(b),
      },
    },
  };
}
