import * as React from 'react'
import { cn } from '../../lib/utils'

function Root({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'tz-card p-5 animate-fade-in',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function Header({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
      {children}
    </div>
  )
}

function Content({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

function Footer({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between mt-4 pt-4 border-t border-tz-border',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const Card = { Root, Header, Content, Footer }
