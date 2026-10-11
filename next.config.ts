import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Preferred domain is https://www.indiayogatourism.com —
  // permanently (301) redirect the bare domain, preserving path + query.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'indiayogatourism.com' }],
        destination: 'https://www.indiayogatourism.com/:path*',
        statusCode: 301,
      },
    ]
  },
};

export default nextConfig;
