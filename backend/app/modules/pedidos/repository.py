from datetime import datetime

from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import ENTREGADO, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _paginar(self, usuario_id: int | None, estado: str | None, skip: int, limit: int) -> tuple[list[Pedido], int]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        pagina = self.session.exec(
            select(Pedido)
            .where(*filtros)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())  # los más nuevos primero
            .offset(skip)
            .limit(limit)
        ).all()
        return list(pagina), total

    def list_by_usuario(self, usuario_id: int, estado: str | None, skip: int, limit: int) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario (con el total sin paginar)."""
        return self._paginar(usuario_id, estado, skip, limit)

    def list_todos(self, estado: str | None, skip: int, limit: int) -> tuple[list[Pedido], int]:
        """Todos los pedidos (para el admin)."""
        return self._paginar(None, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return dict(filas)

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        return self.session.exec(consulta).one()

    def sum_total_entregados(self) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(Pedido.estado == ENTREGADO)
        return float(self.session.exec(consulta).one())