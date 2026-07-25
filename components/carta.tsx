'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/components/cart-context'
import { MaskedHeading, Reveal } from '@/components/reveal'
import { SpiceLevel, SprayStar } from '@/components/brand-marks'
import { empanadas, formatPrice, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

function EmpanadaCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    add(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <Reveal as="li" delay={(index % 3) * 120} className="group">
      <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-500 hover:-translate-y-1.5 hover:border-foreground/30 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
        {/* Filo cálido que se enciende en el borde superior al pasar el ratón */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-70"
        />
        {product.tag && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-accent-foreground">
            {product.tag}
          </span>
        )}

        <div className="relative aspect-square overflow-hidden">
          <Image
            src={product.image}
            alt={`Empanada ${product.name} — ${product.tagline}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          {/* Número de sabor */}
          <span
            aria-hidden="true"
            className="absolute bottom-3 right-4 text-4xl font-black text-foreground/25 tabular-nums transition-colors duration-500 group-hover:text-primary/60"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                {product.name}
              </h3>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
                {product.tagline}
              </p>
            </div>
            <SpiceLevel level={product.spice} className="mt-1.5 shrink-0" />
          </div>

          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-4">
            <p className="text-lg font-black tabular-nums">
              {formatPrice(product.price)}
              <span className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                / ud
              </span>
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                'btn-shine relative rounded-full px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.12em] transition-all duration-300 active:scale-95',
                justAdded
                  ? 'animate-badge-pop bg-accent text-accent-foreground'
                  : 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground',
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {justAdded && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {justAdded ? 'Añadida' : 'Añadir'}
              </span>
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function Carta() {
  const { add } = useCart()
  const [packAdded, setPackAdded] = useState<string | null>(null)

  const addPack = (units: number, label: string) => {
    // Reparte el pack entre los sabores más pedidos
    const rotation = [empanadas[0], empanadas[1], empanadas[3]]
    for (let i = 0; i < units; i++) {
      add(rotation[i % rotation.length], 1)
    }
    setPackAdded(label)
    setTimeout(() => setPackAdded(null), 1500)
  }

  return (
    <section id="carta" className="relative bg-secondary py-24 md:py-36">
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-4 left-2 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        02
      </span>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
                <SprayStar className="size-4" />
                La Carta
              </p>
            </Reveal>
            <MaskedHeading
              className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl"
              lines={['Muchos sabores', 'Mucho relleno.']}
              lineClassName={(i) => (i === 1 ? 'text-primary' : undefined) as string}
              baseDelay={80}
              step={130}
            />
          </div>
          <Reveal delay={200}>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground md:text-right">
              Horneadas al momento, nunca recalentadas. Pide por unidad o
              llévate la caja: media docena o docena entera.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {empanadas.map((product, i) => (
            <EmpanadaCard key={product.id} product={product} index={i} />
          ))}
        </ul>

        {/* Packs */}
        <Reveal delay={150}>
          <div className="mt-14 overflow-hidden rounded-lg border border-border bg-card md:mt-20">
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-56 md:min-h-full">
                <Image
                  src="/images/box-handle.png"
                  alt="Caja de delivery Mala Masa con asa y salpicaduras de pintura"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center gap-6 p-7 md:p-10">
                <div>
                  <h3 className="text-balance text-2xl font-black uppercase tracking-tight md:text-3xl">
                    Llévate la caja
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    Surtido de nuestros sabores más pedidos en la caja negra de
                    la casa. La empanada viaja mejor acompañada.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => addPack(6, 'media')}
                    className="btn-shine group flex items-center justify-between rounded-md border border-border px-5 py-4 text-left transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:pl-6"
                  >
                    <span>
                      <span className="block text-sm font-black uppercase tracking-wide">
                        {packAdded === 'media' ? 'Añadida al pedido' : 'Media docena'}
                      </span>
                      <span className="text-xs text-muted-foreground">6 empanadas surtidas</span>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="text-lg font-black tabular-nums text-accent">
                        {formatPrice(21.9)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="-translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addPack(12, 'docena')}
                    className="btn-shine group flex items-center justify-between rounded-md border border-border px-5 py-4 text-left transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:pl-6"
                  >
                    <span>
                      <span className="block text-sm font-black uppercase tracking-wide">
                        {packAdded === 'docena' ? 'Añadida al pedido' : 'La docena'}
                      </span>
                      <span className="text-xs text-muted-foreground">12 empanadas surtidas</span>
                    </span>
                    <span className="flex items-center gap-2.5">
                      <span className="text-lg font-black tabular-nums text-accent">
                        {formatPrice(39.9)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="-translate-x-2 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        →
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
