from sqlmodel import Session, col, func, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def list_activas(self) -> list[Categoria]:
        consulta = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        return list(self.session.exec(consulta).all())

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas. Incluye las categorías dadas de baja,
        porque la baja lógica no libera el nombre único."""
        consulta = select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        return self.session.exec(consulta).first()