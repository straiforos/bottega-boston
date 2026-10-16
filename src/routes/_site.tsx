import { Outlet, createFileRoute } from '@tanstack/react-router';
import { SiteFooter } from '@/components/SiteFooter';

export const Route = createFileRoute('/_site')({
  component: SiteLayout,
});

// Shared chrome for every guest-facing page: the footer lives here so no
// page has to compose it (and no page can forget it).
function SiteLayout() {
  return (
    <>
      <Outlet />
      <SiteFooter />
    </>
  );
}
