import { NextRequest, NextResponse } from 'next/server'
import { supabase, NEGOCIO_ID, USUARIO_ID, PRODUCT_TO_RECETA, MODALITY_MAP, PAYMENT_MAP } from '@/lib/supabase-server'
import { empanadas } from '@/lib/products'

/**
 * POST /api/pedidos
 *
 * Crea un pedido en Supabase (tabla `pedidos` + `pedido_items`).
 * La terminal de Mala Masa lo recibe en tiempo real via Supabase Realtime.
 *
 * Seguridad:
 * - El negocio_id y usuario_id están hardcodeados server-side (no vienen del cliente)
 * - Los precios se validan contra los productos reales (no se confía en los del cliente)
 * - Rate limiting: un pedido por IP cada 30s (via Supabase, no implementado aún)
 * - RLS: requiere policy de INSERT para rol anon en pedidos y pedido_items
 */

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
}

export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json()

    // === 1. Validar datos ===
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'El pedido no tiene items' }, { status: 400 })
    }

    if (!body.customer?.name?.trim()) {
      return NextResponse.json({ error: 'Falta el nombre del cliente' }, { status: 400 })
    }

    if (!body.customer?.phone?.trim() || body.customer.phone.replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Teléfono no válido' }, { status: 400 })
    }

    if (body.modality === 'delivery' && !body.customer.address?.trim()) {
      return NextResponse.json({ error: 'Falta la dirección de entrega' }, { status: 400 })
    }

    // === 2. Validar precios contra productos reales ===
    // No confiamos en los precios del cliente — los recalculamos nosotros
    const productMap = new Map(empanadas.map(p => [p.id, p]))
    let calculatedTotal = 0

    const validatedItems: OrderItem[] = []
    for (const item of body.items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `Producto no válido: ${item.productId}` }, { status: 400 })
      }
      // Usar el precio REAL del servidor, no el del cliente
      const realPrice = product.price
      calculatedTotal += realPrice * item.qty
      validatedItems.push({
        productId: item.productId,
        name: product.name,
        qty: item.qty,
        price: realPrice,
      })
    }

    // Redondear a 2 decimales para comparar
    const calculatedRounded = Math.round(calculatedTotal * 100) / 100
    const clientRounded = Math.round(body.total * 100) / 100

    // Permitir diferencia de hasta 1€ (por descuentos manuales o redondeo)
    if (Math.abs(calculatedRounded - clientRounded) > 1) {
      return NextResponse.json(
        { error: `Total no coincide: esperado ${calculatedRounded}, recibido ${clientRounded}` },
        { status: 400 },
      )
    }

    // === 3. Generar IDs únicos ===
    const timestamp = Date.now()
    const pedidoId = `pd_web_${timestamp}`
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase()
    const orderNumber = `WEB-${randomSuffix}`

    // === 4. Construir el pedido para Supabase ===
    // Mapear observaciones: notas del cliente + marca de origen web
    const observaciones = [
      `🌐 Pedido desde web (mala-masa-web.vercel.app)`,
      `📞 ${body.customer.phone}`,
      body.customer.address ? `📍 ${body.customer.address}` : null,
      body.scheduledTime ? `🕐 Programado: ${body.scheduledTime}` : null,
      body.notes ? `📝 ${body.notes}` : null,
    ].filter(Boolean).join('\n')

    const pedido = {
      id: pedidoId,
      negocio_id: NEGOCIO_ID,
      numero: Math.floor(timestamp / 1000) % 100000, // número único basado en timestamp
      cliente_nombre: body.customer.name.trim(),
      cliente_id: null,
      estado: 'Sin tomar',
      tipo_entrega: MODALITY_MAP[body.modality],
      direccion: body.customer.address || null,
      franja_horaria: body.scheduledTime || null,
      canal_origen: 'WhatsApp', // No existe "Web" en el enum — usamos observaciones para marcar origen
      medio_pago: PAYMENT_MAP[body.payment],
      total: calculatedRounded,
      observaciones,
      usuario_id: USUARIO_ID,
      fecha_entrega: body.scheduledTime ? 'programado' : 'hoy',
    }

    // === 5. Insertar pedido ===
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

    // === 6. Insertar items del pedido ===
    const pedidoItems = validatedItems.map((item, index) => {
      const recetaId = PRODUCT_TO_RECETA[item.productId]
      return {
        id: `pi_web_${timestamp}_${index}`,
        pedido_id: pedidoId,
        receta_id: recetaId || 'r1', // fallback a r1 si no hay mapeo
        sabor: item.name,
        cantidad: item.qty,
        precio_unit: item.price,
      }
    })

    const { error: itemsError } = await supabase
      .from('pedido_items')
      .insert(pedidoItems)

    if (itemsError) {
      console.error('[api/pedidos] Error inserting items:', itemsError)
      // Intentar eliminar el pedido si los items fallaron (rollback manual)
      await supabase.from('pedidos').delete().eq('id', pedidoId)
      return NextResponse.json(
        { error: 'No se pudieron agregar los items al pedido', details: itemsError.message },
        { status: 500 },
      )
    }

    // === 7. Respuesta exitosa ===
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
