'use client'
// src/components/layout/BrandGlyph.tsx
// ─────────────────────────────────────────────────────────────
//  TythysOne brand mark — geometric T monogram cut out of the
//  brand tri-stop gradient (purple → accent → gold) used by the
//  TopBar. Reuses existing palette tokens: #8b7fff, #00e5b8,
//  #ffcb47 and #04080f (bg). No new design tokens introduced.
// ─────────────────────────────────────────────────────────────

import { useId } from 'react'
import { cn } from '@/lib/cn'

type BrandGlyphProps = {
  size?: number
  className?: string
}

export function BrandGlyph({ size = 28, className }: BrandGlyphProps) {
  const reactId = useId().replace(/:/g, '')
  const gradId = `brand-grad-${reactId}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0 rounded-[7px]', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b7fff" />
          <stop offset="55%" stopColor="#00e5b8" />
          <stop offset="100%" stopColor="#ffcb47" />
        </linearGradient>
      </defs>

      {/* Brand tile */}
      <rect width="28" height="28" rx="7" fill={`url(#${gradId})`} />

      {/* T monogram cut out using page-bg color */}
      <path
        d="M 6 7 L 22 7 L 22 10.5 L 16 10.5 L 16 21 L 12 21 L 12 10.5 L 6 10.5 Z"
        fill="#04080f"
      />

      {/* Signal/observation dot below the stem */}
      <circle cx="14" cy="23" r="1.3" fill="#04080f" />
    </svg>
  )
}
