import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { StaffSessionProvider } from '@/hooks/useStaffSession';

import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Bottega — Pasta is life' },
      { name: 'description', content: 'Meet, eat, and celebrate life at Bottega.' },
      { property: 'og:title', content: 'Bottega — Pasta is life' },
      { property: 'og:description', content: 'Meet, eat, and celebrate life at Bottega.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Domine:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap',
      },
      {
        rel: 'icon',
        media: '(prefers-color-scheme: dark)',
        type: 'image/png',
        href: '/favicon-dark.png',
      },
      {
        rel: 'icon',
        media: '(prefers-color-scheme: light)',
        type: 'image/png',
        href: '/favicon.png',
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

// Keep this root providers-only: canvas preview routes (/__mockup,
// /__component) render inside it, so any chrome leaks into every frame.
function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <StaffSessionProvider>
        <Outlet />
      </StaffSessionProvider>
    </QueryClientProvider>
  );
}
