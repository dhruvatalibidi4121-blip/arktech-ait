import type {
  DashboardKpis,
  CropClassSummary,
  ClassificationMeta,
  PhenologyPoint,
  PhenologyMilestone,
  ObservationPass,
  StressPoint,
  WaterDeficitPoint,
  LayerInfo,
  ReportDef,
  SatelliteSource,
} from '../types'
import { IMAGERY } from '../config/imagery'
import { CROP_COLORS, FIELDS } from './fields'

/* ------------------------------------------------------------------ */
/* All series below are DEMO datasets generated for the frontend demo. */
/* They are deterministic and will be replaced by the FastAPI backend. */
/* ------------------------------------------------------------------ */

export const KPIS: DashboardKpis = {
  totalMonitoredHa: FIELDS.reduce((s, f) => s + f.areaHa, 0) + 28470,
  identifiedCropTypes: 4,
  healthyVegetationPct: 61.4,
  stressedAreaHa: 9382,
  waterDeficitMm: 27.8,
  fieldsRequiringIrrigation: FIELDS.filter((f) => f.waterDeficitMm > 10).length,
  lastPass: '2026-11-09 (Sentinel-2B)',
  cloudCoverPct: 12,
}

export const CROP_SUMMARY: CropClassSummary[] = [
  { crop: 'Sugarcane', areaHa: 18320, pct: 38.2, color: CROP_COLORS.Sugarcane, confidencePct: 93.4 },
  { crop: 'Rice', areaHa: 12760, pct: 26.6, color: CROP_COLORS.Rice, confidencePct: 91.1 },
  { crop: 'Other Crops', areaHa: 8410, pct: 17.5, color: CROP_COLORS['Other Crops'], confidencePct: 86.8 },
  { crop: 'Fallow Land', areaHa: 8500, pct: 17.7, color: CROP_COLORS['Fallow Land'], confidencePct: 94.2 },
]

export const CLASSIFICATION_META: ClassificationMeta = {
  algorithm: 'Random Forest / XGBoost ensemble with deep-learning feature extractor',
  features: [
    'Multi-temporal spectral signatures',
    'NDVI',
    'EVI',
    'NDWI',
    'Red / Green / Blue / NIR / SWIR bands',
    'SAR VV backscatter',
    'SAR VH backscatter',
    'Texture & phenological metrics',
  ],
  overallAccuracy: 91.6,
  kappa: 0.889,
  trainedSamples: 4860,
  season: 'Kharif 2026',
  confusion: [
    { actual: 'Sugarcane', row: [94, 4, 1, 1] },
    { actual: 'Rice', row: [5, 90, 4, 1] },
    { actual: 'Other Crops', row: [3, 6, 87, 4] },
    { actual: 'Fallow Land', row: [2, 1, 3, 94] },
  ],
}

/* Deterministic NDVI phenology curve builder */
function ndviCurve(seed: number, peak: number, sosDoy: number, eosDoy: number) {
  const rand = (() => {
    let s = seed
    return () => {
      s = (s * 16807 + 17) % 2147483647
      return s / 2147483647
    }
  })()
  const out: { doy: number; ndvi: number }[] = []
  for (let doy = 1; doy <= 365; doy += 8) {
    const base = 0.14 + 0.03 * Math.sin(doy / 48)
    let v = base
    if (doy >= sosDoy && doy <= eosDoy) {
      const t = (doy - sosDoy) / (eosDoy - sosDoy)
      const shaped = t < 0.45 ? Math.pow(t / 0.45, 1.4) : Math.pow(1 - (t - 0.45) / 0.55, 1.1)
      v = base + (peak - base) * shaped
    }
    out.push({ doy, ndvi: Math.round(Math.min(0.92, Math.max(0.08, v + (rand() - 0.5) * 0.035)) * 1000) / 1000 })
  }
  return out
}

const riceCurve = ndviCurve(7, 0.74, 145, 322)
const sugarcaneCurve = ndviCurve(13, 0.86, 45, 361)

const dateFromDoy = (doy: number) => {
  const d = new Date(2026, 0, 1)
  d.setDate(doy)
  return d.toISOString().slice(0, 10)
}

export const PHENOLOGY: PhenologyPoint[] = riceCurve.map((p, i) => ({
  date: dateFromDoy(p.doy),
  doy: p.doy,
  ndviRice: p.ndvi,
  ndviSugarcane: sugarcaneCurve[i].ndvi,
  ndwiRice: Math.round((p.ndvi - 0.35 + (p.doy > 150 && p.doy < 230 ? 0.25 : 0)) * 1000) / 1000,
}))

export const PHENOLOGY_MILESTONES: PhenologyMilestone[] = [
  { crop: 'Rice', sos: '2026-05-26', peak: '2026-08-30', eos: '2026-11-18', lgd: 176, currentStage: 'Flowering' },
  { crop: 'Sugarcane', sos: '2026-02-15', peak: '2026-09-12', eos: '2026-12-27', lgd: 316, currentStage: 'Vegetative Growth' },
]

export const OBSERVATION_PASSES: ObservationPass[] = [
  { date: '2026-11-09', satellite: 'Sentinel-2B', sensor: 'MSI', resolution: '10 m', cloudPct: 8, status: 'Acquired' },
  { date: '2026-11-07', satellite: 'EOS-04', sensor: 'SAR C-band', resolution: '18 m', cloudPct: 0, status: 'Acquired' },
  { date: '2026-11-05', satellite: 'Resourcesat-2A', sensor: 'LISS-III', resolution: '23.5 m', cloudPct: 21, status: 'Acquired' },
  { date: '2026-11-03', satellite: 'Sentinel-1A', sensor: 'C-SAR', resolution: '20 m', cloudPct: 0, status: 'Acquired' },
  { date: '2026-11-01', satellite: 'Landsat 9', sensor: 'OLI-2', resolution: '30 m', cloudPct: 14, status: 'Acquired' },
  { date: '2026-10-30', satellite: 'Terra/Aqua', sensor: 'MODIS', resolution: '250 m', cloudPct: 18, status: 'Acquired' },
  { date: '2026-11-12', satellite: 'Resourcesat-2A', sensor: 'LISS-IV', resolution: '5.8 m', cloudPct: 6, status: 'Processing' },
  { date: '2026-11-14', satellite: 'Sentinel-1A', sensor: 'C-SAR', resolution: '20 m', cloudPct: 0, status: 'Scheduled' },
]

export const STRESS_SERIES: StressPoint[] = [
  { period: 'Jun W1', healthy: 92, mild: 6, moderate: 2, severe: 0, sarVVdB: -13.8, ndviAnomaly: 0.06 },
  { period: 'Jun W3', healthy: 88, mild: 8, moderate: 3, severe: 1, sarVVdB: -14.1, ndviAnomaly: 0.03 },
  { period: 'Jul W1', healthy: 84, mild: 10, moderate: 5, severe: 1, sarVVdB: -14.6, ndviAnomaly: 0.0 },
  { period: 'Jul W3', healthy: 76, mild: 13, moderate: 8, severe: 3, sarVVdB: -15.2, ndviAnomaly: -0.04 },
  { period: 'Aug W1', healthy: 71, mild: 15, moderate: 10, severe: 4, sarVVdB: -15.9, ndviAnomaly: -0.07 },
  { period: 'Aug W3', healthy: 66, mild: 17, moderate: 12, severe: 5, sarVVdB: -16.3, ndviAnomaly: -0.09 },
  { period: 'Sep W1', healthy: 62, mild: 18, moderate: 14, severe: 6, sarVVdB: -16.8, ndviAnomaly: -0.11 },
  { period: 'Sep W3', healthy: 58, mild: 19, moderate: 16, severe: 7, sarVVdB: -17.2, ndviAnomaly: -0.13 },
  { period: 'Oct W1', healthy: 61, mild: 18, moderate: 15, severe: 6, sarVVdB: -16.6, ndviAnomaly: -0.1 },
  { period: 'Oct W3', healthy: 63, mild: 18, moderate: 14, severe: 5, sarVVdB: -16.1, ndviAnomaly: -0.08 },
  { period: 'Nov W1', healthy: 62, mild: 19, moderate: 13, severe: 6, sarVVdB: -16.9, ndviAnomaly: -0.12 },
  { period: 'Nov W2', healthy: 61, mild: 20, moderate: 13, severe: 6, sarVVdB: -17.0, ndviAnomaly: -0.12 },
]

export const WATER_DEFICIT: WaterDeficitPoint[] = [
  { period: 'Sep W3', etc: 28.4, eta: 26.1, rainfall: 12, deficit: 9.2, irrigationReq: 9.2 },
  { period: 'Oct W1', etc: 29.8, eta: 26.4, rainfall: 8, deficit: 14.6, irrigationReq: 14.6 },
  { period: 'Oct W3', etc: 30.6, eta: 25.8, rainfall: 6, deficit: 19.8, irrigationReq: 19.8 },
  { period: 'Nov W1', etc: 31.2, eta: 24.9, rainfall: 4, deficit: 24.6, irrigationReq: 24.6 },
  { period: 'Nov W2', etc: 32.1, eta: 24.2, rainfall: 2, deficit: 27.8, irrigationReq: 27.8 },
  { period: 'Nov W3', etc: 32.8, eta: 23.6, rainfall: 0, deficit: 31.4, irrigationReq: 31.4 },
  { period: 'Dec W1', etc: 33.2, eta: 23.1, rainfall: 0, deficit: 34.9, irrigationReq: 34.9 },
  { period: 'Dec W2', etc: 33.6, eta: 22.8, rainfall: 0, deficit: 37.2, irrigationReq: 37.2 },
]

export const MAP_LAYERS: LayerInfo[] = [
  { id: 'rgb', label: 'RGB Satellite', description: 'True colour optical mosaic (Esri World Imagery)', source: 'Esri / Maxar', demo: false },
  { id: 'classification', label: 'Crop Classification', description: 'RF/XGBoost multi-temporal crop map', source: 'ARKTECH model', demo: true },
  { id: 'ndvi', label: 'NDVI', description: 'Normalised Difference Vegetation Index', source: 'Sentinel-2 / LISS-III', demo: true },
  { id: 'ndwi', label: 'NDWI', description: 'Normalised Difference Water Index', source: 'Sentinel-2', demo: true },
  { id: 'vci', label: 'VCI', description: 'Vegetation Condition Index', source: 'MODIS composites', demo: true },
  { id: 'smi', label: 'SMI', description: 'Soil Moisture Index', source: 'Optical + SAR fusion', demo: true },
  { id: 'sarvv', label: 'SAR VV', description: 'C-band VV polarisation backscatter', source: 'EOS-04 / Sentinel-1', demo: true },
  { id: 'sarvh', label: 'SAR VH', description: 'C-band VH polarisation backscatter', source: 'EOS-04 / Sentinel-1', demo: true },
  { id: 'stress', label: 'Moisture Stress', description: 'Phenology-aware stress classification', source: 'ARKTECH model', demo: true },
  { id: 'advisory', label: 'Irrigation Advisory', description: '8-day deficit advisory categories', source: 'ARKTECH model', demo: true },
]

export const SATELLITE_SOURCES: SatelliteSource[] = [
  {
    id: 'liss4',
    name: 'LISS-IV',
    category: 'optical',
    agency: 'ISRO · Resourcesat-2A',
    sensor: 'Multispectral 3-band + mono',
    resolution: '5.8 m',
    revisit: '5 days (steer 24 days)',
    bands: 'B, G, R, NIR',
    application: 'Field-level crop identification, precise crop area estimation, boundary delineation',
    status: 'Operational',
    image: IMAGERY.satResourcesat,
    imageAlt: 'Resourcesat-2A spacecraft render (ISRO)',
  },
  {
    id: 'liss3',
    name: 'LISS-III',
    category: 'optical',
    agency: 'ISRO · Resourcesat-2A',
    sensor: 'Multispectral 4-band',
    resolution: '23.5 m',
    revisit: '24 days',
    bands: 'B, G, R, NIR, SWIR',
    application: 'District crop mapping, vegetation vigour, seasonal phenology tracking',
    status: 'Operational',
    image: IMAGERY.awifsScene,
    imageAlt: 'Sample IRS AWiFS acquisition',
  },
  {
    id: 'awifs',
    name: 'AWiFS',
    category: 'optical',
    agency: 'ISRO · Resourcesat-2A',
    sensor: 'Advanced Wide Field Sensor',
    resolution: '56 m',
    revisit: '5 days',
    bands: 'B, G, R, NIR, SWIR',
    application: 'Large-area crop monitoring, early-season crop coverage, drought assessment',
    status: 'Operational',
    image: IMAGERY.awifsScene,
    imageAlt: 'Sample IRS AWiFS scene',
  },
  {
    id: 'sentinel2',
    name: 'Sentinel-2 MSI',
    category: 'optical',
    agency: 'ESA · Copernicus',
    sensor: 'Multispectral Instrument',
    resolution: '10 / 20 / 60 m',
    revisit: '5 days (S2A+S2B)',
    bands: '13 bands, VNIR + SWIR',
    application: 'High-frequency NDVI/NDWI/EVI time series, crop phenology, stress indices',
    status: 'Operational',
    image: IMAGERY.satSentinel2,
    imageAlt: 'Copernicus Sentinel-2 spacecraft (ESA)',
  },
  {
    id: 'landsat',
    name: 'Landsat 8 / 9',
    category: 'optical',
    agency: 'NASA · USGS',
    sensor: 'OLI / OLI-2 + TIRS',
    resolution: '30 m (15 m pan)',
    revisit: '8 days combined',
    bands: '11 bands, VNIR + SWIR + TIR',
    application: 'Long-archive crop history, land use change, thermal stress detection',
    status: 'Operational',
    image: IMAGERY.satLandsat8,
    imageAlt: 'Landsat 8 spacecraft model (NASA)',
  },
  {
    id: 'modis',
    name: 'MODIS',
    category: 'optical',
    agency: 'NASA · Terra / Aqua',
    sensor: 'MODIS',
    resolution: '250 / 500 / 1000 m',
    revisit: 'Daily',
    bands: '36 bands',
    application: 'VCI/TCI drought composites, regional vegetation condition, ET inputs',
    status: 'Operational',
    image: IMAGERY.satTerra,
    imageAlt: 'Terra spacecraft model (NASA)',
  },
  {
    id: 'eos04',
    name: 'EOS-04 (RISAT-1A)',
    category: 'sar',
    agency: 'ISRO',
    sensor: 'C-band SAR (MRS/CRS)',
    resolution: '3–36 m',
    revisit: '~25 days (mode-dependent)',
    bands: 'C-band, VV/VH, HV',
    application: 'All-weather crop monitoring, paddy detection, soil moisture under cloud',
    status: 'Operational',
    image: IMAGERY.satRisatEos04,
    imageAlt: 'EOS-04 (RISAT-1A) spacecraft render (ISRO)',
  },
  {
    id: 'sentinel1',
    name: 'Sentinel-1 C-SAR',
    category: 'sar',
    agency: 'ESA · Copernicus',
    sensor: 'C-SAR IW GRD',
    resolution: '20 × 22 m',
    revisit: '6-12 days',
    bands: 'C-band, VV + VH',
    application: 'Cloud-free phenology, crop structure, irrigation event detection',
    status: 'Operational',
    image: IMAGERY.satSentinel1,
    imageAlt: 'Copernicus Sentinel-1 spacecraft (ESA)',
  },
  {
    id: 'nisar',
    name: 'NISAR',
    category: 'sar',
    agency: 'NASA · ISRO joint',
    sensor: 'L-band + S-band SAR',
    resolution: '5–10 m',
    revisit: '12 days',
    bands: 'L-band & S-band, polarimetric',
    application: 'Deep soil moisture retrieval, crop biomass, wetland & flood mapping',
    status: 'Commissioning',
    image: IMAGERY.satNisar,
    imageAlt: 'NISAR spacecraft model (NASA/ISRO)',
  },
]

export const REPORT_DEFS: ReportDef[] = [
  {
    id: 'crop',
    title: 'Crop Classification Report',
    description: 'Multi-temporal classified crop areas, confidence and accuracy assessment for the selected season.',
    icon: 'crop',
    updated: '2026-11-09 06:20 IST',
  },
  {
    id: 'phenology',
    title: 'Phenology Report',
    description: 'SOS, peak vegetation, EOS and growing period length per crop with satellite observation log.',
    icon: 'phenology',
    updated: '2026-11-08 18:45 IST',
  },
  {
    id: 'stress',
    title: 'Moisture Stress Report',
    description: 'NDVI anomaly, VCI, SMI and SAR-based stress classification by growth stage.',
    icon: 'stress',
    updated: '2026-11-09 06:20 IST',
  },
  {
    id: 'water',
    title: 'Water Deficit Report',
    description: '8-day ETc, ETa, rainfall balance and field-wise crop water deficit ledger.',
    icon: 'water',
    updated: '2026-11-10 05:30 IST',
  },
  {
    id: 'advisory',
    title: 'Irrigation Advisory Report',
    description: 'Field-wise irrigation advisories, water requirement totals and priority ranking.',
    icon: 'advisory',
    updated: '2026-11-10 05:30 IST',
  },
]
