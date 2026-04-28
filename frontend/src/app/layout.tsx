// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

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
  authors:     [{ name: 'Tythys', url: 'https://tythys.com' }],
  metadataBase: new URL('https://tythys.com'),
  openGraph: {
    title:       'Tythys — Quantitative Reasoning, Modeling & Scientific Software',
    description: 'Hard problems, working tools. Built on quantitative reasoning, modeling, scientific thinking, and software.',
    url:         'https://tythys.com',
    siteName:    'Tythys',
    type:        'website',
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
        {children}
      </body>
    </html>
  )
}
