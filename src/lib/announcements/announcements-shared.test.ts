import { describe, expect, it } from 'vitest';
import {
  dismissKey,
  isAnnouncementHref,
  isDismissed,
  pickLiveAnnouncement,
  validateAnnouncement,
  type Announcement,
  type AnnouncementDraft,
} from './announcements-shared';

const base = (patch: Partial<Announcement> = {}): Announcement => ({
  id: 'a1',
  title: 'Mother’s Day',
  body: 'Brunch specials',
  imageUrl: null,
  href: '/menu',
  linkLabel: 'See menu',
  startsAt: '2026-05-01T00:00:00.000Z',
  endsAt: '2026-05-12T00:00:00.000Z',
  published: true,
  updatedAt: '2026-04-01T00:00:00.000Z',
  ...patch,
});

const draft = (patch: Partial<AnnouncementDraft> = {}): AnnouncementDraft => ({
  title: 'Mother’s Day',
  body: 'Brunch specials',
  imageUrl: null,
  href: '/menu',
  linkLabel: 'See menu',
  startsAt: '2026-05-01T00:00:00.000Z',
  endsAt: '2026-05-12T00:00:00.000Z',
  published: true,
  ...patch,
});

describe('isAnnouncementHref', () => {
  it('allows relative paths and https', () => {
    expect(isAnnouncementHref('/menu')).toBe(true);
    expect(isAnnouncementHref('/#events')).toBe(true);
    expect(isAnnouncementHref('https://toasttab.com/bottega')).toBe(true);
  });

  it('rejects other schemes', () => {
    expect(isAnnouncementHref('http://example.com')).toBe(false);
    expect(isAnnouncementHref('javascript:alert(1)')).toBe(false);
    expect(isAnnouncementHref('mailto:hi@bottega.boston')).toBe(false);
    expect(isAnnouncementHref('//evil.example')).toBe(false);
  });
});

describe('pickLiveAnnouncement', () => {
  it('returns null when nothing is in window', () => {
    expect(pickLiveAnnouncement([base()], new Date('2026-04-01T12:00:00.000Z'))).toBeNull();
    expect(pickLiveAnnouncement([base({ published: false })], new Date('2026-05-05T12:00:00.000Z'))).toBeNull();
  });

  it('picks the live row inside the window', () => {
    const live = pickLiveAnnouncement([base()], new Date('2026-05-05T12:00:00.000Z'));
    expect(live?.id).toBe('a1');
  });

  it('prefers the soonest end, then newest update', () => {
    const soon = base({ id: 'soon', endsAt: '2026-05-06T00:00:00.000Z', updatedAt: '2026-04-01T00:00:00.000Z' });
    const later = base({ id: 'later', endsAt: '2026-05-20T00:00:00.000Z', updatedAt: '2026-04-20T00:00:00.000Z' });
    expect(pickLiveAnnouncement([later, soon], new Date('2026-05-05T12:00:00.000Z'))?.id).toBe('soon');

    const older = base({ id: 'older', endsAt: '2026-05-06T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z' });
    const newer = base({ id: 'newer', endsAt: '2026-05-06T00:00:00.000Z', updatedAt: '2026-04-15T00:00:00.000Z' });
    expect(pickLiveAnnouncement([older, newer], new Date('2026-05-05T12:00:00.000Z'))?.id).toBe('newer');
  });
});

describe('dismiss memory', () => {
  it('matches id and updatedAt', () => {
    const a = base();
    expect(isDismissed(dismissKey(a.id, a.updatedAt), a)).toBe(true);
    expect(isDismissed(dismissKey(a.id, '2026-05-01T00:00:00.000Z'), a)).toBe(false);
    expect(isDismissed(null, a)).toBe(false);
  });
});

describe('validateAnnouncement', () => {
  it('accepts a complete draft', () => {
    expect(validateAnnouncement(draft())).toBeNull();
  });

  it('requires title and a valid window', () => {
    expect(validateAnnouncement(draft({ title: '' }))).toMatch(/title/i);
    expect(validateAnnouncement(draft({ endsAt: '2026-04-01T00:00:00.000Z' }))).toMatch(/end/i);
  });

  it('requires href and label together with a safe href', () => {
    expect(validateAnnouncement(draft({ href: '/menu', linkLabel: '' }))).toMatch(/label/i);
    expect(validateAnnouncement(draft({ href: '', linkLabel: 'Go' }))).toMatch(/link/i);
    expect(validateAnnouncement(draft({ href: 'javascript:x', linkLabel: 'Go' }))).toMatch(/https/i);
  });
});
