import type {
  Alert,
  Berita,
  Isu,
  Kompetitor,
  RiskLevel,
  Sentimen,
  TipeAlert,
  Urgensi,
} from '@/types'
import { semuaIsu, semuaMediaMassa, semuaMediaSosial, subIsuByIsu } from '@/types'

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

const NASABAH_TEMPLATES = [
  (s: string) => `Nasabah Keluhkan Layanan terkait ${s}`,
  (s: string) => `Survei: Tingkat ${s} Nasabah BSI Meningkat`,
  (s: string) => `Viral di Media Sosial, Nasabah Soroti ${s} BSI`,
  (s: string) => `BSI Tanggapi Masukan Nasabah soal ${s}`,
  (s: string) => `Program ${s} BSI Dapat Respons Positif Publik`,
]

const RISIKO_TEMPLATES = [
  (s: string) => `Waspada Modus ${s} Mengatasnamakan BSI`,
  (s: string) => `BSI Perkuat Sistem Mitigasi ${s}`,
  (s: string) => `Otoritas Selidiki Dugaan ${s} di Sektor Perbankan Syariah`,
  (s: string) => `BSI Klarifikasi Isu ${s} yang Beredar di Masyarakat`,
  (s: string) => `Laporan ${s}: BSI Tingkatkan Pengawasan Internal`,
]

const INDUSTRI_TEMPLATES = [
  (s: string) => `Tren ${s} Pengaruhi Kinerja Perbankan Syariah Nasional`,
  (s: string) => `Analis: ${s} Jadi Peluang Baru bagi BSI`,
  (s: string) => `Perkembangan ${s} Dorong Persaingan Industri Perbankan Syariah`,
  (s: string) => `BSI Rilis Pandangan soal Arah ${s} Tahun Ini`,
  (s: string) => `Industri Perbankan Syariah Hadapi Tantangan ${s}`,
]

const TEMPLATES_BY_ISU: Record<Isu, ((s: string) => string)[]> = {
  Kebijakan: KEBIJAKAN_TEMPLATES,
  Bisnis: BISNIS_TEMPLATES,
  Nasabah: NASABAH_TEMPLATES,
  Risiko: RISIKO_TEMPLATES,
  Industri: INDUSTRI_TEMPLATES,
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
  'Bank Jago',
  'SeaBank',
  'Allo Bank',
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
    const jumlah = 44

    for (let i = 0; i < jumlah; i++) {
      const sub = pick(subs)
      const judul = pick(templates)(sub)
      const jenisMedia = pickWeighted<'Media Massa' | 'Media Sosial'>({
        'Media Massa': 0.55,
        'Media Sosial': 0.45,
      })
      const sumber = jenisMedia === 'Media Massa' ? pick(semuaMediaMassa) : pick(semuaMediaSosial)

      const sentimen = pickWeighted<Sentimen>({ Positif: 0.4, Netral: 0.38, Negatif: 0.22 })
      const riskLevel = pickWeighted<RiskLevel>(
        sentimen === 'Negatif'
          ? { Low: 0.15, Medium: 0.35, High: 0.35, Critical: 0.15 }
          : { Low: 0.55, Medium: 0.3, High: 0.12, Critical: 0.03 },
      )
      const urgensi = pickWeighted<Urgensi>(
        riskLevel === 'Critical' || riskLevel === 'High'
          ? { Rendah: 0.05, Sedang: 0.25, Tinggi: 0.45, Kritis: 0.25 }
          : { Rendah: 0.45, Sedang: 0.4, Tinggi: 0.13, Kritis: 0.02 },
      )

      const isViral =
        jenisMedia === 'Media Sosial' && (riskLevel === 'High' || riskLevel === 'Critical') && rand() < 0.4
      const engagement = isViral
        ? randomInt(5000, 45000)
        : jenisMedia === 'Media Sosial'
          ? randomInt(50, 4000)
          : randomInt(20, 1500)

      const tanggal = isoDaysAgo(randomInt(0, 29))

      const kompetitorTerkait =
        (isu === 'Bisnis' || isu === 'Industri') && rand() < 0.18 ? pick(kompetitorNama) : undefined

      list.push({
        id: `BR-${String(counter).padStart(4, '0')}`,
        tanggal,
        judul,
        sumber,
        jenisMedia,
        isu,
        subIsu: sub,
        sentimen,
        riskLevel,
        urgensi,
        engagement,
        isViral,
        dampakBisnis: pick(dampakBisnisPool),
        dampakReputasi: pick(dampakReputasiPool),
        peluangBisnis: pick(peluangBisnisPool),
        stakeholderTerkait: sampleN(stakeholderPool, randomInt(1, 3)),
        unitKerjaTerdampak: sampleN(unitKerjaPool, randomInt(1, 2)),
        ringkasanAI: `Pemberitaan mengenai ${sub.toLowerCase()} pada isu ${isu} dengan sentimen ${sentimen.toLowerCase()} dan tingkat risiko ${riskLevel}. Isu ini perlu ditindaklanjuti oleh unit terkait sesuai rekomendasi AI.`,
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

export const daftarKompetitor: Kompetitor[] = [
  {
    id: 'KP-00',
    nama: 'BSI',
    kategori: 'Bank Syariah',
    shareOfVoice: 32,
    shareOfEngagement: 35,
    sentimentScore: 68,
    topIssue: 'Transformasi Digital BYOND',
    mediaExposure: 480,
    trend: 'Naik',
  },
  {
    id: 'KP-01',
    nama: 'Bank Muamalat Indonesia',
    kategori: 'Bank Syariah',
    shareOfVoice: 14,
    shareOfEngagement: 12,
    sentimentScore: 55,
    topIssue: 'Restrukturisasi Bisnis',
    mediaExposure: 210,
    trend: 'Stabil',
  },
  {
    id: 'KP-02',
    nama: 'BTN Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 9,
    shareOfEngagement: 8,
    sentimentScore: 60,
    topIssue: 'Ekspansi KPR Syariah',
    mediaExposure: 140,
    trend: 'Naik',
  },
  {
    id: 'KP-03',
    nama: 'CIMB Niaga Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 8,
    shareOfEngagement: 7,
    sentimentScore: 58,
    topIssue: 'Produk Pembiayaan UMKM',
    mediaExposure: 130,
    trend: 'Stabil',
  },
  {
    id: 'KP-04',
    nama: 'BCA Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 7,
    shareOfEngagement: 8,
    sentimentScore: 62,
    topIssue: 'Digitalisasi Layanan',
    mediaExposure: 120,
    trend: 'Naik',
  },
  {
    id: 'KP-05',
    nama: 'Bank Mega Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 6,
    shareOfEngagement: 5,
    sentimentScore: 50,
    topIssue: 'Kinerja Keuangan Kuartalan',
    mediaExposure: 95,
    trend: 'Turun',
  },
  {
    id: 'KP-06',
    nama: 'Bank KB Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 4,
    shareOfEngagement: 3,
    sentimentScore: 48,
    topIssue: 'Transformasi Kelembagaan',
    mediaExposure: 60,
    trend: 'Stabil',
  },
  {
    id: 'KP-07',
    nama: 'Bank Aladin Syariah',
    kategori: 'Bank Syariah',
    shareOfVoice: 3,
    shareOfEngagement: 3,
    sentimentScore: 45,
    topIssue: 'Layanan Digital Banking',
    mediaExposure: 45,
    trend: 'Turun',
  },
  {
    id: 'KP-08',
    nama: 'blu by BCA Digital',
    kategori: 'Bank Digital/Fintech',
    shareOfVoice: 6,
    shareOfEngagement: 9,
    sentimentScore: 66,
    topIssue: 'Kampanye Nasabah Baru',
    mediaExposure: 110,
    trend: 'Naik',
  },
  {
    id: 'KP-09',
    nama: 'Bank Jago',
    kategori: 'Bank Digital/Fintech',
    shareOfVoice: 5,
    shareOfEngagement: 7,
    sentimentScore: 64,
    topIssue: 'Kolaborasi Ekosistem Digital',
    mediaExposure: 100,
    trend: 'Naik',
  },
  {
    id: 'KP-10',
    nama: 'SeaBank',
    kategori: 'Bank Digital/Fintech',
    shareOfVoice: 4,
    shareOfEngagement: 2,
    sentimentScore: 58,
    topIssue: 'Bunga Tabungan Kompetitif',
    mediaExposure: 85,
    trend: 'Stabil',
  },
  {
    id: 'KP-11',
    nama: 'Allo Bank',
    kategori: 'Bank Digital/Fintech',
    shareOfVoice: 2,
    shareOfEngagement: 1,
    sentimentScore: 52,
    topIssue: 'Ekspansi Fitur Pembayaran',
    mediaExposure: 40,
    trend: 'Turun',
  },
]

const alertTemplates: { tipe: TipeAlert; isu: Isu; judul: string; deskripsi: string; level: RiskLevel }[] = [
  {
    tipe: 'Lonjakan Sentimen Negatif',
    isu: 'Nasabah',
    judul: 'Lonjakan sentimen negatif terkait keluhan layanan mobile banking',
    deskripsi: 'Volume percakapan negatif naik 3x lipat dalam 6 jam terakhir di media sosial.',
    level: 'High',
  },
  {
    tipe: 'Isu Viral',
    isu: 'Nasabah',
    judul: 'Unggahan keluhan nasabah viral di X dengan lebih dari 20 ribu interaksi',
    deskripsi: 'Thread keluhan nasabah tentang gangguan transaksi menjadi trending topic lokal.',
    level: 'Critical',
  },
  {
    tipe: 'Regulasi Baru',
    isu: 'Kebijakan',
    judul: 'OJK menerbitkan surat edaran baru terkait perlindungan data nasabah',
    deskripsi: 'Aturan baru berpotensi memengaruhi proses onboarding digital BSI.',
    level: 'Medium',
  },
  {
    tipe: 'Gangguan Layanan Digital',
    isu: 'Bisnis',
    judul: 'Laporan gangguan aplikasi BYOND dari sejumlah pengguna',
    deskripsi: 'Beberapa nasabah melaporkan kegagalan transaksi pada aplikasi mobile banking.',
    level: 'High',
  },
  {
    tipe: 'Trending Topic',
    isu: 'Industri',
    judul: 'Nama BSI masuk trending topic X terkait kenaikan BI Rate',
    deskripsi: 'Diskusi publik meningkat seputar dampak kebijakan suku bunga terhadap perbankan syariah.',
    level: 'Low',
  },
  {
    tipe: 'Potensi Krisis',
    isu: 'Risiko',
    judul: 'Indikasi awal isu hoaks penipuan mengatasnamakan BSI',
    deskripsi: 'Ditemukan pesan berantai mencatut nama BSI untuk modus penipuan transfer dana.',
    level: 'Critical',
  },
  {
    tipe: 'Lonjakan Sentimen Negatif',
    isu: 'Risiko',
    judul: 'Sentimen negatif meningkat terkait pemberitaan dugaan fraud',
    deskripsi: 'Beberapa portal berita ekonomi memberitakan dugaan kasus fraud di industri perbankan syariah.',
    level: 'High',
  },
  {
    tipe: 'Regulasi Baru',
    isu: 'Kebijakan',
    judul: 'DSN-MUI merilis fatwa baru terkait produk pembiayaan syariah',
    deskripsi: 'Fatwa baru berpotensi memerlukan penyesuaian pada beberapa produk pembiayaan BSI.',
    level: 'Medium',
  },
  {
    tipe: 'Trending Topic',
    isu: 'Bisnis',
    judul: 'Kampanye promo Umrah BSI ramai dibicarakan di media sosial',
    deskripsi: 'Engagement positif meningkat signifikan terkait promo pembiayaan Umrah.',
    level: 'Low',
  },
  {
    tipe: 'Isu Viral',
    isu: 'Industri',
    judul: 'Perbandingan bunga tabungan bank digital ramai dibahas netizen',
    deskripsi: 'Perbincangan publik membandingkan produk tabungan BSI dengan bank digital kompetitor.',
    level: 'Medium',
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
export const semuaJenisMedia = ['Media Massa', 'Media Sosial'] as const
export const semuaSumber = [...semuaMediaMassa, ...semuaMediaSosial]
