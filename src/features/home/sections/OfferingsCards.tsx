import { createLink } from '@tanstack/react-router';
import { Button, Card, Display, PillLabel, Serif, Stamp } from '@/design-system/bottega-f5161c';
import { cardInk, type OfferingCard } from '@/lib/home/home-content';
import { CardEditor } from '../admin/HomeContentEditors';
import { Broken } from './HeroSection';

const OfferingButton = createLink(Button);
const slotClass = ['offering-coffee', 'offering-food', 'offering-market'];

/** Parse a staff-authored in-site href into router `to` / `search` / `hash`. */
function parseInSiteHref(href: string): {
  to: '/';
  search?: Record<string, string>;
  hash?: string;
} {
  const url = new URL(href, 'http://bottega.local');
  const search = Object.fromEntries(url.searchParams.entries());
  // Legacy `/menu#pasta` → `?section=pasta` so the menu route resolver owns the filter.
  if (url.pathname === '/menu' && url.hash && !search.section) {
    search.section = url.hash.replace(/^#/, '');
  }
  const isMenu = url.pathname === '/menu';
  return {
    to: (url.pathname || '/') as '/',
    search: Object.keys(search).length ? search : undefined,
    hash: isMenu ? undefined : url.hash ? url.hash.slice(1) : undefined,
  };
}

function OfferingLink({ card }: { card: OfferingCard }) {
  const variant = cardInk(card.variant).text === 'cream' ? 'cream' : 'primary';
  const href = card.linkHref.trim();

  if (href.startsWith('/') && !href.startsWith('//')) {
    const { to, search, hash } = parseInSiteHref(href);
    return (
      <OfferingButton
        className="offering-cta"
        // Dynamic staff-authored in-site paths (e.g. /menu?section=pasta, /events).
        to={to}
        search={search}
        hash={hash}
        // MenuPage positions ?section= in useLayoutEffect; router skip + this avoid top flash.
        resetScroll={to === '/menu' && Boolean(search?.section) ? false : undefined}
        variant={variant}
        size="lg"
        width="full"
      >
        {card.linkLabel}
      </OfferingButton>
    );
  }

  if (href.startsWith('#')) {
    return (
      <OfferingButton className="offering-cta" to="/" hash={href.slice(1)} variant={variant} size="lg" width="full">
        {card.linkLabel}
      </OfferingButton>
    );
  }

  const external = href.startsWith('https://');
  return (
    <Button
      className="offering-cta"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      variant={variant}
      size="lg"
      width="full"
    >
      {card.linkLabel}
    </Button>
  );
}

function Offering({ card, index, isAdmin }: { card: OfferingCard; index: number; isAdmin: boolean }) {
  const ink = cardInk(card.variant).text;
  const image = (
    <div className="offering-media">
      <img className="offering-image" src={card.imageUrl} alt={card.imageAlt} loading="lazy" />
    </div>
  );
  const title =
    card.titleStyle === 'serif' ? (
      <Serif as="h3" size="lg" tone={ink}>
        {card.title}
      </Serif>
    ) : (
      <Display as="h3" size="md" tone={ink}>
        {card.title}
      </Display>
    );
  return (
    <article id={index === 2 ? 'market' : undefined} className={`offering ${slotClass[index]} home-editable`}>
      <Card variant={card.variant} shape={card.shape}>
        {card.shape === 'arch' && image}
        {title}
        {card.badge && <PillLabel variant={ink === 'cream' ? 'mustard' : 'forest'}>{card.badge}</PillLabel>}
        {card.shape === 'rect' && image}
        {card.subtitle && (
          <Serif size="sm" tone={ink}>
            <Broken text={card.subtitle} />
          </Serif>
        )}
        <OfferingLink card={card} />
      </Card>
      {card.stamp.trim() && (
        <div className="catering-stamp">
          <Stamp size="sm">
            <Broken text={card.stamp} />
          </Stamp>
        </div>
      )}
      {isAdmin && <CardEditor index={index} card={card} />}
    </article>
  );
}

/** Pinned/home offering cards; scroll motion lives in offerings-cards.css. */
export function OfferingsCards({ cards, isAdmin }: { cards: readonly OfferingCard[]; isAdmin: boolean }) {
  return (
    <div className="offerings">
      {cards.map((card, i) => (
        <Offering key={i} card={card} index={i} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
