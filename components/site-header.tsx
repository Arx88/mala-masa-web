'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/components/cart-context'
import { ScrollProgress } from '@/components/scroll-progress'
import { cn } from '@/lib/utils'

const links = [
  { href: '#carta', label: 'La Carta' },
  { href: '#manifiesto', label: 'Manifiesto' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#merch', label: 'Merch' },
  { href: '#donde', label: 'Dónde' },
]

export function SiteHeader() {
  const { count, open } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [popping, setPopping] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const prevCount = useRef(count)

  // Pop del contador cuando se añade algo al pedido
  useEffect(() => {
    if (count > prevCount.current) {
      setPopping(true)
      const t = setTimeout(() => setPopping(false), 500)
      prevCount.current = count
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Resalta el enlace de la sección que se está viendo
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => Boolean(el))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(`#${visible.target.id}`)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    )
    for (const s of sections) observer.observe(s)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <ScrollProgress />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 h-20 md:h-24">
        <a href="#top" className="shrink-0" aria-label="Mala Masa — inicio">
          <Image
            src="/images/logo-script-white.webp"
            alt="Mala Masa"
            width={200}
            height={91}
            className="h-12 md:h-16 w-auto"
            priority
          />
        </a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={active === link.href ? 'true' : undefined}
              className={cn(
                'link-brush relative text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors',
                active === link.href
                  ? 'text-foreground'
                  : 'text-foreground/70 hover:text-foreground',
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -left-3 top-1/2 size-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500',
                  active === link.href ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={open}
            className="group relative flex items-center gap-2.5 rounded-full border border-foreground/20 bg-foreground/5 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <span>Pedido</span>
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full text-[11px] font-black tabular-nums transition-colors duration-300',
                popping && 'animate-badge-pop',
                count > 0
                  ? 'bg-primary text-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary'
                  : 'bg-foreground/15 text-foreground group-hover:bg-primary-foreground/20 group-hover:text-primary-foreground',
              )}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            className="md:hidden flex flex-col justify-center gap-1.5 p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span
              className={cn(
                'block h-0.5 w-6 bg-foreground transition-transform duration-300',
                menuOpen && 'translate-y-2 rotate-45',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-6 bg-foreground transition-opacity duration-300',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'block h-0.5 w-6 bg-foreground transition-transform duration-300',
                menuOpen && '-translate-y-2 -rotate-45',
              )}
            />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        className={cn(
          'md:hidden overflow-hidden bg-background/95 backdrop-blur-md transition-all duration-400',
          menuOpen ? 'max-h-80 border-b border-border' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Principal móvil">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="py-2.5 text-lg font-bold uppercase tracking-wide text-foreground/90 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
