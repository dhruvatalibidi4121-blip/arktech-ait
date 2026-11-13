import type {
  DashboardKpis,
  CropClassSummary,
  ClassificationMeta,
  PhenologyPoint,
  PhenologyMilestone,
  ObservationPass,
  StressPoint,
  WaterDeficitPoint,
  FieldRecord,
  LayerInfo,
  SmsDispatchPayload,
  SmsDispatchResult,
} from '../types'
import { apiGet, apiPost, USE_MOCK, ENDPOINTS, demoDelay } from './client'
import {
  KPIS,
  CROP_SUMMARY,
  CLASSIFICATION_META,
  PHENOLOGY,
  PHENOLOGY_MILESTONES,
  OBSERVATION_PASSES,
  STRESS_SERIES,
  WATER_DEFICIT,
  MAP_LAYERS,
} from '../data/datasets'
import { FIELDS, FARMER_CONTACTS } from '../data/fields'

/* Every service falls back to bundled demo data when the backend is
   not connected (VITE_USE_MOCK=true) or a call fails. Demo data is
   kept strictly inside ../data - never mixed with real API calls.  */

export interface PhenologyBundle {
  series: PhenologyPoint[]
  milestones: PhenologyMilestone[]
  observations: ObservationPass[]
}

export interface ClassificationBundle {
  summary: CropClassSummary[]
  meta: ClassificationMeta
}

export interface MoistureBundle {
  series: StressPoint[]
}

export interface WaterDeficitBundle {
  series: WaterDeficitPoint[]
}

async function withMock<T>(mock: () => T, live: () => Promise<T>): Promise<T> {
  if (USE_MOCK) {
    await demoDelay()
    return mock()
  }
  try {
    return await live()
  } catch (err) {
    console.warn(`[ARKTECH] API unavailable, serving demo data:`, err)
    await demoDelay(300)
    return mock()
  }
}

export const getDashboard = (params: { location?: string; season?: string } = {}) =>
  withMock(
    () => KPIS,
    () => apiGet<DashboardKpis>(ENDPOINTS.dashboard, params),
  )

export const getCropClassification = (params: { season?: string } = {}) =>
  withMock(
    () => ({ summary: CROP_SUMMARY, meta: CLASSIFICATION_META }),
    () => apiGet<ClassificationBundle>(ENDPOINTS.cropClassification, params),
  )

export const getPhenology = (params: { crop?: string; season?: string } = {}) =>
  withMock(
    () => ({ series: PHENOLOGY, milestones: PHENOLOGY_MILESTONES, observations: OBSERVATION_PASSES }),
    () => apiGet<PhenologyBundle>(ENDPOINTS.phenology, params),
  )

export const getMoistureStress = (params: { stage?: string; season?: string } = {}) =>
  withMock(
    () => ({ series: STRESS_SERIES }),
    () => apiGet<MoistureBundle>(ENDPOINTS.moistureStress, params),
  )

export const getWaterDeficit = (params: { season?: string } = {}) =>
  withMock(
    () => ({ series: WATER_DEFICIT }),
    () => apiGet<WaterDeficitBundle>(ENDPOINTS.waterDeficit, params),
  )

export const getIrrigationAdvisory = (params: { crop?: string; advisory?: string } = {}) =>
  withMock(
    () => FIELDS,
    () => apiGet<FieldRecord[]>(ENDPOINTS.irrigationAdvisory, params),
  )

export const getSatelliteLayers = () =>
  withMock(
    () => MAP_LAYERS,
    () => apiGet<LayerInfo[]>(ENDPOINTS.satelliteLayers),
  )

export const getFields = (params: { location?: string } = {}) =>
  withMock(
    () => FIELDS,
    () => apiGet<FieldRecord[]>(ENDPOINTS.fields, params),
  )

/**
 * SMS dispatch. Mock mode simulates a gateway (per-message latency + delivery
 * receipts). In production the FastAPI backend relays to the configured SMS
 * gateway (e.g. Twilio / government DLT-registered route) and returns receipts.
 */
export const dispatchSmsAdvisories = (payload: SmsDispatchPayload) =>
  withMock(
    () => simulateSmsDispatch(payload),
    () => apiPost<SmsDispatchResult[]>(ENDPOINTS.smsDispatch, payload),
  )

/** Deterministic-ish gateway simulation: ~92% delivered, ~5% queued, ~3% failed */
function simulateSmsDispatch(payload: SmsDispatchPayload): SmsDispatchResult[] {
  const provider = 'DLT-SMS GATEWAY (SIM)'
  return payload.fieldIds.map((fieldId, i) => {
    const r = Math.random()
    const status: SmsDispatchResult['status'] =
      r > 0.08 ? 'Delivered' : r > 0.03 ? 'Queued' : 'Failed'
    const phone = FARMER_CONTACTS[fieldId]?.phone ?? 'unknown'
    const segments = payload.messages[fieldId] ? Math.ceil(payload.messages[fieldId].length / 160) : 1
    return {
      fieldId,
      phone,
      status,
      messageId: `MSG${Date.now().toString().slice(-8)}${String(i).padStart(2, '0')}`,
      segments,
      provider,
    }
  })
}

export const Phenology = { PHENOLOGY, PHENOLOGY_MILESTONES, OBSERVATION_PASSES }
export const Stress = { STRESS_SERIES }
export const Water = { WATER_DEFICIT }
export const Classification = { CROP_SUMMARY, CLASSIFICATION_META }
