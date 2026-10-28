import test from 'node:test';
import assert from 'node:assert/strict';
import { compareExposureStops } from '../../src/utils/photography/exposure-stops.ts';

const baseline = { fNumber: 2.8, shutterSeconds: 1 / 125, iso: 400 };
const closeTo = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} ≠ ${expected}`
  );

test('f/2.8 to f/4 is approximately minus one stop of sensor exposure', () => {
  const result = compareExposureStops(baseline, { ...baseline, fNumber: 4 });
  assert.ok(result.ok);
  closeTo(result.value.apertureStops, -1.029146, 1e-6);
  closeTo(result.value.sensorExposureStops, result.value.apertureStops);
  closeTo(result.value.sensorExposureRatio, (2.8 / 4) ** 2);
});

test('doubling shutter time adds one stop of sensor exposure', () => {
  const result = compareExposureStops(baseline, {
    ...baseline,
    shutterSeconds: baseline.shutterSeconds * 2,
  });
  assert.ok(result.ok);
  closeTo(result.value.shutterStops, 1);
  closeTo(result.value.sensorExposureStops, 1);
  closeTo(result.value.sensorExposureRatio, 2);
});

test('doubling only ISO leaves sensor exposure unchanged and adds nominal output', () => {
  const result = compareExposureStops(baseline, {
    ...baseline,
    iso: baseline.iso * 2,
  });
  assert.ok(result.ok);
  closeTo(result.value.sensorExposureRatio, 1);
  closeTo(result.value.sensorExposureStops, 0);
  closeTo(result.value.nominalIsoMappingStops, 1);
  closeTo(result.value.nominalOutputStops, 1);
  closeTo(result.value.nominalOutputRatio, 2);
});

test('aperture, shutter and ISO contributions combine independently', () => {
  const result = compareExposureStops(baseline, {
    fNumber: 4,
    shutterSeconds: baseline.shutterSeconds / 2,
    iso: baseline.iso * 4,
  });
  assert.ok(result.ok);
  closeTo(result.value.sensorExposureStops, result.value.apertureStops - 1);
  closeTo(result.value.nominalIsoMappingStops, 2);
  closeTo(
    result.value.nominalOutputStops,
    result.value.sensorExposureStops + 2
  );
});

test('zero, negative, non-finite and out-of-range values return field errors', () => {
  const cases = [
    [{ ...baseline, fNumber: 0 }, 'before.fNumber'],
    [{ ...baseline, shutterSeconds: -1 }, 'before.shutterSeconds'],
    [{ ...baseline, iso: Number.NaN }, 'before.iso'],
    [{ ...baseline, iso: Number.POSITIVE_INFINITY }, 'before.iso'],
    [{ ...baseline, fNumber: 129 }, 'before.fNumber'],
  ] as const;
  for (const [settings, field] of cases) {
    const result = compareExposureStops(settings, baseline);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, field);
  }
  const after = compareExposureStops(baseline, { ...baseline, iso: 0 });
  assert.equal(after.ok, false);
  if (!after.ok) assert.equal(after.field, 'after.iso');
});

test('all supported exposure boundaries produce finite comparisons', () => {
  const result = compareExposureStops(
    { fNumber: 0.5, shutterSeconds: 0.00001, iso: 1 },
    { fNumber: 128, shutterSeconds: 36000, iso: 1048576 }
  );
  assert.ok(result.ok);
  for (const value of Object.values(result.value))
    assert.ok(Number.isFinite(value));
});
