/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // This is needed for working with Mapbox GL
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};

module.exports = nextConfig; 