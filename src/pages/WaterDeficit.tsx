import { useEffect, useMemo, useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Droplets, CloudRain, Gauge, AlertTriangle, Droplet, Save, MapPin, Layers3 } from 'lucide-react'
import type { FieldRecord, WaterDeficitPoint, MapLayerId } from '../types'
import { getWaterDeficit, getFields } from '../api/services'
import { useAppState } from '../state/AppState'
import SatelliteMap from '../components/SatelliteMap'
import { Panel, PageHeader, LoadingState, ErrorState, DemoBadge, StatCard, ProgressBar } from '../components/ui'
import { ADVISORY_COLORS } from '../data/fields'

function category(deficit: number, t: { noneMax: number; lightMax: number; moderateMax: number }) {
  if (deficit <= t.noneMax) return { label: 'No irrigation', color: ADVISORY_COLORS.None }
  if (deficit <= t.lightMax) return { label: 'Light irrigation', color: ADVISORY_COLORS.Light }
  if (deficit <= t.moderateMax) return { label: 'Moderate irrigation', color: ADVISORY_COLORS.Moderate }
  return { label: 'Urgent irrigation', color: ADVISORY_COLORS.Urgent }
}

export default function WaterDeficit() {
  const { settings } = useAppState()
  const [series, setSeries] = useState<WaterDeficitPoint[] | null>(null)
  const [fields, setFields] = useState<FieldRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [layer, setLayer] = useState<MapLayerId>('advisory')

  const load = () => {
    setError(null)
    setSeries(null)
    setFields(null)
    Promise.all([getWaterDeficit(), getFields()])
      .then(([w, f]) => {
        setSeries(w.series)
        setFields(f)
      })
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [])

  const totals = useMemo(() => {
    if (!fields) return null
    const req = fields.filter((f) => f.waterDeficitMm > settings.thresholds.noneMax)
    const totalWaterMl = req.reduce((s, f) => s + (f.irrigationRequirementMm * f.areaHa) / 100, 0)
    return {
      req,
      totalDeficit: req.reduce((s, f) => s + f.waterDeficitMm, 0) / (req.length || 1),
      totalWaterMl,
      urgent: req.filter((f) => f.waterDeficitMm > settings.thresholds.moderateMax),
      savingPotential: req.length * 4.6,
    }
  }, [fields, settings.thresholds])

  return (
    <div>
      <PageHeader
        eyebrow="8-DAY CROP WATER DEFICIT INTELLIGENCE"
        title="Water Deficit & Irrigation Advisory"
        description="Field-wise ETc/ETa/rainfall balance at 8-day intervals with phenology-aware deficit estimation and advisory generation. Thresholds are configurable in Settings."
        right={<DemoBadge />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (!series || !fields) ? (
        <LoadingState label="Computing 8-day water balance..." />
      ) : (
        series &&
        fields &&
        totals && (
          <>
            {/* Water balance KPIs */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Crop ET (ETc)" value={series[series.length - 1].etc} unit="mm/8d" icon={<Gauge size={13} />} accent="cyan" />
              <StatCard label="Actual ET (ETa)" value={series[series.length - 1].eta} unit="mm/8d" icon={<Droplets size={13} />} accent="blue" />
              <StatCard label="Rainfall" value={series[series.length - 1].rainfall} unit="mm/8d" icon={<CloudRain size={13} />} accent="green" trend="-4 mm vs last cycle" />
              <StatCard label="Crop Water Req." value="186" unit="mm/season" icon={<Layers3 size={13} />} accent="amber" />
              <StatCard label="Water Deficit" value={series[series.length - 1].deficit} unit="mm/8d" icon={<AlertTriangle size={13} />} accent="orange" trend="+3.5 mm vs last cycle" />
              <StatCard label="Irrigation Req." value={series[series.length - 1].irrigationReq} unit="mm/8d" icon={<Droplet size={13} />} accent="red" sub="net of effective rain" />
            </div>

            {/* Advisory map + category summary */}
            <div className="mb-4 grid gap-4 xl:grid-cols-[1fr_320px]">
              <Panel title="Irrigation advisory map · field polygons" subtitle="Coloured by 8-day advisory category">
                <SatelliteMap
                  fields={fields}
                  layer={layer}
                  onLayerChange={setLayer}
                  center={[12.522, 76.895]}
                  zoom={13}
                  height="480px"
                />
              </Panel>

              <div className="space-y-4">
                <Panel title="Advisory categories" subtitle="Configurable thresholds (demo)">
                  <div className="space-y-3 p-4">
                    {(
                      [
                        ['None', `0–${settings.thresholds.noneMax} mm`, ADVISORY_COLORS.None],
                        ['Light', `${settings.thresholds.noneMax}–${settings.thresholds.lightMax} mm`, ADVISORY_COLORS.Light],
                        ['Moderate', `${settings.thresholds.lightMax}–${settings.thresholds.moderateMax} mm`, ADVISORY_COLORS.Moderate],
                        ['Urgent', `> ${settings.thresholds.moderateMax} mm`, ADVISORY_COLORS.Urgent],
                      ] as const
                    ).map(([label, range, color]) => {
                      const n = fields.filter((f) => f.advisory === label).length
                      return (
                        <div key={label} className="rounded border border-white/5 bg-white/[0.02] p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color }}>
                              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                              {label} irrigation
                            </span>
                            <span className="tabular font-mono text-[12px] text-slate-300">{n} fields</span>
                          </div>
                          <p className="mt-0.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                            Deficit {range}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
                <Panel title="Deficit severity" subtitle="Mean deficit of fields requiring irrigation">
                  <div className="p-4">
                    <p className="tabular font-mono text-3xl font-bold text-orange-400">
                      {totals.totalDeficit.toFixed(1)}
                      <span className="ml-1 text-sm font-medium text-slate-400">mm</span>
                    </p>
                    <div className="mt-2">
                      <ProgressBar value={(totals.totalDeficit / 60) * 100} color="#f97316" />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {totals.req.length} of {fields.length} monitored fields exceed the no-irrigation
                      threshold ({settings.thresholds.noneMax} mm) this cycle.
                    </p>
                  </div>
                </Panel>
              </div>
            </div>

            {/* 8-day chart */}
            <Panel title="8-day water balance time-series" subtitle="ETc · ETa · rainfall · deficit (demo series)" className="mb-4">
              <div className="h-[320px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={series} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
                    <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                    <YAxis unit=" mm" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                      formatter={(v, n) => [`${v} mm`, n]}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="rainfall" name="Rainfall" fill="#3b82f6" fillOpacity={0.7} radius={[3, 3, 0, 0]} barSize={14} />
                    <Bar dataKey="etc" name="ETc" fill="#22d3ee" fillOpacity={0.5} radius={[3, 3, 0, 0]} barSize={14} />
                    <Bar dataKey="eta" name="ETa" fill="#818cf8" fillOpacity={0.55} radius={[3, 3, 0, 0]} barSize={14} />
                    <Line type="monotone" dataKey="deficit" name="Water deficit" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="irrigationReq" name="Irrigation requirement" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            {/* SMART IRRIGATION RECOMMENDATIONS */}
            <Panel title="SMART IRRIGATION RECOMMENDATIONS" subtitle="Generated from the current 8-day deficit cycle (demo)">
              <div className="grid gap-4 p-4 lg:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-300 uppercase">
                    <Droplet size={13} className="text-cyan-400" /> Fields requiring irrigation
                  </p>
                  <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {totals.req.map((f) => {
                      const c = category(f.waterDeficitMm, settings.thresholds)
                      return (
                        <li key={f.id} className="flex items-center justify-between rounded border border-white/5 px-2.5 py-2 text-[11px]">
                          <span>
                            <span className="font-mono font-bold text-slate-200">{f.id}</span>
                            <span className="ml-2 text-slate-400">{f.crop}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="tabular font-mono text-orange-300">{f.waterDeficitMm} mm</span>
                            <span className="h-2 w-2 rounded-sm" style={{ background: c.color }} />
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                  <p className="mt-2 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                    {totals.req.length} fields · priority sorted in advisory console
                  </p>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-300 uppercase">
                    <Save size={13} className="text-emerald-400" /> Water budget & savings
                  </p>
                  <div className="space-y-3 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total irrigation demand</span>
                      <span className="tabular font-mono font-bold text-slate-100">{totals.totalWaterMl.toFixed(0)} ML</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Water-saving opportunity</span>
                      <span className="tabular font-mono font-bold text-emerald-400">{totals.savingPotential.toFixed(0)} ML</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Deficit irrigation on mild-stress sugarcane fields (threshold-based scheduling) can
                      save ~{totals.savingPotential.toFixed(0)} ML (~8%) this cycle without yield impact.
                    </p>
                    <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-300">
                      Canal rotation advised: irrigate urgent-category fields first, shift light-category
                      fields to the next 4-day window.
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <p className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-slate-300 uppercase">
                    <MapPin size={13} className="text-red-400" /> High-priority locations
                  </p>
                  <ul className="space-y-2">
                    {totals.urgent.slice(0, 5).map((f) => (
                      <li key={f.id} className="rounded border border-red-500/15 bg-red-500/5 p-2.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-100">{f.id}</span>
                          <span className="tabular font-mono font-bold text-red-400">{f.waterDeficitMm} mm</span>
                        </div>
                        <p className="mt-0.5 text-slate-400">
                          {f.crop} · {f.stage} · {f.areaHa} ha
                        </p>
                        <p className="font-mono text-[9px] text-slate-500">
                          {f.lat.toFixed(4)}° N {f.lon.toFixed(4)}° E
                        </p>
                      </li>
                    ))}
                    {totals.urgent.length === 0 && (
                      <li className="text-[11px] text-slate-500">No urgent fields this cycle.</li>
                    )}
                  </ul>
                </div>
              </div>
            </Panel>
          </>
        )
      )}
    </div>
  )
}
