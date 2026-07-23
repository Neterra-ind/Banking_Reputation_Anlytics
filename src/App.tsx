import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { DataBerita } from '@/pages/DataBerita'
import { KlasterDetail } from '@/pages/KlasterDetail'
import { Kompetitor } from '@/pages/Kompetitor'
import { Notifikasi } from '@/pages/Notifikasi'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/klaster/:id" element={<KlasterDetail />} />
        <Route path="/data-berita" element={<DataBerita />} />
        <Route path="/kompetitor" element={<Kompetitor />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
      </Route>
    </Routes>
  )
}

export default App
