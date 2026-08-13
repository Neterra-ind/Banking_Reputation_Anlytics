import { useMemo, useState } from 'react'
import { AlertTriangle, Bell, FileWarning, Flame, TrendingUp, Wifi } from 'lucide-react'
import { FilterSelect } from '@/components/FilterSelect'
import { TimelineFilter } from '@/components/TimelineFilter'
import { Card, CardContent } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/Badge'
import { daftarAlert, semuaJenisMedia } from '@/data/mockData'
import { cocokPeriode, PERIODE_DEFAULT } from '@/lib/aggregations'
import type { PeriodeValue } from '@/lib/aggregations'
import { ISU_LABEL, MEDIA_LABEL, semuaIsu, TIPE_ALERT_LABEL } from '@/types'
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
  const [jenisMedia, setJenisMedia] = useState('')
  const [periode, setPeriode] = useState<PeriodeValue>(PERIODE_DEFAULT)

  const filtered = useMemo(() => {
    return daftarAlert
      .filter(
        (a) =>
          (!isu || a.isu === isu) &&
          (!tipe || a.tipe === tipe) &&
          (!jenisMedia || a.jenisMedia === jenisMedia) &&
          cocokPeriode(a.tanggal, periode),
      )
      .sort((a, b) => {
        const dateCompare = `${b.tanggal}T${b.waktu}`.localeCompare(`${a.tanggal}T${a.waktu}`)
        if (dateCompare !== 0) return dateCompare
        return levelOrder[a.level] - levelOrder[b.level]
      })
  }, [isu, tipe, jenisMedia, periode])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Notifications</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Automated alerts for negative sentiment spikes, viral issues, new regulations, digital service disruptions, trending topics, and potential crises.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <TimelineFilter value={periode} onChange={setPeriode} />
          <FilterSelect
            label="Data Source"
            value={jenisMedia}
            options={[...semuaJenisMedia]}
            labelMap={MEDIA_LABEL}
            onChange={setJenisMedia}
          />
          <FilterSelect label="Issue" value={isu} options={semuaIsu} labelMap={ISU_LABEL} onChange={setIsu} />
          <FilterSelect label="Alert Type" value={tipe} options={semuaTipe} labelMap={TIPE_ALERT_LABEL} onChange={setTipe} />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-400">No matching notifications.</Card>
        )}
        {filtered.map((alert) => {
          const Icon = TIPE_ICON[alert.tipe]
          return (
            <Card key={alert.id} className="p-4">
              <CardContent className="flex items-start gap-3 p-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy-50 text-brand-navy-600 dark:bg-brand-navy-500/10 dark:text-brand-navy-400">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{alert.judul}</p>
                    <RiskBadge value={alert.level} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{alert.deskripsi}</p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    {TIPE_ALERT_LABEL[alert.tipe]} · Issue {ISU_LABEL[alert.isu]} · {MEDIA_LABEL[alert.jenisMedia]} · {alert.tanggal} {alert.waktu}
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
