import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Tythys — Quantitative Reasoning, Modeling & Scientific Software'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'linear-gradient(135deg, #04080f 0%, #0a142a 50%, #04080f 100%)',
          color: '#dde4f0',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '999px',
              background: '#00e5b8',
              boxShadow: '0 0 24px #00e5b8',
            }}
          />
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '20px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#00e5b8',
            }}
          >
            tythys.com
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '88px', lineHeight: 1.05, fontWeight: 300 }}>
            Hard problems,
          </div>
          <div style={{ fontSize: '88px', lineHeight: 1.05, fontWeight: 300 }}>
            <span style={{ color: '#00e5b8', fontStyle: 'italic' }}>working</span>{' '}
            <span style={{ color: '#ffcb47' }}>tools</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '36px',
            fontFamily: 'monospace',
            fontSize: '22px',
            letterSpacing: '0.04em',
            color: '#7a8a9e',
          }}
        >
          <span>Σ Quantitative</span>
          <span>∇ Modeling</span>
          <span>⚛ Scientific</span>
          <span>⟶ Software</span>
        </div>
      </div>
    ),
    size,
  )
}
