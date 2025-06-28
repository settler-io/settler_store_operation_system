/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  compress: false,
  poweredByHeader: false,
  eslint: { // eslintのlint checkをbuild時にoff
    ignoreDuringBuilds: true,
  },
  typescript: { // type checkをbuild時にoff
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
