import * as React from 'react'
import { cn } from '../../lib/utils'
import { Badge } from '../../atoms/Badge'
import { Card } from '../../atoms/Card'

interface WorkoutCardProps {
  id: string
  title: string
  description: string | null
  exercisesCount: number
  isActive: boolean
  publicToken: string
  createdAt: string
  studentName?: string
  onClick?: () => void
  className?: string
}

export function WorkoutCard({
  title,
  description,
  exercisesCount,
  isActive,
  publicToken,
  createdAt,
  studentName,
  onClick,
  className,
}: WorkoutCardProps) {
  const [copied, setCopied] = React.useState(false)

  const publicUrl = `${window.location.origin}/t/${publicToken}`

  async function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    await navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(createdAt))

  return (
    <Card.Root
      className={cn(
        'cursor-pointer hover:border-tz-gold/40 transition-colors',
        !isActive && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      <Card.Header>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-semibold text-tz-white truncate">{title}</span>
          {studentName && (
            <span className="text-xs text-tz-muted">{studentName}</span>
          )}
        </div>
        <Badge variant={isActive ? 'active' : 'muted'} dot>
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      </Card.Header>

      {description && (
        <p className="text-xs text-tz-muted mb-3 line-clamp-2">{description}</p>
      )}

      <Card.Footer>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-2xs text-tz-muted uppercase tracking-wide">Exercícios</span>
            <span className="font-mono text-sm text-tz-white font-semibold mt-0.5">{exercisesCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xs text-tz-muted uppercase tracking-wide">Criado em</span>
            <span className="text-xs text-tz-white mt-0.5">{formattedDate}</span>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          className={cn(
            'flex items-center gap-1.5 rounded-tz-sm px-3 py-2 text-xs font-medium transition-colors',
            copied
              ? 'bg-tz-success/10 text-tz-success'
              : 'bg-tz-surface-2 text-tz-muted hover:text-tz-electric hover:bg-tz-electric/10'
          )}
        >
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copiar link
            </>
          )}
        </button>
      </Card.Footer>
    </Card.Root>
  )
}
