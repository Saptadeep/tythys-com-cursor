import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tythys',
    short_name: 'Tythys',
    description:
      'Tythys turns quantitative reasoning, modeling, and scientific thinking into focused tools, validated against real results.',
    start_url: '/',
    display: 'standalone',
    background_color: '#04080f',
    theme_color: '#04080f',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
