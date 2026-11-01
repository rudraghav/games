import type { NextConfig } from 'next';
const config: NextConfig = { transpilePackages: ['@games/ui', '@games/api-client'], logging: { incomingRequests: false } };
export default config;
