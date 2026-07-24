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
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 h-16 md:h-20">
        <a href="#top" className="shrink-0" aria-label="Mala Masa — inicio">
          <Image
            src="/images/logo-script-white.png"
            alt="Mala Masa"
            width={140}
            height={78}
            className="h-9 md:h-11 w-auto"
            priority
          />
        </a>

        <nav className="hidden md:flex items-center gap-8" aria-label="Principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-brush text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.label}
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
