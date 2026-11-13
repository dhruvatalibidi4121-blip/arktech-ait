import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu, Satellite, CircleDot } from 'lucide-react'
import { useAppState } from '../state/AppState'
import { LOCATIONS, SEASONS } from '../data/fields'

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const { pathname } = useLocation()
  const { settings, setSettings } = useAppState()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  const location = LOCATIONS.find((l) => l.id === settings.location) ?? LOCATIONS[0]

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-navy-950/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
            <button
              className="rounded p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 lg:hidden"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-2.5">
              <Satellite size={15} className="shrink-0 text-cyan-400" />
              <p className="truncate font-mono text-[11px] tracking-[0.22em] text-slate-300 uppercase">
                ARKTECH / Agricultural Intelligence
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="hidden items-center gap-1.5 rounded border border-emerald-500/25 bg-emerald-500/5 px-2 py-1 md:flex">
                <CircleDot size={11} className="text-emerald-400 pulse-dot" />
                <span className="font-mono text-[9px] tracking-widest text-emerald-400 uppercase">
                  Monitoring · {location.label.split(',')[0]}
                </span>
              </div>
              <select
                value={settings.location}
                onChange={(e) => setSettings({ location: e.target.value })}
                className="rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50"
                aria-label="Select location"
              >
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <select
                value={settings.season}
                onChange={(e) => setSettings({ season: e.target.value })}
                className="rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50"
                aria-label="Select crop season"
              >
                {SEASONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={settings.date}
                onChange={(e) => setSettings({ date: e.target.value })}
                className="rounded border border-white/10 bg-navy-800 px-2 py-1.5 font-mono text-[11px] text-slate-300 outline-none focus:border-cyan-500/50"
                aria-label="Acquisition date"
              />
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
        <footer className="px-6 pb-6 pt-2">
          <p className="font-mono text-[10px] tracking-widest text-slate-700">
            ARKTECH · AI-POWERED SATELLITE AGRICULTURE INTELLIGENCE · DEMONSTRATION DATA · NOT FOR
            OPERATIONAL USE
          </p>
        </footer>
      </div>
    </div>
  )
}
