import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { Waves, Radar, Image as ImageIcon, TrendingDown } from 'lucide-react'
import type { StressPoint, GrowthStage } from '../types'
import { getMoistureStress } from '../api/services'
import { IMAGERY } from '../config/imagery'
import { generateIndexRaster } from '../components/raster'
import { Panel, PageHeader, LoadingState, ErrorState, DemoBadge, StatCard, LiveBadge } from '../components/ui'
import { STRESS_COLORS } from '../data/fields'

const STAGE_INFO: { id: GrowthStage; title: string; note: string }[] = [
  {
    id: 'Vegetative Growth',
    title: 'Vegetative Stage',
    note: 'NDVI anomaly indicates canopy development against seasonal baseline. Early stress here compounds yield loss — flag fields with SMI < 0.3.',
  },
  {
    id: 'Flowering',
    title: 'Flowering Stage',
    note: 'Critical moisture-sensitive window. Monitor stress every 8 days; SAR VV drop below -18 dB combined with VCI < 0.4 escalates priority.',
  },
  {
    id: 'Maturity',
    title: 'Maturity Stage',
    note: 'Persistent vegetation + moisture stress detection distinguishes natural senescence from drought-induced decline before harvest.',
  },
]

const VIZ = [
  {
    id: 'ndvi-anomaly',
    title: 'NDVI Anomaly',
    desc: 'Departure from multi-year seasonal mean NDVI',
    source: 'Sentinel-2 / MODIS · DEMO',
    raster: 'stress' as const,
    stats: [['Min', '-0.34'], ['Mean', '-0.12'], ['Max', '+0.21']],
    accent: '#34d399',
  },
  {
    id: 'ndwi',
    title: 'NDWI',
    desc: 'Canopy water content proxy',
    source: 'Sentinel-2 NIR/SWIR · DEMO',
    raster: 'ndwi' as const,
    stats: [['Min', '-0.28'], ['Mean', '+0.09'], ['Max', '+0.47']],
    accent: '#38bdf8',
  },
  {
    id: 'vci',
    title: 'Vegetation Condition Index',
    desc: 'Scaled NDVI relative to historical range',
    source: 'MODIS composites · DEMO',
    raster: 'vci' as const,
    stats: [['Poor V2 area', '18.6%'], ['Fair', '39.2%'], ['Good', '42.2%']],
    accent: '#22d3ee',
  },
  {
    id: 'smi',
    title: 'Soil Moisture Index',
    desc: 'Optical-thermal + SAR surface moisture fusion',
    source: 'Sentinel-2 + EOS-04 · DEMO',
    raster: 'smi' as const,
    stats: [['Dry (<0.3)', '21.4%'], ['Moist', '58.7%'], ['Wet (>0.7)', '19.9%']],
    accent: '#818cf8',
  },
]

export default function MoistureStress() {
  const [series, setSeries] = useState<StressPoint[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState<GrowthStage>('Flowering')

  const load = () => {
    setError(null)
    setSeries(null)
    getMoistureStress()
      .then((b) => setSeries(b.series))
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [])

  const stageInfo = STAGE_INFO.find((s) => s.id === stage)!
  const sarVV = generateIndexRaster('sarvv', 42, 200)
  const sarVH = generateIndexRaster('sarvh', 77, 200)

  return (
    <div>
      <PageHeader
        eyebrow="PHENOLOGY-AWARE MOISTURE STRESS INTELLIGENCE"
        title="Moisture Stress Detection"
        description="Multi-sensor moisture stress mapping: NDVI anomaly, NDWI, VCI, SMI and SAR backscatter, interpreted in the context of the crop growth stage."
        right={<DemoBadge />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && !series ? (
        <LoadingState label="Fusing optical + SAR stress indicators..." />
      ) : (
        series && (
          <>
            {/* Stage selector */}
            <Panel className="mb-4" title="Growth stage selector" subtitle={stageInfo.title}>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {STAGE_INFO.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStage(s.id)}
                      className={`rounded px-3.5 py-2 text-[12px] font-semibold transition ${
                        stage === s.id
                          ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                          : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
                <p className="mt-3 flex items-start gap-2 rounded border border-cyan-500/15 bg-cyan-500/5 p-3 text-[12px] leading-relaxed text-slate-300">
                  <Waves size={14} className="mt-0.5 shrink-0 text-cyan-400" />
                  {stageInfo.note}
                </p>
              </div>
            </Panel>

            {/* KPI row */}
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Healthy Area" value="61" unit="%" accent="green" icon={<Waves size={13} />} trend="-2.1% from Sep" />
              <StatCard label="Moderate Stress" value="14.8" unit="%" accent="orange" icon={<Waves size={13} />} trend="+1.9% from Sep" />
              <StatCard label="Severe Stress" value="6.3" unit="%" accent="red" icon={<TrendingDown size={13} />} trend="+0.7% from Sep" />
              <StatCard label="SAR VV District Mean" value="-17.0" unit="dB" accent="cyan" icon={<Radar size={13} />} sub="EOS-04 + Sentinel-1" />
            </div>

            {/* Four index visualizations */}
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              {VIZ.map((v) => (
                <Panel key={v.id} title={v.title} subtitle={v.desc} demo>
                  <div className="relative aspect-[16/8] w-full overflow-hidden">
                    <img
                      src={generateIndexRaster(v.raster, v.id.length * 31 + 9, 224)}
                      alt={`${v.title} demo raster`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 flex gap-3">
                      {v.stats.map(([k, val]) => (
                        <div key={k}>
                          <p className="tabular font-mono text-[12px] font-bold text-slate-100">{val}</p>
                          <p className="font-mono text-[8px] tracking-widest text-slate-400 uppercase">{k}</p>
                        </div>
                      ))}
                    </div>
                    <span className="absolute right-2 top-2 rounded bg-navy-950/70 px-1.5 py-0.5 font-mono text-[8px] tracking-widest text-amber-400 backdrop-blur">
                      {v.source}
                    </span>
                  </div>
                </Panel>
              ))}
            </div>

            {/* SAR pair + stage-wise stress */}
            <div className="mb-4 grid gap-4 xl:grid-cols-2">
              <Panel title="SAR backscatter · VV / VH" subtitle="EOS-04 + Sentinel-1 C-band · cloud-free (demo rasters)">
                <div className="grid grid-cols-2 gap-3 p-4">
                  {(
                    [
                      ['VV polarisation', sarVV, 'Soil / canopy structure'],
                      ['VH polarisation', sarVH, 'Volume scattering · biomass'],
                    ] as const
                  ).map(([title, src, sub]) => (
                    <div key={title}>
                      <div className="relative overflow-hidden rounded border border-white/10">
                        <img src={src} alt={title} className="aspect-square w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded bg-navy-950/70 px-1.5 py-0.5 font-mono text-[8px] tracking-widest text-cyan-300 backdrop-blur">
                          {title}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[10px] text-slate-500">{sub}</p>
                    </div>
                  ))}
                  <p className="col-span-2 font-mono text-[9px] leading-relaxed tracking-widest text-slate-600 uppercase">
                    Interpretation: VV drop &gt; 3 dB vs season mean flags surface drying; VH tracks canopy
                    biomass decline.
                  </p>
                </div>
              </Panel>

              <Panel title="Stage-wise moisture stress" subtitle={`Interpretation mode · ${stageInfo.title}`}>
                <div className="h-[280px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={series.map((p) => ({
                        period: p.period,
                        Healthy: stage === 'Maturity' ? Math.round(p.healthy * 1.08) : p.healthy,
                        'Mild Stress': p.mild,
                        'Moderate Stress': stage === 'Flowering' ? Math.round(p.moderate * 1.12) : p.moderate,
                        'Severe Stress': stage === 'Flowering' ? Math.round(p.severe * 1.18) : p.severe,
                      }))}
                      margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                    >
                      <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" tick={{ fill: '#7d8fa8', fontSize: 9 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                      <YAxis unit="%" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Healthy" stackId="s" fill={STRESS_COLORS.Healthy} />
                      <Bar dataKey="Mild Stress" stackId="s" fill={STRESS_COLORS['Mild Stress']} />
                      <Bar dataKey="Moderate Stress" stackId="s" fill={STRESS_COLORS['Moderate Stress']} />
                      <Bar dataKey="Severe Stress" stackId="s" fill={STRESS_COLORS['Severe Stress']} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* Optical vs SAR comparison */}
            <div className="mb-4 grid gap-4 xl:grid-cols-2">
              <Panel
                title="Optical observation · Sentinel-2"
                subtitle="True colour · clear-sky acquisitions only"
                action={<LiveBadge label="CLEAR SKY" />}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img src={IMAGERY.gangesSentinel2} alt="Sentinel-2 optical" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3">
                    <p className="text-[12px] font-semibold text-slate-100">NDVI anomaly: -0.12 · VCI 0.52</p>
                    <p className="font-mono text-[9px] text-slate-400">10 m MSI · limited by cloud in monsoon</p>
                  </div>
                </div>
              </Panel>
              <Panel
                title="SAR observation · Sentinel-1"
                subtitle="C-band VV+VH · penetrates cloud, all-weather"
                action={<LiveBadge label="ALL-WEATHER" />}
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img src={IMAGERY.sarScene} alt="Sentinel-1 SAR VV/VH" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3">
                    <p className="text-[12px] font-semibold text-slate-100">VV -16.9 dB · VH -25.3 dB</p>
                    <p className="font-mono text-[9px] text-slate-400">IW GRDH · soil moisture sensitivity</p>
                  </div>
                </div>
              </Panel>
            </div>

            {/* Stress over time */}
            <Panel title="Moisture stress over time" subtitle="Stressed-area share vs NDVI anomaly & SAR VV (demo)">
              <div className="h-[300px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                    <YAxis yAxisId="l" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="r" orientation="right" domain={[-24, -10]} tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line yAxisId="l" type="monotone" dataKey="moderate" name="Moderate stress %" stroke="#f97316" strokeWidth={2} dot={false} />
                    <Line yAxisId="l" type="monotone" dataKey="severe" name="Severe stress %" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="l" type="monotone" dataKey="ndviAnomaly" name="NDVI anomaly" stroke="#34d399" strokeWidth={1.5} dot={false} />
                    <Line yAxisId="r" type="monotone" dataKey="sarVVdB" name="SAR VV dB" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 border-t border-white/5 px-4 py-2">
                <ImageIcon size={11} className="text-slate-600" />
                <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                  NDVI anomaly correlated with SAR VV (r = 0.87) · demo statistics
                </p>
              </div>
            </Panel>
          </>
        )
      )}
    </div>
  )
}
