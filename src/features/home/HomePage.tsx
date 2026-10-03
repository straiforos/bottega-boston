import { BottegaHeader } from '@/components/BottegaHeader';
import { SketchMarquee } from '@/components/media/SketchMarquee';
import { SiteFooter } from '@/components/SiteFooter';
import { restaurantContent } from '@/content/en/restaurant';
import { ClubSection } from './sections/ClubSection';
import { EventsSection } from './sections/EventsSection';
import { HeroSection } from './sections/HeroSection';
import { OfferingsSection } from './sections/OfferingsSection';
import { SocialSection } from './sections/SocialSection';
import { StorySection } from './sections/StorySection';

export function HomePage() {
  return (
    <>
      <SketchMarquee text={restaurantContent.home.welcome} />
      <BottegaHeader />
      <main>
        <HeroSection />
        <StorySection />
        <OfferingsSection />
        <EventsSection />
        <SketchMarquee text={restaurantContent.home.pastaIsLife} />
        <SocialSection />
        <ClubSection />
      </main>
      <SiteFooter />
    </>
  );
}
