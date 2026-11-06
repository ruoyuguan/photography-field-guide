import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareFormats,
  findFormat,
  FORMAT_PRESETS,
} from '../../src/utils/photography/format-comparison.ts';
const closeTo = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const frame = { widthMm: 36, heightMm: 24 };

test('format comparison uses physical area and diagonal reference independently', () => {
  const result = compareFormats(frame, { widthMm: 43.8, heightMm: 32.9 });
  assert.ok(result.ok);
  closeTo(result.value.a.areaMm2, 864);
  closeTo(result.value.a.diagonalCropFactor, 1);
  closeTo(result.value.b.areaMm2, 1441.02);
  closeTo(result.value.areaRatioBtoA, 1441.02 / 864);
  closeTo(
    result.value.b.diagonalCropFactor,
    Math.hypot(36, 24) / Math.hypot(43.8, 32.9)
  );
});

test('all preset pairs keep area and length ratios in ONE SVG scale', () => {
  for (const a of FORMAT_PRESETS)
    for (const b of FORMAT_PRESETS) {
      const result = compareFormats(a, b);
      assert.ok(result.ok);
      const { overlay, areaRatioBtoA } = result.value;
      closeTo(overlay.a.width / overlay.b.width, a.widthMm / b.widthMm);
      closeTo(overlay.a.height / overlay.b.height, a.heightMm / b.heightMm);
      closeTo(
        (overlay.b.width * overlay.b.height) /
          (overlay.a.width * overlay.a.height),
        areaRatioBtoA
      );
      for (const rectangle of [overlay.a, overlay.b]) {
        assert.ok(rectangle.x >= 20 - 1e-9 && rectangle.y >= 20 - 1e-9);
        assert.ok(rectangle.x + rectangle.width <= 380 + 1e-9);
        assert.ok(rectangle.y + rectangle.height <= 240 + 1e-9);
      }
    }
});

test('swap and rotation preserve area; aspect and orientation remain explicit', () => {
  const a = { widthMm: 56, heightMm: 56 };
  const forward = compareFormats(frame, a);
  const backward = compareFormats(a, frame);
  const rotated = compareFormats({ widthMm: 24, heightMm: 36 }, a);
  assert.ok(forward.ok && backward.ok && rotated.ok);
  closeTo(forward.value.areaRatioBtoA * backward.value.areaRatioBtoA, 1);
  closeTo(
    forward.value.a.diagonalCropFactor,
    rotated.value.a.diagonalCropFactor
  );
  closeTo(forward.value.a.aspectRatio * rotated.value.a.aspectRatio, 1);
  closeTo(forward.value.b.aspectRatio, 1);
});

test('film presets are image-area references rather than nominal sheet sizes', () => {
  const sheet = findFormat('film-4x5');
  const roll = findFormat('film-6x6');
  assert.ok(sheet && roll);
  assert.equal(sheet.widthMm, 120);
  assert.equal(sheet.heightMm, 96);
  assert.equal(roll.widthMm, 56);
  assert.equal(roll.heightMm, 56);
  assert.equal(findFormat('not-a-format'), undefined);
  assert.equal(
    new Set(FORMAT_PRESETS.map(preset => preset.id)).size,
    FORMAT_PRESETS.length
  );
});

test('format comparison rejects nonfinite, nonpositive and out-of-range dimensions', () => {
  for (const n of [
    NaN,
    Infinity,
    -Infinity,
    0,
    -1,
    0.5,
    201,
    Number.MAX_VALUE,
  ]) {
    const result = compareFormats(frame, { widthMm: n, heightMm: 24 });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'b.widthMm');
  }
  const minimum = compareFormats(
    { widthMm: 1, heightMm: 1 },
    { widthMm: 200, heightMm: 200 }
  );
  assert.ok(minimum.ok);
  closeTo(minimum.value.areaRatioBtoA, 40000);
});
