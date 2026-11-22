from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.models import ROLE_ADMIN

router = APIRouter(prefix="/categorias", tags=["Categorías"])

SoloAdmin = Depends(require_role([ROLE_ADMIN]))


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServicioCategorias = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServicioCategorias) -> list[CategoriaRead]:
    """Lista las categorías activas (público)."""
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServicioCategorias) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=[SoloAdmin])
def crear_categoria(datos: CategoriaCreate, service: ServicioCategorias) -> CategoriaRead:
    try:
        return service.crear(datos)
    except NombreDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=[SoloAdmin])
def actualizar_categoria(categoria_id: int, datos: CategoriaUpdate, service: ServicioCategorias) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except NombreDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin])
def eliminar_categoria(categoria_id: int, service: ServicioCategorias) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)