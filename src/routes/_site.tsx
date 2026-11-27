import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SiteFooter } from '@/components/SiteFooter';
import { AnnouncementCard } from '@/features/announcements/AnnouncementCard';
import { defaultHomeContent, homeContentQueryOptions, type HomeContent } from '@/lib/home/home-content';

export type SiteHomeLoaderData = {
  home: HomeContent;
  /** True when D1 answered; false on CI prerender fallback. */
  homeFromServer: boolean;
};

export const Route = createFileRoute('/_site')({
  // SSR: load home_content once for every guest page (hero photo is DB-only).
  loader: async ({ context: { queryClient } }): Promise<SiteHomeLoaderData> => {
    try {
      const home = await queryClient.ensureQueryData(homeContentQueryOptions);
      return { home, homeFromServer: true };
    } catch {
      return { home: defaultHomeContent, homeFromServer: false };
    }
  },
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
