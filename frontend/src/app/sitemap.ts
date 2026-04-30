import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tythys.com'

const PUBLIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/beam-calculator', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/gateway-observability', priority: 0.7, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
