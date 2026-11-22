from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# bcrypt para el hash de contraseñas (passlib 1.7.4 + bcrypt 4.0.1)
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(password, hashed_password)


def create_access_token(subject: str) -> str:
    """Genera un JWT firmado. 'subject' es el username del usuario."""
    vencimiento = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": vencimiento}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Devuelve el username del token, o None si la firma es inválida o el token venció."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None