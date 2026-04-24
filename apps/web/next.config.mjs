/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kitco/api-client', '@kitco/shared'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
