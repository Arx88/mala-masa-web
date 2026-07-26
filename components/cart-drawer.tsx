'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '@/components/cart-context'
import { useToast } from '@/components/toast'
import { SprayStar } from '@/components/brand-marks'
import { formatPrice } from '@/lib/products'
import { cn } from '@/lib/utils'

type Step = 'cart' | 'checkout' | 'success'

type OrderDetails = {
  name: string
  phone: string
  mode: 'pickup' | 'delivery'
  address: string
  time: 'asap' | 'schedule'
  scheduledTime: string
  notes: string
}

type PaymentInfo = {
  method: 'card' | 'cash'
  cardName: string
  cardNumber: string
  expiry: string
  cvv: string
}

const DELIVERY_FEE = 2.5
const FREE_DELIVERY_THRESHOLD = 30
const PICKUP_TIME = '20-30 min'
const DELIVERY_TIME = '30-45 min'
// (El timeout de inactividad ahora vive en CartReminder, no aquí)

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, total, count, clear } = useCart()
  const { push: pushToast } = useToast()

  const [step, setStep] = useState<Step>('cart')
  const [submitting, setSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<OrderDetails>({
    name: '', phone: '', mode: 'pickup',
    address: '', time: 'asap', scheduledTime: '', notes: '',
  })
  const [payment, setPayment] = useState<PaymentInfo>({
    method: 'card', cardName: '', cardNumber: '', expiry: '', cvv: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  // Refs para auto-focus (UX rule: focus-management)
  const errorRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const firstErrorRef = useRef<HTMLInputElement | null>(null)
  const drawerRef = useRef<HTMLElement>(null)

  // Reset al cerrar (solo si no hay datos sin guardar)
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        if (step !== 'success') setStep('cart')
      }, 400)
      return () => clearTimeout(t)
    }
  }, [isOpen, step])

  // Escape cierra (con confirm si hay datos en checkout)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (step === 'checkout' && hasUnsavedData()) {
        setShowDiscardConfirm(true)
      } else if (step !== 'checkout') {
        close()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, close, step, order, payment])

  // === GLOBITO AMIGABLE — toast a los 30s de inactividad en cart ===
  // Regla UX: 'toast-dismiss' auto-dismiss 3-5s, 'empty-states' helpful message + action
  const hasUnsavedData = () => {
    return Boolean(
      order.name || order.phone || order.address ||
      payment.cardName || payment.cardNumber ||
      order.notes || order.time === 'schedule'
    )
  }

  // El recordatorio de inactividad se maneja en <CartReminder /> (global),
  // no aquí — así funciona con el drawer abierto o cerrado.

  const deliveryFee = order.mode === 'delivery' && total < FREE_DELIVERY_THRESHOLD
    ? DELIVERY_FEE : 0
  const grandTotal = total + deliveryFee

  // Validación campo por campo (UX rule: inline-validation on blur)
  const validateField = (name: string, value: string) => {
    let e = ''
    switch (name) {
      case 'name':
        if (!value.trim()) e = 'Poné tu nombre para saber a quién entregárselas'
        break
      case 'phone':
        if (!value.trim()) e = 'Necesitamos un teléfono para avisarte'
        else if (value.replace(/\D/g, '').length < 9) e = 'Faltan dígitos (mínimo 9)'
        break
      case 'address':
        if (order.mode === 'delivery' && !value.trim()) e = 'Sin dirección no llegamos'
        break
      case 'scheduledTime':
        if (order.time === 'schedule' && !value) e = 'Elegí una hora'
        break
      case 'cardName':
        if (payment.method === 'card' && !value.trim()) e = 'Como figura en la tarjeta'
        break
      case 'cardNumber':
        if (payment.method === 'card') {
          const d = value.replace(/\s/g, '')
          if (d.length < 13 || d.length > 19) e = 'El número está incompleto'
        }
        break
      case 'expiry':
        if (payment.method === 'card' && !/^\d{2}\s*\/\s*\d{2}$/.test(value))
          e = 'Formato MM / AA'
        break
      case 'cvv':
        if (payment.method === 'card' && !/^\d{3,4}$/.test(value))
          e = '3 o 4 dígitos del reverso'
        break
    }
    setErrors((prev) => ({ ...prev, [name]: e }))
    return !e
  }

  const validateAll = () => {
    const checks: [string, string][] = [
      ['name', order.name],
      ['phone', order.phone],
    ]
    if (order.mode === 'delivery') checks.push(['address', order.address])
    if (order.time === 'schedule') checks.push(['scheduledTime', order.scheduledTime])
    if (payment.method === 'card') {
      checks.push(['cardName', payment.cardName])
      checks.push(['cardNumber', payment.cardNumber])
      checks.push(['expiry', payment.expiry])
      checks.push(['cvv', payment.cvv])
    }
    let ok = true
    const newErrors: Record<string, string> = {}
    for (const [n, v] of checks) {
      validateField(n, v)
      // Check if has error
      let e = ''
      switch (n) {
        case 'name': if (!v.trim()) e = 'required'; break
        case 'phone': if (!v.trim() || v.replace(/\D/g, '').length < 9) e = 'required'; break
        case 'address': if (order.mode === 'delivery' && !v.trim()) e = 'required'; break
        case 'scheduledTime': if (order.time === 'schedule' && !v) e = 'required'; break
        case 'cardName': if (payment.method === 'card' && !v.trim()) e = 'required'; break
        case 'cardNumber': if (payment.method === 'card') { const d = v.replace(/\s/g, ''); if (d.length < 13 || d.length > 19) e = 'required'; } break
        case 'expiry': if (payment.method === 'card' && !/^\d{2}\s*\/\s*\d{2}$/.test(v)) e = 'required'; break
        case 'cvv': if (payment.method === 'card' && !/^\d{3,4}$/.test(v)) e = 'required'; break
      }
      if (e) ok = false
    }
    return ok
  }

  const handleConfirm = async () => {
    setShowErrors(true)
    if (!validateAll()) {
      // UX rule: focus-management — auto-focus primer error
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find((k) => errors[k])
        if (firstErrorField && errorRefs.current[firstErrorField]) {
          errorRefs.current[firstErrorField]?.focus()
          errorRefs.current[firstErrorField]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      return
    }
    // UX rule: submit-feedback — loading then success
    setSubmitting(true)

    try {
      // Enviar pedido real a la API → Supabase → Terminal
      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, qty }) => ({
            productId: product.id,
            name: product.name,
            qty,
            price: product.price,
          })),
          customer: {
            name: order.name,
            phone: order.phone,
            address: order.address || undefined,
          },
          modality: order.mode,
          payment: payment.method,
          scheduledTime: order.time === 'schedule' ? order.scheduledTime : undefined,
          notes: order.notes || undefined,
          total: grandTotal,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el pedido')
      }

      setSubmitting(false)
      setOrderNumber(data.orderNumber)
      setStep('success')
      // Toast de confirmación
      pushToast({
        title: '¡Pedido confirmado!',
        description: `Tu número es ${data.orderNumber}. Te avisamos cuando salga del horno.`,
        variant: 'success',
        duration: 5000,
      })
    } catch (error) {
      setSubmitting(false)
      // Mostrar error al usuario con opción de reintentar
      pushToast({
        title: 'No se pudo enviar el pedido',
        description: error instanceof Error ? error.message : 'Error desconocido. Intentá de nuevo.',
        variant: 'default',
        duration: 8000,
      })
    }
  }

  const handleFinish = () => {
    clear()
    setStep('cart')
    setOrder({
      name: '', phone: '', mode: 'pickup',
      address: '', time: 'asap', scheduledTime: '', notes: '',
    })
    setPayment({ method: 'card', cardName: '', cardNumber: '', expiry: '', cvv: '' })
    setErrors({})
    setShowErrors(false)
    close()
  }

  // ¿Mostrar error summary?
  const visibleErrors = Object.entries(errors).filter(([_, v]) => v)
  const showSummary = showErrors && visibleErrors.length > 1

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-400',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => {
          if (step === 'checkout' && hasUnsavedData()) {
            setShowDiscardConfirm(true)
          } else if (step !== 'checkout' || !submitting) {
            close()
          }
        }}
        aria-hidden="true"
      />

      <aside
        ref={drawerRef}
        className={cn(
          'fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col bg-background border-l border-border transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Tu pedido"
      >
        {/* === HEADER === */}
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedData()) setShowDiscardConfirm(true)
                  else setStep('cart')
                }}
                disabled={submitting}
                className="rounded-full border border-border p-1.5 transition-colors hover:border-foreground/40 disabled:opacity-40"
                aria-label="Volver al carrito"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="flex items-center gap-2.5 font-display text-xl font-medium tracking-tight">
              {step === 'cart' && 'Tu pedido'}
              {step === 'checkout' && 'Checkout'}
              {step === 'success' && '¡Listo!'}
              {count > 0 && step !== 'success' && (
                <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums text-primary-foreground">
                  {count}
                </span>
              )}
            </h2>
          </div>
          {step !== 'checkout' && !submitting && (
            <button
              type="button"
              onClick={close}
              className="rounded-full border border-border p-2 transition-colors hover:border-primary hover:text-primary"
              aria-label="Cerrar"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </header>

        {/* === BODY === */}
        <div className="flex-1 overflow-y-auto">
          {/* STEP: CART vacío */}
          {step === 'cart' && items.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-20 text-center">
              <SprayStar className="size-10 text-foreground/15" />
              <p className="font-display text-2xl font-medium tracking-tight">El carrito está vacío</p>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Pero arreglamos eso enseguida. Elegí tus empanadas favoritas.
              </p>
              <button
                type="button"
                onClick={close}
                className="btn-shine mt-3 rounded-full bg-primary px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.14em] text-primary-foreground transition-all duration-300 hover:brightness-110"
              >
                Ver la carta
              </button>
            </div>
          )}

          {/* STEP: CART con items */}
          {step === 'cart' && items.length > 0 && (
            <>
              {/* Stats bar */}
              <div className="border-b border-border bg-secondary/40 px-6 py-3">
                <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <span>{count} {count === 1 ? 'unidad' : 'unidades'}</span>
                  <span>Subtotal</span>
                </div>
              </div>

              <ul className="divide-y divide-border px-6">
                {items.map(({ product, qty }, i) => (
                  <li
                    key={product.id}
                    className="flex gap-4 py-4 animate-in fade-in slide-in-from-right-4 duration-400"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border">
                      <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black uppercase leading-tight tracking-tight">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">{product.tagline}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          className="text-muted-foreground/60 transition-colors hover:text-primary"
                          aria-label={`Quitar ${product.name}`}
                        >
                          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
                            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            className="flex size-8 items-center justify-center text-sm font-black transition-colors hover:text-primary"
                            aria-label={`Reducir ${product.name}`}
                          >−</button>
                          <span className="min-w-7 text-center text-sm font-black tabular-nums">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            className="flex size-8 items-center justify-center text-sm font-black transition-colors hover:text-primary"
                            aria-label={`Aumentar ${product.name}`}
                          >+</button>
                        </div>
                        <p className="text-sm font-black tabular-nums">{formatPrice(product.price * qty)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Promo envío gratis — visual progress bar */}
              {total < FREE_DELIVERY_THRESHOLD && (
                <div className="mx-6 mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3.5">
                  <p className="text-xs leading-relaxed text-accent">
                    <span className="font-black uppercase tracking-wide">Te faltan {formatPrice(FREE_DELIVERY_THRESHOLD - total)}</span>
                    {' '}para envío gratis a domicilio.
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${Math.min(100, (total / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP: CHECKOUT — todo en una pantalla */}
          {step === 'checkout' && (
            <div className="flex flex-col">
              {/* Order summary sticky */}
              <div className="sticky top-0 z-10 border-b border-border bg-secondary/95 px-6 py-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    {count} {count === 1 ? 'ud.' : 'uds.'} · {formatPrice(total)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    disabled={submitting}
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline disabled:opacity-40"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Error summary (UX rule: error-summary) */}
              {showSummary && (
                <div
                  role="alert"
                  className="mx-6 mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="8" cy="8" r="6.5" />
                      <path d="M8 5v3.5M8 11h.01" strokeLinecap="round" />
                    </svg>
                    Faltan {visibleErrors.length} campos
                  </p>
                  <ul className="mt-2 space-y-1">
                    {visibleErrors.map(([field, msg]) => (
                      <li key={field}>
                        <button
                          type="button"
                          onClick={() => {
                            errorRefs.current[field]?.focus()
                            errorRefs.current[field]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }}
                          className="text-left text-xs text-primary underline-offset-2 hover:underline"
                        >
                          → {msg}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="px-6 py-6">
                {/* === SECCIÓN 1: Modalidad === */}
                <Section title="Modalidad" step="01">
                  <div className="grid grid-cols-2 gap-3">
                    <ModeCard
                      active={order.mode === 'pickup'}
                      onClick={() => setOrder((o) => ({ ...o, mode: 'pickup' }))}
                      icon={
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7H10v7H5a1 1 0 01-1-1v-9z" strokeLinejoin="round" />
                        </svg>
                      }
                      label="Recoger en local"
                      meta={`${PICKUP_TIME} · Gratis`}
                    />
                    <ModeCard
                      active={order.mode === 'delivery'}
                      onClick={() => setOrder((o) => ({ ...o, mode: 'delivery' }))}
                      icon={
                        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" strokeLinejoin="round" />
                          <circle cx="7" cy="17" r="1.8" />
                          <circle cx="17" cy="17" r="1.8" />
                        </svg>
                      }
                      label="A domicilio"
                      meta={`${DELIVERY_TIME} · ${total >= FREE_DELIVERY_THRESHOLD ? 'Gratis' : formatPrice(DELIVERY_FEE)}`}
                    />
                  </div>
                </Section>

                {/* === SECCIÓN 2: Datos === */}
                <Section title="Tus datos" step="02">
                  <Field
                    label="Nombre"
                    required
                    name="name"
                    value={order.name}
                    onChange={(v) => setOrder((o) => ({ ...o, name: v }))}
                    onBlur={() => validateField('name', order.name)}
                    error={errors.name}
                    placeholder="Lucía Fernández"
                    autoComplete="name"
                    inputRef={(el) => { errorRefs.current['name'] = el }}
                  />
                  <Field
                    label="Teléfono"
                    required
                    name="phone"
                    type="tel"
                    value={order.phone}
                    onChange={(v) => setOrder((o) => ({ ...o, phone: v }))}
                    onBlur={() => validateField('phone', order.phone)}
                    error={errors.phone}
                    placeholder="+34 600 123 456"
                    autoComplete="tel"
                    helper="Te avisamos por SMS cuando salga del horno"
                    inputRef={(el) => { errorRefs.current['phone'] = el }}
                  />
                  {order.mode === 'delivery' && (
                    <Field
                      label="Dirección"
                      required
                      name="address"
                      value={order.address}
                      onChange={(v) => setOrder((o) => ({ ...o, address: v }))}
                      onBlur={() => validateField('address', order.address)}
                      error={errors.address}
                      placeholder="Calle, número, piso, CP"
                      autoComplete="street-address"
                      inputRef={(el) => { errorRefs.current['address'] = el }}
                    />
                  )}
                </Section>

                {/* === SECCIÓN 3: Cuándo === */}
                <Section title="Cuándo" step="03">
                  <div className="flex flex-wrap gap-2">
                    <TimePill
                      active={order.time === 'asap'}
                      onClick={() => setOrder((o) => ({ ...o, time: 'asap' }))}
                      label="Lo antes posible"
                      meta={order.mode === 'pickup' ? PICKUP_TIME : DELIVERY_TIME}
                    />
                    <TimePill
                      active={order.time === 'schedule'}
                      onClick={() => setOrder((o) => ({ ...o, time: 'schedule' }))}
                      label="Programar"
                      meta="Elegir hora"
                    />
                  </div>
                  {order.time === 'schedule' && (
                    <div className="mt-3">
                      <Field
                        label="Hora"
                        required
                        name="scheduledTime"
                        type="time"
                        value={order.scheduledTime}
                        onChange={(v) => setOrder((o) => ({ ...o, scheduledTime: v }))}
                        onBlur={() => validateField('scheduledTime', order.scheduledTime)}
                        error={errors.scheduledTime}
                        inputRef={(el) => { errorRefs.current['scheduledTime'] = el }}
                      />
                    </div>
                  )}
                </Section>

                {/* === SECCIÓN 4: Pago === */}
                <Section title="Pago" step="04">
                  <div className="flex flex-wrap gap-2">
                    <PaymentPill
                      active={payment.method === 'card'}
                      onClick={() => setPayment((p) => ({ ...p, method: 'card' }))}
                      icon={
                        <svg viewBox="0 0 24 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="1" y="2" width="22" height="14" rx="2" />
                          <path d="M1 7h22" />
                        </svg>
                      }
                      label="Tarjeta"
                    />
                    <PaymentPill
                      active={payment.method === 'cash'}
                      onClick={() => setPayment((p) => ({ ...p, method: 'cash' }))}
                      icon={
                        <svg viewBox="0 0 24 18" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="1" y="2" width="22" height="14" rx="2" />
                          <circle cx="12" cy="9" r="3.5" />
                        </svg>
                      }
                      label="Efectivo"
                    />
                  </div>

                  {payment.method === 'card' && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                      <Field
                        label="Titular"
                        required
                        name="cardName"
                        value={payment.cardName}
                        onChange={(v) => setPayment((p) => ({ ...p, cardName: v }))}
                        onBlur={() => validateField('cardName', payment.cardName)}
                        error={errors.cardName}
                        placeholder="Como figura en la tarjeta"
                        autoComplete="cc-name"
                        inputRef={(el) => { errorRefs.current['cardName'] = el }}
                      />
                      <Field
                        label="Número de tarjeta"
                        required
                        name="cardNumber"
                        value={payment.cardNumber}
                        onChange={(v) => setPayment((p) => ({ ...p, cardNumber: formatCardNumber(v) }))}
                        onBlur={() => validateField('cardNumber', payment.cardNumber)}
                        error={errors.cardNumber}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        maxLength={23}
                        inputRef={(el) => { errorRefs.current['cardNumber'] = el }}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Vencimiento"
                          required
                          name="expiry"
                          value={payment.expiry}
                          onChange={(v) => setPayment((p) => ({ ...p, expiry: formatExpiry(v) }))}
                          onBlur={() => validateField('expiry', payment.expiry)}
                          error={errors.expiry}
                          placeholder="MM / AA"
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          maxLength={7}
                          inputRef={(el) => { errorRefs.current['expiry'] = el }}
                        />
                        <Field
                          label="CVV"
                          required
                          name="cvv"
                          value={payment.cvv}
                          onChange={(v) => setPayment((p) => ({ ...p, cvv: v.replace(/\D/g, '').slice(0, 4) }))}
                          onBlur={() => validateField('cvv', payment.cvv)}
                          error={errors.cvv}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          maxLength={4}
                          helper="3-4 dígitos"
                          inputRef={(el) => { errorRefs.current['cvv'] = el }}
                        />
                      </div>
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <svg viewBox="0 0 14 14" className="size-3 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth="1.4">
                          <rect x="3" y="6" width="8" height="6" rx="1" />
                          <path d="M5 6V4a2 2 0 014 0v2" />
                        </svg>
                        Cifrado de extremo a extremo. No guardamos tus datos.
                      </p>
                    </div>
                  )}

                  {payment.method === 'cash' && (
                    <p className="mt-3 rounded-md border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
                      Pago en efectivo al {order.mode === 'pickup' ? 'recoger' : 'entregar'}. Llevá el cambio justo.
                    </p>
                  )}
                </Section>

                {/* === SECCIÓN 5: Notas === */}
                <Section title="Notas" step="05" optional>
                  <textarea
                    value={order.notes}
                    onChange={(e) => setOrder((o) => ({ ...o, notes: e.target.value }))}
                    rows={2}
                    placeholder="Sin cebolla, picante aparte, llamar al llegar…"
                    className="w-full resize-none border-b border-border bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary"
                  />
                </Section>
              </div>
            </div>
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative flex size-20 items-center justify-center">
                <svg viewBox="0 0 80 80" className="absolute inset-0 size-full text-primary/30" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                  <circle cx="40" cy="40" r="38" strokeDasharray="4 3" />
                </svg>
                <div className="flex size-14 items-center justify-center rounded-full bg-primary">
                  <svg viewBox="0 0 24 24" className="size-7 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                  Pedido confirmado
                </p>
                <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">
                  ¡Gracias, {order.name.split(' ')[0] || 'piloto'}!
                </h3>
              </div>

              <div className="w-full rounded-lg border border-border bg-secondary/50 p-4 text-left">
                <Row label="Nº de pedido" value={orderNumber} mono />
                <Row label="Modalidad" value={order.mode === 'pickup' ? 'Recoger en local' : 'Entrega a domicilio'} />
                <Row
                  label="Cuándo"
                  value={
                    order.time === 'asap'
                      ? order.mode === 'pickup' ? PICKUP_TIME : DELIVERY_TIME
                      : order.scheduledTime
                  }
                />
                {payment.method === 'cash' && <Row label="Pago" value="Efectivo al recoger" />}
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-black">
                  <span>Total</span>
                  <span className="tabular-nums text-primary">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {order.notes && (
                <p className="w-full text-xs text-muted-foreground">
                  <span className="font-bold uppercase tracking-wide">Notas: </span>
                  {order.notes}
                </p>
              )}

              <p className="text-xs text-muted-foreground">Te avisamos por SMS cuando salga del horno.</p>
            </div>
          )}
        </div>

        {/* === FOOTER === */}
        {step === 'cart' && items.length > 0 && (
          <footer className="border-t border-border bg-background px-6 py-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Subtotal</p>
                <p className="font-display text-3xl font-medium tabular-nums">{formatPrice(total)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('¿Vaciar el carrito?')) {
                    clear()
                    close()
                  }
                }}
                className="mb-1 rounded-md border border-destructive/40 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-destructive transition-colors hover:bg-destructive hover:text-white"
              >
                Vaciar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="btn-shine w-full rounded-full bg-primary py-4 text-sm font-black uppercase tracking-[0.16em] text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            >
              Hacer pedido →
            </button>
          </footer>
        )}

        {step === 'checkout' && (
          <footer className="border-t border-border bg-background px-6 py-5">
            <div className="mb-3 space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              {order.mode === 'delivery' && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Envío</span>
                  <span className="tabular-nums">{deliveryFee === 0 ? 'Gratis' : formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-black">
                <span>Total</span>
                <span className="font-display text-lg font-medium tabular-nums text-primary">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-shine relative w-full overflow-hidden rounded-full bg-primary py-4 text-sm font-black uppercase tracking-[0.16em] text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg viewBox="0 0 20 20" className="size-4 animate-spin" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
                    <path d="M18 10a8 8 0 00-8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  Procesando…
                </span>
              ) : (
                <span>{payment.method === 'card' ? `Pagar ${formatPrice(grandTotal)}` : 'Confirmar pedido'} →</span>
              )}
            </button>
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {payment.method === 'card' ? 'Pago seguro procesado por Stripe' : 'Confirmás y pagás al recoger'}
            </p>
          </footer>
        )}

        {step === 'success' && (
          <footer className="border-t border-border px-6 py-5">
            <button
              type="button"
              onClick={handleFinish}
              className="btn-shine w-full rounded-full bg-primary py-4 text-sm font-black uppercase tracking-[0.16em] text-primary-foreground transition-all duration-300 hover:brightness-110 active:scale-[0.99]"
            >
              Volver al inicio
            </button>
          </footer>
        )}
      </aside>

      {/* === DIALOG: Confirmar descarte === (UX rule: sheet-dismiss-confirm) */}
      {showDiscardConfirm && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowDiscardConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl border border-border bg-background p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-display text-lg font-medium tracking-tight">¿Descartar el pedido?</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Vas a perder los datos que ya cargaste.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="flex-1 rounded-full border border-border py-3 text-xs font-black uppercase tracking-[0.14em] transition-colors hover:border-foreground/40"
              >
                Seguir
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false)
                  setStep('cart')
                  close()
                }}
                className="flex-1 rounded-full bg-destructive py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:brightness-110"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------- Subcomponentes ---------- */

/** Section con título tipográfico + step number + separador */
function Section({
  title,
  step,
  optional,
  children,
}: {
  title: string
  step: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <fieldset className="mb-7 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-4 flex w-full items-baseline justify-between">
        <span className="font-display text-base font-medium tracking-tight">{title}</span>
        <span className="flex items-center gap-2">
          {optional && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/30">
              Opcional
            </span>
          )}
          <span className="font-mono text-[10px] font-bold tabular-nums tracking-[0.14em] text-accent">
            {step}
          </span>
        </span>
      </legend>
      {children}
    </fieldset>
  )
}

/** Input editorial — bottom border only, height ≥44px, label + helper + error */
function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = 'text',
  inputMode,
  autoComplete,
  maxLength,
  helper,
  required,
  inputRef,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  type?: string
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  autoComplete?: string
  maxLength?: number
  helper?: string
  required?: boolean
  inputRef?: (el: HTMLInputElement | null) => void
}) {
  return (
    <div className="mb-4">
      <label
        htmlFor={`f-${name}`}
        className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
        {required && <span className="text-primary" aria-hidden="true">*</span>}
      </label>
      <input
        ref={inputRef}
        id={`f-${name}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `e-${name}` : helper ? `h-${name}` : undefined}
        aria-required={required}
        className={cn(
          // Editorial style: bottom border only, height ≥44px
          'w-full border-0 border-b bg-transparent px-0 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/40',
          error
            ? 'border-primary'
            : 'border-border focus:border-primary',
        )}
        style={{ minHeight: '44px' }}
      />
      {/* Helper text persistente */}
      {helper && !error && (
        <p id={`h-${name}`} className="mt-1 font-mono text-[10px] text-muted-foreground/70">
          {helper}
        </p>
      )}
      {/* Error below field */}
      {error && (
        <p id={`e-${name}`} role="alert" className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-primary">
          <svg viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <circle cx="6" cy="6" r="5" />
            <path d="M6 4v2.5M6 8.5h.01" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

/** ModeCard — para pickup/delivery con icono grande */
function ModeCard({
  active,
  onClick,
  icon,
  label,
  meta,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  meta: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200',
        active
          ? 'border-primary bg-primary/5 shadow-[0_0_0_3px_oklch(0.58_0.21_29/0.15)]'
          : 'border-border hover:border-foreground/30 hover:bg-foreground/[0.02]',
      )}
      aria-pressed={active}
    >
      <span className={cn('transition-colors', active ? 'text-primary' : 'text-foreground/60')}>{icon}</span>
      <span className="text-sm font-black uppercase tracking-wide">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{meta}</span>
    </button>
  )
}

/** TimePill — horizontal para cuando */
function TimePill({
  active,
  onClick,
  label,
  meta,
}: {
  active: boolean
  onClick: () => void
  label: string
  meta: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-full border px-4 py-2.5 transition-all duration-200',
        active
          ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_oklch(0.58_0.21_29/0.18)]'
          : 'border-border hover:border-foreground/30',
      )}
      aria-pressed={active}
    >
      <span className="text-sm font-black uppercase tracking-wide">{label}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{meta}</span>
    </button>
  )
}

/** PaymentPill — compacto para método de pago */
function PaymentPill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-200',
        active
          ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_oklch(0.58_0.21_29/0.18)]'
          : 'border-border hover:border-foreground/30',
      )}
      aria-pressed={active}
    >
      <span className={cn('transition-colors', active ? 'text-primary' : 'text-foreground/60')}>{icon}</span>
      <span className="text-sm font-black uppercase tracking-wide">{label}</span>
    </button>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="mb-1 flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-bold', mono && 'font-mono text-primary')}>{value}</span>
    </div>
  )
}

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 19)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ' / ' + digits.slice(2)
}
