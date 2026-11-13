import type {
  CropType,
  FieldRecord,
  GrowthStage,
  StressLevel,
  AdvisoryCategory,
  FarmerContact,
} from '../types'

/* ------------------------------------------------------------------ */
/* DEMO DATA - synthetic but scientifically plausible demonstration     */
/* dataset for Mandya District, Karnataka (12.52 N, 76.90 E).          */
/* Replace automatically when the FastAPI backend is connected.        */
/* ------------------------------------------------------------------ */

/** Deterministic pseudo-random generator so demo data is stable across renders */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CROPS: CropType[] = ['Sugarcane', 'Sugarcane', 'Rice', 'Rice', 'Other Crops', 'Fallow Land']
const STAGES: Record<CropType, GrowthStage[]> = {
  Sugarcane: ['Vegetative Growth', 'Vegetative Growth', 'Maturity', 'Harvest'],
  Rice: ['Flowering', 'Vegetative Growth', 'Maturity', 'Harvest'],
  'Fallow Land': ['Sowing / Emergence'],
  'Other Crops': ['Vegetative Growth', 'Flowering', 'Maturity'],
}
const STRESS_BY: Record<StressLevel, [number, number]> = {
  Healthy: [0.48, 0.78],
  'Mild Stress': [0.32, 0.47],
  'Moderate Stress': [0.18, 0.31],
  'Severe Stress': [0.02, 0.17],
}

function advisoryFor(deficit: number): AdvisoryCategory {
  if (deficit <= 10) return 'None'
  if (deficit <= 25) return 'Light'
  if (deficit <= 40) return 'Moderate'
  return 'Urgent'
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v))
}

function buildField(
  i: number,
  rand: () => number,
  centerLat: number,
  centerLon: number,
): FieldRecord {
  const crop = CROPS[Math.floor(rand() * CROPS.length)]
  const stages = STAGES[crop]
  const stage = stages[Math.floor(rand() * stages.length)]
  const stressLevels: StressLevel[] = ['Healthy', 'Healthy', 'Mild Stress', 'Moderate Stress', 'Severe Stress']
  const stress = stressLevels[Math.floor(rand() * stressLevels.length)]
  const [ndviLo, ndviHi] = STRESS_BY[stress]

  const lat = centerLat + (rand() - 0.5) * 0.11
  const lon = centerLon + (rand() - 0.5) * 0.13
  const w = 0.0022 + rand() * 0.0028
  const h = 0.0022 + rand() * 0.003
  const sk = (rand() - 0.5) * 0.0012
  const coordinates: [number, number][] = [
    [lat, lon],
    [lat + h, lon + sk * 0.6],
    [lat + h + sk, lon + w],
    [lat + sk * 0.4, lon + w + h * 0.12],
  ]

  const ndvi = clamp(ndviLo + rand() * (ndviHi - ndviLo), 0.02, 0.85)
  const ndwi = clamp(ndvi - 0.45 + (crop === 'Rice' ? 0.22 : 0.02) - (stress === 'Severe Stress' ? 0.1 : 0), -0.35, 0.55)
  const vci = clamp((ndvi - 0.05) / 0.8, 0.05, 1)
  const smi = clamp(vci * 0.8 + rand() * 0.15 - 0.05, 0.03, 0.95)
  const sarVV = clamp(-16 + (1 - smi) * -6 + rand() * 4, -24, -8)
  const sarVH = clamp(sarVV - 9 + rand() * 3, -30, -14)
  const ndviAnomaly = clamp(ndvi - 0.62, -0.4, 0.25)

  const deficitBase =
    stress === 'Severe Stress'
      ? 40 + rand() * 22
      : stress === 'Moderate Stress'
        ? 25 + rand() * 15
        : stress === 'Mild Stress'
          ? 10 + rand() * 14
          : rand() * 10
  const waterDeficitMm = Math.round(deficitBase * 10) / 10
  const etc = Math.round((3.4 + rand() * 2.4) * 10) / 10
  const eta = Math.round((etc * clamp(smi + 0.25, 0.3, 1)) * 10) / 10
  const rainfall = Math.round(rand() * 18 * 10) / 10
  const cropWaterReq = Math.round((etc * 8 * 0.72 + waterDeficitMm) * 10) / 10
  const irrigationReq = Math.round(Math.max(0, waterDeficitMm) * 10) / 10
  const advisory = advisoryFor(waterDeficitMm)

  const advisoryText =
    advisory === 'None'
      ? 'No irrigation required this 8-day cycle. Soil moisture adequate.'
      : advisory === 'Light'
        ? `Apply ~${irrigationReq} mm supplementary irrigation.`
        : advisory === 'Moderate'
          ? `Apply ~${irrigationReq} mm within 4 days (vegetative demand peak).`
          : `URGENT: apply ${irrigationReq} mm immediately to avoid yield loss (${stage}).`

  return {
    id: `FIELD-${String(i + 1).padStart(3, '0')}`,
    name: `K. Honnalli Block ${i + 1}`,
    crop,
    stage,
    areaHa: Math.round((4 + rand() * 38) * 10) / 10,
    district: 'Mandya',
    lat,
    lon,
    coordinates,
    indices: {
      ndvi: Math.round(ndvi * 1000) / 1000,
      ndwi: Math.round(ndwi * 1000) / 1000,
      vci: Math.round(vci * 1000) / 1000,
      smi: Math.round(smi * 1000) / 1000,
      sarVV: Math.round(sarVV * 100) / 100,
      sarVH: Math.round(sarVH * 100) / 100,
      ndviAnomaly: Math.round(ndviAnomaly * 1000) / 1000,
    },
    stress,
    waterDeficitMm,
    irrigationRequirementMm: irrigationReq,
    etc,
    eta,
    rainfallMm: rainfall,
    cropWaterReqMm: cropWaterReq,
    classificationConfidence: Math.round((0.72 + rand() * 0.26) * 1000) / 1000,
    advisory,
    advisoryText,
  }
}

export const MANDYA_CENTER: [number, number] = [12.522, 76.895]

export const FIELDS: FieldRecord[] = Array.from({ length: 26 }, (_, i) =>
  buildField(i, mulberry32(9021 + i * 7717), MANDYA_CENTER[0], MANDYA_CENTER[1]),
)

export const STRESS_COLORS: Record<StressLevel, string> = {
  Healthy: '#10b981',
  'Mild Stress': '#eab308',
  'Moderate Stress': '#f97316',
  'Severe Stress': '#ef4444',
}

export const CROP_COLORS: Record<CropType, string> = {
  Sugarcane: '#16a34a',
  Rice: '#3b82f6',
  'Fallow Land': '#92764a',
  'Other Crops': '#a3a86b',
}

export const ADVISORY_COLORS: Record<AdvisoryCategory, string> = {
  None: '#10b981',
  Light: '#eab308',
  Moderate: '#f97316',
  Urgent: '#ef4444',
}

/* ---------------- Farmer / block contact registry (DEMO) ---------------- */
/* Deterministic demo contacts mapped to each monitored field block.        */
/* In production this registry is served by the FastAPI backend.            */

const FIRST_NAMES = [
  'Ramesh', 'Siddesh', 'Mahadev', 'Nagaraj', 'Basavaraj', 'Shivanna', 'Girish',
  'Manjunath', 'Chandrashekar', 'Lokesh', 'Prakash', 'Yashoda', 'Savitha',
  'Kavitha', 'Bhavya', 'Anand', 'Venkatesh', 'Deepak', 'Harish', 'Sowmya',
  'Rudresh', 'Kempanna', 'Jayanthi', 'Mallikarjun', 'Lakshmi', 'Ningappa',
]
const LAST_NAMES = [
  'Gowda', 'Nayak', 'Shetty', 'Rao', 'Hegde', 'Kulkarni', 'Patil', 'Reddy',
  'Naik', 'Bhat', 'Acharya', 'Shenoy', 'Honnalli', 'Malligowda', 'Devaraj',
]
const CARRIERS = ['Jio', 'Airtel', 'BSNL', 'Vi']

function contactFor(fieldId: string, seed: number): FarmerContact {
  const rand = mulberry32(seed)
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
  const digits = Array.from({ length: 10 }, () => Math.floor(rand() * 10))
  digits[0] = 6 + Math.floor(rand() * 4) // Indian mobile: starts 6-9
  return {
    fieldId,
    farmer: `${first} ${last}`,
    phone: `+91 ${digits.slice(0, 5).join('')} ${digits.slice(5).join('')}`,
    language: rand() > 0.55 ? 'Kn' : 'En',
    carrier: CARRIERS[Math.floor(rand() * CARRIERS.length)],
  }
}

export const FARMER_CONTACTS: Record<string, FarmerContact> = Object.fromEntries(
  FIELDS.map((f, i) => [f.id, contactFor(f.id, 4451 + i * 911)]),
)

export const LOCATIONS = [  { id: 'mandya', label: 'Mandya District, Karnataka', center: MANDYA_CENTER, zoom: 13 },
  { id: 'mysuru', label: 'Mysuru District, Karnataka', center: [12.295, 76.639] as [number, number], zoom: 13 },
  { id: 'tumkur', label: 'Tumakuru District, Karnataka', center: [13.339, 77.114] as [number, number], zoom: 13 },
  { id: 'belagavi', label: 'Belagavi District, Karnataka', center: [15.849, 74.497] as [number, number], zoom: 13 },
]

export const SEASONS = [
  { id: 'kharif-2026', label: 'Kharif 2026 (Jun–Oct)' },
  { id: 'rabi-2026', label: 'Rabi 2025-26 (Nov–Mar)' },
  { id: 'summer-2025', label: 'Summer 2025 (Feb–May)' },
]
