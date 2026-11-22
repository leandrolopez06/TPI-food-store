from sqlalchemy.engine import make_url
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_url = make_url(settings.DATABASE_URL)
if _url.drivername == "postgresql":
    # "postgresql://..." sin driver: se usa psycopg2 (el que instala requirements.txt)
    _url = _url.set(drivername="postgresql+psycopg2")

# SQLite necesita este parámetro extra para usarse desde varios hilos de FastAPI
_connect_args = {"check_same_thread": False} if _url.drivername.startswith("sqlite") else {}

engine = create_engine(_url, connect_args=_connect_args, pool_pre_ping=True)


def create_all_tables() -> None:
    """Crea las tablas que todavía no existen (los modelos ya deben estar importados)."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Abre una sesión nueva. La usa el Unit of Work."""
    return Session(engine)