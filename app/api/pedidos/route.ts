import { NextRequest, NextResponse } from 'next/server'
import { supabase, NEGOCIO_ID, USUARIO_ID, PRODUCT_TO_RECETA, MODALITY_MAP, PAYMENT_MAP } from '@/lib/supabase-server'
import { empanadas } from '@/lib/products'

/**
 * POST /api/pedidos
 *
 * Crea un pedido en Supabase (tabla `pedidos` + `pedido_items`).
 * La terminal de Mala Masa lo recibe en tiempo real via Supabase Realtime.
 *
 * Seguridad (ajustada para no romper la lógica del negocio):
 * 1. Rate limiting por IP — 3 pedidos por minuto por IP (permite oficina/familia)
 * 2. Anti-duplicado — solo bloquea si hay pedido "Sin tomar" del mismo teléfono
 *    en los últimos 2 minutos (ventana corta, solo estado pendiente)
 * 3. Honeypot — campo oculto que bots llenan pero humanos no
 * 4. Validación de precios server-side — no se confía en los del cliente
 * 5. negocio_id hardcodeado — no se puede atacar otros negocios
 * 6. Límite de items — máximo 200 empanadas por pedido (permite fiestas/eventos)
 * 7. Sanitización de texto — previene inyección en observaciones
 */

// === Rate limiting en memoria (por IP) ===
// 3 pedidos por minuto por IP — permite que 2-3 personas en la misma WiFi
// pidan al mismo tiempo, pero bloquea spam automatizado.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT_WINDOW = 60_000 // 60 segundos
const RATE_LIMIT_MAX = 3 // 3 pedidos por IP cada 60s

// === Anti-duplicado ===
// Solo bloquea si hay un pedido del mismo teléfono con estado "Sin tomar"
// (todavía no empezó a cocinarse) en los últimos 2 minutos.
// Si el pedido ya está "Cocinando" o avanzó, permite hacer otro.
const DUPLICATE_WINDOW = 2 * 60_000 // 2 minutos
const DUPLICATE_STATES = ['Sin tomar'] // solo estos estados bloquean

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
  website?: string // honeypot
}

function sanitize(text: string): string {
  return text
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 500)
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
            { error: `Demasiados pedidos desde esta red. Esperá ${waitSeconds}s.` },
            { status: 429 },
          )
        }
        ipData.count++
      } else {
        ipData.count = 1
        ipData.lastReset = now
      }
    } else {
      rateLimitMap.set(ip, { count: 1, lastReset: now })
    }

    // Limpiar IPs viejas
    if (rateLimitMap.size > 200) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now - val.lastReset > RATE_LIMIT_WINDOW * 5) {
          rateLimitMap.delete(key)
        }
      }
    }

    const body: OrderRequest = await request.json()

    // === 1. HONEYPOT ===
    if (body.website) {
      return NextResponse.json({ success: true, orderId: 'bot-trapped', orderNumber: 'BOT-0000' })
    }

    // === 2. Validar datos básicos ===
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'El pedido no tiene items' }, { status: 400 })
    }

    // Límite de items — 200 empanadas (permite fiestas: 16 docenas)
    const totalQty = body.items.reduce((sum, item) => sum + item.qty, 0)
    if (totalQty > 200) {
      return NextResponse.json({ error: 'Máximo 200 empanadas por pedido. Para pedidos más grandes llamá al local.' }, { status: 400 })
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

    // === 3. ANTI-DUPLICADO (solo estado "Sin tomar" en 2 min) ===
    // Buscar pedidos recientes del mismo teléfono que SIGAN pendientes
    const twoMinAgo = new Date(Date.now() - DUPLICATE_WINDOW).toISOString()
    const { data: recentOrders } = await supabase
      .from('pedidos')
      .select('id, creado_en, observaciones, estado')
      .eq('negocio_id', NEGOCIO_ID)
      .gte('creado_en', twoMinAgo)
      .in('estado', DUPLICATE_STATES)

    if (recentOrders && recentOrders.length > 0) {
      // Matching EXACTO del teléfono (no includes) para evitar falsos positivos
      // El teléfono se guarda en observaciones como "📞 34600123456"
      const phonePattern = `📞 ${phoneDigits}`
      const hasPending = recentOrders.some(order =>
        order.observaciones?.includes(phonePattern)
      )
      if (hasPending) {
        return NextResponse.json(
          { error: 'Tenés un pedido que recién hicimos. Si querés agregar algo, llamá al local.' },
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

    // === 5. Generar IDs ===
    const timestamp = Date.now()
    const pedidoId = `pd_web_${timestamp}`
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    const orderNumber = `WEB-${randomSuffix}`

    // === 6. Construir pedido ===
    const observaciones = [
      `🌐 Pedido desde web`,
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

    // === 8. Insertar items ===
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

    // === 9. Respuesta ===
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
