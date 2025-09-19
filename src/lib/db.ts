import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cache } from 'react';
import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

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
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
});

// Usage: Static Route (ISR / SSG)

export const getDbAsync = async () => {
  const { env } = await getCloudflareContext({ async: true });
  const adapter = new PrismaD1(env.DB);
  const prisma = new PrismaClient({ adapter });
  return prisma;
};
