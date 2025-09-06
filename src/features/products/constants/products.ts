import type { Product, ProductType } from "@/features/products/types/product.types";

export const PRODUCTS: Record<ProductType, Product> = {
  cola: {
    id: "cola",
    name: "콜라",
    price: 1100,
    stock: 5,
  },
  water: {
    id: "water",
    name: "물",
    price: 600,
    stock: 5,
  },
  coffee: {
    id: "coffee",
    name: "커피",
    price: 700,
    stock: 5,
  },
};
