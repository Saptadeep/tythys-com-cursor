// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers/Providers'
import { SiteJsonLd } from '@/components/seo/JsonLd'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tythys.com'

export const metadata: Metadata = {
  title:       { default: 'Tythys — Quantitative Reasoning, Modeling & Scientific Software', template: '%s | Tythys' },
  description: 'Tythys turns quantitative reasoning, modeling, and scientific thinking into software you can actually use — focused tools, validated against real results.',
  keywords:    [
    'quantitative reasoning',
    'mathematical modeling',
    'scientific computing',
    'engineering calculator',
    'beam deflection',
    'physics simulation',
    'quantitative finance',
    'monte carlo',
    'structural engineering',
    'edtech math',
  ],
  authors:     [{ name: 'Tythys', url: SITE_URL }],
  creator:     'Tythys',
  publisher:   'Tythys',
  metadataBase: new URL(SITE_URL),
  alternates:  { canonical: '/' },
  applicationName: 'Tythys',
  category:    'science',
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title:       'Tythys — Quantitative Reasoning, Modeling & Scientific Software',
    description: 'Hard problems, working tools. Built on quantitative reasoning, modeling, scientific thinking, and software.',
    url:         SITE_URL,
    siteName:    'Tythys',
    locale:      'en_US',
    type:        'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tythys — Quantitative Reasoning, Modeling & Scientific Software',
    description: 'Hard problems, working tools. Built on quantitative reasoning, modeling, scientific thinking, and software.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#04080f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,700;1,9..144,300&family=Outfit:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-[#dde4f0] font-body antialiased overflow-x-hidden">
        <SiteJsonLd />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
