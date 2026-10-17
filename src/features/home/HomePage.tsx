import { BottegaHeader } from '@/components/BottegaHeader';
import { SketchMarquee } from '@/components/media/SketchMarquee';
import { restaurantContent } from '@/content/en/restaurant';
import { ClubSection } from './sections/ClubSection';
import { EventsSection } from './sections/EventsSection';
import { HeroSection } from './sections/HeroSection';
import { LocationsSection } from './sections/LocationsSection';
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
        <SketchMarquee text={restaurantContent.home.pastaIsLife} />
        <StorySection />
        <OfferingsSection />
        <EventsSection />
        <SketchMarquee text={restaurantContent.home.pastaIsLife} variant="forest" />
        <SocialSection />
        <ClubSection />
        <LocationsSection />
      </main>
    </>
  );
}
