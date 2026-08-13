import { Info } from 'lucide-react'

/**
 * Ikon info kecil dengan tooltip penjelasan bahasa Indonesia sederhana.
 * Dipakai di sebelah judul KPI/card supaya definisi metrik tidak perlu
 * selalu tampil sebagai teks, tapi tetap mudah diakses (hover/focus).
 */
export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex shrink-0">
      <button
        type="button"
        tabIndex={0}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-slate-400 outline-none hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-brand-navy-300 dark:text-slate-500 dark:hover:text-slate-300"
        aria-label={text}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 w-60 rounded-lg bg-slate-800 px-3 py-2 text-xs font-normal leading-relaxed whitespace-normal text-white opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-700"
      >
        {text}
      </span>
    </span>
  )
}
