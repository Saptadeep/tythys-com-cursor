'use client'

import { useMemo, useState, type FormEvent } from 'react'
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
type SectionKind = 'custom' | 'rectangle' | 'circle' | 'w_shape'

type WShapePreset = {
  id: string
  label: string
  inertia_in4: number
  c_in: number
}

const W_SHAPE_PRESETS: WShapePreset[] = [
  { id: 'w8x10', label: 'W8x10', inertia_in4: 62.7, c_in: 4.06 },
  { id: 'w10x22', label: 'W10x22', inertia_in4: 167, c_in: 5.04 },
  { id: 'w12x26', label: 'W12x26', inertia_in4: 204, c_in: 6.03 },
]

const M_PER_FT = 0.3048
const M_PER_IN = 0.0254
const M4_PER_IN4 = M_PER_IN ** 4

function mapFieldName(path: string): string {
  const key = path.replace(/^body\./, '')
  const mapping: Record<string, string> = {
    length_m: 'Span',
    sample_points: 'Sample points',
    'material.youngs_modulus_pa': "Young's E",
    'section.second_moment_m4': 'Second moment I',
    'section.extreme_fibre_distance_m': 'Extreme fibre c',
    'load.magnitude_n': 'Point magnitude',
    'load.position_m': 'Point position',
    'load.intensity_n_per_m': 'UDL intensity',
    'load.moment_nm': 'Applied moment',
  }
  return mapping[key] ?? key
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [resp, setResp] = useState<SolverResponse | null>(null)

  const u = unitLabel(units)

  const [length, setLength] = useState('6')
  const [e, setE] = useState('200000000000')
  const [i, setI] = useState('0.0000082')
  const [c, setC] = useState('0.075')
  const [samplePoints, setSamplePoints] = useState('201')
  const [sectionKind, setSectionKind] = useState<SectionKind>('custom')
  const [rectWidth, setRectWidth] = useState('0.1')
  const [rectHeight, setRectHeight] = useState('0.15')
  const [circleDiameter, setCircleDiameter] = useState('0.12')
  const [wShapeId, setWShapeId] = useState<string>(W_SHAPE_PRESETS[0]?.id ?? '')

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

  function sectionFromInputs() {
    if (sectionKind === 'custom') {
      return {
        shape: 'custom' as const,
        secondMoment: Number(i),
        extremeFibre: c.trim() === '' ? null : Number(c),
        label: 'Custom section',
      }
    }

    if (sectionKind === 'rectangle') {
      const b = Number(rectWidth)
      const h = Number(rectHeight)
      return {
        shape: 'rectangle' as const,
        secondMoment: (b * h ** 3) / 12,
        extremeFibre: h / 2,
        label: 'Rectangle',
      }
    }

    if (sectionKind === 'circle') {
      const d = Number(circleDiameter)
      return {
        shape: 'circle' as const,
        secondMoment: (Math.PI * d ** 4) / 64,
        extremeFibre: d / 2,
        label: 'Circle',
      }
    }

    const preset = W_SHAPE_PRESETS.find((x) => x.id === wShapeId) ?? W_SHAPE_PRESETS[0]
    if (!preset) {
      return {
        shape: 'w_shape' as const,
        secondMoment: Number.NaN,
        extremeFibre: Number.NaN,
        label: 'W-shape',
      }
    }

    if (units === 'imperial') {
      return {
        shape: 'w_shape' as const,
        secondMoment: preset.inertia_in4,
        extremeFibre: preset.c_in,
        label: preset.label,
      }
    }

    return {
      shape: 'w_shape' as const,
      secondMoment: preset.inertia_in4 * M4_PER_IN4,
      extremeFibre: preset.c_in * M_PER_IN,
      label: preset.label,
    }
  }

  function errorFor(path: string): string | null {
    return fieldErrors[path] ?? null
  }

  async function onSolve(evn: FormEvent) {
    evn.preventDefault()
    setApiError(null)
    setFieldErrors({})
    setLoading(true)

    const section = sectionFromInputs()
    const payload: any = {
      length_m: Number(length),
      material: { name: 'Custom', youngs_modulus_pa: Number(e) },
      section: {
        shape: section.shape,
        second_moment_m4: section.secondMoment,
        extreme_fibre_distance_m: section.extremeFibre,
        label: section.label,
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
        const detailArray = Array.isArray(maybeDetail?.detail)
          ? maybeDetail.detail
          : Array.isArray(maybeDetail)
            ? maybeDetail
            : []
        const mappedErrors: Record<string, string> = {}
        for (const item of detailArray) {
          const loc = Array.isArray(item?.loc) ? item.loc.join('.') : ''
          if (loc && typeof item?.msg === 'string') {
            mappedErrors[loc] = item.msg
          }
        }
        setFieldErrors(mappedErrors)
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

  function getChartSvgMarkup(chartId: string): string {
    const root = document.getElementById(chartId)
    const svg = root?.querySelector('svg')
    if (!svg) return '<p style="color:#666">Chart unavailable.</p>'
    return svg.outerHTML
  }

  function onExportPdf() {
    if (!resp) return

    const reportWindow = window.open('', '_blank', 'noopener,noreferrer,width=1100,height=900')
    if (!reportWindow) return

    const now = new Date().toISOString()
    const html = `
      <html>
        <head>
          <title>EngineerCalc Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #0a122a; }
            h1 { margin-bottom: 4px; }
            .meta { color: #555; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-bottom: 20px; }
            .section { margin: 20px 0; }
            .card { border: 1px solid #ccd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
            .label { font-weight: bold; }
            svg { width: 100%; height: auto; max-height: 260px; }
          </style>
        </head>
        <body>
          <h1>EngineerCalc Beam Report</h1>
          <p class="meta">Generated: ${now} | Units: ${units.toUpperCase()} | Roark: ${resp.roark_reference}</p>
          <div class="section">
            <h2>Inputs</h2>
            <div class="grid">
              <div><span class="label">Span:</span> ${length} ${u.length}</div>
              <div><span class="label">Young's E:</span> ${e} ${u.modulus}</div>
              <div><span class="label">Section Mode:</span> ${sectionKind}</div>
              <div><span class="label">Sample Points:</span> ${samplePoints}</div>
              <div><span class="label">Load Case:</span> ${loadKind}</div>
            </div>
          </div>
          <div class="section">
            <h2>Key Outputs</h2>
            <div class="grid">
              <div><span class="label">R-left:</span> ${resp.reaction_left_n.toFixed(6)} ${u.force}</div>
              <div><span class="label">R-right:</span> ${resp.reaction_right_n.toFixed(6)} ${u.force}</div>
              <div><span class="label">Max Deflection:</span> ${resp.max_deflection_m.toFixed(10)} ${u.deflection}</div>
              <div><span class="label">At x:</span> ${resp.max_deflection_at_m.toFixed(6)} ${u.length}</div>
              <div><span class="label">Max Moment:</span> ${resp.max_bending_moment_nm.toFixed(6)} ${u.moment}</div>
              <div><span class="label">Max Shear:</span> ${resp.max_shear_n.toFixed(6)} ${u.force}</div>
              <div><span class="label">EI:</span> ${resp.flexural_rigidity_ei_nm2.toExponential(6)} ${u.ei}</div>
              <div><span class="label">Stress:</span> ${resp.max_bending_stress_pa == null ? 'N/A' : `${resp.max_bending_stress_pa.toFixed(6)} ${u.stress}`}</div>
            </div>
          </div>
          <div class="section">
            <h2>Charts</h2>
            <div class="card"><h3>Deflection</h3>${getChartSvgMarkup('chart-deflection')}</div>
            <div class="card"><h3>Bending Moment</h3>${getChartSvgMarkup('chart-moment')}</div>
            <div class="card"><h3>Shear</h3>${getChartSvgMarkup('chart-shear')}</div>
          </div>
        </body>
      </html>
    `

    reportWindow.document.open()
    reportWindow.document.write(html)
    reportWindow.document.close()
    reportWindow.focus()
    reportWindow.print()
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
                  <label className="text-sm text-dim">
                    Span ({u.length})
                    <input className="field-input mt-1" placeholder={units === 'si' ? 'e.g. 6.0' : 'e.g. 19.685'} step="any" value={length} onChange={(e2) => setLength(e2.target.value)} />
                    {errorFor('body.length_m') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.length_m')}: {errorFor('body.length_m')}</span> : null}
                  </label>
                  <label className="text-sm text-dim">
                    Young&apos;s E ({u.modulus})
                    <input className="field-input mt-1" placeholder={units === 'si' ? 'e.g. 2e11' : 'e.g. 29000000'} step="any" value={e} onChange={(e2) => setE(e2.target.value)} />
                    {errorFor('body.material.youngs_modulus_pa') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.material.youngs_modulus_pa')}: {errorFor('body.material.youngs_modulus_pa')}</span> : null}
                  </label>
                  <label className="text-sm text-dim">
                    Section model
                    <select className="field-input mt-1" value={sectionKind} onChange={(e2) => setSectionKind(e2.target.value as SectionKind)}>
                      <option value="custom">Custom I + c</option>
                      <option value="rectangle">Rectangle (b x h)</option>
                      <option value="circle">Circle (solid dia)</option>
                      <option value="w_shape">W-shape preset</option>
                    </select>
                  </label>
                  <label className="text-sm text-dim">
                    Sample points
                    <input className="field-input mt-1" placeholder="11 to 2001" step="1" value={samplePoints} onChange={(e2) => setSamplePoints(e2.target.value)} />
                    {errorFor('body.sample_points') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.sample_points')}: {errorFor('body.sample_points')}</span> : null}
                  </label>
                </div>

                {sectionKind === 'custom' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-dim">
                      Second moment I ({u.inertia})
                      <input className="field-input mt-1" step="any" value={i} onChange={(e2) => setI(e2.target.value)} />
                      {errorFor('body.section.second_moment_m4') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.section.second_moment_m4')}: {errorFor('body.section.second_moment_m4')}</span> : null}
                    </label>
                    <label className="text-sm text-dim">
                      Extreme fibre c ({u.c})
                      <input className="field-input mt-1" step="any" value={c} onChange={(e2) => setC(e2.target.value)} />
                      {errorFor('body.section.extreme_fibre_distance_m') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.section.extreme_fibre_distance_m')}: {errorFor('body.section.extreme_fibre_distance_m')}</span> : null}
                    </label>
                  </div>
                ) : null}

                {sectionKind === 'rectangle' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="text-sm text-dim">
                      Width b ({u.length})
                      <input className="field-input mt-1" step="any" value={rectWidth} onChange={(e2) => setRectWidth(e2.target.value)} />
                    </label>
                    <label className="text-sm text-dim">
                      Height h ({u.length})
                      <input className="field-input mt-1" step="any" value={rectHeight} onChange={(e2) => setRectHeight(e2.target.value)} />
                    </label>
                  </div>
                ) : null}

                {sectionKind === 'circle' ? (
                  <label className="mt-3 block text-sm text-dim">
                    Diameter d ({u.length})
                    <input className="field-input mt-1" step="any" value={circleDiameter} onChange={(e2) => setCircleDiameter(e2.target.value)} />
                  </label>
                ) : null}

                {sectionKind === 'w_shape' ? (
                  <div className="mt-3 rounded-lg border border-accent-dim p-3">
                    <label className="block text-sm text-dim">
                      W-shape preset
                      <select className="field-input mt-1" value={wShapeId} onChange={(e2) => setWShapeId(e2.target.value)}>
                        {W_SHAPE_PRESETS.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {preset.label} (I={preset.inertia_in4} in^4, c={preset.c_in} in)
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-dim">
                      Presets are stored as imperial section properties and converted at the UI edge when SI is selected.
                    </p>
                  </div>
                ) : null}

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
                  <label className="mt-3 block text-sm text-dim">Point magnitude ({u.force})<input className="field-input mt-1" step="any" value={magnitude} onChange={(e2) => setMagnitude(e2.target.value)} />{errorFor('body.load.magnitude_n') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.load.magnitude_n')}: {errorFor('body.load.magnitude_n')}</span> : null}</label>
                ) : null}
                {loadKind === 'point_load_arbitrary' ? (
                  <label className="mt-3 block text-sm text-dim">Position from left ({u.length})<input className="field-input mt-1" step="any" value={position} onChange={(e2) => setPosition(e2.target.value)} />{errorFor('body.load.position_m') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.load.position_m')}: {errorFor('body.load.position_m')}</span> : null}</label>
                ) : null}
                {loadKind === 'udl_full_span' ? (
                  <label className="mt-3 block text-sm text-dim">UDL intensity ({u.distributed})<input className="field-input mt-1" step="any" value={intensity} onChange={(e2) => setIntensity(e2.target.value)} />{errorFor('body.load.intensity_n_per_m') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.load.intensity_n_per_m')}: {errorFor('body.load.intensity_n_per_m')}</span> : null}</label>
                ) : null}
                {loadKind === 'end_moment_left' ? (
                  <label className="mt-3 block text-sm text-dim">Applied moment ({u.moment})<input className="field-input mt-1" step="any" value={moment} onChange={(e2) => setMoment(e2.target.value)} />{errorFor('body.load.moment_nm') ? <span className="mt-1 block text-xs text-warn">{mapFieldName('body.load.moment_nm')}: {errorFor('body.load.moment_nm')}</span> : null}</label>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Solving...' : 'Solve'}
                  </button>
                  <button type="button" disabled={!resp} onClick={onExportPdf} className={`btn-ghost ${!resp ? 'opacity-60' : ''}`}>
                    Export PDF
                  </button>
                </div>

                {apiError ? <p className="mt-3 text-sm text-danger">{apiError}</p> : null}
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

                    <ChartCard id="chart-deflection" title={`Deflection (${u.deflection})`} data={deflectionData} color="#00e5b8" />
                    <ChartCard id="chart-moment" title={`Bending Moment (${u.moment})`} data={momentData} color="#ffcb47" />
                    <ChartCard id="chart-shear" title={`Shear (${u.force})`} data={shearData} color="#8b7fff" />
                  </>
                ) : (
                  <p className="text-sm text-dim">
                    Run a solve to view reactions, maxima, and the three response curves. Use section presets for
                    quick starts, or custom I + c for full control.
                  </p>
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

function ChartCard({ id, title, data, color }: { id: string; title: string; data: Array<{ x: number; y: number }>; color: string }) {
  return (
    <div id={id} className="mb-4 rounded-xl border border-accent-dim p-3">
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
