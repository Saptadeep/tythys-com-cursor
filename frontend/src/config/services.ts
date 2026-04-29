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

import type { Service, ProcessStep, Pillar } from '@/types'

// ── The four Tythys pillars ────────────────────────────────
//  This is the operating spine of every product, page, and
//  decision. Every tool we build exercises at least one.
export const PILLARS: Array<{
  id:          Pillar
  symbol:      string
  label:       string
  short:       string
  description: string
  accentColor: string
}> = [
  {
    id:          'quantitative-reasoning',
    symbol:      'Σ',
    label:       'Quantitative Reasoning',
    short:       'Numbers that mean something',
    description: 'Turning vague questions into measurable ones. Units, scales, error bars, sanity checks — the discipline of reasoning with numbers instead of about them.',
    accentColor: '#00e5b8',
  },
  {
    id:          'modeling',
    symbol:      '∇',
    label:       'Modeling',
    short:       'Math that mirrors reality',
    description: 'Finding the equations and abstractions that capture how a system actually behaves — beam under load, portfolio under risk, signal under noise.',
    accentColor: '#8b7fff',
  },
  {
    id:          'scientific-thinking',
    symbol:      '⚛',
    label:       'Scientific Thinking',
    short:       'Hypothesis · test · revise',
    description: 'Treating each tool as an experiment: state the assumption, validate against known results, fail loudly when wrong, ship only what holds up.',
    accentColor: '#ffcb47',
  },
  {
    id:          'problem-solving',
    symbol:      '⟶',
    label:       'Problem-Solving + Software',
    short:       'From insight to interface',
    description: 'Compressing the loop from "I think this is the model" to "anyone can run it" — clean code, validated outputs, a UI that respects the user.',
    accentColor: '#ff6b9d',
  },
]

export const SERVICES: Service[] = [
  {
    id:          'api-gateway-observability',
    name:        'GatewaySight',
    tagline:     'API Gateway observability for reliable operations',
    description: 'Monitor gateway health, trace request flow, and detect latency or error spikes early so your team can resolve incidents faster.',
    category:    'Vertical SaaS',
    status:      'live',
    icon:        '🛰️',
    accentColor: '#00e5b8',
    price:       'Contact for pricing',
    href:        '/gateway-observability',
    apiEndpoint: '/api/services/api-gateway-observability',
    tags:        ['gateway', 'monitoring', 'observability'],
    mathDomain:  ['Compute Metrics'],
    pillars:     ['quantitative-reasoning', 'problem-solving'],
  },
  {
    id:          'beam-calc',
    name:        'EngineerCalc',
    tagline:     'Beam deflection & structural calculators',
    description: 'Beam deflection, bending stress, support reactions, and safety factors for the four most common load cases. Validated against Roark\'s Formulas.',
    category:    'Engineering Simulation',
    status:      'live',
    icon:        '⚙️',
    accentColor: '#8b7fff',
    price:       'Contact for pricing',
    href:        '/beam-calculator',
    apiEndpoint: '/api/beam-calc/solve',
    tags:        ['structural', 'civil', 'mechanical'],
    mathDomain:  ['Calculus', 'Physics'],
    pillars:     ['modeling', 'scientific-thinking', 'problem-solving'],
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
    price:       'Contact for pricing',
    mathDomain:  ['Calculus', 'Physics', 'Numerical Methods'],
    pillars:     ['modeling', 'scientific-thinking', 'problem-solving'],
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
    price:       'Contact for pricing',
    mathDomain:  ['Stochastic Processes', 'Statistics', 'Linear Algebra'],
    pillars:     ['quantitative-reasoning', 'modeling', 'problem-solving'],
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
    pillars:     ['quantitative-reasoning', 'scientific-thinking'],
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
    price:       'Contact for pricing',
    mathDomain:  ['Statistics', 'Signal Processing'],
    pillars:     ['quantitative-reasoning', 'scientific-thinking', 'problem-solving'],
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
    pillars:     ['modeling', 'problem-solving'],
  },
]

// ── Process methodology steps ──────────────────────────────
//  The learn-by-building loop. Every tool moves through these
//  four steps; each one maps back to one of the four pillars.
export const PROCESS_STEPS: ProcessStep[] = [
  {
    number:      '01',
    title:       'Frame the Question',
    description: 'Translate a vague need into a measurable one. What are the inputs, the outputs, the units, the failure modes? Quantitative reasoning before code.',
  },
  {
    number:      '02',
    title:       'Build the Model',
    description: 'Find or derive the equations. Implement the core in Python — NumPy, SciPy, or plain arithmetic — and check it against textbook cases and known answers.',
  },
  {
    number:      '03',
    title:       'Test Like a Scientist',
    description: 'Hypothesise, perturb, compare. Edge cases, sanity checks, validation suites. If it disagrees with reality, the model is wrong — not reality.',
  },
  {
    number:      '04',
    title:       'Ship a Tool, Not a Notebook',
    description: 'Wrap the validated core in a clean interface so someone who needs an answer — not a programming environment — can actually use it.',
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
