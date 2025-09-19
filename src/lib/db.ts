import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Extend the CloudflareEnv interface to include our D1 binding
declare global {
  interface CloudflareEnv {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DB: any; // D1Database type
  }
}

// Usage: API Route
export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
});

// Usage: Static Route (ISR / SSG)
export const getDbAsync = async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB, { schema });
};
