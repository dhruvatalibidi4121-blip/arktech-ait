import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Sprout,
  Activity,
  Droplets,
  CloudRain,
  Satellite,
  FileText,
  Settings,
  Radar,
  Waves,
  Home,
  X,
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Overview', icon: Home, end: true },
  { to: '/dashboard', label: 'Intelligence Dashboard', icon: LayoutDashboard },
  { to: '/crop-classification', label: 'Crop Classification', icon: Sprout },
  { to: '/phenology', label: 'Phenology Monitoring', icon: Activity },
  { to: '/moisture-stress', label: 'Moisture Stress', icon: Waves },
  { to: '/water-deficit', label: 'Water Deficit', icon: CloudRain },
  { to: '/irrigation-advisory', label: 'Irrigation Advisory', icon: Droplets },
  { to: '/satellite-sources', label: 'Satellite Sources', icon: Satellite },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyan-500/30 bg-gradient-to-br from-navy-800 to-navy-950">
        <svg viewBox="0 0 24 24" className="h-5 w-5">
          <path
            d="M3 17 L8 6 L12 14 L16 6 L21 17"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.5" cy="5.5" r="1.6" fill="#34d399" />
        </svg>
      </span>
      {!compact && (
        <div className="leading-tight">
          <p className="text-[15px] font-extrabold tracking-[0.18em] text-slate-100">ARKTECH</p>
          <p className="font-mono text-[8px] tracking-[0.3em] text-cyan-500/80 uppercase">
            Agri Intelligence
          </p>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-white/5 bg-navy-950/95 backdrop-blur transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <Link to="/">
            <Logo />
          </Link>
          <button
            className="rounded p-1 text-slate-500 hover:text-slate-200 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
          <p className="px-2.5 pb-2 font-mono text-[9px] tracking-[0.25em] text-slate-600 uppercase">
            Navigation
          </p>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 shadow-[inset_2px_0_0_0_#22d3ee]'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`
              }
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4">
          <div className="rounded-md border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <Radar size={13} className="text-emerald-400 pulse-dot" />
              <p className="font-mono text-[9px] tracking-[0.2em] text-slate-400 uppercase">
                Ground station link
              </p>
            </div>
            <p className="mt-1.5 font-mono text-[10px] text-slate-500">
              ISTRAC / NRSC · ACTIVE
            </p>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Waves key={i} size={9} className={i < 4 ? 'text-emerald-500' : 'text-slate-700'} />
              ))}
              <span className="ml-1 font-mono text-[9px] text-slate-500">4/5</span>
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[9px] tracking-widest text-slate-700">
            v2.4.1 · DEMO BUILD
          </p>
        </div>
      </aside>
    </>
  )
}
