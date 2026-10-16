import { Display, LinkAction, Logo } from '@/design-system/bottega-f5161c';
import { InstagramIcon } from '@/components/InstagramIcon';
import { StaffAccess } from '@/components/StaffAccess';
import { restaurantContent } from '@/content/en/restaurant';
import { links } from '@/content/links';

export function SiteFooter() {
  return (
    <footer id="contact" className="footer bt-surface-dark">
      <div className="section-inner">
        <div className="footer-grid">
          <div>
            <Logo variant="lockup-wordmark" tone="cream" size="md" />
            <p>
              Judgment-free.
              <br />
              Full of carbs.
            </p>
            <address className="social-links">
              <a href={links.instagram} target="_blank" rel="noreferrer" aria-label="Bottega on Instagram">
                <InstagramIcon />
              </a>
            </address>
          </div>
          <div>
            <Display as="h3" size="sm">
              Find us
            </Display>
            {restaurantContent.addresses.map((address) => (
              <address key={address.name}>
                <strong>{address.name}</strong>
                <br />
                {address.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            ))}
          </div>
          <div>
            <Display as="h3" size="sm">
              Come on in
            </Display>
            {restaurantContent.hours.map((hours) => (
              <p key={hours.label}>
                {hours.label}
                <br />
                {hours.value}
              </p>
            ))}
          </div>
          <div>
            <Display as="h3" size="sm">
              Say ciao
            </Display>
            <address>
              <a href={`tel:${links.phone}`}>(617) 232-2661</a>
              <p>
                <a href={`mailto:${links.email}`}>{links.email}</a>
              </p>
              <p>
                <LinkAction href={`mailto:${links.email}`} tone="mustard">
                  Contact us
                </LinkAction>
              </p>
            </address>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Bottega. Made with amore.</span>
          <StaffAccess />
          <div className="legal-links">
            {restaurantContent.legal.map(({ label, path }) => (
              <a href={`${links.legalBase}/${path}`} key={path}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
