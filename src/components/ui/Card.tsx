import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  info,
  action,
}: {
  title: string
  subtitle?: string
  info?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
          {info && <InfoTooltip text={info} />}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('p-4', className)}>{children}</div>
}
