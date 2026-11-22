from sqlalchemy import ColumnElement
from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando su fila hasta el final de la transacción.
        Evita que dos pedidos simultáneos vendan el mismo stock."""
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve (página, total sin paginar)."""
        filtros: list[ColumnElement[bool]] = [col(Producto.activo).is_(True)]
        if nombre:
            filtros.append(col(Producto.nombre).icontains(nombre, autoescape=True))
        if categoria_id is not None:
            filtros.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            filtros.append(col(Producto.disponible) == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        pagina = self.session.exec(
            select(Producto).where(*filtros).order_by(col(Producto.id)).offset(skip).limit(limit)
        ).all()
        return list(pagina), total