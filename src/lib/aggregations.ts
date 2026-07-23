import type { Berita } from '@/types'

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
