import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTENT_REVIEW_TIME_ZONE,
  contentReviewDate,
} from '../../src/utils/review-date.ts';

test('content review dates change at Shanghai midnight, not UTC midnight', () => {
  assert.equal(CONTENT_REVIEW_TIME_ZONE, 'Asia/Shanghai');
  assert.equal(
    contentReviewDate(new Date('2026-10-29T15:59:59.999Z')),
    '2026-10-29'
  );
  assert.equal(
    contentReviewDate(new Date('2026-10-29T16:00:00.000Z')),
    '2026-10-30'
  );
  assert.equal(
    contentReviewDate(new Date('2026-10-29T16:46:00.000Z')),
    '2026-10-30'
  );
});

test('the authoring date crosses the year boundary at the same local midnight', () => {
  assert.equal(
    contentReviewDate(new Date('2026-12-31T15:59:59.999Z')),
    '2026-12-31'
  );
  assert.equal(
    contentReviewDate(new Date('2026-12-31T16:00:00.000Z')),
    '2027-01-01'
  );
});

test('leap day and the following month retain real Gregorian calendar dates', () => {
  assert.equal(
    contentReviewDate(new Date('2024-02-28T16:00:00.000Z')),
    '2024-02-29'
  );
  assert.equal(
    contentReviewDate(new Date('2024-02-29T15:59:59.999Z')),
    '2024-02-29'
  );
  assert.equal(
    contentReviewDate(new Date('2024-02-29T16:00:00.000Z')),
    '2024-03-01'
  );
});

test('zero-padded date strings still reject only actual future authoring days', () => {
  const today = contentReviewDate(new Date('2026-01-01T16:00:00.000Z'));
  assert.equal(today, '2026-01-02');
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(
    ['2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03'].filter(
      date => date > today
    ),
    ['2026-01-03']
  );
});
