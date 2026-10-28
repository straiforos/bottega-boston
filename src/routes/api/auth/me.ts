import { createFileRoute } from '@tanstack/react-router';
import { staffFromRequest } from '@/lib/auth/staff';

/** Public: returns the current staff session, if any. */
export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const staff = await staffFromRequest(request);
        if (!staff) return Response.json({ email: null, isAdmin: false });
        return Response.json({ email: staff.email, isAdmin: true });
      },
    },
  },
});
