import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Polygon, ImageOverlay, ScaleControl, Tooltip, useMapEvents } from 'react-leaflet'
import type { FieldRecord, MapLayerId } from '../types'
import { ADVISORY_COLORS, CROP_COLORS, STRESS_COLORS } from '../data/fields'
import { TILE_LAYERS } from '../config/imagery'
import { generateIndexRaster, indexColor } from './raster'
import MapLayerControl, { MapLegend } from './MapLayerControl'
import FieldInfoPanel from './FieldInfoPanel'

/** Bounding box of the demo index raster around Mandya AOI */
const RASTER_BOUNDS: [[number, number], [number, number]] = [
  [12.4, 76.77],
  [12.65, 77.02],
]

const GIBS_DATE = '2026-11-09'

function stressColorFor(field: FieldRecord): string {
  return STRESS_COLORS[field.stress]
}

function fieldFill(field: FieldRecord, layer: MapLayerId): string {
  const i = field.indices
  switch (layer) {
    case 'classification':
      return CROP_COLORS[field.crop]
    case 'ndvi':
      return indexColor('ndvi', i.ndvi)
    case 'ndwi':
      return indexColor('ndwi', i.ndwi)
    case 'vci':
      return indexColor('vci', i.vci)
    case 'smi':
      return indexColor('smi', i.smi)
    case 'sarvv':
      return indexColor('sarvv', i.sarVV)
    case 'sarvh':
      return indexColor('sarvh', i.sarVH)
    case 'stress':
      return stressColorFor(field)
    case 'advisory':
      return ADVISORY_COLORS[field.advisory]
    default:
      return 'transparent'
  }
}

const LAYER_LEGENDS: Partial<Record<MapLayerId, { title: string; items: { label: string; color: string }[] }>> = {
  classification: {
    title: 'Crop classification',
    items: (Object.keys(CROP_COLORS) as (keyof typeof CROP_COLORS)[]).map((k) => ({
      label: k,
      color: CROP_COLORS[k],
    })),
  },
  stress: {
    title: 'Moisture stress',
    items: (Object.keys(STRESS_COLORS) as (keyof typeof STRESS_COLORS)[]).map((k) => ({
      label: k,
      color: STRESS_COLORS[k],
    })),
  },
  advisory: {
    title: 'Advisory (8-day deficit)',
    items: [
      { label: 'No irrigation (0–10 mm)', color: ADVISORY_COLORS.None },
      { label: 'Light (10–25 mm)', color: ADVISORY_COLORS.Light },
      { label: 'Moderate (25–40 mm)', color: ADVISORY_COLORS.Moderate },
      { label: 'Urgent (>40 mm)', color: ADVISORY_COLORS.Urgent },
    ],
  },
  ndvi: {
    title: 'NDVI ramp',
    items: [
      { label: 'Low (0.05)', color: '#61402a' },
      { label: 'Mid (0.4)', color: '#debe4f' },
      { label: 'High (0.65)', color: '#22a03d' },
      { label: 'Peak (0.8)', color: '#095227' },
    ],
  },
  ndwi: {
    title: 'NDWI ramp',
    items: [
      { label: 'Dry (-0.25)', color: '#6e5430' },
      { label: 'Moderate (0.2)', color: '#4894be' },
      { label: 'Wet (0.5)', color: '#083078' },
    ],
  },
  vci: {
    title: 'VCI ramp',
    items: [
      { label: 'Poor', color: '#b2182b' },
      { label: 'Fair', color: '#fed852' },
      { label: 'Good', color: '#126e37' },
    ],
  },
  smi: {
    title: 'Soil moisture',
    items: [
      { label: 'Dry soil', color: '#a67a47' },
      { label: 'Moist', color: '#6eb2a8' },
      { label: 'Saturated', color: '#103882' },
    ],
  },
  sarvv: {
    title: 'SAR VV (dB)',
    items: [
      { label: 'Low backscatter', color: '#0c101a' },
      { label: 'Medium', color: '#6ca0be' },
      { label: 'High', color: '#f4faff' },
    ],
  },
  sarvh: {
    title: 'SAR VH (dB)',
    items: [
      { label: 'Low backscatter', color: '#0c101a' },
      { label: 'Medium', color: '#6ca0be' },
      { label: 'High', color: '#f4faff' },
    ],
  },
}

function ClickCatcher({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect })
  return null
}

export interface SatelliteMapProps {
  fields: FieldRecord[]
  layer: MapLayerId
  onLayerChange: (l: MapLayerId) => void
  center: [number, number]
  zoom?: number
  height?: string
  showLegend?: boolean
  showInfoPanel?: boolean
}

export default function SatelliteMap({
  fields,
  layer,
  onLayerChange,
  center,
  zoom = 13,
  height = '100%',
  showLegend = true,
  showInfoPanel = true,
}: SatelliteMapProps) {
  const [selected, setSelected] = useState<FieldRecord | null>(null)
  const [basemap, setBasemap] = useState<'esri' | 'gibs'>('esri')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 350)
    return () => clearTimeout(t)
  }, [])

  const rasterUrl = useMemo(
    () => (layer !== 'rgb' && layer !== 'classification' && layer !== 'advisory' ? generateIndexRaster(layer, 42) : null),
    [layer],
  )

  const showRaster = rasterUrl !== null
  const legend = showLegend ? LAYER_LEGENDS[layer] : undefined

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-lg border border-white/10" style={{ height }}>
      {!loaded && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-navy-950">
          <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-400 uppercase pulse-dot">
            Initialising geospatial engine...
          </p>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
        zoomControl
      >
        {basemap === 'esri' ? (
          <TileLayer
            url={TILE_LAYERS.esriWorldImagery.url}
            attribution={TILE_LAYERS.esriWorldImagery.attribution}
            maxZoom={TILE_LAYERS.esriWorldImagery.maxZoom}
          />
        ) : (
          <TileLayer
            url={TILE_LAYERS.nasaGibsModis(GIBS_DATE).url}
            attribution={TILE_LAYERS.nasaGibsModis(GIBS_DATE).attribution}
            maxZoom={TILE_LAYERS.nasaGibsModis(GIBS_DATE).maxZoom}
          />
        )}

        {showRaster && (
          <ImageOverlay
            url={rasterUrl}
            bounds={RASTER_BOUNDS}
            opacity={0.42}
            interactive={false}
          />
        )}

        {fields.map((f) => (
          <Polygon
            key={`${layer}-${f.id}`}
            positions={f.coordinates}
            pathOptions={{
              color: layer === 'rgb' ? '#e2e8f0' : '#0a1220',
              weight: layer === 'rgb' ? 1 : 1.2,
              fillColor: fieldFill(f, layer),
              fillOpacity: layer === 'rgb' ? 0.06 : 0.72,
              dashArray: layer === 'rgb' ? '3 4' : undefined,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                setSelected(f)
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95} className="!bg-navy-900">
              <span className="font-mono text-[10px]">
                {f.id} · {f.crop} ·{' '}
                {layer === 'ndvi'
                  ? `NDVI ${f.indices.ndvi}`
                  : layer === 'ndwi'
                    ? `NDWI ${f.indices.ndwi}`
                    : layer === 'smi'
                      ? `SMI ${f.indices.smi}`
                      : layer === 'vci'
                        ? `VCI ${f.indices.vci}`
                        : layer === 'advisory'
                          ? `${f.waterDeficitMm} mm`
                          : f.stress}
              </span>
            </Tooltip>
          </Polygon>
        ))}

        <ScaleControl imperial={false} position="bottomright" />
        <ClickCatcher onDeselect={() => setSelected(null)} />
      </MapContainer>

      {/* Floating layer selector */}
      <div className="pointer-events-none absolute right-3 top-3 z-10">
        <MapLayerControl
          active={layer}
          onChange={onLayerChange}
          basemap={basemap}
          onBasemapChange={setBasemap}
        />
      </div>

      {/* Legend */}
      {legend && (
        <div className="pointer-events-none absolute bottom-6 left-3 z-10 hidden sm:block">
          <MapLegend title={legend.title} items={legend.items} />
        </div>
      )}

      {/* DEMO badge for model layers */}
      {layer !== 'rgb' && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:hidden">
          <span className="rounded border border-amber-500/40 bg-navy-950/80 px-2 py-1 font-mono text-[9px] tracking-widest text-amber-400">
            DEMO RASTER
          </span>
        </div>
      )}

      {/* Field info panel */}
      {showInfoPanel && selected && (
        <div className="pointer-events-none absolute bottom-3 right-3 z-10">
          <FieldInfoPanel field={selected} layer={layer} onClose={() => setSelected(null)} />
        </div>
      )}
    </div>
  )
}
