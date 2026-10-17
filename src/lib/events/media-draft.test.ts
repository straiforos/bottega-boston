import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { readMediaDraft, saveMediaDraft } from './media-draft';
import { DRAFT_TTL_MS } from './form-draft';

describe('browser media drafts', () => {
  it.each(['image/png', 'video/mp4'])('restores file bytes and metadata for %s', async (type) => {
    const file = new File(['original-media-bytes'], `upload-${type.split('/')[1]}`, { type, lastModified: 123 });
    await saveMediaDraft(type, file, 0);
    const restored = await readMediaDraft(type, 1);
    expect(restored?.name).toBe(file.name);
    expect(restored?.type).toBe(type);
    expect(restored?.lastModified).toBe(123);
    expect(await restored?.text()).toBe('original-media-bytes');
  });

  it('keeps editor files separate', async () => {
    await saveMediaDraft('menu:1', new File(['dish'], 'dish.png'), 0);
    expect(await readMediaDraft('event:1', 1)).toBeNull();
    expect((await readMediaDraft('menu:1', 1))?.name).toBe('dish.png');
  });

  it('drops blobs after the same 24-hour draft lifetime', async () => {
    await saveMediaDraft('expired', new File(['photo'], 'photo.png'), 0);
    expect(await readMediaDraft('expired', DRAFT_TTL_MS + 1)).toBeNull();
    expect(await readMediaDraft('expired', 1)).toBeNull();
  });

  it('clear wins over a pending write on save, cancel or removal', async () => {
    const pending = saveMediaDraft('cleared', new File(['video'], 'video.mp4'));
    const cleared = saveMediaDraft('cleared', null);
    await Promise.all([pending, cleared]);
    expect(await readMediaDraft('cleared')).toBeNull();
  });
});