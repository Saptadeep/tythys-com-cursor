/** @type {import('next').NextConfig} */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tythys.com'

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://tythys.com,https://www.tythys.com')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const PRIMARY_ORIGIN = ALLOWED_ORIGINS[0] || SITE_URL

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' https://accounts.google.com",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://challenges.cloudflare.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.vercel-scripts.com",
      "frame-src 'self' https://challenges.cloudflare.com https://accounts.google.com",
      "manifest-src 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
    {
      source: '/admin/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      ],
    },
    {
      source: '/auth/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'Cache-Control', value: 'no-store, max-age=0' },
        { key: 'Vary', value: 'Origin' },
        { key: 'Access-Control-Allow-Origin', value: PRIMARY_ORIGIN },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        { key: 'Access-Control-Max-Age', value: '600' },
      ],
    },
  ],
}

module.exports = nextConfig
