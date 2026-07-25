'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'span' | 'article' | 'h2' | 'p'
  /**
   * `fade`  → desplazamiento suave clásico (.reveal)
   * `group` → sólo añade `is-in`, para orquestar hijos con .mask-line / .rise
   */
  variant?: 'fade' | 'group'
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
  variant = 'fade',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible', 'is-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(variant === 'fade' && 'reveal', className)}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}

/** Título que se revela línea por línea con máscara */
export function MaskedHeading({
  lines,
  className,
  lineClassName,
  baseDelay = 0,
  step = 120,
}: {
  lines: React.ReactNode[]
  className?: string
  lineClassName?: string | ((i: number) => string)
  baseDelay?: number
  step?: number
}) {
  return (
    <Reveal as="h2" variant="group" className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn(
            'mask-line',
            typeof lineClassName === 'function' ? lineClassName(i) : lineClassName,
          )}
        >
          <span
            style={
              { '--mask-delay': `${baseDelay + i * step}ms` } as React.CSSProperties
            }
          >
            {line}
          </span>
        </span>
      ))}
    </Reveal>
  )
}
