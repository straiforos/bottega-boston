import { describe, expect, it } from 'vitest';
import { IMAGE_VARIANTS, fitWithin, uploadSizeError, variantsForConnection } from './process-image';

describe('photo processing rules', () => {
  it('accepts photos up to 100 MB and rejects larger', () => {
    expect(uploadSizeError(100 * 1024 * 1024)).toBeNull();
    expect(uploadSizeError(100 * 1024 * 1024 + 1)).toBe('Photos can be up to 100 MB.');
  });
  it('caps standard at 5 MB and high quality at 50 MB', () => {
    const byKey = Object.fromEntries(IMAGE_VARIANTS.map((v) => [v.key, v.maxBytes]));
    expect(byKey.standard).toBe(5 * 1024 * 1024);
    expect(byKey.hq).toBe(50 * 1024 * 1024);
  });
  it('never upscales and keeps aspect ratio', () => {
    expect(fitWithin(400, 300, 480)).toEqual({ width: 400, height: 300 });
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });
  it('serves only thumbnails on slow or data-saver connections', () => {
    expect(variantsForConnection({ saveData: true })).toEqual(['thumb']);
    expect(variantsForConnection({ effectiveType: '3g' })).toEqual(['thumb', 'standard']);
    expect(variantsForConnection({ effectiveType: '4g' })).toEqual(['thumb', 'standard', 'hq']);
  });
});
