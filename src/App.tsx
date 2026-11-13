import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CropClassification from './pages/CropClassification'
import Phenology from './pages/Phenology'
import MoistureStress from './pages/MoistureStress'
import WaterDeficit from './pages/WaterDeficit'
import IrrigationAdvisory from './pages/IrrigationAdvisory'
import SatelliteSources from './pages/SatelliteSources'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crop-classification" element={<CropClassification />} />
        <Route path="/phenology" element={<Phenology />} />
        <Route path="/moisture-stress" element={<MoistureStress />} />
        <Route path="/water-deficit" element={<WaterDeficit />} />
        <Route path="/irrigation-advisory" element={<IrrigationAdvisory />} />
        <Route path="/satellite-sources" element={<SatelliteSources />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  )
}
