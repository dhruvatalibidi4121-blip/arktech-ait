import { Panel, PageHeader, DemoBadge, LiveBadge, StatCard } from '../components/ui'
import { SatelliteSourceCard } from '../components/SatelliteSourceCard'
import { SATELLITE_SOURCES } from '../data/datasets'
import { IMAGERY } from '../config/imagery'
import { Sun, Radio, Satellite } from 'lucide-react'

export default function SatelliteSources() {
  const optical = SATELLITE_SOURCES.filter((s) => s.category === 'optical')
  const sar = SATELLITE_SOURCES.filter((s) => s.category === 'sar')

  return (
    <div>
      <PageHeader
        eyebrow="MULTI-MISSION DATA CATALOGUE"
        title="Satellite Data Sources"
        description="The sensors feeding ARKTECH's classification and water-balance models — optical for spectral vigour and phenology, SAR for all-weather crop structure and surface moisture."
        right={<DemoBadge />}
      />

      {/* OPTICAL */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-wide text-slate-100">
            <span className="rounded border border-amber-500/30 bg-amber-500/10 p-1.5 text-amber-400">
              <Sun size={15} />
            </span>
            OPTICAL DATA
          </h2>
          <LiveBadge label="6 MISSIONS" />
        </div>
        <p className="mb-4 max-w-3xl rounded border border-amber-500/15 bg-amber-500/5 p-3 text-[12px] leading-relaxed text-slate-300">
          Optical sensors capture vegetation vigour, crop growth, spectral signatures and phenology
          through red, red-edge, NIR and SWIR bands — the backbone of NDVI / EVI / NDWI / VCI
          index generation and crop classification.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {optical.map((s) => (
            <SatelliteSourceCard key={s.id} source={s} />
          ))}
        </div>
      </section>

      {/* SAR */}
      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-bold tracking-wide text-slate-100">
            <span className="rounded border border-cyan-500/30 bg-cyan-500/10 p-1.5 text-cyan-400">
              <Radio size={15} />
            </span>
            MICROWAVE / SAR DATA
          </h2>
          <LiveBadge label="3 MISSIONS" />
        </div>
        <p className="mb-4 max-w-3xl rounded border border-cyan-500/15 bg-cyan-500/5 p-3 text-[12px] leading-relaxed text-slate-300">
          SAR penetrates cloud, haze and rain, enabling all-weather monitoring during the monsoon.
          VV polarisation is sensitive to surface soil moisture; VH tracks canopy structure and
          biomass — critical for paddy detection and cloudy-season observations.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sar.map((s) => (
            <SatelliteSourceCard key={s.id} source={s} />
          ))}
        </div>
      </section>

      {/* Fusion explanation */}
      <Panel title="Optical + SAR fusion strategy" subtitle="Why both streams matter for irrigation intelligence">
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <img src={IMAGERY.gangesSentinel2} alt="Optical Sentinel-2 India" className="aspect-[16/9] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[13px] font-bold text-slate-100">Optical · Sentinel-2 / Resourcesat</p>
              <p className="mt-1 text-[11px] text-slate-300">
                High-frequency NDVI, NDWI, EVI time-series. Weakened by monsoon cloud cover — gaps
                filled with SAR phenology.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-white/10">
            <img src={IMAGERY.sarNetherlands} alt="SAR Sentinel-1C" className="aspect-[16/9] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-[13px] font-bold text-slate-100">SAR · EOS-04 / Sentinel-1 / NISAR</p>
              <p className="mt-1 text-[11px] text-slate-300">
                Uninterrupted cloudy-season acquisition, crop structure, irrigation-event detection and
                direct surface soil moisture sensitivity.
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 p-4 md:grid-cols-4">
          <StatCard label="Missions Integrated" value="9" accent="cyan" icon={<Satellite size={13} />} />
          <StatCard label="Best Spatial Res." value="5.8" unit="m" accent="green" sub="LISS-IV" />
          <StatCard label="Effective Revisit" value="2-3" unit="days" accent="blue" sub="optical+SAR combined" />
          <StatCard label="Cloud-Free Coverage" value="100" unit="%" accent="amber" sub="with SAR fusion" />
        </div>
      </Panel>
    </div>
  )
}
