import { Layers, ChevronDown, ChevronUp, Map as MapIcon } from 'lucide-react'
import { useState } from 'react'
import type { MapLayerId } from '../types'
import { MAP_LAYERS } from '../data/datasets'

export default function MapLayerControl({
  active,
  onChange,
  basemap,
  onBasemapChange,
}: {
  active: MapLayerId
  onChange: (id: MapLayerId) => void
  basemap: 'esri' | 'gibs'
  onBasemapChange: (b: 'esri' | 'gibs') => void
}) {
  const [open, setOpen] = useState(true)
  const activeInfo = MAP_LAYERS.find((l) => l.id === active)

  return (
    <div className="pointer-events-auto w-[220px] overflow-hidden rounded-lg glass-strong shadow-2xl shadow-black/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 hover:bg-white/[0.03]"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-slate-200 uppercase">
          <Layers size={13} className="text-cyan-400" />
          Map Layers
        </span>
        {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </button>
      {open && (
        <div className="max-h-[46vh] overflow-y-auto border-t border-white/5">
          {active === 'rgb' && (
            <div className="px-3 pt-2.5">
              <p className="mb-1.5 font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                Basemap source
              </p>
              <div className="mb-1 grid grid-cols-2 gap-1">
                {(
                  [
                    ['esri', 'Esri HI-RES'],
                    ['gibs', 'NASA MODIS'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => onBasemapChange(id)}
                    className={`rounded border px-1.5 py-1 font-mono text-[9px] tracking-wider ${
                      basemap === id
                        ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-300'
                        : 'border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ul className="p-1.5">
            {MAP_LAYERS.map((layer) => (
              <li key={layer.id}>
                <button
                  onClick={() => onChange(layer.id)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12px] transition-colors ${
                    active === layer.id
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active === layer.id ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                  <span className="flex-1 font-medium">{layer.label}</span>
                  {layer.demo && (
                    <span className="font-mono text-[8px] tracking-widest text-amber-500/80">DEMO</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-white/5 px-3 py-2">
            <p className="text-[10px] leading-snug text-slate-500">{activeInfo?.description}</p>
            <p className="mt-0.5 font-mono text-[9px] text-slate-600">SRC: {activeInfo?.source}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function MapLegend({ title, items }: { title: string; items: { label: string; color: string }[] }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="pointer-events-auto w-[170px] overflow-hidden rounded-lg glass-strong shadow-2xl shadow-black/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2"
      >
        <span className="flex items-center gap-2 font-mono text-[9px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
          <MapIcon size={12} className="text-cyan-400" />
          {title}
        </span>
        {open ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
      </button>
      {open && (
        <ul className="space-y-1 border-t border-white/5 px-3 py-2">
          {items.map((i) => (
            <li key={i.label} className="flex items-center gap-2 text-[11px] text-slate-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: i.color }} />
              {i.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
