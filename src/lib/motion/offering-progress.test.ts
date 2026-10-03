import { describe, expect, it } from 'vitest';
import { clamp, desktopCardProgress, easeOutCubic, mobileCardProgress } from './offering-progress';

describe('offering progress', () => {
  it('clamps values to the animation range', () => expect([clamp(-1), clamp(0.5), clamp(2)]).toEqual([0, 0.5, 1]));
  it('stagger cards by index', () => expect(desktopCardProgress(0.3, 0)).toBeGreaterThan(desktopCardProgress(0.3, 1)));
  it('reverses when overall scroll decreases', () =>
    expect(desktopCardProgress(0.2, 0)).toBeLessThan(desktopCardProgress(0.6, 0)));
  it('eases without leaving bounds', () => expect(easeOutCubic(0.5)).toBeCloseTo(0.875));
  it('calculates mobile viewport entry', () => expect(mobileCardProgress(1000, 650, 0)).toBe(1));
});
