import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mala Masa — Empanadas Argentinas Premium',
    short_name: 'Mala Masa',
    description:
      'Empanadas argentinas hechas a mano en España. Masa madre, repulgue de verdad y cero atajos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#141210',
    theme_color: '#141210',
    orientation: 'portrait-primary',
    lang: 'es-ES',
    categories: ['food', 'shopping'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.webp',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.webp',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
