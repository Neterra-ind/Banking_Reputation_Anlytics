import { useMemo, useState } from 'react'
import { Navigate, NavLink, useParams } from 'react-router-dom'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Bar,
  BarChart,
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
import { FilterSelect } from '@/components/FilterSelect'
import { NewsDetailDrawer } from '@/components/NewsDetailDrawer'
import { TimelineFilter } from '@/components/TimelineFilter'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { SentimenBadge } from '@/components/ui/Badge'
import { daftarBerita, semuaJenisMedia } from '@/data/mockData'
import { cocokPeriode, hitungPerHari, hitungTrenRange, PERIODE_DEFAULT, topN } from '@/lib/aggregations'
import type { PeriodeValue } from '@/lib/aggregations'
import { cn } from '@/lib/utils'
import { semuaIsu, subIsuByIsu } from '@/types'
import type { Berita, Isu, Sentimen } from '@/types'
import { Newspaper, Flame, Radio } from 'lucide-react'

const SENTIMEN_COLOR: Record<string, string> = {
  Positif: '#10b981',
  Netral: '#94a3b8',
  Negatif: '#f43f5e',
}

const KATEGORI_WARNA: Record<string, { bg: string; ring: string; title: string }> = {
  'Produk Tabungan dan Simpanan': {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    ring: 'ring-blue-500 dark:ring-blue-400',
    title: 'text-blue-800 dark:text-blue-300',
  },
  'Produk Pembiayaan': {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'ring-amber-500 dark:ring-amber-400',
    title: 'text-amber-800 dark:text-amber-300',
  },
  'Produk Investasi dan Transaksi': {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    ring: 'ring-violet-500 dark:ring-violet-400',
    title: 'text-violet-800 dark:text-violet-300',
  },
  'Berita Bank Syariah Indonesia': {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    ring: 'ring-emerald-500 dark:ring-emerald-400',
    title: 'text-emerald-800 dark:text-emerald-300',
  },
}

const ISU_TUJUAN: Record<Isu, string> = {
  Perbankan: 'Memantau pemberitaan stakeholder yang berkaitan atau terhubung dengan kepentingan BSI.',
  BSI: 'Memantau perkembangan bisnis dan produk BSI.',
}

// Klasifikasi sub-isu BSI ke dalam kelompok kategori produk, plus satu kategori umum
// untuk topik korporat/kapabilitas yang tidak spesifik ke satu produk.
const KATEGORI_PRODUK_BSI: { kategori: string; subIsu: string[] }[] = [
  { kategori: 'Berita Bank Syariah Indonesia', subIsu: ['AI', 'Kinerja Keuangan', 'Transformasi Digital'] },
  { kategori: 'Produk Tabungan dan Simpanan', subIsu: ['Tabungan'] },
  { kategori: 'Produk Pembiayaan', subIsu: ['Pembiayaan', 'UMKM', 'KPR', 'Haji', 'Umrah'] },
  {
    kategori: 'Produk Investasi dan Transaksi',
    subIsu: ['Bullion/Emas', 'Digital Banking', 'Mobile Banking', 'BYOND', 'API Banking'],
  },
]

// Nama & jabatan narasumber generik (mock) yang mewakili tiap kategori
// stakeholder pada berita, bukan individu nyata.
const NARASUMBER_NAMA: Record<string, { nama: string; jabatan: string }> = {
  OJK: { nama: 'Ahmad Fadli', jabatan: 'Juru Bicara OJK' },
  'Bank Indonesia': { nama: 'Rina Kartika', jabatan: 'Juru Bicara BI' },
  'DSN-MUI': { nama: 'Miftahul Huda', jabatan: 'Anggota DSN-MUI' },
  Nasabah: { nama: 'Budi Santoso', jabatan: 'Nasabah BSI' },
  'Media Massa': { nama: 'Rudi Hartono', jabatan: 'Jurnalis' },
  Investor: { nama: 'Dewi Lestari', jabatan: 'Analis Investasi' },
  Regulator: { nama: 'Hendra Wijaya', jabatan: 'Pejabat Regulator' },
  'Komunitas Syariah': { nama: 'Siti Aminah', jabatan: 'Tokoh Komunitas Syariah' },
  Pemerintah: { nama: 'Joko Prasetyo', jabatan: 'Pejabat Pemerintah' },
  'Mitra Bisnis': { nama: 'Andi Saputra', jabatan: 'Perwakilan Mitra Bisnis' },
}

function sentimenDominan(sentimenList: Sentimen[]): Sentimen | null {
  if (sentimenList.length === 0) return null
  const count: Record<Sentimen, number> = { Positif: 0, Netral: 0, Negatif: 0 }
  for (const s of sentimenList) count[s]++
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0] as Sentimen
}

const TAB_ITEMS: { to: string; label: string }[] = [
  { to: '/isu/Perbankan', label: 'Perbankan' },
  { to: '/isu/BSI', label: 'BSI' },
]

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
          {info.row.original.sumber} · {info.row.original.subIsu}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'sentimen',
    header: 'Sentimen',
    cell: (info) => <SentimenBadge value={info.getValue()} />,
  },
]

export function IsuDetail() {
  const { id } = useParams<{ id: string }>()
  const [selected, setSelected] = useState<Berita | null>(null)
  const [periode, setPeriode] = useState<PeriodeValue>(PERIODE_DEFAULT)
  const [sumberData, setSumberData] = useState('')
  const [selectedTopik, setSelectedTopik] = useState<string | null>(null)
  const [selectedKategoriProduk, setSelectedKategoriProduk] = useState<string | null>(null)

  const isuValid = id && semuaIsu.includes(id as Isu) ? (id as Isu) : null
  const isu = isuValid ?? 'BSI'

  const items = useMemo(
    () =>
      daftarBerita.filter(
        (b) => b.isu === isu && cocokPeriode(b.tanggal, periode) && (!sumberData || b.jenisMedia === sumberData),
      ),
    [isu, periode, sumberData],
  )

  const volume = items.length
  const viral = items.filter((b) => b.isViral).length
  const mediaAktif = useMemo(() => new Set(items.map((b) => b.sumber)).size, [items])

  const topikUtama = useMemo(() => topN(items, 'subIsu', subIsuByIsu[isu].length), [items, isu])

  const activeTopik =
    selectedTopik && topikUtama.some((t) => t.name === selectedTopik) ? selectedTopik : (topikUtama[0]?.name ?? null)

  const beritaTopik = useMemo(
    () =>
      activeTopik
        ? [...items].filter((b) => b.subIsu === activeTopik).sort((a, b) => b.engagement - a.engagement).slice(0, 6)
        : [],
    [items, activeTopik],
  )

  const kategoriProduk = useMemo(() => {
    if (isu !== 'BSI') return []
    return KATEGORI_PRODUK_BSI.map(({ kategori, subIsu }) => {
      const itemsKategori = items.filter((b) => subIsu.includes(b.subIsu))
      return {
        kategori,
        subIsu,
        volume: itemsKategori.length,
        sentimenDominan: sentimenDominan(itemsKategori.map((b) => b.sentimen)),
        Positif: itemsKategori.filter((b) => b.sentimen === 'Positif').length,
        Netral: itemsKategori.filter((b) => b.sentimen === 'Netral').length,
        Negatif: itemsKategori.filter((b) => b.sentimen === 'Negatif').length,
      }
    })
  }, [items, isu])

  const activeKategoriProduk =
    (selectedKategoriProduk && kategoriProduk.some((k) => k.kategori === selectedKategoriProduk)
      ? selectedKategoriProduk
      : kategoriProduk[0]?.kategori) ?? null

  const warnaKategoriAktif = activeKategoriProduk ? KATEGORI_WARNA[activeKategoriProduk] : undefined

  const itemsKategoriAktif = useMemo(() => {
    const kategori = kategoriProduk.find((k) => k.kategori === activeKategoriProduk)
    if (!kategori) return []
    return items.filter((b) => kategori.subIsu.includes(b.subIsu))
  }, [items, kategoriProduk, activeKategoriProduk])

  const beritaKategoriProduk = useMemo(
    () => [...itemsKategoriAktif].sort((a, b) => b.engagement - a.engagement).slice(0, 8),
    [itemsKategoriAktif],
  )

  const trenKategoriProduk = useMemo(() => {
    if (periode.preset === 'custom' && periode.dari && periode.sampai) {
      return hitungTrenRange(itemsKategoriAktif, periode.dari, periode.sampai)
    }
    return hitungPerHari(
      itemsKategoriAktif,
      periode.preset && periode.preset !== 'custom' ? Number(periode.preset) : 30,
    )
  }, [itemsKategoriAktif, periode])

  const sentimenKategoriProduk = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of itemsKategoriAktif) map.set(b.sentimen, (map.get(b.sentimen) ?? 0) + 1)
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [itemsKategoriAktif])

  const mediaShareKategoriProduk = useMemo(() => topN(itemsKategoriAktif, 'sumber', 6), [itemsKategoriAktif])

  const narasumberKategoriProduk = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of itemsKategoriAktif) {
      for (const s of b.stakeholderTerkait) {
        const narasumber = NARASUMBER_NAMA[s]
        const label = narasumber ? `${narasumber.nama} (${narasumber.jabatan})` : s
        map.set(label, (map.get(label) ?? 0) + 1)
      }
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [itemsKategoriAktif])

  if (!isuValid) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Isu {isu}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{ISU_TUJUAN[isu]}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect label="Sumber Data" value={sumberData} options={[...semuaJenisMedia]} onChange={setSumberData} />
          <TimelineFilter value={periode} onChange={setPeriode} />
        </div>
      </div>

      {(isu === 'Perbankan' || isu === 'BSI') && (
        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
          {TAB_ITEMS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-teal-600 text-teal-700 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Berita" value={volume} icon={Newspaper} />
        <StatCard label="Media Aktif" value={mediaAktif} icon={Radio} />
        <StatCard label="Isu Viral" value={viral} icon={Flame} tone="negative" />
      </div>

      {isu === 'BSI' && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Berita BSI dan Produk</h2>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
            Klasifikasi pemberitaan produk BSI ke dalam 4 kelompok kategori. Klik salah satu kategori untuk melihat
            berita terkait.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kategoriProduk.map((k) => {
              const isActive = k.kategori === activeKategoriProduk
              return (
                <button
                  key={k.kategori}
                  type="button"
                  onClick={() => setSelectedKategoriProduk(k.kategori)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      'h-full p-4 transition-colors',
                      KATEGORI_WARNA[k.kategori]?.bg,
                      isActive ? cn('ring-2', KATEGORI_WARNA[k.kategori]?.ring) : 'hover:ring-1 hover:ring-slate-300 dark:hover:ring-slate-700',
                    )}
                  >
                    <p className={cn('text-sm font-semibold', KATEGORI_WARNA[k.kategori]?.title)}>{k.kategori}</p>
                    <div className="mt-3">
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{k.volume}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Berita/Ekspos</p>
                      {k.sentimenDominan && (
                        <div className="mt-1.5">
                          <SentimenBadge value={k.sentimenDominan} />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {k.subIsu.map((s) => (
                        <span
                          key={s}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </Card>
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className={cn('lg:col-span-1', warnaKategoriAktif?.bg)}>
              <CardHeader title="Berita Kategori Produk" subtitle={activeKategoriProduk ?? undefined} />
              <CardContent className="space-y-2.5">
                {beritaKategoriProduk.length === 0 && (
                  <p className="text-sm text-slate-400">Tidak ada berita untuk kategori ini pada periode ini.</p>
                )}
                {beritaKategoriProduk.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelected(b)}
                    className="block w-full border-b border-slate-100 pb-2 text-left last:border-0 last:pb-0 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400">
                        {b.judul}
                      </p>
                      <SentimenBadge value={b.sentimen} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {b.sumber} · {b.subIsu} · {b.tanggal}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              <Card className={warnaKategoriAktif?.bg}>
                <CardHeader title="Tren Waktu" subtitle={activeKategoriProduk ?? undefined} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trenKategoriProduk}>
                      <defs>
                        <linearGradient id="colorKategori" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="tanggal" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="jumlah" stroke="#0d9488" fill="url(#colorKategori)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={warnaKategoriAktif?.bg}>
                <CardHeader title="Sentimen" subtitle={activeKategoriProduk ?? undefined} />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={sentimenKategoriProduk}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {sentimenKategoriProduk.map((entry) => (
                          <Cell key={entry.name} fill={SENTIMEN_COLOR[entry.name]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className={warnaKategoriAktif?.bg}>
                <CardHeader title="Media Share" subtitle="Porsi sumber pemberitaan" />
                <CardContent>
                  {mediaShareKategoriProduk.length === 0 ? (
                    <p className="text-sm text-slate-400">Tidak ada data media untuk kategori ini.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={mediaShareKategoriProduk} layout="vertical" margin={{ left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" fontSize={11} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" fontSize={11} width={80} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className={warnaKategoriAktif?.bg}>
                <CardHeader title="Narasumber Berita" subtitle="Nama narasumber yang memberikan pernyataan" />
                <CardContent>
                  {narasumberKategoriProduk.length === 0 ? (
                    <p className="text-sm text-slate-400">Tidak ada narasumber untuk kategori ini.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={narasumberKategoriProduk.length * 50}>
                      <BarChart data={narasumberKategoriProduk} layout="vertical" margin={{ left: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" fontSize={11} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" fontSize={10} width={170} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      )}

      {isu === 'Perbankan' && (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Topik Utama" subtitle="Klik salah satu topik untuk melihat berita terkait" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topikUtama.map((t) => {
                const maxVal = topikUtama[0]?.value || 1
                const scale = 0.8 + (t.value / maxVal) * 0.9
                const isActive = t.name === activeTopik
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTopik(t.name)}
                    style={{ fontSize: `${scale * 0.85}rem` }}
                    className={cn(
                      'rounded-full px-3 py-1 font-medium transition-colors',
                      isActive
                        ? 'bg-teal-600 text-white dark:bg-teal-500'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20',
                    )}
                  >
                    {t.name} <span className="text-xs opacity-70">({t.value})</span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Berita Terkait Topik" subtitle={activeTopik ?? undefined} />
          <CardContent className="space-y-2.5">
            {beritaTopik.length === 0 && (
              <p className="text-sm text-slate-400">Tidak ada berita untuk topik ini pada periode ini.</p>
            )}
            {beritaTopik.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b)}
                className="block w-full border-b border-slate-100 pb-2 text-left last:border-0 last:pb-0 dark:border-slate-800"
              >
                <p className="text-sm font-medium text-slate-800 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400">
                  {b.judul}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {b.sumber} · {b.tanggal}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
      )}

      <Card className="p-4">
        <DataTable data={items} columns={columns} searchPlaceholder="Cari judul, sumber..." onRowClick={setSelected} />
      </Card>

      <NewsDetailDrawer berita={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
