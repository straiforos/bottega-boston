import { Display } from '@/design-system/bottega-f5161c';
import { PastaPotIcon } from '@/components/media/PastaPotIcon';
import { restaurantContent } from '@/content/en/restaurant';

/** "Menu" headline with the pasta-pot sketch before it. */
export function MenuHeading() {
  return (
    <div className="menu-heading">
      <PastaPotIcon />
      <Display size="lg" tone="mustard">
        {restaurantContent.home.menu.title}
      </Display>
    </div>
  );
}
