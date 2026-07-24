import Image from 'next/image'
import { Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'

const lineas = [
  { text: 'Que la masa no se compra,', accent: 'se cría.' },
  { text: 'Que el repulgue se hace con los dedos,', accent: 'no con molde.' },
  { text: 'Que el relleno no se estira,', accent: 'se respeta.' },
  { text: 'Y que lo premium no grita:', accent: 'se nota.' },
]

export function Manifiesto() {
  return (
    <section id="manifiesto" className="relative overflow-hidden bg-background py-24 md:py-36">
      {/* Número de sección gigante */}
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-6 right-0 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        01
      </span>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-20">
        <div className="flex flex-col justify-center">
          <Reveal>
            <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
              <SprayStar className="size-4" />
              Manifiesto
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
              Nos dijeron que la masa era{' '}
              <span className="text-accent">lo de menos.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-foreground/70">
              Nos lo tomamos como algo personal. Mala Masa nace de llevar la
              contraria: creemos...
            </p>
          </Reveal>

          <ul className="mt-10 flex flex-col gap-6">
            {lineas.map((linea, i) => (
              <Reveal key={linea.accent} as="li" delay={250 + i * 120}>
                <div className="group flex items-baseline gap-4 border-l-2 border-foreground/15 pl-5 transition-colors duration-500 hover:border-primary">
                  <p className="text-pretty text-lg font-semibold leading-snug md:text-xl">
                    {linea.text}{' '}
                    <span className="font-black text-primary">{linea.accent}</span>
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
            </div>
            {/* Etiqueta flotante */}
            <div className="animate-float absolute -bottom-5 left-5 rounded-md bg-foreground px-5 py-3 text-background shadow-xl md:left-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/60">
                Est. 2025
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
