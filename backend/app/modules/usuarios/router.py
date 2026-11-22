from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import ROLE_ADMIN
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutodesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

Admin = Annotated[UserPublic, Depends(require_role([ROLE_ADMIN]))]


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServicioUsuarios = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_admin: Admin, service: ServicioUsuarios) -> list[UserPublic]:
    """Lista todos los usuarios, incluidos los desactivados."""
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, _admin: Admin, service: ServicioUsuarios) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: Admin, service: ServicioUsuarios) -> UserPublic:
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as error:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(error)) from error
    except AutodesactivacionNoPermitida as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error)) from error