'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { MaskedHeading, Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'

const lineas = [
  { num: '01', text: 'Que la masa no se compra,', accent: 'se cría.' },
  { num: '02', text: 'Que el repulgue se hace con los dedos,', accent: 'no con molde.' },
  { num: '03', text: 'Que el relleno no se estira,', accent: 'se respeta.' },
  { num: '04', text: 'Y que lo premium no grita:', accent: 'se nota.' },
]

export function Manifiesto() {
  // Marquee vertical con parallax al scroll: las palabras "MASA / LENTA / HORNO / PEDAZO"
  // suben a velocidad distinta que el contenido para dar profundidad.
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = marqueeRef.current
    if (!el) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // -1 (abajo del todo) → 1 (arriba del todo)
      const progress = (vh / 2 - rect.top - rect.height / 2) / (vh / 2 + rect.height / 2)
      el.style.transform = `translateY(${progress * -80}px)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section id="manifiesto" className="relative overflow-hidden bg-background py-24 md:py-36">
      {/* Backdrop tipográfico vertical gigante — "MASA / LENTA" repetido,
          con parallax al scroll. Da peso visual al manifiesto. */}
      <div
        ref={marqueeRef}
        aria-hidden="true"
        className="manifiesto-backdrop pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 flex-col items-center justify-center md:flex"
        style={{ willChange: 'transform' }}
      >
        <span>MASA</span>
        <span>LENTA</span>
        <span>HORNO</span>
        <span>VIVO</span>
      </div>

      {/* Número de sección gigante */}
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        01
      </span>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-20">
        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
              <SprayStar className="size-4" />
              Manifiesto
            </p>
          </Reveal>
          <MaskedHeading
            className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl"
            lines={[
              'Cada empanada',
              'se trabaja a la',
              <span key="p" className="text-primary">
                perfección.
              </span>,
            ]}
            baseDelay={60}
            step={125}
          />
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-foreground/70">
              Cada receta se estudió, investigó y construyó con mucha dedicación.
              Creemos en la masa lenta, en el relleno generoso, en el horno que
              no se programa: se cuida.
            </p>
          </Reveal>

          <ul className="mt-10 flex flex-col gap-2">
            {lineas.map((linea, i) => (
              <Reveal key={linea.num} as="li" delay={250 + i * 120}>
                <div className="manifiesto-line group relative flex items-baseline gap-4 border-l-2 border-foreground/15 py-3 pl-6 transition-all duration-500 hover:border-primary hover:pl-8">
                  <span
                    aria-hidden="true"
                    className="shrink-0 pt-1 font-mono text-[11px] font-bold tabular-nums tracking-[0.2em] text-foreground/30 transition-colors duration-500 group-hover:text-accent"
                  >
                    {linea.num}
                  </span>
                  <p className="text-pretty text-lg font-semibold leading-snug md:text-xl">
                    {linea.text}{' '}
                    <span className="underline-hand font-black text-primary">
                      {linea.accent}
                    </span>
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center">
          <Reveal className="relative w-full" delay={200}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg md:aspect-[3/4]">
              <Image
                src="/images/boxes-stack.png"
                alt="Torre de cajas Mala Masa con salpicaduras de pintura roja y dorada"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1.5s] ease-out hover:scale-[1.04]"
              />
              {/* Sello giratorio pequeño sobre la foto */}
              <div className="absolute -left-6 -top-6 hidden size-20 place-items-center rounded-full bg-background shadow-xl md:grid">
                <SprayStar className="size-7 rotate-12 text-primary" />
              </div>
            </div>
            {/* Etiqueta flotante */}
            <div className="animate-float absolute -bottom-5 left-5 rounded-md bg-foreground px-5 py-3 text-background shadow-xl md:left-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/60">
                Est. 2026
              </p>
              <p className="text-sm font-black uppercase tracking-wide">
                Empanadas con actitud
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
