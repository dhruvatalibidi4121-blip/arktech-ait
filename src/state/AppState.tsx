import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AdvisoryThresholds } from '../types'

export interface AppSettings {
  location: string
  season: string
  date: string
  cropFilter: string
  thresholds: AdvisoryThresholds
  cloudMask: boolean
  autoRefresh: boolean
  apiBaseUrl: string
}

const DEFAULT_THRESHOLDS: AdvisoryThresholds = { noneMax: 10, lightMax: 25, moderateMax: 40 }

const DEFAULT_SETTINGS: AppSettings = {
  location: 'mandya',
  season: 'kharif-2026',
  date: '2026-11-09',
  cropFilter: 'all',
  thresholds: DEFAULT_THRESHOLDS,
  cloudMask: true,
  autoRefresh: false,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
}

interface AppStateValue {
  settings: AppSettings
  setSettings: (patch: Partial<AppSettings>) => void
  setThresholds: (t: AdvisoryThresholds) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

const STORAGE_KEY = 'arktech-settings-v1'

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    } catch {
      /* ignore corrupted storage */
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* storage unavailable */
    }
  }, [settings])

  const setSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((s) => ({ ...s, ...patch }))
  }, [])

  const setThresholds = useCallback((t: AdvisoryThresholds) => {
    setSettingsState((s) => ({ ...s, thresholds: t }))
  }, [])

  const value = useMemo(() => ({ settings, setSettings, setThresholds }), [settings, setSettings, setThresholds])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
