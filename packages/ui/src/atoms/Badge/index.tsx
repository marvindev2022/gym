import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        active: 'bg-tz-success/15 text-tz-success',
        inactive: 'bg-tz-warning/15 text-tz-warning',
        blocked: 'bg-tz-error/15 text-tz-error',
        pending: 'bg-blue-500/15 text-blue-400',
        gold: 'bg-tz-gold/15 text-tz-gold',
        muted: 'bg-tz-surface-2 text-tz-muted',
        electric: 'bg-tz-electric/15 text-tz-electric',
      },
    },
    defaultVariants: { variant: 'muted' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-tz-success': variant === 'active',
            'bg-tz-warning': variant === 'inactive',
            'bg-tz-error': variant === 'blocked',
            'bg-blue-400': variant === 'pending',
            'bg-tz-gold': variant === 'gold',
            'bg-tz-muted': variant === 'muted',
            'bg-tz-electric': variant === 'electric',
          })}
        />
      )}
      {children}
    </span>
  )
}
