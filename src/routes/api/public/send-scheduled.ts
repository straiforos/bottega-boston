import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/auth/cron-auth';

// Called every few minutes by the scheduler; sends newsletters whose time has come.
export const Route = createFileRoute('/api/public/send-scheduled')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { runScheduledSends } = await import('@/lib/email/send-scheduled.server');
        const origin = new URL(request.url).origin;
        const result = await runScheduledSends(origin);
        return Response.json(result);
      },
    },
  },
});
