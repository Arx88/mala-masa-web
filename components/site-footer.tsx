import Image from 'next/image'
import { SprayStar } from '@/components/brand-marks'

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-background">
      {/* CTA final con bodegón */}
      <div className="relative">
        <div className="relative min-h-[420px] md:min-h-[520px]">
          <Image
            src="/images/boxes-plate.png"
            alt="Cajas Mala Masa apiladas junto a un plato de empanadas sobre fondo negro"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-5 text-center">
            <h2 className="max-w-3xl text-balance text-4xl font-black uppercase leading-[0.95] tracking-tight md:text-6xl">
              El antojo no se negocia.
            </h2>
            <a
              href="#carta"
              className="btn-shine group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.14em] text-primary-foreground transition-all duration-300 hover:scale-[1.04] active:scale-[0.98]"
            >
              Pedir ahora
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
        {/* Borde repulgue entre CTA y pie */}
        <div
          className="repulgue-flip absolute inset-x-0 bottom-0 translate-y-px"
          style={{ '--repulgue-color': 'var(--secondary)' } as React.CSSProperties}
        />
      </div>

      <div className="bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 md:px-8 md:py-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <Image
              src="/images/logo-script-white.png"
              alt="Mala Masa"
              width={220}
              height={122}
              className="h-14 w-auto md:h-16"
            />
            <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Pie de página">
              {[
                { href: '#carta', label: 'La Carta' },
                { href: '#manifiesto', label: 'Manifiesto' },
                { href: '#proceso', label: 'Proceso' },
                { href: '#merch', label: 'Merch' },
                { href: '#donde', label: 'Dónde' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="link-brush text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground/70 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
            <p className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <SprayStar className="size-3 text-primary" />
              Mala Masa © {new Date().getFullYear()} — Empanadas argentinas hechas en España
            </p>
            <div className="flex gap-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
