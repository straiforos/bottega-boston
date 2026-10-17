import { describe, expect, it } from 'vitest';
import { durationUntil, endTimeFor } from './EventEditor';

describe('event end time', () => {
  it('turns a 6pm start and 9pm end into 180 minutes', () => {
    expect(durationUntil('2026-10-20T18:00', '21:00')).toBe(180);
  });
  it('treats an end before the start as after midnight', () => {
    expect(durationUntil('2026-10-20T22:00', '01:00')).toBe(180);
  });
  it('shows the end time from start plus length', () => {
    expect(endTimeFor('2026-10-20T18:30', 120)).toBe('20:30');
    expect(endTimeFor('2026-10-20T23:00', 90)).toBe('00:30');
  });
});
