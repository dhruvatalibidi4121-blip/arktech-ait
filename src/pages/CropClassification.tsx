import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts'
import { Brain, Layers3, CheckCircle2, Sigma } from 'lucide-react'
import type { CropClassSummary, ClassificationMeta } from '../types'
import { getCropClassification } from '../api/services'
import { IMAGERY } from '../config/imagery'
import { generateClassificationRaster } from '../components/raster'
import { Panel, PageHeader, LoadingState, ErrorState, DemoBadge, ProgressBar, StatCard } from '../components/ui'

const DATE_COMPARISON = [
  { date: '2026-06-08', Sugarcane: 3.2, Rice: 1.1, OtherCrops: 0.9, Fallow: 6.4 },
  { date: '2026-07-08', Sugarcane: 4.1, Rice: 4.6, OtherCrops: 1.2, Fallow: 4.8 },
  { date: '2026-08-08', Sugarcane: 5.4, Rice: 9.8, OtherCrops: 1.6, Fallow: 2.9 },
  { date: '2026-09-08', Sugarcane: 6.6, Rice: 12.1, OtherCrops: 2.0, Fallow: 1.8 },
  { date: '2026-10-08', Sugarcane: 7.4, Rice: 12.6, OtherCrops: 2.2, Fallow: 1.6 },
  { date: '2026-11-08', Sugarcane: 7.8, Rice: 12.4, OtherCrops: 2.4, Fallow: 1.7 },
]

export default function CropClassification() {
  const [summary, setSummary] = useState<CropClassSummary[] | null>(null)
  const [meta, setMeta] = useState<ClassificationMeta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0.55)
  const [view, setView] = useState<'rgb' | 'class'>('class')

  const load = () => {
    setError(null)
    setSummary(null)
    setMeta(null)
    getCropClassification()
      .then((b) => {
        setSummary(b.summary)
        setMeta(b.meta)
      })
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [])

  const raster = generateClassificationRaster(5, 256)

  return (
    <div>
      <PageHeader
        eyebrow="MULTI-TEMPORAL CROP INTELLIGENCE"
        title="Crop Classification"
        description="Multi-temporal AI classification of crop types using optical spectral signatures fused with SAR structure. Click the map imagery to compare optical RGB against the classified product."
        right={<DemoBadge />}
      />

      {error && <ErrorState message={error} onRetry={load} />}

      {!error && (!summary || !meta) ? (
        <LoadingState label="Running multi-temporal inference..." />
      ) : (
        summary &&
        meta && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Overall Accuracy" value={meta.overallAccuracy} unit="%" accent="green" icon={<CheckCircle2 size={13} />} />
              <StatCard label="Kappa Coefficient" value={meta.kappa} accent="cyan" icon={<Sigma size={13} />} />
              <StatCard label="Training Samples" value={meta.trainedSamples.toLocaleString()} accent="blue" icon={<Brain size={13} />} />
              <StatCard label="Classes Mapped" value={summary.length} accent="amber" icon={<Layers3 size={13} />} />
            </div>

            {/* Image + overlay */}
            <Panel
              title="Classification product · Sentinel-2 optical base"
              subtitle="Toggle optical RGB / classified overlay · DEMO classification raster"
              className="mb-4"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
                <img
                  src={IMAGERY.sentinel2Farms}
                  alt="Copernicus Sentinel-2 agricultural mosaic"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {view === 'class' && (
                  <img
                    src={raster}
                    alt="Classified crop raster"
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                    style={{ opacity: overlayOpacity }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {(
                    [
                      ['rgb', 'OPTICAL RGB'],
                      ['class', 'CLASSIFICATION'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      className={`rounded px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] backdrop-blur transition ${
                        view === id
                          ? 'bg-cyan-500/25 text-cyan-200 ring-1 ring-cyan-400/50'
                          : 'bg-navy-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {view === 'class' && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded glass-strong px-3 py-2">
                    <span className="font-mono text-[9px] tracking-widest text-slate-400 uppercase">Overlay</span>
                    <input
                      type="range"
                      min={0.15}
                      max={0.9}
                      step={0.05}
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                      className="w-24 accent-cyan-400"
                      aria-label="Classification overlay opacity"
                    />
                    <span className="tabular font-mono text-[10px] text-cyan-300">{Math.round(overlayOpacity * 100)}%</span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
                  {summary.map((c) => (
                    <span
                      key={c.crop}
                      className="flex items-center gap-1.5 rounded glass-strong px-2 py-1 text-[10px] text-slate-200"
                    >
                      <span className="h-2 w-2 rounded-sm" style={{ background: c.color }} />
                      {c.crop}
                    </span>
                  ))}
                </div>
              </div>
            </Panel>

            <div className="grid gap-4 xl:grid-cols-3">
              {/* Area stats + donut */}
              <Panel title="Crop area statistics" subtitle="Classified area & confidence (demo)">
                <div className="p-4">
                  <div className="h-[190px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary}
                          dataKey="areaHa"
                          nameKey="crop"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          stroke="#0a1220"
                          strokeWidth={2}
                        >
                          {summary.map((c) => (
                            <Cell key={c.crop} fill={c.color} />
                          ))}
                        </Pie>
                        <RTooltip
                          contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                          formatter={(v, n) => [`${Number(v).toLocaleString()} ha`, n]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {summary.map((c) => (
                      <div key={c.crop}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="h-2 w-2 rounded-sm" style={{ background: c.color }} />
                            {c.crop}
                          </span>
                          <span className="tabular font-mono text-slate-400">
                            {c.areaHa.toLocaleString()} ha · {c.pct}%
                          </span>
                        </div>
                        <div className="mt-1">
                          <ProgressBar value={c.confidencePct} color={c.color} />
                        </div>
                        <p className="mt-0.5 text-right font-mono text-[9px] text-slate-500">
                          conf {c.confidencePct}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>

              {/* Model info + confusion matrix */}
              <Panel title="Model information" subtitle={meta.algorithm}>
                <div className="space-y-4 p-4">
                  <div>
                    <p className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
                      Feature vector
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.features.map((f) => (
                        <span
                          key={f}
                          className="rounded border border-cyan-500/20 bg-cyan-500/8 px-1.5 py-0.5 font-mono text-[9px] text-cyan-300"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
                      Confusion matrix · row = actual, col = predicted
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[380px] border-collapse text-[10px]">
                        <thead>
                          <tr>
                            <th className="border border-white/5 bg-white/[0.03] px-1.5 py-1 font-mono text-slate-500">
                              ACT \ PRED
                            </th>
                            {summary.map((c) => (
                              <th key={c.crop} className="border border-white/5 px-1.5 py-1 font-medium text-slate-300">
                                {c.crop === 'Other Crops' ? 'Other' : c.crop === 'Fallow Land' ? 'Fallow' : c.crop}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {meta.confusion.map((row, ri) => (
                            <tr key={row.actual}>
                              <td className="border border-white/5 bg-white/[0.03] px-1.5 py-1 text-slate-300">
                                {row.actual === 'Other Crops' ? 'Other' : row.actual === 'Fallow Land' ? 'Fallow' : row.actual}
                              </td>
                              {row.row.map((v, ci) => (
                                <td
                                  key={ci}
                                  className="border border-white/5 px-1.5 py-1 text-center tabular font-mono"
                                  style={{
                                    background: `rgba(34,211,238,${(v / 100) * 0.35})`,
                                    color: v > 85 ? '#34d399' : v > 60 ? '#e2e8f0' : '#94a3b8',
                                    fontWeight: ri === ci ? 700 : 400,
                                  }}
                                >
                                  {v}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                    Season {meta.season} · 5.8 m LISS-IV reference labels
                  </p>
                </div>
              </Panel>

              {/* Date-wise comparison */}
              <Panel title="Date-wise crop comparison" subtitle="Classified area per pass · 1000 ha (demo)">
                <div className="h-[300px] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DATE_COMPARISON} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                      <YAxis tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RTooltip
                        contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="Sugarcane" stackId="1" stroke="#16a34a" fill="#16a34a" fillOpacity={0.35} />
                      <Area type="monotone" dataKey="Rice" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
                      <Area type="monotone" dataKey="OtherCrops" name="Other Crops" stackId="1" stroke="#a3a86b" fill="#a3a86b" fillOpacity={0.35} />
                      <Area type="monotone" dataKey="Fallow" name="Fallow Land" stackId="1" stroke="#92764a" fill="#92764a" fillOpacity={0.35} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Panel>
            </div>

            {/* Confidence bars wide */}
            <Panel title="Per-class classification confidence" subtitle="Hold-out validation (demo)" className="mt-4">
              <div className="h-[220px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="crop" tick={{ fill: '#9db2cc', fontSize: 11 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <RTooltip
                      contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }}
                      formatter={(v) => [`${v}%`, 'Confidence']}
                    />
                    <Bar dataKey="confidencePct" name="Confidence" radius={[3, 3, 0, 0]}>
                      {summary.map((c) => (
                        <Cell key={c.crop} fill={c.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </>
        )
      )}
    </div>
  )
}
