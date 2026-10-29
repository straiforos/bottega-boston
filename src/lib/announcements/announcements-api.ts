import { queryOptions } from '@tanstack/react-query';
import {
  deleteAnnouncement as deleteAnnouncementFn,
  fetchAnnouncements,
  fetchLiveAnnouncement,
  saveAnnouncement as saveAnnouncementFn,
} from './announcements.functions';
import {
  ANNOUNCEMENT_TZ,
  pickLiveAnnouncement,
  validateAnnouncement,
  type Announcement,
  type AnnouncementDraft,
} from './announcements-shared';

export { ANNOUNCEMENT_TZ, pickLiveAnnouncement, validateAnnouncement };
export type { Announcement, AnnouncementDraft };

export const announcementsQueryOptions = queryOptions({
  queryKey: ['announcements'],
  queryFn: () => fetchAnnouncements(),
});

export const liveAnnouncementQueryOptions = queryOptions({
  queryKey: ['announcements', 'live'],
  queryFn: () => fetchLiveAnnouncement(),
});

export async function saveAnnouncement(id: string | null, draft: AnnouncementDraft) {
  await saveAnnouncementFn({ data: { id, draft } });
}

export async function deleteAnnouncement(id: string) {
  await deleteAnnouncementFn({ data: id });
}
