import { createLink } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, Display, LinkAction, PillLabel, Serif, Stamp } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { restaurantContent } from '@/content/en/restaurant';
import { useStaffSession } from '@/hooks/useStaffSession';
import { cardInk, defaultHomeContent, homeContentQueryOptions, type OfferingCard } from '@/lib/home/home-content';
import { useOfferingsMotion } from '../hooks/useOfferingsMotion';
import { CardEditor, RibbonEditor } from '../admin/HomeContentEditors';
import { MenuHeading } from './MenuHeading';
import { Broken } from './HeroSection';

const MenuLink = createLink(LinkAction);
const slotClass = ['offering-coffee', 'offering-food', 'offering-market'];

function OfferingLink({ card }: { card: OfferingCard }) {
  const tone = cardInk(card.variant).link;
  if (card.linkHref.startsWith('/menu')) {
    const hash = card.linkHref.split('#')[1];
    return (
      <MenuLink to="/menu" hash={hash} tone={tone}>
        {card.linkLabel}
      </MenuLink>
    );
  }
  return (
    <LinkAction href={card.linkHref} target="_blank" rel="noopener noreferrer" tone={tone}>
      {card.linkLabel}
    </LinkAction>
  );
}

function Offering({ card, index, isAdmin }: { card: OfferingCard; index: number; isAdmin: boolean }) {
  const ink = cardInk(card.variant).text;
  const image = <img className="offering-image" src={card.imageUrl} alt={card.imageAlt} loading="lazy" />;
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

export function OfferingsSection() {
  const offeringsRef = useOfferingsMotion();
  const { data = defaultHomeContent } = useQuery(homeContentQueryOptions);
  const { isAdmin } = useStaffSession();
  return (
    <div className="offerings-track">
      <div className="offerings-ribbon home-editable">
        <MovingRibbon text={data.ribbon} />
        {isAdmin && <RibbonEditor text={data.ribbon} />}
      </div>
      <section id="menu" className="offerings-section bt-surface-dark" aria-label="Discover Bottega">
        <div className="offerings-layout">
          <div className="offerings-heading">
            <MenuHeading />
            <MenuLink to="/menu" tone="mustard">
              {restaurantContent.home.menu.action}
            </MenuLink>
          </div>
          <div ref={offeringsRef} className="section-inner offerings">
            {data.cards.map((card, i) => (
              <Offering key={i} card={card} index={i} isAdmin={isAdmin} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
