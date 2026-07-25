import Image from 'next/image'
import { HorariosList } from '@/components/horarios-list'
import { MaskedHeading, Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'

const horarios = [
  { dias: 'Martes — Jueves', horas: '12:00 – 22:30', days: [2, 3, 4] },
  { dias: 'Viernes — Sábado', horas: '12:00 – 00:00', days: [5, 6] },
  { dias: 'Domingo', horas: '12:00 – 17:00', days: [0] },
  { dias: 'Lunes', horas: 'Criando masa (cerrado)', days: [1] },
]

export function Localizacion() {
  return (
    <section id="donde" className="relative overflow-hidden bg-background py-24 md:py-36">
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        05
      </span>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-16">
        <Reveal className="relative order-2 md:order-1">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg md:aspect-[3/4]">
            <Image
              src="/images/local-madrid.png"
              alt="Fachada nocturna del local Mala Masa con luz cálida saliendo del interior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1.5s] ease-out hover:scale-[1.04]"
            />
          </div>
          <div className="animate-float absolute -top-5 right-5 rounded-md bg-primary px-5 py-3 text-primary-foreground shadow-xl md:right-8" style={{ '--float-rot': '2deg' } as React.CSSProperties}>
            <p className="text-sm font-black uppercase tracking-wide">Recién horneadas</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70">
              Todos los días
            </p>
          </div>
        </Reveal>

        <div className="order-1 flex flex-col justify-center md:order-2">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
              <SprayStar className="size-4" />
              Dónde
            </p>
          </Reveal>
          <MaskedHeading
            className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl"
            lines={[
              'Búscanos.',
              <span key="a" className="text-accent">
                Seguí el aroma.
              </span>,
            ]}
            baseDelay={60}
            step={130}
          />

          <Reveal delay={200}>
            <address className="mt-8 not-italic">
              <p className="text-xl font-black uppercase tracking-tight">Calle del Horno, 13</p>
              <p className="text-muted-foreground">Barrio Ruzzafa · Valencia</p>
            </address>
          </Reveal>

          <Reveal delay={280} className="mt-8">
            <HorariosList horarios={horarios} />
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="https://maps.google.com/?q=Calle+del+Horno+13+Madrid"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine group inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-3.5 text-sm font-black uppercase tracking-[0.14em] text-background transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-[1.03] active:scale-[0.98]"
              >
                Cómo llegar
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-brush text-sm font-bold uppercase tracking-[0.14em] text-foreground/85 transition-colors hover:text-foreground"
              >
                @malamasa.es
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
