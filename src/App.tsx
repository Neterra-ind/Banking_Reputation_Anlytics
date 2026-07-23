import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { DataBerita } from '@/pages/DataBerita'
import { IsuDetail } from '@/pages/IsuDetail'
import { Kompetitor } from '@/pages/Kompetitor'
import { Notifikasi } from '@/pages/Notifikasi'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/isu/:id" element={<IsuDetail />} />
        <Route path="/data-berita" element={<DataBerita />} />
        <Route path="/kompetitor" element={<Kompetitor />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
      </Route>
    </Routes>
  )
}

export default App
