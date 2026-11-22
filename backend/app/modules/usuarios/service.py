from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    """El usuario no existe (404)."""


class UsuarioDuplicado(Exception):
    """El username o el email ya están registrados (409)."""


class AutodesactivacionNoPermitida(Exception):
    """El admin intentó desactivar su propia cuenta (400)."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: si ya estaba activo, responde igual."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"No existe el usuario {usuario_id}")
            usuario.disabled = False
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        """Idempotente: si ya estaba desactivado, responde igual."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"No existe el usuario {usuario_id}")
            if usuario.id == admin_id:
                raise AutodesactivacionNoPermitida("No podés desactivar tu propia cuenta")
            usuario.disabled = True
            return UserPublic.model_validate(usuario)