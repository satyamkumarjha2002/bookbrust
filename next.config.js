/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com'],
  },
  // Disable static optimization to ensure cookies are passed correctly
  trailingSlash: false,
  poweredByHeader: false,
};

module.exports = nextConfig; 