import type { SatelliteSource } from '../types'
import { LiveBadge } from './ui'

const STATUS_COLORS: Record<SatelliteSource['status'], string> = {
  Operational: '#34d399',
  'Archive Access': '#38bdf8',
  Commissioning: '#eab308',
  Planned: '#94a3b8',
}

export function SatelliteSourceCard({ source: s }: { source: SatelliteSource }) {
  return (
    <article className="glass group overflow-hidden rounded-lg transition hover:border-cyan-500/30">
      <div className="relative h-36 overflow-hidden bg-navy-900">
        <img
          src={s.image}
          alt={s.imageAlt}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/10 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase"
            style={{
              color: s.category === 'optical' ? '#fbbf24' : '#22d3ee',
              background: 'rgba(6,11,22,0.7)',
              border: `1px solid ${s.category === 'optical' ? '#fbbf2455' : '#22d3ee55'}`,
            }}
          >
            {s.category === 'optical' ? 'OPTICAL' : 'SAR'}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[14px] font-bold text-slate-50">{s.name}</p>
            <p className="font-mono text-[9px] tracking-widest text-slate-300 uppercase">{s.agency}</p>
          </div>
          <span
            className="flex items-center gap-1 rounded bg-navy-950/75 px-1.5 py-0.5 font-mono text-[8px] tracking-widest uppercase backdrop-blur"
            style={{ color: STATUS_COLORS[s.status] }}
          >
            <span className="h-1 w-1 rounded-full pulse-dot" style={{ background: STATUS_COLORS[s.status] }} />
            {s.status}
          </span>
        </div>
      </div>
      <dl className="space-y-1.5 p-3.5 text-[11px]">
        {(
          [
            ['Sensor', s.sensor],
            ['Resolution', s.resolution],
            ['Revisit', s.revisit],
            ['Bands', s.bands],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2">
            <dt className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">{k}</dt>
            <dd className="text-right text-slate-300">{v}</dd>
          </div>
        ))}
        <div className="pt-1">
          <dt className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">Primary application</dt>
          <dd className="mt-1 rounded border border-white/5 bg-white/[0.03] p-2 text-[11px] leading-snug text-slate-300">
            {s.application}
          </dd>
        </div>
      </dl>
      <div className="flex items-center justify-between border-t border-white/5 px-3.5 py-2">
        <LiveBadge label="DATA STREAM READY" />
        <span className="font-mono text-[8px] tracking-widest text-slate-600">NRSC / Copernicus feed</span>
      </div>
    </article>
  )
}
