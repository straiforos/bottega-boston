import { useEffect, useState } from 'react';
import { createLink } from '@tanstack/react-router';
import { Button, Marquee, SiteHeader } from '@/design-system/bottega-f5161c';
import { useStaffSession } from '@/hooks/useStaffSession';
import { staffContent } from '@/content/en/staff';
import { restaurantContent } from '@/content/en/restaurant';
import { OrderLocationsDialog } from '@/components/OrderLocationsDialog';

const HeaderLink = createLink('a');

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const { isAdmin } = useStaffSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = restaurantContent.navigation;
  return (
    <div className="shared-header-stack">
      {isAdmin && <Marquee text={staffContent.editing} variant="terracotta" role="status" />}
      <SiteHeader
        variant={scrolled ? 'forest' : 'cream'}
        className="shared-header"
        homeLabel={nav.homeLabel}
        navigationLabel={nav.menuLabel}
        navigationFooter={
          <Button
            size="sm"
            variant={scrolled ? 'cream' : 'primary'}
            onClick={() => setOrdering(true)}
          >
            {nav.order}
          </Button>
        }
      >
        <HeaderLink
          className="bt-menu-overlay__link"
          activeOptions={{ exact: true, includeHash: true }}
          to="/"
          hash="about"
        >
          {nav.story}
        </HeaderLink>
        <HeaderLink className="bt-menu-overlay__link" activeOptions={{ exact: true, includeHash: true }} to="/menu">
          {nav.menu}
        </HeaderLink>
        <HeaderLink
          className="bt-menu-overlay__link"
          activeOptions={{ exact: true, includeHash: true }}
          to="/"
          hash="events"
        >
          {nav.events}
        </HeaderLink>
        {isAdmin && (
          <HeaderLink className="bt-menu-overlay__link" activeOptions={{ exact: true }} to="/emails/compose">
            {nav.emailBuilder}
          </HeaderLink>
        )}
      </SiteHeader>
      <OrderLocationsDialog open={ordering} onClose={() => setOrdering(false)} />
    </div>
  );
}
