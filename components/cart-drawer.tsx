'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useCart } from '@/components/cart-context'
import { SprayStar } from '@/components/brand-marks'
import { formatPrice } from '@/lib/products'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, total, count } = useCart()

  // Cerrar con Escape y bloquear scroll de fondo
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-400',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-background border-l border-border transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-tight">
            <SprayStar className="size-4 text-primary" />
            Tu pedido
            {count > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-black tabular-nums text-primary-foreground">
                {count}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-border p-2 transition-colors hover:border-primary hover:text-primary"
            aria-label="Cerrar carrito"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <SprayStar className="size-8 text-foreground/20" />
            <p className="text-lg font-black uppercase tracking-tight">Esto está muy vacío</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Y una empanada sola tampoco es plan. Echa un ojo a la carta.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-2 rounded-full bg-foreground px-6 py-3 text-[12px] font-black uppercase tracking-[0.14em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Ver la carta
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {items.map(({ product, qty }, i) => (
                <li
                  key={product.id}
                  className="flex gap-4 py-5 animate-in fade-in slide-in-from-right-4 duration-500"
                  style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }}
                >
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black uppercase tracking-tight leading-tight">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{product.tagline}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label={`Quitar ${product.name} del pedido`}
                      >
                        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
                          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty - 1)}
                          className="px-3 py-1 text-sm font-black transition-colors hover:text-primary"
                          aria-label={`Reducir cantidad de ${product.name}`}
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-black tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(product.id, qty + 1)}
                          className="px-3 py-1 text-sm font-black transition-colors hover:text-primary"
                          aria-label={`Aumentar cantidad de ${product.name}`}
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-black tabular-nums">
                        {formatPrice(product.price * qty)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-black tabular-nums">{formatPrice(total)}</p>
              </div>
              <button
                type="button"
                className="btn-shine mt-4 w-full rounded-full bg-primary py-4 text-sm font-black uppercase tracking-[0.16em] text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
              >
                Tramitar pedido
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pago online muy pronto. De momento, ven a por ellas al local.
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
