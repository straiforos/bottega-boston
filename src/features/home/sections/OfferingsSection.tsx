import { useStaffSession } from '@/hooks/useStaffSession';
import { useHomeContent } from '../hooks/useHomeContent';
import { MenuSection } from './MenuSection';
import { OfferingsCards } from './OfferingsCards';

/** Sticky pin + offering cards; Family is life ribbon lives above About. */
export function OfferingsSection() {
  const { data } = useHomeContent();
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
