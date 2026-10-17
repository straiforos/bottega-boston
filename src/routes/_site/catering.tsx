import { createFileRoute } from '@tanstack/react-router';
import { RequestPage } from '@/features/requests/RequestPage';

export const Route = createFileRoute('/_site/catering')({
  head: () => ({
    meta: [
      { title: 'Catering | Bottega Italian trays for your crowd' },
      { name: 'description', content: 'Order Bottega catering: pasta, al forno, panini, salads and dolci trays for pickup or delivery in Brookline and Boston.' },
      { property: 'og:title', content: 'Catering | Bottega Italian trays for your crowd' },
      { property: 'og:description', content: 'Build your Bottega catering order and we’ll confirm the details.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: () => <RequestPage kind="catering" />,
});
