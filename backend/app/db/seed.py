"""Datos iniciales. Se ejecuta con:  python -m app.db.seed

Es idempotente: se puede correr varias veces y no duplica nada.
"""

from app.core.database import create_all_tables
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import ROLE_ADMIN, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

CATEGORIAS = [
    ("Pizzas", "Pizzas al horno de piedra"),
    ("Hamburguesas", "Hamburguesas de carne y vegetarianas"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500.0, 30),
    ("Pizzas", "Napolitana", "Muzzarella, rodajas de tomate, ajo y albahaca", 9800.0, 25),
    ("Pizzas", "Fugazzeta", "Muzzarella y abundante cebolla", 9200.0, 20),
    ("Hamburguesas", "Clásica", "Carne, lechuga, tomate y queso", 7600.0, 40),
    ("Hamburguesas", "Doble cheddar", "Doble carne con cheddar y panceta", 9400.0, 35),
    ("Hamburguesas", "Vegana", "Medallón de lentejas, palta y rúcula", 8200.0, 20),
    ("Bebidas", "Gaseosa 1,5 L", "Cola, lima-limón o naranja", 2800.0, 60),
    ("Bebidas", "Agua mineral 500 ml", "Con o sin gas", 1800.0, 80),
    ("Bebidas", "Cerveza artesanal", "Rubia, 473 ml", 3500.0, 45),
    ("Postres", "Flan con dulce de leche", "Con crema", 3200.0, 25),
    ("Postres", "Tiramisú", "Receta clásica italiana", 3900.0, 18),
]


def crear_admin() -> bool:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.get_by_username(ADMIN_USERNAME) is not None:
            return False
        uow.usuarios.add(
            Usuario(
                username=ADMIN_USERNAME,
                full_name="Administrador",
                email="admin@foodstore.com",
                hashed_password=hash_password(ADMIN_PASSWORD),
                role=ROLE_ADMIN,
            )
        )
        return True


def crear_catalogo() -> tuple[int, int]:
    categorias_nuevas = 0
    productos_nuevos = 0
    with ProductoUnitOfWork() as uow:
        ids_por_nombre: dict[str, int] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = uow.categorias.get_by_nombre(nombre)
            if categoria is None:
                categoria = uow.categorias.add(Categoria(nombre=nombre, descripcion=descripcion))
                categorias_nuevas += 1
            assert categoria.id is not None
            ids_por_nombre[nombre] = categoria.id

        existentes = {p.nombre.lower() for p in uow.productos.get_all(limit=10_000)}
        for categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            if nombre.lower() in existentes:
                continue
            uow.productos.add(
                Producto(
                    categoria_id=ids_por_nombre[categoria],
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                )
            )
            productos_nuevos += 1
    return categorias_nuevas, productos_nuevos


def main() -> None:
    create_all_tables()
    admin_creado = crear_admin()
    categorias, productos = crear_catalogo()
    print(f"Admin: {'creado' if admin_creado else 'ya existía'} ({ADMIN_USERNAME} / {ADMIN_PASSWORD})")
    print(f"Categorías nuevas: {categorias} | Productos nuevos: {productos}")
    print("Listo: datos iniciales cargados.")


if __name__ == "__main__":
    main()