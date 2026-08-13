import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  MessageSquare,
  Minus,
  Newspaper,
  Radio,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { StatCard, TrendDelta } from '@/components/StatCard'
import { FilterSelect } from '@/components/FilterSelect'
import { TimelineFilter } from '@/components/TimelineFilter'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { TrendBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { daftarBerita, semuaJenisMedia } from '@/data/mockData'
import {
  cocokPeriode,
  dalamRentang,
  hitungPerubahanPersen,
  hitungReputationIssues,
  hitungTrenEksposur,
  labelPeriode,
  periodeSebelumnya,
  PERIODE_DEFAULT,
  tandaiAnomali,
} from '@/lib/aggregations'
import type { PeriodeValue, MomentumStatus, ReputationIssue, RiskKategori } from '@/lib/aggregations'

const SENTIMEN_COLOR = {
  Positif: 'bg-emerald-500',
  Netral: 'bg-slate-400',
  Negatif: 'bg-rose-500',
}

const RISK_META: Record<RiskKategori, { emoji: string; className: string }> = {
  'High Risk': { emoji: '🔴', className: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400' },
  'Emerging Risk': { emoji: '🟠', className: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400' },
  Monitor: { emoji: '🟡', className: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400' },
  'Positive Opportunity': { emoji: '🟢', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400' },
}

function RiskKategoriBadge({ value }: { value: RiskKategori }) {
  const meta = RISK_META[value]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        meta.className,
      )}
    >
      {meta.emoji} {value}
    </span>
  )
}

const MOMENTUM_META: Record<MomentumStatus, { icon: LucideIcon; label: string; className: string }> = {
  Emerging: {
    icon: Sparkles,
    label: 'Emerging',
    className: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400',
  },
  Rising: {
    icon: TrendingUp,
    label: 'Rising',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  Declining: {
    icon: TrendingDown,
    label: 'Declining',
    className: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
  },
  Stable: {
    icon: Minus,
    label: 'Stable',
    className: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
  },
}

function narasiAlert(issue: ReputationIssue): string {
  const arah =
    issue.momentumStatus === 'Emerging'
      ? 'muncul sebagai isu baru'
      : issue.momentumStatus === 'Rising'
        ? `meningkat ${issue.momentumPct}%`
        : issue.momentumStatus === 'Declining'
          ? `menurun ${Math.abs(issue.momentumPct ?? 0)}%`
          : 'relatif stabil'
  return `Percakapan mengenai ${issue.subIsu} ${arah} dibanding periode sebelumnya, dengan ${issue.negatifPct}% sentimen negatif dari ${issue.exposure} pemberitaan/percakapan dan ${issue.engagement.toLocaleString('id-ID')} interaksi.`
}

export function Dashboard() {
  const [periode, setPeriode] = useState<PeriodeValue>(PERIODE_DEFAULT)
  const [sumberData, setSumberData] = useState('')

  const dataTerfilter = useMemo(
    () =>
      daftarBerita.filter(
        (b) => cocokPeriode(b.tanggal, periode) && (!sumberData || b.jenisMedia === sumberData),
      ),
    [periode, sumberData],
  )

  const periodeLalu = useMemo(() => periodeSebelumnya(periode), [periode])
  const dataSebelumnya = useMemo(
    () =>
      daftarBerita.filter(
        (b) => dalamRentang(b.tanggal, periodeLalu.dari, periodeLalu.sampai) && (!sumberData || b.jenisMedia === sumberData),
      ),
    [periodeLalu, sumberData],
  )

  const totalBerita = dataTerfilter.length
  const totalBeritaLalu = dataSebelumnya.length

  const totalPercakapan = useMemo(() => dataTerfilter.filter((b) => b.jenisMedia === 'Media Sosial').length, [dataTerfilter])
  const totalPercakapanLalu = useMemo(
    () => dataSebelumnya.filter((b) => b.jenisMedia === 'Media Sosial').length,
    [dataSebelumnya],
  )

  const sentimenCount = useMemo(
    () => ({
      Positif: dataTerfilter.filter((b) => b.sentimen === 'Positif').length,
      Netral: dataTerfilter.filter((b) => b.sentimen === 'Netral').length,
      Negatif: dataTerfilter.filter((b) => b.sentimen === 'Negatif').length,
    }),
    [dataTerfilter],
  )
  const sentimenCountLalu = useMemo(
    () => ({
      Positif: dataSebelumnya.filter((b) => b.sentimen === 'Positif').length,
      Netral: dataSebelumnya.filter((b) => b.sentimen === 'Netral').length,
      Negatif: dataSebelumnya.filter((b) => b.sentimen === 'Negatif').length,
    }),
    [dataSebelumnya],
  )

  const sentimenNegatifPct = totalBerita === 0 ? 0 : Math.round((sentimenCount.Negatif / totalBerita) * 100)
  const sentimenNegatifPctLalu =
    totalBeritaLalu === 0 ? 0 : Math.round((sentimenCountLalu.Negatif / totalBeritaLalu) * 100)
  const sentimenPositifPct = totalBerita === 0 ? 0 : Math.round((sentimenCount.Positif / totalBerita) * 100)
  const sentimenNetralPct = Math.max(0, 100 - sentimenPositifPct - sentimenNegatifPct)

  const totalEngagement = useMemo(() => dataTerfilter.reduce((s, b) => s + b.engagement, 0), [dataTerfilter])
  const totalEngagementLalu = useMemo(() => dataSebelumnya.reduce((s, b) => s + b.engagement, 0), [dataSebelumnya])

  const trenEksposur = useMemo(() => hitungTrenEksposur(dataTerfilter, periode), [dataTerfilter, periode])
  const anomaliEksposur = useMemo(
    () => tandaiAnomali(trenEksposur, (r) => r.mediaExposure + r.socialConversation),
    [trenEksposur],
  )

  const reputationIssues = useMemo(() => hitungReputationIssues(dataTerfilter, dataSebelumnya), [dataTerfilter, dataSebelumnya])
  const topIssues = reputationIssues.slice(0, 6)

  const positiveDrivers = useMemo(
    () => [...reputationIssues].filter((i) => i.positif > 0).sort((a, b) => b.positif - a.positif).slice(0, 5),
    [reputationIssues],
  )
  const negativeDrivers = useMemo(
    () => [...reputationIssues].filter((i) => i.negatif > 0).sort((a, b) => b.negatif - a.negatif).slice(0, 5),
    [reputationIssues],
  )

  const momentumIssues = useMemo(() => {
    const movers = reputationIssues.filter((i) => i.momentumStatus !== 'Stable')
    const stabil = reputationIssues.filter((i) => i.momentumStatus === 'Stable')
    return [...movers, ...stabil].slice(0, 6)
  }, [reputationIssues])

  const topRisk = useMemo(() => [...reputationIssues].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3), [reputationIssues])

  const overviewMetrics = [
    { label: 'Media Exposure', value: totalBerita, change: hitungPerubahanPersen(totalBerita, totalBeritaLalu), goodDirection: 'up' as const },
    { label: 'Social Conversation', value: totalPercakapan, change: hitungPerubahanPersen(totalPercakapan, totalPercakapanLalu), goodDirection: 'up' as const },
    { label: 'Positive Sentiment', value: sentimenCount.Positif, change: hitungPerubahanPersen(sentimenCount.Positif, sentimenCountLalu.Positif), goodDirection: 'up' as const },
    { label: 'Neutral Sentiment', value: sentimenCount.Netral, change: hitungPerubahanPersen(sentimenCount.Netral, sentimenCountLalu.Netral), goodDirection: 'up' as const },
    { label: 'Negative Sentiment', value: sentimenCount.Negatif, change: hitungPerubahanPersen(sentimenCount.Negatif, sentimenCountLalu.Negatif), goodDirection: 'down' as const },
    { label: 'Engagement', value: totalEngagement.toLocaleString('id-ID'), change: hitungPerubahanPersen(totalEngagement, totalEngagementLalu), goodDirection: 'up' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Executive Summary</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kondisi reputasi BSI · monitoring media online dan media sosial {labelPeriode(periode)}.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Sumber Data" value={sumberData} options={[...semuaJenisMedia]} onChange={setSumberData} />
          <TimelineFilter value={periode} onChange={setPeriode} />
        </div>
      </div>

      {/* A. Reputation Snapshot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Media Exposure"
          value={totalBerita}
          icon={Newspaper}
          change={hitungPerubahanPersen(totalBerita, totalBeritaLalu)}
        />
        <StatCard
          label="Total Percakapan Medsos"
          value={totalPercakapan}
          icon={MessageSquare}
          change={hitungPerubahanPersen(totalPercakapan, totalPercakapanLalu)}
        />
        <StatCard
          label="Sentimen Negatif"
          value={`${sentimenNegatifPct}%`}
          icon={Radio}
          tone="negative"
          change={hitungPerubahanPersen(sentimenNegatifPct, sentimenNegatifPctLalu)}
          goodDirection="down"
        />
        <StatCard
          label="Total Engagement"
          value={totalEngagement.toLocaleString('id-ID')}
          icon={Activity}
          change={hitungPerubahanPersen(totalEngagement, totalEngagementLalu)}
        />
      </div>

      {/* B. BSI Reputation Overview */}
      <Card>
        <CardHeader title="BSI Reputation Overview" subtitle={`Ringkasan kondisi reputasi BSI · ${labelPeriode(periode)}`} />
        <CardContent>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {overviewMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{m.value}</p>
                <TrendDelta change={m.change} goodDirection={m.goodDirection} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* C. BSI Reputation Trend */}
      <Card>
        <CardHeader
          title="BSI Reputation Trend"
          subtitle={`Media exposure vs social conversation harian · ${labelPeriode(periode)}`}
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trenEksposur}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="tanggal" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mediaExposure" name="Media Exposure" stroke="#033744" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="socialConversation" name="Social Conversation" stroke="#ff4900" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          {anomaliEksposur.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {anomaliEksposur.map((a) => (
                <span
                  key={`${a.tipe}-${a.tanggal}`}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                    a.tipe === 'spike'
                      ? 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
                  )}
                >
                  {a.tipe === 'spike' ? '🔺 Spike' : '🔻 Penurunan'} · {a.tanggal}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* D. Reputation Sentiment */}
        <Card>
          <CardHeader title="Reputation Sentiment" subtitle="Distribusi sentimen terhadap BSI secara keseluruhan" />
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                <p className="text-3xl font-semibold text-rose-600 dark:text-rose-400">{sentimenNegatifPct}%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Negative Sentiment</p>
                <TrendDelta
                  change={hitungPerubahanPersen(sentimenNegatifPct, sentimenNegatifPctLalu)}
                  goodDirection="down"
                  className="mt-1 inline-block"
                />
              </div>
              <div className="flex-1">
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={SENTIMEN_COLOR.Positif} style={{ width: `${sentimenPositifPct}%` }} />
                  <div className={SENTIMEN_COLOR.Netral} style={{ width: `${sentimenNetralPct}%` }} />
                  <div className={SENTIMEN_COLOR.Negatif} style={{ width: `${sentimenNegatifPct}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Positive {sentimenPositifPct}%</span>
                  <span>Neutral {sentimenNetralPct}%</span>
                  <span>Negative {sentimenNegatifPct}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* F (paruh 1). Reputation Drivers */}
        <Card>
          <CardHeader title="Reputation Drivers" subtitle="Faktor yang membentuk reputasi BSI" />
          <CardContent>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  <ThumbsUp className="h-4 w-4" /> Positive Drivers
                </p>
                <ul className="space-y-2">
                  {positiveDrivers.map((d) => (
                    <li key={d.subIsu} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-200">{d.subIsu}</span>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{d.positif} positif</span>
                    </li>
                  ))}
                  {positiveDrivers.length === 0 && (
                    <p className="text-sm text-slate-400">Belum ada driver positif signifikan.</p>
                  )}
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-rose-700 dark:text-rose-400">
                  <ThumbsDown className="h-4 w-4" /> Negative Drivers
                </p>
                <ul className="space-y-2">
                  {negativeDrivers.map((d) => (
                    <li key={d.subIsu} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-200">{d.subIsu}</span>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{d.negatif} negatif</span>
                    </li>
                  ))}
                  {negativeDrivers.length === 0 && (
                    <p className="text-sm text-slate-400">Belum ada driver negatif signifikan.</p>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* E. Top Reputation Issues */}
      <Card>
        <CardHeader title="Top Reputation Issues" subtitle="Isu paling berpengaruh terhadap reputasi BSI" />
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <th className="py-2 pr-3 font-medium">Issue</th>
                <th className="py-2 pr-3 text-right font-medium">Exposure</th>
                <th className="py-2 pr-3 text-right font-medium">Negative</th>
                <th className="py-2 pr-3 text-right font-medium">Engagement</th>
                <th className="py-2 pr-3 font-medium">Trend</th>
                <th className="py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {topIssues.map((i) => (
                <tr key={i.subIsu} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="py-2.5 pr-3 font-medium text-slate-800 dark:text-slate-100">{i.subIsu}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-600 dark:text-slate-300">{i.exposure}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-600 dark:text-slate-300">{i.negatifPct}%</td>
                  <td className="py-2.5 pr-3 text-right text-slate-600 dark:text-slate-300">
                    {i.engagement.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 pr-3">
                    <TrendBadge value={i.trend} />
                  </td>
                  <td className="py-2.5">
                    <RiskKategoriBadge value={i.riskKategori} />
                  </td>
                </tr>
              ))}
              {topIssues.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-sm text-slate-400">
                    Tidak ada isu pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* G (paruh 1). Issue Momentum */}
        <Card>
          <CardHeader title="Issue Momentum" subtitle="Pergerakan isu dibanding periode sebelumnya" />
          <CardContent className="space-y-2.5">
            {momentumIssues.map((i) => {
              const meta = MOMENTUM_META[i.momentumStatus]
              const Icon = meta.icon
              return (
                <div
                  key={i.subIsu}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{i.subIsu}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {i.exposure} eksposur · {i.negatifPct}% negatif
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {i.riskKategori === 'High Risk' && <span title="High Risk">🔴</span>}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
                        meta.className,
                      )}
                    >
                      <Icon className="h-3 w-3" /> {meta.label}
                    </span>
                  </div>
                </div>
              )
            })}
            {momentumIssues.length === 0 && (
              <p className="text-sm text-slate-400">Tidak ada pergerakan isu signifikan.</p>
            )}
          </CardContent>
        </Card>

        {/* G (paruh 2). Reputation Alert */}
        <Card>
          <CardHeader
            title="Reputation Alert"
            subtitle="Isu yang memerlukan perhatian, diurutkan berdasarkan risk score"
            action={<AlertTriangle className="h-4 w-4 text-rose-500" />}
          />
          <CardContent className="space-y-3">
            {topRisk
              .filter((i) => i.riskKategori !== 'Positive Opportunity')
              .map((i) => (
                <div key={i.subIsu} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{i.subIsu}</p>
                    <RiskKategoriBadge value={i.riskKategori} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{narasiAlert(i)}</p>
                </div>
              ))}
            {topRisk.every((i) => i.riskKategori === 'Positive Opportunity') && (
              <p className="text-sm text-slate-400">Tidak ada isu berisiko tinggi pada periode ini.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
