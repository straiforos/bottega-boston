import { describe, expect, it } from 'vitest';
import {
  STUDIO_COUNTERTOP,
  STUDIO_DINING_PLATE,
  cateringStudioSceneLines,
  diningStudioSceneLines,
} from './studio-scene';

describe('studio-scene', () => {
  it('locks countertop hex and forbids marble wood paper', () => {
    expect(STUDIO_COUNTERTOP).toContain('#C4B5A0');
    expect(STUDIO_COUNTERTOP).toMatch(/no marble/i);
    expect(STUDIO_COUNTERTOP).toMatch(/no wood/i);
  });

  it('locks a white ceramic dining plate', () => {
    expect(STUDIO_DINING_PLATE).toMatch(/white ceramic/i);
    expect(STUDIO_DINING_PLATE).toMatch(/no marble/i);
  });

  it('dining requirePlate forbids bare counter', () => {
    const text = diningStudioSceneLines({ requirePlate: true }).join(' ');
    expect(text).toMatch(/Do not leave it bare/i);
    expect(text).toContain(STUDIO_COUNTERTOP);
  });

  it('catering scene forbids dining plate', () => {
    const text = cateringStudioSceneLines().join(' ');
    expect(text).toMatch(/never a single dining plate/i);
    expect(text).toContain(STUDIO_COUNTERTOP);
  });
});
