import server from '@tanstack/react-start/server-entry';

/** Cloudflare Worker entry: TanStack Start fetch handler plus the email cron. */
export default {
  fetch: server.fetch,
  async scheduled(_controller: ScheduledController, _env: CloudflareEnv, ctx: ExecutionContext) {
    ctx.waitUntil(
      (async () => {
        const { runScheduledSends } = await import('./lib/email/send-scheduled.server');
        await runScheduledSends();
      })(),
    );
  },
};
