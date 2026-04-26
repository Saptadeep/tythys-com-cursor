// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title:       { default: 'TythysOne — Engineering Computation Platform', template: '%s | TythysOne' },
  description: 'A growing collection of focused engineering tools — simulation, computation, and data analysis — built carefully, validated against real results.',
  keywords:    ['engineering calculator', 'beam deflection', 'physics simulation', 'quantitative finance', 'structural engineering'],
  authors:     [{ name: 'TythysOne', url: 'https://tythys.com' }],
  metadataBase: new URL('https://tythys.com'),
  openGraph: {
    title:       'TythysOne — Engineering Computation Platform',
    description: 'Hard problems, working tools.',
    url:         'https://tythys.com',
    siteName:    'TythysOne',
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,200;0,9..144,700;1,9..144,300;1,9..144,900&family=Outfit:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-[#dde4f0] font-body antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
