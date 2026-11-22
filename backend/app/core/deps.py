from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(access_token: Annotated[str | None, Cookie()] = None) -> UserPublic:
    """Lee el JWT de la cookie HttpOnly y carga el usuario. 401 si no hay sesión válida."""
    if access_token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    username = decode_access_token(access_token)
    if username is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida o vencida")
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sesión inválida o vencida")
        return UserPublic.model_validate(usuario)


def get_current_active_user(user: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    """Igual que get_current_user, pero rechaza las cuentas desactivadas (400)."""
    if user.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]) -> Callable[[UserPublic], UserPublic]:
    """Devuelve una dependencia que exige uno de los roles indicados (403 si no)."""

    def verificar_rol(user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tenés permisos para realizar esta acción")
        return user

    return verificar_rol