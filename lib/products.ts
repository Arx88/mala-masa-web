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
    tagline: 'Carne cortada a cuchillo',
    description:
      'Ternera cortada a cuchillo, aceituna, huevo y comino. La que te enseñó tu abuela, pero con más actitud.',
    price: 3.9,
    image: '/images/emp-carne.png',
    spice: 1,
    tag: 'La más pedida',
  },
  {
    id: 'picante',
    name: 'La Brava',
    tagline: 'Carne picante y ají fermentado',
    description:
      'Ternera braseada, ají amarillo fermentado y un golpe de chile de árbol. No pide perdón.',
    price: 4.2,
    image: '/images/emp-picante.png',
    spice: 3,
    tag: 'Pica de verdad',
  },
  {
    id: 'pollo',
    name: 'La Criolla',
    tagline: 'Pollo braseado al chimichurri',
    description:
      'Pollo de corral desmechado, pimiento asado y cebolla caramelizada. Jugosa hasta el último bocado.',
    price: 3.9,
    image: '/images/emp-pollo.png',
    spice: 1,
  },
  {
    id: 'jyq',
    name: 'La Fundida',
    tagline: 'Jamón y muzza que estira',
    description:
      'Muzzarella que se estira medio metro y jamón cocido braseado. Sin trucos, solo queso del bueno.',
    price: 3.7,
    image: '/images/emp-jyq.png',
    spice: 0,
  },
  {
    id: 'humita',
    name: 'La Dulce',
    tagline: 'Humita cremosa de choclo',
    description:
      'Crema de maíz dulce, cebolla pochada y un toque de albahaca. La favorita de quien dice que no le gustan las empanadas.',
    price: 3.7,
    image: '/images/emp-humita.png',
    spice: 0,
  },
  {
    id: 'espinaca',
    name: 'La Verde',
    tagline: 'Espinaca y ricotta ahumada',
    description:
      'Espinaca fresca, ricotta ahumada en casa y nuez moscada. Verde por fuera del asunto, seria por dentro.',
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
