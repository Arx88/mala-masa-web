'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RotatingSeal, SprayStar } from '@/components/brand-marks'

const HERO_IMAGES = [
  {
    src: '/images/empanadas-tray.webp',
    alt: 'Empanadas argentinas Mala Masa recién horneadas sobre papel de marca, masa madre y repulgue a mano',
  },
  {
    src: '/images/empanadas-tray-2.webp',
    alt: 'Empanadas argentinas artesanas Mala Masa listas para servir, horno de piedra',
  },
  {
    src: '/images/empanadas-tray-3.webp',
    alt: 'Empanadas Mala Masa con relleno abundante, hechas a mano en España',
  },
]

const CAROUSEL_INTERVAL = 7000 // 7 segundos por imagen
const FADE_DUR = 1400 // duración del crossfade de opacidad
const BLUR_DUR = 700 // blur solo durante la primera mitad del crossfade

/** Vapor sutil que sube desde la base del hero — drift horizontal sutil */
function Steam() {
  const puffs = [
    { left: '56%', size: 140, delay: 0,    dur: 9,    drift: 14,  opacity: 0.16 },
    { left: '64%', size: 100, delay: 1.8,  dur: 10.5, drift: -10, opacity: 0.12 },
    { left: '72%', size: 160, delay: 3.6,  dur: 8.5,  drift: 18,  opacity: 0.18 },
    { left: '80%', size: 110, delay: 5.4,  dur: 11,   drift: -14, opacity: 0.13 },
    { left: '88%', size: 130, delay: 7.2,  dur: 9.5,  drift: 8,   opacity: 0.14 },
  ]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[70%] overflow-hidden md:block"
    >
      {puffs.map((p, i) => (
        <span
          key={i}
          className="animate-steam absolute bottom-0 rounded-full blur-2xl"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              background:
                'radial-gradient(circle, oklch(0.94 0.02 85 / 22%), transparent 68%)',
              '--steam-delay': `${p.delay}s`,
              '--steam-dur': `${p.dur}s`,
              '--steam-drift': `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** Pill "hornando ahora" — rediseñado sin punto rojo ping.
 *  Estilo editorial: sello pequeño con un wisp de vapor SVG en vez del
 *  clásico "live dot" que leímos como AI-slop. La hora va entre paréntesis
 *  tipográficos para asimilarla al contenido, no como separador decorativo. */
function LiveBaking() {
  const [status, setStatus] = useState<'open' | 'closed' | 'soon'>('closed')
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const day = now.getDay() // 0 dom ... 6 sáb
      const hour = now.getHours() + now.getMinutes() / 60

      let isOpen = false
      let closingSoon = false

      if (day >= 2 && day <= 4) {
        isOpen = hour >= 12 && hour < 22.5
        closingSoon = isOpen && hour >= 21.5
      } else if (day === 5 || day === 6) {
        isOpen = hour >= 12 && hour < 24
        closingSoon = isOpen && hour >= 23
      } else if (day === 0) {
        isOpen = hour >= 12 && hour < 17
        closingSoon = isOpen && hour >= 16
      }

      setStatus(closingSoon ? 'soon' : isOpen ? 'open' : 'closed')
      setTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    }
    calc()
    const id = setInterval(calc, 30_000)
    return () => clearInterval(id)
  }, [])

  if (status === 'closed') return null

  const label = status === 'soon' ? 'Cerramos pronto' : 'Hornando ahora'

  return (
    <div
      className="rise pointer-events-none mb-6 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/70"
      style={{ '--rise-delay': '180ms' } as React.CSSProperties}
      aria-live="polite"
    >
      {/* Wisp — tres líneas tipo vapor, NO un dot pulsante */}
      <svg
        aria-hidden="true"
        viewBox="0 0 14 16"
        className="size-3.5 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M3 14 C 1 10, 5 8, 3 4" opacity="0.9" />
        <path d="M7 14 C 5 10, 9 8, 7 4" opacity="0.7" />
        <path d="M11 14 C 9 10, 13 8, 11 4" opacity="0.45" />
      </svg>
      <span className="text-foreground/85">{label}</span>
      <span className="text-foreground/30">/</span>
      <span className="tabular-nums text-foreground/55">{time}</span>
    </div>
  )
}

export function Hero() {
  const [loaded, setLoaded] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [prevImage, setPrevImage] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // Auto-advance del carrusel — con flag de transición para acotar el blur
  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => {
      setTransitioning(true)
      setCurrentImage((prev) => {
        setPrevImage(prev)
        return (prev + 1) % HERO_IMAGES.length
      })
      // El blur solo dura BLUR_DUR, no toda la transición de opacidad
      const t = setTimeout(() => setTransitioning(false), BLUR_DUR)
      return () => clearTimeout(t)
    }, CAROUSEL_INTERVAL)
    return () => clearInterval(interval)
  }, [loaded])

  // Parallax 3 capas siguiendo el puntero (solo desktop)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let frame = 0
    const onMove = (e: PointerEvent) => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        // Capa 1: imagen de fondo (movimiento más amplio)
        el.style.setProperty('--px', String(-x.toFixed(3)))
        el.style.setProperty('--py', String(-y.toFixed(3)))
        // Capa 2: backdrop tipográfico (movimiento medio, dirección opuesta)
        if (backdropRef.current) {
          backdropRef.current.style.setProperty('--bx', String((x * 24).toFixed(2)))
          backdropRef.current.style.setProperty('--by', String((y * 14).toFixed(2)))
        }
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
      if (backdropRef.current) {
        backdropRef.current.style.setProperty('--bx', '0')
        backdropRef.current.style.setProperty('--by', '0')
      }
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Magnetic CTA
  const handleCtaMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ctaRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    el.style.transform = `translate(${x * 6}px, ${y * 4}px)`
  }, [])
  const handleCtaLeave = useCallback(() => {
    const el = ctaRef.current
    if (!el) return
    el.style.transform = ''
  }, [])

  return (
    <section
      ref={sectionRef}
      id="top"
      className={`relative flex min-h-svh flex-col justify-center overflow-hidden bg-background ${
        loaded ? 'is-in' : ''
      }`}
    >
      {/* Backdrop tipográfico gigante — "MALA / MASA" repetido en vertical,
          parallax propio, semi-transparente. Da profundidad sin tapar la foto. */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className="hero-backdrop pointer-events-none absolute inset-0 z-0 hidden md:block"
      >
        <div className="hero-backdrop__col hero-backdrop__col--left">
          <span>MALA</span>
          <span>MASA</span>
          <span>MALA</span>
          <span>MASA</span>
        </div>
        <div className="hero-backdrop__col hero-backdrop__col--right">
          <span>2026</span>
          <span>MMXXVI</span>
          <span>MADRID</span>
        </div>
      </div>

      {/* Carrusel de fotos de producto — crossfade con blur ACOTADO a la transición */}
      <div className="absolute inset-0 z-[1]">
        {HERO_IMAGES.map((img, i) => {
          const isCurrent = loaded && i === currentImage
          const isPrev = loaded && i === prevImage && i !== currentImage
          const visible = isCurrent || isPrev
          return (
            <div
              key={img.src}
              className={`absolute inset-0 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] ${
                visible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transitionDuration: `${FADE_DUR}ms`,
                // El blur SOLO aplica a la imagen previa durante el flag de transición.
                // Cuando el flag cae (a los BLUR_DUR ms), la imagen previa vuelve a nítidez
                // y la transición de opacity continúa limpia.
                filter:
                  isPrev && transitioning
                    ? 'blur(14px) saturate(1.05)'
                    : 'blur(0px)',
                transition: `opacity ${FADE_DUR}ms cubic-bezier(0.22,1,0.36,1), filter ${BLUR_DUR}ms ease-out`,
              }}
            >
              <div className="hero-parallax absolute -inset-6">
                <div
                  className={`absolute inset-0 ${
                    isCurrent ? 'animate-hero-drift' : ''
                  }`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className={`object-cover object-center transition-transform ease-out md:object-[70%_center] ${
                      isCurrent ? 'scale-100' : 'scale-[1.10]'
                    }`}
                    style={{ transitionDuration: `${FADE_DUR}ms` }}
                  />
                </div>
              </div>
            </div>
          )
        })}

        {/* Brasa cálida: da profundidad sin ensuciar la foto */}
        <div
          aria-hidden="true"
          className="animate-ember pointer-events-none absolute right-[8%] top-1/2 hidden size-[34rem] -translate-y-1/2 rounded-full blur-3xl md:block"
          style={{
            background:
              'radial-gradient(circle, oklch(0.58 0.21 29 / 18%), transparent 65%)',
          }}
        />

        {/* Veladuras para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/45 to-transparent" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 50% 45%, transparent 45%, oklch(0.13 0.005 60 / 55%) 100%)',
          }}
        />

        <Steam />
      </div>

      {/* Sello giratorio */}
      <div
        className={`absolute right-6 top-24 z-10 hidden transition-all delay-700 duration-1000 md:right-12 md:top-28 lg:block ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <RotatingSeal />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-24 md:px-8 md:pb-24 md:pt-28">
        <div className="max-w-3xl">
          <LiveBaking />

          <p
            className="rise mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-accent"
            style={{ '--rise-delay': '320ms' } as React.CSSProperties}
          >
            <SprayStar className="size-4" />
            Empanadas argentinas · España
          </p>

          <h1 className="font-black uppercase leading-[0.92] tracking-tight">
            <span className="mask-line text-5xl md:text-7xl lg:text-8xl">
              <span style={{ '--mask-delay': '400ms' } as React.CSSProperties}>
                Mala de
              </span>
            </span>
            <span className="mask-line text-5xl md:text-7xl lg:text-8xl">
              <span style={{ '--mask-delay': '520ms' } as React.CSSProperties}>
                carácter,
              </span>
            </span>
            <span className="mask-line text-5xl text-primary md:text-7xl lg:text-8xl">
              <span style={{ '--mask-delay': '660ms' } as React.CSSProperties}>
                buena de sabor.
              </span>
            </span>
          </h1>

          <p
            className="rise mt-6 max-w-md text-pretty text-base leading-relaxed text-foreground/75 md:text-lg"
            style={{ '--rise-delay': '860ms' } as React.CSSProperties}
          >
            Las mejores empanadas de Argentina, ahora en España. Si aún no nos
            probaste, todavía no conoces la auténtica empanada argentina.
          </p>

          <div
            className="rise mt-9 flex flex-wrap items-center gap-4"
            style={{ '--rise-delay': '990ms' } as React.CSSProperties}
          >
            <a
              ref={ctaRef}
              href="#carta"
              onMouseMove={handleCtaMove}
              onMouseLeave={handleCtaLeave}
              className="btn-shine group relative inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 will-change-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <span
                aria-hidden="true"
                className="animate-ember pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary blur-lg"
                style={{ opacity: 0.35 }}
              />
              <span>Ver la carta</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <a
              href="#manifiesto"
              className="link-brush text-sm font-bold uppercase tracking-[0.14em] text-foreground/85 hover:text-foreground transition-colors"
            >
              Quiénes somos
            </a>
          </div>
        </div>
      </div>

      {/* Indicadores del carrusel con anillo de progreso */}
      <div
        className={`absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 transition-opacity delay-[1200ms] duration-1000 md:flex ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {HERO_IMAGES.map((img, i) => {
          const active = i === currentImage
          return (
            <button
              key={img.src}
              type="button"
              onClick={() => {
                setPrevImage(currentImage)
                setTransitioning(true)
                setCurrentImage(i)
                setTimeout(() => setTransitioning(false), BLUR_DUR)
              }}
              className="group relative grid size-6 place-items-center"
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={active}
            >
              <span
                className={`rounded-full transition-all duration-500 ${
                  active
                    ? 'size-1.5 bg-primary'
                    : 'size-1 bg-foreground/35 group-hover:bg-foreground/70'
                }`}
              />
              {active && (
                <svg
                  key={`ring-${currentImage}`}
                  viewBox="0 0 24 24"
                  className="absolute inset-0 size-full -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="animate-dash-ring text-primary"
                    strokeDasharray="62.8"
                    style={
                      { '--ring-dur': `${CAROUSEL_INTERVAL}ms` } as React.CSSProperties
                    }
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Indicador de scroll — con trail sutil */}
      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity delay-[1200ms] duration-1000 md:flex ${
          loaded ? 'opacity-60' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Baja</span>
        <span className="relative h-9 w-px overflow-hidden bg-foreground/20">
          <span className="animate-scroll-dot-trail absolute left-0 top-0 h-1.5 w-px bg-foreground/40" />
          <span className="animate-scroll-dot absolute left-0 top-0 h-2.5 w-px bg-foreground" />
        </span>
      </div>
    </section>
  )
}
