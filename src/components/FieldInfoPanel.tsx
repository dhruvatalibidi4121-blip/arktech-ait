import { X, Crosshair } from 'lucide-react'
import type { FieldRecord, MapLayerId } from '../types'
import { CROP_COLORS, STRESS_COLORS, ADVISORY_COLORS } from '../data/fields'
import { ProgressBar } from './ui'

const LAYER_VALUE_LABEL: Partial<Record<MapLayerId, string>> = {
  ndvi: 'NDVI',
  ndwi: 'NDWI',
  vci: 'VCI',
  smi: 'Soil Moisture Index',
  sarvv: 'SAR VV backscatter',
  sarvh: 'SAR VH backscatter',
}

function IndexRow({
  label,
  value,
  min = 0,
  max = 1,
  color = '#22d3ee',
  unit,
}: {
  label: string
  value: number
  min?: number
  max?: number
  color?: string
  unit?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{label}</span>
        <span className="tabular font-mono font-semibold text-slate-100">
          {value}
          {unit && <span className="ml-0.5 text-slate-500">{unit}</span>}
        </span>
      </div>
      <div className="mt-1">
        <ProgressBar value={((value - min) / (max - min)) * 100} color={color} />
      </div>
    </div>
  )
}

export default function FieldInfoPanel({
  field,
  layer,
  onClose,
}: {
  field: FieldRecord
  layer: MapLayerId
  onClose: () => void
}) {
  const i = field.indices
  const highlighted = LAYER_VALUE_LABEL[layer]

  return (
    <div className="pointer-events-auto w-[280px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg glass-strong shadow-2xl shadow-black/60 anim-fade-up">
      <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <Crosshair size={13} className="text-cyan-400" />
          <p className="font-mono text-[12px] font-bold tracking-wider text-slate-100">{field.id}</p>
        </div>
        <button onClick={onClose} className="rounded p-0.5 text-slate-500 hover:text-slate-200" aria-label="Close field panel">
          <X size={15} />
        </button>
      </div>

      <div className="max-h-[56vh] space-y-3 overflow-y-auto p-3.5">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded border border-white/5 bg-white/[0.03] p-2">
            <p className="text-[9px] tracking-widest text-slate-500 uppercase">Crop</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-slate-100">
              <span className="h-2 w-2 rounded-sm" style={{ background: CROP_COLORS[field.crop] }} />
              {field.crop}
            </p>
          </div>
          <div className="rounded border border-white/5 bg-white/[0.03] p-2">
            <p className="text-[9px] tracking-widest text-slate-500 uppercase">Stage</p>
            <p className="mt-0.5 font-semibold text-slate-100">{field.stage}</p>
          </div>
          <div className="rounded border border-white/5 bg-white/[0.03] p-2">
            <p className="text-[9px] tracking-widest text-slate-500 uppercase">Area</p>
            <p className="tabular mt-0.5 font-semibold text-slate-100">{field.areaHa} ha</p>
          </div>
          <div className="rounded border border-white/5 bg-white/[0.03] p-2">
            <p className="text-[9px] tracking-widest text-slate-500 uppercase">Stress</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-semibold" style={{ color: STRESS_COLORS[field.stress] }}>
              <span className="h-2 w-2 rounded-sm" style={{ background: STRESS_COLORS[field.stress] }} />
              {field.stress}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 rounded border border-white/5 bg-white/[0.02] p-2.5">
          <p className="font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">Spectral indices</p>
          <IndexRow label="NDVI" value={i.ndvi} min={0} max={1} color="#34d399" />
          <IndexRow label="NDWI" value={i.ndwi} min={-0.4} max={0.6} color="#38bdf8" />
          <IndexRow label="VCI" value={i.vci} min={0} max={1} color="#22d3ee" />
          <IndexRow label="SMI" value={i.smi} min={0} max={1} color="#818cf8" />
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div>
              <p className="text-[10px] text-slate-400">SAR VV</p>
              <p className="tabular font-mono text-[12px] font-semibold text-slate-200">{i.sarVV} dB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">SAR VH</p>
              <p className="tabular font-mono text-[12px] font-semibold text-slate-200">{i.sarVH} dB</p>
            </div>
          </div>
          {highlighted && (
            <p className="font-mono text-[9px] tracking-widest text-cyan-500/90 uppercase">
              Map view: {highlighted}
            </p>
          )}
        </div>

        <div className="space-y-2 rounded border border-cyan-500/20 bg-cyan-500/5 p-2.5">
          <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-400 uppercase">Water balance · 8-day</p>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div>
              <p className="tabular font-mono text-[13px] font-bold text-slate-100">{field.etc}</p>
              <p className="text-[9px] text-slate-500">ETc mm</p>
            </div>
            <div>
              <p className="tabular font-mono text-[13px] font-bold text-slate-100">{field.eta}</p>
              <p className="text-[9px] text-slate-500">ETa mm</p>
            </div>
            <div>
              <p className="tabular font-mono text-[13px] font-bold text-slate-100">{field.rainfallMm}</p>
              <p className="text-[9px] text-slate-500">Rain mm</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/5 pt-1.5 text-[11px]">
            <span className="text-slate-400">Water deficit</span>
            <span className="tabular font-mono font-bold text-orange-400">{field.waterDeficitMm} mm</span>
          </div>
        </div>

        <div
          className="rounded border p-2.5"
          style={{
            borderColor: `${ADVISORY_COLORS[field.advisory]}55`,
            background: `${ADVISORY_COLORS[field.advisory]}12`,
          }}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[9px] tracking-[0.2em] text-slate-400 uppercase">Irrigation advisory</p>
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase"
              style={{
                color: ADVISORY_COLORS[field.advisory],
                background: `${ADVISORY_COLORS[field.advisory]}22`,
              }}
            >
              {field.advisory}
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-snug text-slate-200">{field.advisoryText}</p>
          <p className="mt-1 font-mono text-[9px] text-slate-500">
            REQ: {field.irrigationRequirementMm} mm · CW REQ: {field.cropWaterReqMm} mm
          </p>
        </div>

        <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
          {field.lat.toFixed(4)}° N · {field.lon.toFixed(4)}° E · conf {Math.round(field.classificationConfidence * 100)}%
        </p>
      </div>
    </div>
  )
}
