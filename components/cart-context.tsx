'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Product } from '@/lib/products'

export type CartItem = {
  product: Product
  qty: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  add: (product: Product, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  open: () => void
  close: () => void
  count: number
  total: number
}

const CartContext = createContext<CartState | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const add = useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { product, qty }]
    })
    setIsOpen(true)
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, qty } : i)),
    )
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo<CartState>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0)
    const total = items.reduce((n, i) => n + i.qty * i.product.price, 0)
    return { items, isOpen, add, remove, setQty, open, close, count, total }
  }, [items, isOpen, add, remove, setQty, open, close])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
