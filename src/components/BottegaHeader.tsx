import { useEffect, useState } from 'react';
import { createLink, Link } from '@tanstack/react-router';
import { Button, LinkAction, Logo, MenuOverlay, MenuToggle, SiteHeader } from '@/design-system/bottega-f5161c/bottega';

const HeaderLink = createLink(LinkAction);
const orderingUrl = 'https://ciao724.wixstudio.com/my-site/online-ordering';

export function BottegaHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
  const linkTone = scrolled ? 'cream' : 'forest';

  return <SiteHeader variant={scrolled ? 'forest' : 'cream'} className={scrolled ? 'shared-header shared-header--stuck' : 'shared-header'} logo={
    <Link to="/" aria-label="Bottega home" className="header-brand">
      <span className="desktop-logo header-brand-pair"><Logo variant="mark" size="md" tone={logoTone} /><Logo variant="wordmark" size="md" tone={logoTone} /></span>
      <span className="mobile-logo header-brand-pair"><Logo variant="mark" size="sm" tone={logoTone} /><Logo variant="wordmark" size="sm" tone={logoTone} /></span>
    </Link>
  } action={<>
    <MenuToggle open={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)} />
    <MenuOverlay id="site-navigation" open={menuOpen} label="Main navigation" footer={
      <Button variant={scrolled ? 'cream' : 'primary'} onClick={() => window.location.assign(orderingUrl)}>Order now ↗</Button>
    }>
      <HeaderLink to="/" hash="about" tone={linkTone} className="bt-menu-overlay__link" onClick={() => setMenuOpen(false)}>Our story</HeaderLink>
      <HeaderLink to="/menu" tone={linkTone} className="bt-menu-overlay__link" onClick={() => setMenuOpen(false)}>Menu</HeaderLink>
      <HeaderLink to="/" hash="events" tone={linkTone} className="bt-menu-overlay__link" onClick={() => setMenuOpen(false)}>Come hang out</HeaderLink>
    </MenuOverlay>
  </>} />;
}
