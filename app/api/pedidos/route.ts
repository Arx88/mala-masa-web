import { NextRequest, NextResponse } from 'next/server'
import { supabase, NEGOCIO_ID, USUARIO_ID, PRODUCT_TO_RECETA, MODALITY_MAP, PAYMENT_MAP } from '@/lib/supabase-server'
import { empanadas } from '@/lib/products'

/**
 * POST /api/pedidos
 *
 * Crea un pedido en Supabase (tabla `pedidos` + `pedido_items`).
 * La terminal de Mala Masa lo recibe en tiempo real via Supabase Realtime.
 *
 * Seguridad implementada:
 * 1. Rate limiting por IP — max 1 pedido cada 60s por IP
 * 2. Anti-duplicado — bloquea si hay pedido pendiente del mismo teléfono en 5 min
 * 3. Honeypot — campo oculto que bots llenan pero humanos no
 * 4. Validación de precios server-side — no se confía en los del cliente
 * 5. negocio_id hardcodeado — no se puede atacar otros negocios
 * 6. Límite de items — máximo 50 empanadas por pedido
 * 7. Sanitización de texto — previene inyección en observaciones
 */

// === Rate limiting en memoria (por IP) ===
// En Vercel serverless, esto funciona por instancia (no es perfecto pero
// bloquea la mayoría de spam). Para producción con mucho tráfico, usar
// Vercel KV o Upstash Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 60 segundos
const RATE_LIMIT_MAX = 1 // 1 pedido por IP cada 60s

type OrderItem = {
  productId: string
  name: string
  qty: number
  price: number
}

type OrderRequest = {
  items: OrderItem[]
  customer: {
    name: string
    phone: string
    address?: string
  }
  modality: 'pickup' | 'delivery'
  payment: 'card' | 'cash'
  scheduledTime?: string
  notes?: string
  total: number
  // Honeypot — campo oculto que bots llenan automáticamente
  website?: string
}

// Sanitizar texto para prevenir inyección en observaciones
function sanitize(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, '') // caracteres de control
    .replace(/<[^>]*>/g, '') // tags HTML
    .trim()
    .slice(0, 500) // máximo 500 caracteres
}

export async function POST(request: NextRequest) {
  try {
    // === 0. RATE LIMITING por IP ===
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const now = Date.now()
    const ipData = rateLimitMap.get(ip)

    if (ipData) {
      const elapsed = now - ipData.lastReset
      if (elapsed < RATE_LIMIT_WINDOW) {
        if (ipData.count >= RATE_LIMIT_MAX) {
          const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW - elapsed) / 1000)
          return NextResponse.json(
            { error: `Demasiados pedidos. Esperá ${waitSeconds}s antes de intentar de nuevo.` },
            { status: 429 },
          )
        }
        ipData.count++
      } else {
        // Reset window
        ipData.count = 1
        ipData.lastReset = now
      }
    } else {
      rateLimitMap.set(ip, { count: 1, lastReset: now })
    }

    // Limpiar IPs viejas del mapa (cada ~100 requests)
    if (rateLimitMap.size > 100) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now - val.lastReset > RATE_LIMIT_WINDOW * 5) {
          rateLimitMap.delete(key)
        }
      }
    }

    const body: OrderRequest = await request.json()

    // === 1. HONEYPOT — si el campo oculto "website" tiene valor, es un bot ===
    if (body.website) {
      // Pretender que funcionó para no alertar al bot
      return NextResponse.json({ success: true, orderId: 'bot-trapped', orderNumber: 'BOT-0000' })
    }

    // === 2. Validar datos básicos ===
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'El pedido no tiene items' }, { status: 400 })
    }

    // Límite de items — máximo 50 empanadas por pedido
    const totalQty = body.items.reduce((sum, item) => sum + item.qty, 0)
    if (totalQty > 50) {
      return NextResponse.json({ error: 'Máximo 50 empanadas por pedido' }, { status: 400 })
    }

    if (!body.customer?.name?.trim() || body.customer.name.trim().length < 2) {
      return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 })
    }

    const phoneDigits = body.customer.phone?.replace(/\D/g, '') || ''
    if (phoneDigits.length < 9) {
      return NextResponse.json({ error: 'Teléfono no válido' }, { status: 400 })
    }

    if (body.modality === 'delivery' && !body.customer.address?.trim()) {
      return NextResponse.json({ error: 'Falta la dirección de entrega' }, { status: 400 })
    }

    // === 3. ANTI-DUPLICADO — verificar si hay pedido pendiente del mismo teléfono ===
    // Buscar pedidos con el mismo teléfono en los últimos 5 minutos
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString()
    const { data: recentOrders } = await supabase
      .from('pedidos')
      .select('id, creado_en, observaciones')
      .eq('negocio_id', NEGOCIO_ID)
      .gte('creado_en', fiveMinAgo)

    if (recentOrders && recentOrders.length > 0) {
      // Verificar si alguno tiene el mismo teléfono en observaciones
      const phoneInObservations = recentOrders.some(order =>
        order.observaciones?.includes(phoneDigits)
      )
      if (phoneInObservations) {
        return NextResponse.json(
          { error: 'Ya tenés un pedido reciente. Esperá 5 minutos antes de hacer otro.' },
          { status: 409 },
        )
      }
    }

    // === 4. Validar precios contra productos reales ===
    const productMap = new Map(empanadas.map(p => [p.id, p]))
    let calculatedTotal = 0

    const validatedItems: OrderItem[] = []
    for (const item of body.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Producto no válido: ${item.productId}` }, { status: 400 })
      }
      const realPrice = product.price
      calculatedTotal += realPrice * item.qty
      validatedItems.push({
        productId: item.productId,
        name: product.name,
        qty: item.qty,
        price: realPrice,
      })
    }

    const calculatedRounded = Math.round(calculatedTotal * 100) / 100
    const clientRounded = Math.round(body.total * 100) / 100

    if (Math.abs(calculatedRounded - clientRounded) > 1) {
      return NextResponse.json(
        { error: `Total no coincide: esperado ${calculatedRounded}, recibido ${clientRounded}` },
        { status: 400 },
      )
    }

    // === 5. Generar IDs únicos ===
    const timestamp = Date.now()
    const pedidoId = `pd_web_${timestamp}`
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    const orderNumber = `WEB-${randomSuffix}`

    // === 6. Construir el pedido (todo sanitizado) ===
    const observaciones = [
      `🌐 Pedido desde web (mala-masa-web.vercel.app)`,
      `📞 ${sanitize(phoneDigits)}`,
      body.customer.address ? `📍 ${sanitize(body.customer.address)}` : null,
      body.scheduledTime ? `🕐 Programado: ${sanitize(body.scheduledTime)}` : null,
      body.notes ? `📝 ${sanitize(body.notes)}` : null,
    ].filter(Boolean).join('\n')

    const pedido = {
      id: pedidoId,
      negocio_id: NEGOCIO_ID,
      numero: Math.floor(timestamp / 1000) % 100000,
      cliente_nombre: sanitize(body.customer.name),
      cliente_id: null,
      estado: 'Sin tomar',
      tipo_entrega: MODALITY_MAP[body.modality],
      direccion: body.customer.address ? sanitize(body.customer.address) : null,
      franja_horaria: body.scheduledTime ? sanitize(body.scheduledTime) : null,
      canal_origen: 'WhatsApp',
      medio_pago: PAYMENT_MAP[body.payment],
      total: calculatedRounded,
      observaciones,
      usuario_id: USUARIO_ID,
      fecha_entrega: body.scheduledTime ? 'programado' : 'hoy',
    }

    // === 7. Insertar pedido ===
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert(pedido)
      .select()
      .single()

    if (pedidoError) {
      console.error('[api/pedidos] Error inserting pedido:', pedidoError)
      return NextResponse.json(
        { error: 'No se pudo crear el pedido', details: pedidoError.message },
        { status: 500 },
      )
    }

    // === 8. Insertar items del pedido ===
    const pedidoItems = validatedItems.map((item, index) => {
      const recetaId = PRODUCT_TO_RECETA[item.productId]
      return {
        id: `pi_web_${timestamp}_${index}`,
        pedido_id: pedidoId,
        receta_id: recetaId || 'r1',
        sabor: sanitize(item.name),
        cantidad: item.qty,
        precio_unit: item.price,
      }
    })

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(pedidoItems)

    if (itemsError) {
      console.error('[api/pedidos] Error inserting items:', itemsError)
      await supabase.from('pedidos').delete().eq('id', pedidoId)
      return NextResponse.json(
        { error: 'No se pudieron agregar los items al pedido', details: itemsError.message },
        { status: 500 },
      )
    }

    // === 9. Respuesta exitosa ===
    return NextResponse.json({
      success: true,
      orderId: pedidoId,
      orderNumber,
      total: calculatedRounded,
      message: 'Pedido enviado a la terminal',
    })
  } catch (error) {
    console.error('[api/pedidos] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    )
  }
}
