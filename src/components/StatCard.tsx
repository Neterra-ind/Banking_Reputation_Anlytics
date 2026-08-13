import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

/** Indikator perubahan vs periode sebelumnya. goodDirection menentukan arah yang dianggap positif. */
export function TrendDelta({
  change,
  goodDirection = 'up',
  className,
}: {
  change: number | null
  goodDirection?: 'up' | 'down'
  className?: string
}) {
  if (change === null) {
    return <span className={cn('text-xs font-medium text-slate-400', className)}>New</span>
  }
  if (Math.abs(change) < 3) {
    return <span className={cn('text-xs font-medium text-slate-400', className)}>→ Stable</span>
  }
  const naik = change > 0
  const bagus = goodDirection === 'up' ? naik : !naik
  return (
    <span
      className={cn(
        'text-xs font-medium',
        bagus ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
        className,
      )}
    >
      {naik ? '↑' : '↓'} {Math.abs(change)}%
    </span>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  change,
  goodDirection = 'up',
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'default' | 'positive' | 'negative' | 'warning'
  change?: number | null
  goodDirection?: 'up' | 'down'
}) {
  const toneStyle = {
    default: 'bg-brand-powder-100 text-brand-navy-600 dark:bg-slate-800 dark:text-brand-powder',
    positive:
      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    negative: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    warning:
      'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }[tone]

  return (
    <Card className="flex items-center gap-4 p-4">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', toneStyle)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
          {change !== undefined && <TrendDelta change={change} goodDirection={goodDirection} />}
        </div>
      </div>
    </Card>
  )
}
