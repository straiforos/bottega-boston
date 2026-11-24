import { BottegaHeader } from '@/components/BottegaHeader';
import { EventsSection } from '@/features/home/sections/EventsSection';

/** Dedicated guest events listing at /events. */
export function EventsPage() {
  return (
    <>
      <BottegaHeader />
      <main>
        <EventsSection />
      </main>
    </>
  );
}
