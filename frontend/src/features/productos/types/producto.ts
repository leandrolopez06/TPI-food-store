import type { Categoria } from "@/features/categorias/types/categoria";

// Mismos campos que ProductoRead del backend
export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria: Categoria | null;
}

// Respuesta de GET /productos (ProductosPaginados)
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

// Parámetros de consulta de GET /productos
export interface FiltrosProductos {
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
  skip?: number;
  limit?: number;
}

// Cuerpo de POST y PUT /productos (ProductoCreate y ProductoUpdate)
export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

// Cuerpo de PATCH /productos/{id}/stock (ProductoStockUpdate)
export interface StockPayload {
  stock?: number;
  disponible?: boolean;
}