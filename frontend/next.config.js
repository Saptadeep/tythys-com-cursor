/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Future: add image domains here when you add product screenshots
  images: {
    domains: [],
  },
  // Allows tythys.com custom domain in Vercel
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin',  value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
      ],
    },
  ],
}

module.exports = nextConfig
