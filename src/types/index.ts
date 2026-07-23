// Domain types mengikuti PRD "AI Banking Intelligence Dashboard" (Bank Syariah Indonesia)

export type Klaster = 'Kebijakan' | 'Bisnis' | 'Nasabah' | 'Risiko' | 'Industri'

export const semuaKlaster: Klaster[] = [
  'Kebijakan',
  'Bisnis',
  'Nasabah',
  'Risiko',
  'Industri',
]

// Sub-klaster sesuai PRD bagian 6 "Ruang Lingkup" per klaster
export const subKlasterByKlaster: Record<Klaster, string[]> = {
  Kebijakan: [
    'Regulasi OJK',
    'Bank Indonesia',
    'DSN-MUI',
    'PPATK',
    'Kementerian Keuangan',
    'Kementerian Agama',
    'Pajak',
    'Perlindungan Data',
    'ESG',
    'Sustainability',
  ],
  Bisnis: [
    'Tabungan',
    'Pembiayaan',
    'UMKM',
    'KPR',
    'Haji',
    'Umrah',
    'Bullion/Emas',
    'Digital Banking',
    'Mobile Banking',
    'BYOND',
    'API Banking',
    'AI',
    'Kinerja Keuangan',
    'Transformasi Digital',
  ],
  Nasabah: [
    'Kepuasan',
    'Keluhan',
    'Customer Experience',
    'Media Sosial',
    'Viral Issue',
    'CSR',
    'ESG',
    'Brand Image',
  ],
  Risiko: [
    'Fraud',
    'Cyber Security',
    'AML',
    'Kepatuhan',
    'Sengketa',
    'Gugatan',
    'Audit',
    'Krisis Reputasi',
    'Hoaks',
  ],
  Industri: [
    'Industri Perbankan',
    'Perbankan Syariah',
    'Fintech',
    'Ekonomi',
    'BI Rate',
    'Inflasi',
    'Nilai Tukar',
    'Harga Emas',
    'Sukuk',
    'Investasi',
  ],
}

export type JenisMedia = 'Media Massa' | 'Media Sosial'

export const semuaMediaMassa = [
  'Kompas',
  'Detik',
  'CNBC Indonesia',
  'Bisnis.com',
  'Kontan',
  'Republika',
  'Antara News',
  'Tempo',
]

export const semuaMediaSosial = [
  'X',
  'Instagram',
  'Facebook',
  'TikTok',
  'YouTube',
  'LinkedIn',
]

export type Sentimen = 'Positif' | 'Netral' | 'Negatif'

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type Urgensi = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'

export type Trend = 'Naik' | 'Turun' | 'Stabil'

export interface Berita {
  id: string
  tanggal: string
  judul: string
  sumber: string
  jenisMedia: JenisMedia
  klaster: Klaster
  subKlaster: string
  sentimen: Sentimen
  riskLevel: RiskLevel
  urgensi: Urgensi
  engagement: number
  isViral: boolean
  dampakBisnis: string
  dampakReputasi: string
  peluangBisnis: string
  stakeholderTerkait: string[]
  unitKerjaTerdampak: string[]
  ringkasanAI: string
  rekomendasiAI: string[]
  kompetitorTerkait?: string
  url: string
}

export interface TitikTren {
  tanggal: string
  jumlah: number
}

export interface Kompetitor {
  id: string
  nama: string
  kategori: 'Bank Syariah' | 'Bank Digital/Fintech'
  shareOfVoice: number
  shareOfEngagement: number
  sentimentScore: number
  topIssue: string
  mediaExposure: number
  trend: Trend
}

export type TipeAlert =
  | 'Lonjakan Sentimen Negatif'
  | 'Isu Viral'
  | 'Regulasi Baru'
  | 'Gangguan Layanan Digital'
  | 'Trending Topic'
  | 'Potensi Krisis'

export interface Alert {
  id: string
  tanggal: string
  waktu: string
  tipe: TipeAlert
  klaster: Klaster
  judul: string
  deskripsi: string
  level: RiskLevel
}
