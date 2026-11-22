from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import (
    AuthService,
    CredencialesIncorrectas,
    CuentaDesactivada,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])

COOKIE_NAME = "access_token"


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServicioAuth = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def registrar(datos: UserCreate, service: ServicioAuth) -> UserPublic:
    """Registro público. Crea un usuario con rol 'user'."""
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error


@router.post("/token", response_model=MensajeRespuesta)
def login(
    formulario: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServicioAuth,
) -> MensajeRespuesta:
    """Login con formulario OAuth2 (username y password). El JWT viaja en una cookie HttpOnly."""
    try:
        usuario = service.autenticar(formulario.username, formulario.password)
    except CredencialesIncorrectas as error:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(error)) from error
    except CuentaDesactivada as error:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(error)) from error

    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(usuario.username),
        httponly=True,  # JavaScript no puede leer la cookie
        samesite="lax",
        secure=False,  # en producción con HTTPS debería ser True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response) -> MensajeRespuesta:
    """Borra la cookie de sesión."""
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return MensajeRespuesta(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(user: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
    """Datos del usuario autenticado."""
    return user