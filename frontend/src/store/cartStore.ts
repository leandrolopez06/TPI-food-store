import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string | null;
  stock: number; // tope de unidades que se pueden pedir
}

// Datos del producto que hacen falta para armar un ítem del carrito
export type ProductoParaCarrito = Omit<ItemCarrito, "cantidad">;

interface CartState {
  items: ItemCarrito[];
  // Devuelve false si ya no se pueden agregar más unidades (tope de stock)
  agregar: (producto: ProductoParaCarrito) => boolean;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

// Carrito de compras. persist lo guarda en localStorage: sobrevive a recargar la página.
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto) => {
        const existente = get().items.find((item) => item.producto_id === producto.producto_id);
        if (existente === undefined) {
          if (producto.stock < 1) return false;
          set((estado) => ({ items: [...estado.items, { ...producto, cantidad: 1 }] }));
          return true;
        }
        if (existente.cantidad >= producto.stock) return false;
        set((estado) => ({
          items: estado.items.map((item) =>
            item.producto_id === producto.producto_id
              ? { ...item, cantidad: item.cantidad + 1, stock: producto.stock }
              : item,
          ),
        }));
        return true;
      },

      quitar: (productoId) =>
        set((estado) => ({ items: estado.items.filter((item) => item.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items: estado.items.map((item) =>
            item.producto_id === productoId
              ? { ...item, cantidad: Math.min(Math.max(cantidad, 1), Math.max(item.stock, 1)) }
              : item,
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0),
    }),
    {
      name: "food-store-cart",
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
);