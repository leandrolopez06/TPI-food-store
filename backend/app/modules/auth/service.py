from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import ROLE_USER, Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesIncorrectas(Exception):
    """Usuario o contraseña incorrectos (401)."""


class CuentaDesactivada(Exception):
    """El usuario existe pero está desactivado (400)."""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, datos: UserCreate) -> UserPublic:
        """Registro público: siempre crea un usuario con rol 'user'."""
        username = datos.username.strip()
        email = datos.email.strip()
        with self.uow as uow:
            if uow.usuarios.get_by_username(username) is not None:
                raise UsuarioDuplicado("Ya existe un usuario con ese username")
            if uow.usuarios.get_by_email(email) is not None:
                raise UsuarioDuplicado("Ya existe un usuario con ese email")
            usuario = Usuario(
                username=username,
                full_name=datos.full_name.strip(),
                email=email,
                hashed_password=hash_password(datos.password),
                role=ROLE_USER,
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> UserPublic:
        """Verifica las credenciales. Devuelve el usuario o lanza el error que corresponda."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesIncorrectas("Usuario o contraseña incorrectos")
            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")
            return UserPublic.model_validate(usuario)