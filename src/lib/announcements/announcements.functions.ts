import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireStaffSession } from '@/integrations/auth/session-middleware';
import { staffFromRequest } from '@/lib/auth/staff';
import { db, schema } from '@/lib/db';
import {
  pickLiveAnnouncement,
  validateAnnouncement,
  type Announcement,
  type AnnouncementDraft,
} from './announcements-shared';

const draftSchema = z.object({
  title: z.string(),
  body: z.string(),
  imageUrl: z.string().nullable(),
  href: z.string(),
  linkLabel: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  published: z.boolean(),
});

function mapRow(row: typeof schema.announcements.$inferSelect): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    imageUrl: row.imageUrl,
    href: row.href,
    linkLabel: row.linkLabel,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    published: row.published,
    updatedAt: row.updatedAt,
  };
}

/** Staff: every announcement. Guests: unused; use fetchLiveAnnouncement. */
export const fetchAnnouncements = createServerFn({ method: 'GET' }).handler(async () => {
  const staff = await staffFromRequest(getRequest());
  if (!staff) return [] as Announcement[];
  const rows = await db().select().from(schema.announcements);
  return rows.sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map(mapRow);
});

/** Public: at most one currently live announcement. */
export const fetchLiveAnnouncement = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db().select().from(schema.announcements).where(eq(schema.announcements.published, true));
  return pickLiveAnnouncement(rows.map(mapRow), new Date());
});

export const saveAnnouncement = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid().nullable(), draft: draftSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const d = data.draft as AnnouncementDraft;
    const problem = validateAnnouncement(d);
    if (problem) throw new Error(problem);
    const row = {
      title: d.title.trim(),
      body: d.body.trim(),
      imageUrl: d.imageUrl,
      href: d.href.trim() || null,
      linkLabel: d.linkLabel.trim() || null,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      published: d.published,
      updatedAt: new Date().toISOString(),
    };
    if (data.id) {
      await db().update(schema.announcements).set(row).where(eq(schema.announcements.id, data.id));
      return { id: data.id };
    }
    const id = crypto.randomUUID();
    await db().insert(schema.announcements).values({ id, ...row });
    return { id };
  });

export const deleteAnnouncement = createServerFn({ method: 'POST' })
  .middleware([requireStaffSession])
  .inputValidator((input: unknown) => z.string().uuid().parse(input))
  .handler(async ({ data: id }) => {
    await db().delete(schema.announcements).where(eq(schema.announcements.id, id));
    return { ok: true };
  });
