import { createLink, Link } from '@tanstack/react-router';
import { Button, LinkAction, Logo, SiteHeader } from '@/design-system/bottega-f5161c';

const HeaderLink = createLink(LinkAction);
const orderingUrl = 'https://ciao724.wixstudio.com/my-site/online-ordering';

export function BottegaHeader() {
  return <SiteHeader variant="cream" className="shared-header" logo={
    <Link to="/" aria-label="Bottega home" className="header-brand">
      <span className="desktop-logo header-brand-pair"><Logo variant="mark" size="md" /><Logo variant="wordmark" size="md" /></span>
      <span className="mobile-logo header-brand-pair"><Logo variant="mark" size="sm" /><Logo variant="wordmark" size="sm" /></span>
    </Link>
  } action={<>
    <nav aria-label="Main navigation" className="header-navigation">
      <HeaderLink to="/" hash="about" tone="forest">Our story</HeaderLink>
      <HeaderLink to="/menu" tone="forest">Menu</HeaderLink>
      <HeaderLink to="/" hash="events" tone="forest">Come hang out</HeaderLink>
    </nav>
    <Button variant="primary" onClick={() => window.location.assign(orderingUrl)}>Order now ↗</Button>
  </>} />;
}