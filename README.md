# Food Store

Trabajo Práctico Integrador de **Programación IV**, Tecnicatura Universitaria en Programación a Distancia (UTN).
Autor: Leandro López.

Food Store es una tienda de comida con catálogo de productos, carrito, pedidos con control de stock y un panel de
administración. Está formada por una API REST (FastAPI + PostgreSQL) y una aplicación web (React + TypeScript).

- **Repositorio:** https://github.com/leandrolopez06/TPI-food-store.git
- **Video de presentación:** https://drive.google.com/file/d/16TuYmSBTyxQUL-jJ1ubd7b7vRbQt20SP/view?usp=sharing

---

## 1. Requisitos

| Herramienta | Versión | Para qué |
|---|---|---|
| Python | 3.11 o superior (probado hasta 3.14) | Backend |
| PostgreSQL | 14 o superior | Base de datos (ver la alternativa con SQLite más abajo) |
| Node.js | 20.19 o superior | Frontend |
| pnpm | 10 o superior | Gestor de paquetes del frontend (`npm install -g pnpm`) |

## 2. Estructura del proyecto

```
TPI_Food_Store/
├── backend/            API REST (FastAPI)
│   ├── app/
│   │   ├── core/       configuración, base de datos, seguridad, Repository base y Unit of Work
│   │   ├── modules/    auth, usuarios, categorias, productos, pedidos
│   │   │               (cada uno con models, schemas, repository, unit_of_work, service y router)
│   │   ├── db/seed.py  datos iniciales
│   │   └── main.py     aplicación FastAPI
│   ├── requirements.txt
│   └── .env.example
├── frontend/           Aplicación web (React + Vite)
│   ├── src/
│   │   ├── features/   auth, categorias, productos, pedidos, usuarios
│   │   ├── shared/     api, componentes, ui, layout y utilidades
│   │   ├── store/      estado global con Zustand
│   │   └── routes/     tabla de rutas y rutas protegidas
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 3. Backend

Todos los comandos se ejecutan dentro de la carpeta `backend`.

### 3.1 Crear la base de datos

Con PostgreSQL instalado, crear una base vacía (las tablas las crea la aplicación sola):

```
psql -U postgres -c "CREATE DATABASE foodstore_db;"
```

> **Alternativa sin instalar PostgreSQL:** en el paso 3.3 se puede usar SQLite poniendo
> `DATABASE_URL=sqlite:///./foodstore.db`. Todo lo demás funciona igual.

### 3.2 Entorno virtual e instalación de dependencias

Windows (PowerShell):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS / Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3.3 Variables de entorno

Copiar el archivo de ejemplo y completarlo:

```powershell
Copy-Item .env.example .env      # Windows
```
```bash
cp .env.example .env             # macOS / Linux
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | una cadena larga propia |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Minutos de vida del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen del frontend permitido por CORS | `http://localhost:5173` |

Hay que reemplazar `TU_PASSWORD` por la contraseña de PostgreSQL y cambiar `SECRET_KEY`.
El archivo `.env` real no se sube al repositorio.

### 3.4 Cargar los datos iniciales

```
python -m app.db.seed
```

Crea el usuario administrador, 4 categorías (Pizzas, Hamburguesas, Bebidas y Postres) y 11 productos con stock.
Se puede ejecutar más de una vez: no duplica datos.

### 3.5 Levantar el servidor

```
uvicorn app.main:app
```

(Para desarrollo se puede agregar `--reload`.) La API queda en http://localhost:8000 y la documentación
interactiva con todos los endpoints en **http://localhost:8000/docs**.

---

## 4. Frontend

Todos los comandos se ejecutan dentro de la carpeta `frontend`, con el backend ya corriendo.

```powershell
cd frontend
pnpm install
Copy-Item .env.example .env      # en macOS / Linux: cp .env.example .env
pnpm build
pnpm dev
```

La aplicación queda en **http://localhost:5173**.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API del backend | `http://localhost:8000/api/v1` |

Otros comandos: `pnpm lint` (oxlint) y `pnpm exec tsc -b` (chequeo de tipos, TypeScript en modo estricto).

---

## 5. Usuario de prueba

El seed crea un administrador:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

Los clientes se crean desde la pantalla **Crear cuenta** de la aplicación.

---

## 6. Qué hace la aplicación

**Cliente**
- Ver el catálogo con búsqueda por nombre, filtro por categoría y paginación.
- Armar el carrito (se conserva al recargar la página) y confirmar el pedido con forma de pago y dirección de entrega.
- Ver el historial de sus pedidos y cancelar los que siguen pendientes.

**Administrador** (panel en `/admin`)
- Resumen con la cantidad de pedidos por estado, los pedidos del día y los ingresos.
- Pedidos: filtrar por estado y cambiar el estado siguiendo el flujo permitido.
- Productos y categorías: alta, edición, baja y cambio rápido de stock y disponibilidad.
- Usuarios: activar y desactivar cuentas.

### Reglas de negocio

- Al crear un pedido se descuenta el stock de cada producto; si no alcanza, el pedido se rechaza completo.
- Cada línea del pedido guarda una copia del nombre y del precio del producto al momento de la compra.
- Estados del pedido: `PENDIENTE → EN_PREPARACION → ENTREGADO`, y `CANCELADO` desde `PENDIENTE` o `EN_PREPARACION`.
- Al cancelar un pedido se **restituye el stock** de todos sus productos.
- Un cliente solo puede cancelar sus propios pedidos y únicamente mientras están pendientes. El administrador puede cancelar cualquiera.
- Los productos y categorías se dan de baja de forma lógica (no se borran de la base).
- Una cuenta desactivada no puede iniciar sesión ni seguir usando una sesión abierta.

---

## 7. Endpoints principales

Todos cuelgan de `/api/v1`. El detalle completo, con los modelos de entrada y salida, está en `/docs`.

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | público |
| POST | `/auth/token` (login) | público |
| POST | `/auth/logout` | sesión iniciada |
| GET | `/auth/me` | sesión iniciada |
| GET | `/categorias`, `/categorias/{id}` | público |
| POST, PUT, DELETE | `/categorias`, `/categorias/{id}` | admin |
| GET | `/productos`, `/productos/{id}` | público |
| POST, PUT, DELETE | `/productos`, `/productos/{id}` | admin |
| PATCH | `/productos/{id}/stock` | admin |
| POST | `/pedidos` | sesión iniciada |
| GET | `/pedidos`, `/pedidos/{id}` | cliente: los propios; admin: todos |
| PATCH | `/pedidos/{id}/cancelar` | dueño del pedido (pendiente) o admin |
| PATCH | `/pedidos/{id}/estado` | admin |
| GET | `/pedidos/resumen` | admin |
| GET | `/admin/usuarios` | admin |
| POST | `/admin/usuarios/{id}/activar`, `/admin/usuarios/{id}/desactivar` | admin |

---

## 8. Decisiones de diseño

**Backend**
- Arquitectura en capas: `Router → Service → Unit of Work → Repository → Modelo`.
- El **Unit of Work** abre la sesión, confirma (`commit`) al salir sin errores y revierte (`rollback`) ante cualquier excepción.
  Ni los servicios ni los routers llaman a `commit()`.
- Los servicios lanzan excepciones de dominio (por ejemplo `StockInsuficiente`) y el router las traduce a códigos HTTP.
- Al crear o cancelar un pedido, los productos se leen con bloqueo de fila (`SELECT ... FOR UPDATE`) para evitar
  que dos compras simultáneas descuenten el mismo stock.
- Autenticación con JWT guardado en una **cookie HttpOnly**: el token nunca pasa por JavaScript.
  Contraseñas con hash bcrypt.

**Frontend**
- React 19 + TypeScript en modo estricto, sin `any`.
- Estado del servidor con TanStack Query; estado de la sesión, del carrito y de los avisos con Zustand
  (el carrito se guarda en `localStorage`; la sesión se confirma con `GET /auth/me` al abrir la página).
- Formularios con TanStack Form, tablas del panel con TanStack Table, estilos con Tailwind CSS.
- Rutas protegidas por sesión y por rol, con página de acceso no autorizado.
- Los filtros del catálogo viven en la URL (`?q=`, `?categoria=`, `?pagina=`), así que se pueden compartir y
  funcionan con el botón Atrás.

---

## 9. Problemas frecuentes

- **`password authentication failed` al iniciar el backend:** la contraseña de `DATABASE_URL` en `backend/.env` no coincide con la de PostgreSQL.
- **`database "foodstore_db" does not exist`:** falta el paso 3.1.
- **El frontend carga pero no muestra datos:** revisar que el backend esté corriendo en el puerto 8000 y que
  `FRONTEND_ORIGIN` (backend) y `VITE_API_URL` (frontend) coincidan con las direcciones reales.
- **PowerShell no permite activar el entorno virtual:** ejecutar `Set-ExecutionPolicy -Scope Process Bypass` y volver a activarlo.