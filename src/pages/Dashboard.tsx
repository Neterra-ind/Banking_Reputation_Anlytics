import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Flame, MessageSquare, Newspaper, Radio, ShieldAlert, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { TimelineFilter } from '@/components/TimelineFilter'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { RiskBadge, SentimenBadge } from '@/components/ui/Badge'
import { daftarBerita } from '@/data/mockData'
import { dalamPeriode, hitungPerHari, topN } from '@/lib/aggregations'
import { semuaIsu } from '@/types'
import type { Sentimen } from '@/types'

const SENTIMEN_COLOR: Record<string, string> = {
  Positif: '#10b981',
  Netral: '#94a3b8',
  Negatif: '#f43f5e',
}

const PERIODE_LABEL: Record<string, string> = {
  '': '30 hari terakhir',
  '7': '7 hari terakhir',
  '14': '14 hari terakhir',
  '30': '30 hari terakhir',
}

function sentimenDominan(sentimenList: Sentimen[]): Sentimen {
  const count: Record<Sentimen, number> = { Positif: 0, Netral: 0, Negatif: 0 }
  for (const s of sentimenList) count[s]++
  return (Object.entries(count).sort((a, b) => b[1] - a[1])[0][0]) as Sentimen
}

export function Dashboard() {
  const [periode, setPeriode] = useState('')

  const dataTerfilter = useMemo(
    () => (periode ? daftarBerita.filter((b) => dalamPeriode(b.tanggal, Number(periode))) : daftarBerita),
    [periode],
  )

  const totalBerita = dataTerfilter.length
  const totalPercakapan = useMemo(
    () => dataTerfilter.filter((b) => b.jenisMedia === 'Media Sosial').length,
    [dataTerfilter],
  )
  const totalRisiko = useMemo(
    () => dataTerfilter.filter((b) => b.riskLevel === 'High' || b.riskLevel === 'Critical').length,
    [dataTerfilter],
  )
  const totalOpportunity = useMemo(
    () =>
      dataTerfilter.filter(
        (b) => b.peluangBisnis !== 'Tidak ada peluang bisnis signifikan yang teridentifikasi.',
      ).length,
    [dataTerfilter],
  )
  const sentimenNegatifPct = useMemo(
    () =>
      totalBerita === 0
        ? 0
        : Math.round((dataTerfilter.filter((b) => b.sentimen === 'Negatif').length / totalBerita) * 100),
    [dataTerfilter, totalBerita],
  )

  const trenHarian = useMemo(
    () => hitungPerHari(dataTerfilter, periode ? Number(periode) : 30),
    [dataTerfilter, periode],
  )
  const distribusiSentimen = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of dataTerfilter) map.set(b.sentimen, (map.get(b.sentimen) ?? 0) + 1)
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [dataTerfilter])
  const topIssue = useMemo(() => topN(dataTerfilter, 'subIsu', 5), [dataTerfilter])
  const topMedia = useMemo(() => topN(dataTerfilter, 'sumber', 5), [dataTerfilter])
  const trendingTopic = useMemo(
    () => [...dataTerfilter].filter((b) => b.isViral).sort((a, b) => b.engagement - a.engagement).slice(0, 5),
    [dataTerfilter],
  )

  const ringkasanIsu = useMemo(
    () =>
      semuaIsu.map((isu) => {
        const items = dataTerfilter.filter((b) => b.isu === isu)
        return {
          isu,
          volume: items.length,
          sentimenDominan: sentimenDominan(items.map((i) => i.sentimen)),
          risikoTinggi: items.filter((i) => i.riskLevel === 'High' || i.riskLevel === 'Critical').length,
        }
      }),
    [dataTerfilter],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Executive Summary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ringkasan monitoring media massa dan media sosial BSI {PERIODE_LABEL[periode]}.
          </p>
        </div>
        <TimelineFilter value={periode} onChange={setPeriode} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Berita" value={totalBerita} icon={Newspaper} />
        <StatCard label="Total Percakapan Medsos" value={totalPercakapan} icon={MessageSquare} />
        <StatCard label="Sentimen Negatif" value={`${sentimenNegatifPct}%`} icon={Radio} tone="negative" />
        <StatCard label="Risiko Tinggi/Kritis" value={totalRisiko} icon={ShieldAlert} tone="warning" />
        <StatCard label="Peluang Bisnis Teridentifikasi" value={totalOpportunity} icon={Sparkles} tone="positive" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Ringkasan per Isu</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Klik salah satu isu untuk melihat dashboard detail.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ringkasanIsu.map((k) => (
            <Link key={k.isu} to={`/isu/${k.isu}`}>
              <Card className="p-4 transition-colors hover:border-teal-300 dark:hover:border-teal-700">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{k.isu}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {k.volume}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">berita/percakapan</p>
                <div className="mt-3 flex items-center justify-between">
                  <SentimenBadge value={k.sentimenDominan} />
                  {k.risikoTinggi > 0 && (
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      {k.risikoTinggi} risiko tinggi
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Tren Berita" subtitle={`Jumlah berita per hari · ${PERIODE_LABEL[periode]}`} />
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trenHarian}>
                <defs>
                  <linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="jumlah" stroke="#0d9488" fill="url(#colorJumlah)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Distribusi Sentimen" />
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={distribusiSentimen}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
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
        <Card>
          <CardHeader title="Top Issue" subtitle="5 sub-isu dengan volume tertinggi" />
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topIssue} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={11} width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Top Media" subtitle="5 sumber dengan pemberitaan terbanyak" />
          <CardContent className="space-y-2.5">
            {topMedia.length === 0 && <p className="text-sm text-slate-400">Tidak ada data pada periode ini.</p>}
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

        <Card>
          <CardHeader title="Trending Topic" subtitle="Isu viral dengan engagement tertinggi" action={<Flame className="h-4 w-4 text-orange-500" />} />
          <CardContent className="space-y-3">
            {trendingTopic.length === 0 && (
              <p className="text-sm text-slate-400">Tidak ada isu viral pada periode ini.</p>
            )}
            {trendingTopic.map((t) => (
              <div key={t.id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.judul}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t.engagement.toLocaleString('id-ID')} interaksi
                  </span>
                  <RiskBadge value={t.riskLevel} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
