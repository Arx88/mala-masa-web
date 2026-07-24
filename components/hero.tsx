'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { RotatingSeal, SprayStar } from '@/components/brand-marks'

export function Hero() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-background"
    >
      {/* Foto de producto como fondo, anclada a la derecha */}
      <div className="absolute inset-0">
        <Image
          src="/images/empanadas-tray.png"
          alt="Dos empanadas Mala Masa recién horneadas sobre papel de marca"
          fill
          priority
          sizes="100vw"
          className={`object-cover object-center transition-all duration-[1600ms] ease-out md:object-[70%_center] ${
            loaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
          }`}
        />
        {/* Veladuras para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
      </div>

      {/* Sello giratorio */}
      <div
        className={`absolute right-6 top-24 z-10 hidden transition-all delay-700 duration-1000 md:right-12 md:top-28 lg:block ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <RotatingSeal />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-40 md:px-8 md:pb-28">
        <div className="max-w-3xl">
          <p
            className={`mb-5 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-accent transition-all delay-300 duration-1000 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <SprayStar className="size-4" />
            Empanadas argentinas · España
          </p>

          <h1 className="text-balance font-black uppercase leading-[0.92] tracking-tight">
            <span
              className={`block text-5xl md:text-7xl lg:text-8xl transition-all delay-[450ms] duration-1000 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Buena gente,
            </span>
            <span
              className={`block text-5xl text-primary md:text-7xl lg:text-8xl transition-all delay-[600ms] duration-1000 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Mala Masa.
            </span>
          </h1>

          <p
            className={`mt-6 max-w-md text-pretty text-base leading-relaxed text-foreground/75 md:text-lg transition-all delay-[750ms] duration-1000 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Masa madre de 48 horas, repulgue hecho a mano y rellenos sin
            atajos. La empanada de siempre, criada en la calle.
          </p>

          <div
            className={`mt-9 flex flex-wrap items-center gap-4 transition-all delay-[900ms] duration-1000 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <a
              href="#carta"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span className="relative z-10">Ver la carta</span>
              <span
                aria-hidden="true"
                className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
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

      {/* Indicador de scroll */}
      <div
        className={`pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 transition-opacity delay-[1200ms] duration-1000 md:flex ${
          loaded ? 'opacity-60' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Baja</span>
        <span className="h-8 w-px animate-pulse bg-foreground/60" />
      </div>
    </section>
  )
}
