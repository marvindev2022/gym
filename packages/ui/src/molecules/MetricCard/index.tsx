import * as React from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../../atoms/Card'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  variant?: 'default' | 'gold' | 'electric' | 'danger'
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) {
  const isTrendPositive = trend && trend.value >= 0

  return (
    <Card.Root
      className={cn(
        'relative overflow-hidden',
        variant === 'gold' && 'border-tz-gold/30 shadow-tz-gold',
        variant === 'electric' && 'border-tz-electric/20 shadow-tz-electric',
        variant === 'danger' && 'border-tz-error/30',
        className
      )}
    >
      {/* Decoração de fundo */}
      {variant === 'gold' && (
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-tz-gold/5 -translate-y-1/2 translate-x-1/2" />
      )}
      {variant === 'electric' && (
        <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-tz-electric/5 -translate-y-1/2 translate-x-1/2" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="tz-section-title">{title}</span>
          <span
            className={cn(
              'font-mono text-3xl font-bold',
              variant === 'gold' && 'text-tz-gold',
              variant === 'electric' && 'text-tz-electric',
              variant === 'danger' && 'text-tz-error',
              variant === 'default' && 'text-tz-white'
            )}
          >
            {value}
          </span>
          {subtitle && <span className="text-xs text-tz-muted">{subtitle}</span>}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-tz-sm',
              variant === 'gold' && 'bg-tz-gold/10 text-tz-gold',
              variant === 'electric' && 'bg-tz-electric/10 text-tz-electric',
              variant === 'danger' && 'bg-tz-error/10 text-tz-error',
              variant === 'default' && 'bg-tz-surface-2 text-tz-muted'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-xs font-medium',
            isTrendPositive ? 'text-tz-success' : 'text-tz-error'
          )}
        >
          <span>{isTrendPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-tz-muted font-normal">{trend.label}</span>
        </div>
      )}
    </Card.Root>
  )
}
