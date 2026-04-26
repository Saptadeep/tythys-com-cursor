// src/config/services.ts
// ─────────────────────────────────────────────────────────────
//  TYTHYS SERVICE REGISTRY
//  ========================
//  This is the SINGLE file you edit to add, remove, or update
//  any service or product on the platform.
//
//  To add a new service:
//    1. Add an entry to the SERVICES array below
//    2. Create src/app/[your-service-id]/page.tsx  (optional)
//    3. Add your API route to src/app/api/[your-service-id]/route.ts
//
//  Everything else (cards, nav, HUD, contact form) updates
//  automatically from this file.
// ─────────────────────────────────────────────────────────────

import type { Service, ProcessStep } from '@/types'

export const SERVICES: Service[] = [
  {
    id:          'beam-calc',
    name:        'EngineerCalc',
    tagline:     'Beam deflection & structural calculators',
    description: 'Beam deflection, bending stress, support reactions, and safety factors for the four most common load cases. Validated against Roark\'s Formulas.',
    category:    'Engineering Simulation',
    status:      'live',
    icon:        '⚙️',
    accentColor: '#8b7fff',
    price:       'From $19 / mo',
    href:        '/beam-calculator',
    apiEndpoint: '/api/beam-deflection',
    tags:        ['structural', 'civil', 'mechanical'],
    mathDomain:  ['Calculus', 'Physics'],
  },
  {
    id:          'physics-sim',
    name:        'PhysicsSim Pro',
    tagline:     'Structural & fluid simulation for engineers',
    description: 'Affordable web-based physics simulations for small firms — structural loads, fluid dynamics, thermal analysis. No $50K license required.',
    category:    'Engineering Simulation',
    status:      'soon',
    icon:        '⚛️',
    accentColor: '#00e5b8',
    price:       'From $49 / mo',
    mathDomain:  ['Calculus', 'Physics', 'Numerical Methods'],
  },
  {
    id:          'portfolio-sigma',
    name:        'PortfolioSigma',
    tagline:     'Monte Carlo portfolio & risk modeling',
    description: 'Options pricing, portfolio optimization, and Monte Carlo retirement simulations — scoped to what can be implemented correctly right now.',
    category:    'Quantitative Finance',
    status:      'soon',
    icon:        '📈',
    accentColor: '#ffcb47',
    price:       'From $29 / mo',
    mathDomain:  ['Stochastic Processes', 'Statistics', 'Linear Algebra'],
  },
  {
    id:          'math-canvas',
    name:        'MathCanvas',
    tagline:     'Interactive math & physics visualizations',
    description: 'Animated, manipulable explorations of calculus, linear algebra, and physics for universities, tutors, and self-learners.',
    category:    'EdTech',
    status:      'soon',
    icon:        '🧮',
    accentColor: '#ff6b9d',
    price:       'School licensing',
    mathDomain:  ['Linear Algebra', 'Calculus', 'Physics'],
  },
  {
    id:          'anomaly-lens',
    name:        'AnomalyLens',
    tagline:     'Anomaly detection for manufacturing & IoT',
    description: 'ML anomaly detection for small manufacturers — no data science team required. Plug in sensor data, get actionable alerts.',
    category:    'ML / Analytics',
    status:      'soon',
    icon:        '🔍',
    accentColor: '#00cfff',
    price:       'From $79 / mo',
    mathDomain:  ['Statistics', 'Signal Processing'],
  },
  {
    id:          'custom-models',
    name:        'Custom Models',
    tagline:     'Bespoke computation & simulation work',
    description: 'Have a specific calculation or modelling problem? Open to scoped projects where the problem is well-defined and the expected output is clear.',
    category:    'Consulting',
    status:      'live',
    icon:        '🧠',
    accentColor: '#00e5b8',
    price:       'Contact for pricing',
    href:        '#contact',
  },
]

// ── Process methodology steps ──────────────────────────────
export const PROCESS_STEPS: ProcessStep[] = [
  {
    number:      '01',
    title:       'Understand the Problem',
    description: 'Start with what the tool needs to compute. Research and validate the model before writing a single line of code.',
  },
  {
    number:      '02',
    title:       'Build a Working Core',
    description: 'Python — NumPy, SciPy, or plain arithmetic — checked against textbook examples and known outputs.',
  },
  {
    number:      '03',
    title:       'Add a Clean Interface',
    description: 'A usable web front-end so the tool is accessible to someone who needs an answer, not a programming environment.',
  },
  {
    number:      '04',
    title:       'Release When Ready',
    description: "No shipping half-finished tools. If it's not giving correct results, it doesn't go live.",
  },
]

// ── Equation showcase for the About panel ─────────────────
export const EQUATIONS = [
  { formula: '∂u/∂t + (u·∇)u = −∇p + ν∇²u', label: 'Navier–Stokes' },
  { formula: 'Ax = λx',                        label: 'Eigendecomposition' },
  { formula: 'dS = μS dt + σS dW\u209C',        label: 'Black–Scholes SDE' },
  { formula: '∇·E = ρ/ε₀',                     label: "Gauss's Law" },
  { formula: 'δ = PL³ / 48EI',                 label: 'Beam Deflection' },
]

// ── Skill tags ─────────────────────────────────────────────
export const SKILL_TAGS = [
  'Python · NumPy · SciPy',
  'Data Visualization',
  'Monte Carlo Simulation',
  'Numerical Methods',
  'Linear Algebra',
  'Portfolio Modeling',
  'Engineering Calculators',
  'Physics Simulation',
  'Interactive Education',
  'Anomaly Detection',
]

// ── Status config ──────────────────────────────────────────
export const STATUS_CONFIG = {
  live:        { label: 'Live',         color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25'  },
  beta:        { label: 'Beta',         color: 'text-gold',   bg: 'bg-gold/10',   border: 'border-gold/25'    },
  soon:        { label: 'Coming Soon',  color: 'text-purple', bg: 'bg-purple/10', border: 'border-purple/25'  },
  maintenance: { label: 'Maintenance',  color: 'text-warn',   bg: 'bg-warn/10',   border: 'border-warn/25'    },
} as const
