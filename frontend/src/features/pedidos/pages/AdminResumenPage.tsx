import { ResumenCard } from "@/features/pedidos/components/ResumenCard";
import { useResumenPedidos } from "@/features/pedidos/hooks/useResumenPedidos";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/EstadoError";
import { Skeleton } from "@/shared/components/Skeleton";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Resumen de pedidos</h2>

      {isPending && (
        <div role="status" aria-label="Cargando resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, indice) => (
            <Card key={indice} className="space-y-3 p-5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/3" />
            </Card>
          ))}
        </div>
      )}

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}

      {data !== undefined && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={data.pendientes} tono="amber" descripcion="Esperando que los prepares" />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} tono="blue" descripcion="En la cocina" />
          <ResumenCard titulo="Entregados" valor={data.entregados} tono="green" descripcion="Pedidos completados" />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} tono="red" descripcion="Con el stock restituido" />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} tono="orange" />
          <ResumenCard
            titulo="Ingresos"
            valor={formatearPrecio(data.ingresos_entregados)}
            tono="stone"
            descripcion="Suma de los pedidos entregados"
          />
        </div>
      )}
    </section>
  );
}