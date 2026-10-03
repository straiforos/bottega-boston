import { createLink } from '@tanstack/react-router';
import { Display, LinkAction, Serif } from '@/design-system/bottega-f5161c';
import { RestaurantSketch } from '@/components/RestaurantSketch';

const MenuLink = createLink(LinkAction);

export function MenuIntroSection() {
  return <section id="menu" className="section menu-intro"><div className="section-inner"><p className="eyebrow">Made with amore. Served with joy.</p><div className="menu-title"><div className="big-sketch"><RestaurantSketch kind="pot" /></div><Display size="xl" tone="forest">Menu</Display></div><Serif size="md" tone="forest">Something delicious for every part of your day.</Serif><MenuLink to="/menu">View menu</MenuLink></div></section>;
}