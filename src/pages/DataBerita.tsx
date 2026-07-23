import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/DataTable'
import { FilterSelect } from '@/components/FilterSelect'
import { NewsDetailDrawer } from '@/components/NewsDetailDrawer'
import { RiskBadge, SentimenBadge, UrgensiBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { daftarBerita, semuaRiskLevel, semuaSentimen, semuaSumber } from '@/data/mockData'
import { semuaKlaster } from '@/types'
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
          {info.row.original.sumber} · {info.row.original.subKlaster}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'klaster',
    header: 'Klaster',
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
    accessorKey: 'riskLevel',
    header: 'Risk Level',
    cell: (info) => <RiskBadge value={info.getValue()} />,
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
  const [klaster, setKlaster] = useState('')
  const [sentimen, setSentimen] = useState('')
  const [risk, setRisk] = useState('')
  const [sumber, setSumber] = useState('')
  const [selected, setSelected] = useState<Berita | null>(null)

  const filtered = useMemo(() => {
    return daftarBerita.filter(
      (b) =>
        (!klaster || b.klaster === klaster) &&
        (!sentimen || b.sentimen === sentimen) &&
        (!risk || b.riskLevel === risk) &&
        (!sumber || b.sumber === sumber),
    )
  }, [klaster, sentimen, risk, sumber])

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
          <FilterSelect label="Klaster" value={klaster} options={semuaKlaster} onChange={setKlaster} />
          <FilterSelect label="Sentimen" value={sentimen} options={semuaSentimen} onChange={setSentimen} />
          <FilterSelect label="Risk Level" value={risk} options={semuaRiskLevel} onChange={setRisk} />
          <FilterSelect label="Sumber" value={sumber} options={semuaSumber} onChange={setSumber} />
        </div>
      </Card>

      <Card className="p-4">
        <DataTable
          data={filtered}
          columns={columns}
          searchPlaceholder="Cari judul, sumber, sub-klaster..."
          onRowClick={setSelected}
        />
      </Card>

      <NewsDetailDrawer berita={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
