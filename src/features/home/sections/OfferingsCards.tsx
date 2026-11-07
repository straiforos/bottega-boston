import { createLink } from '@tanstack/react-router';
import { Button, Card, Display, PillLabel, Serif, Stamp } from '@/design-system/bottega-f5161c';
import { cardInk, type OfferingCard } from '@/lib/home/home-content';
import { CardEditor } from '../admin/HomeContentEditors';
import { Broken } from './HeroSection';

const OfferingButton = createLink(Button);
const slotClass = ['offering-coffee', 'offering-food', 'offering-market'];

function OfferingLink({ card }: { card: OfferingCard }) {
  const variant = cardInk(card.variant).text === 'cream' ? 'cream' : 'primary';
  if (card.linkHref.startsWith('/menu')) {
    const hash = card.linkHref.split('#')[1];
    return (
      <OfferingButton className="offering-cta" to="/menu" hash={hash} variant={variant} size="lg" width="full">
        {card.linkLabel}
      </OfferingButton>
    );
  }
  const external = !card.linkHref.startsWith('mailto:') && !card.linkHref.startsWith('tel:');
  return (
    <Button
      className="offering-cta"
      href={card.linkHref}
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
    <div className="section-inner offerings">
      {cards.map((card, i) => (
        <Offering key={i} card={card} index={i} isAdmin={isAdmin} />
      ))}
    </div>
  );
}
