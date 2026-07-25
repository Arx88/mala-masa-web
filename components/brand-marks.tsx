import { cn } from '@/lib/utils'

/** Asterisco spray — la estrella de la marca */
export function SprayStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('size-4', className)}
    >
      <path
        d="M12 2v20M4 6l16 12M20 6L4 18"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Nivel de picante con chiles */
export function SpiceLevel({ level, className }: { level: 0 | 1 | 2 | 3; className?: string }) {
  if (level === 0) return null
  const labels = ['', 'Suave', 'Con chispa', 'Pica de verdad']
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`Nivel de picante: ${labels[level]}`}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full transition-colors',
            i < level ? 'bg-primary' : 'bg-foreground/15',
          )}
        />
      ))}
    </span>
  )
}

/** Sello circular giratorio con texto */
export function RotatingSeal({ className }: { className?: string }) {
  // Texto pedido por el usuario: "MALA MASA EMPANADAS ARG"
  // El círculo tiene radio 38 → circunferencia ≈ 238.76 unidades SVG.
  // Con fuente 9.5px y tracking calculado para que 23 chars llenen el círculo:
  // 238.76 / 23 chars ≈ 10.38px por char → tracking ≈ 0.09em.
  const text = 'MALA MASA EMPANADAS ARG'
  return (
    <div className={cn('relative size-24 md:size-28', className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="size-full animate-spin-slow">
        <defs>
          <path id="seal-circle" d="M 50 50 m -38 0 a 38 38 0 1 1 76 0 a 38 38 0 1 1 -76 0" />
        </defs>
        <text className="fill-foreground/70 text-[9.5px] font-bold uppercase tracking-[0.09em]">
          <textPath href="#seal-circle">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <SprayStar className="size-5 text-accent" />
      </div>
    </div>
  )
}
