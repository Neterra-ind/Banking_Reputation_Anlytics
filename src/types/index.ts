// Domain types mengikuti PRD "Banking Reputational Analytics" (Bank Syariah Indonesia)

export type Isu = 'Perbankan' | 'BSI'

export const semuaIsu: Isu[] = [
  'Perbankan',
  'BSI',
]

// Label tampilan bahasa Inggris untuk nilai Isu, dipakai di UI (dropdown, tabel,
// tab) tanpa mengubah nilai internal supaya route "/isu/Perbankan" tetap stabil.
export const ISU_LABEL: Record<Isu, string> = {
  Perbankan: 'Banking',
  BSI: 'BSI',
}

// Sub-isu sesuai PRD bagian 6 "Ruang Lingkup" per isu
export const subIsuByIsu: Record<Isu, string[]> = {
  Perbankan: [
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
  BSI: [
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
}

export type JenisMedia = 'Media Online' | 'Media Sosial'

export const MEDIA_LABEL: Record<JenisMedia, string> = {
  'Media Online': 'Online Media',
  'Media Sosial': 'Social Media',
}

export const semuaMediaOnline = [
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

export const SENTIMEN_LABEL: Record<Sentimen, string> = {
  Positif: 'Positive',
  Netral: 'Neutral',
  Negatif: 'Negative',
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export type Urgensi = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'

export const URGENSI_LABEL: Record<Urgensi, string> = {
  Rendah: 'Low',
  Sedang: 'Medium',
  Tinggi: 'High',
  Kritis: 'Critical',
}

export type Trend = 'Naik' | 'Turun' | 'Stabil'

export interface Berita {
  id: string
  tanggal: string
  judul: string
  sumber: string
  jenisMedia: JenisMedia
  isu: Isu
  subIsu: string
  sentimen: Sentimen
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

export interface ProdukEksposur {
  produk: string
  eksposur: number
}

export interface Kompetitor {
  id: string
  nama: string
  kategori: 'Sharia Bank' | 'Digital Bank/Fintech'
  sentimentScore: number
  topIssue: string
  trend: Trend
  mediaExposureOnline: number
  mediaExposureSosial: number
  engagementOnline: number
  engagementSosial: number
  produkEksposur: ProdukEksposur[]
  trenHarian: TitikTren[]
}

export type TipeAlert =
  | 'Lonjakan Sentimen Negatif'
  | 'Isu Viral'
  | 'Regulasi Baru'
  | 'Gangguan Layanan Digital'
  | 'Trending Topic'
  | 'Potensi Krisis'

export const TIPE_ALERT_LABEL: Record<TipeAlert, string> = {
  'Lonjakan Sentimen Negatif': 'Negative Sentiment Spike',
  'Isu Viral': 'Viral Issue',
  'Regulasi Baru': 'New Regulation',
  'Gangguan Layanan Digital': 'Digital Service Disruption',
  'Trending Topic': 'Trending Topic',
  'Potensi Krisis': 'Potential Crisis',
}

export interface Alert {
  id: string
  tanggal: string
  waktu: string
  tipe: TipeAlert
  isu: Isu
  jenisMedia: JenisMedia
  judul: string
  deskripsi: string
  level: RiskLevel
}

// Domain untuk halaman Brand Perception, mengikuti unit analisis pada laporan
// "Brand Perception Analysis" (Media Perception, Product Analysis, Impression &
// Engagement, Public Perception, Complain Mapping).

export type PlatformBP = 'Twitter' | 'Instagram' | 'Facebook' | 'YouTube' | 'TikTok'

export const semuaPlatformBP: PlatformBP[] = ['Twitter', 'Instagram', 'Facebook', 'YouTube', 'TikTok']

export interface SentimenHarianBP {
  tanggal: string
  Positif: number
  Netral: number
  Negatif: number
}

export interface TopikVolume {
  topik: string
  jumlah: number
}

export interface PlatformMetrik {
  platform: PlatformBP
  impression: number
  engagement: number
}

export interface EngagementHarianBP {
  tanggal: string
  allPlatform: number
}

export interface KeluhanPlatform {
  jenis: string
  Twitter: number
  Instagram: number
  Facebook: number
  YouTube: number
  TikTok: number
}

export interface BrandPerceptionData {
  mediaSentimenHarian: SentimenHarianBP[]
  mediaSentimenTotal: { Positif: number; Netral: number; Negatif: number; Sensitif: number }
  audienceSentimenHarian: SentimenHarianBP[]
  audienceSentimenTotal: { Positif: number; Netral: number; Negatif: number }
  topikMediaMassa: TopikVolume[]
  topikMediaSosial: TopikVolume[]
  platformMetrik: PlatformMetrik[]
  engagementHarian: EngagementHarianBP[]
  keluhanPerPlatform: TopikVolume[]
  jenisKeluhan: KeluhanPlatform[]
  highlightPositif: string
  highlightNegatif: string
  ringkasan: string[]
}

// Domain untuk unit analisis "Monthly Recap Media" pada halaman Isu Perbankan dan
// Isu BSI, mengikuti struktur laporan "Monthly News Recap": sebaran jenis media,
// tier media, top spokesperson, dan tren pemberitaan mingguan.

export interface SebaranMedia {
  online: number
  cetak: number
  tv: number
}

export interface TierMedia {
  tier1: number
  tier2: number
  tier3: number
}

export interface Spokesperson {
  jabatan: string
  statement: number
}

export interface TrendMingguan {
  minggu: string
  Online: number
  Cetak: number
  TV: number
}

export interface MonthlyRecapData {
  newsScore: number
  sebaranMedia: SebaranMedia
  tierMedia: TierMedia
  topSpokesperson: Spokesperson[]
  trendMingguan: TrendMingguan[]
}
