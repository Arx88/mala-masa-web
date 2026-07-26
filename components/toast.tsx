'use client'

import Image from 'next/image'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Toast = {
  id: number
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
  variant?: 'default' | 'reminder' | 'success'
  duration?: number // ms; default 4500
}

type ToastContextValue = {
  push: (t: Omit<Toast, 'id'>) => number
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Sonido minimalista tipo "ting" usando Web Audio API.
  // - Solo para variant 'reminder' (no spamear en toasts genéricos)
  // - Respeta prefers-reduced-motion (si el usuario pidió menos motion, tampoco sonido)
  // - Frecuencias: dos notas ascendentes (E6 → A6) tipo campanita suave
  // - Volumen bajo (0.06) para ser sutil
  // - Sin archivos externos — generado al vuelo, 0KB de bundle extra
  const playReminderSound = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      // Notas: E6 (1318.51 Hz) → A6 (1760 Hz), intervalo de cuarta justa, suave y alegre
      const notes = [
        { freq: 1318.51, start: 0, dur: 0.18 },
        { freq: 1760.0, start: 0.08, dur: 0.28 },
      ]

      const masterGain = ctx.createGain()
      masterGain.gain.value = 0.06 // muy sutil
      masterGain.connect(ctx.destination)

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq

        // Envelope ADSR simple: ataque rápido, decaimiento suave
        const gain = ctx.createGain()
        const t0 = ctx.currentTime + start
        gain.gain.setValueAtTime(0, t0)
        gain.gain.linearRampToValueAtTime(1, t0 + 0.01) // ataque 10ms
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur) // decaimiento exponencial

        osc.connect(gain)
        gain.connect(masterGain)
        osc.start(t0)
        osc.stop(t0 + dur + 0.05)
      })

      // Limpiar el context después de que termine
      setTimeout(() => {
        ctx.close().catch(() => {})
      }, 600)
    } catch {
      // Si falla Web Audio (ej: autoplay policy), silenciosamente no hacer nada
    }
  }, [])

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random()
      const toast: Toast = { id, duration: 4500, variant: 'default', ...t }
      setToasts((prev) => [...prev, toast])

      // Sonido solo para reminder (no spamear en success/default)
      if (toast.variant === 'reminder') {
        playReminderSound()
      }

      // Nota: el auto-dismiss lo maneja ToastViewport vía onDismiss,
      // que dispara handleDismiss (animación de salida) antes de remover el toast.
      // NO hacemos dismiss directo acá porque saltaría la animación de salida.
      return id
    },
    [playReminderSound],
  )

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:right-auto sm:items-start"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [entering, setEntering] = useState(true)
  const [leaving, setLeaving] = useState(false)

  // Entrada: doble rAF para asegurar render del estado inicial antes de animar
  useEffect(() => {
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setEntering(false))
      return () => cancelAnimationFrame(r2)
    })
    return () => cancelAnimationFrame(r1)
  }, [])

  // Auto-dismiss: cuando pasa (duration)ms, dispara handleDismiss
  // (que setea leaving=true y remueve después de la animación de salida).
  // Antes esto vivía en ToastProvider.push() y saltaba la animación.
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return
    const timer = setTimeout(() => handleDismiss(), toast.duration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration])

  const handleDismiss = () => {
    setLeaving(true)
    // ui-ux-pro-max: exit-faster-than-enter — salida 280ms vs entrada 420ms
    setTimeout(onDismiss, 280)
  }

  // Layout tipo referencia: imagen a la derecha (bleed al borde), texto+botón a la izquierda
  // Solo para variant 'reminder'. default/success siguen con icono.
  if (toast.variant === 'reminder') {
    return (
      <div
        role="status"
        className={cn(
          'pointer-events-auto relative flex h-[176px] w-full max-w-[440px] overflow-hidden rounded-2xl bg-background border border-border',
          // Usar clases CSS @keyframes en lugar de Tailwind transitions
          // para garantizar que la animación se ejecute antes de que React
          // remueva el elemento del DOM.
          entering && 'toast-entering',
          !entering && !leaving && 'toast-visible',
          leaving && 'toast-leaving',
        )}
        style={{
          // Sombra oscura tight — Hallmark: no shadow-glow on dark
          boxShadow:
            '0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)',
        }}
      >
        {/* === LADO IZQUIERDO: texto + botón (50%) === */}
        <div className="flex w-1/2 flex-col justify-center gap-2 p-4 pl-5">
          <p className="text-[15px] font-extrabold uppercase tracking-tight leading-tight text-foreground">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-xs leading-snug text-muted-foreground">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                handleDismiss()
              }}
              className="mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            >
              {toast.action.label}
              <span aria-hidden="true">→</span>
            </button>
          )}
        </div>

        {/* === LADO DERECHO: imagen grande con bleed al borde (50%) ===
            Usamos reminder-empanada.webp — la imagen que el usuario envió
            vía wormhole.app: caja Mala Masa abierta con empanadas. */}
        <div className="relative w-1/2 shrink-0 overflow-hidden">
          <Image
            src="/images/reminder-empanada.webp"
            alt=""
            fill
            sizes="240px"
            className="object-cover"
            priority={false}
          />
          {/* Veladura sutil sobre la izquierda de la imagen para mejorar la transición */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/70 to-transparent"
          />
        </div>

        {/* === Close button: top-right (sobre la imagen, con backdrop sutil) === */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-2 top-2 z-10 rounded-full bg-background/40 p-1 text-white/90 backdrop-blur-sm transition-colors hover:bg-background/70 hover:text-white"
          aria-label="Cerrar notificación"
        >
          <svg viewBox="0 0 14 14" className="size-3.5" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        {/* === Barrita de progreso inferior ===
            Muestra cuánto tiempo queda hasta que el toast desaparezca.
            Se achica de 100% → 0% en (duration)ms.
            Color: accent (mostaza) — sutil pero visible sobre el bg carbón.
            Aria-hidden: decorativo, no anunciable a screen readers. */}
        {toast.duration && toast.duration > 0 && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 z-20 h-0.5 bg-accent/70"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        )}
      </div>
    )
  }

  // Layout para 'default' y 'success' (icono a la izquierda, como antes)
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl bg-background/95 backdrop-blur-md border border-border',
        entering && 'toast-entering',
        !entering && !leaving && 'toast-visible',
        leaving && 'toast-leaving',
      )}
      style={{
        boxShadow:
          '0 12px 32px -12px rgba(0,0,0,0.55), 0 4px 12px -4px rgba(0,0,0,0.35)',
      }}
    >
      <div className="flex gap-4 p-4">
        <div className="shrink-0 self-start">
          {toast.variant === 'success' && <SuccessSealIcon className="size-9 text-accent" />}
          {toast.variant === 'default' && <InfoIcon className="size-8 text-foreground/60" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black uppercase tracking-tight text-foreground">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick()
                handleDismiss()
              }}
              className="btn-shine mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
            >
              {toast.action.label}
              <span aria-hidden="true" className="transition-transform duration-200">→</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 self-start rounded-full p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
          aria-label="Cerrar notificación"
        >
          <svg viewBox="0 0 14 14" className="size-3.5" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ============ Iconos para default/success variants ============ */

function SuccessSealIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.4" />
      <circle cx="16" cy="16" r="10" fill="currentColor" fillOpacity="0.15" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 16 L 15 19 L 20 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  )
}
