import { links } from '@/content/links';
import { restaurantContent } from '@/content/en/restaurant';

/** Sticky notice while bottega.boston is previewing; points guests to eatbottega.com. */
export function ComingSoonBanner() {
  const { message, linkLabel } = restaurantContent.comingSoon;
  return (
    <aside className="coming-soon-banner" role="status">
      <p className="coming-soon-banner__text">
        {message}{' '}
        <a className="coming-soon-banner__link" href={links.liveSite} rel="noopener noreferrer">
          {linkLabel}
        </a>
      </p>
    </aside>
  );
}
