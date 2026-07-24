'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/components/cart-context'
import { Reveal } from '@/components/reveal'
import { SprayStar } from '@/components/brand-marks'
import { formatPrice, merch, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

function MerchCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    add(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <Reveal as="li" delay={index * 140} className="group h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-500 hover:-translate-y-1.5 hover:border-foreground/30 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
        {product.tag && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary-foreground">
            {product.tag}
          </span>
        )}
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.image}
            alt={`${product.name} — ${product.tagline}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-5">
          <h3 className="text-lg font-black uppercase tracking-tight">{product.name}</h3>
          <p className="text-[13px] font-semibold text-muted-foreground">{product.tagline}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <p className="text-lg font-black tabular-nums">{formatPrice(product.price)}</p>
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                'rounded-full px-5 py-2.5 text-[12px] font-black uppercase tracking-[0.12em] transition-all duration-300 active:scale-95',
                justAdded
                  ? 'animate-badge-pop bg-accent text-accent-foreground'
                  : 'bg-foreground text-background hover:bg-primary hover:text-primary-foreground',
              )}
            >
              {justAdded ? 'Añadido' : 'Añadir'}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function MerchSection() {
  return (
    <section id="merch" className="relative bg-secondary py-24 md:py-36">
      <span
        aria-hidden="true"
        className="text-stroke pointer-events-none absolute -top-4 left-2 select-none text-[9rem] font-black leading-none md:text-[16rem]"
      >
        04
      </span>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.28em] text-primary">
                <SprayStar className="size-4" />
                Merch
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
                Ponte la masa <span className="text-primary">encima.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground md:text-right">
              Tiradas cortas, serigrafía artesanal y nuestra salsa de la casa
              embotellada. Cuando se acaba, se acaba.
            </p>
          </Reveal>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {merch.map((product, i) => (
            <MerchCard key={product.id} product={product} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
