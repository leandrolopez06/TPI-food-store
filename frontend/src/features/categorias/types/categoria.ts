// Mismos campos que CategoriaRead del backend
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// Cuerpo de POST y PUT /categorias (CategoriaCreate y CategoriaUpdate)
export interface CategoriaPayload {
  nombre: string;
  descripcion: string | null;
}