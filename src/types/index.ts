export type CropType = 'Sugarcane' | 'Rice' | 'Fallow Land' | 'Other Crops'

export type GrowthStage =
  | 'Sowing / Emergence'
  | 'Vegetative Growth'
  | 'Flowering'
  | 'Maturity'
  | 'Harvest'

export type StressLevel = 'Healthy' | 'Mild Stress' | 'Moderate Stress' | 'Severe Stress'

export type AdvisoryCategory = 'None' | 'Light' | 'Moderate' | 'Urgent'

export type MapLayerId =
  | 'rgb'
  | 'classification'
  | 'ndvi'
  | 'ndwi'
  | 'vci'
  | 'smi'
  | 'sarvv'
  | 'sarvh'
  | 'stress'
  | 'advisory'

export interface FieldIndices {
  ndvi: number
  ndwi: number
  vci: number
  smi: number
  sarVV: number
  sarVH: number
  ndviAnomaly: number
}

export interface FieldRecord {
  id: string
  name: string
  crop: CropType
  stage: GrowthStage
  areaHa: number
  district: string
  lat: number
  lon: number
  coordinates: [number, number][]
  indices: FieldIndices
  stress: StressLevel
  waterDeficitMm: number
  irrigationRequirementMm: number
  etc: number
  eta: number
  rainfallMm: number
  cropWaterReqMm: number
  classificationConfidence: number
  advisory: AdvisoryCategory
  advisoryText: string
}

export interface DashboardKpis {
  totalMonitoredHa: number
  identifiedCropTypes: number
  healthyVegetationPct: number
  stressedAreaHa: number
  waterDeficitMm: number
  fieldsRequiringIrrigation: number
  lastPass: string
  cloudCoverPct: number
}

export interface CropClassSummary {
  crop: CropType
  areaHa: number
  pct: number
  color: string
  confidencePct: number
}

export interface ClassificationMeta {
  algorithm: string
  features: string[]
  overallAccuracy: number
  kappa: number
  trainedSamples: number
  season: string
  confusion: { actual: CropType; row: number[] }[]
}

export interface PhenologyPoint {
  date: string
  doy: number
  ndviRice: number
  ndviSugarcane: number
  ndwiRice: number
}

export interface PhenologyMilestone {
  crop: CropType
  sos: string
  peak: string
  eos: string
  lgd: number
  currentStage: GrowthStage
}

export interface ObservationPass {
  date: string
  satellite: string
  sensor: string
  resolution: string
  cloudPct: number
  status: 'Acquired' | 'Processing' | 'Scheduled'
}

export interface StressPoint {
  period: string
  healthy: number
  mild: number
  moderate: number
  severe: number
  sarVVdB: number
  ndviAnomaly: number
}

export interface WaterDeficitPoint {
  period: string
  etc: number
  eta: number
  rainfall: number
  deficit: number
  irrigationReq: number
}

export interface AdvisoryThresholds {
  noneMax: number
  lightMax: number
  moderateMax: number
}

export interface SatelliteSource {
  id: string
  name: string
  category: 'optical' | 'sar'
  agency: string
  sensor: string
  resolution: string
  revisit: string
  bands: string
  application: string
  status: 'Operational' | 'Archive Access' | 'Commissioning' | 'Planned'
  image: string
  imageAlt: string
}

export interface LayerInfo {
  id: MapLayerId
  label: string
  description: string
  source: string
  demo: boolean
}

export interface ReportDef {
  id: string
  title: string
  description: string
  icon: 'crop' | 'phenology' | 'stress' | 'water' | 'advisory'
  updated: string
}

export interface FarmerContact {
  fieldId: string
  farmer: string
  phone: string
  language: 'Kn' | 'En'
  carrier: string
}

export type SmsStatus = 'Queued' | 'Sent' | 'Delivered' | 'Failed'

export interface SmsDispatchResult {
  fieldId: string
  phone: string
  status: SmsStatus
  messageId: string
  segments: number
  provider: string
}

export interface SmsDispatchPayload {
  fieldIds: string[]
  messages: Record<string, string>
  senderId: string
}
