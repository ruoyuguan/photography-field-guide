import test from 'node:test';
import assert from 'node:assert/strict';
import {
  signed,
  formatShutter,
  applyRange,
  syncRange,
} from '../../src/components/tools/tool-dom.ts';

test('signed formats positive, negative, and zero values consistently', () => {
  assert.equal(signed(1), '+1.00');
  assert.equal(signed(-1), '-1.00');
  assert.equal(signed(0), '0.00');
});

test('signed never displays a rounded negative zero', () => {
  assert.equal(signed(-0.000001), '0.00');
  assert.equal(signed(-0.004, 2), '0.00');
});

import {
  parsePositiveInput,
  PHOTOGRAPHY_LIMITS,
} from '../../src/utils/photography/validation.ts';

test('shutter display round-trips seconds without rounding to a different exposure', () => {
  for (const seconds of [
    0.8,
    0.63,
    0.5 * 2 ** (1 / 3),
    1 / 125,
    0.00001,
    1,
    36000,
  ]) {
    const parsed = parsePositiveInput(
      formatShutter(seconds),
      'shutter',
      PHOTOGRAPHY_LIMITS.shutterSeconds,
      true
    );
    assert.ok(parsed.ok);
    assert.ok(Math.abs(parsed.value - seconds) / seconds < 1e-7);
  }
});

test('repeated one-third-stop shutter changes keep progressing through sub-second times', () => {
  const input = { value: '0.5', dataset: { format: 'shutter', unit: 's' } };
  const attributes = new Map<string, string>();
  const slider = {
    value: '-1',
    dataset: { scale: 'log2' },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
  };
  const root = {
    querySelector(selector: string) {
      return selector.includes('data-range-for') ? slider : input;
    },
  } as unknown as HTMLElement;
  let previous = 0.5;
  for (let step = 0; step < 5; step++) {
    slider.value = String(Math.log2(previous) + 1 / 3);
    applyRange(root, 'before.shutter');
    const parsed = parsePositiveInput(
      input.value,
      'shutter',
      PHOTOGRAPHY_LIMITS.shutterSeconds,
      true
    );
    assert.ok(parsed.ok);
    assert.ok(parsed.value > previous);
    assert.ok(Math.abs(Math.log2(parsed.value / previous) - 1 / 3) < 1e-7);
    syncRange(root, 'before.shutter', parsed.value);
    assert.ok(attributes.get('aria-valuetext')?.endsWith(' s'));
    previous = parsed.value;
  }
});
