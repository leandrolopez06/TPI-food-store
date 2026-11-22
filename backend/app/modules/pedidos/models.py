from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import ahora_utc

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

# Estados del pedido
PENDIENTE = "PENDIENTE"
EN_PREPARACION = "EN_PREPARACION"
ENTREGADO = "ENTREGADO"
CANCELADO = "CANCELADO"


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default=PENDIENTE, max_length=20)
    forma_pago: str = Field(max_length=20)  # EFECTIVO o TRANSFERENCIA
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    total: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=ahora_utc)
    updated_at: datetime = Field(default_factory=ahora_utc)

    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Línea de un pedido. Guarda una copia del nombre y del precio del producto,
    así el pedido no cambia aunque después cambie el producto."""

    # SQLModel tipa __tablename__ como declared_attr, por eso el comentario para el verificador de tipos
    __tablename__ = "detalle_pedido"  # pyright: ignore[reportAssignmentType]

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int | None = Field(default=None, foreign_key="pedido.id", index=True, nullable=False)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")