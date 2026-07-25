export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  image: string
  spice: 0 | 1 | 2 | 3
  tag?: string
}

export const empanadas: Product[] = [
  {
    id: 'carne',
    name: 'La Clásica',
    tagline: 'Roast Beef braseado al vino tinto',
    description:
      'Cebolla, Pimiento, Papa, Roast Beef Braseado al vino tinto durante 4hs.',
    price: 3.9,
    image: '/images/emp-carne.png',
    spice: 1,
    tag: 'La más pedida',
  },
  {
    id: 'picante',
    name: 'La Brava',
    tagline: 'Blend de carne picante',
    description:
      'Blend de carne molida premium, cebolla, pimientos, huevo, especias y salsa casera de ají picante.',
    price: 4.2,
    image: '/images/emp-picante.png',
    spice: 3,
    tag: 'Pica de verdad',
  },
  {
    id: 'pollo',
    name: 'La Criolla',
    tagline: 'Pollo de corral',
    description:
      'Pollo de Corral a baja temperatura, cebolla, pimiento, huevo, condimentos varios, hidratado con caldo de gallina casero.',
    price: 3.9,
    image: '/images/emp-pollo.png',
    spice: 1,
  },
  {
    id: 'jyq',
    name: 'La Fundida',
    tagline: 'Jamón y quesos',
    description:
      'Jamón cocido natural premium, con muzarella, huevo y mezcla de quesos.',
    price: 3.7,
    image: '/images/emp-jyq.png',
    spice: 0,
  },
  {
    id: 'humita',
    name: 'Humita',
    tagline: 'Humita cremosa de maíz',
    description:
      'MAÍZ RALLADO, CEBOLLA, PIMIENTO, SALSA BLANCA, QUESOS VARIOS.',
    price: 3.7,
    image: '/images/emp-humita.png',
    spice: 0,
  },
  {
    id: 'espinaca',
    name: 'Fugazzeta',
    tagline: 'Cebolla y mezcla de quesos',
    description:
      'Queso muzarella, cheddar blanco curado, provolone, cebolla caramelizada.',
    price: 3.7,
    image: '/images/emp-espinaca.png',
    spice: 0,
  },
]

export const merch: Product[] = [
  {
    id: 'tee-logo',
    name: 'Tee Script',
    tagline: 'Camiseta oversize crema',
    description: 'Algodón orgánico 240 gsm con el lettering bordado al pecho.',
    price: 32,
    image: '/images/tee-front.png',
    spice: 0,
  },
  {
    id: 'tee-spray',
    name: 'Tee Spray',
    tagline: 'Empanada a espray en la espalda',
    description: 'Serigrafía artesanal de la empanada stencil, edición numerada.',
    price: 36,
    image: '/images/tee-back.png',
    spice: 0,
    tag: 'Edición limitada',
  },
  {
    id: 'salsa',
    name: 'Salsa Ácida',
    tagline: 'Chile fermentado, ajo y lima',
    description: 'Nuestra sour sauce de la casa embotellada. Brillante, ácida y adictiva. 207 ml.',
    price: 9.5,
    image: '/images/salsa-acida.png',
    spice: 2,
  },
]

export function formatPrice(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(n)
}
