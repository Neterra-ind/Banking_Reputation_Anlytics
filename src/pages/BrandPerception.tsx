import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AtSign, Camera, Music2, ThumbsUp, Video } from 'lucide-react'
import { FilterSelect } from '@/components/FilterSelect'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { brandPerceptionData, semuaJenisMedia } from '@/data/mockData'
import type { PlatformBP } from '@/types'

const SENTIMEN_COLOR: Record<string, string> = {
  Positif: '#10b981',
  Netral: '#94a3b8',
  Negatif: '#f43f5e',
  Sensitif: '#f59e0b',
}

const PLATFORM_ICON: Record<PlatformBP, LucideIcon> = {
  Twitter: AtSign,
  Instagram: Camera,
  Facebook: ThumbsUp,
  YouTube: Video,
  TikTok: Music2,
}

const PLATFORM_COLOR: Record<PlatformBP, string> = {
  Twitter: '#1d9bf0',
  Instagram: '#d6249f',
  Facebook: '#1877f2',
  YouTube: '#ff0000',
  TikTok: '#111827',
}

function formatSingkat(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)} M`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Jt`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)} Rb`
  return String(n)
}

export function BrandPerception() {
  const d = brandPerceptionData
  const [sumberData, setSumberData] = useState('')
  const showOnline = sumberData !== 'Media Sosial'
  const showSosial = sumberData !== 'Media Online'

  const mediaTimeline = useMemo(
    () => d.mediaSentimenHarian.map((s) => ({ ...s, tanggal: s.tanggal.slice(5) })),
    [d],
  )
  const audienceTimeline = useMemo(
    () => d.audienceSentimenHarian.map((s) => ({ ...s, tanggal: s.tanggal.slice(5) })),
    [d],
  )
  const engagementChart = useMemo(
    () => d.engagementHarian.map((e) => ({ ...e, tanggal: e.tanggal.slice(5) })),
    [d],
  )

  const mediaSentimenPie = [
    { name: 'Positif', value: d.mediaSentimenTotal.Positif },
    { name: 'Netral', value: d.mediaSentimenTotal.Netral },
    { name: 'Negatif', value: d.mediaSentimenTotal.Negatif },
    { name: 'Sensitif', value: d.mediaSentimenTotal.Sensitif },
  ]
  const audienceSentimenPie = [
    { name: 'Positif', value: d.audienceSentimenTotal.Positif },
    { name: 'Netral', value: d.audienceSentimenTotal.Netral },
    { name: 'Negatif', value: d.audienceSentimenTotal.Negatif },
  ]

  const totalImpression = d.platformMetrik.reduce((sum, p) => sum + p.impression, 0)
  const totalEngagement = d.platformMetrik.reduce((sum, p) => sum + p.engagement, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Complain Mapping</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Analisis persepsi brand BSI di media online &amp; media sosial · 30 hari terakhir. Seluruh data
            adalah mock/dummy untuk keperluan demo.
          </p>
        </div>
        <FilterSelect label="Sumber Data" value={sumberData} options={[...semuaJenisMedia]} onChange={setSumberData} />
      </div>

      <Card>
        <CardHeader title="Executive Summary" />
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {d.ringkasan.map((butir, idx) => (
              <li key={idx}>{butir}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {showOnline && (
      <>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Media Perception</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Sentimen pemberitaan BSI di media online.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Sentiment Timeline" subtitle="Media online · harian" />
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={mediaTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Positif" stroke={SENTIMEN_COLOR.Positif} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Netral" stroke={SENTIMEN_COLOR.Netral} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Negatif" stroke={SENTIMEN_COLOR.Negatif} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Media Sentiment" subtitle="Komposisi total" />
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={mediaSentimenPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={1}>
                    {mediaSentimenPie.map((entry) => (
                      <Cell key={entry.name} fill={SENTIMEN_COLOR[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                {d.highlightPositif}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Product Analysis – Mass Media" subtitle="Topik paling banyak diberitakan" />
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={d.topikMediaMassa} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="topik" fontSize={11} width={170} />
              <Tooltip formatter={(v) => Number(v).toLocaleString('id-ID')} />
              <Bar dataKey="jumlah" fill="#0d9488" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </>)}

      {showSosial && (
      <>
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Potential Impression &amp; Engagement
        </h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Total impression {formatSingkat(totalImpression)} · Total engagement {formatSingkat(totalEngagement)} dari
          seluruh platform.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {d.platformMetrik.map((p) => {
            const Icon = PLATFORM_ICON[p.platform]
            return (
              <Card key={p.platform} className="p-4">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: PLATFORM_COLOR[p.platform] }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.platform}</p>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Impression <span className="font-semibold text-slate-800 dark:text-slate-100">{formatSingkat(p.impression)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Engagement <span className="font-semibold text-slate-800 dark:text-slate-100">{formatSingkat(p.engagement)}</span>
                  </p>
                </div>
              </Card>
            )
          })}
        </div>

        <Card className="mt-4">
          <CardHeader title="Engagement History" subtitle="Seluruh platform · harian" />
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={engagementChart}>
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => formatSingkat(Number(v))} />
                <Tooltip formatter={(v) => Number(v).toLocaleString('id-ID')} />
                <Area type="monotone" dataKey="allPlatform" stroke="#6366f1" fill="url(#colorEngagement)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Public Perception</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Sentimen audiens/percakapan BSI di media sosial.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Sentiment Timeline" subtitle="Audiens/media sosial · harian" />
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={audienceTimeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
                  <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Positif" stroke={SENTIMEN_COLOR.Positif} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Netral" stroke={SENTIMEN_COLOR.Netral} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Negatif" stroke={SENTIMEN_COLOR.Negatif} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Audience Sentiment" subtitle="Komposisi total" />
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={audienceSentimenPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={1}>
                    {audienceSentimenPie.map((entry) => (
                      <Cell key={entry.name} fill={SENTIMEN_COLOR[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                {d.highlightNegatif}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader title="Product Analysis – Social Media" subtitle="Topik paling banyak diperbincangkan" />
        <CardContent>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={d.topikMediaSosial} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={12} allowDecimals={false} />
              <YAxis type="category" dataKey="topik" fontSize={11} width={220} />
              <Tooltip formatter={(v) => Number(v).toLocaleString('id-ID')} />
              <Bar dataKey="jumlah" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Complain Mapping</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Pemetaan jenis keluhan nasabah per platform media sosial.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="Jenis Keluhan per Platform" />
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={d.jenisKeluhan} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="jenis" fontSize={11} width={150} />
                  <Tooltip />
                  <Legend />
                  {(['Twitter', 'Instagram', 'Facebook', 'YouTube', 'TikTok'] as PlatformBP[]).map((platform) => (
                    <Bar key={platform} dataKey={platform} stackId="platform" fill={PLATFORM_COLOR[platform]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Jumlah Keluhan per Platform" />
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={d.keluhanPerPlatform} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="topik" fontSize={12} width={80} />
                  <Tooltip />
                  <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
                    {d.keluhanPerPlatform.map((entry) => (
                      <Cell key={entry.topik} fill={PLATFORM_COLOR[entry.topik as PlatformBP]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      </>)}
    </div>
  )
}
