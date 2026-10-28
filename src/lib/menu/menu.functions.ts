import { createServerFn } from '@tanstack/react-start';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import { buildMenuSections, validateDishDraft, type DishDraft, type ImageVariant, type UploadedImage } from './menu-shared';

export { buildMenuSections, validateDishDraft };
export type { DishDraft, ImageVariant, UploadedImage };

const dishDraftSchema = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

const uploadedSchema = z
  .object({
    url: z.string(),
    variants: z.array(z.object({ key: z.string(), url: z.string(), width: z.number() })),
  })
  .optional();

export const fetchMenu = createServerFn({ method: 'GET' }).handler(async () => {
  const [sections, items] = await Promise.all([
    db().select().from(schema.menuSections),
    db().select().from(schema.menuItems),
  ]);
  return buildMenuSections(
    sections.map((s) => ({ id: s.id, name: s.name, note: s.note, sort_order: s.sortOrder })),
    items.map((i) => ({
      id: i.id,
      section_id: i.sectionId,
      name: i.name,
      price: i.price,
      description: i.description,
      tags: i.tags ?? [],
      image_url: i.imageUrl,
      image_variants: i.imageVariants as Json | null,
      sort_order: i.sortOrder,
    })),
  );
});

export const saveDish = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z
      .object({
        dishId: z.string().min(1).max(80),
        draft: dishDraftSchema,
        image: uploadedSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const error = validateDishDraft(data.draft);
    if (error) throw new Error(error);
    await db()
      .update(schema.menuItems)
      .set({
        name: data.draft.name.trim(),
        price: data.draft.price.trim(),
        description: data.draft.description.trim(),
        tags: [...data.draft.tags],
        updatedAt: new Date().toISOString(),
        ...(data.image
          ? { imageUrl: data.image.url, imageVariants: data.image.variants as unknown as Json }
          : {}),
      })
      .where(eq(schema.menuItems.id, data.dishId));
    return { ok: true };
  });

export const addDish = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z
      .object({
        sectionId: z.string().min(1).max(80),
        draft: dishDraftSchema,
        sortOrder: z.number().int(),
        image: uploadedSchema,
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const error = validateDishDraft(data.draft);
    if (error) throw new Error(error);
    const id = `dish-${crypto.randomUUID()}`;
    await db()
      .insert(schema.menuItems)
      .values({
        id,
        sectionId: data.sectionId,
        name: data.draft.name.trim(),
        price: data.draft.price.trim(),
        description: data.draft.description.trim(),
        tags: [...data.draft.tags],
        sortOrder: data.sortOrder,
        imageUrl: data.image?.url ?? null,
        imageVariants: (data.image?.variants as unknown as Json) ?? null,
      });
    return { id };
  });

export const deleteDish = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.string().min(1).max(80).parse(input))
  .handler(async ({ data: dishId }) => {
    await db().delete(schema.menuItems).where(eq(schema.menuItems.id, dishId));
    return { ok: true };
  });
