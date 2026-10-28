import { describe, expect, it } from 'vitest';
import { isAllowedUploadKey } from './upload-keys';

describe('isAllowedUploadKey', () => {
  it('allows menu and gallery prefixes', () => {
    expect(isAllowedUploadKey('menu-images/dish/1.webp')).toBe(true);
    expect(isAllowedUploadKey('gallery-media/email/1.jpg')).toBe(true);
  });

  it('rejects seeded asset paths and traversal', () => {
    expect(isAllowedUploadKey('a/v1/hero.png')).toBe(false);
    expect(isAllowedUploadKey('../menu-images/x')).toBe(false);
    expect(isAllowedUploadKey('/menu-images/x')).toBe(false);
    expect(isAllowedUploadKey('')).toBe(false);
  });
});
