import test from 'node:test';
import assert from 'node:assert/strict';
import { signed } from '../../src/components/tools/tool-dom.ts';

test('signed formats positive, negative, and zero values consistently', () => {
  assert.equal(signed(1), '+1.00');
  assert.equal(signed(-1), '-1.00');
  assert.equal(signed(0), '0.00');
});

test('signed never displays a rounded negative zero', () => {
  assert.equal(signed(-0.000001), '0.00');
  assert.equal(signed(-0.004, 2), '0.00');
});
