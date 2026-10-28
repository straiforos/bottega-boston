import server from '@tanstack/react-start/server-entry';
import { apexRedirectLocation } from './lib/canonical-host';

/** Cloudflare Worker entry: TanStack Start fetch handler plus the email cron. */
export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
    const location = apexRedirectLocation(new URL(request.url), env.SITE_ORIGIN);
    if (location) return Response.redirect(location, 301);
    return server.fetch(request, env, ctx);
  },
  async scheduled(_controller: ScheduledController, _env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const { runScheduledSends } = await import('./lib/email/send-scheduled.server');
        await runScheduledSends();
      })(),
    );
  },
};
