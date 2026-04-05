import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  // Base: 48px min height (Fitts' Law), transições suaves, focus acessível
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 font-semibold text-sm rounded-tz transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tz-gold focus-visible:ring-offset-2 focus-visible:ring-offset-tz-bg active:scale-[0.97]',
  {
    variants: {
      variant: {
        // Electric — CTA principal (contraste máximo no dark)
        primary: 'bg-tz-electric text-tz-bg hover:bg-tz-electric-dark shadow-tz-electric font-bold',
        // Gold — ações secundárias importantes
        gold: 'bg-tz-gold text-tz-bg hover:bg-tz-gold-light shadow-tz-gold',
        // Outline — ações terciárias
        outline: 'border border-tz-border text-tz-white hover:border-tz-gold hover:text-tz-gold bg-transparent',
        // Ghost — botões de navegação/ícones
        ghost: 'text-tz-muted hover:text-tz-white hover:bg-tz-surface-2 bg-transparent',
        // Danger — ações destrutivas
        danger: 'bg-tz-error text-tz-white hover:bg-red-400',
      },
      size: {
        sm: 'min-h-[36px] px-4 text-xs',
        md: 'min-h-[48px] px-5 text-sm',
        lg: 'min-h-[56px] px-8 text-base',
        icon: 'min-h-[48px] w-[48px] px-0',
        'icon-sm': 'min-h-[36px] w-[36px] px-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  className,
  variant,
  size,
  fullWidth,
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
