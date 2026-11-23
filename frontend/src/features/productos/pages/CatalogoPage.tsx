import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { ProductoCard } from "@/features/productos/components/ProductoCard";
import { useProductos } from "@/features/productos/hooks/useProductos";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

const PRODUCTOS_POR_PAGINA = 8;

// Los filtros viven en la URL (?q=...&categoria=...&pagina=...): se pueden compartir y
// sobreviven a recargar la página.
function leerNumero(valor: string | null): number | undefined {
  if (valor === null) return undefined;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : undefined;
}

export function CatalogoPage() {
  const [params, setParams] = useSearchParams();
  const busqueda = params.get("q") ?? "";
  const categoriaId = leerNumero(params.get("categoria"));
  const pagina = leerNumero(params.get("pagina")) ?? 1;

  const [texto, setTexto] = useState(busqueda);

  const categorias = useCategorias();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    search: busqueda === "" ? undefined : busqueda,
    categoria_id: categoriaId,
    skip: (pagina - 1) * PRODUCTOS_POR_PAGINA,
    limit: PRODUCTOS_POR_PAGINA,
  });

  // Cambia los filtros de la URL; al cambiar la búsqueda o la categoría vuelve a la página 1
  const actualizarFiltros = (cambios: { q?: string; categoria?: number | null; pagina?: number }) => {
    const siguiente = new URLSearchParams(params);
    if (cambios.q !== undefined) {
      if (cambios.q === "") siguiente.delete("q");
      else siguiente.set("q", cambios.q);
    }
    if (cambios.categoria !== undefined) {
      if (cambios.categoria === null) siguiente.delete("categoria");
      else siguiente.set("categoria", String(cambios.categoria));
    }
    if (cambios.pagina !== undefined && cambios.pagina > 1) {
      siguiente.set("pagina", String(cambios.pagina));
    } else {
      siguiente.delete("pagina");
    }
    setParams(siguiente);
  };

  const hayFiltros = busqueda !== "" || categoriaId !== undefined;
  const totalPaginas = data === undefined ? 1 : Math.max(Math.ceil(data.total / PRODUCTOS_POR_PAGINA), 1);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Nuestro menú</h1>
        <p className="text-stone-500">Elegí tus favoritos y armá tu pedido.</p>
      </div>

      <Card className="mb-6 p-4">
        <form
          role="search"
          className="flex flex-wrap gap-3"
          onSubmit={(evento) => {
            evento.preventDefault();
            actualizarFiltros({ q: texto.trim(), pagina: 1 });
          }}
        >
          <input
            type="search"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            placeholder="Buscar productos por nombre..."
            aria-label="Buscar productos"
            className="min-w-60 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
          <Button type="submit">Buscar</Button>
          {hayFiltros && (
            <Button
              variante="ghost"
              onClick={() => {
                setTexto("");
                setParams(new URLSearchParams());
              }}
            >
              Quitar filtros
            </Button>
          )}
        </form>

        <div className="mt-4 flex flex-wrap gap-2" aria-label="Filtrar por categoría" role="group">
          <button
            type="button"
            onClick={() => actualizarFiltros({ categoria: null, pagina: 1 })}
            aria-pressed={categoriaId === undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              categoriaId === undefined
                ? "bg-orange-600 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            Todas
          </button>
          {categorias.data?.map((categoria) => (
            <button
              key={categoria.id}
              type="button"
              onClick={() => actualizarFiltros({ categoria: categoria.id, pagina: 1 })}
              aria-pressed={categoriaId === categoria.id}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                categoriaId === categoria.id
                  ? "bg-orange-600 text-white"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </Card>

      {isPending && (
        <div
          role="status"
          aria-label="Cargando productos"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: PRODUCTOS_POR_PAGINA }, (_, indice) => (
            <Card key={indice} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}

      {data !== undefined && data.items.length === 0 && (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={
            hayFiltros ? "Probá con otra búsqueda o quitá los filtros." : "Todavía no hay productos cargados."
          }
          accion={
            hayFiltros ? (
              <Button
                variante="secondary"
                onClick={() => {
                  setTexto("");
                  setParams(new URLSearchParams());
                }}
              >
                Quitar filtros
              </Button>
            ) : undefined
          }
        />
      )}

      {data !== undefined && data.items.length > 0 && (
        <div
          className={`grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
            isPlaceholderData ? "opacity-60" : ""
          }`}
        >
          {data.items.map((producto) => (
            <ProductoCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}

      {data !== undefined && data.total > 0 && (
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          onCambiar={(nueva) => actualizarFiltros({ pagina: nueva })}
        />
      )}
    </section>
  );
}