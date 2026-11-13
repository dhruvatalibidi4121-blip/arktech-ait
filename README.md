# ARKTECH AIT

> **Satellite-Powered Agricultural Intelligence & Precision Irrigation Platform**

ARKTECH is an AI-driven agricultural monitoring and decision-support dashboard utilizing multi-temporal Copernicus Sentinel-2 MSI, Sentinel-1 C-SAR, and Landsat 8/9 Earth observation data fused with deep learning models to deliver field-level crop analytics, stress detection, and precision irrigation advisories.

---

## 🌟 Key Features

- **Multi-Temporal Crop Classification**: Deep learning-based classification (Sugarcane, Rice, Cotton, Maize, Fallow) with interactive RGB vs. Classified raster comparison.
- **Crop Phenology Analytics**: Real-time NDVI/EVI curve tracking, vegetative stage progression, and radar SAR backscatter dynamics.
- **Moisture Stress & Water Deficit Monitoring**: SMI, NDWI, and Root Zone Water Deficit tracking to detect moisture anomalies early.
- **Precision Irrigation Advisory**: Actionable per-field irrigation recommendations based on water deficit thresholds, soil moisture, and meteorological indices.
- **Satellite Explorer**: Multi-spectral imagery viewer with layer toggles for True Color RGB, False Color Infrared, NDVI, NDWI, and SAR (VV/VH).
- **Interactive Geospatial Mapping**: Integrated Leaflet geospatial maps with parcel boundaries, vegetation health overlays, and field telemetry.

---

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Bundler & Tooling**: Vite 8, Rolldown, Oxlint
- **Styling**: Tailwind CSS v4
- **Mapping**: Leaflet & React-Leaflet
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **API Client**: REST / FastAPI integration with fallback mock telemetry for standalone preview

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruvatalibidi4121-blip/arktech-ait.git
cd arktech-ait

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure backend connection in `.env`:
```env
# URL of your FastAPI backend (e.g. http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000

# Set to "false" to connect to live FastAPI backend, or "true" for offline demo mode
VITE_USE_MOCK=true
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

---

## 📄 License

MIT
