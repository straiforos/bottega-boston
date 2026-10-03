import { createLink } from '@tanstack/react-router';
import { Card, Display, LinkAction, PillLabel, Serif, Stamp } from '@/design-system/bottega-f5161c';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { links } from '@/content/links';
import { useOfferingsMotion } from '../hooks/useOfferingsMotion';
import coffee from '@/assets/coffee.asset.json';
import pasta from '@/assets/pasta-club.asset.json';
import mercatino from '@/assets/mercatino.jpg.asset.json';

const MenuLink = createLink(LinkAction);

export function OfferingsSection() {
  const offeringsRef = useOfferingsMotion();
  return <div className="offerings-track"><div className="offerings-ribbon"><MovingRibbon text="#familyislife · #pastaislife" /></div><section className="offerings-section bt-surface-dark" aria-label="Discover Bottega"><div className="offerings-layout"><div className="offerings-heading"><Display size="lg" tone="mustard">Menu.</Display></div><div ref={offeringsRef} className="section-inner offerings">
    <article className="offering offering-coffee"><Card variant="cream" shape="rect"><div><Display as="h3" size="sm" tone="forest">Coffee + house drinks</Display><Serif size="lg" tone="forest">& dolci</Serif></div><img className="offering-image" src={coffee.url} alt="A Bottega guest holding a cappuccino and iced coffee" loading="lazy" /><MenuLink to="/menu" hash="category-8">Catering menu</MenuLink></Card><div className="catering-stamp"><Stamp size="sm">Catering<br />menu</Stamp></div></article>
    <article className="offering offering-food"><Card variant="mustard" shape="arch"><img className="offering-image" src={pasta.url} alt="A woman holding a plate of Bottega pesto pasta" loading="lazy" /><Display as="h3" size="md" tone="forest">The food</Display><Serif size="sm" tone="forest">Breakfast, lunch, dinner<br />& everything in between.</Serif><MenuLink to="/menu">Food menu</MenuLink></Card></article>
    <article id="market" className="offering offering-market"><Card variant="cobalt" shape="rect"><Serif as="h3" size="lg" tone="cream">Il Mercatino</Serif><PillLabel variant="mustard">The little market</PillLabel><img className="offering-image" src={mercatino.url} alt="Inside Il Mercatino at Bottega — shelves of pasta, pantry goods and totes" loading="lazy" /><Serif size="sm" tone="cream">A little Bottega.<br />To take home.</Serif><LinkAction href={`mailto:${links.email}?subject=Il%20Mercatino%20inquiry`} tone="mustard">Explore the market</LinkAction></Card></article>
  </div></div></section></div>;
}