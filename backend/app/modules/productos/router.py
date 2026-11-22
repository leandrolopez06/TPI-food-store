from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import ROLE_ADMIN

router = APIRouter(prefix="/productos", tags=["Productos"])

SoloAdmin = Depends(require_role([ROLE_ADMIN]))


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServicioProductos = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServicioProductos,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(description="Texto a buscar en el nombre")] = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
) -> ProductosPaginados:
    """Lista los productos activos, paginados (público)."""
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServicioProductos) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=[SoloAdmin])
def crear_producto(datos: ProductoCreate, service: ServicioProductos) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=[SoloAdmin])
def actualizar_producto(producto_id: int, datos: ProductoUpdate, service: ServicioProductos) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=[SoloAdmin])
def actualizar_stock(producto_id: int, datos: ProductoStockUpdate, service: ServicioProductos) -> ProductoRead:
    """Cambia el stock y/o la disponibilidad de un producto."""
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin])
def eliminar_producto(producto_id: int, service: ServicioProductos) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)