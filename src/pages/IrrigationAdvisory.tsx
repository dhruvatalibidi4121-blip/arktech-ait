import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Download, Droplets, ArrowDownWideNarrow, Filter, MessageSquareText } from 'lucide-react'
import type { FieldRecord, CropType, AdvisoryCategory } from '../types'
import { getIrrigationAdvisory } from '../api/services'
import { useAppState } from '../state/AppState'
import { Panel, PageHeader, LoadingState, ErrorState, DemoBadge, EmptyState, StatCard } from '../components/ui'
import SmsDispatchPanel from '../components/SmsDispatchPanel'
import { ADVISORY_COLORS, CROP_COLORS, STRESS_COLORS } from '../data/fields'

function advisoryCategory(deficit: number, t: { noneMax: number; lightMax: number; moderateMax: number }): AdvisoryCategory {
  if (deficit <= t.noneMax) return 'None'
  if (deficit <= t.lightMax) return 'Light'
  if (deficit <= t.moderateMax) return 'Moderate'
  return 'Urgent'
}

export default function IrrigationAdvisory() {
  const { settings } = useAppState()
  const [fields, setFields] = useState<FieldRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [crop, setCrop] = useState<'all' | CropType>('all')
  const [cat, setCat] = useState<'all' | AdvisoryCategory>('all')
  const [query, setQuery] = useState('')
  const smsRef = useRef<HTMLDivElement>(null)

  const load = () => {
    setError(null)
    setFields(null)
    getIrrigationAdvisory({ crop: crop === 'all' ? undefined : crop, advisory: cat === 'all' ? undefined : cat })
      .then(setFields)
      .catch((e) => setError(String(e)))
  }

  useEffect(load, [crop, cat])

  const filtered = useMemo(() => {
    if (!fields) return []
    return fields
      .filter((f) => (crop === 'all' ? true : f.crop === crop))
      .filter((f) => (cat === 'all' ? true : advisoryCategory(f.waterDeficitMm, settings.thresholds) === cat))
      .filter((f) => (query ? f.id.toLowerCase().includes(query.toLowerCase()) || f.name.toLowerCase().includes(query.toLowerCase()) : true))
      .sort((a, b) => b.waterDeficitMm - a.waterDeficitMm)
  }, [fields, crop, cat, query, settings.thresholds])

  const summary = useMemo(() => {
    if (!fields) return null
    const req = fields.filter((f) => f.waterDeficitMm > settings.thresholds.noneMax)
    return {
      total: fields.length,
      req: req.length,
      urgent: req.filter((f) => f.waterDeficitMm > settings.thresholds.moderateMax).length,
      waterMl: req.reduce((s, f) => s + (f.irrigationRequirementMm * f.areaHa) / 100, 0),
    }
  }, [fields, settings.thresholds])

  const exportCsv = () => {
    if (!filtered.length) return
    const header = [
      'Field ID', 'Name', 'Crop', 'Growth Stage', 'Area (ha)', 'NDVI', 'NDWI', 'VCI', 'SMI',
      'Stress', 'Water Deficit (mm)', 'Irrigation Req (mm)', 'ETc', 'ETa', 'Rainfall (mm)',
      'Crop Water Req (mm)', 'Advisory',
    ]
    const rows = filtered.map((f) => [
      f.id, f.name, f.crop, f.stage, f.areaHa, f.indices.ndvi, f.indices.ndwi, f.indices.vci,
      f.indices.smi, f.stress, f.waterDeficitMm, f.irrigationRequirementMm, f.etc, f.eta,
      f.rainfallMm, f.cropWaterReqMm, f.advisory,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arktech-irrigation-advisory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        eyebrow="FIELD-LEVEL ADVISORY CONSOLE"
        title="Irrigation Advisory"
        description="Field-wise irrigation advisories ranked by 8-day water deficit. Filter by crop, advisory category or field identifier; export the advisory ledger for canal operations."
        right={
          <>
            <DemoBadge />
            <button
              onClick={() => smsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              <MessageSquareText size={13} /> SMS Alerts
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              <Download size={13} /> Export CSV
            </button>
          </>
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !fields || !summary ? (
        <LoadingState label="Loading advisory ledger..." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Advisories Issued" value={filtered.length} accent="cyan" icon={<Droplets size={13} />} sub={`of ${summary.total} fields`} />
            <StatCard label="Requiring Irrigation" value={summary.req} accent="amber" icon={<Filter size={13} />} />
            <StatCard label="Urgent Priority" value={summary.urgent} accent="red" icon={<ArrowDownWideNarrow size={13} />} />
            <StatCard label="Water Demand" value={summary.waterMl.toFixed(0)} unit="ML" accent="blue" icon={<Droplets size={13} />} />
          </div>

          {/* Filters */}
          <Panel className="mb-4">
            <div className="flex flex-wrap items-center gap-2.5 p-3.5">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search FIELD-001..."
                  className="w-52 rounded border border-white/10 bg-navy-800 py-1.5 pl-8 pr-3 font-mono text-[11px] text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
                />
              </div>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as 'all' | CropType)}
                className="rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50"
              >
                <option value="all">All crops</option>
                <option value="Sugarcane">Sugarcane</option>
                <option value="Rice">Rice</option>
                <option value="Fallow Land">Fallow Land</option>
                <option value="Other Crops">Other Crops</option>
              </select>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as 'all' | AdvisoryCategory)}
                className="rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50"
              >
                <option value="all">All advisory categories</option>
                <option value="None">No irrigation (0–10 mm)</option>
                <option value="Light">Light (10–25 mm)</option>
                <option value="Moderate">Moderate (25–40 mm)</option>
                <option value="Urgent">Urgent (&gt;40 mm)</option>
              </select>
              <span className="ml-auto font-mono text-[10px] tracking-widest text-slate-500 uppercase">
                {filtered.length} results · deficit-sorted
              </span>
            </div>
          </Panel>

          {filtered.length === 0 ? (
            <EmptyState label="No fields match the current advisory filter" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((f) => {
                const c = ADVISORY_COLORS[f.advisory]
                return (
                  <article key={f.id} className="glass rounded-lg p-4 transition hover:border-white/20">
                    <header className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[13px] font-bold tracking-wider text-slate-100">{f.id}</p>
                        <p className="text-[11px] text-slate-500">{f.name}</p>
                      </div>
                      <span
                        className="rounded px-2 py-1 font-mono text-[9px] font-bold tracking-widest uppercase"
                        style={{ color: c, background: `${c}1c`, border: `1px solid ${c}44` }}
                      >
                        {f.advisory}
                      </span>
                    </header>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: CROP_COLORS[f.crop] }} />
                        <span className="text-slate-300">{f.crop}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: STRESS_COLORS[f.stress] }} />
                        <span className="text-slate-300">{f.stage}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between rounded border border-white/5 bg-white/[0.03] p-2.5">
                      <div>
                        <p className="font-mono text-[8px] tracking-[0.2em] text-slate-500 uppercase">Water deficit</p>
                        <p className="tabular font-mono text-xl font-bold" style={{ color: c }}>
                          {f.waterDeficitMm}
                          <span className="ml-1 text-[11px] font-medium text-slate-400">mm</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[8px] tracking-[0.2em] text-slate-500 uppercase">Irrigation req.</p>
                        <p className="tabular font-mono text-[13px] font-bold text-slate-200">{f.irrigationRequirementMm} mm</p>
                      </div>
                    </div>

                    <p className="mt-2.5 text-[11px] leading-snug text-slate-300">{f.advisoryText}</p>
                    <p className="mt-2 font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                      ETc {f.etc} · ETa {f.eta} · rain {f.rainfallMm} mm · {f.areaHa} ha
                    </p>
                  </article>
                )
              })}
            </div>
          )}

          {/* SMS dispatch console — advisories to farmers' phones */}
          <div ref={smsRef} className="scroll-mt-24">
            <SmsDispatchPanel fields={filtered.length ? filtered : fields} thresholds={settings.thresholds} />
          </div>
        </>
      )}
    </div>
  )
}
