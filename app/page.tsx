import { BrandTicker } from '@/components/brand-ticker'
import { CartDrawer } from '@/components/cart-drawer'
import { CartProvider } from '@/components/cart-context'
import { Carta } from '@/components/carta'
import { Hero } from '@/components/hero'
import { Localizacion } from '@/components/localizacion'
import { Manifiesto } from '@/components/manifiesto'
import { MerchSection } from '@/components/merch-section'
import { Proceso } from '@/components/proceso'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function Home() {
  return (
    <CartProvider>
      <SiteHeader />
      <main>
        <Hero />
        <BrandTicker variant="red" />
        <Manifiesto />
        <Carta />
        <BrandTicker variant="cream" />
        <Proceso />
        <MerchSection />
        <Localizacion />
      </main>
      <SiteFooter />
      <CartDrawer />
    </CartProvider>
  )
}
