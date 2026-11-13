import type { ReactNode } from 'react'

export function Panel({
  children,
  className = '',
  title,
  subtitle,
  action,
  demo,
}: {
  children?: ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: ReactNode
  demo?: boolean
}) {
  return (
    <section className={`glass rounded-lg overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5">
          <div>
            {title && (
              <h3 className="text-[13px] font-semibold tracking-wide text-slate-200 uppercase">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {demo && <DemoBadge />}
            {action}
          </div>
        </header>
      )}
      {children}
    </section>
  )
}

export function DemoBadge({ label = 'DEMO DATA' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-widest text-amber-400">
      {label}
    </span>
  )
}

export function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-semibold tracking-widest text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
      {label}
    </span>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  right,
}: {
  eyebrow?: string
  title: string
  description?: string
  right?: ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-400 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[13px] text-slate-400">{description}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  icon,
  accent = 'cyan',
  sub,
}: {
  label: string
  value: string | number
  unit?: string
  trend?: string
  icon?: ReactNode
  accent?: 'cyan' | 'green' | 'orange' | 'red' | 'blue' | 'amber'
  sub?: string
}) {
  const accents: Record<string, string> = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }
  return (
    <div className="glass rounded-lg p-4 transition-colors hover:border-white/20">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">{label}</p>
        {icon && <span className={`rounded border p-1.5 ${accents[accent]}`}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular text-2xl font-bold text-slate-100">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>
      {(trend || sub) && (
        <p className={`mt-1 text-[11px] ${trend && trend.startsWith('-') ? 'text-orange-400' : 'text-emerald-400'}`}>
          {trend ?? sub}
        </p>
      )}
    </div>
  )
}

export function LoadingState({ label = 'Acquiring satellite products...' }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <div className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-cyan-500/25 border-t-cyan-400 spin-slow" />
        <span className="absolute inset-2 rounded-full border-2 border-emerald-500/25 border-b-emerald-400 [animation:spinSlow_9s_linear_infinite_reverse]" />
      </div>
      <p className="font-mono text-[11px] tracking-widest uppercase">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-red-500/25 bg-red-500/5 py-12 text-center">
      <p className="font-mono text-[11px] tracking-widest text-red-400 uppercase">Data link error</p>
      <p className="max-w-sm text-[13px] text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-[12px] font-medium text-cyan-300 hover:bg-cyan-500/20"
        >
          Retry acquisition
        </button>
      )}
    </div>
  )
}

export function EmptyState({ label = 'No records match the current filter' }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] py-10 text-center">
      <p className="font-mono text-[11px] tracking-widest text-slate-500 uppercase">No data</p>
      <p className="text-[13px] text-slate-400">{label}</p>
    </div>
  )
}

export function ProgressBar({ value, color = '#22d3ee' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  )
}
