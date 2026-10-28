import { drizzle } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';
import * as schema from '../../../drizzle/schema';

/** Drizzle client bound to the Worker D1 database. Server-only. */
export function db() {
  return drizzle(env.DB, { schema });
}

export type AppDb = ReturnType<typeof db>;
export { schema };
