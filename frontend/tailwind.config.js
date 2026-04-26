/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Brand colours ─────────────────────────────── */
      colors: {
        bg:       '#04080f',
        'bg-2':   '#080f1e',
        'bg-3':   '#0c1628',
        card:     'rgba(10,20,42,0.88)',
        accent:   '#00e5b8',
        'accent-dim': 'rgba(0,229,184,0.13)',
        gold:     '#ffcb47',
        purple:   '#8b7fff',
        pink:     '#ff6b9d',
        cyan:     '#00cfff',
        dim:      '#7a8a9e',
        muted:    '#4a5568',
        danger:   '#ff5f5f',
        warn:     '#ffaa33',
        ok:       '#00c97d',
        /* State colours */
        'state-idle':    '#7a8a9e',
        'state-loading': '#ffaa33',
        'state-ready':   '#00e5b8',
        'state-error':   '#ff5f5f',
      },

      /* ── Typography ────────────────────────────────── */
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body:    ['Outfit', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
      },

      /* ── Spacing ───────────────────────────────────── */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      /* ── Border radius ─────────────────────────────── */
      borderRadius: {
        '4xl': '2rem',
      },

      /* ── Box shadow ────────────────────────────────── */
      boxShadow: {
        glass:   '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg': '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        glow:    '0 0 32px rgba(0,229,184,0.2)',
        'glow-gold': '0 0 32px rgba(255,203,71,0.25)',
        'glow-lg': '0 0 64px rgba(0,229,184,0.15)',
        card:    '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 20px 56px rgba(0,0,0,0.6)',
      },

      /* ── Backdrop blur ─────────────────────────────── */
      backdropBlur: {
        xs: '4px',
      },

      /* ── Background image ──────────────────────────── */
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 70% 60% at 20% 40%, rgba(0,229,184,0.06) 0%, transparent 70%)',
        'card-shimmer': 'linear-gradient(135deg, rgba(0,229,184,0.04) 0%, transparent 50%)',
        'tythys-gradient': 'linear-gradient(90deg, #8b7fff 0%, #00e5b8 50%, #ffcb47 100%)',
      },

      /* ── Animations ────────────────────────────────── */
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.3', transform: 'scale(0.85)' },
        },
        'heartbeat': {
          '0%':   { transform: 'scaleY(1)' },
          '14%':  { transform: 'scaleY(2.5)' },
          '28%':  { transform: 'scaleY(0.5)' },
          '42%':  { transform: 'scaleY(1.8)' },
          '56%':  { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(8px)' },
          '50%':      { opacity: '1',   filter: 'blur(12px)' },
        },
        'slide-down': {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        'wave': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.15' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'ecg-draw': {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.7s ease forwards',
        'fade-in':     'fade-in 0.5s ease forwards',
        'pulse-dot':   'pulse-dot 2s ease-in-out infinite',
        'heartbeat':   'heartbeat 1.4s ease-in-out infinite',
        'scan-line':   'scan-line 4s linear infinite',
        'glow-pulse':  'glow-pulse 3s ease-in-out infinite',
        'slide-down':  'slide-down 0.4s ease forwards',
        'wave':        'wave 8s linear infinite',
        'blink':       'blink 1.8s ease-in-out infinite',
        'float':       'float 4s ease-in-out infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'ecg-draw':    'ecg-draw 2s ease forwards',
      },

      /* ── Transition duration ───────────────────────── */
      transitionDuration: {
        '400': '400ms',
      },

      /* ── Screen sizes ──────────────────────────────── */
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
