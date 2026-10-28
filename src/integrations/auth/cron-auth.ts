import { env } from 'cloudflare:workers';

/** Bearer check for the public HTTP cron route. Scheduled Worker triggers skip this. */
export async function authenticateCronRequest(request: Request): Promise<Response | null> {
  const currentSecret = env.CRON_SECRET;
  if (!currentSecret) {
    return new Response('Server configuration error', { status: 500 });
  }

  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get('authorization') ?? '');
  const token = match?.[1];
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const digest = async (value: string) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return new Uint8Array(hash);
  };
  const provided = await digest(token);
  const expected = await digest(currentSecret);
  if (provided.length !== expected.length) {
    return new Response('Unauthorized', { status: 401 });
  }
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) mismatch |= provided[i]! ^ expected[i]!;
  if (mismatch !== 0) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
