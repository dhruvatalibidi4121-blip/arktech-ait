import { useMemo, useState } from 'react'
import {
  MessageSquareText,
  Send,
  Check,
  CheckCheck,
  Clock,
  X,
  Download,
  Users,
  IndianRupee,
  LoaderCircle,
} from 'lucide-react'
import type { AdvisoryThresholds, FieldRecord, SmsDispatchResult, SmsStatus } from '../types'
import { FARMER_CONTACTS, ADVISORY_COLORS } from '../data/fields'
import { dispatchSmsAdvisories } from '../api/services'
import { USE_MOCK } from '../api/client'
import { DemoBadge, EmptyState, ProgressBar } from './ui'

/** Compose the actual SMS text sent to a farmer for a field block */
export function buildSmsMessage(field: FieldRecord): string {
  return (
    `ARKTECH ADV: ${field.id} ${field.crop} (${field.stage}). ` +
    `8-day water deficit ${field.waterDeficitMm}mm. ` +
    `${field.advisoryText} Priority: ${field.advisory.toUpperCase()}. ` +
    `Mandya AOI. Reply STOP to opt out.`
  )
}

function segmentsFor(text: string) {
  return Math.max(1, Math.ceil(text.length / 160))
}

const STATUS_META: Record<SmsStatus, { icon: typeof Check; color: string; label: string }> = {
  Queued: { icon: Clock, color: 'text-amber-400', label: 'Queued' },
  Sent: { icon: Check, color: 'text-cyan-400', label: 'Sent' },
  Delivered: { icon: CheckCheck, color: 'text-emerald-400', label: 'Delivered' },
  Failed: { icon: X, color: 'text-red-400', label: 'Failed' },
}

type Phase = 'idle' | 'sending' | 'done'

export default function SmsDispatchPanel({
  fields,
  thresholds,
}: {
  fields: FieldRecord[]
  thresholds: AdvisoryThresholds
}) {
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    fields.forEach((f) => {
      if (f.waterDeficitMm > thresholds.noneMax) initial.add(f.id)
    })
    return initial
  })
  const [results, setResults] = useState<Record<string, SmsDispatchResult>>({})
  const [phase, setPhase] = useState<Phase>('idle')
  const [revealed, setRevealed] = useState(0)

  const eligible = useMemo(() => fields.filter((f) => f.waterDeficitMm > thresholds.noneMax), [fields, thresholds])
  const selectedFields = useMemo(() => fields.filter((f) => selected.has(f.id)), [fields, selected])
  const totalSegments = selectedFields.reduce((s, f) => s + segmentsFor(buildSmsMessage(f)), 0)
  const estCost = (totalSegments * 0.15).toFixed(2)

  const toggle = (id: string) => {
    if (phase === 'sending') return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectByCategory = (cat: 'all-req' | 'urgent' | 'urgent-moderate') => {
    if (phase === 'sending') return
    const next = new Set<string>()
    fields.forEach((f) => {
      if (
        f.waterDeficitMm > thresholds.noneMax &&
        (cat === 'all-req' ||
          (cat === 'urgent' && f.waterDeficitMm > thresholds.moderateMax) ||
          (cat === 'urgent-moderate' && f.waterDeficitMm > thresholds.lightMax))
      )
        next.add(f.id)
    })
    setSelected(next)
    setResults({})
    setPhase('idle')
  }

  const send = async () => {
    if (!selectedFields.length || phase === 'sending') return
    setPhase('sending')
    setRevealed(0)
    setResults({})
    const messages = Object.fromEntries(selectedFields.map((f) => [f.id, buildSmsMessage(f)]))
    const res = await dispatchSmsAdvisories({
      fieldIds: selectedFields.map((f) => f.id),
      messages,
      senderId: 'ARKTECH',
    })
    // Reveal receipts row-by-row like a live gateway feed
    const map: Record<string, SmsDispatchResult> = {}
    for (let i = 0; i < res.length; i++) {
      map[res[i].fieldId] = res[i]
      setResults({ ...map })
      setRevealed(i + 1)
      await new Promise((r) => setTimeout(r, 180 + Math.random() * 320))
    }
    setPhase('done')
  }

  const exportLog = () => {
    const rows = [
      ['Field ID', 'Farmer', 'Phone', 'Carrier', 'Language', 'Deficit (mm)', 'Advisory', 'Status', 'Message ID', 'Segments'],
      ...selectedFields.map((f) => {
        const c = FARMER_CONTACTS[f.id]
        const r = results[f.id]
        return [
          f.id,
          c?.farmer ?? '',
          c?.phone ?? '',
          c?.carrier ?? '',
          c?.language ?? 'En',
          String(f.waterDeficitMm),
          f.advisory,
          r?.status ?? 'Not sent',
          r?.messageId ?? '',
          String(segmentsFor(buildSmsMessage(f))),
        ]
      }),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arktech-sms-dispatch-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const summary = useMemo(() => {
    const s = { Delivered: 0, Sent: 0, Queued: 0, Failed: 0 }
    Object.values(results).forEach((r) => (s[r.status] += 1))
    return s
  }, [results])

  const progress = phase === 'sending' && selectedFields.length ? (revealed / selectedFields.length) * 100 : phase === 'done' ? 100 : 0

  return (
    <section className="glass mt-4 overflow-hidden rounded-lg">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-4 py-3">
        <div>
          <h3 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide text-slate-200">
            <MessageSquareText size={14} className="text-emerald-400" />
            SMS Advisory Dispatch · Farmer Alert Console
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Per-block irrigation advisories delivered to registered farmers' phones · sender ID ARKTECH
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBadge label={USE_MOCK ? 'GATEWAY SIMULATED' : 'LIVE GATEWAY'} />
        </div>
      </header>

      <div className="grid gap-4 p-4 xl:grid-cols-[340px_1fr]">
        {/* Message template preview */}
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
              Message template · preview (FIELD-001)
            </p>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
              <div className="mb-2 flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <MessageSquareText size={12} />
                </span>
                <div className="text-[10px] leading-tight">
                  <p className="font-semibold text-slate-200">ARKTECH</p>
                  <p className="font-mono text-[8px] tracking-widest text-slate-500">
                    DLT TRANSACTIONAL · AGRICULTURE
                  </p>
                </div>
              </div>
              {fields[0] ? (
                <p className="font-mono text-[10px] leading-relaxed text-emerald-200/90">
                  {buildSmsMessage(fields[0])}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500">No fields in current filter</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded border border-white/5 bg-white/[0.02] p-2">
              <p className="flex items-center justify-center gap-1 font-mono text-[13px] font-bold text-slate-100">
                <Users size={11} className="text-cyan-400" />
                {selectedFields.length}
              </p>
              <p className="text-[9px] text-slate-500">Recipients</p>
            </div>
            <div className="rounded border border-white/5 bg-white/[0.02] p-2">
              <p className="font-mono text-[13px] font-bold text-slate-100">{totalSegments}</p>
              <p className="text-[9px] text-slate-500">SMS segments</p>
            </div>
            <div className="rounded border border-white/5 bg-white/[0.02] p-2">
              <p className="flex items-center justify-center gap-0.5 font-mono text-[13px] font-bold text-slate-100">
                <IndianRupee size={10} className="text-emerald-400" />
                {estCost}
              </p>
              <p className="text-[9px] text-slate-500">Est. cost</p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 font-mono text-[9px] tracking-[0.2em] text-slate-500 uppercase">
              Quick selection
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ['all-req', `All requiring irrigation (${eligible.length})`],
                  ['urgent-moderate', 'Urgent + Moderate'],
                  ['urgent', `Urgent only (> ${thresholds.moderateMax} mm)`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => selectByCategory(id)}
                  className="rounded border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {phase === 'sending' && (
            <div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="mb-1.5 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-mono tracking-widest text-cyan-300 uppercase">
                  <LoaderCircle size={11} className="animate-spin" />
                  Dispatching via gateway...
                </span>
                <span className="tabular font-mono text-slate-300">
                  {revealed}/{selectedFields.length}
                </span>
              </div>
              <ProgressBar value={progress} color="#22d3ee" />
            </div>
          )}

          {phase === 'done' && (
            <div className="rounded border border-emerald-500/25 bg-emerald-500/5 p-3">
              <p className="font-mono text-[9px] tracking-widest text-emerald-400 uppercase">
                Dispatch complete · delivery receipts
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                {(['Delivered', 'Queued', 'Sent', 'Failed'] as SmsStatus[]).map((s) => (
                  <div key={s} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1">
                    <span className={`flex items-center gap-1.5 ${STATUS_META[s].color}`}>
                      {s === 'Delivered' ? <CheckCheck size={11} /> : s === 'Failed' ? <X size={11} /> : <Check size={11} />}
                      {s}
                    </span>
                    <span className="tabular font-mono font-bold text-slate-200">{summary[s]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={!selectedFields.length || phase === 'sending'}
              className="flex flex-1 items-center justify-center gap-2 rounded bg-emerald-500 px-4 py-2.5 text-[12px] font-bold text-navy-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {phase === 'sending' ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {phase === 'sending' ? 'Dispatching...' : `Send SMS to ${selectedFields.length} blocks`}
            </button>
            <button
              onClick={exportLog}
              title="Export dispatch log (CSV)"
              className="rounded border border-white/10 px-3 py-2.5 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-300"
            >
              <Download size={15} />
            </button>
          </div>
        </div>

        {/* Recipient table */}
        <div className="overflow-hidden rounded-lg border border-white/5">
          {selectedFields.length === 0 ? (
            <EmptyState label="No blocks selected — use quick selection or tick recipients below" />
          ) : (
            <div className="max-h-[430px] overflow-y-auto">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 bg-navy-900/95 backdrop-blur">
                  <tr className="border-b border-white/5 text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                    <th className="w-8 px-3 py-2"></th>
                    <th className="px-2 py-2">Block</th>
                    <th className="px-2 py-2">Farmer</th>
                    <th className="px-2 py-2">Phone</th>
                    <th className="px-2 py-2">Advisory</th>
                    <th className="px-2 py-2 text-right">Seg</th>
                    <th className="px-3 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFields.map((f) => {
                    const c = FARMER_CONTACTS[f.id]
                    const r = results[f.id]
                    const statusMeta = r ? STATUS_META[r.status] : null
                    return (
                      <tr
                        key={f.id}
                        className={`border-b border-white/[0.03] transition-colors ${selected.has(f.id) ? '' : 'opacity-40'}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selected.has(f.id)}
                            onChange={() => toggle(f.id)}
                            disabled={phase === 'sending'}
                            className="h-3.5 w-3.5 accent-emerald-400"
                            aria-label={`Select ${f.id}`}
                          />
                        </td>
                        <td className="px-2 py-2">
                          <p className="font-mono font-bold text-slate-200">{f.id}</p>
                          <p className="text-[9px] text-slate-500">
                            {f.crop} · {f.stage}
                          </p>
                        </td>
                        <td className="px-2 py-2 text-slate-300">
                          {c?.farmer}
                          <span className="ml-1 font-mono text-[8px] text-slate-600">{c?.language}</span>
                        </td>
                        <td className="tabular px-2 py-2 font-mono text-slate-300">
                          {c?.phone}
                          <p className="text-[8px] tracking-widest text-slate-600 uppercase">{c?.carrier}</p>
                        </td>
                        <td className="px-2 py-2">
                          <span
                            className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase"
                            style={{
                              color: ADVISORY_COLORS[f.advisory],
                              background: `${ADVISORY_COLORS[f.advisory]}1a`,
                            }}
                          >
                            {f.advisory}
                          </span>
                          <p className="tabular mt-0.5 font-mono text-[9px] text-slate-500">
                            {f.waterDeficitMm} mm deficit
                          </p>
                        </td>
                        <td className="tabular px-2 py-2 text-right font-mono text-slate-400">
                          {segmentsFor(buildSmsMessage(f))}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {r && statusMeta ? (
                            <span className={`inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest uppercase ${statusMeta.color}`}>
                              <statusMeta.icon size={11} />
                              {statusMeta.label}
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
                              {phase === 'sending' ? 'Sending...' : 'Ready'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-white/5 px-3 py-2">
            <p className="font-mono text-[9px] tracking-widest text-slate-600 uppercase">
              {selectedFields.length} of {fields.length} blocks selected · {eligible.length} exceed
              no-irrigation threshold ({thresholds.noneMax} mm) · contacts registry: NRSC-KVK sync (demo)
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
