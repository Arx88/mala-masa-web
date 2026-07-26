'use client'

import dynamic from 'next/dynamic'

// CartDrawer se carga solo cuando el usuario interactúa con el carrito.
// Esto reduce ~120KB del bundle inicial.
const CartDrawer = dynamic(
  () => import('@/components/cart-drawer').then(m => ({ default: m.CartDrawer })),
  {
    ssr: false,
    loading: () => null,
  }
)

export function CartDrawerLazy() {
  return <CartDrawer />
}
