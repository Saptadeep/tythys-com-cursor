'use client'

import { useMemo, useState } from 'react'
import { TopBar } from '@/components/layout/Topbar'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ParticleCanvas } from '@/components/ui/ParticleCanvas'
import { HUD } from '@/components/hud/HUD'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

type Units = 'si' | 'imperial'
type LoadKind = 'point_load_centre' | 'point_load_arbitrary' | 'udl_full_span' | 'end_moment_left'

type SolverResponse = {
  reaction_left_n: number
  reaction_right_n: number
  max_bending_moment_nm: number
  max_bending_moment_at_m: number
  max_shear_n: number
  max_deflection_m: number
  max_deflection_at_m: number
  max_bending_stress_pa: number | null
  deflection_curve: { x_m: number[]; value: number[] }
  bending_moment_curve: { x_m: number[]; value: number[] }
  shear_curve: { x_m: number[]; value: number[] }
  flexural_rigidity_ei_nm2: number
  span_m: number
  roark_reference: string
  units: Units
}

type ApiOk = { ok: true; data: SolverResponse }
type ApiErr = { ok: false; error?: string; detail?: unknown }

function unitLabel(units: Units) {
  if (units === 'imperial') {
    return {
      length: 'ft',
      force: 'lbf',
      moment: 'lbf·ft',
      deflection: 'in',
      stress: 'psi',
      modulus: 'psi',
      inertia: 'in^4',
      c: 'in',
      ei: 'lbf·in^2',
      distributed: 'lbf/ft',
    }
  }
  return {
    length: 'm',
    force: 'N',
    moment: 'N·m',
    deflection: 'm',
    stress: 'Pa',
    modulus: 'Pa',
    inertia: 'm^4',
    c: 'm',
    ei: 'N·m^2',
    distributed: 'N/m',
  }
}

function toSeries(x: number[], y: number[]) {
  return x.map((xx, i) => ({ x: xx, y: y[i] ?? 0 }))
}

export default function BeamCalculatorPage() {
  const [units, setUnits] = useState<Units>('si')
  const [loadKind, setLoadKind] = useState<LoadKind>('point_load_centre')
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [resp, setResp] = useState<SolverResponse | null>(null)

  const u = unitLabel(units)

  const [length, setLength] = useState('6')
  const [e, setE] = useState('200000000000')
  const [i, setI] = useState('0.0000082')
  const [c, setC] = useState('0.075')
  const [samplePoints, setSamplePoints] = useState('201')

  const [magnitude, setMagnitude] = useState('10000')
  const [position, setPosition] = useState('2')
  const [intensity, setIntensity] = useState('5000')
  const [moment, setMoment] = useState('4000')

  const deflectionData = useMemo(
    () => (resp ? toSeries(resp.deflection_curve.x_m, resp.deflection_curve.value) : []),
    [resp],
  )
  const momentData = useMemo(
    () => (resp ? toSeries(resp.bending_moment_curve.x_m, resp.bending_moment_curve.value) : []),
    [resp],
  )
  const shearData = useMemo(
    () => (resp ? toSeries(resp.shear_curve.x_m, resp.shear_curve.value) : []),
    [resp],
  )

  async function onSolve(evn: React.FormEvent) {
    evn.preventDefault()
    setApiError(null)
    setFieldError(null)
    setLoading(true)

    const payload: any = {
      length_m: Number(length),
      material: { name: 'Custom', youngs_modulus_pa: Number(e) },
      section: {
        shape: 'custom',
        second_moment_m4: Number(i),
        extreme_fibre_distance_m: c.trim() === '' ? null : Number(c),
        label: 'Custom section',
      },
      sample_points: Number(samplePoints),
      load: null,
    }

    if (loadKind === 'point_load_centre') {
      payload.load = { kind: loadKind, magnitude_n: Number(magnitude) }
    } else if (loadKind === 'point_load_arbitrary') {
      payload.load = { kind: loadKind, magnitude_n: Number(magnitude), position_m: Number(position) }
    } else if (loadKind === 'udl_full_span') {
      payload.load = { kind: loadKind, intensity_n_per_m: Number(intensity) }
    } else {
      payload.load = { kind: loadKind, moment_nm: Number(moment) }
    }

    try {
      const r = await fetch(`/api/beam-calc/solve?units=${units}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = (await r.json()) as ApiOk | ApiErr
      if (!r.ok || !json.ok) {
        const maybeDetail = (json as ApiErr).detail as any
        const firstErr = Array.isArray(maybeDetail?.detail) ? maybeDetail.detail[0] : null
        setFieldError(firstErr?.msg ?? null)
        setApiError((json as ApiErr).error ?? `Request failed (${r.status})`)
        setResp(null)
        return
      }
      setResp(json.data)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unexpected network error')
      setResp(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ParticleCanvas />
      <TopBar />
      <Navbar />
      <HUD />

      <main className="relative z-10" style={{ paddingTop: 'calc(28px + 56px + 1.5rem)' }}>
        <section className="relative z-10">
          <div className="mx-auto max-w-[1300px] px-4 py-12 sm:px-7 sm:py-16 md:px-10 lg:px-16 lg:py-20 xl:px-20">
            <span className="eyebrow mb-3">EngineerCalc</span>
            <h1 className="section-title mb-3">
              Beam calculator <em className="title-accent">live solver</em>
            </h1>
            <p className="section-body mb-8 max-w-[700px]">
              Solve simply-supported beam cases against the validated backend kernel. Inputs and outputs
              can be interpreted in SI or imperial through the API edge conversion layer.
            </p>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <form
                onSubmit={onSolve}
                className="rounded-2xl border border-accent-dim p-6"
                style={{ background: 'rgba(10,20,42,0.88)' }}
              >
                <div className="mb-4 flex gap-2">
                  <button type="button" onClick={() => setUnits('si')} className={`btn-ghost ${units === 'si' ? '' : 'opacity-70'}`}>SI</button>
                  <button type="button" onClick={() => setUnits('imperial')} className={`btn-ghost ${units === 'imperial' ? '' : 'opacity-70'}`}>Imperial</button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-sm text-dim">Span ({u.length})<input className="field-input mt-1" value={length} onChange={(e2) => setLength(e2.target.value)} /></label>
                  <label className="text-sm text-dim">Young&apos;s E ({u.modulus})<input className="field-input mt-1" value={e} onChange={(e2) => setE(e2.target.value)} /></label>
                  <label className="text-sm text-dim">Second moment I ({u.inertia})<input className="field-input mt-1" value={i} onChange={(e2) => setI(e2.target.value)} /></label>
                  <label className="text-sm text-dim">Extreme fibre c ({u.c})<input className="field-input mt-1" value={c} onChange={(e2) => setC(e2.target.value)} /></label>
                  <label className="text-sm text-dim">Sample points<input className="field-input mt-1" value={samplePoints} onChange={(e2) => setSamplePoints(e2.target.value)} /></label>
                </div>

                <div className="mt-4">
                  <label className="text-sm text-dim">Load case</label>
                  <select className="field-input mt-1" value={loadKind} onChange={(e2) => setLoadKind(e2.target.value as LoadKind)}>
                    <option value="point_load_centre">Point load at centre</option>
                    <option value="point_load_arbitrary">Point load at position</option>
                    <option value="udl_full_span">UDL full span</option>
                    <option value="end_moment_left">End moment at left support</option>
                  </select>
                </div>

                {loadKind === 'point_load_centre' || loadKind === 'point_load_arbitrary' ? (
                  <label className="mt-3 block text-sm text-dim">Point magnitude ({u.force})<input className="field-input mt-1" value={magnitude} onChange={(e2) => setMagnitude(e2.target.value)} /></label>
                ) : null}
                {loadKind === 'point_load_arbitrary' ? (
                  <label className="mt-3 block text-sm text-dim">Position from left ({u.length})<input className="field-input mt-1" value={position} onChange={(e2) => setPosition(e2.target.value)} /></label>
                ) : null}
                {loadKind === 'udl_full_span' ? (
                  <label className="mt-3 block text-sm text-dim">UDL intensity ({u.distributed})<input className="field-input mt-1" value={intensity} onChange={(e2) => setIntensity(e2.target.value)} /></label>
                ) : null}
                {loadKind === 'end_moment_left' ? (
                  <label className="mt-3 block text-sm text-dim">Applied moment ({u.moment})<input className="field-input mt-1" value={moment} onChange={(e2) => setMoment(e2.target.value)} /></label>
                ) : null}

                <button type="submit" disabled={loading} className="btn-primary mt-5">
                  {loading ? 'Solving...' : 'Solve'}
                </button>

                {apiError ? <p className="mt-3 text-sm text-danger">{apiError}</p> : null}
                {fieldError ? <p className="mt-1 text-xs text-warn">Validation: {fieldError}</p> : null}
              </form>

              <div className="rounded-2xl border border-accent-dim p-6" style={{ background: 'rgba(10,20,42,0.88)' }}>
                {resp ? (
                  <>
                    <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                      <div>R-left: <span className="text-accent">{resp.reaction_left_n.toFixed(4)} {u.force}</span></div>
                      <div>R-right: <span className="text-accent">{resp.reaction_right_n.toFixed(4)} {u.force}</span></div>
                      <div>Max deflection: <span className="text-accent">{resp.max_deflection_m.toFixed(8)} {u.deflection}</span></div>
                      <div>at x = <span className="text-accent">{resp.max_deflection_at_m.toFixed(4)} {u.length}</span></div>
                      <div>Max moment: <span className="text-accent">{resp.max_bending_moment_nm.toFixed(4)} {u.moment}</span></div>
                      <div>at x = <span className="text-accent">{resp.max_bending_moment_at_m.toFixed(4)} {u.length}</span></div>
                      <div>Max shear: <span className="text-accent">{resp.max_shear_n.toFixed(4)} {u.force}</span></div>
                      <div>EI: <span className="text-accent">{resp.flexural_rigidity_ei_nm2.toExponential(6)} {u.ei}</span></div>
                    </div>
                    <p className="mb-4 font-mono text-xs text-dim">Reference: {resp.roark_reference}</p>

                    <ChartCard title={`Deflection (${u.deflection})`} data={deflectionData} color="#00e5b8" />
                    <ChartCard title={`Bending Moment (${u.moment})`} data={momentData} color="#ffcb47" />
                    <ChartCard title={`Shear (${u.force})`} data={shearData} color="#8b7fff" />
                  </>
                ) : (
                  <p className="text-sm text-dim">Run a solve to view outputs and charts.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function ChartCard({ title, data, color }: { title: string; data: Array<{ x: number; y: number }>; color: string }) {
  return (
    <div className="mb-4 rounded-xl border border-accent-dim p-3">
      <p className="mb-2 font-mono text-xs text-dim">{title}</p>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(122,138,158,0.2)" strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#7a8a9e' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7a8a9e' }} />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke={color} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
