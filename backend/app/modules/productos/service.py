from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """El producto no existe o está dado de baja (404)."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            productos, total = uow.productos.search(search, categoria_id, disponible, skip, limit)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in productos])

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar_activo(uow, producto_id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._verificar_categoria(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump())
            producto.nombre = producto.nombre.strip()
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)  # solo lo que vino en el cuerpo
            if cambios.get("categoria_id") is not None:
                self._verificar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                # Los campos obligatorios no aceptan null: si vienen en null se ignoran
                if valor is None and campo in ("nombre", "precio_base", "stock", "disponible", "categoria_id"):
                    continue
                setattr(producto, campo, valor)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, producto_id)
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = false."""
        with self.uow as uow:
            self._buscar_activo(uow, producto_id).activo = False

    @staticmethod
    def _buscar_activo(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"No existe el producto {producto_id}")
        return producto

    @staticmethod
    def _verificar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"No existe la categoría {categoria_id}")