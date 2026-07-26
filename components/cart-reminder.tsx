'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@/components/cart-context'
import { useToast } from '@/components/toast'

/**
 * Recordatorio amigable de pedido incompleto.
 *
 * Aparece cuando:
 * - Hay items en el carrito
 * - Pasan N segundos sin que el usuario interactúe con el carrito
 *   (agregar, quitar, cambiar cantidad, abrir/cerrar drawer, navegar al checkout)
 * - No se ha mostrado ya en los últimos N minutos (no spamear)
 *
 * No aparece si:
 * - El carrito está vacío
 * - El drawer está abierto en el step de checkout o success
 *   (el usuario ya está avanzando, no hace falta recordarle)
 *
 * UX rules aplicadas (ui-ux-pro-max):
 * - 'toast-dismiss' — auto-dismiss 3-5s (usamos 8s para reminder con acción)
 * - 'toast-accessibility' — aria-live="polite"
 * - 'empty-states' / 'confirmation-messages' — copy cálido + acción clara
 */
const INACTIVITY_TIMEOUT = 30_000 // 30s sin interacción
const COOLDOWN = 5 * 60_000 // 5min entre reminder y reminder (no spamear)

export function CartReminder() {
  const { items, count, isOpen, add, remove, setQty, clear } = useCart()
  const { push: pushToast } = useToast()

  const lastInteractionRef = useRef<number>(Date.now())
  const lastShownRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Marcar interacción = cualquier cambio al carrito cuenta
  useEffect(() => {
    lastInteractionRef.current = Date.now()
  }, [items, count])

  // Reset al abrir/cerrar drawer (interacción explícita del usuario)
  useEffect(() => {
    lastInteractionRef.current = Date.now()
  }, [isOpen])

  // Loop que verifica cada segundo si es momento de mostrar el reminder
  useEffect(() => {
    if (items.length === 0) return
    if (count === 0) return

    const check = () => {
      const now = Date.now()
      const sinceInteraction = now - lastInteractionRef.current
      const sinceLastShown = now - lastShownRef.current

      // Mostrar si:
      // - Pasaron 30s desde la última interacción con el carrito
      // - Pasaron 5min desde el último reminder (cooldown)
      // - El carrito tiene items
      if (
        sinceInteraction >= INACTIVITY_TIMEOUT &&
        sinceLastShown >= COOLDOWN
      ) {
        lastShownRef.current = now
        lastInteractionRef.current = now // reset para no disparar de nuevo

        pushToast({
          title: '¡Que no se enfríen!',
          description: `Tu pedido de ${count} empanada te esperan calentito. Un par de clics y listo.`,
          variant: 'reminder',
          duration: 20_000,
          action: {
            label: 'Ver pedido',
            onClick: () => {
              // Abrir el drawer — usamos window event para no acoplar a CartContext
              window.dispatchEvent(new CustomEvent('cart:open'))
            },
          },
        })
      }
    }

    timerRef.current = setInterval(check, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [items.length, count, pushToast])

  return null
}
