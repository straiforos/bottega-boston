import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SiteFooter } from '@/components/SiteFooter';
import { AnnouncementCard } from '@/features/announcements/AnnouncementCard';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

// Shared chrome for every site page: footer and announcement live here so
// no page has to compose them (and no page can forget them).
function SiteLayout() {
  return (
    <>
      <Outlet />
      <AnnouncementCard />
      <SiteFooter />
    </>
  );
}
