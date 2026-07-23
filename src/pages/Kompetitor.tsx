import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable } from '@/components/DataTable'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { TrendBadge } from '@/components/ui/Badge'
import { daftarKompetitor } from '@/data/mockData'
import type { Kompetitor as KompetitorType } from '@/types'

const PALETTE = [
  '#0d9488',
  '#0891b2',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#10b981',
  '#14b8a6',
  '#64748b',
]

const columns: ColumnDef<KompetitorType, any>[] = [
  {
    accessorKey: 'nama',
    header: 'Kompetitor',
    cell: (info) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{info.getValue<string>()}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{info.row.original.kategori}</p>
      </div>
    ),
  },
  {
    accessorKey: 'shareOfVoice',
    header: 'Share of Voice',
    cell: (info) => <span className="font-medium text-slate-700 dark:text-slate-200">{info.getValue<number>()}%</span>,
  },
  {
    accessorKey: 'shareOfEngagement',
    header: 'Share of Engagement',
    cell: (info) => <span className="text-slate-600 dark:text-slate-300">{info.getValue<number>()}%</span>,
  },
  {
    accessorKey: 'sentimentScore',
    header: 'Sentiment Score',
    cell: (info) => <span className="text-slate-600 dark:text-slate-300">{info.getValue<number>()}</span>,
  },
  {
    accessorKey: 'mediaExposure',
    header: 'Media Exposure',
    cell: (info) => <span className="text-slate-600 dark:text-slate-300">{info.getValue<number>()}</span>,
  },
  {
    accessorKey: 'topIssue',
    header: 'Top Issue',
    cell: (info) => <span className="text-slate-600 dark:text-slate-300">{info.getValue<string>()}</span>,
  },
  {
    accessorKey: 'trend',
    header: 'Trend',
    cell: (info) => <TrendBadge value={info.getValue()} />,
  },
]

export function Kompetitor() {
  const ranking = useMemo(
    () => [...daftarKompetitor].sort((a, b) => b.shareOfVoice - a.shareOfVoice),
    [],
  )
  const sovData = useMemo(() => ranking.map((k) => ({ name: k.nama, value: k.shareOfVoice })), [ranking])
  const sentimentData = useMemo(
    () => ranking.map((k) => ({ name: k.nama, value: k.sentimentScore })),
    [ranking],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Competitor Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Perbandingan posisi BSI dengan kompetitor bank syariah dan bank digital/fintech.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Share of Voice" subtitle="Porsi pemberitaan & percakapan tiap kompetitor" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sovData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={1}>
                  {sovData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PALETTE[idx % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Sentiment Comparison" subtitle="Skor sentimen tiap kompetitor (0–100)" />
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sentimentData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={11} width={130} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Ranking Kompetitor" subtitle="Diurutkan berdasarkan Share of Voice" />
        <CardContent>
          <DataTable data={ranking} columns={columns} searchPlaceholder="Cari kompetitor..." pageSize={12} />
        </CardContent>
      </Card>
    </div>
  )
}
