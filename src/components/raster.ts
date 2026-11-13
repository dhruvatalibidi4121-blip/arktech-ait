import type { MapLayerId, CropType } from '../types'

/**
 * Generates demo raster overlays (data-URL PNGs) for NDVI / NDWI / VCI / SMI /
 * SAR / stress layers. Values are deterministic seeded value-noise, rendered
 * with scientific colormaps. Clearly identified as DEMO data in the UI.
 */

type RGB = [number, number, number]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function sampleColormap(stops: { t: number; c: RGB }[], t: number): RGB {
  const x = Math.min(1, Math.max(0, t))
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (x >= a.t && x <= b.t) {
      const f = (x - a.t) / (b.t - a.t || 1)
      return [lerp(a.c[0], b.c[0], f), lerp(a.c[1], b.c[1], f), lerp(a.c[2], b.c[2], f)]
    }
  }
  return stops[stops.length - 1].c
}

const COLORMAPS: Record<string, { t: number; c: RGB }[]> = {
  ndvi: [
    { t: 0, c: [97, 61, 35] },
    { t: 0.3, c: [222, 176, 63] },
    { t: 0.55, c: [146, 199, 82] },
    { t: 0.8, c: [34, 140, 61] },
    { t: 1, c: [9, 82, 40] },
  ],
  ndwi: [
    { t: 0, c: [110, 84, 48] },
    { t: 0.35, c: [140, 158, 130] },
    { t: 0.6, c: [72, 148, 190] },
    { t: 0.85, c: [23, 91, 176] },
    { t: 1, c: [8, 48, 120] },
  ],
  vci: [
    { t: 0, c: [178, 24, 43] },
    { t: 0.28, c: [247, 129, 27] },
    { t: 0.5, c: [254, 216, 82] },
    { t: 0.72, c: [108, 190, 84] },
    { t: 1, c: [18, 110, 55] },
  ],
  smi: [
    { t: 0, c: [166, 122, 71] },
    { t: 0.35, c: [214, 200, 130] },
    { t: 0.6, c: [110, 178, 168] },
    { t: 0.85, c: [39, 105, 178] },
    { t: 1, c: [16, 56, 130] },
  ],
  sar: [
    { t: 0, c: [12, 16, 26] },
    { t: 0.3, c: [52, 74, 110] },
    { t: 0.6, c: [108, 160, 190] },
    { t: 0.85, c: [196, 224, 238] },
    { t: 1, c: [244, 250, 255] },
  ],
  stress: [
    { t: 0, c: [178, 30, 38] },
    { t: 0.3, c: [244, 120, 32] },
    { t: 0.5, c: [234, 190, 60] },
    { t: 0.75, c: [80, 170, 80] },
    { t: 1, c: [16, 110, 58] },
  ],
}

/** Deterministic PRNG */
function prng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function valueNoiseGrid(size: number, cells: number, seed: number) {
  const r = prng(seed)
  const g: number[][] = []
  for (let i = 0; i <= cells; i++) {
    const row: number[] = []
    for (let j = 0; j <= cells; j++) row.push(r())
    g.push(row)
  }
  const out: number[] = new Array(size * size)
  const smooth = (t: number) => t * t * (3 - 2 * t)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * cells
      const gy = (y / size) * cells
      const x0 = Math.floor(gx)
      const y0 = Math.floor(gy)
      const fx = smooth(gx - x0)
      const fy = smooth(gy - y0)
      const v =
        (1 - fx) * (1 - fy) * g[y0][x0] +
        fx * (1 - fy) * g[y0][x0 + 1] +
        (1 - fx) * fy * g[y0 + 1][x0] +
        fx * fy * g[y0 + 1][x0 + 1]
      out[y * size + x] = v
    }
  }
  return out
}

function normalize(v: number, min: number, max: number) {
  return Math.min(1, Math.max(0, (v - min) / (max - min || 1)))
}

const RASTER_RANGE: Partial<Record<MapLayerId, [number, number]>> = {
  ndvi: [0.05, 0.8],
  ndwi: [-0.25, 0.5],
  vci: [0.05, 0.95],
  smi: [0.05, 0.9],
  sarvv: [-21, -8],
  sarvh: [-26, -13],
}

const cache = new Map<string, string>()

export function generateIndexRaster(layer: MapLayerId, seed = 42, size = 224): string {
  const key = `${layer}-${seed}-${size}`
  const cached = cache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  if (layer === 'classification' || layer === 'rgb' || layer === 'advisory') {
    // handled elsewhere (crop blobs / advisory uses field fills) - fallback stress map
  }

  const coarse = valueNoiseGrid(size, 7, seed * 1000 + 17)
  const fine = valueNoiseGrid(size, 24, seed * 1000 + 891)

  let colormap = COLORMAPS.ndvi
  let range: [number, number] = [0, 1]
  if (layer === 'ndwi') colormap = COLORMAPS.ndwi
  else if (layer === 'vci') colormap = COLORMAPS.vci
  else if (layer === 'smi') colormap = COLORMAPS.smi
  else if (layer === 'sarvv' || layer === 'sarvh') colormap = COLORMAPS.sar
  else if (layer === 'stress') colormap = COLORMAPS.stress
  if (RASTER_RANGE[layer]) range = RASTER_RANGE[layer] as [number, number]

  const img = ctx.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    let t = normalize(coarse[i] * 0.72 + fine[i] * 0.28, range[0], range[1])
    if (layer === 'sarvv' || layer === 'sarvh') t = 1 - t * 0.9
    const c = sampleColormap(colormap, t)
    img.data[i * 4] = c[0]
    img.data[i * 4 + 1] = c[1]
    img.data[i * 4 + 2] = c[2]
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const url = canvas.toDataURL('image/png')
  cache.set(key, url)
  return url
}

/** Crop-blob raster for the classification demo overlay */
const CROP_BLOB_COLORS: Record<CropType, RGB> = {
  Sugarcane: [30, 138, 60],
  Rice: [52, 110, 220],
  'Fallow Land': [138, 108, 62],
  'Other Crops': [158, 168, 92],
}

export function generateClassificationRaster(seed = 5, size = 224): string {
  const key = `classification-${seed}-${size}`
  const cached = cache.get(key)
  if (cached) return cached
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const coarse = valueNoiseGrid(size, 6, seed * 1000 + 5)
  const fine = valueNoiseGrid(size, 16, seed * 1000 + 77)
  const img = ctx.createImageData(size, size)
  const crops: CropType[] = ['Sugarcane', 'Rice', 'Other Crops', 'Fallow Land']
  for (let i = 0; i < size * size; i++) {
    const v = coarse[i] * 0.7 + fine[i] * 0.3
    const idx = v < 0.34 ? 0 : v < 0.58 ? 1 : v < 0.82 ? 2 : 3
    const c = CROP_BLOB_COLORS[crops[idx]]
    const jitter = (fine[i] - 0.5) * 22
    img.data[i * 4] = Math.min(255, Math.max(0, c[0] + jitter))
    img.data[i * 4 + 1] = Math.min(255, Math.max(0, c[1] + jitter))
    img.data[i * 4 + 2] = Math.min(255, Math.max(0, c[2] + jitter))
    img.data[i * 4 + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const url = canvas.toDataURL('image/png')
  cache.set(key, url)
  return url
}

/** Value ramp helpers shared by map polygon fills */
export function rampColor(ndvi: number): string {
  const c = sampleColormap(COLORMAPS.ndvi, normalize(ndvi, 0.05, 0.8))
  return `rgb(${c.map((v) => Math.round(v)).join(',')})`
}

export function indexColor(layer: MapLayerId, value: number): string {
  let stops = COLORMAPS.ndvi
  let min = 0.05
  let max = 0.8
  if (layer === 'ndwi') {
    stops = COLORMAPS.ndwi
    min = -0.25
    max = 0.5
  } else if (layer === 'vci') {
    stops = COLORMAPS.vci
    min = 0.05
    max = 0.95
  } else if (layer === 'smi') {
    stops = COLORMAPS.smi
    min = 0.05
    max = 0.9
  } else if (layer === 'sarvv') {
    stops = COLORMAPS.sar
    min = -21
    max = -8
  } else if (layer === 'sarvh') {
    stops = COLORMAPS.sar
    min = -26
    max = -13
  }
  const c = sampleColormap(stops, normalize(value, min, max))
  return `rgb(${c.map((v) => Math.round(v)).join(',')})`
}
