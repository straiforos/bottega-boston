import { useEffect, useState } from 'react';
import { createLink, useNavigate } from '@tanstack/react-router';
import { Button, Marquee, MenuSubmenu, SiteHeader } from '@/design-system/bottega-f5161c';
import { useStaffSession } from '@/hooks/useStaffSession';
import { staffContent } from '@/content/en/staff';
import { restaurantContent } from '@/content/en/restaurant';
import { clubContent } from '@/content/en/club';

const emailTabs = ['newsletters', 'templates', 'subscribers', 'analytics'] as const;

const HeaderLink = createLink('a');

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
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
            onClick={() => navigate({ to: '/', hash: 'locations' })}
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
          <MenuSubmenu label={nav.siteAdmin}>
            <MenuSubmenu label={nav.emails}>
              {emailTabs.map((tab) => (
                <HeaderLink
                  key={tab}
                  className="bt-menu-overlay__link"
                  to="/emails"
                  search={{ tab }}
                  activeOptions={{ exact: true, includeSearch: true }}
                >
                  {clubContent.workspace.tabs[tab]}
                </HeaderLink>
              ))}
            </MenuSubmenu>
            <HeaderLink className="bt-menu-overlay__link" to="/admin/events">
              {nav.adminEvents}
            </HeaderLink>
            <HeaderLink className="bt-menu-overlay__link" to="/admin/requests">
              {nav.adminRequests}
            </HeaderLink>
          </MenuSubmenu>
        )}
      </SiteHeader>
    </div>
  );
}
