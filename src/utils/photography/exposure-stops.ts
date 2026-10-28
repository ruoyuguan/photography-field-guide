import {
  PHOTOGRAPHY_LIMITS,
  validatePositiveNumber,
  type CalculationResult,
} from './validation.ts';

export interface ExposureSettings {
  fNumber: number;
  shutterSeconds: number;
  iso: number;
}

function validateSettings(
  settings: ExposureSettings,
  prefix: 'before' | 'after'
): CalculationResult<true> {
  const inputs = [
    validatePositiveNumber(
      settings.fNumber,
      `${prefix}.fNumber`,
      PHOTOGRAPHY_LIMITS.fNumber
    ),
    validatePositiveNumber(
      settings.shutterSeconds,
      `${prefix}.shutterSeconds`,
      PHOTOGRAPHY_LIMITS.shutterSeconds
    ),
    validatePositiveNumber(
      settings.iso,
      `${prefix}.iso`,
      PHOTOGRAPHY_LIMITS.iso
    ),
  ];
  for (const input of inputs) if (!input.ok) return input;
  return { ok: true, value: true };
}

export function compareExposureStops(
  before: ExposureSettings,
  after: ExposureSettings
): CalculationResult<{
  apertureStops: number;
  shutterStops: number;
  sensorExposureRatio: number;
  sensorExposureStops: number;
  nominalIsoMappingStops: number;
  nominalOutputRatio: number;
  nominalOutputStops: number;
}> {
  const validBefore = validateSettings(before, 'before');
  if (!validBefore.ok) return validBefore;
  const validAfter = validateSettings(after, 'after');
  if (!validAfter.ok) return validAfter;

  const apertureStops = 2 * Math.log2(before.fNumber / after.fNumber);
  const shutterStops = Math.log2(after.shutterSeconds / before.shutterSeconds);
  const nominalIsoMappingStops = Math.log2(after.iso / before.iso);
  const sensorExposureStops = apertureStops + shutterStops;
  const nominalOutputStops = sensorExposureStops + nominalIsoMappingStops;
  const sensorExposureRatio =
    (after.shutterSeconds / before.shutterSeconds) *
    (before.fNumber / after.fNumber) ** 2;
  const nominalOutputRatio = sensorExposureRatio * (after.iso / before.iso);
  const outputs = [
    apertureStops,
    shutterStops,
    sensorExposureRatio,
    sensorExposureStops,
    nominalIsoMappingStops,
    nominalOutputRatio,
    nominalOutputStops,
  ];
  if (!outputs.every(Number.isFinite))
    return { ok: false, field: 'after', code: 'non-finite' };
  return {
    ok: true,
    value: {
      apertureStops,
      shutterStops,
      sensorExposureRatio,
      sensorExposureStops,
      nominalIsoMappingStops,
      nominalOutputRatio,
      nominalOutputStops,
    },
  };
}
