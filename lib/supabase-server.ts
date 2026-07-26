import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase para uso server-side (API routes).
 * Usa la anon key — segura para exponer (es la misma que usa la terminal).
 *
 * Los valores están hardcodeados como fallback porque Vercel aún no tiene
 * las env vars configuradas. La anon key es pública por diseño (rol: anon).
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcepcffhyubfsfubqoso.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZXBjZmZoeXViZnNmdWJxb3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTkzMzQsImV4cCI6MjA5OTE3NTMzNH0.x66IQFAXcFPC_lmZVzzFxyLdmFT9O7vTT8KplH36mCM'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('[supabase-server] Using hardcoded fallback values. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
