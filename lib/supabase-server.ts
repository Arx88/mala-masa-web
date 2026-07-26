import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para uso server-side (API routes).
 * Usa la anon key — segura para exponer en cliente, pero aquí la usamos
 * solo en el servidor para insertar pedidos.
 *
 * Si necesitas bypass RLS, usa SUPABASE_SERVICE_ROLE_KEY en su lugar
 * (NO la expongas nunca al cliente).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase-server] Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Constantes del negocio (server-side, no expuestas al cliente)
export const NEGOCIO_ID = '6d7ca83f-f321-421c-bfe2-7ee13e3f3734'
export const USUARIO_ID = 'u_7f14f111'

/**
 * Mapeo de product IDs del sitio web → receta_ids de la terminal.
 * Esto permite que los items del pedido se inserten con el receta_id
 * correcto que la terminal espera.
 */
export const PRODUCT_TO_RECETA: Record<string, string> = {
  carne: 'r1',      // La Clásica → Carne cortada a cuchillo
  picante: 'r6',    // La Brava → Carne picante
  pollo: 'r2',      // La Criolla → Pollo criollo
  jyq: 'r3',        // La Fundida → Jamón y queso
  humita: 'r8',     // Humita → Humita vegana
  espinaca: 'r4',   // Fugazzeta → Verdura (espinaca y queso)
}

/**
 * Mapeo de modalidades del web → enums de la terminal
 */
export const MODALITY_MAP = {
  pickup: 'Pickup',
  delivery: 'Delivery propio',
} as const

/**
 * Mapeo de métodos de pago del web → enums de la terminal
 */
export const PAYMENT_MAP = {
  card: 'Transferencia',    // Tarjeta → Transferencia (más cercano)
  cash: 'Efectivo',
} as const
