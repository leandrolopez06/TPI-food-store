from datetime import datetime

from app.core.utils import ahora_utc
from app.modules.pedidos.models import (
    CANCELADO,
    EN_PREPARACION,
    ENTREGADO,
    PENDIENTE,
    DetallePedido,
    Pedido,
)
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import ROLE_ADMIN
from app.modules.usuarios.schemas import UserPublic

# Máquina de estados (RN-02): cada estado y los estados a los que puede pasar
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),  # terminal
    CANCELADO: set(),  # terminal
}


class PedidoNoEncontrado(Exception):
    """El pedido no existe (404)."""


class PedidoAjeno(Exception):
    """El pedido es de otro usuario (403)."""


class StockInsuficiente(Exception):
    """No hay stock suficiente para la cantidad pedida (400)."""


class ProductoNoDisponible(Exception):
    """El producto está marcado como no disponible (400)."""


class ProductoRepetido(Exception):
    """El mismo producto aparece dos veces entre los ítems (400)."""


class TransicionInvalida(Exception):
    """El pedido no puede pasar a ese estado (400)."""


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear el pedido desde el carrito ----------
    def crear(self, datos: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        ids = [item.producto_id for item in datos.items]
        if len(set(ids)) != len(ids):
            raise ProductoRepetido("No puede haber productos repetidos en el pedido")

        # Todo ocurre dentro de una sola transacción: si algo falla, no se guarda nada
        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario.id,
                estado=PENDIENTE,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega.strip(),
                notas=datos.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"No existe el producto {item.producto_id}")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto «{producto.nombre}» no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente de «{producto.nombre}»: quedan {producto.stock}")

                producto.stock -= item.cantidad  # descuenta el stock
                subtotal = round(producto.precio_base * item.cantidad, 2)
                pedido.items.append(  # línea con copia del nombre y del precio
                    DetallePedido(
                        producto_id=item.producto_id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            return PedidoRead.model_validate(pedido)

    # ---------- Consultas ----------
    def listar(self, usuario: UserPublic, estado: str | None, skip: int, limit: int) -> PedidosPaginados:
        """El admin ve todos los pedidos; un user, solo los suyos (RN-04)."""
        with self.uow as uow:
            if usuario.role == ROLE_ADMIN:
                pedidos, total = uow.pedidos.list_todos(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"No existe el pedido {pedido_id}")
            if usuario.role != ROLE_ADMIN and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Ese pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            # "Hoy" = desde las 00:00 de la hora local del servidor
            inicio_del_dia = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get(PENDIENTE, 0),
                en_preparacion=por_estado.get(EN_PREPARACION, 0),
                entregados=por_estado.get(ENTREGADO, 0),
                cancelados=por_estado.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=round(uow.pedidos.sum_total_entregados(), 2),
            )

    # ---------- RN-02 y RN-03: cambios de estado ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Lo usa el admin para avanzar o cancelar un pedido."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"No existe el pedido {pedido_id}")
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Lo usa el cliente dueño: solo puede cancelar un pedido propio en PENDIENTE."""
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(f"No existe el pedido {pedido_id}")
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("Ese pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # Se valida ANTES de modificar el pedido
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {nuevo_estado}")
        if nuevo_estado == CANCELADO:
            # RN-03: al cancelar se devuelve el stock de cada línea, en la misma transacción
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = ahora_utc()