import { SprayStar } from '@/components/brand-marks'
import { cn } from '@/lib/utils'

const words = [
  'Empanadas argentinas',
  'Obsesión por el detalle',
  'Repulgue de verdad',
  'Cero atajos',
  'Hechas a mano',
  'Horneadas al momento',
]

export function BrandTicker({
  className,
  variant = 'red',
}: {
  className?: string
  variant?: 'red' | 'cream'
}) {
  const row = (
    <>
      {words.map((word) => (
        <span key={word} className="flex items-center gap-6 md:gap-10">
          <span className="whitespace-nowrap text-sm md:text-base font-black uppercase tracking-[0.18em]">
            {word}
          </span>
          <SprayStar className="size-3.5 shrink-0 opacity-80" />
        </span>
      ))}
    </>
  )

  return (
    <div className={cn('overflow-hidden py-2', className)} aria-hidden="true">
      <div
        className={cn(
          'marquee-paused -mx-[2%] w-[104%] overflow-hidden py-3.5 md:py-4',
          variant === 'red'
            ? 'bg-primary text-primary-foreground -rotate-[0.8deg]'
            : 'bg-foreground text-background rotate-[0.8deg]',
        )}
      >
        <div className="flex w-max gap-6 md:gap-10 animate-marquee">
          <div className="flex items-center gap-6 md:gap-10">{row}</div>
          <div className="flex items-center gap-6 md:gap-10">{row}</div>
        </div>
      </div>
    </div>
  )
}
