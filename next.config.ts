import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

// Only initialize OpenNext in development
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

export default nextConfig;
