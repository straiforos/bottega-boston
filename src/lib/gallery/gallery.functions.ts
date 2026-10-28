import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import { isSafeMediaUrl } from '@/lib/media-url';
import { buildGalleryItems, validateTileDraft } from './gallery-shared';

const safeUrl = z.string().max(2000).refine(isSafeMediaUrl, 'Media URL must be https:// or a site path');

const mediaSchema = z
  .object({
    media_type: z.enum(['image', 'video']),
    asset_key: z.null(),
    media_url: safeUrl,
    poster_url: safeUrl.nullable(),
    variants: z.array(z.object({ key: z.string(), url: safeUrl, width: z.number() })),
  })
  .optional();

export const fetchGallery = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db().select().from(schema.galleryItems);
  return buildGalleryItems(
    rows.map((r) => ({
      id: r.id,
      media_type: r.mediaType,
      asset_key: r.assetKey,
      media_url: r.mediaUrl,
      poster_url: r.posterUrl,
      variants: r.variants as Json | null,
      alt: r.alt,
      caption: r.caption,
      sort_order: r.sortOrder,
    })),
  );
});

export const saveTile = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().min(1).max(80),
        draft: z.object({ alt: z.string(), caption: z.string() }),
        media: mediaSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const error = validateTileDraft(data.draft);
    if (error) throw new Error(error);
    await db()
      .update(schema.galleryItems)
      .set({
        alt: data.draft.alt.trim(),
        caption: data.draft.caption.trim(),
        updatedAt: new Date().toISOString(),
        ...(data.media
          ? {
              mediaType: data.media.media_type,
              assetKey: null,
              mediaUrl: data.media.media_url,
              posterUrl: data.media.poster_url,
              variants: data.media.variants as unknown as Json,
            }
          : {}),
      })
      .where(eq(schema.galleryItems.id, data.id));
    return { ok: true };
  });

export const createTile = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.object({ sortOrder: z.number().int() }).parse(input))
  .handler(async ({ data }) => {
    const id = `tile-${crypto.randomUUID()}`;
    await db().insert(schema.galleryItems).values({ id, sortOrder: data.sortOrder, alt: '', caption: '' });
    return { id };
  });

export const deleteTile = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.string().min(1).max(80).parse(input))
  .handler(async ({ data: id }) => {
    await db().delete(schema.galleryItems).where(eq(schema.galleryItems.id, id));
    return { ok: true };
  });

export const setTileOrder = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.array(z.object({ id: z.string(), sortOrder: z.number().int() })).parse(input),
  )
  .handler(async ({ data: updates }) => {
    for (const update of updates) {
      await db()
        .update(schema.galleryItems)
        .set({ sortOrder: update.sortOrder })
        .where(eq(schema.galleryItems.id, update.id));
    }
    return { ok: true };
  });
