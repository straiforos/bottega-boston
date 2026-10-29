import { Outlet, createFileRoute, useRouterState } from '@tanstack/react-router';
import { SiteFooter } from '@/components/SiteFooter';
import { AnnouncementCard } from '@/features/announcements/AnnouncementCard';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

// Shared chrome for every guest-facing page: the footer lives here so no
// page has to compose it (and no page can forget it).
function SiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideAnnouncement = pathname.startsWith('/admin') || pathname.startsWith('/emails');

  return (
    <>
      <Outlet />
      {!hideAnnouncement && <AnnouncementCard />}
      <SiteFooter />
    </>
  );
}
