'use client'

import { useEffect, useRef } from 'react'

/** Hilo rojo de progreso de lectura, pegado al borde superior */
export function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      el.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="scroll-progress absolute inset-x-0 top-0 block h-0.5 w-full bg-primary"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}
