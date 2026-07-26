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

  const push = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random()
      const toast: Toast = { id, duration: 4500, variant: 'default', ...t }
      setToasts((prev) => [...prev, toast])
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => dismiss(id), toast.duration)
      }
      return id
    },
    [dismiss],
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

  useEffect(() => {
    const r = requestAnimationFrame(() => setEntering(false))
    return () => cancelAnimationFrame(r)
  }, [])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(onDismiss, 220)
  }

  const isReminder = toast.variant === 'reminder'

  // Hallmark: sin side-stripe, sin border rojo. Solo hairline border-border sutil.
  // ui-ux-pro-max: elevation-consistent — una sola sombra oscura tight (no halo).
  // ui-ux-pro-max: duration-timing — 220ms enter/exit (dentro del rango 150-300ms).
  // Reminder: layout horizontal con imagen a la derecha (match referencia visual).
  // Default/Success: layout icono a la izquierda (comportamiento existente).
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative overflow-hidden border border-border bg-background/95 backdrop-blur-md transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isReminder
          ? 'flex w-full max-w-[480px] rounded-[14px]'
          : 'w-full max-w-sm rounded-2xl',
        entering && 'translate-y-3 opacity-0',
        !entering && !leaving && 'translate-y-0 opacity-100',
        leaving && 'translate-y-1 opacity-0',
      )}
      style={{
        // ui-ux-pro-max: elevation-consistent + Hallmark shadow-glow fix
        // Sombra oscura tight, no halo de color. Sutil para no gritar.
        boxShadow:
          '0 12px 32px -12px rgba(0,0,0,0.55), 0 4px 12px -4px rgba(0,0,0,0.35)',
      }}
    >
      {isReminder ? (
        <ReminderContent toast={toast} onDismiss={handleDismiss} />
      ) : (
        <DefaultContent toast={toast} onDismiss={handleDismiss} />
      )}

      {/* Barra de progreso de auto-dismiss — sutil, sin color agresivo */}
      {toast.duration && toast.duration > 0 && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 z-20 h-0.5 bg-foreground/30"
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      )}
      <style jsx>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @media (prefers-reduced-motion: reduce) {
          animation: none !important;
        }
      `}</style>
    </div>
  )
}

/* ============ Reminder layout: imagen a la DERECHA, texto a la IZQUIERDA ============
   Match referencia: ~480px wide, split horizontal, imagen full-height sangra al
   borde derecho, texto con título + descripción + botón pill rojo apilados, close
   (X) absoluto en esquina top-right sobre la imagen. */
function ReminderContent({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <>
      {/* LEFT: bloque de texto (~58%) */}
      <div className="flex w-[58%] shrink-0 flex-col gap-2 p-5">
        <p className="text-[19px] font-extrabold uppercase leading-tight tracking-tight text-foreground">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[13.5px] leading-snug text-muted-foreground">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onDismiss()
            }}
            className="btn-shine mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
          >
            {toast.action.label}
            <span aria-hidden="true" className="transition-transform duration-200">→</span>
          </button>
        )}
      </div>

      {/* RIGHT: imagen (~42%) — sangra al borde derecho, full height */}
      <div className="relative w-[42%] shrink-0 overflow-hidden">
        <Image
          src="/images/boxes-plate.webp"
          alt=""
          fill
          sizes="220px"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* CLOSE: absoluto top-right sobre la imagen, contraste con sutil backdrop */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/35 p-1 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
        aria-label="Cerrar notificación"
      >
        <svg viewBox="0 0 14 14" className="size-3.5" fill="none" aria-hidden="true">
          <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </>
  )
}

/* ============ Default/Success layout: icono a la IZQUIERDA, texto a la derecha ============ */
function DefaultContent({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div className="flex gap-4 p-4">
      {/* === Iconografía: imagen real, no SVG embebido ===
          ui-ux-pro-max: image-size — usar tamaño apropiado al display.
          64x64 es lo mínimo para que una imagen con detalle se lea bien en un toast.
          Alineación: self-start (top del contenedor) para alinear con la primera
          línea de texto, no con el centro del bloque completo. */}
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
              onDismiss()
            }}
            className="btn-shine mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-primary-foreground transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98]"
          >
            {toast.action.label}
            <span aria-hidden="true" className="transition-transform duration-200">→</span>
          </button>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 self-start rounded-full p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
        aria-label="Cerrar notificación"
      >
        <svg viewBox="0 0 14 14" className="size-3.5" fill="none" aria-hidden="true">
          <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

/* ============ Iconos para otros variants (no reminder) ============ */

/** Sello de confirmación — para success de pedido */
function SuccessSealIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.4"
      />
      <circle cx="16" cy="16" r="10" fill="currentColor" fillOpacity="0.15" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M12 16 L 15 19 L 20 13"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/** Info — para toasts genéricos */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  )
}
