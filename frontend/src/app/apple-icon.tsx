import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Tythys'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Apple touch icon — gradient tile + T monogram (matches `icon.svg` / BrandGlyph). */
export default function AppleIcon() {
  const fg = '#04080f'

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          display: 'flex',
          position: 'relative',
          background:
            'linear-gradient(135deg, #8b7fff 0%, #00e5b8 52%, #ffcb47 100%)',
          borderRadius: 42,
        }}
      >
        {/* Top bar of T — scaled from BrandGlyph 28×28 paths */}
        <div
          style={{
            position: 'absolute',
            left: 39,
            top: 45,
            width: 103,
            height: 23,
            background: fg,
          }}
        />
        {/* Stem */}
        <div
          style={{
            position: 'absolute',
            left: 77,
            top: 68,
            width: 26,
            height: 68,
            background: fg,
          }}
        />
        {/* Signal dot */}
        <div
          style={{
            position: 'absolute',
            left: 82,
            top: 139,
            width: 17,
            height: 17,
            borderRadius: 999,
            background: fg,
          }}
        />
      </div>
    ),
    size,
  )
}
