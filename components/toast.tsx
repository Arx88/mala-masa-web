'use client'

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
    setTimeout(onDismiss, 280)
  }

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300',
        'border-border',
        toast.variant === 'reminder' && 'border-primary/40',
        toast.variant === 'success' && 'border-accent/40',
        entering && 'translate-y-4 scale-95 opacity-0',
        !entering && !leaving && 'translate-y-0 scale-100 opacity-100',
        leaving && 'translate-y-2 scale-95 opacity-0',
      )}
    >
      {/* Acento lateral más rico para reminder */}
      {toast.variant === 'reminder' && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-primary via-primary to-accent"
        />
      )}
      {toast.variant === 'success' && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-accent" />
      )}
      {toast.variant === 'default' && (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-foreground/30" />
      )}

      <div className="flex gap-3.5 p-4 pl-5">
        {/* === Iconografía propia según variante === */}
        <div className="shrink-0 pt-0.5">
          {toast.variant === 'reminder' && <EmpanadaSteamIcon className="size-9 text-primary" />}
          {toast.variant === 'success' && <SuccessSealIcon className="size-8 text-accent" />}
          {toast.variant === 'default' && <InfoIcon className="size-7 text-foreground/60" />}
        </div>

        <div className="flex-1 min-w-0">
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

        {/* Close */}
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

      {/* Barra de progreso de auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0.5 bg-primary/40"
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

/* ============ Iconografía propia de Mala Masa ============ */

/**
 * Empanada con vapor — icono principal del reminder de pedido pendiente.
 * Empanada en forma de media luna con repulgue (líneas curvas en el borde),
 * tres líneas de vapor subiendo. NO es genérico: es la marca.
 */
function EmpanadaSteamIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden="true">
      {/* Vapor — tres líneas que suben */}
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      >
        <path d="M12 12 C 10 9, 14 7, 12 4">
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M18 12 C 16 9, 20 7, 18 4">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="2.4s"
            begin="0.4s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M24 12 C 22 9, 26 7, 24 4">
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="2.4s"
            begin="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </g>

      {/* Empanada — media luna con repulgue */}
      <path
        d="M4 24 C 4 16, 12 12, 18 12 C 24 12, 32 16, 32 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4 24 C 4 16, 12 12, 18 12 C 24 12, 32 16, 32 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Repulgue — pequeños arcos a lo largo del borde curvo */}
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
        <path d="M7 19 C 7.5 18, 8.5 18, 9 19" />
        <path d="M11 16 C 11.5 15, 12.5 15, 13 16" />
        <path d="M16 14 C 16.5 13, 17.5 13, 18 14" />
        <path d="M20 14 C 20.5 13, 21.5 13, 22 14" />
        <path d="M25 16 C 25.5 15, 26.5 15, 27 16" />
        <path d="M29 19 C 29.5 18, 30.5 18, 31 19" />
      </g>
    </svg>
  )
}

/** Sello de confirmación — para success de pedido */
function SuccessSealIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      {/* Círculo punteado exterior */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        opacity="0.4"
      />
      {/* Círculo lleno interior */}
      <circle cx="16" cy="16" r="10" fill="currentColor" fillOpacity="0.15" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {/* Check */}
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
