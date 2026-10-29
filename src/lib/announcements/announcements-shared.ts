/** Pure announcement selection, link checks, and dismiss keys. */

export const ANNOUNCEMENT_TZ = 'America/New_York';

export const DISMISS_STORAGE_KEY = 'bottega.announcement.dismissed';

export interface Announcement {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly href: string | null;
  readonly linkLabel: string | null;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly published: boolean;
  readonly updatedAt: string;
}

export interface AnnouncementDraft {
  title: string;
  body: string;
  imageUrl: string | null;
  href: string;
  linkLabel: string;
  startsAt: string;
  endsAt: string;
  published: boolean;
}

/** Relative site paths or https only — no mailto, tel, or protocol-relative. */
export function isAnnouncementHref(href: string) {
  const value = href.trim();
  return /^(\/(?!\/)|https:\/\/)/.test(value);
}

/** Which announcement is live: published, inside the window, soonest end, then newest edit. */
export function pickLiveAnnouncement(rows: readonly Announcement[], now: Date): Announcement | null {
  const instant = now.toISOString();
  const live = rows.filter(
    (row) => row.published && row.startsAt <= instant && row.endsAt >= instant,
  );
  if (live.length === 0) return null;
  return [...live].sort((a, b) => {
    const byEnd = a.endsAt.localeCompare(b.endsAt);
    if (byEnd !== 0) return byEnd;
    return b.updatedAt.localeCompare(a.updatedAt);
  })[0];
}

export function dismissKey(id: string, updatedAt: string) {
  return `${id}:${updatedAt}`;
}

export function isDismissed(stored: string | null | undefined, announcement: Pick<Announcement, 'id' | 'updatedAt'>) {
  return stored === dismissKey(announcement.id, announcement.updatedAt);
}

export function validateAnnouncement(d: AnnouncementDraft): string | null {
  if (!d.title.trim()) return 'Add a title.';
  if (d.title.length > 80) return 'Keep the title under 80 characters.';
  if (d.body.length > 400) return 'Keep the message under 400 characters.';
  const href = d.href.trim();
  const label = d.linkLabel.trim();
  if (href && !isAnnouncementHref(href)) return 'Links must start with / or https://.';
  if (href && !label) return 'Add a label for the link.';
  if (label && !href) return 'Add a link for the label.';
  if (Number.isNaN(new Date(d.startsAt).getTime())) return 'Pick a start date and time.';
  if (Number.isNaN(new Date(d.endsAt).getTime())) return 'Pick an end date and time.';
  if (d.endsAt <= d.startsAt) return 'The end must be after the start.';
  return null;
}
