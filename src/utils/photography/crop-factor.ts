import {
  PHOTOGRAPHY_LIMITS,
  finiteResult,
  validatePositiveNumber,
  type CalculationResult,
} from './validation.ts';

export interface SensorDimensions {
  widthMm: number;
  heightMm: number;
}

function validDimension(
  value: number,
  field: string
): CalculationResult<number> {
  return validatePositiveNumber(
    value,
    field,
    PHOTOGRAPHY_LIMITS.sensorDimensionMm
  );
}

export function calculateCropFactor(
  reference: SensorDimensions,
  target: SensorDimensions
): CalculationResult<{
  diagonalFactor: number;
  referenceDiagonalMm: number;
  targetDiagonalMm: number;
}> {
  const inputs = [
    validDimension(reference.widthMm, 'referenceWidth'),
    validDimension(reference.heightMm, 'referenceHeight'),
    validDimension(target.widthMm, 'targetWidth'),
    validDimension(target.heightMm, 'targetHeight'),
  ];
  for (const input of inputs) if (!input.ok) return input;
  const referenceDiagonalMm = Math.hypot(reference.widthMm, reference.heightMm);
  const targetDiagonalMm = Math.hypot(target.widthMm, target.heightMm);
  const diagonalFactor = referenceDiagonalMm / targetDiagonalMm;
  if (!Number.isFinite(diagonalFactor))
    return { ok: false, field: 'targetWidth', code: 'non-finite' };
  return {
    ok: true,
    value: { diagonalFactor, referenceDiagonalMm, targetDiagonalMm },
  };
}

export function calculateEquivalentFocalLength(
  focalLengthMm: number,
  diagonalFactor: number
): CalculationResult<{ equivalentMm: number }> {
  const focal = validatePositiveNumber(
    focalLengthMm,
    'focalLength',
    PHOTOGRAPHY_LIMITS.focalLengthMm
  );
  if (!focal.ok) return focal;
  const factor = validatePositiveNumber(
    diagonalFactor,
    'cropFactor',
    PHOTOGRAPHY_LIMITS.cropFactor
  );
  if (!factor.ok) return factor;
  const equivalent = finiteResult(
    focalLengthMm * diagonalFactor,
    'focalLength'
  );
  return equivalent.ok
    ? { ok: true, value: { equivalentMm: equivalent.value } }
    : equivalent;
}

export function calculateAngleOfView(
  sensorDimensionMm: number,
  focalLengthMm: number
): CalculationResult<{ degrees: number }> {
  const dimension = validatePositiveNumber(
    sensorDimensionMm,
    'sensorDimension',
    {
      min: PHOTOGRAPHY_LIMITS.sensorDimensionMm.min,
      max: PHOTOGRAPHY_LIMITS.sensorDimensionMm.max * Math.SQRT2,
    }
  );
  if (!dimension.ok) return dimension;
  const focal = validatePositiveNumber(
    focalLengthMm,
    'focalLength',
    PHOTOGRAPHY_LIMITS.focalLengthMm
  );
  if (!focal.ok) return focal;
  const angle = finiteResult(
    2 * Math.atan(sensorDimensionMm / (2 * focalLengthMm)) * (180 / Math.PI),
    'focalLength'
  );
  return angle.ok ? { ok: true, value: { degrees: angle.value } } : angle;
}

/** Rectilinear distant-field approximation; every argument and result is mm. */
export function estimateDistantFieldWidth(
  distanceMm: number,
  sensorWidthMm: number,
  focalLengthMm: number
): CalculationResult<{ widthMm: number }> {
  const distance = validatePositiveNumber(distanceMm, 'distance', {
    min: PHOTOGRAPHY_LIMITS.distanceM.min * 1000,
    max: PHOTOGRAPHY_LIMITS.distanceM.max * 1000,
  });
  if (!distance.ok) return distance;
  const dimension = validDimension(sensorWidthMm, 'sensorDimension');
  if (!dimension.ok) return dimension;
  const focal = validatePositiveNumber(
    focalLengthMm,
    'focalLength',
    PHOTOGRAPHY_LIMITS.focalLengthMm
  );
  if (!focal.ok) return focal;
  const width = finiteResult(
    (distanceMm * sensorWidthMm) / focalLengthMm,
    'distance'
  );
  return width.ok ? { ok: true, value: { widthMm: width.value } } : width;
}
