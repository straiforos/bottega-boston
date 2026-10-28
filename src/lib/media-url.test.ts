import { describe, expect, it } from 'vitest';
import { isSafeMediaUrl } from './media-url';

describe('isSafeMediaUrl', () => {
  it('allows https and site-relative paths', () => {
    expect(isSafeMediaUrl('https://cdn.example/x.jpg')).toBe(true);
    expect(isSafeMediaUrl('/media/gallery/1.webp')).toBe(true);
  });

  it('rejects javascript, mailto, and protocol-relative URLs', () => {
    expect(isSafeMediaUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeMediaUrl('mailto:x@y.z')).toBe(false);
    expect(isSafeMediaUrl('//evil.example/x')).toBe(false);
    expect(isSafeMediaUrl('http://insecure.example/x')).toBe(false);
  });
});
