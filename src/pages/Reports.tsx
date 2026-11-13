import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  Legend,
} from 'recharts'
import {
  Download,
  FileText,
  Sprout,
  Activity,
  Waves,
  Droplets,
  Calendar,
  MapPin,
  Printer,
} from 'lucide-react'
import { REPORT_DEFS, CROP_SUMMARY, STRESS_SERIES, WATER_DEFICIT, PHENOLOGY } from '../data/datasets'
import { LOCATIONS, FIELDS, STRESS_COLORS, SEASONS } from '../data/fields'
import { Panel, PageHeader, DemoBadge, StatCard, EmptyState } from '../components/ui'
import type { CropType, ReportDef } from '../types'

const ICONS: Record<ReportDef['icon'], typeof FileText> = {
  crop: Sprout,
  phenology: Activity,
  stress: Waves,
  water: Droplets,
  advisory: FileText,
}

export default function Reports() {
  const [selected, setSelected] = useState<ReportDef['id']>('crop')
  const [from, setFrom] = useState('2026-09-01')
  const [to, setTo] = useState('2026-11-10')
  const [location, setLocation] = useState(LOCATIONS[0].id)
  const [crop, setCrop] = useState<'all' | CropType>('all')
  const [season, setSeason] = useState(SEASONS[0].id)

  const report = REPORT_DEFS.find((r) => r.id === selected)!
  const ReportIcon = ICONS[report.icon]

  const advisoryRows = useMemo(() => {
    if (selected !== 'advisory') return []
    return FIELDS.filter((f) => (crop === 'all' ? true : f.crop === crop))
      .slice(0, 12)
      .map((f) => ({
        id: f.id,
        crop: f.crop,
        deficit: f.waterDeficitMm,
        advisory: f.advisory,
      }))
  }, [selected, crop])

  const exportCsv = () => {
    let rows: string[][] = []
    let name = selected
    if (selected === 'crop') {
      rows = [['Crop', 'Area (ha)', 'Share %', 'Confidence %'], ...CROP_SUMMARY.map((c) => [c.crop, String(c.areaHa), String(c.pct), String(c.confidencePct)])]
    } else if (selected === 'phenology') {
      rows = [['DOY', 'Date', 'Rice NDVI', 'Sugarcane NDVI'], ...PHENOLOGY.filter((p) => p.doy >= 140 && p.doy <= 330).map((p) => [String(p.doy), p.date, String(p.ndviRice), String(p.ndviSugarcane)])]
    } else if (selected === 'stress') {
      rows = [['Period', 'Healthy %', 'Mild %', 'Moderate %', 'Severe %', 'SAR VV dB'], ...STRESS_SERIES.map((s) => [s.period, String(s.healthy), String(s.mild), String(s.moderate), String(s.severe), String(s.sarVVdB)])]
    } else if (selected === 'water') {
      rows = [['Period', 'ETc mm', 'ETa mm', 'Rainfall mm', 'Deficit mm'], ...WATER_DEFICIT.map((w) => [w.period, String(w.etc), String(w.eta), String(w.rainfall), String(w.deficit)])]
    } else {
      rows = [
        ['Field ID', 'Crop', 'Deficit (mm)', 'Advisory'],
        ...FIELDS.filter((f) => (crop === 'all' ? true : f.crop === crop)).map((f) => [f.id, f.crop, String(f.waterDeficitMm), f.advisory]),
      ]
      name = 'irrigation-advisory'
    }
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arktech-report-${name}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderPreview = () => {
    if (selected === 'crop') {
      return (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CROP_SUMMARY} dataKey="areaHa" nameKey="crop" innerRadius={50} outerRadius={85} stroke="#0a1220">
                  {CROP_SUMMARY.map((c) => (
                    <Cell key={c.crop} fill={c.color} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CROP_SUMMARY} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="crop" tick={{ fill: '#9db2cc', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
                <YAxis tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
                <Bar dataKey="areaHa" name="Area (ha)" radius={[3, 3, 0, 0]}>
                  {CROP_SUMMARY.map((c) => (
                    <Cell key={c.crop} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )
    }
    if (selected === 'phenology') {
      return (
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PHENOLOGY.filter((p) => p.doy >= 100 && p.doy <= 360)} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
              <XAxis dataKey="doy" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
              <YAxis domain={[0, 1]} tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="ndviRice" name="Rice NDVI" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ndviSugarcane" name="Sugarcane NDVI" stroke="#16a34a" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }
    if (selected === 'stress') {
      return (
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STRESS_SERIES} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
              <YAxis unit="%" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="healthy" name="Healthy" stackId="s" fill={STRESS_COLORS.Healthy} />
              <Bar dataKey="mild" name="Mild" stackId="s" fill={STRESS_COLORS['Mild Stress']} />
              <Bar dataKey="moderate" name="Moderate" stackId="s" fill={STRESS_COLORS['Moderate Stress']} />
              <Bar dataKey="severe" name="Severe" stackId="s" fill={STRESS_COLORS['Severe Stress']} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }
    if (selected === 'water') {
      return (
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={WATER_DEFICIT} margin={{ top: 8, right: 10, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="#1d3350" strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={{ stroke: '#1d3350' }} tickLine={false} />
              <YAxis tick={{ fill: '#7d8fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: '#0a1220', border: '1px solid #1d3350', fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="rainfall" name="Rainfall" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={12} />
              <Area type="monotone" dataKey="deficit" name="Deficit" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )
    }
    return advisoryRows.length ? (
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/5 text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <th className="px-4 py-2">Field</th>
              <th className="px-2 py-2">Crop</th>
              <th className="px-2 py-2">Deficit (mm)</th>
              <th className="px-4 py-2">Advisory</th>
            </tr>
          </thead>
          <tbody>
            {advisoryRows.map((r) => (
              <tr key={r.id} className="border-b border-white/[0.03]">
                <td className="px-4 py-2 font-mono font-bold text-slate-200">{r.id}</td>
                <td className="px-2 py-2 text-slate-300">{r.crop}</td>
                <td className="tabular px-2 py-2 font-mono text-orange-300">{r.deficit}</td>
                <td className="px-4 py-2 text-slate-300">{r.advisory}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState />
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="DISTRICT REPORTING CONSOLE"
        title="Reports & Analytics"
        description="Generate, preview and export season intelligence reports for authorities. All exports are built from the current demo dataset."
        right={<DemoBadge />}
      />

      {/* Filters */}
      <Panel className="mb-4">
        <div className="grid gap-3 p-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <Calendar size={10} /> From
            </span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <Calendar size={10} /> To
            </span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50" />
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <MapPin size={10} /> Location
            </span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50">
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <Sprout size={10} /> Crop
            </span>
            <select value={crop} onChange={(e) => setCrop(e.target.value as 'all' | CropType)} className="w-full rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50">
              <option value="all">All crops</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Rice">Rice</option>
              <option value="Fallow Land">Fallow Land</option>
              <option value="Other Crops">Other Crops</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 flex items-center gap-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              <Activity size={10} /> Season
            </span>
            <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50">
              {SEASONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {/* Report cards */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {REPORT_DEFS.map((r) => {
          const Icon = ICONS[r.icon]
          const active = selected === r.id
          return (
            <button
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`glass rounded-lg p-4 text-left transition ${active ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : 'hover:border-white/20'}`}
            >
              <span className={`mb-3 inline-flex rounded border p-2 ${active ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-slate-400'}`}>
                <Icon size={16} />
              </span>
              <p className="text-[13px] font-bold text-slate-100">{r.title}</p>
              <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{r.description}</p>
              <p className="mt-2 font-mono text-[9px] tracking-widest text-slate-600 uppercase">Updated {r.updated}</p>
            </button>
          )
        })}
      </div>

      {/* Preview + export */}
      <Panel
        title={`Preview · ${report.title}`}
        subtitle={`${LOCATIONS.find((l) => l.id === location)?.label} · ${from} → ${to} · DEMO DATASET`}
        action={
          <div className="no-print flex gap-2">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              <Download size={12} /> CSV
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
            >
              <Printer size={12} /> PDF
            </button>
          </div>
        }
      >
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <ReportIcon size={14} className="text-cyan-400" />
            <p className="text-[13px] font-semibold text-slate-200">
              {report.title} — {SEASONS.find((s) => s.id === season)?.label}
            </p>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{report.description}</p>
        </div>
        {selected === 'advisory' && (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
            <StatCard label="Reports Generated" value="128" accent="cyan" sub="this season" />
            <StatCard label="Signed-off" value="119" accent="green" sub="by AEO network" />
            <StatCard label="Auto-generated" value="9" accent="blue" sub="pending review" />
            <StatCard label="Avg. Generation" value="3.2" unit="min" accent="amber" />
          </div>
        )}
        {renderPreview()}
        <div className="border-t border-white/5 px-4 py-2.5">
          <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
            Report ID: ARK-{selected.toUpperCase()}-2026-1109 · Prepared by ARKTECH Intelligence Engine ·
            Demonstration data, not for operational use
          </p>
        </div>
      </Panel>
    </div>
  )
}
