'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { RotatingSeal, SprayStar } from '@/components/brand-marks'

const HERO_IMAGES = [
  {
    src: '/images/empanadas-tray.png',
    alt: 'Dos empanadas Mala Masa recién horneadas sobre papel de marca',
  },
  {
    src: '/images/empanadas-tray-2.png',
    alt: 'Empanadas Mala Masa recién horneadas listas para servir',
  },
  {
    src: '/images/empanadas-tray-3.png',
    alt: 'Empanadas Mala Masa recién horneadas con relleno abundante',
  },
]

const CAROUSEL_INTERVAL = 10000 // 10 segundos por imagen

/** Vapor sutil que sube desde la base del hero */
function Steam() {
  const puffs = [
    { left: '58%', size: 130, delay: 0, dur: 9 },
    { left: '68%', size: 100, delay: 2.4, dur: 10.5 },
    { left: '78%', size: 150, delay: 4.8, dur: 8.5 },
    { left: '88%', size: 110, delay: 6.6, dur: 11 },
  ]
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[65%] overflow-hidden md:block"
    >
      {puffs.map((p) => (
        <span
          key={p.left}
          className="animate-steam absolute bottom-0 rounded-full blur-2xl"
          style={
            {
              left: p.left,
              width: p.size,
              height: p.size,
              background:
                'radial-gradient(circle, oklch(0.94 0.02 85 / 14%), transparent 68%)',
              '--steam-delay': `${p.delay}s`,
              '--steam-dur': `${p.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function Hero() {
  const [loaded, setLoaded] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // Auto-advance del carrusel
  useEffect(() => {
    if (!loaded) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length)
    }, CAROUSEL_INTERVAL)
    return () => clearInterval(interval)
  }, [loaded])

  // Parallax suave siguiendo el puntero (solo en dispositivos con ratón)
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
        el.style.setProperty('--px', String(-x.toFixed(3)))
        el.style.setProperty('--py', String(-y.toFixed(3)))
      })
    }
    const onLeave = () => {
      el.style.setProperty('--px', '0')
      el.style.setProperty('--py', '0')
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="top"
      className={`relative flex min-h-svh flex-col justify-center overflow-hidden bg-background ${
        loaded ? 'is-in' : ''
      }`}
    >
      {/* Carrusel de fotos de producto como fondo */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              loaded && i === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="hero-parallax absolute -inset-6">
              <div
                className={`absolute inset-0 ${
                  loaded && i === currentImage ? 'animate-hero-drift' : ''
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className={`object-cover object-center transition-all duration-[2200ms] ease-out md:object-[70%_center] ${
                    loaded && i === currentImage ? 'scale-100' : 'scale-[1.12]'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}

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
        {/* Viñeta suave para asentar los bordes */}
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
          <p
            className="rise mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-accent"
            style={{ '--rise-delay': '250ms' } as React.CSSProperties}
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
                carácter
              </span>
            </span>
            <span className="mask-line text-5xl text-primary md:text-7xl lg:text-8xl">
              <span style={{ '--mask-delay': '660ms' } as React.CSSProperties}>
                Buena de sabor.
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
              href="#carta"
              className="btn-shine group relative inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
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
              onClick={() => setCurrentImage(i)}
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

      {/* Indicador de scroll */}
      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity delay-[1200ms] duration-1000 md:flex ${
          loaded ? 'opacity-60' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Baja</span>
        <span className="relative h-8 w-px overflow-hidden bg-foreground/25">
          <span className="animate-scroll-dot absolute left-0 top-0 h-2.5 w-px bg-foreground" />
        </span>
      </div>
    </section>
  )
}
