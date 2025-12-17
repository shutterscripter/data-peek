'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KPIWidgetConfig } from '@shared/index'

interface WidgetKPIProps {
  config: KPIWidgetConfig
  data: Record<string, unknown>[]
}

function formatKPIValue(
  value: unknown,
  format: KPIWidgetConfig['format'],
  prefix?: string,
  suffix?: string
): string {
  if (value === null || value === undefined) return 'N/A'

  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)

  if (isNaN(numValue)) return String(value)

  let formatted: string

  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numValue)
      break

    case 'percent':
      formatted = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(numValue / 100)
      break

    case 'duration':
      if (numValue < 60) {
        formatted = `${numValue.toFixed(1)}s`
      } else if (numValue < 3600) {
        formatted = `${(numValue / 60).toFixed(1)}m`
      } else {
        formatted = `${(numValue / 3600).toFixed(1)}h`
      }
      break

    case 'number':
    default:
      if (Math.abs(numValue) >= 1000000) {
        formatted = new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: 1
        }).format(numValue)
      } else {
        formatted = new Intl.NumberFormat('en-US', {
          maximumFractionDigits: 2
        }).format(numValue)
      }
  }

  if (prefix && format !== 'currency') {
    formatted = prefix + formatted
  }
  if (suffix && format !== 'percent') {
    formatted = formatted + suffix
  }

  return formatted
}

function TrendIcon({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  switch (direction) {
    case 'up':
      return <TrendingUp className="size-4" />
    case 'down':
      return <TrendingDown className="size-4" />
    default:
      return <Minus className="size-4" />
  }
}

function getTrendColorClass(
  direction: 'up' | 'down' | 'neutral',
  trendType?: 'up-good' | 'down-good'
): string {
  const upIsGood = trendType !== 'down-good'

  if (direction === 'neutral') return 'text-muted-foreground'
  if (direction === 'up') return upIsGood ? 'text-green-500' : 'text-red-500'
  return upIsGood ? 'text-red-500' : 'text-green-500'
}

export function WidgetKPI({ config, data }: WidgetKPIProps) {
  const { format, label, valueKey, trendKey, trendType, prefix, suffix } = config

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  const currentRow = data[0]
  const value = currentRow[valueKey]
  const formattedValue = formatKPIValue(value, format, prefix, suffix)

  let trend: { direction: 'up' | 'down' | 'neutral'; value: string } | null = null
  if (trendKey && data.length >= 2) {
    const currentVal = Number(currentRow[trendKey]) || 0
    const previousRow = data[1]
    const previousVal = Number(previousRow[trendKey]) || 0

    if (previousVal !== 0) {
      const percentChange = ((currentVal - previousVal) / Math.abs(previousVal)) * 100
      const direction = percentChange > 0.5 ? 'up' : percentChange < -0.5 ? 'down' : 'neutral'
      trend = {
        direction,
        value: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`
      }
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-2">
      <p className="text-xs text-muted-foreground font-medium mb-1 text-center">{label}</p>
      <div className="text-3xl font-bold tracking-tight text-center">{formattedValue}</div>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 mt-2',
            getTrendColorClass(trend.direction, trendType)
          )}
        >
          <TrendIcon direction={trend.direction} />
          <span className="text-xs font-medium">{trend.value}</span>
        </div>
      )}
    </div>
  )
}
