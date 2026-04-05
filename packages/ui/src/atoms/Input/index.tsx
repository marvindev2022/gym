import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-tz-white">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-tz-muted pointer-events-none">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full min-h-[48px] rounded-tz-sm bg-tz-surface border border-tz-border px-4 py-2 text-sm text-tz-white placeholder:text-tz-muted',
              'transition-colors duration-150',
              'hover:border-tz-gold/50',
              'focus:outline-none focus:border-tz-gold focus:ring-1 focus:ring-tz-gold',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error && 'border-tz-error focus:border-tz-error focus:ring-tz-error',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-tz-muted pointer-events-none">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-xs text-tz-error">{error}</p>}
        {hint && !error && <p className="text-xs text-tz-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
