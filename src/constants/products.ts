import type { Product, ProductType } from '@/types'

export const PRODUCTS: Record<ProductType, Product> = {
  cola: {
    id: 'cola',
    name: '콜라',
    price: 1100,
    stock: 5,
    minStock: 0,
    maxStock: 10,
    available: true,
  },
  water: {
    id: 'water', 
    name: '물',
    price: 600,
    stock: 5,
    minStock: 0,
    maxStock: 10,
    available: true,
  },
  coffee: {
    id: 'coffee',
    name: '커피', 
    price: 700,
    stock: 5,
    minStock: 0,
    maxStock: 10,
    available: true,
  },
}

export const PRODUCT_IMAGES = {
  cola: '🥤',
  water: '💧', 
  coffee: '☕',
} as const