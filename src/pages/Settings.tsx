import { useState } from 'react'
import { Save, Server, SlidersHorizontal, Check, Monitor } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { Panel, PageHeader, DemoBadge, LiveBadge } from '../components/ui'
import { ADVISORY_COLORS } from '../data/fields'
import { ENDPOINTS, USE_MOCK, API_BASE_URL } from '../api/client'

export default function SettingsPage() {
  const { settings, setThresholds, setSettings } = useAppState()
  const [t, setT] = useState(settings.thresholds)
  const [saved, setSaved] = useState(false)

  const save = () => {
    setThresholds(t)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const preview = (deficit: number) => {
    if (deficit <= t.noneMax) return ['No irrigation', ADVISORY_COLORS.None]
    if (deficit <= t.lightMax) return ['Light irrigation', ADVISORY_COLORS.Light]
    if (deficit <= t.moderateMax) return ['Moderate irrigation', ADVISORY_COLORS.Moderate]
    return ['Urgent irrigation', ADVISORY_COLORS.Urgent]
  }

  return (
    <div>
      <PageHeader
        eyebrow="SYSTEM CONFIGURATION"
        title="Settings"
        description="Advisory thresholds, display preferences and backend integration status. Thresholds are used by the advisory engine across the platform."
        right={<DemoBadge />}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        {/* Thresholds */}
        <Panel title="Water deficit advisory thresholds" subtitle="mm per 8-day cycle · configurable demonstration thresholds">
          <div className="space-y-4 p-4">
            {(
              [
                ['No irrigation (≤)', 'noneMax', 'deficit up to this level needs no irrigation'],
                ['Light irrigation (≤)', 'lightMax', 'supplementary irrigation advised'],
                ['Moderate irrigation (≤)', 'moderateMax', 'timely irrigation within 4 days'],
                ['Urgent irrigation (>)', null, 'immediate irrigation to prevent yield loss'],
              ] as const
            ).map(([label, key, hint]) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-medium text-slate-300">{label}</label>
                  {key ? (
                    <input
                      type="number"
                      min={1}
                      max={80}
                      value={key ? t[key] : t.moderateMax + 10}
                      onChange={(e) => key && setT({ ...t, [key]: Math.max(1, Number(e.target.value)) })}
                      className="w-20 rounded border border-white/10 bg-navy-800 px-2 py-1 text-right font-mono text-[12px] text-slate-200 outline-none focus:border-cyan-500/50"
                      aria-label={label}
                    />
                  ) : (
                    <span className="tabular font-mono text-[12px] text-slate-400">&gt; {t.moderateMax} mm</span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500">{hint}</p>
              </div>
            ))}
            <div className="space-y-1.5 rounded border border-white/5 bg-white/[0.02] p-3">
              <p className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">Live preview</p>
              {[6, 18, 32, 46].map((v) => {
                const [label, color] = preview(v)
                return (
                  <div key={v} className="flex items-center justify-between text-[11px]">
                    <span className="tabular font-mono text-slate-400">{v} mm deficit</span>
                    <span className="font-semibold" style={{ color }}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded bg-cyan-500 px-4 py-2 text-[12px] font-bold text-navy-950 transition hover:bg-cyan-400"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? 'Thresholds saved' : 'Save thresholds'}
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          {/* Backend integration */}
          <Panel title="Backend integration" subtitle="FastAPI connection status & endpoints" action={<LiveBadge label={USE_MOCK ? 'MOCK MODE' : 'LIVE API'} />}>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2.5 rounded border border-white/5 bg-white/[0.02] p-3">
                <Server size={15} className="shrink-0 text-cyan-400" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">API base URL</p>
                  <p className="truncate font-mono text-[12px] text-slate-200">{API_BASE_URL}</p>
                </div>
                <span
                  className={`rounded px-1.5 py-0.5 font-mono text-[8px] tracking-widest uppercase ${
                    USE_MOCK ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {USE_MOCK ? 'Demo data' : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                The frontend is backend-agnostic. Set <code className="font-mono text-cyan-300">VITE_USE_MOCK=false</code> in{' '}
                <code className="font-mono text-cyan-300">.env</code> and point{' '}
                <code className="font-mono text-cyan-300">VITE_API_BASE_URL</code> at your Colab/FastAPI
                server. Until then all pages render bundled demonstration datasets.
              </p>
              <div>
                <p className="mb-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">Planned endpoints</p>
                <ul className="space-y-1">
                  {Object.values(ENDPOINTS).map((e) => (
                    <li key={e} className="flex items-center gap-2 rounded border border-white/5 px-2.5 py-1.5 font-mono text-[10px]">
                      <span className="rounded bg-cyan-500/10 px-1 py-0.5 text-[8px] font-bold tracking-widest text-cyan-400">GET</span>
                      <span className="text-slate-300">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>

          {/* Display prefs */}
          <Panel title="Display preferences" subtitle="Applied to the map & advisory engine">
            <div className="space-y-3 p-4">
              {(
                [
                  ['Cloud masking', 'cloudMask', 'Mask Sentinel-2 scenes above 30% cloud'],
                  ['Auto-refresh passes', 'autoRefresh', 'Poll for new acquisitions every 15 min'],
                ] as const
              ).map(([label, key, hint]) => (
                <label key={key} className="flex cursor-pointer items-center justify-between rounded border border-white/5 bg-white/[0.02] p-3">
                  <span>
                    <span className="flex items-center gap-2 text-[12px] font-medium text-slate-300">
                      {key === 'cloudMask' ? <Monitor size={13} className="text-slate-500" /> : <SlidersHorizontal size={13} className="text-slate-500" />}
                      {label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-slate-500">{hint}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[key])}
                    onChange={(e) => setSettings({ [key]: e.target.checked } as never)}
                    className="h-4 w-4 accent-cyan-400"
                  />
                </label>
              ))}
              <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                Preferences persist locally · thresholds shared across dashboard, stress & advisory pages
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
