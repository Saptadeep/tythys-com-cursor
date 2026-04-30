import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'

// Heavy collaborators irrelevant to the solver smoke gate. Replace with no-op
// stubs so jsdom does not have to handle <canvas>, animation loops, or layout
// chrome that has nothing to do with the centre-load assertion.
vi.mock('@/components/ui/ParticleCanvas', () => ({ ParticleCanvas: () => null }))
vi.mock('@/components/layout/Topbar', () => ({ TopBar: () => null }))
vi.mock('@/components/layout/Navbar', () => ({ Navbar: () => null }))
vi.mock('@/components/layout/Footer', () => ({ Footer: () => null }))
vi.mock('@/components/hud/HUD', () => ({ HUD: () => null }))

// recharts <ResponsiveContainer> measures the parent box, which jsdom never
// reports. Render a fixed-size shell so the inner LineChart still mounts but
// does not block the asserted output.
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        'div',
        { style: { width: 600, height: 200 } },
        // recharts inspects child props; passing through is sufficient.
        React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<{ width?: number; height?: number }>, { width: 600, height: 200 })
          : children,
      ),
  }
})

import BeamCalculatorPage from '@/app/beam-calculator/page'

const CANONICAL_RESPONSE = {
  ok: true,
  data: {
    reaction_left_n: 5000,
    reaction_right_n: 5000,
    max_bending_moment_nm: 15000,
    max_bending_moment_at_m: 3,
    max_shear_n: 5000,
    max_deflection_m: 0.0274390243902439,
    max_deflection_at_m: 3,
    max_bending_stress_pa: 137195121.9512195,
    deflection_curve: { x_m: [0, 3, 6], value: [0, 0.0274390243902439, 0] },
    bending_moment_curve: { x_m: [0, 3, 6], value: [0, 15000, 0] },
    shear_curve: { x_m: [0, 3, 6], value: [5000, 0, -5000] },
    flexural_rigidity_ei_nm2: 1640000,
    span_m: 6,
    roark_reference: 'Roark Table 8.1',
    units: 'si' as const,
  },
}

describe('BeamCalculatorPage — centre-load smoke', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => CANONICAL_RESPONSE,
      })) as unknown as typeof fetch,
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  test('canonical centre-load case renders the expected max deflection', async () => {
    const user = userEvent.setup()
    render(<BeamCalculatorPage />)

    // Default form values already encode the canonical centre-load case
    // (span 6 m, E 200 GPa, I 8.2e-6 m^4, magnitude 10 kN, sample_points 201,
    // load kind point_load_centre). Submitting alone is the smoke step.
    const solveButton = screen.getByRole('button', { name: /^Solve$/ })
    await user.click(solveButton)

    // The fetch mock returns the canonical Roark reference value; the results
    // panel should render it. Using a regex tolerant to truncation so the
    // assertion stays anchored on the deflection magnitude itself.
    await waitFor(() => {
      expect(screen.getByText(/Max deflection:/i)).toBeInTheDocument()
      expect(screen.getByText(/0\.02743902/)).toBeInTheDocument()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [calledUrl, calledInit] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(String(calledUrl)).toBe('/api/beam-calc/solve?units=si')
    expect(calledInit?.method).toBe('POST')
    const body = JSON.parse(String(calledInit?.body))
    expect(body.length_m).toBe(6)
    expect(body.material.youngs_modulus_pa).toBe(200000000000)
    expect(body.load).toEqual({ kind: 'point_load_centre', magnitude_n: 10000 })
  }, 15000)
})
