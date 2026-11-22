from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    create_all_tables()  # crea las tablas si todavía no existen
    yield


app = FastAPI(
    title="Food Store API",
    version="1.0.0",
    description="API REST de Food Store: catálogo, pedidos con stock y panel de administración.",
    lifespan=lifespan,
)

# CORS con credenciales: el frontend envía la cookie HttpOnly con withCredentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todos los endpoints cuelgan de /api/v1
api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth_router)
api_v1.include_router(usuarios_router)
api_v1.include_router(categorias_router)
api_v1.include_router(productos_router)
api_v1.include_router(pedidos_router)
app.include_router(api_v1)


@app.get("/", include_in_schema=False)
def inicio() -> RedirectResponse:
    return RedirectResponse("/docs")