import { createFileRoute } from '@tanstack/react-router';
import { BottegaHeader } from '@/components/BottegaHeader';
import { restaurantContent } from '@/content/en/restaurant';
import { LocationsSection } from '@/features/home/sections/LocationsSection';
import { pageHead } from '@/lib/seo/page-head';

export const Route = createFileRoute('/_site/order')({
  head: () =>
    pageHead({
      ...restaurantContent.metadata.order,
      path: '/order',
    }),
  component: OrderPage,
});

function OrderPage() {
  const copy = restaurantContent.orderPage;
  return (
    <>
      <BottegaHeader />
      <main>
        <LocationsSection title={copy.title} lead={copy.lead} headingAs="h1" />
      </main>
    </>
  );
}
