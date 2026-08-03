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
  if (!periode.preset) return true
  return dalamPeriode(tanggal, Number(periode.preset))
}

function formatTanggalPendek(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function labelPeriode(periode: PeriodeValue): string {
  if (periode.preset === 'custom') {
    if (periode.dari && periode.sampai) {
      return `${formatTanggalPendek(periode.dari)} – ${formatTanggalPendek(periode.sampai)}`
    }
    if (periode.dari) return `sejak ${formatTanggalPendek(periode.dari)}`
    if (periode.sampai) return `sampai ${formatTanggalPendek(periode.sampai)}`
    return 'semua waktu'
  }
  if (!periode.preset) return '30 hari terakhir'
  return `${periode.preset} hari terakhir`
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

function bucketTanggal(hari: number): string[] {
  const out: string[] = []
  for (let i = hari - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function bucketRange(dari: string, sampai: string): string[] {
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
