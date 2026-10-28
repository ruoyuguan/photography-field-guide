import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAngleOfView,
  calculateCropFactor,
  calculateEquivalentFocalLength,
  estimateDistantFieldWidth,
} from '../../src/utils/photography/crop-factor.ts';
import { parsePositiveInput } from '../../src/utils/photography/validation.ts';

const fullFrame = { widthMm: 36, heightMm: 24 };
const fujifilmApsC = { widthMm: 23.5, heightMm: 15.6 };
const closeTo = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} ≠ ${expected}`
  );

test('identical sensor dimensions produce a crop factor of 1', () => {
  const result = calculateCropFactor(fullFrame, fullFrame);
  assert.ok(result.ok);
  closeTo(result.value.diagonalFactor, 1);
});

test('nominal APS-C 16 mm is approximately 24 mm equivalent', () => {
  const result = calculateEquivalentFocalLength(16, 1.5);
  assert.ok(result.ok);
  closeTo(result.value.equivalentMm, 24);
});

test('real sensor dimensions differ from the nominal 1.5 shortcut', () => {
  const crop = calculateCropFactor(fullFrame, fujifilmApsC);
  assert.ok(crop.ok);
  const equivalent = calculateEquivalentFocalLength(
    16,
    crop.value.diagonalFactor
  );
  assert.ok(equivalent.ok);
  assert.notEqual(crop.value.diagonalFactor, 1.5);
  assert.ok(equivalent.value.equivalentMm > 24);
  closeTo(
    crop.value.referenceDiagonalMm,
    Math.hypot(fullFrame.widthMm, fullFrame.heightMm)
  );
});

test('diagonal equivalence does not guarantee both axes with different aspect ratios', () => {
  const target = { widthMm: 24, heightMm: 18 };
  const crop = calculateCropFactor(fullFrame, target);
  assert.ok(crop.ok);
  const equivalent = calculateEquivalentFocalLength(
    20,
    crop.value.diagonalFactor
  );
  assert.ok(equivalent.ok);
  const targetHorizontal = calculateAngleOfView(target.widthMm, 20);
  const referenceHorizontal = calculateAngleOfView(
    fullFrame.widthMm,
    equivalent.value.equivalentMm
  );
  const targetDiagonal = calculateAngleOfView(
    Math.hypot(target.widthMm, target.heightMm),
    20
  );
  const referenceDiagonal = calculateAngleOfView(
    Math.hypot(fullFrame.widthMm, fullFrame.heightMm),
    equivalent.value.equivalentMm
  );
  assert.ok(targetHorizontal.ok && referenceHorizontal.ok);
  assert.ok(targetDiagonal.ok && referenceDiagonal.ok);
  assert.ok(
    Math.abs(
      targetHorizontal.value.degrees - referenceHorizontal.value.degrees
    ) > 1
  );
  closeTo(targetDiagonal.value.degrees, referenceDiagonal.value.degrees);
});

test('distant field width keeps every length in the same unit', () => {
  const result = estimateDistantFieldWidth(2000, 23.5, 16);
  assert.ok(result.ok);
  closeTo(result.value.widthMm / 1000, 2.9375);
});

test('restricted fractions are parsed without evaluating expressions', () => {
  const range = { min: 0.00001, max: 36000 };
  const valid = parsePositiveInput('1/125', 'shutter', range, true);
  assert.ok(valid.ok);
  closeTo(valid.value, 1 / 125);
  for (const invalid of ['1/0', '1/(125)', '1+2', 'alert(1)', '1/2/3'])
    assert.equal(parsePositiveInput(invalid, 'shutter', range, true).ok, false);
});

test('invalid and extreme inputs return field errors instead of results', () => {
  for (const dimensions of [
    { widthMm: 0, heightMm: 24 },
    { widthMm: -1, heightMm: 24 },
    { widthMm: Number.NaN, heightMm: 24 },
    { widthMm: Number.POSITIVE_INFINITY, heightMm: 24 },
    { widthMm: 201, heightMm: 24 },
  ]) {
    const result = calculateCropFactor(dimensions, fullFrame);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'referenceWidth');
  }
  for (const value of ['', '0', '-2', 'Infinity', 'NaN', '0.000001', '2001'])
    assert.equal(
      parsePositiveInput(value, 'focalLength', { min: 1, max: 2000 }).ok,
      false
    );
});

test('legal input boundaries remain finite', () => {
  const crop = calculateCropFactor(
    { widthMm: 1, heightMm: 1 },
    { widthMm: 200, heightMm: 200 }
  );
  assert.ok(crop.ok);
  const angle = calculateAngleOfView(200, 1);
  assert.ok(angle.ok);
  assert.ok(angle.value.degrees < 180);
  const diagonalAngle = calculateAngleOfView(Math.hypot(200, 200), 1);
  assert.ok(diagonalAngle.ok);
  assert.ok(diagonalAngle.value.degrees < 180);
});
