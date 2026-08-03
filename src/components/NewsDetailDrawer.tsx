import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { SentimenBadge, UrgensiBadge } from '@/components/ui/Badge'
import type { Berita } from '@/types'

export function NewsDetailDrawer({
  berita,
  onClose,
}: {
  berita: Berita | null
  onClose: () => void
}) {
  if (!berita) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-teal-600 dark:text-teal-400">
              AI Insight · {berita.isu} / {berita.subIsu}
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              {berita.judul}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {berita.sumber} · {berita.jenisMedia} · {berita.tanggal}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            <SentimenBadge value={berita.sentimen} />
            <UrgensiBadge value={berita.urgensi} />
            {berita.isViral && (
              <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-2.5 py-0.5 text-xs font-medium text-fuchsia-700 ring-1 ring-inset ring-fuchsia-600/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-400">
                Viral
              </span>
            )}
          </div>

          <Section title="Ringkasan Otomatis">
            <p className="text-sm text-slate-600 dark:text-slate-300">{berita.ringkasanAI}</p>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Section title="Dampak Bisnis">
              <p className="text-sm text-slate-600 dark:text-slate-300">{berita.dampakBisnis}</p>
            </Section>
            <Section title="Dampak Reputasi">
              <p className="text-sm text-slate-600 dark:text-slate-300">{berita.dampakReputasi}</p>
            </Section>
          </div>

          <Section title="Peluang Bisnis">
            <p className="text-sm text-slate-600 dark:text-slate-300">{berita.peluangBisnis}</p>
          </Section>

          <Section title="Stakeholder Terkait">
            <div className="flex flex-wrap gap-1.5">
              {berita.stakeholderTerkait.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Unit Kerja Terdampak">
            <div className="flex flex-wrap gap-1.5">
              {berita.unitKerjaTerdampak.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-teal-50 px-2 py-0.5 text-xs text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>

          {berita.kompetitorTerkait && (
            <Section title="Kompetitor Terkait">
              <p className="text-sm text-slate-600 dark:text-slate-300">{berita.kompetitorTerkait}</p>
            </Section>
          )}

          <Section title="Rekomendasi Tindak Lanjut">
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {berita.rekomendasiAI.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {title}
      </h4>
      {children}
    </div>
  )
}
