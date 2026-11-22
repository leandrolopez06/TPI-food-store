from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import ahora_utc

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROLE_USER = "user"
ROLE_ADMIN = "admin"


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=150)
    hashed_password: str
    role: str = Field(default=ROLE_USER, max_length=20)  # "user" o "admin"
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=ahora_utc)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")