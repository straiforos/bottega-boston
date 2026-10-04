import { useEffect, useState } from 'react';
import { createLink } from '@tanstack/react-router';
import { Button, SiteHeader } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { links } from '@/content/links';

const HeaderLink = createLink('a');

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = restaurantContent.navigation;
  return (
    <SiteHeader
      variant={scrolled ? 'forest' : 'cream'}
      className="shared-header"
      homeLabel={nav.homeLabel}
      navigationLabel={nav.menuLabel}
      navigationFooter={
        <Button size="sm" variant={scrolled ? 'cream' : 'primary'} onClick={() => window.location.assign(links.order)}>
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
    </SiteHeader>
  );
}
