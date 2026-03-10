test('test runner is configured', () => {
  expect(true).toBe(true)
})

import time from './scripts/generic/time';
import text from './scripts/generic/text';

test('formats schedule date ranges', () => {
  const fromOnly = time.displayDateRange('2026-01-01T08:00:00Z', null);
  const toOnly = time.displayDateRange(null, '2026-01-01T10:00:00Z');
  expect(time.displayDateRange('2026-01-01T08:00:00Z', '2026-01-01T10:00:00Z')).toBe(
    `${fromOnly.replace('available at: ', '')} to ${toOnly.replace('ends at ', '')}`
  );
  expect(fromOnly).toMatch(/^available at: \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  expect(toOnly).toMatch(/^ends at \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  expect(time.displayDateRange(null, null)).toBe('');
});

test('maps pricing labels to display values', () => {
  expect(text.price_display('free')).toBe('free :D');
  expect(text.price_display('cheap')).toBe('cheap $');
  expect(text.price_display('middle')).toBe('middle $$');
  expect(text.price_display('expensive')).toBe('expensive $$$');
  expect(text.price_display('unknown')).toBe('');
});
