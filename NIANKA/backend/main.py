import sys
from pathlib import Path

# Ensure root workspace is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import Base, engine

# Import all module ORM models to register them on Base.metadata for table creation
import backend.modules.authentification.models  # noqa
import backend.modules.notification.models      # noqa
import backend.modules.etapes.models            # noqa
import backend.modules.rapports.models           # noqa

from backend.modules.authentification.router import router as auth_router
from backend.modules.notification.router import router as notification_router
from backend.modules.etapes.router import router as etapes_router
from backend.modules.rapports.router import router as rapports_router

# Auto-create all tables in Supabase PostgreSQL database if missing
try:
    Base.metadata.create_all(bind=engine)
    print("[SUCCESS] Tables créées ou vérifiées sur Supabase PostgreSQL avec succès !")
except Exception as e:
    print(f"[WARN] Notice de création automatique des tables: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend Modulable Microservices-Ready de la plateforme NIANKA (Traçabilité & Qualité Anacarde)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for static serving
uploads_dir = Path(__file__).resolve().parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Root Endpoint: Redirige directement vers la documentation Swagger UI
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Register Module Routers (4 Core Modules: Authentification, Notification, Etapes, Rapports)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(notification_router, prefix=settings.API_V1_STR)
app.include_router(etapes_router, prefix=settings.API_V1_STR)
app.include_router(rapports_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health Check"])
def health_check():
    from backend.modules.etapes.ai_service import ai_classifier

    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "port": settings.PORT,
        "environment": "production",
        "ia": ai_classifier.status(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
