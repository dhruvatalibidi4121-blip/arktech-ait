import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'
import { CalendarClock, Eye, Flag, Sun } from 'lucide-react'
import type { PhenologyPoint, PhenologyMilestone, ObservationPass, CropType } from '../types'
import { getPhenology } from '../api/services'
import { Panel, PageHeader, LoadingState, ErrorState, DemoBadge, StatCard } from '../components/ui'
import { CROP_COLORS } from '../data/fields'

const STAGES = [
  { name: 'Sowing / Emergence', window: [0.02, 0.12] },
  { name: 'Vegetative Growth', window: [0.12, 0.45] },
  { name: 'Flowering', window: [0.45, 0.62] },
  { name: 'Maturity', window: [0.62, 0.85] },
  { name: 'Harvest', window: [0.85, 1.0] },
] as const

export default function Phenology() {
  const [series, setSeries] = useState<PhenologyPoint[] | null>(null)
  const [milestones, setMilestones] = useState<PhenologyMilestone[] | null>(null)
  const [observations, setObservations] = useState<ObservationPass[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cropSel, setCropSel] = useState<'both' | CropType>('both')

  const load = () => {
    setError(null)
    setSeries(null)
    getPhenology()
      .then((b) => {
        setSeries(b.series)
        setMilestones(b.milestones)
        setObservations(b.observations)
      })
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [])

  const current = useMemo(
    () => milestones?.find((m) => (cropSel === 'both' ? true : m.crop === cropSel)),
    [milestones, cropSel],
  )

  const stageBands = useMemo(() => {
    if (!current) return []
    const sos = new Date(current.sos).getTime()
    const eos = new Date(current.eos).getTime()
    const peak = new Date(current.peak).getTime()
    const t = (d: string) => (new Date(d).getTime() - sos) / (eos - sos)
    return STAGES.map((s) => ({
      name: s.name,
      x1: s.window[0] === 0.02 ? undefined : sos + (eos - sos) * s.window[0],
      x2: eos - (eos - sos) * (1 - s.window[1]),
      // flag positions
      sos,
      peak,
      eos,
      tSos: t(current.sos),
      tPeak: t(current.peak),
      tEos: 1,
    }))
  }, [current])

  return (
    <div>
      <PageHeader
        eyebrow="CROP GROWTH & PHENOLOGICAL INTELLIGENCE"
        title="Phenology Monitoring"
        description="NDVI/NDWI time-series phenology for rice and sugarcane with SOS, peak vegetation, EOS and growing-period length derived from multi-satellite acquisitions."
        right={<DemoBadge />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (!series || !milestones || !observations) ? (
        <LoadingState label="Assembling NDVI time-series..." />
      ) : (
        series &&
        milestones &&
        observations && (
          <>
            {/* Crop selector */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {(['both', 'Rice', 'Sugarcane'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCropSel(c)}
                  className={`rounded px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition ${
                    cropSel === c
                      ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c === 'both' ? 'All crops' : c}
                </button>
              ))}
            </div>

            {/* Milestone cards */}
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              {milestones
                .filter((m) => cropSel === 'both' || m.crop === cropSel)
                .map((m) => (
                  <Panel
                    key={m.crop}
                    title={`${m.crop} phenology`}
                    subtitle={`Current stage · ${m.currentStage}`}
                  >
                    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                      {(
                        [
                          ['SOS', m.sos],
                          ['PEAK', m.peak],
                          ['EOS', m.eos],
                          ['LGP', `${m.lgd} d`],
                        ] as const
                      ).map(([k, v], i) => (
                        <div key={k} className="rounded border border-white/5 bg-white/[0.03] p-2.5">
                          <p className="flex items-center gap-1 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                            {i === 0 && <Flag size={10} className="text-emerald-400" />}
                            {i === 1 && <Sun size={10} className="text-amber-400" />}
                            {i === 3 && <CalendarClock size={10} className="text-cyan-400" />}
                            {k}
                          </p>
                          <p className="tabular mt-1 font-mono text-[13px] font-bold text-slate-100">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-white/5 px-4 py-2.5">
                      <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-amber-400"
                          style={{ left: '2%', right: '4%' }}
                        />
                      </div>
                      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-slate-500">
                        <span>SOS {m.sos.slice(5)}</span>
                        <span>PEAK {m.peak.slice(5)}</span>
                        <span>EOS {m.eos.slice(5)}</span>
                      </div>
                    </div>
                  </Panel>
                ))}
            </div>

            {/* NDVI chart */}
            <Panel
              title="NDVI / NDWI time-series · 8-day composites"
              subtitle="Sentinel-2 + Resourcesat + MODIS fusion · Kharif 2026 (demo)"
              className="mb-4"
            >
              <div className="h-[380px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="doy"
                      type="number"
                      domain={[1, 365]}
                      tickFormatter={(d: number) => `D${d}`}
                      tick={{ fill: '#7d8fa8', fontSize: 10 }}
                      axisLine={{ stroke: '#1d3350' }}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 1]} tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                      labelFormatter={(d) => `DOY ${d}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    {/* stage bands for current selection */}
                    {cropSel !== 'Sugarcane' &&
                      stageBands.map((b, i) => {
                        const rice = milestones.find((m) => m.crop === 'Rice')!
                        const sos = new Date(rice.sos).getTime()
                        const eos = new Date(rice.eos).getTime()
                        const day = (f: number) => {
                          const dt = new Date(sos + (eos - sos) * f)
                          const start = new Date(dt.getFullYear(), 0, 0)
                          return Math.floor((dt.getTime() - start.getTime()) / 86400000)
                        }
                        if (i === 0) return null
                        return (
                          <ReferenceArea
                            key={b.name}
                            x1={day(b.tSos + (b.tEos - b.tSos) * STAGES[i].window[0])}
                            x2={day(b.tSos + (b.tEos - b.tSos) * STAGES[i].window[1])}
                            fill={i % 2 ? '#22d3ee' : '#34d399'}
                            fillOpacity={0.05}
                            label={{ value: b.name, fill: '#5b7290', fontSize: 9, position: 'insideTop' }}
                          />
                        )
                      })}
                    {cropSel !== 'Sugarcane' && (
                      <Line type="monotone" dataKey="ndviRice" name="Rice NDVI" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    )}
                    {cropSel !== 'Sugarcane' && (
                      <Line type="monotone" dataKey="ndwiRice" name="Rice NDWI" stroke="#38bdf8" strokeWidth={1.2} strokeDasharray="5 4" dot={false} />
                    )}
                    {cropSel !== 'Rice' && (
                      <Line type="monotone" dataKey="ndviSugarcane" name="Sugarcane NDVI" stroke="#16a34a" strokeWidth={2} dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <div className="grid gap-4 xl:grid-cols-2">
              {/* Observation timeline */}
              <Panel title="Satellite observation timeline" subtitle="Recent acquisition log (demo)">
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-white/5 text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                        <th className="px-4 py-2">Date</th>
                        <th className="px-2 py-2">Satellite</th>
                        <th className="px-2 py-2">Sensor</th>
                        <th className="px-2 py-2">Res.</th>
                        <th className="px-2 py-2">Cloud</th>
                        <th className="px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map((o) => (
                        <tr key={`${o.date}-${o.satellite}`} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="tabular px-4 py-2 font-mono text-slate-300">{o.date}</td>
                          <td className="px-2 py-2 text-slate-200">{o.satellite}</td>
                          <td className="px-2 py-2 text-slate-400">{o.sensor}</td>
                          <td className="tabular px-2 py-2 font-mono text-slate-400">{o.resolution}</td>
                          <td className="tabular px-2 py-2 font-mono text-slate-400">{o.cloudPct}%</td>
                          <td className="px-4 py-2">
                            <span
                              className={`rounded px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase ${
                                o.status === 'Acquired'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : o.status === 'Processing'
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'bg-cyan-500/10 text-cyan-400'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Stage tracker */}
              <Panel title="Current growth stage tracker" subtitle="Phenology-derived stage classification (demo)">
                <div className="space-y-3 p-4">
                  {milestones
                    .filter((m) => cropSel === 'both' || m.crop === cropSel)
                    .map((m) => {
                      const stageIdx = STAGES.findIndex((s) => s.name === m.currentStage)
                      return (
                        <div key={m.crop} className="rounded border border-white/5 bg-white/[0.02] p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-200">
                              <span className="h-2 w-2 rounded-sm" style={{ background: CROP_COLORS[m.crop] }} />
                              {m.crop}
                            </span>
                            <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] tracking-widest text-emerald-400 uppercase">
                              {m.currentStage}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {STAGES.map((s, i) => (
                              <div key={s.name} className="flex-1 text-center">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    i <= stageIdx ? (i === stageIdx ? 'bg-emerald-400' : 'bg-emerald-600/60') : 'bg-white/8'
                                  }`}
                                />
                                <p className={`mt-1 text-[8px] leading-tight ${i === stageIdx ? 'text-emerald-300' : 'text-slate-600'}`}>
                                  {s.name.split(' / ')[0]}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  <div className="grid grid-cols-3 gap-2">
                    <StatCard label="Passes Used" value="46" accent="cyan" sub="2026 season" />
                    <StatCard label="Mean NDVI Err" value="±0.02" accent="green" sub="vs field truth" />
                    <StatCard label="Stage F1" value="0.93" accent="blue" sub="5-class" />
                  </div>
                  <p className="flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                    <Eye size={10} /> Next acquisition: 2026-11-14 · Sentinel-1A
                  </p>
                </div>
              </Panel>
            </div>
          </>
        )
      )}
    </div>
  )
}
