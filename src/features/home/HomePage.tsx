import { Marquee } from '@/design-system/bottega-f5161c';
import { BottegaHeader } from '@/components/BottegaHeader';
import { RestaurantSketch } from '@/components/RestaurantSketch';
import { SiteFooter } from '@/components/SiteFooter';
import { ClubSection } from './sections/ClubSection';
import { EventsSection } from './sections/EventsSection';
import { HeroSection } from './sections/HeroSection';
import { MenuIntroSection } from './sections/MenuIntroSection';
import { OfferingsSection } from './sections/OfferingsSection';
import { SocialSection } from './sections/SocialSection';
import { StorySection } from './sections/StorySection';

export function HomePage() {
  return <><Marquee text="Benvenuti" separator={<RestaurantSketch kind="pasta" small />} variant="cream" /><BottegaHeader /><main><HeroSection /><Marquee text="Benvenuti" separator={<RestaurantSketch kind="lemon" small />} /><StorySection /><Marquee text="#pastaislife" separator={<RestaurantSketch small />} /><MenuIntroSection /><OfferingsSection /><EventsSection /><Marquee text="Pasta is life" separator={<RestaurantSketch small />} /><SocialSection /><ClubSection /></main><SiteFooter /></>;
}