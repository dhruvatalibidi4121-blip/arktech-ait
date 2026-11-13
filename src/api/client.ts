/**
 * Central API configuration for the future FastAPI backend.
 * All service functions live in ../api/services.ts.
 * When VITE_USE_MOCK=true (or a request fails), bundled demo data is served
 * so the platform works fully without a backend.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
export const USE_MOCK: boolean = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

export const ENDPOINTS = {
  dashboard: '/api/dashboard',
  cropClassification: '/api/crop-classification',
  phenology: '/api/phenology',
  moistureStress: '/api/moisture-stress',
  waterDeficit: '/api/water-deficit',
  irrigationAdvisory: '/api/irrigation-advisory',
  satelliteLayers: '/api/satellite-layers',
  fields: '/api/fields',
  smsDispatch: '/api/irrigation-advisory/sms-dispatch',
} as const

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const TIMEOUT_MS = 8000

/** Small fetch wrapper with timeout + JSON parsing + consistent errors. */
export async function apiGet<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString() : ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE_URL}${path}${qs}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new ApiError(`API ${res.status} on ${path}`, res.status)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/** POST helper for future write operations (e.g. SMS dispatch). */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new ApiError(`API ${res.status} on ${path}`, res.status)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

/** Simulates backend latency for realistic loading states in demo mode. */
export function demoDelay(ms = 420): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
