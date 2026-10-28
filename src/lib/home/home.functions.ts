import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { db, schema } from '@/lib/db';
import type { Json } from '@/lib/json';
import { mergeHomeContent } from './home-shared';

export const fetchHomeContent = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db().select().from(schema.homeContent);
  return mergeHomeContent(rows.map((r) => ({ key: r.key, data: r.data as Json })));
});

export const fetchHomeContentKey = createServerFn({ method: 'GET' })
  .inputValidator((input: unknown) => z.string().min(1).max(80).parse(input))
  .handler(async ({ data: key }) => {
    const row = await db().query.homeContent.findFirst({
      where: (t, { eq }) => eq(t.key, key),
    });
    return (row?.data as Json | undefined) ?? null;
  });

export const saveHomeContent = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.object({ key: z.string().min(1).max(80), data: z.record(z.unknown()) }).parse(input),
  )
  .handler(async ({ data }) => {
    await db()
      .insert(schema.homeContent)
      .values({
        key: data.key,
        data: data.data as Record<string, unknown>,
        updatedAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({
        target: schema.homeContent.key,
        set: { data: data.data as Record<string, unknown>, updatedAt: new Date().toISOString() },
      });
    return { ok: true };
  });
