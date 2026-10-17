import { describe, expect, it } from 'vitest';
import { describeRecurrence, nthWeekdayOfMonth, upcomingOccurrences, zonedToUtc, type EventSchedule } from './occurrences';
import { isTicketTailorUrl, orderTotal, parsePriceOptions, priceOrder } from './requests';
import { upcomingEvents, type BottegaEvent } from './events-api';

const tz = 'America/New_York';
const base = (over: Partial<EventSchedule> = {}): EventSchedule => ({
  id: 'e',
  startsAt: zonedToUtc('2026-10-01', '19:00', tz).toISOString(), // Thursday
  durationMinutes: 120,
  timezone: tz,
  ticketUrl: null,
  recurrence: null,
  ...over,
});
const now = zonedToUtc('2026-10-02', '12:00', tz);

describe('occurrences', () => {
  it('weekly repeats on chosen weekdays', () => {
    const dates = upcomingOccurrences(base({ recurrence: { freq: 'weekly', weekdays: [4] } }), [], now, 3).map((o) => o.date);
    expect(dates).toEqual(['2026-10-08', '2026-10-15', '2026-10-22']);
  });
  it('every other week skips alternate weeks', () => {
    const dates = upcomingOccurrences(base({ recurrence: { freq: 'biweekly', weekdays: [4] } }), [], now, 2).map((o) => o.date);
    expect(dates).toEqual(['2026-10-15', '2026-10-29']);
  });
  it('first Friday of the month', () => {
    expect(nthWeekdayOfMonth(2026, 11, 5, 1)).toBe('2026-11-06');
    const dates = upcomingOccurrences(base({ recurrence: { freq: 'monthly', weekdays: [5], nth: 1 } }), [], now, 2).map((o) => o.date);
    expect(dates).toEqual(['2026-10-02', '2026-11-06']);
  });
  it('stops at the end date and drops skipped dates', () => {
    const ev = base({ recurrence: { freq: 'weekly', weekdays: [4], until: '2026-10-22' } });
    const ex = [{ occurrenceDate: '2026-10-15', skipped: true, startTime: null, ticketUrl: null }];
    expect(upcomingOccurrences(ev, ex, now, 10).map((o) => o.date)).toEqual(['2026-10-08', '2026-10-22']);
  });
  it('keeps 7pm local across the daylight-saving change', () => {
    const ev = base({ recurrence: { freq: 'weekly', weekdays: [4] } });
    const nov = upcomingOccurrences(ev, [], zonedToUtc('2026-11-01', '00:00', tz), 1)[0];
    expect(nov.startsAt).toBe('2026-11-06T00:00:00.000Z'); // Thu Nov 5, 7pm EST
  });
  it('one-off events disappear once they end', () => {
    expect(upcomingOccurrences(base(), [], now)).toEqual([]);
  });
  it('describes repeats in plain English', () => {
    expect(describeRecurrence({ freq: 'weekly', weekdays: [4] })).toBe('Every Thursday');
    expect(describeRecurrence({ freq: 'monthly', weekdays: [5], nth: 1 })).toBe('First Friday of the month');
  });
});

describe('upcoming events', () => {
  it('hides past and unpublished events', () => {
    const ev = (id: string, over: Partial<BottegaEvent>): BottegaEvent => ({
      ...base(), id, title: id, description: '', locationId: 'brookline', imageUrl: null, published: true, exceptions: [], ...over,
    });
    const list = upcomingEvents([ev('past', {}), ev('hidden', { published: false, startsAt: '2027-01-01T00:00:00Z' }), ev('soon', { startsAt: '2026-12-01T00:00:00Z' })], now);
    expect(list.map((u) => u.event.id)).toEqual(['soon']);
  });
});

describe('catering orders', () => {
  it('parses sized prices', () => {
    expect(parsePriceOptions('Mini $3.25 | Traditional $5.25')).toEqual([
      { label: 'Mini', amount: 3.25 },
      { label: 'Traditional', amount: 5.25 },
    ]);
  });
  it('prices lines from the menu and totals them', () => {
    const catalog = new Map([['a', { name: 'Cesare', price: '$140.00' }], ['b', { name: 'Cannoli', price: 'Mini $3.25 | Traditional $5.25' }]]);
    const lines = priceOrder([{ itemId: 'a', option: '', quantity: 2 }, { itemId: 'b', option: 'Mini', quantity: 4 }], catalog);
    expect(orderTotal(lines)).toBe(293);
  });
  it('rejects items that are not catering trays', () => {
    expect(() => priceOrder([{ itemId: 'x', option: '', quantity: 1 }], new Map())).toThrow();
  });
});

describe('ticket links', () => {
  it('accepts only https Ticket Tailor addresses', () => {
    expect(isTicketTailorUrl('https://www.tickettailor.com/events/bottega/123')).toBe(true);
    expect(isTicketTailorUrl('http://www.tickettailor.com/events/x')).toBe(false);
    expect(isTicketTailorUrl('https://tickettailor.com.evil.io/x')).toBe(false);
  });
});
