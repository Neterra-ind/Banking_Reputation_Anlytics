import { cn } from '@/lib/utils'
import type { RiskLevel, Sentimen, Trend, Urgensi } from '@/types'

const sentimenStyle: Record<Sentimen, string> = {
  Positif:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  Netral:
    'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
  Negatif:
    'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400',
}

const riskStyle: Record<RiskLevel, string> = {
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  Medium:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400',
  Critical:
    'bg-red-100 text-red-800 ring-red-600/30 dark:bg-red-500/15 dark:text-red-400',
}

const urgensiStyle: Record<Urgensi, string> = {
  Rendah:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  Sedang:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400',
  Tinggi:
    'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400',
  Kritis:
    'bg-red-100 text-red-800 ring-red-600/30 dark:bg-red-500/15 dark:text-red-400',
}

const trendStyle: Record<Trend, string> = {
  Naik: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  Turun: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400',
  Stabil: 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
}

function BaseBadge({ label, style }: { label: string; style: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        style,
      )}
    >
      {label}
    </span>
  )
}

export function SentimenBadge({ value }: { value: Sentimen }) {
  return <BaseBadge label={value} style={sentimenStyle[value]} />
}

export function RiskBadge({ value }: { value: RiskLevel }) {
  return <BaseBadge label={value} style={riskStyle[value]} />
}

export function UrgensiBadge({ value }: { value: Urgensi }) {
  return <BaseBadge label={value} style={urgensiStyle[value]} />
}

export function TrendBadge({ value }: { value: Trend }) {
  return <BaseBadge label={value} style={trendStyle[value]} />
}
