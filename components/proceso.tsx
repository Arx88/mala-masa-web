'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { MaskedHeading, Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'

const pasos = [
  {
    num: '01',
    title: 'La masa se cría',
    text: 'Masa madre fermentada 48 horas. Sin prisas, sin aditivos, sin congelador. Cada tanda tiene su carácter.',
    image: null,
    duration: '48h',
  },
  {
    num: '02',
    title: 'El repulgue, a dedo',
    text: 'Trece pliegues por empanada, uno a uno, con las manos. Es más lento. Nos da igual.',
    image: '/images/proceso-repulgue.png',
    alt: 'Manos haciendo el repulgue de una empanada sobre mesa enharinada',
    duration: '13 pliegues',
  },
  {
    num: '03',
    title: 'Horno de piedra',
    text: 'Al horno de piedra hasta que la masa canta. Salen cuando están, no cuando toca.',
    image: '/images/proceso-horno.png',
    alt: 'Empanadas doradas saliendo del horno de piedra con brasas al fondo',
    duration: 'a ojo',
  },
]

export function Proceso() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeStep, setActiveStep] = useState<number>(-1)

  // Activa cada paso cuando entra en el viewport (no es un progress bar global,
  // es un indicador por card: cuando la card es visible, su número se "enciende")
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const section = sectionRef.current
    if (!section) return

    const cards = section.querySelectorAll<HTMLElement>('[data-step]')
    if (!cards.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.step)
            setActiveStep(idx)
          }
        }
      },
      { threshold: 0.6, rootMargin: '-20% 0px -20% 0px' },
    )
    for (const c of cards) observer.observe(c)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="proceso" className="relative overflow-hidden bg-background py-24 md:py-36">
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        03
      </span>

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 max-w-2xl md:mb-20">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
              <SprayStar className="size-4" />
              El Proceso
            </p>
          </Reveal>
          <MaskedHeading
            className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl"
            lines={[
              'Lo lento se nota',
              <span key="a" className="text-accent">
                en el primer bocado.
              </span>,
            ]}
            baseDelay={60}
            step={130}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pasos.map((paso, i) => {
            const isActive = activeStep === i
            const isDone = activeStep > i
            return (
              <Reveal key={paso.num} delay={i * 150} className="h-full">
                <article
                  data-step={i}
                  className={`proceso-step group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-all duration-500 ${
                    isActive
                      ? 'border-primary/60 shadow-[0_24px_70px_-30px_oklch(0.58_0.21_29/0.5)]'
                      : 'border-border hover:border-foreground/30'
                  }`}
                >
                  {/* Indicador de estado en la esquina superior derecha — pequeño, no un progress bar */}
                  <span
                    aria-hidden="true"
                    className={`absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] transition-all duration-500 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isDone
                          ? 'bg-accent/20 text-accent'
                          : 'bg-foreground/5 text-foreground/40'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? 'bg-primary-foreground animate-pulse-soft'
                          : isDone
                            ? 'bg-accent'
                            : 'bg-foreground/30'
                      }`}
                    />
                    {isActive ? 'Ahora' : isDone ? 'Hecho' : 'Pendiente'}
                  </span>

                  {paso.image ? (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={paso.image}
                        alt={paso.alt ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>
                  ) : (
                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-secondary">
                      <span
                        aria-hidden="true"
                        className="animate-ember absolute size-56 rounded-full blur-3xl"
                        style={{
                          background:
                            'radial-gradient(circle, oklch(0.75 0.15 75 / 14%), transparent 65%)',
                        }}
                      />
                      <span
                        aria-hidden="true"
                        className={`animate-pulse-soft text-stroke relative select-none text-[7rem] font-black leading-none transition-transform duration-700 group-hover:scale-110 ${
                          isActive ? 'text-primary/30' : ''
                        }`}
                      >
                        48h
                      </span>
                      <SprayStar className="absolute bottom-5 right-5 size-6 text-primary/60 transition-transform duration-500 group-hover:rotate-45" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-6">
                    <p className="flex items-center justify-between gap-2.5 text-[12px] font-black uppercase tracking-[0.24em] text-accent tabular-nums">
                      <span className="flex items-center gap-2.5">
                        <span className="h-px w-6 bg-accent/50 transition-all duration-500 group-hover:w-10 group-hover:bg-accent" />
                        Paso {paso.num}
                      </span>
                      <span className="text-foreground/40">{paso.duration}</span>
                    </p>
                    <h3 className="text-xl font-black uppercase tracking-tight">{paso.title}</h3>
                    <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {paso.text}
                    </p>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
