import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Map as MapIcon, Tractor, Leaf, AlertTriangle, Droplets, BellRing, Satellite } from 'lucide-react'
import type { FieldRecord, MapLayerId, DashboardKpis } from '../types'
import { getDashboard, getFields } from '../api/services'
import { LOCATIONS } from '../data/fields'
import { useAppState } from '../state/AppState'
import SatelliteMap from '../components/SatelliteMap'
import { Panel, StatCard, LoadingState, ErrorState, DemoBadge, LiveBadge } from '../components/ui'
import { CROP_COLORS, STRESS_COLORS } from '../data/fields'

export default function Dashboard() {
  const { settings } = useAppState()
  const [layer, setLayer] = useState<MapLayerId>('classification')
  const [fields, setFields] = useState<FieldRecord[] | null>(null)
  const [kpis, setKpis] = useState<DashboardKpis | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    setFields(null)
    setKpis(null)
    Promise.all([getFields({ location: settings.location }), getDashboard({ location: settings.location, season: settings.season })])
      .then(([f, k]) => {
        setFields(f)
        setKpis(k)
      })
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [settings.location, settings.season])

  const location = LOCATIONS.find((l) => l.id === settings.location) ?? LOCATIONS[0]

  const cropMix = useMemo(() => {
    if (!fields) return []
    const m = new Map<string, number>()
    fields.forEach((f) => m.set(f.crop, (m.get(f.crop) ?? 0) + f.areaHa))
    return [...m.entries()].map(([crop, ha]) => ({ crop, ha }))
  }, [fields])

  const stressMix = useMemo(() => {
    if (!fields) return []
    const order = ['Healthy', 'Mild Stress', 'Moderate Stress', 'Severe Stress']
    const m = new Map<string, number>()
    fields.forEach((f) => m.set(f.stress, (m.get(f.stress) ?? 0) + 1))
    return order.map((s) => ({ stress: s, count: m.get(s) ?? 0 }))
  }, [fields])

  const trend = useMemo(
    () => [
      { w: 'W-6', deficit: 9.1 },
      { w: 'W-5', deficit: 12.6 },
      { w: 'W-4', deficit: 17.4 },
      { w: 'W-3', deficit: 21.9 },
      { w: 'W-2', deficit: 25.2 },
      { w: 'W-1', deficit: 26.4 },
      { w: 'Now', deficit: 27.8 },
    ],
    [],
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-400 uppercase">
            <Satellite size={12} />
            ARKTECH / AGRICULTURAL INTELLIGENCE
          </p>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
            Operational Intelligence Dashboard
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
            {location.label}
            <span className="font-mono text-[10px] text-slate-600">·</span>
            <span className="font-mono text-[11px] text-slate-500">{kpis?.lastPass}</span>
            <LiveBadge label="LIVE PASS FEED (DEMO)" />
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge />
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (!fields || !kpis) ? (
        <LoadingState label="Acquiring dashboard products..." />
      ) : (
        kpis &&
        fields && (
          <>
            {/* KPI row */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Monitored Area" value={kpis.totalMonitoredHa.toLocaleString()} unit="ha" icon={<MapIcon size={13} />} accent="cyan" sub="+2.4% vs last season" />
              <StatCard label="Identified Crop Types" value={kpis.identifiedCropTypes} icon={<Tractor size={13} />} accent="green" sub="4-class scheme" />
              <StatCard label="Healthy Vegetation" value={kpis.healthyVegetationPct} unit="%" icon={<Leaf size={13} />} accent="green" trend="-3.2% from Oct" />
              <StatCard label="Moisture-Stressed Area" value={kpis.stressedAreaHa.toLocaleString()} unit="ha" icon={<AlertTriangle size={13} />} accent="orange" trend="+6.8% from Oct" />
              <StatCard label="Est. Water Deficit" value={kpis.waterDeficitMm} unit="mm" icon={<Droplets size={13} />} accent="amber" trend="+1.4 mm from W-1" />
              <StatCard label="Fields Needing Irrigation" value={kpis.fieldsRequiringIrrigation} unit={`/${fields.length}`} icon={<BellRing size={13} />} accent="red" sub="next 8-day cycle" />
            </div>

            {/* Map + side column */}
            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
              <Panel
                title="Main satellite map · Mandya AOI"
                subtitle={`Field polygons · ${fields.length} parcels · cloud cover ${kpis.cloudCoverPct}%`}
                className="min-h-[520px]"
              >
                <SatelliteMap
                  fields={fields}
                  layer={layer}
                  onLayerChange={setLayer}
                  center={location.center}
                  zoom={location.zoom}
                  height="560px"
                />
              </Panel>

              <div className="space-y-4">
                <Panel title="Crop mix" subtitle="Classified area share (demo)">
                  <div className="space-y-2.5 p-4">
                    {cropMix.map((c) => (
                      <div key={c.crop}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="h-2 w-2 rounded-sm" style={{ background: CROP_COLORS[c.crop as keyof typeof CROP_COLORS] }} />
                            {c.crop}
                          </span>
                          <span className="tabular font-mono text-slate-400">{c.ha.toLocaleString()} ha</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(c.ha / (fields.reduce((s, f) => s + f.areaHa, 0) || 1)) * 100}%`,
                              background: CROP_COLORS[c.crop as keyof typeof CROP_COLORS],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Stress distribution" subtitle="Field count by stress class">
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {stressMix.map((s) => (
                      <div key={s.stress} className="rounded border border-white/5 bg-white/[0.03] p-2.5 text-center">
                        <p className="tabular font-mono text-lg font-bold" style={{ color: STRESS_COLORS[s.stress as keyof typeof STRESS_COLORS] }}>
                          {s.count}
                        </p>
                        <p className="text-[10px] text-slate-400">{s.stress}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="8-day deficit trend" subtitle="District mean · mm (demo)">
                  <div className="h-[130px] p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trend} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                        <defs>
                          <linearGradient id="defGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
                        <XAxis dataKey="w" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                        <YAxis tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <RTooltip
                          contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                          formatter={(v) => [`${v} mm`, 'Deficit']}
                        />
                        <Area type="monotone" dataKey="deficit" stroke="#f97316" strokeWidth={2} fill="url(#defGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
