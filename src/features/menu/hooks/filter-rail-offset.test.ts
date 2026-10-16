import { describe, expect, it } from 'vitest';
import { filterRailOffset } from './filter-rail-offset';

const base = { railTop: 600, viewportH: 1267, headerH: 93, filterH: 450 };

describe('filterRailOffset', () => {
  it('keeps the filter at its natural top position at the top of the page', () => {
    expect(filterRailOffset({ ...base, scrollY: 0 })).toBe(0);
  });

  it('glides linearly toward the centered offset while scrolling', () => {
    const centered = (1267 + 93 - 450) / 2;
    expect(filterRailOffset({ ...base, scrollY: 300 })).toBeCloseTo(centered / 2);
  });

  it('is vertically centered below the header once stuck', () => {
    const stuck = (1267 + 93 - 450) / 2;
    expect(filterRailOffset({ ...base, scrollY: 600 })).toBe(stuck);
    expect(filterRailOffset({ ...base, scrollY: 5000 })).toBe(stuck);
  });

  it('never slides the filter under the header when the filter is tall', () => {
    expect(filterRailOffset({ ...base, scrollY: 600, filterH: 1300 })).toBe(93);
  });
});
