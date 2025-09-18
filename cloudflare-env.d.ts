// Cloudflare environment variables type definition
export interface CloudflareEnv {
  DB: D1Database;
  NEXT_INC_CACHE_R2_BUCKET: R2Bucket;
  WORKER_SELF_REFERENCE: Fetcher;
  ASSETS: Fetcher;
}
