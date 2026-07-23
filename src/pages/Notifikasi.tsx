import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, FileWarning, Flame, TrendingUp, Wifi } from 'lucide-react'
import { FilterSelect } from '@/components/FilterSelect'
import { TimelineFilter } from '@/components/TimelineFilter'
import { Card, CardContent } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/Badge'
import { daftarAlert } from '@/data/mockData'
import { dalamPeriode } from '@/lib/aggregations'
import { semuaIsu } from '@/types'
import type { TipeAlert } from '@/types'

const TIPE_ICON: Record<TipeAlert, typeof Bell> = {
  'Lonjakan Sentimen Negatif': TrendingUp,
  'Isu Viral': Flame,
  'Regulasi Baru': FileWarning,
  'Gangguan Layanan Digital': Wifi,
  'Trending Topic': Flame,
  'Potensi Krisis': AlertTriangle,
}

const semuaTipe: TipeAlert[] = [
  'Lonjakan Sentimen Negatif',
  'Isu Viral',
  'Regulasi Baru',
  'Gangguan Layanan Digital',
  'Trending Topic',
  'Potensi Krisis',
]

const levelOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }

export function Notifikasi() {
  const [isu, setIsu] = useState('')
  const [tipe, setTipe] = useState('')
  const [periode, setPeriode] = useState('')

  const filtered = useMemo(() => {
    return daftarAlert
      .filter(
        (a) =>
          (!isu || a.isu === isu) &&
          (!tipe || a.tipe === tipe) &&
          (!periode || dalamPeriode(a.tanggal, Number(periode))),
      )
      .sort((a, b) => {
        const dateCompare = `${b.tanggal}T${b.waktu}`.localeCompare(`${a.tanggal}T${a.waktu}`)
        if (dateCompare !== 0) return dateCompare
        return levelOrder[a.level] - levelOrder[b.level]
      })
  }, [isu, tipe, periode])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifikasi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Alert otomatis untuk lonjakan sentimen negatif, isu viral, regulasi baru, gangguan layanan digital, trending topic, dan potensi krisis.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <TimelineFilter value={periode} onChange={setPeriode} />
          <FilterSelect label="Isu" value={isu} options={semuaIsu} onChange={setIsu} />
          <FilterSelect label="Tipe Alert" value={tipe} options={semuaTipe} onChange={setTipe} />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-400">Tidak ada notifikasi yang cocok.</Card>
        )}
        {filtered.map((alert) => {
          const Icon = TIPE_ICON[alert.tipe]
          return (
            <Card key={alert.id} className="p-4">
              <CardContent className="flex items-start gap-3 p-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{alert.judul}</p>
                    <RiskBadge value={alert.level} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{alert.deskripsi}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {alert.tipe} · Isu {alert.isu} · {alert.tanggal} {alert.waktu}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
