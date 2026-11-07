import { createLink } from '@tanstack/react-router';
import { Button } from '@/design-system/bottega-f5161c';
import { restaurantContent } from '@/content/en/restaurant';
import { MenuHeading } from './MenuHeading';

const MenuButton = createLink(Button);

/** Home menu stage heading + view-menu CTA (ribbon lives above this block). */
export function MenuSection() {
  return (
    <div className="menu-section">
      <div className="menu-section-heading">
        <MenuHeading />
        <MenuButton className="menu-view-cta" to="/menu" variant="ghost" size="lg">
          {restaurantContent.home.menu.action}
        </MenuButton>
      </div>
    </div>
  );
}
