import { useState } from "react";
import { PedidoDetalle } from "@/features/pedidos/components/PedidoDetalle";
import { TablaPedidos } from "@/features/pedidos/components/TablaPedidos";
import { useCambiarEstadoPedido } from "@/features/pedidos/hooks/useCambiarEstadoPedido";
import { usePedidos } from "@/features/pedidos/hooks/usePedidos";
import type { EstadoPedido, Pedido } from "@/features/pedidos/types/pedido";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import { Confirmar } from "@/shared/components/Confirmar";
import { EstadoError } from "@/shared/components/EstadoError";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { Paginacion } from "@/shared/components/Paginacion";
import { SkeletonTabla } from "@/shared/components/SkeletonTabla";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Modal } from "@/shared/ui/Modal";
import { Select } from "@/shared/ui/Select";

const PEDIDOS_POR_PAGINA = 10;
const ESTADOS: { valor: EstadoPedido; texto: string }[] = [
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregado" },
  { valor: "CANCELADO", texto: "Cancelado" },
];

type Ventana = { tipo: "detalle"; pedido: Pedido } | { tipo: "cancelar"; pedido: Pedido } | null;

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [pagina, setPagina] = useState(1);
  const [ventana, setVentana] = useState<Ventana>(null);

  const cambiarEstado = useCambiarEstadoPedido();
  const usuarios = useUsuarios(); // para mostrar el nombre del cliente en vez de su id
  const { data, isPending, isError, error, refetch, isPlaceholderData } = usePedidos({
    estado: estado === "" ? undefined : estado,
    skip: (pagina - 1) * PEDIDOS_POR_PAGINA,
    limit: PEDIDOS_POR_PAGINA,
  });
  const totalPaginas = data === undefined ? 1 : Math.max(Math.ceil(data.total / PEDIDOS_POR_PAGINA), 1);

  const nombreDeUsuario = (usuarioId: number): string =>
    usuarios.data?.find((usuario) => usuario.id === usuarioId)?.username ?? `Usuario #${usuarioId}`;

  const pedirCambio = (pedido: Pedido, destino: EstadoPedido) => {
    // Cancelar pide confirmación (restituye el stock); el resto de los cambios se aplica directo
    if (destino === "CANCELADO") {
      setVentana({ tipo: "cancelar", pedido });
    } else {
      cambiarEstado.mutate({ id: pedido.id, estado: destino });
    }
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-bold">Pedidos</h2>
        <div className="w-56">
          <Select
            etiqueta="Filtrar por estado"
            name="filtro-estado"
            value={estado}
            onChange={(evento) => {
              setEstado(evento.target.value as EstadoPedido | "");
              setPagina(1);
            }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isPending && <SkeletonTabla />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data !== undefined && data.items.length === 0 && (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion={estado === "" ? "Todavía no se hizo ningún pedido." : "Ningún pedido tiene ese estado."}
        />
      )}
      {data !== undefined && data.items.length > 0 && (
        <div className={`transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
          <TablaPedidos
            pedidos={data.items}
            nombreDeUsuario={nombreDeUsuario}
            ocupado={cambiarEstado.isPending}
            onVerDetalle={(pedido) => setVentana({ tipo: "detalle", pedido })}
            onCambiarEstado={pedirCambio}
          />
        </div>
      )}
      {data !== undefined && data.total > 0 && (
        <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
      )}

      {ventana?.tipo === "detalle" && (
        <Modal titulo={`Pedido #${ventana.pedido.id}`} onCerrar={() => setVentana(null)}>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-stone-500">Cliente: {nombreDeUsuario(ventana.pedido.usuario_id)}</span>
            <BadgeEstado estado={ventana.pedido.estado} />
          </div>
          <PedidoDetalle pedido={ventana.pedido} />
        </Modal>
      )}
      {ventana?.tipo === "cancelar" && (
        <Confirmar
          titulo="Cancelar pedido"
          mensaje={`¿Cancelar el pedido #${ventana.pedido.id}? Los productos vuelven al stock y no se puede deshacer.`}
          textoConfirmar="Cancelar pedido"
          cargando={cambiarEstado.isPending}
          onCancelar={() => setVentana(null)}
          onConfirmar={() =>
            cambiarEstado.mutate(
              { id: ventana.pedido.id, estado: "CANCELADO" },
              { onSuccess: () => setVentana(null) },
            )
          }
        />
      )}
    </section>
  );
}