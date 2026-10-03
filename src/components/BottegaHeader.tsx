import { useEffect, useState } from 'react';
import { createLink, Link } from '@tanstack/react-router';
import { Button, LinkAction, Logo, SiteHeader } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { links } from '@/content/links';

const HeaderLink = createLink(LinkAction);

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoTone = scrolled ? 'cream' : 'auto';
  const linkTone = scrolled ? 'cream' : 'forest';

  return (
    <SiteHeader
      variant={scrolled ? 'forest' : 'cream'}
      className={scrolled ? 'shared-header shared-header--stuck' : 'shared-header'}
      logo={
        <Link to="/" aria-label={restaurantContent.navigation.homeLabel} className="header-brand">
          <span className="desktop-logo header-brand-pair">
            <Logo variant="mark" size="md" tone={logoTone} />
            <Logo variant="wordmark" size="md" tone={logoTone} />
          </span>
          <span className="mobile-logo header-brand-pair">
            <Logo variant="mark" size="sm" tone={logoTone} />
            <Logo variant="wordmark" size="sm" tone={logoTone} />
          </span>
        </Link>
      }
      action={
        <>
          <nav aria-label={restaurantContent.navigation.menuLabel} className="header-navigation">
            <HeaderLink to="/" hash="about" tone={linkTone}>
              {restaurantContent.navigation.story}
            </HeaderLink>
            <HeaderLink to="/menu" tone={linkTone}>
              {restaurantContent.navigation.menu}
            </HeaderLink>
            <HeaderLink to="/" hash="events" tone={linkTone}>
              {restaurantContent.navigation.events}
            </HeaderLink>
          </nav>
          <Button variant={scrolled ? 'cream' : 'primary'} onClick={() => window.location.assign(links.order)}>
            {restaurantContent.navigation.order}
          </Button>
        </>
      }
    />
  );
}
