import { useEffect, useId, useState } from 'react';
import { createLink, Link } from '@tanstack/react-router';
import { Button, Logo, MenuOverlay, MenuToggle, SiteHeader } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { links } from '@/content/links';

const HeaderLink = createLink('a');

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const logoTone = scrolled ? 'cream' : 'auto';
  return (
    <SiteHeader
      variant={scrolled ? 'forest' : 'cream'}
      className={scrolled ? 'shared-header shared-header--stuck' : 'shared-header'}
      logo={
        <Link to="/" aria-label={restaurantContent.navigation.homeLabel} className="header-brand">
          <span className="desktop-logo header-brand-pair">
            <Logo variant="lockup-wordmark" size="md" tone={logoTone} />
          </span>
          <span className="mobile-logo header-brand-pair">
            <Logo variant="lockup-wordmark" size="sm" tone={logoTone} />
          </span>
        </Link>
      }
      action={
        <div className="header-actions">
          <MenuToggle
            className="header-menu-toggle"
            open={menuOpen}
            aria-controls={navigationId}
            onClick={() => setMenuOpen((open) => !open)}
          />
          <MenuOverlay
            id={navigationId}
            open={menuOpen}
            label={restaurantContent.navigation.menuLabel}
            footer={
              <Button variant={scrolled ? 'cream' : 'primary'} onClick={() => window.location.assign(links.order)}>
                {restaurantContent.navigation.order}
              </Button>
            }
          >
            <HeaderLink className="bt-menu-overlay__link" to="/" hash="about" onClick={() => setMenuOpen(false)}>
              {restaurantContent.navigation.story}
            </HeaderLink>
            <HeaderLink className="bt-menu-overlay__link" to="/menu" onClick={() => setMenuOpen(false)}>
              {restaurantContent.navigation.menu}
            </HeaderLink>
            <HeaderLink className="bt-menu-overlay__link" to="/" hash="events" onClick={() => setMenuOpen(false)}>
              {restaurantContent.navigation.events}
            </HeaderLink>
          </MenuOverlay>
        </div>
      }
    />
  );
}
