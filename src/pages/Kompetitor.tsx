import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DataTable } from '@/components/DataTable'
import { FilterSelect } from '@/components/FilterSelect'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { TrendBadge } from '@/components/ui/Badge'
import { daftarKompetitor, semuaJenisMedia } from '@/data/mockData'
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

interface KompetitorRanked extends KompetitorType {
  mediaExposure: number
  engagement: number
  shareOfVoice: number
  shareOfEngagement: number
}

const columns: ColumnDef<KompetitorRanked, any>[] = [
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
  const [sumberData, setSumberData] = useState('')

  const ranking = useMemo<KompetitorRanked[]>(() => {
    const withExposure = daftarKompetitor.map((k) => {
      const mediaExposure =
        sumberData === 'Media Online'
          ? k.mediaExposureOnline
          : sumberData === 'Media Sosial'
            ? k.mediaExposureSosial
            : k.mediaExposureOnline + k.mediaExposureSosial
      const engagement =
        sumberData === 'Media Online'
          ? k.engagementOnline
          : sumberData === 'Media Sosial'
            ? k.engagementSosial
            : k.engagementOnline + k.engagementSosial
      return { ...k, mediaExposure, engagement }
    })
    const totalExposure = withExposure.reduce((sum, k) => sum + k.mediaExposure, 0)
    const totalEngagement = withExposure.reduce((sum, k) => sum + k.engagement, 0)
    return withExposure
      .map((k) => ({
        ...k,
        shareOfVoice: totalExposure > 0 ? Math.round((k.mediaExposure / totalExposure) * 100) : 0,
        shareOfEngagement: totalEngagement > 0 ? Math.round((k.engagement / totalEngagement) * 100) : 0,
      }))
      .sort((a, b) => b.mediaExposure - a.mediaExposure)
  }, [sumberData])

  const trenData = useMemo(() => {
    if (ranking.length === 0) return []
    return ranking[0].trenHarian.map((titik, i) => {
      const row: Record<string, string | number> = { tanggal: titik.tanggal }
      for (const k of ranking) row[k.nama] = k.trenHarian[i]?.jumlah ?? 0
      return row
    })
  }, [ranking])

  const sentimentData = useMemo(
    () => ranking.map((k) => ({ name: k.nama, value: k.sentimentScore })),
    [ranking],
  )

  const [kompetitorId, setKompetitorId] = useState(() => ranking[0]?.id ?? '')
  const kompetitorTerpilih = useMemo(
    () => ranking.find((k) => k.id === kompetitorId) ?? ranking[0],
    [ranking, kompetitorId],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Competitor Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Perbandingan posisi BSI dengan kompetitor bank syariah dan bank digital/fintech.
          </p>
        </div>
        <FilterSelect label="Sumber Data" value={sumberData} options={[...semuaJenisMedia]} onChange={setSumberData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Eksposur Produk per Kompetitor"
            subtitle="Breakdown eksposur media & percakapan per produk"
            action={
              <select
                value={kompetitorTerpilih?.id ?? ''}
                onChange={(e) => setKompetitorId(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {ranking.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            }
          />
          <CardContent>
            {kompetitorTerpilih && kompetitorTerpilih.produkEksposur.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(220, kompetitorTerpilih.produkEksposur.length * 44)}>
                <BarChart data={kompetitorTerpilih.produkEksposur} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="produk" fontSize={11} width={140} />
                  <Tooltip formatter={(v) => Number(v).toLocaleString('id-ID')} />
                  <Bar dataKey="eksposur" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data produk untuk kompetitor ini.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Tren waktu" subtitle="Eksposur media harian tiap kompetitor · 14 hari terakhir" />
          <CardContent>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={trenData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tanggal" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {ranking.map((k, idx) => (
                  <Line
                    key={k.id}
                    type="monotone"
                    dataKey={k.nama}
                    stroke={PALETTE[idx % PALETTE.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
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
