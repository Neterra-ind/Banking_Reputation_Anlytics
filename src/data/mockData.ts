import type {
  Alert,
  Berita,
  BrandPerceptionData,
  Isu,
  KeluhanPlatform,
  Kompetitor,
  MonthlyRecapData,
  RiskLevel,
  Sentimen,
  TipeAlert,
  Urgensi,
} from '@/types'
import { semuaIsu, semuaMediaOnline, semuaMediaSosial, semuaPlatformBP, subIsuByIsu } from '@/types'

// Seeded PRNG (mulberry32) supaya data mock konsisten di setiap reload.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20260723)

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function pickWeighted<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let r = rand() * total
  for (const [key, w] of entries) {
    r -= w
    if (r <= 0) return key
  }
  return entries[entries.length - 1][0]
}

function randomInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min
}

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

const KEBIJAKAN_TEMPLATES = [
  (s: string) => `OJK Perketat Ketentuan ${s} bagi Perbankan Syariah`,
  (s: string) => `Bank Indonesia Terbitkan Kebijakan Baru terkait ${s}`,
  (s: string) => `BSI Diminta Patuhi Aturan Baru soal ${s}`,
  (s: string) => `Regulator Soroti Implementasi ${s} di Industri Perbankan Syariah`,
  (s: string) => `Kajian Dampak Kebijakan ${s} terhadap Bisnis Perbankan Syariah`,
]

const BISNIS_TEMPLATES = [
  (s: string) => `BSI Catat Pertumbuhan Signifikan pada Produk ${s}`,
  (s: string) => `Inovasi Layanan ${s} BSI Diminati Nasabah`,
  (s: string) => `BSI Perluas Jangkauan Layanan ${s} ke Daerah Baru`,
  (s: string) => `Kinerja Segmen ${s} BSI Kuartal Ini Tumbuh Positif`,
  (s: string) => `BSI Luncurkan Fitur Baru pada Layanan ${s}`,
  (s: string) => `Analis Soroti Prospek Bisnis ${s} BSI`,
]

const TEMPLATES_BY_ISU: Record<Isu, ((s: string) => string)[]> = {
  Perbankan: KEBIJAKAN_TEMPLATES,
  BSI: BISNIS_TEMPLATES,
}

const dampakBisnisPool = [
  'Berpotensi memengaruhi volume transaksi pada produk terkait.',
  'Dapat meningkatkan minat nasabah terhadap produk BSI.',
  'Berisiko menurunkan kepercayaan nasabah dalam jangka pendek.',
  'Berpotensi membuka peluang kerja sama bisnis baru.',
  'Tidak berdampak signifikan terhadap kinerja bisnis saat ini.',
  'Berpotensi meningkatkan biaya kepatuhan operasional.',
]

const dampakReputasiPool = [
  'Dapat memperkuat citra BSI sebagai bank syariah terdepan.',
  'Berisiko menurunkan reputasi BSI di mata publik.',
  'Netral terhadap reputasi, perlu dipantau perkembangan lanjutan.',
  'Berpotensi menjadi sorotan media dalam beberapa hari ke depan.',
  'Memperkuat posisi BSI sebagai pemimpin transformasi digital syariah.',
]

const peluangBisnisPool = [
  'Peluang cross-selling produk pembiayaan kepada nasabah eksisting.',
  'Peluang ekspansi layanan digital ke segmen nasabah baru.',
  'Peluang kolaborasi dengan mitra strategis di sektor terkait.',
  'Tidak ada peluang bisnis signifikan yang teridentifikasi.',
  'Peluang penguatan brand melalui kampanye komunikasi lanjutan.',
]

const rekomendasiPool = [
  'Siapkan pernyataan resmi dari Corporate Communication.',
  'Koordinasikan tindak lanjut dengan unit Compliance.',
  'Lakukan pemantauan lanjutan selama 48 jam ke depan.',
  'Eskalasikan ke Risk Management untuk mitigasi lebih lanjut.',
  'Manfaatkan momentum untuk kampanye pemasaran produk terkait.',
  'Libatkan tim Digital Banking untuk perbaikan layanan.',
  'Siapkan bahan paparan untuk Direksi dalam rapat mingguan.',
]

const stakeholderPool = [
  'OJK',
  'Bank Indonesia',
  'DSN-MUI',
  'Nasabah',
  'Media Massa',
  'Investor',
  'Regulator',
  'Komunitas Syariah',
  'Pemerintah',
  'Mitra Bisnis',
]

const unitKerjaPool = [
  'Corporate Communication',
  'Risk Management',
  'Compliance',
  'Business Division',
  'Digital Banking',
  'Direksi',
]

const kompetitorNama = [
  'Bank Muamalat Indonesia',
  'BTN Syariah',
  'CIMB Niaga Syariah',
  'BCA Syariah',
  'Bank Mega Syariah',
  'Bank KB Syariah',
  'Bank Aladin Syariah',
  'blu by BCA Digital',
]

function sampleN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0])
  }
  return out
}

function buatBerita(): Berita[] {
  const list: Berita[] = []
  let counter = 1

  for (const isu of semuaIsu) {
    const subs = subIsuByIsu[isu]
    const templates = TEMPLATES_BY_ISU[isu]
    // 88 berita/isu tersebar 60 hari (bukan 30) supaya perbandingan periode
    // sebelumnya pada Executive Summary punya data historis yang memadai.
    const jumlah = 88

    for (let i = 0; i < jumlah; i++) {
      const sub = pick(subs)
      const judul = pick(templates)(sub)
      const jenisMedia = pickWeighted<'Media Online' | 'Media Sosial'>({
        'Media Online': 0.55,
        'Media Sosial': 0.45,
      })
      const sumber = jenisMedia === 'Media Online' ? pick(semuaMediaOnline) : pick(semuaMediaSosial)

      const sentimen = pickWeighted<Sentimen>({ Positif: 0.4, Netral: 0.38, Negatif: 0.22 })
      const urgensi = pickWeighted<Urgensi>(
        sentimen === 'Negatif'
          ? { Rendah: 0.05, Sedang: 0.25, Tinggi: 0.45, Kritis: 0.25 }
          : { Rendah: 0.45, Sedang: 0.4, Tinggi: 0.13, Kritis: 0.02 },
      )

      const isViral = jenisMedia === 'Media Sosial' && rand() < 0.18
      const engagement = isViral
        ? randomInt(5000, 45000)
        : jenisMedia === 'Media Sosial'
          ? randomInt(50, 4000)
          : randomInt(20, 1500)

      const tanggal = isoDaysAgo(randomInt(0, 59))

      const kompetitorTerkait = isu === 'BSI' && rand() < 0.18 ? pick(kompetitorNama) : undefined

      list.push({
        id: `BR-${String(counter).padStart(4, '0')}`,
        tanggal,
        judul,
        sumber,
        jenisMedia,
        isu,
        subIsu: sub,
        sentimen,
        urgensi,
        engagement,
        isViral,
        dampakBisnis: pick(dampakBisnisPool),
        dampakReputasi: pick(dampakReputasiPool),
        peluangBisnis: pick(peluangBisnisPool),
        stakeholderTerkait: sampleN(stakeholderPool, randomInt(1, 3)),
        unitKerjaTerdampak: sampleN(unitKerjaPool, randomInt(1, 2)),
        ringkasanAI: `Pemberitaan mengenai ${sub.toLowerCase()} pada isu ${isu} dengan sentimen ${sentimen.toLowerCase()}. Isu ini perlu ditindaklanjuti oleh unit terkait sesuai rekomendasi AI.`,
        rekomendasiAI: sampleN(rekomendasiPool, randomInt(1, 3)),
        kompetitorTerkait,
        url: `https://contoh-media.id/berita/${counter}`,
      })
      counter++
    }
  }

  return list.sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1))
}

export const daftarBerita: Berita[] = buatBerita()

const KOMPETITOR_PRODUK: Record<string, string[]> = {
  BSI: ['Tabungan', 'Pembiayaan UMKM', 'KPR Syariah', 'Mobile Banking (BYOND)', 'Gadai Emas', 'Haji & Umrah'],
  'Bank Muamalat Indonesia': ['Tabungan iB', 'Pembiayaan UMKM', 'KPR Syariah', 'Mobile Banking', 'Gadai Emas'],
  'BTN Syariah': ['KPR Syariah', 'Tabungan', 'Pembiayaan Griya', 'Mobile Banking'],
  'CIMB Niaga Syariah': ['Tabungan', 'Pembiayaan UMKM', 'KPR Syariah', 'Mobile Banking'],
  'BCA Syariah': ['Tabungan', 'Pembiayaan', 'KPR Syariah', 'Mobile Banking', 'Deposito'],
  'Bank Mega Syariah': ['Tabungan', 'Pembiayaan', 'Gadai Emas', 'Mobile Banking'],
  'Bank KB Syariah': ['Tabungan', 'Pembiayaan UMKM', 'Mobile Banking'],
  'Bank Aladin Syariah': ['Digital Banking', 'Tabungan Digital', 'Pembiayaan Digital'],
  'blu by BCA Digital': ['Tabungan Digital', 'Deposito Digital', 'Kartu Debit', 'Fitur Kantong'],
}

function bagiEksposurProduk(total: number, produk: string[]) {
  const bobot = produk.map(() => rand() + 0.3)
  const jumlahBobot = bobot.reduce((a, b) => a + b, 0)
  return produk
    .map((p, i) => ({ produk: p, eksposur: Math.max(1, Math.round((bobot[i] / jumlahBobot) * total)) }))
    .sort((a, b) => b.eksposur - a.eksposur)
}

const daftarKompetitorBase: Omit<Kompetitor, 'produkEksposur' | 'trenHarian'>[] = [
  {
    id: 'KP-00',
    nama: 'BSI',
    kategori: 'Bank Syariah',
    sentimentScore: 68,
    topIssue: 'Transformasi Digital BYOND',
    mediaExposureOnline: 260,
    mediaExposureSosial: 220,
    engagementOnline: 210,
    engagementSosial: 490,
    trend: 'Naik',
  },
  {
    id: 'KP-01',
    nama: 'Bank Muamalat Indonesia',
    kategori: 'Bank Syariah',
    sentimentScore: 55,
    topIssue: 'Restrukturisasi Bisnis',
    mediaExposureOnline: 120,
    mediaExposureSosial: 90,
    engagementOnline: 70,
    engagementSosial: 170,
    trend: 'Stabil',
  },
  {
    id: 'KP-02',
    nama: 'BTN Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 60,
    topIssue: 'Ekspansi KPR Syariah',
    mediaExposureOnline: 85,
    mediaExposureSosial: 55,
    engagementOnline: 50,
    engagementSosial: 110,
    trend: 'Naik',
  },
  {
    id: 'KP-03',
    nama: 'CIMB Niaga Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 58,
    topIssue: 'Produk Pembiayaan UMKM',
    mediaExposureOnline: 75,
    mediaExposureSosial: 55,
    engagementOnline: 45,
    engagementSosial: 95,
    trend: 'Stabil',
  },
  {
    id: 'KP-04',
    nama: 'BCA Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 62,
    topIssue: 'Digitalisasi Layanan',
    mediaExposureOnline: 65,
    mediaExposureSosial: 55,
    engagementOnline: 50,
    engagementSosial: 110,
    trend: 'Naik',
  },
  {
    id: 'KP-05',
    nama: 'Bank Mega Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 50,
    topIssue: 'Kinerja Keuangan Kuartalan',
    mediaExposureOnline: 55,
    mediaExposureSosial: 40,
    engagementOnline: 30,
    engagementSosial: 70,
    trend: 'Turun',
  },
  {
    id: 'KP-06',
    nama: 'Bank KB Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 48,
    topIssue: 'Transformasi Kelembagaan',
    mediaExposureOnline: 35,
    mediaExposureSosial: 25,
    engagementOnline: 18,
    engagementSosial: 42,
    trend: 'Stabil',
  },
  {
    id: 'KP-07',
    nama: 'Bank Aladin Syariah',
    kategori: 'Bank Syariah',
    sentimentScore: 45,
    topIssue: 'Layanan Digital Banking',
    mediaExposureOnline: 20,
    mediaExposureSosial: 25,
    engagementOnline: 18,
    engagementSosial: 42,
    trend: 'Turun',
  },
  {
    id: 'KP-08',
    nama: 'blu by BCA Digital',
    kategori: 'Bank Digital/Fintech',
    sentimentScore: 66,
    topIssue: 'Kampanye Nasabah Baru',
    mediaExposureOnline: 40,
    mediaExposureSosial: 70,
    engagementOnline: 55,
    engagementSosial: 125,
    trend: 'Naik',
  },
]

function buatTrenHarianKompetitor(total: number, hari = 14) {
  const bagian = bagiRata(total, hari)
  return bagian.map((jumlah, i) => ({ tanggal: isoDaysAgo(hari - 1 - i).slice(5), jumlah }))
}

export const daftarKompetitor: Kompetitor[] = daftarKompetitorBase.map((k) => ({
  ...k,
  produkEksposur: bagiEksposurProduk(
    k.mediaExposureOnline + k.mediaExposureSosial,
    KOMPETITOR_PRODUK[k.nama] ?? [],
  ),
  trenHarian: buatTrenHarianKompetitor(k.mediaExposureOnline + k.mediaExposureSosial),
}))

const alertTemplates: { tipe: TipeAlert; isu: Isu; jenisMedia: 'Media Online' | 'Media Sosial'; judul: string; deskripsi: string; level: RiskLevel }[] = [
  {
    tipe: 'Regulasi Baru',
    isu: 'Perbankan',
    jenisMedia: 'Media Online',
    judul: 'OJK menerbitkan surat edaran baru terkait perlindungan data nasabah',
    deskripsi: 'Aturan baru berpotensi memengaruhi proses onboarding digital BSI.',
    level: 'Medium',
  },
  {
    tipe: 'Gangguan Layanan Digital',
    isu: 'BSI',
    jenisMedia: 'Media Sosial',
    judul: 'Laporan gangguan aplikasi BYOND dari sejumlah pengguna',
    deskripsi: 'Beberapa nasabah melaporkan kegagalan transaksi pada aplikasi mobile banking.',
    level: 'High',
  },
  {
    tipe: 'Regulasi Baru',
    isu: 'Perbankan',
    jenisMedia: 'Media Online',
    judul: 'DSN-MUI merilis fatwa baru terkait produk pembiayaan syariah',
    deskripsi: 'Fatwa baru berpotensi memerlukan penyesuaian pada beberapa produk pembiayaan BSI.',
    level: 'Medium',
  },
  {
    tipe: 'Trending Topic',
    isu: 'BSI',
    jenisMedia: 'Media Sosial',
    judul: 'Kampanye promo Umrah BSI ramai dibicarakan di media sosial',
    deskripsi: 'Engagement positif meningkat signifikan terkait promo pembiayaan Umrah.',
    level: 'Low',
  },
]

export const daftarAlert: Alert[] = alertTemplates.map((a, idx) => {
  const hariLalu = randomInt(0, 6)
  const tanggal = isoDaysAgo(hariLalu)
  return {
    id: `AL-${String(idx + 1).padStart(3, '0')}`,
    tanggal,
    waktu: `${String(randomInt(0, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
    ...a,
  }
})

export const semuaSentimen: Sentimen[] = ['Positif', 'Netral', 'Negatif']
export const semuaRiskLevel: RiskLevel[] = ['Low', 'Medium', 'High', 'Critical']
export const semuaUrgensi: Urgensi[] = ['Rendah', 'Sedang', 'Tinggi', 'Kritis']
export const semuaJenisMedia = ['Media Online', 'Media Sosial'] as const
export const semuaSumber = [...semuaMediaOnline, ...semuaMediaSosial]

// Data mock untuk halaman Brand Perception, unit analisisnya mengikuti laporan
// "Brand Perception Analysis": Media Perception, Product Analysis (mass media &
// social media), Potential Impression & Engagement, Public Perception, dan
// Complain Mapping.

const TOPIK_MEDIA_MASSA: [string, number, number][] = [
  ['Passing Mention', 3200, 4500],
  ['Saham (BRIS)', 1800, 2400],
  ['Pembiayaan UMKM', 900, 1400],
  ['Digital Banking', 600, 900],
  ['CSR', 450, 700],
  ['Event/Sponsorship', 400, 650],
  ['Pembiayaan Korporasi', 400, 650],
  ['Pendanaan (Funding)', 380, 600],
  ['Haji & Umrah', 350, 600],
  ['ESG', 300, 500],
  ['Literasi Keuangan Syariah', 300, 480],
  ['Kinerja Perusahaan', 250, 420],
]

const TOPIK_MEDIA_SOSIAL: [string, number, number][] = [
  ['Penyaluran Bantuan Sosial Melalui BSI', 1800, 2800],
  ['Diskusi Publik Isu Ekonomi Syariah', 700, 1100],
  ['Keluhan serta Pertanyaan Warganet', 700, 1000],
  ['Akun BSI Respons Keluhan Warganet', 450, 650],
  ['Program Promo BSI', 300, 500],
  ['Program Loyalti Nasabah', 120, 220],
  ['BYOND Sirkuit/Event Nasional', 100, 200],
  ['BSI di Islamic Book Fair', 80, 160],
  ['Info Lowongan Kerja BSI', 20, 50],
  ['Penerbitan Green Sukuk', 5, 20],
  ['Sinergi BSI dengan Mitra Strategis', 5, 20],
  ['Kampanye Edukasi Keuangan Syariah', 5, 20],
  ['Investasi Sukuk Ritel via BYOND', 3, 15],
  ['Imbauan Waspada Penipuan OTP', 3, 15],
]

const JENIS_KELUHAN_TEMPLATE: [string, [number, number], [number, number], [number, number], [number, number], [number, number]][] = [
  // [jenis, Twitter, Instagram, Facebook, YouTube, TikTok] rentang [min,max]
  ['Modus Penipuan', [8, 16], [0, 2], [2, 6], [1, 4], [1, 4]],
  ['Kendala ATM', [0, 3], [0, 1], [0, 2], [0, 1], [0, 1]],
  ['Kendala Kartu Debit', [2, 6], [0, 1], [0, 2], [0, 1], [0, 1]],
  ['Kendala Mobile Banking', [40, 60], [0, 2], [4, 10], [0, 1], [8, 14]],
  ['Kendala Layanan', [4, 10], [0, 1], [6, 12], [3, 6], [2, 6]],
  ['Kendala Penggunaan QRIS', [40, 55], [0, 1], [0, 1], [0, 1], [0, 1]],
  ['Gagal Transaksi', [6, 12], [0, 1], [0, 2], [0, 1], [1, 3]],
]

function buatSentimenHarian(hari: number, rentang: {
  positif: [number, number]
  netral: [number, number]
  negatif: [number, number]
}) {
  const list = []
  for (let i = hari - 1; i >= 0; i--) {
    list.push({
      tanggal: isoDaysAgo(i),
      Positif: randomInt(...rentang.positif),
      Netral: randomInt(...rentang.netral),
      Negatif: randomInt(...rentang.negatif),
    })
  }
  return list
}

function buatTopikVolume(template: [string, number, number][]) {
  return template
    .map(([topik, min, max]) => ({ topik, jumlah: randomInt(min, max) }))
    .sort((a, b) => b.jumlah - a.jumlah)
}

function buatBrandPerceptionData(): BrandPerceptionData {
  const mediaSentimenHarian = buatSentimenHarian(30, {
    positif: [80, 400],
    netral: [20, 200],
    negatif: [0, 15],
  })
  const audienceSentimenHarian = buatSentimenHarian(30, {
    positif: [20, 150],
    netral: [60, 300],
    negatif: [0, 4],
  })

  const jumlahkan = (list: { Positif: number; Netral: number; Negatif: number }[]) =>
    list.reduce(
      (acc, cur) => ({
        Positif: acc.Positif + cur.Positif,
        Netral: acc.Netral + cur.Netral,
        Negatif: acc.Negatif + cur.Negatif,
      }),
      { Positif: 0, Netral: 0, Negatif: 0 },
    )

  const mediaSentimenTotal = { ...jumlahkan(mediaSentimenHarian), Sensitif: randomInt(3, 10) }
  const audienceSentimenTotal = jumlahkan(audienceSentimenHarian)

  const engagementHarian = Array.from({ length: 30 }, (_, i) => ({
    tanggal: isoDaysAgo(29 - i),
    allPlatform: randomInt(800, 30000),
  }))

  const platformMetrik = semuaPlatformBP.map((platform) => {
    const [impMin, impMax, engMin, engMax] = {
      Twitter: [700_000_000, 1_100_000_000, 250_000_000, 400_000_000],
      Instagram: [60_000_000, 90_000_000, 70_000_000, 110_000_000],
      Facebook: [30_000_000, 60_000_000, 5_000_000, 15_000_000],
      YouTube: [10_000_000, 25_000_000, 1_000_000, 4_000_000],
      TikTok: [15_000_000, 35_000_000, 2_000_000, 6_000_000],
    }[platform] as [number, number, number, number]
    return {
      platform,
      impression: randomInt(impMin, impMax),
      engagement: randomInt(engMin, engMax),
    }
  })

  const jenisKeluhan: KeluhanPlatform[] = JENIS_KELUHAN_TEMPLATE.map(
    ([jenis, tw, ig, fb, yt, tt]) => ({
      jenis,
      Twitter: randomInt(...tw),
      Instagram: randomInt(...ig),
      Facebook: randomInt(...fb),
      YouTube: randomInt(...yt),
      TikTok: randomInt(...tt),
    }),
  )

  const keluhanPerPlatform = semuaPlatformBP
    .map((platform) => ({
      topik: platform,
      jumlah: jenisKeluhan.reduce((sum, j) => sum + j[platform], 0),
    }))
    .sort((a, b) => b.jumlah - a.jumlah)

  return {
    mediaSentimenHarian,
    mediaSentimenTotal,
    audienceSentimenHarian,
    audienceSentimenTotal,
    topikMediaMassa: buatTopikVolume(TOPIK_MEDIA_MASSA),
    topikMediaSosial: buatTopikVolume(TOPIK_MEDIA_SOSIAL),
    platformMetrik,
    engagementHarian,
    keluhanPerPlatform,
    jenisKeluhan,
    highlightPositif:
      'BSI Xpora Dorong UMKM Kopi Gayo Tembus Pasar Global, Ekspor Capai US$1 Juta',
    highlightNegatif: 'Polda Selidiki Dugaan Modus Penipuan Mengatasnamakan BSI di Media Sosial',
    ringkasan: [
      'Sepanjang periode ini, pemberitaan BSI didominasi topik Passing Mention, di antaranya seputar penyebutan BSI sebagai salah satu bank penyalur bantuan sosial pemerintah.',
      'Tiga isu utama dalam analisis produk di media online yakni Passing Mention, Saham (BRIS), dan Pembiayaan UMKM.',
      'Sentimen BSI di media online didominasi pemberitaan positif, salah satunya kisah sukses UMKM binaan BSI menembus pasar ekspor.',
      'Twitter menduduki potential impression tertinggi dibanding platform lain, menunjukkan tingginya potensi netizen melihat brand BSI di platform tersebut.',
      'Sementara itu, audience sentiment dalam persepsi publik didominasi sentimen netral, didorong cuitan seputar transaksi dan unggahan yang hanya menyebutkan BSI tanpa konteks lebih lanjut.',
      'BSI perlu secara aktif mendorong narasi strategis yang menonjolkan peran konkret dalam sektor prioritas nasional seperti pembiayaan UMKM hijau, digitalisasi perbankan desa, dan inklusi keuangan syariah.',
      'Perbincangan terkait keluhan didominasi oleh Kendala Mobile Banking dan Kendala QRIS, terutama melalui platform Twitter.',
    ],
  }
}

export const brandPerceptionData: BrandPerceptionData = buatBrandPerceptionData()

// Data mock untuk unit analisis "Monthly Recap Media" pada halaman Isu BSI,
// mengikuti struktur laporan "Monthly News Recap": sebaran jenis media
// (Online/Cetak/TV), tier media, top spokesperson, dan tren pemberitaan
// mingguan.

function bagiRata(total: number, jumlahBagian: number): number[] {
  const bobot = Array.from({ length: jumlahBagian }, () => rand() + 0.3)
  const jumlahBobot = bobot.reduce((a, b) => a + b, 0)
  return bobot.map((b) => Math.max(0, Math.round((b / jumlahBobot) * total)))
}

function buatMonthlyRecap(totalBase: number): MonthlyRecapData {
  const online = Math.round(totalBase * (0.93 + rand() * 0.04))
  const cetak = Math.round(totalBase * (0.03 + rand() * 0.03))
  const tv = Math.max(1, totalBase - online - cetak)

  const tier1 = Math.round(totalBase * (0.1 + rand() * 0.05))
  const tier2 = Math.round(totalBase * (0.08 + rand() * 0.05))
  const tier3 = Math.max(1, totalBase - tier1 - tier2)

  const newsScore = totalBase * randomInt(11, 15)

  const bagianOnline = bagiRata(online, 4)
  const bagianCetak = bagiRata(cetak, 4)
  const bagianTv = bagiRata(tv, 4)

  const trendMingguan = Array.from({ length: 4 }, (_, i) => ({
    minggu: `Minggu ${i + 1}`,
    Online: bagianOnline[i],
    Cetak: bagianCetak[i],
    TV: bagianTv[i],
  }))

  return {
    newsScore,
    sebaranMedia: { online, cetak, tv },
    tierMedia: { tier1, tier2, tier3 },
    topSpokesperson: [
      { jabatan: 'Direktur Utama BSI', statement: randomInt(60, 110) },
      { jabatan: 'Direktur Retail Banking BSI', statement: randomInt(40, 90) },
      { jabatan: 'Corporate Secretary BSI', statement: randomInt(30, 70) },
    ].sort((a, b) => b.statement - a.statement),
    trendMingguan,
  }
}

export const monthlyRecapBSI: MonthlyRecapData = buatMonthlyRecap(240)
