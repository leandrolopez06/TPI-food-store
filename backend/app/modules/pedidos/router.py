from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import ROLE_ADMIN
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

Sesion = Annotated[UserPublic, Depends(get_current_active_user)]
SoloAdmin = Depends(require_role([ROLE_ADMIN]))


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServicioPedidos = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, usuario: Sesion, service: ServicioPedidos) -> PedidoRead:
    """Crea el pedido desde el carrito: valida, descuenta el stock y guarda todo junto (RN-01)."""
    try:
        return service.crear(datos, usuario)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error)) from error


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: Sesion,
    service: ServicioPedidos,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
) -> PedidosPaginados:
    """Un user ve sus pedidos; un admin, todos."""
    return service.listar(usuario, estado, skip, limit)


# Va ANTES de "/{pedido_id}", si no FastAPI intentaría leer "resumen" como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=[SoloAdmin])
def resumen_pedidos(service: ServicioPedidos) -> ResumenPedidos:
    """Indicadores del panel de administración."""
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: Sesion, service: ServicioPedidos) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(error)) from error


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[SoloAdmin])
def cambiar_estado(pedido_id: int, datos: CambioEstado, service: ServicioPedidos) -> PedidoRead:
    """El admin avanza o cancela el pedido según la máquina de estados."""
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except TransicionInvalida as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error)) from error


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: Sesion, service: ServicioPedidos) -> PedidoRead:
    """El dueño cancela su pedido (solo en PENDIENTE) y se restituye el stock."""
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except PedidoAjeno as error:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(error)) from error
    except TransicionInvalida as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error)) from error