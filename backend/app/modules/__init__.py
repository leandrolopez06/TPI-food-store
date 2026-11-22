"""Se importan todos los modelos para que SQLAlchemy conozca todas las tablas y relaciones,
sin importar qué módulo se use primero."""

from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

__all__ = ["Categoria", "DetallePedido", "Pedido", "Producto", "Usuario"]