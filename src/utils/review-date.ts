/** Content review dates follow the maintainer's authoring day, not the viewer's. */
export const CONTENT_REVIEW_TIME_ZONE = 'Asia/Shanghai';

const reviewDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CONTENT_REVIEW_TIME_ZONE,
  calendar: 'gregory',
  numberingSystem: 'latn',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** YYYY-MM-DD keeps existing date-only future comparisons valid. */
export function contentReviewDate(now: Date = new Date()): string {
  const parts = Object.fromEntries(
    reviewDateFormatter.formatToParts(now).map(part => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
