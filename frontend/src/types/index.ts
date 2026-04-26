// src/types/index.ts
// ─────────────────────────────────────────────────────────────
//  Central type definitions for the Tythys platform.
//  Every service, product, and status uses these types.
// ─────────────────────────────────────────────────────────────

export type ServiceStatus = 'live' | 'beta' | 'soon' | 'maintenance'

export type AppState = 'idle' | 'loading' | 'ready' | 'error'

export type SystemHealth = 'healthy' | 'degraded' | 'down' | 'unknown'

// ── Service / Product entry ────────────────────────────────
export interface Service {
  id:          string
  name:        string
  tagline:     string
  description: string
  category:    ServiceCategory
  status:      ServiceStatus
  icon:        string           // emoji or lucide icon name
  accentColor: string           // hex
  price:       string
  href?:       string           // route if the tool page exists
  apiEndpoint?: string          // backend endpoint if live
  tags?:        string[]
  mathDomain?:  MathDomain[]   // which math areas this uses
}

// ── Service categories — add new ones here to extend ──────
export type ServiceCategory =
  | 'Engineering Simulation'
  | 'Quantitative Finance'
  | 'Vertical SaaS'
  | 'EdTech'
  | 'ML / Analytics'
  | 'Compliance & Law'
  | 'Scientific Computing'
  | 'Consulting'

// ── Math domains — for filtering and labelling ────────────
export type MathDomain =
  | 'Compute Metrics'
  | 'Linear Algebra'
  | 'Calculus'
  | 'Physics'
  | 'Statistics'
  | 'Numerical Methods'
  | 'Stochastic Processes'
  | 'Signal Processing'

// ── Process step ──────────────────────────────────────────
export interface ProcessStep {
  number: string
  title:  string
  description: string
}

// ── HUD / system status ───────────────────────────────────
export interface ServiceHealthEntry {
  name:   string
  status: SystemHealth
  latency?: number   // ms
  uptime?:  number   // percentage 0–100
}

export interface HUDData {
  platformHealth: SystemHealth
  services:       ServiceHealthEntry[]
  engineVersion:  string
  buildTime:      string
  uptimeSeconds:  number
}

// ── Contact form ──────────────────────────────────────────
export interface ContactFormData {
  firstName:   string
  lastName:    string
  email:       string
  interest:    string
  message:     string
}

// ── Navigation ────────────────────────────────────────────
export interface NavLink {
  label: string
  href:  string
  external?: boolean
}
