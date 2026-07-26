import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import { CursorDot } from '@/components/cursor-dot'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '600', '800'],
  display: 'swap',
})

const BASE_URL = 'https://mala-masa-web.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mala Masa — Empanadas Argentinas Premium en España',
    template: '%s · Mala Masa',
  },
  description:
    'Empanadas argentinas hechas a mano en España. Masa madre fermentada 48h, repulgue de verdad (13 pliegues a mano) y horno de piedra. Pide media docena o la docena entera. Recogida en local y delivery.',
  keywords: [
    'empanadas argentinas',
    'empanadas artesanas',
    'empanadas hechas a mano',
    'empanadas Argentina España',
    'empanadas masa madre',
    'repulgue a mano',
    'horno de piedra',
    'empanadas premium',
    'Mala Masa',
    'empanadas Madrid',
    'empanadas Valencia',
    'comida argentina España',
    'catering empanadas',
    'pedir empanadas online',
  ],
  authors: [{ name: 'Mala Masa' }],
  creator: 'Mala Masa',
  publisher: 'Mala Masa',
  applicationName: 'Mala Masa',
  category: 'food',
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'Mala Masa',
    title: 'Mala Masa — Empanadas Argentinas Premium',
    description:
      'Masa madre fermentada 48h, repulgue de 13 pliegues a mano, horno de piedra. Las auténticas empanadas argentinas en España.',
    images: [
      {
        url: '/images/empanadas-tray.webp',
        width: 1200,
        height: 630,
        alt: 'Empanadas Mala Masa recién horneadas sobre papel de marca',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mala Masa — Empanadas Argentinas Premium',
    description:
      'Masa madre 48h, repulgue a mano, horno de piedra. Las auténticas empanadas argentinas en España.',
    images: ['/images/empanadas-tray.webp'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.webmanifest',
  other: {
    'theme-color': '#141210',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#141210',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// JSON-LD structured data — Restaurant schema con menú completo
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Mala Masa',
  description:
    'Empanadas argentinas hechas a mano en España. Masa madre, repulgue de verdad y cero atajos.',
  url: BASE_URL,
  image: `${BASE_URL}/images/empanadas-tray.webp`,
  logo: `${BASE_URL}/images/logo-script-white.webp`,
  servesCuisine: ['Argentinian', 'Latin American', 'Empanadas'],
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle del Horno, 13',
    addressLocality: 'Valencia',
    addressRegion: 'Valencia',
    postalCode: '46006',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 39.4699,
    longitude: -0.3763,
  },
  telephone: '+34 91 000 00 00',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday'],
      opens: '12:00',
      closes: '22:30',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday'],
      opens: '12:00',
      closes: '00:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '12:00',
      closes: '17:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/malamasa.es',
  ],
  hasMenu: {
    '@type': 'Menu',
    name: 'Carta Mala Masa',
    hasMenuSection: [
      {
        '@type': 'MenuSection',
        name: 'Empanadas',
        hasMenuItem: [
          {
            '@type': 'MenuItem',
            name: 'La Clásica',
            description: 'Roast Beef braseado al vino tinto durante 4hs, cebolla, pimiento, papa.',
            offers: { '@type': 'Offer', price: '3.90', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'La Brava',
            description: 'Blend de carne molida premium, huevo, especias y salsa casera de ají picante.',
            offers: { '@type': 'Offer', price: '4.20', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'La Criolla',
            description: 'Pollo de Corral a baja temperatura, cebolla, pimiento, huevo, caldo de gallina casero.',
            offers: { '@type': 'Offer', price: '3.90', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'La Fundida',
            description: 'Jamón cocido natural premium, muzarella, huevo y mezcla de quesos.',
            offers: { '@type': 'Offer', price: '3.70', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'Humita',
            description: 'Maíz rallado, cebolla, pimiento, salsa blanca, quesos varios.',
            offers: { '@type': 'Offer', price: '3.70', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'Fugazzeta',
            description: 'Queso muzarella, cheddar blanco curado, provolone, cebolla caramelizada.',
            offers: { '@type': 'Offer', price: '3.70', priceCurrency: 'EUR' },
          },
        ],
      },
      {
        '@type': 'MenuSection',
        name: 'Packs',
        hasMenuItem: [
          {
            '@type': 'MenuItem',
            name: 'Media docena',
            description: '6 empanadas surtidas en caja negra de la casa.',
            offers: { '@type': 'Offer', price: '21.90', priceCurrency: 'EUR' },
          },
          {
            '@type': 'MenuItem',
            name: 'La docena',
            description: '12 empanadas surtidas en caja negra de la casa.',
            offers: { '@type': 'Offer', price: '39.90', priceCurrency: 'EUR' },
          },
        ],
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`bg-background ${archivo.variable}`}>
      <body className="antialiased font-sans grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <CursorDot />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
