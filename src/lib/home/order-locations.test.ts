import { describe, expect, it } from 'vitest';
import { defaultOrderUrls, isValidOrderUrl, mergeOrderUrls } from './order-locations';

describe('order locations', () => {
  it('uses stored URLs for known locations', () => {
    expect(mergeOrderUrls({ boston: 'https://toasttab.com/bottega' }).boston).toBe('https://toasttab.com/bottega');
    expect(mergeOrderUrls({ boston: 'https://toasttab.com/bottega' }).brookline).toBe(defaultOrderUrls.brookline);
  });
  it('rejects non-https links', () => {
    expect(isValidOrderUrl('http://example.com')).toBe(false);
    expect(isValidOrderUrl('javascript:alert(1)')).toBe(false);
    expect(mergeOrderUrls({ boston: 'javascript:alert(1)' }).boston).toBe(defaultOrderUrls.boston);
  });
});
