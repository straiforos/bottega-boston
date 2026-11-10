import { useQuery } from '@tanstack/react-query';
import { MovingRibbon } from '@/components/media/MovingRibbon';
import { useStaffSession } from '@/hooks/useStaffSession';
import { defaultHomeContent, homeContentQueryOptions } from '@/lib/home/home-content';
import { RibbonEditor } from '../admin/HomeContentEditors';
import { MenuSection } from './MenuSection';
import { OfferingsCards } from './OfferingsCards';

/** Ribbon in flow above the sticky menu stage, then the pin + cards. */
export function OfferingsSection() {
  const { data = defaultHomeContent } = useQuery(homeContentQueryOptions);
  const { isAdmin } = useStaffSession();
  return (
    <div className="offerings-track">
      <section id="menu" className="offerings-section bt-surface-dark" aria-label="Discover Bottega">
        <div className="offerings-layout">
          <MenuSection />
          <OfferingsCards cards={data.cards} isAdmin={isAdmin} />
        </div>
      </section>
    </div>
  );
}
