import Image from 'next/image'
import { Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'

const pasos = [
  {
    num: '01',
    title: 'La masa se cría',
    text: 'Masa madre fermentada 48 horas. Sin prisas, sin aditivos, sin congelador. Cada tanda tiene su carácter.',
    image: null,
  },
  {
    num: '02',
    title: 'El repulgue, a dedo',
    text: 'Trece pliegues por empanada, uno a uno, con las manos. Es más lento. Nos da igual.',
    image: '/images/proceso-repulgue.png',
    alt: 'Manos haciendo el repulgue de una empanada sobre mesa enharinada',
  },
  {
    num: '03',
    title: 'Horno de piedra',
    text: 'Al horno de piedra hasta que la masa canta. Salen cuando están, no cuando toca.',
    image: '/images/proceso-horno.png',
    alt: 'Empanadas doradas saliendo del horno de piedra con brasas al fondo',
  },
]

export function Proceso() {
  return (
    <section id="proceso" className="relative overflow-hidden bg-background py-24 md:py-36">
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
          <Reveal delay={100}>
            <h2 className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
              Lo lento se nota <span className="text-accent">en el primer bocado.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pasos.map((paso, i) => (
            <Reveal key={paso.num} delay={i * 150} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-500 hover:border-foreground/30">
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
                      className="text-stroke select-none text-[7rem] font-black leading-none transition-transform duration-700 group-hover:scale-110"
                    >
                      48h
                    </span>
                    <SprayStar className="absolute bottom-5 right-5 size-6 text-primary/60 transition-transform duration-500 group-hover:rotate-45" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <p className="text-[12px] font-black uppercase tracking-[0.24em] text-accent tabular-nums">
                    Paso {paso.num}
                  </p>
                  <h3 className="text-xl font-black uppercase tracking-tight">{paso.title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {paso.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
