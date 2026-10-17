import { describe, expect, it } from 'vitest';
import { adminDraftKey, isDirty } from './form-draft';

describe('admin drafts', () => {
  it('keeps a draft only when it differs from the loaded record', () => {
    expect(isDirty({ name: 'Cacio' }, { name: 'Cacio' })).toBe(false);
    expect(isDirty({ name: 'Cacio e pepe' }, { name: 'Cacio' })).toBe(true);
  });
  it('stores staff drafts apart from guest request drafts', () => {
    expect(adminDraftKey('event:1')).toBe('bottega:admin-draft:event:1');
  });
});
