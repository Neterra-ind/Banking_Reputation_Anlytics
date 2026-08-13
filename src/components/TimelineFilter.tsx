import type { PeriodeValue } from '@/lib/aggregations'

const PRESETS: { value: PeriodeValue['preset']; label: string }[] = [
  { value: '', label: 'Last 30 Days (Default)' },
  { value: '7', label: 'Last 7 Days' },
  { value: '14', label: 'Last 14 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom...' },
]

const selectClass =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-brand-navy-400 focus:ring-2 focus:ring-brand-navy-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'

export function TimelineFilter({
  value,
  onChange,
}: {
  value: PeriodeValue
  onChange: (value: PeriodeValue) => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
        Period
        <select
          value={value.preset}
          onChange={(e) => onChange({ ...value, preset: e.target.value as PeriodeValue['preset'] })}
          className={selectClass}
        >
          {PRESETS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      {value.preset === 'custom' && (
        <>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            From
            <input
              type="date"
              value={value.dari}
              max={value.sampai || undefined}
              onChange={(e) => onChange({ ...value, dari: e.target.value })}
              className={selectClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            To
            <input
              type="date"
              value={value.sampai}
              min={value.dari || undefined}
              onChange={(e) => onChange({ ...value, sampai: e.target.value })}
              className={selectClass}
            />
          </label>
        </>
      )}
    </div>
  )
}
