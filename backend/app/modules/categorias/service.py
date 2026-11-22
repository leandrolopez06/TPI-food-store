from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """La categoría no existe o está dada de baja (404)."""


class NombreDuplicado(Exception):
    """Ya hay una categoría con ese nombre (409)."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar_activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        nombre = datos.nombre.strip()
        with self.uow as uow:
            if uow.categorias.get_by_nombre(nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(nombre=nombre, descripcion=datos.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, categoria_id)
            cambios = datos.model_dump(exclude_unset=True)  # solo lo que vino en el cuerpo
            if cambios.get("nombre") is not None:
                nombre = cambios["nombre"].strip()
                otra = uow.categorias.get_by_nombre(nombre)
                if otra is not None and otra.id != categoria.id:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = nombre
            if "descripcion" in cambios:
                categoria.descripcion = cambios["descripcion"]
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = false. No libera el nombre ni toca los productos."""
        with self.uow as uow:
            self._buscar_activa(uow, categoria_id).activo = False

    @staticmethod
    def _buscar_activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe la categoría {categoria_id}")
        return categoria