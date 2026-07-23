import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import { StatCard } from '@/components/StatCard'
import { DataTable } from '@/components/DataTable'
import { NewsDetailDrawer } from '@/components/NewsDetailDrawer'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { RiskBadge, SentimenBadge } from '@/components/ui/Badge'
import { daftarBerita } from '@/data/mockData'
import { hitungPerHari, topN } from '@/lib/aggregations'
import { semuaKlaster, subKlasterByKlaster } from '@/types'
import type { Berita, Klaster } from '@/types'
import { Newspaper, ShieldAlert, Flame, Radio } from 'lucide-react'

const SENTIMEN_COLOR: Record<string, string> = {
  Positif: '#10b981',
  Netral: '#94a3b8',
  Negatif: '#f43f5e',
}

const KLASTER_TUJUAN: Record<Klaster, string> = {
  Kebijakan: 'Memantau seluruh kebijakan yang dapat memengaruhi operasional maupun bisnis BSI.',
  Bisnis: 'Memantau perkembangan bisnis dan produk BSI.',
  Nasabah: 'Mengukur persepsi masyarakat terhadap BSI.',
  Risiko: 'Mendeteksi potensi risiko perusahaan sedini mungkin.',
  Industri: 'Memantau perkembangan industri yang memengaruhi posisi BSI.',
}

const columns: ColumnDef<Berita, any>[] = [
  {
    accessorKey: 'tanggal',
    header: 'Tanggal',
    cell: (info) => <span className="whitespace-nowrap text-slate-500">{info.getValue<string>()}</span>,
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
    accessorKey: 'sentimen',
    header: 'Sentimen',
    cell: (info) => <SentimenBadge value={info.getValue()} />,
  },
  {
    accessorKey: 'riskLevel',
    header: 'Risk Level',
    cell: (info) => <RiskBadge value={info.getValue()} />,
  },
]

export function KlasterDetail() {
  const { id } = useParams<{ id: string }>()
  const [selected, setSelected] = useState<Berita | null>(null)

  const klasterValid = id && semuaKlaster.includes(id as Klaster) ? (id as Klaster) : null
  const klaster = klasterValid ?? 'Bisnis'

  const items = useMemo(() => daftarBerita.filter((b) => b.klaster === klaster), [klaster])

  const volume = items.length
  const risikoTinggi = items.filter((b) => b.riskLevel === 'High' || b.riskLevel === 'Critical').length
  const viral = items.filter((b) => b.isViral).length
  const mediaAktif = useMemo(() => new Set(items.map((b) => b.sumber)).size, [items])

  const trenHarian = useMemo(() => hitungPerHari(items, 30), [items])
  const distribusiSentimen = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of items) map.set(b.sentimen, (map.get(b.sentimen) ?? 0) + 1)
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [items])

  const topikUtama = useMemo(() => topN(items, 'subKlaster', subKlasterByKlaster[klaster].length), [items, klaster])
  const topMedia = useMemo(() => topN(items, 'sumber', 5), [items])

  const insightItems = useMemo(
    () =>
      [...items]
        .filter((b) => b.riskLevel === 'High' || b.riskLevel === 'Critical')
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 3),
    [items],
  )

  if (!klasterValid) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Klaster {klaster}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{KLASTER_TUJUAN[klaster]}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Volume Berita" value={volume} icon={Newspaper} />
        <StatCard label="Media Aktif" value={mediaAktif} icon={Radio} />
        <StatCard label="Risiko Tinggi/Kritis" value={risikoTinggi} icon={ShieldAlert} tone="warning" />
        <StatCard label="Isu Viral" value={viral} icon={Flame} tone="negative" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Tren Waktu" subtitle="Volume berita 30 hari terakhir" />
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trenHarian}>
                <defs>
                  <linearGradient id="colorKlaster" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="jumlah" stroke="#0d9488" fill="url(#colorKlaster)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Sentimen" />
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={distribusiSentimen} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {distribusiSentimen.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMEN_COLOR[entry.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Topik Utama" subtitle="Frekuensi sub-klaster (word cloud sederhana)" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topikUtama.map((t) => {
                const maxVal = topikUtama[0]?.value || 1
                const scale = 0.8 + (t.value / maxVal) * 0.9
                return (
                  <span
                    key={t.name}
                    style={{ fontSize: `${scale * 0.85}rem` }}
                    className="rounded-full bg-teal-50 px-3 py-1 font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
                  >
                    {t.name} <span className="text-xs opacity-70">({t.value})</span>
                  </span>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Media Paling Aktif" />
          <CardContent className="space-y-2.5">
            {topMedia.map((m, idx) => (
              <div key={m.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  <span className="mr-2 text-xs font-semibold text-slate-400">{idx + 1}</span>
                  {m.name}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">{m.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Summary & Recommendation" subtitle="Ringkasan otomatis dari isu berisiko tinggi di klaster ini" />
        <CardContent className="space-y-4">
          {insightItems.length === 0 && (
            <p className="text-sm text-slate-400">Tidak ada isu berisiko tinggi yang perlu disorot saat ini.</p>
          )}
          {insightItems.map((item) => (
            <div key={item.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.judul}</p>
                <RiskBadge value={item.riskLevel} />
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.ringkasanAI}</p>
              <ul className="mt-1.5 list-inside list-disc text-xs text-slate-500 dark:text-slate-400">
                {item.rekomendasiAI.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="p-4">
        <DataTable data={items} columns={columns} searchPlaceholder="Cari judul, sumber..." onRowClick={setSelected} />
      </Card>

      <NewsDetailDrawer berita={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
