import { describe, expect, it } from 'vitest';
import { DRAFT_TTL_MS, decodeDraft, encodeDraft } from './form-draft';

describe('request form drafts', () => {
  it('restores a draft saved within 24 hours', () => {
    expect(decodeDraft(encodeDraft({ name: 'Ada' }, 0), DRAFT_TTL_MS)).toEqual({ name: 'Ada' });
  });
  it('drops a draft older than 24 hours', () => {
    expect(decodeDraft(encodeDraft({ name: 'Ada' }, 0), DRAFT_TTL_MS + 1)).toBeNull();
  });
  it('ignores corrupt storage', () => {
    expect(decodeDraft('{nope', 0)).toBeNull();
  });
});
