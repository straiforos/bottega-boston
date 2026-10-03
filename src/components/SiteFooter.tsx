import { createLink } from '@tanstack/react-router';
import { Display, LinkAction, Logo } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { links } from '@/content/links';

const PageLink = createLink(LinkAction);

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <footer className="footer bt-surface-dark"><div className="section-inner menu-page-footer"><div><Logo variant="wordmark" tone="cream" size="sm" /><address>{restaurantContent.addresses.map((address) => <span key={address.name}>{address.lines.join(' · ')}<br /></span>)}</address></div><div><address><LinkAction href={`tel:${links.phone}`} tone="mustard">(617) 232-2661</LinkAction><p><LinkAction href={`mailto:${links.email}`} tone="cream">{links.email}</LinkAction></p></address><PageLink to="/" tone="cream">Back to Bottega</PageLink></div></div></footer>;
  }

  return (
    <footer id="contact" className="footer bt-surface-dark"><div className="section-inner"><div className="footer-grid">
      <div><Logo variant="lockup-wordmark" tone="cream" size="md" /><p>Judgment-free.<br />Full of carbs.</p><address className="social-links"><a href={links.instagram} target="_blank" rel="noreferrer">Instagram ↗</a></address></div>
      <div><Display as="h3" size="sm">Find us</Display>{restaurantContent.addresses.map((address) => <address key={address.name}><strong>{address.name}</strong><br />{address.lines.map((line) => <span key={line}>{line}<br /></span>)}</address>)}</div>
      <div><Display as="h3" size="sm">Come on in</Display>{restaurantContent.hours.map((hours) => <p key={hours.label}>{hours.label}<br />{hours.value}</p>)}</div>
      <div><Display as="h3" size="sm">Say ciao</Display><address><a href={`mailto:${links.email}`}>{links.email}</a><p><LinkAction href={`mailto:${links.email}`} tone="mustard">Contact us</LinkAction></p></address></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} Bottega. Made with amore.</span><div className="legal-links">{restaurantContent.legal.map(({ label, path }) => <a href={`${links.legalBase}/${path}`} key={path}>{label}</a>)}</div></div></div></footer>
  );
}