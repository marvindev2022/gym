import * as React from 'react'
import { cn } from '../../lib/utils'
import { Avatar } from '../../atoms/Avatar'
import { Badge } from '../../atoms/Badge'
import { Card } from '../../atoms/Card'
import type { StudentStatus } from '@treinozap/types'

interface StudentCardProps {
  id: string
  name: string
  goal: string | null
  phone: string
  status: StudentStatus
  lastActivityAt: string | null
  workoutsCount?: number
  onClick?: () => void
  className?: string
}

const statusVariantMap: Record<StudentStatus, 'active' | 'inactive' | 'blocked'> = {
  active: 'active',
  inactive: 'inactive',
  blocked: 'blocked',
}

const statusLabelMap: Record<StudentStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
}

function formatLastActivity(dateStr: string | null): string {
  if (!dateStr) return 'Sem registro'
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem. atrás`
  return `${Math.floor(diffDays / 30)} meses atrás`
}

export function StudentCard({
  name,
  goal,
  phone,
  status,
  lastActivityAt,
  workoutsCount = 0,
  onClick,
  className,
}: StudentCardProps) {
  const rawPhone = phone.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/${rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`}`

  return (
    <Card.Root
      className={cn(
        'cursor-pointer hover:border-tz-gold/40 transition-colors',
        status === 'inactive' && 'border-tz-warning/20',
        status === 'blocked' && 'border-tz-error/20',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-tz-white truncate">{name}</span>
            <Badge variant={statusVariantMap[status]} dot>
              {statusLabelMap[status]}
            </Badge>
          </div>
          {goal && (
            <p className="text-xs text-tz-muted mt-0.5 truncate">{goal}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-2xs text-tz-muted uppercase tracking-wide">Último treino</span>
            <span className="text-xs text-tz-white mt-0.5">{formatLastActivity(lastActivityAt)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xs text-tz-muted uppercase tracking-wide">Treinos</span>
            <span className="font-mono text-xs text-tz-white mt-0.5">{workoutsCount}</span>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-tz-sm bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
          title={`WhatsApp: ${name}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
    </Card.Root>
  )
}
