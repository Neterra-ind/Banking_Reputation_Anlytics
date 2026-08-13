import type { Berita, Isu } from '@/types'

export function hitungPerHari(berita: Berita[], hari = 14) {
  const map = new Map<string, number>()
  for (let i = hari - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().slice(0, 10), 0)
  }
  for (const b of berita) {
    if (map.has(b.tanggal)) {
      map.set(b.tanggal, (map.get(b.tanggal) ?? 0) + 1)
    }
  }
  return Array.from(map.entries()).map(([tanggal, jumlah]) => ({
    tanggal: tanggal.slice(5),
    jumlah,
  }))
}

export function bandingkanPerIsu(berita: Berita[], isuList: Isu[]) {
  return isuList.map((isu) => {
    const items = berita.filter((b) => b.isu === isu)
    return {
      isu,
      volume: items.length,
      Positif: items.filter((b) => b.sentimen === 'Positif').length,
      Netral: items.filter((b) => b.sentimen === 'Netral').length,
      Negatif: items.filter((b) => b.sentimen === 'Negatif').length,
      engagement: items.reduce((sum, b) => sum + b.engagement, 0),
    }
  })
}

export function hitungDistribusi<T extends string>(berita: Berita[], key: keyof Berita) {
  const map = new Map<T, number>()
  for (const b of berita) {
    const value = b[key] as unknown as T
    map.set(value, (map.get(value) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function topN<T extends string>(berita: Berita[], key: keyof Berita, n = 5) {
  const counts = hitungDistribusi<T>(berita, key)
  return counts.sort((a, b) => b.value - a.value).slice(0, n)
}

export function topJudul(berita: Berita[], n = 5) {
  return [...berita]
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, n)
}

export function dalamPeriode(tanggal: string, hari: number) {
  const batas = new Date()
  batas.setHours(0, 0, 0, 0)
  batas.setDate(batas.getDate() - (hari - 1))
  return new Date(tanggal) >= batas
}

export interface PeriodeValue {
  preset: '' | '7' | '14' | '30' | 'custom'
  dari: string
  sampai: string
}

export const PERIODE_DEFAULT: PeriodeValue = { preset: '', dari: '', sampai: '' }

export function cocokPeriode(tanggal: string, periode: PeriodeValue): boolean {
  if (periode.preset === 'custom') {
    if (periode.dari && tanggal < periode.dari) return false
    if (periode.sampai && tanggal > periode.sampai) return false
    return true
  }
  // Preset kosong ("Semua Waktu" pada UI) memakai jendela 30 hari terakhir sebagai
  // default, konsisten dengan labelPeriode() dan periodeSebelumnya() di bawah —
  // supaya perbandingan "vs periode sebelumnya" selalu membandingkan rentang yang sama panjang.
  return dalamPeriode(tanggal, Number(periode.preset) || 30)
}

function formatTanggalPendek(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function labelPeriode(periode: PeriodeValue): string {
  if (periode.preset === 'custom') {
    if (periode.dari && periode.sampai) {
      return `${formatTanggalPendek(periode.dari)} – ${formatTanggalPendek(periode.sampai)}`
    }
    if (periode.dari) return `since ${formatTanggalPendek(periode.dari)}`
    if (periode.sampai) return `until ${formatTanggalPendek(periode.sampai)}`
    return 'all time'
  }
  if (!periode.preset) return 'last 30 days'
  return `last ${periode.preset} days`
}

export function hitungTrenRange(berita: Berita[], dari: string, sampai: string) {
  const map = new Map<string, number>()
  const start = new Date(dari)
  const end = new Date(sampai)
  if (start > end) return []
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map.set(d.toISOString().slice(0, 10), 0)
  }
  for (const b of berita) {
    if (map.has(b.tanggal)) {
      map.set(b.tanggal, (map.get(b.tanggal) ?? 0) + 1)
    }
  }
  return Array.from(map.entries()).map(([tanggal, jumlah]) => ({
    tanggal: tanggal.slice(5),
    jumlah,
  }))
}

export function bucketTanggal(hari: number): string[] {
  const out: string[] = []
  for (let i = hari - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export function bucketRange(dari: string, sampai: string): string[] {
  const out: string[] = []
  const start = new Date(dari)
  const end = new Date(sampai)
  if (start > end) return out
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

export function hitungTrenPerIsu(berita: Berita[], isuList: Isu[], periode: PeriodeValue) {
  const buckets =
    periode.preset === 'custom' && periode.dari && periode.sampai
      ? bucketRange(periode.dari, periode.sampai)
      : bucketTanggal(periode.preset && periode.preset !== 'custom' ? Number(periode.preset) : 30)

  const rows = buckets.map((tanggal) => {
    const row: Record<string, string | number> = { tanggal: tanggal.slice(5) }
    for (const isu of isuList) row[isu] = 0
    return row
  })
  const indexByDate = new Map(buckets.map((t, i) => [t, i]))
  for (const b of berita) {
    const idx = indexByDate.get(b.tanggal)
    if (idx !== undefined) {
      rows[idx][b.isu] = (rows[idx][b.isu] as number) + 1
    }
  }
  return rows
}

// --- Reputation analysis (BSI sebagai satu entitas, bukan perbandingan isu) ---

/** Rentang periode sebelumnya dengan panjang yang sama, dipakai untuk indikator perubahan. */
export function periodeSebelumnya(periode: PeriodeValue): { dari: string; sampai: string } {
  if (periode.preset === 'custom' && periode.dari && periode.sampai) {
    const start = new Date(periode.dari)
    const end = new Date(periode.sampai)
    const hari = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
    const sampai = new Date(start)
    sampai.setDate(sampai.getDate() - 1)
    const dari = new Date(sampai)
    dari.setDate(dari.getDate() - (hari - 1))
    return { dari: dari.toISOString().slice(0, 10), sampai: sampai.toISOString().slice(0, 10) }
  }
  const hari = periode.preset && periode.preset !== 'custom' ? Number(periode.preset) : 30
  const sampai = new Date()
  sampai.setDate(sampai.getDate() - hari)
  const dari = new Date(sampai)
  dari.setDate(dari.getDate() - (hari - 1))
  return { dari: dari.toISOString().slice(0, 10), sampai: sampai.toISOString().slice(0, 10) }
}

export function dalamRentang(tanggal: string, dari: string, sampai: string) {
  return tanggal >= dari && tanggal <= sampai
}

/** Persentase perubahan current vs previous. null berarti "baru" (previous = 0). */
export function hitungPerubahanPersen(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return Math.round(((current - previous) / previous) * 100)
}

/** Tren harian eksposur media (online) vs percakapan sosial, BSI sebagai satu entitas. */
export function hitungTrenEksposur(berita: Berita[], periode: PeriodeValue) {
  const buckets =
    periode.preset === 'custom' && periode.dari && periode.sampai
      ? bucketRange(periode.dari, periode.sampai)
      : bucketTanggal(periode.preset && periode.preset !== 'custom' ? Number(periode.preset) : 30)

  const rows = buckets.map((tanggal) => ({
    tanggal: tanggal.slice(5),
    mediaExposure: 0,
    socialConversation: 0,
  }))
  const indexByDate = new Map(buckets.map((t, i) => [t, i]))
  for (const b of berita) {
    const idx = indexByDate.get(b.tanggal)
    if (idx === undefined) continue
    if (b.jenisMedia === 'Media Online') rows[idx].mediaExposure++
    else rows[idx].socialConversation++
  }
  return rows
}

/** Tandai titik spike (lonjakan) / drop (penurunan tajam) berbasis deviasi dari rata-rata. */
export function tandaiAnomali<T extends { tanggal: string }>(
  rows: T[],
  nilai: (row: T) => number,
): { tanggal: string; tipe: 'spike' | 'drop'; nilai: number }[] {
  const nilaiList = rows.map(nilai)
  const rata = nilaiList.reduce((s, v) => s + v, 0) / (nilaiList.length || 1)
  const variansi = nilaiList.reduce((s, v) => s + (v - rata) ** 2, 0) / (nilaiList.length || 1)
  const stdDev = Math.sqrt(variansi)
  if (stdDev === 0) return []
  const hasil: { tanggal: string; tipe: 'spike' | 'drop'; nilai: number }[] = []
  rows.forEach((row, i) => {
    const v = nilaiList[i]
    if (v > rata + stdDev) hasil.push({ tanggal: row.tanggal, tipe: 'spike', nilai: v })
    else if (rata > 1 && v < rata - stdDev && v >= 0) hasil.push({ tanggal: row.tanggal, tipe: 'drop', nilai: v })
  })
  return hasil
}

export type MomentumStatus = 'Emerging' | 'Rising' | 'Declining' | 'Stable'
export type RiskKategori = 'High Risk' | 'Emerging Risk' | 'Monitor' | 'Positive Opportunity'

export interface ReputationIssue {
  subIsu: string
  exposure: number
  positif: number
  netral: number
  negatif: number
  negatifPct: number
  engagement: number
  momentumPct: number | null
  trend: 'Naik' | 'Turun' | 'Stabil'
  momentumStatus: MomentumStatus
  riskScore: number
  riskKategori: RiskKategori
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/**
 * Mesin analisis reputasi per sub-isu: menggabungkan volume, sentimen, engagement,
 * dan momentum (vs periode sebelumnya) menjadi satu skor risiko ternormalisasi.
 * Dipakai bersama oleh Top Reputation Issues, Reputation Drivers, dan Issue Momentum
 * supaya ketiganya konsisten satu sama lain.
 */
export function hitungReputationIssues(current: Berita[], previous: Berita[]): ReputationIssue[] {
  const volumeSebelumnya = new Map<string, number>()
  for (const b of previous) volumeSebelumnya.set(b.subIsu, (volumeSebelumnya.get(b.subIsu) ?? 0) + 1)

  const grup = new Map<string, Berita[]>()
  for (const b of current) {
    if (!grup.has(b.subIsu)) grup.set(b.subIsu, [])
    grup.get(b.subIsu)!.push(b)
  }

  const draft = Array.from(grup.entries()).map(([subIsu, items]) => {
    const exposure = items.length
    const positif = items.filter((b) => b.sentimen === 'Positif').length
    const netral = items.filter((b) => b.sentimen === 'Netral').length
    const negatif = items.filter((b) => b.sentimen === 'Negatif').length
    const negatifPct = exposure === 0 ? 0 : negatif / exposure
    const engagement = items.reduce((s, b) => s + b.engagement, 0)
    const volumeLalu = volumeSebelumnya.get(subIsu) ?? 0
    const momentumPct = hitungPerubahanPersen(exposure, volumeLalu)

    const momentumStatus: MomentumStatus =
      volumeLalu === 0 ? 'Emerging' : momentumPct !== null && momentumPct >= 20 ? 'Rising' : momentumPct !== null && momentumPct <= -20 ? 'Declining' : 'Stable'
    const trend: 'Naik' | 'Turun' | 'Stabil' =
      momentumStatus === 'Emerging' || momentumStatus === 'Rising' ? 'Naik' : momentumStatus === 'Declining' ? 'Turun' : 'Stabil'

    const momentumFactor = momentumPct === null ? 1.5 : clamp(1 + momentumPct / 100, 0.5, 2)
    const riskRaw = exposure * negatifPct * engagement * momentumFactor

    return { subIsu, exposure, positif, netral, negatif, negatifPct, engagement, momentumPct, trend, momentumStatus, riskRaw }
  })

  const maxRisk = Math.max(1, ...draft.map((d) => d.riskRaw))

  return draft
    .map((d): ReputationIssue => {
      const riskScore = d.riskRaw / maxRisk
      const positifPct = d.exposure === 0 ? 0 : d.positif / d.exposure
      let riskKategori: RiskKategori
      if (d.negatifPct <= 0.15 && positifPct >= 0.5) riskKategori = 'Positive Opportunity'
      else if (riskScore >= 0.6) riskKategori = 'High Risk'
      else if (riskScore >= 0.35) riskKategori = 'Emerging Risk'
      else riskKategori = 'Monitor'

      return {
        subIsu: d.subIsu,
        exposure: d.exposure,
        positif: d.positif,
        netral: d.netral,
        negatif: d.negatif,
        negatifPct: Math.round(d.negatifPct * 100),
        engagement: d.engagement,
        momentumPct: d.momentumPct,
        trend: d.trend,
        momentumStatus: d.momentumStatus,
        riskScore,
        riskKategori,
      }
    })
    .sort((a, b) => b.exposure - a.exposure)
}
