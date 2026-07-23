export function FilterSelect({
  label,
  value,
  options,
  onChange,
  labelMap,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  labelMap?: Record<string, string>
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <option value="">Semua</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </label>
  )
}
