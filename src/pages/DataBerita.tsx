import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { FilterSelect } from '@/components/FilterSelect'
import { TimelineFilter } from '@/components/TimelineFilter'
import { NewsDetailDrawer } from '@/components/NewsDetailDrawer'
import { SentimenBadge, UrgensiBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { daftarBerita, semuaJenisMedia, semuaSentimen, semuaSumber } from '@/data/mockData'
import { cocokPeriode, PERIODE_DEFAULT } from '@/lib/aggregations'
import type { PeriodeValue } from '@/lib/aggregations'
import { semuaIsu } from '@/types'
import type { Berita } from '@/types'

const columns: ColumnDef<Berita, any>[] = [
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    cell: (info) => (
      <span className="whitespace-nowrap text-slate-500">{info.getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'judul',
    header: 'Judul Berita',
    cell: (info) => (
      <div className="max-w-md">
        <p className="font-medium text-slate-800 dark:text-slate-100">{info.getValue<string>()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {info.row.original.sumber} · {info.row.original.subIsu}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'isu',
    header: 'Isu',
    cell: (info) => (
      <span className="whitespace-nowrap text-slate-600 dark:text-slate-300">
        {info.getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: 'sentimen',
    header: 'Sentimen',
    cell: (info) => <SentimenBadge value={info.getValue()} />,
  },
  {
    accessorKey: 'urgensi',
    header: 'Urgensi',
    cell: (info) => <UrgensiBadge value={info.getValue()} />,
  },
  {
    accessorKey: 'engagement',
    header: 'Engagement',
    cell: (info) => (
      <span className="text-slate-500">{info.getValue<number>().toLocaleString('id-ID')}</span>
    ),
  },
]

export function DataBerita() {
  const [isu, setIsu] = useState('')
  const [sentimen, setSentimen] = useState('')
  const [sumber, setSumber] = useState('')
  const [jenisMedia, setJenisMedia] = useState('')
  const [periode, setPeriode] = useState<PeriodeValue>(PERIODE_DEFAULT)
  const [selected, setSelected] = useState<Berita | null>(null)

  const filtered = useMemo(() => {
    return daftarBerita.filter(
      (b) =>
        (!isu || b.isu === isu) &&
        (!sentimen || b.sentimen === sentimen) &&
        (!sumber || b.sumber === sumber) &&
        (!jenisMedia || b.jenisMedia === jenisMedia) &&
        cocokPeriode(b.tanggal, periode),
    )
  }, [isu, sentimen, sumber, jenisMedia, periode])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Data Berita</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Daftar berita dan percakapan media sosial hasil klasifikasi dan analisis AI. Klik satu baris untuk melihat AI Insight lengkap.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <TimelineFilter value={periode} onChange={setPeriode} />
          <FilterSelect label="Sumber Data" value={jenisMedia} options={[...semuaJenisMedia]} onChange={setJenisMedia} />
          <FilterSelect label="Isu" value={isu} options={semuaIsu} onChange={setIsu} />
          <FilterSelect label="Sentimen" value={sentimen} options={semuaSentimen} onChange={setSentimen} />
          <FilterSelect label="Sumber" value={sumber} options={semuaSumber} onChange={setSumber} />
        </div>
      </Card>

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Cari judul, sumber, sub-isu..."
          onRowClick={setSelected}
        />
      </Card>

      <NewsDetailDrawer berita={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
