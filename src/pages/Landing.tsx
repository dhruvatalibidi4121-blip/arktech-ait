import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  Globe,
  Layers,
  Radar,
  Satellite,
  Sprout,
  Droplets,
  Activity,
  ScanLine,
  CircleDot,
} from 'lucide-react'
import { IMAGERY } from '../config/imagery'
import { Logo } from '../components/Sidebar'
import { LiveBadge } from '../components/ui'

const SHOWCASE = [
  {
    src: IMAGERY.gangesDelta,
    title: 'Hooghly–Brahmaputra Delta',
    meta: 'Landsat 8 OLI · Ganges Delta, India/Bangladesh',
    tag: 'OPTICAL',
  },
  {
    src: IMAGERY.sentinel2Farms,
    title: 'Agricultural parcel mosaic',
    meta: 'Copernicus Sentinel-2A · 10 m MSI',
    tag: 'SENTINEL-2',
  },
  {
    src: IMAGERY.gangesSentinel2,
    title: 'Ganges River corridor',
    meta: 'Copernicus Sentinel-2 · Nov 2025',
    tag: 'SENTINEL-2',
  },
  {
    src: IMAGERY.sarNetherlands,
    title: 'SAR backscatter scene',
    meta: 'Sentinel-1C C-SAR · all-weather acquisition',
    tag: 'SAR',
  },
  {
    src: IMAGERY.awifsScene,
    title: 'Wide-field crop surveillance',
    meta: 'IRS AWiFS · ISRO Resourcesat',
    tag: 'ISRO',
  },
  {
    src: IMAGERY.landsatMosaic,
    title: 'Field-by-field agriculture',
    meta: 'Landsat 9 OLI-2 · agricultural mosaic',
    tag: 'LANDSAT',
  },
]

const CAPABILITIES = [
  {
    icon: Sprout,
    title: 'Crop Type Identification',
    desc: 'Multi-temporal Random Forest / XGBoost ensemble classifies sugarcane, rice and other crops from spectral signatures and SAR structure.',
  },
  {
    icon: Activity,
    title: 'Phenological Stage Detection',
    desc: 'NDVI/NDWI time-series detects sowing, vegetative growth, flowering, maturity and harvest stages per field.',
  },
  {
    icon: ScanLine,
    title: 'Growth-Stage Stress Detection',
    desc: 'Phenology-aware NDVI anomaly, VCI, SMI and SAR backscatter reveal moisture stress during critical crop stages.',
  },
  {
    icon: Droplets,
    title: '8-Day Water Deficit & Advisory',
    desc: 'ETc–ETa–rainfall balance every 8 days generates field-wise deficit estimates and intelligent irrigation advisories.',
  },
]

const METHOD_PIPELINE = [
  { step: '01', title: 'Satellite Acquisition', desc: 'Resourcesat LISS-IV/III/AWiFS, Sentinel-2, Landsat, MODIS + EOS-04, Sentinel-1, NISAR SAR' },
  { step: '02', title: 'Pre-processing', desc: 'Atmospheric correction, cloud masking, SAR speckle filtering, co-registration' },
  { step: '03', title: 'AI/ML Classification', desc: 'Multi-temporal crop & phenology classification with optical + SAR feature fusion' },
  { step: '04', title: 'Stress & Deficit Modelling', desc: 'NDVI anomaly, VCI, SMI, SAR-soil-moisture fusion → ETc/ETa 8-day water balance' },
  { step: '05', title: 'Irrigation Advisory', desc: 'Field-wise advisory generation with configurable deficit thresholds and priority ranking' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <div
          className="absolute inset-0 anim-fade-in"
          style={{
            backgroundImage: `url(${IMAGERY.heroFields})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/55 to-navy-950" />
        <div className="absolute inset-0 grid-overlay opacity-60" />
        {/* scanline accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 overflow-hidden opacity-30">
          <div className="scanline h-1 w-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>

        {/* top bar */}
        <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#showcase" className="text-[13px] font-medium text-slate-300 hover:text-white">
              Imagery
            </a>
            <a href="#methodology" className="text-[13px] font-medium text-slate-300 hover:text-white">
              Methodology
            </a>
            <a href="#capabilities" className="text-[13px] font-medium text-slate-300 hover:text-white">
              Capabilities
            </a>
          </nav>
          <Link
            to="/dashboard"
            className="rounded border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
          >
            Open Dashboard
          </Link>
        </header>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-14 sm:px-8">
          <div className="anim-fade-up">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded border border-white/10 bg-navy-950/60 px-3 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="font-mono text-[9px] tracking-[0.25em] text-slate-300 uppercase sm:text-[10px]">
                Satellite Intelligence System · Monitoring: Mandya, Karnataka, India
              </span>
            </div>

            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              SEE THE FIELDS.
              <br />
              <span className="text-emerald-400">UNDERSTAND THE CROPS.</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                PREDICT THE STRESS.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-slate-300 sm:text-lg">
              AI-powered satellite intelligence for crop classification, phenological monitoring,
              moisture stress detection and precision irrigation advisory — built for agricultural
              scientists, irrigation departments and government authorities.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded bg-emerald-500 px-5 py-3 text-[13px] font-bold text-navy-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                <Globe size={15} />
                Explore Intelligence
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-[13px] font-semibold text-cyan-300 backdrop-blur transition hover:bg-cyan-500/20"
              >
                <Satellite size={15} />
                View Satellite Dashboard
              </Link>
              <a
                href="#methodology"
                className="inline-flex items-center gap-2 rounded border border-white/15 px-5 py-3 text-[13px] font-semibold text-slate-200 backdrop-blur transition hover:bg-white/5"
              >
                <Radar size={15} />
                Explore Methodology
              </a>
            </div>

            {/* stat strip */}
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['MULTI-SOURCE', 'Satellite Intelligence', Satellite],
                ['8-DAY', 'Water Deficit Monitoring', Droplets],
                ['AI-BASED', 'Crop Classification', Sprout],
                ['PHENOLOGY-AWARE', 'Stress Detection', ScanLine],
              ].map(([label, sub, Icon]) => {
                const I = Icon as typeof Satellite
                return (
                  <div
                    key={sub as string}
                    className="glass rounded-md px-3.5 py-3"
                  >
                    <I size={16} className="mb-2 text-cyan-400" />
                    <p className="font-mono text-[9px] tracking-[0.2em] text-cyan-500 uppercase">
                      {label as string}
                    </p>
                    <p className="mt-0.5 text-[12px] font-semibold text-slate-200">{sub as string}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center gap-2 pb-5 font-mono text-[9px] tracking-[0.3em] text-slate-500 uppercase">
          <ChevronRight size={11} className="rotate-90" />
          Scroll · Sentinel data downlink in progress
        </div>
      </section>

      {/* ---------- SHOWCASE ---------- */}
      <section id="showcase" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-400 uppercase">
              Satellite imagery archive
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              Real acquisitions. Real resolution.
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] text-slate-400">
              The platform is built on genuine optical and SAR imagery from ISRO, ESA Copernicus,
              NASA and USGS missions — the same data streams that feed the classification and water
              balance models.
            </p>
          </div>
          <LiveBadge label="ARCHIVE SYNCED" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOWCASE.map((item) => (
            <figure
              key={item.title}
              className="group relative overflow-hidden rounded-lg border border-white/10 bg-navy-900"
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-transparent to-transparent" />
              <span className="absolute right-3 top-3 rounded border border-white/15 bg-navy-950/70 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.2em] text-cyan-300 backdrop-blur">
                {item.tag}
              </span>
              <figcaption className="absolute inset-x-0 bottom-0 p-3.5">
                <p className="text-[13px] font-semibold text-slate-100">{item.title}</p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-400">{item.meta}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center font-mono text-[9px] tracking-widest text-slate-600 uppercase">
          Imagery: NASA / USGS Landsat · ESA Copernicus Sentinel-1 & 2 · ISRO Resourcesat (AWiFS sample)
        </p>
      </section>

      {/* ---------- CAPABILITIES ---------- */}
      <section id="capabilities" className="border-y border-white/5 bg-navy-900/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-cyan-400 uppercase">
            Platform capabilities
          </p>
          <h2 className="mb-10 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            One automated pipeline. Five mission-critical outputs.
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                className="glass group rounded-lg p-5 transition hover:border-cyan-500/30"
              >
                <span className="mb-4 inline-flex rounded border border-cyan-500/25 bg-cyan-500/10 p-2.5 text-cyan-400 transition group-hover:scale-105">
                  <c.icon size={18} />
                </span>
                <h3 className="text-[14px] font-bold text-slate-100">{c.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- METHODOLOGY ---------- */}
      <section id="methodology" className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-10">
          <p className="mb-1 font-mono text-[10px] font-semibold tracking-[0.25em] text-emerald-400 uppercase">
            Processing methodology
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
            From raw downlink to field-level advisory
          </h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-5">
          {METHOD_PIPELINE.map((p, i) => (
            <div key={p.step} className="relative glass rounded-lg p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[22px] font-bold text-white/10">{p.step}</span>
                {i < METHOD_PIPELINE.length - 1 && (
                  <Layers size={14} className="text-slate-700" />
                )}
              </div>
              <h3 className="text-[13px] font-bold text-cyan-300">{p.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA + FOOTER ---------- */}
      <section className="relative overflow-hidden border-t border-white/5">
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: `url(${IMAGERY.sarNetherlands})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-navy-950/85" />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <CircleDot size={20} className="mx-auto mb-4 text-emerald-400 pulse-dot" />
          <h2 className="text-2xl font-bold text-slate-100 sm:text-3xl">
            Open the operational console
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[13px] text-slate-400">
            Live dashboards, crop intelligence, stress maps and field-level irrigation advisories for
            Mandya District — demonstration dataset, backend-ready architecture.
          </p>
          <Link
            to="/dashboard"
            className="mt-7 inline-flex items-center gap-2 rounded bg-cyan-500 px-6 py-3 text-[13px] font-bold text-navy-950 transition hover:bg-cyan-400"
          >
            <Satellite size={15} />
            Launch ARKTECH Console
          </Link>
        </div>
        <div className="relative border-t border-white/5 px-5 py-6 sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <Logo compact />
            <p className="font-mono text-[9px] tracking-[0.25em] text-slate-600 uppercase">
              ARKTECH · AI-Powered Satellite Agriculture Intelligence & Irrigation Advisory System · Demo
              build · Not for operational use
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
