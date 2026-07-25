'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Horario = {
  dias: string
  horas: string
  /** Días de la semana que cubre la fila (0 = domingo) */
  days: number[]
}

export function HorariosList({ horarios }: { horarios: Horario[] }) {
  // Se calcula en el cliente para no romper la hidratación
  const [today, setToday] = useState<number | null>(null)

  useEffect(() => {
    setToday(new Date().getDay())
  }, [])

  return (
    <dl className="flex flex-col divide-y divide-border border-y border-border">
      {horarios.map((h) => {
        const isToday = today !== null && h.days.includes(today)
        return (
          <div
            key={h.dias}
            className={cn(
              'group flex items-center justify-between gap-4 py-3.5 transition-all duration-300 hover:pl-2',
              isToday && 'pl-2',
            )}
          >
            <dt
              className={cn(
                'flex items-center gap-2.5 text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-300 group-hover:text-accent',
                isToday && 'text-accent',
              )}
            >
              {isToday && (
                <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
              )}
              {h.dias}
              {isToday && <span className="sr-only">(hoy)</span>}
            </dt>
            <dd
              className={cn(
                'text-sm tabular-nums text-muted-foreground transition-colors duration-300 group-hover:text-foreground',
                isToday && 'text-foreground',
              )}
            >
              {h.horas}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
