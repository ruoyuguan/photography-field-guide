export type CalculationResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      field: string;
      code: 'required' | 'invalid' | 'positive' | 'range' | 'non-finite';
      min?: number;
      max?: number;
    };

export interface InputRange {
  min: number;
  max: number;
}

export const PHOTOGRAPHY_LIMITS = {
  sensorDimensionMm: { min: 1, max: 200 },
  focalLengthMm: { min: 1, max: 2000 },
  cropFactor: { min: 0.001, max: 1000 },
  distanceM: { min: 0.1, max: 100 },
  fNumber: { min: 0.5, max: 128 },
  shutterSeconds: { min: 0.00001, max: 36000 },
  iso: { min: 1, max: 1048576 },
} as const satisfies Record<string, InputRange>;

const DECIMAL = String.raw`(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?`;
const decimalPattern = new RegExp(`^${DECIMAL}$`, 'i');
const fractionPattern = new RegExp(`^(${DECIMAL})/(${DECIMAL})$`, 'i');

export function validatePositiveNumber(
  value: number,
  field: string,
  range: InputRange
): CalculationResult<number> {
  if (!Number.isFinite(value)) return { ok: false, field, code: 'non-finite' };
  if (value <= 0) return { ok: false, field, code: 'positive' };
  if (value < range.min || value > range.max)
    return {
      ok: false,
      field,
      code: 'range',
      min: range.min,
      max: range.max,
    };
  return { ok: true, value };
}

/** Parse a decimal or, when explicitly enabled, a simple positive fraction. */
export function parsePositiveInput(
  input: string,
  field: string,
  range: InputRange,
  allowFraction = false
): CalculationResult<number> {
  const value = input.trim();
  if (!value) return { ok: false, field, code: 'required' };
  let numeric: number;
  if (allowFraction && value.includes('/')) {
    const match = fractionPattern.exec(value);
    if (!match) return { ok: false, field, code: 'invalid' };
    const numerator = Number(match[1]);
    const denominator = Number(match[2]);
    if (
      !Number.isFinite(numerator) ||
      !Number.isFinite(denominator) ||
      denominator === 0
    )
      return { ok: false, field, code: 'invalid' };
    numeric = numerator / denominator;
  } else {
    if (!decimalPattern.test(value))
      return { ok: false, field, code: 'invalid' };
    numeric = Number(value);
  }
  return validatePositiveNumber(numeric, field, range);
}

export function finiteResult(
  value: number,
  field: string
): CalculationResult<number> {
  return Number.isFinite(value)
    ? { ok: true, value }
    : { ok: false, field, code: 'non-finite' };
}
