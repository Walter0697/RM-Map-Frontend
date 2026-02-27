import time from './scripts/generic/time';
import text from './scripts/generic/text';

test('formats schedule date ranges', () => {
  expect(time.displayDateRange('2026-01-01T08:00:00Z', '2026-01-01T10:00:00Z')).toBe(
    '2026-01-01 08:00 to 2026-01-01 10:00'
  );
  expect(time.displayDateRange('2026-01-01T08:00:00Z', null)).toBe('available at: 2026-01-01 08:00');
  expect(time.displayDateRange(null, '2026-01-01T10:00:00Z')).toBe('ends at 2026-01-01 10:00');
  expect(time.displayDateRange(null, null)).toBe('');
});

test('maps pricing labels to display values', () => {
  expect(text.price_display('free')).toBe('free :D');
  expect(text.price_display('cheap')).toBe('cheap $');
  expect(text.price_display('middle')).toBe('middle $$');
  expect(text.price_display('expensive')).toBe('expensive $$$');
  expect(text.price_display('unknown')).toBe('');
});
