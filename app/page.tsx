import { BrandTicker } from '@/components/brand-ticker'
import { CartProvider } from '@/components/cart-context'
import { CartReminder } from '@/components/cart-reminder'
import { CartDrawerLazy } from '@/components/cart-drawer-lazy'
import { Carta } from '@/components/carta'
import { Hero } from '@/components/hero'
import { Localizacion } from '@/components/localizacion'
import { Manifiesto } from '@/components/manifiesto'
import { MerchSection } from '@/components/merch-section'
import { Proceso } from '@/components/proceso'
import { RepulgueDivider } from '@/components/repulgue-divider'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { ToastProvider } from '@/components/toast'

export default function Home() {
  return (
    <ToastProvider>
      <CartProvider>
        <SiteHeader />
        <main>
          <Hero />
          <BrandTicker variant="red" />
          <Manifiesto />
          <RepulgueDivider from="var(--background)" to="var(--secondary)" />
          <Carta />
          <BrandTicker variant="cream" />
          <Proceso />
          <RepulgueDivider from="var(--background)" to="var(--secondary)" />
          <MerchSection />
          <RepulgueDivider from="var(--secondary)" to="var(--background)" />
          <Localizacion />
        </main>
        <SiteFooter />
        <CartDrawerLazy />
        <CartReminder />
      </CartProvider>
    </ToastProvider>
  )
}
