'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor personalizado — un dot diminuto que sigue al cursor en desktop.
 * - Solo se activa con `hover: hover` + `pointer: fine`
 * - Se agranda al hover de elementos interactivos (a, button, [role=button])
 * - Respeta prefers-reduced-motion
 * - No reemplaza el cursor nativo: lo complementa
 */
export function CursorDot() {
  const dotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Bail temprano en touch o con reduce-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const dot = dotRef.current
    if (!dot) return

    let frame = 0
    let visible = false

    const onMove = (e: PointerEvent) => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          if (!visible) {
            visible = true
            dot.classList.remove('is-hidden')
          }
          dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
        })
      }
    }

    const onEnter = () => {
      dot.classList.add('is-hover')
    }
    const onLeave = () => {
      dot.classList.remove('is-hover')
    }

    const onWindowLeave = () => {
      dot.classList.add('is-hidden')
      visible = false
    }

    // Selección de interactivos
    const interactiveSelector = 'a, button, [role="button"], input, textarea, select, label, summary'

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onWindowLeave)
    document.body.addEventListener('pointerover', (e) => {
      const target = e.target as HTMLElement
      if (target.closest?.(interactiveSelector)) onEnter()
    })
    document.body.addEventListener('pointerout', (e) => {
      const target = e.target as HTMLElement
      if (target.closest?.(interactiveSelector)) onLeave()
    })

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onWindowLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return <span ref={dotRef} className="cursor-dot is-hidden" aria-hidden="true" />
}
