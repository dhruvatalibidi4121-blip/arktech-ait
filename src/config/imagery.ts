/**
 * Curated, publicly accessible satellite imagery assets.
 * Sources: NASA Earth Observatory (public domain), ESA Copernicus,
 * ISRO (via Wikimedia Commons), NASA Earth Science. All hosted on
 * Wikimedia Commons upload servers / official tile services.
 */

export const IMAGERY = {
  /** Landsat agricultural mosaic, West Bengal, India (NASA EO) - hero background */
  heroFields:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Agriculture_in_West_Bengal%2C_India_%2850304489911%29.png/1920px-Agriculture_in_West_Bengal%2C_India_%2850304489911%29.png',
  heroFieldsSmall:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Agriculture_in_West_Bengal%2C_India_%2850304489911%29.png/1280px-Agriculture_in_West_Bengal%2C_India_%2850304489911%29.png',
  /** Hooghly-Brahmaputra delta, Landsat 8 */
  gangesDelta:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Hooghly-_Brahmaputra_Delta%2C_Bay_of_Bengal_%28India_-_Bangladesh%29_%2834699016026%29.jpg/1280px-Hooghly-_Brahmaputra_Delta%2C_Bay_of_Bengal_%28India_-_Bangladesh%29_%2834699016026%29.jpg',
  /** Copernicus Sentinel-2A agricultural patterns */
  sentinel2Farms:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Central-eastern_Brazil%2C_by_Copernicus_Sentinel-2A_satellite.jpg/1280px-Central-eastern_Brazil%2C_by_Copernicus_Sentinel-2A_satellite.jpg',
  /** Copernicus Sentinel-2, Ganges River, India (2025) */
  gangesSentinel2:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/The_Ganges_River%2C_India_%28Copernicus_2025-11-16%29.png/1280px-The_Ganges_River%2C_India_%28Copernicus_2025-11-16%29.png',
  /** Real IRS AWiFS scene (ISRO Resourcesat) */
  awifsScene:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Apostle_Islands_on_March_24%2C_2022%2C_cropped_from_R2AWF03242022276038%2C_IRS_AWiFS.png/1280px-Apostle_Islands_on_March_24%2C_2022%2C_cropped_from_R2AWF03242022276038%2C_IRS_AWiFS.png',
  /** Real Sentinel-1 IW GRDH VV+VH SAR image */
  sarScene:
    'https://upload.wikimedia.org/wikipedia/commons/9/93/Sentinel-1_%28IW-VVVH%29_image_on_2020-08-11.jpg',
  /** Sentinel-1C SAR, Netherlands (ESA) */
  sarNetherlands:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Netherlands_from_Sentinel-1C_ESA504714.jpg/1280px-The_Netherlands_from_Sentinel-1C_ESA504714.jpg',
  /** Landsat 9 OLI-2 agricultural mosaic */
  landsatMosaic:
    'https://upload.wikimedia.org/wikipedia/commons/4/41/An_Agricultural_Mosaic_in_Taiwan_%281215103_-_baozhong_agriculture_oli2_20260318%29.jpg',
  /** Sentinel-2A night acquisition, India */
  sentinel2Night:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Wildfire_in_India_imaged_by_Sentinel-2A_at_night_ESA516826.jpg/1280px-Wildfire_in_India_imaged_by_Sentinel-2A_at_night_ESA516826.jpg',

  // --- Spacecraft imagery (mission authentic) ---
  satRisatEos04:
    'https://upload.wikimedia.org/wikipedia/commons/b/b0/PSLV-C52%2C_EOS-04_%28aka_RISAT-1A%29_-_Render_of_EOS-04_in_deployed_configuration.jpg',
  satRisat1:
    'https://upload.wikimedia.org/wikipedia/commons/2/27/Render_of_Radar_Imaging_Satellite_RISAT-1_in_deployed_configuration.png',
  satResourcesat:
    'https://upload.wikimedia.org/wikipedia/commons/e/e4/Render_of_Resourcesat-2A_spacecraft_in_deployed_configuration.png',
  satLandsat8:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/LDCM_Landsat_8_spacecraft_model.png/1280px-LDCM_Landsat_8_spacecraft_model.png',
  satTerra:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Terra_spacecraft_model.png/1280px-Terra_spacecraft_model.png',
  satNisar:
    'https://upload.wikimedia.org/wikipedia/commons/0/07/NISAR_spacecraft_model.png',
  satSentinel1:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sentinel_1-IMG_5874-white.jpg/1280px-Sentinel_1-IMG_5874-white.jpg',
  satSentinel2:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sentinel_2-IMG_5873-white.jpg/1280px-Sentinel_2-IMG_5873-white.jpg',
} as const

/**
 * Live public tile services (used as real basemaps - not demo data):
 * - Esri World Imagery: global high-resolution optical mosaic
 * - NASA GIBS MODIS Terra: daily corrected reflectance true colour
 */
export const TILE_LAYERS = {
  esriWorldImagery: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Imagery &copy; Esri, Maxar, Earthstar Geographics, USDA/USGS, AeroGRID, IGN, GIS User Community',
    maxZoom: 19,
  },
  nasaGibsModis: (date: string) => ({
    url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
    attribution: 'NASA EOSDIS GIBS / MODIS (Terra)',
    maxZoom: 9,
  }),
} as const
